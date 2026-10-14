import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, execute, db } from '../db.js';
import { Order, OrderItem, Recipe, InventoryItem } from '../types.js';

export const ordersRouter = Router();

// Helper to attach items and modifiers to orders
function attachItemsToOrders(orders: any[]): Order[] {
  if (!orders || orders.length === 0) return [];
  const orderIds = orders.map(o => `'${o.id}'`).join(',');
  
  const items = queryAll<OrderItem>(`
    SELECT oi.*
    FROM order_items oi
    WHERE oi.order_id IN (${orderIds})
  `);

  const itemIds = items.map(i => `'${i.id}'`).join(',');
  const modifiers = itemIds ? queryAll(`
    SELECT * FROM order_item_modifiers WHERE order_item_id IN (${itemIds})
  `) : [];

  const modifiersByItemId: Record<string, any[]> = {};
  modifiers.forEach(m => {
    if (!modifiersByItemId[m.order_item_id]) modifiersByItemId[m.order_item_id] = [];
    modifiersByItemId[m.order_item_id].push(m);
  });

  const itemsByOrderId: Record<string, OrderItem[]> = {};
  items.forEach(it => {
    it.modifiers = modifiersByItemId[it.id] || [];
    if (!itemsByOrderId[it.order_id]) itemsByOrderId[it.order_id] = [];
    itemsByOrderId[it.order_id].push(it);
  });

  return orders.map(o => ({
    ...o,
    items: itemsByOrderId[o.id] || []
  }));
}

// Auto-deduct inventory using Recipe Bill of Materials (BOM)
function deductInventoryForOrder(orderId: string, items: Array<{ menu_item_id: string; quantity: number }>) {
  for (const item of items) {
    const recipes = queryAll<Recipe>(`
      SELECT * FROM recipes WHERE menu_item_id = ?
    `, [item.menu_item_id]);

    for (const rec of recipes) {
      const deductionAmount = rec.quantity_required * item.quantity;
      execute(`
        UPDATE inventory_items
        SET current_stock = MAX(0, current_stock - ?)
        WHERE id = ?
      `, [deductionAmount, rec.inventory_item_id]);

      execute(`
        INSERT INTO stock_transactions (id, inventory_item_id, type, quantity, order_id, notes)
        VALUES (?, ?, 'deduction_order', ?, ?, ?)
      `, [
        uuidv4(),
        rec.inventory_item_id,
        -deductionAmount,
        orderId,
        `Auto-deducted for Order ${orderId.slice(0, 8)}`
      ]);
    }
  }
}

// Get Orders (with filters)
ordersRouter.get('/', (req: Request, res: Response) => {
  const { status, channel, brand_id, search, limit = '100' } = req.query;

  let sql = `
    SELECT o.*, b.name as brand_name, b.logo_url as brand_logo
    FROM orders o
    JOIN brands b ON o.brand_id = b.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status === 'active') {
    sql += ` AND o.status IN ('pending', 'accepted', 'preparing', 'ready', 'dispatched')`;
  } else if (status && status !== 'all') {
    sql += ` AND o.status = ?`;
    params.push(status);
  }

  if (channel && channel !== 'all') {
    sql += ` AND o.channel = ?`;
    params.push(channel);
  }

  if (brand_id && brand_id !== 'all') {
    sql += ` AND o.brand_id = ?`;
    params.push(brand_id);
  }

  if (search) {
    sql += ` AND (o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  sql += ` ORDER BY o.created_at DESC LIMIT ?`;
  params.push(Number(limit));

  const rawOrders = queryAll(sql, params);
  const populatedOrders = attachItemsToOrders(rawOrders);

  res.json({ orders: populatedOrders });
});

// Get Single Order
ordersRouter.get('/:id', (req: Request, res: Response): void => {
  const rawOrder = queryOne(`
    SELECT o.*, b.name as brand_name, b.logo_url as brand_logo
    FROM orders o
    JOIN brands b ON o.brand_id = b.id
    WHERE o.id = ?
  `, [req.params.id]);

  if (!rawOrder) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const populated = attachItemsToOrders([rawOrder])[0];
  res.json({ order: populated });
});

// Create New Order (POS or direct)
ordersRouter.post('/', (req: Request, res: Response): void => {
  const {
    brand_id, outlet_id, customer_name, customer_phone, delivery_address,
    channel, payment_method, items, special_instructions, discount_amount = 0
  } = req.body;

  if (!brand_id || !customer_name || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Missing required order fields or items' });
    return;
  }

  const outlet = outlet_id || queryOne<{ id: string; tax_rate: number; packaging_fee: number }>(`SELECT id, tax_rate, packaging_fee FROM outlets LIMIT 1`);
  const outletId = outlet?.id || 'default_outlet';
  const taxRate = outlet?.tax_rate ?? 5.0;
  const packagingFee = (channel === 'direct_pos' && !delivery_address) ? 0 : (outlet?.packaging_fee ?? 20.0);

  // Compute subtotal
  let subtotal = 0;
  const preparedItems: any[] = [];

  for (const item of items) {
    const menuItem = queryOne<{ id: string; name: string; base_price: number; station: string }>(`
      SELECT id, name, base_price, station FROM menu_items WHERE id = ?
    `, [item.menu_item_id]);

    const unitPrice = item.price !== undefined ? item.price : (menuItem?.base_price ?? 0);
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

    preparedItems.push({
      menu_item_id: item.menu_item_id,
      item_name: menuItem?.name || item.item_name || 'Custom Item',
      price: unitPrice,
      quantity: item.quantity,
      total_price: itemTotal,
      station: menuItem?.station || 'Prep',
      modifiers: item.modifiers || []
    });
  }

  const taxAmount = Math.round(((subtotal - discount_amount) * (taxRate / 100)) * 100) / 100;
  const deliveryFee = (channel === 'swiggy' || channel === 'zomato' || channel === 'takeaway') ? 0 : 35.0;
  const totalAmount = Math.max(0, subtotal - discount_amount + taxAmount + packagingFee + deliveryFee);

  // Generate order number
  const orderCount = (queryOne<{ count: number }>(`SELECT COUNT(*) as count FROM orders`)?.count || 0) + 1;
  const orderPrefix = channel === 'swiggy' ? 'SWIG' : channel === 'zomato' ? 'ZOM' : channel === 'takeaway' ? 'TAK' : 'POS';
  const orderNumber = `PK-${orderPrefix}-${1000 + orderCount}`;

  const orderId = uuidv4();
  const initialStatus = (channel === 'direct_pos' || channel === 'takeaway') ? 'accepted' : 'pending';

  execute(`
    INSERT INTO orders (
      id, order_number, brand_id, outlet_id, customer_name, customer_phone, delivery_address,
      channel, channel_order_id, status, payment_method, payment_status, subtotal, tax_amount,
      packaging_fee, delivery_fee, discount_amount, total_amount, special_instructions,
      prep_time_minutes, created_at, accepted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ${initialStatus === 'accepted' ? "datetime('now')" : 'NULL'})
  `, [
    orderId, orderNumber, brand_id, outletId, customer_name, customer_phone || 'Walk-in Guest',
    delivery_address || 'Dine-in / Direct Takeaway', channel || 'direct_pos',
    req.body.channel_order_id || null, initialStatus, payment_method || 'cash',
    'paid', subtotal, taxAmount, packagingFee, deliveryFee, discount_amount, totalAmount,
    special_instructions || '', 15
  ]);

  // Insert order items & modifiers
  for (const item of preparedItems) {
    const orderItemId = uuidv4();
    execute(`
      INSERT INTO order_items (id, order_id, menu_item_id, item_name, price, quantity, total_price, station, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [orderItemId, orderId, item.menu_item_id, item.item_name, item.price, item.quantity, item.total_price, item.station]);

    if (item.modifiers && Array.isArray(item.modifiers)) {
      for (const mod of item.modifiers) {
        execute(`
          INSERT INTO order_item_modifiers (id, order_item_id, modifier_name, price)
          VALUES (?, ?, ?, ?)
        `, [uuidv4(), orderItemId, mod.name || mod.modifier_name, mod.price || 0]);
      }
    }
  }

  // Auto-deduct inventory
  deductInventoryForOrder(orderId, preparedItems);

  // Fetch created order with items
  const createdRaw = queryOne(`
    SELECT o.*, b.name as brand_name, b.logo_url as brand_logo
    FROM orders o
    JOIN brands b ON o.brand_id = b.id
    WHERE o.id = ?
  `, [orderId]);
  const finalOrder = attachItemsToOrders([createdRaw])[0];

  // Emit WebSocket event for real-time KDS, Live Orders, and POS
  if ((req as any).io) {
    (req as any).io.emit('order:new', { order: finalOrder, sound: true });
  }

  res.status(201).json({ order: finalOrder });
});

// Update Order Status (Pending -> Accepted -> Preparing -> Ready -> Dispatched -> Delivered)
ordersRouter.patch('/:id/status', (req: Request, res: Response): void => {
  const { status } = req.body;
  const order = queryOne<Order>(`SELECT * FROM orders WHERE id = ?`, [req.params.id]);

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  let timestampCol = '';
  if (status === 'accepted') timestampCol = ', accepted_at = datetime("now")';
  else if (status === 'ready') timestampCol = ', prepared_at = datetime("now")';
  else if (status === 'dispatched') timestampCol = ', dispatched_at = datetime("now")';
  else if (status === 'delivered') timestampCol = ', delivered_at = datetime("now")';

  execute(`
    UPDATE orders
    SET status = ? ${timestampCol}
    WHERE id = ?
  `, [status, req.params.id]);

  // If status is ready, mark all order items as ready
  if (status === 'ready') {
    execute(`UPDATE order_items SET status = 'ready' WHERE order_id = ?`, [req.params.id]);
  } else if (status === 'preparing') {
    execute(`UPDATE order_items SET status = 'cooking' WHERE order_id = ?`, [req.params.id]);
  }

  const updatedRaw = queryOne(`
    SELECT o.*, b.name as brand_name, b.logo_url as brand_logo
    FROM orders o
    JOIN brands b ON o.brand_id = b.id
    WHERE o.id = ?
  `, [req.params.id]);
  const updatedOrder = attachItemsToOrders([updatedRaw])[0];

  if ((req as any).io) {
    (req as any).io.emit('order:updated', { order: updatedOrder });
  }

  res.json({ order: updatedOrder });
});

// Assign Delivery Rider
ordersRouter.patch('/:id/assign-rider', (req: Request, res: Response): void => {
  const { rider_id } = req.body;
  const rider = queryOne<{ id: string; name: string; phone: string }>(`SELECT id, name, phone FROM delivery_riders WHERE id = ?`, [rider_id]);

  if (!rider) {
    res.status(404).json({ error: 'Rider not found' });
    return;
  }

  execute(`
    UPDATE orders
    SET rider_id = ?, rider_name = ?, rider_phone = ?, status = 'dispatched', dispatched_at = datetime('now')
    WHERE id = ?
  `, [rider.id, rider.name, rider.phone, req.params.id]);

  execute(`
    UPDATE delivery_riders
    SET status = 'delivering', current_orders_count = current_orders_count + 1
    WHERE id = ?
  `, [rider.id]);

  const updatedRaw = queryOne(`SELECT * FROM orders WHERE id = ?`, [req.params.id]);
  const updatedOrder = attachItemsToOrders([updatedRaw])[0];

  if ((req as any).io) {
    (req as any).io.emit('order:updated', { order: updatedOrder });
  }

  res.json({ order: updatedOrder });
});

// Simulator Endpoint: Generates a realistic incoming order from Swiggy/Zomato/UberEats
ordersRouter.post('/simulate', (req: Request, res: Response): void => {
  const channels = ['swiggy', 'zomato', 'ubereats'];
  const channel = channels[Math.floor(Math.random() * channels.length)];

  // Pick a random brand
  const brands = queryAll<{ id: string; name: string }>(`SELECT id, name FROM brands WHERE is_active = 1`);
  if (brands.length === 0) {
    res.status(400).json({ error: 'No active brands available' });
    return;
  }
  const brand = brands[Math.floor(Math.random() * brands.length)];

  // Pick 1-2 random items from this brand
  const items = queryAll<{ id: string; name: string; base_price: number; station: string }>(`
    SELECT id, name, base_price, station FROM menu_items WHERE brand_id = ? AND is_available = 1
  `, [brand.id]);

  if (items.length === 0) {
    res.status(400).json({ error: 'No items in selected brand' });
    return;
  }

  const selectedItems = items.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);

  const customerNames = ['Aarav Patel', 'Diya Sen', 'Vikram Malhotra', 'Ananya Deshmukh', 'Arjun Kapoor', 'Ishaan Verma'];
  const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
  const customerPhone = `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`;

  const addresses = [
    'Flat 302, Palm Springs Residency, Bellandur, Bengaluru',
    '#55, 4th Cross, Koramangala 4th Block, Bengaluru',
    'Tech Park Villa 12, Outer Ring Road, Mahadevapura',
    'Tower C-801, Windmills of Your Mind, Whitefield'
  ];
  const deliveryAddress = addresses[Math.floor(Math.random() * addresses.length)];

  const orderCount = (queryOne<{ count: number }>(`SELECT COUNT(*) as count FROM orders`)?.count || 0) + 1;
  const channelOrderId = `${channel.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderNumber = `PK-${channel.toUpperCase().slice(0, 4)}-${1000 + orderCount}`;

  let subtotal = 0;
  const orderItems = selectedItems.map(it => {
    const qty = Math.floor(Math.random() * 2) + 1;
    const price = it.base_price;
    subtotal += price * qty;
    return {
      menu_item_id: it.id,
      item_name: it.name,
      price,
      quantity: qty,
      total_price: price * qty,
      station: it.station
    };
  });

  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const packaging = 25;
  const total = subtotal + tax + packaging;
  const orderId = uuidv4();

  const outlet = queryOne<{ id: string }>(`SELECT id FROM outlets LIMIT 1`);

  execute(`
    INSERT INTO orders (
      id, order_number, brand_id, outlet_id, customer_name, customer_phone, delivery_address,
      channel, channel_order_id, status, payment_method, payment_status, subtotal, tax_amount,
      packaging_fee, delivery_fee, total_amount, special_instructions, prep_time_minutes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'aggregator_prepaid', 'paid', ?, ?, ?, 0, ?, ?, 15, datetime('now'))
  `, [
    orderId, orderNumber, brand.id, outlet?.id || 'outlet1',
    customerName, customerPhone, deliveryAddress, channel, channelOrderId,
    subtotal, tax, packaging, total, 'Please do not ring bell, leave at security'
  ]);

  for (const it of orderItems) {
    execute(`
      INSERT INTO order_items (id, order_id, menu_item_id, item_name, price, quantity, total_price, station, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [uuidv4(), orderId, it.menu_item_id, it.item_name, it.price, it.quantity, it.total_price, it.station]);
  }

  // Deduct inventory
  deductInventoryForOrder(orderId, orderItems);

  const rawOrder = queryOne(`
    SELECT o.*, b.name as brand_name, b.logo_url as brand_logo
    FROM orders o
    JOIN brands b ON o.brand_id = b.id
    WHERE o.id = ?
  `, [orderId]);
  const finalOrder = attachItemsToOrders([rawOrder])[0];

  if ((req as any).io) {
    (req as any).io.emit('order:new', { order: finalOrder, sound: true });
  }

  res.status(201).json({ message: 'Order simulated successfully', order: finalOrder });
});

