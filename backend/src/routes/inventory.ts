import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, execute } from '../db.js';
import { InventoryItem, StockTransaction } from '../types.js';

export const inventoryRouter = Router();

// Get all inventory items with low-stock status
inventoryRouter.get('/', (req: Request, res: Response) => {
  const { category, low_stock_only } = req.query;

  let sql = `SELECT * FROM inventory_items WHERE 1=1`;
  const params: any[] = [];

  if (category && category !== 'all') {
    sql += ` AND category = ?`;
    params.push(category);
  }

  if (low_stock_only === 'true') {
    sql += ` AND current_stock <= min_threshold`;
  }

  sql += ` ORDER BY (current_stock <= min_threshold) DESC, name ASC`;
  const items = queryAll<InventoryItem>(sql, params);

  const formatted = items.map(item => ({
    ...item,
    is_low_stock: item.current_stock <= item.min_threshold
  }));

  res.json({ items: formatted });
});

// Create inventory item
inventoryRouter.post('/', (req: Request, res: Response): void => {
  const { name, sku, category, unit, current_stock, min_threshold, cost_per_unit } = req.body;

  if (!name || !unit || cost_per_unit === undefined) {
    res.status(400).json({ error: 'Name, Unit, and Cost Per Unit are required' });
    return;
  }

  const id = uuidv4();
  const generatedSku = sku || `INV-${name.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`;

  execute(`
    INSERT INTO inventory_items (id, name, sku, category, unit, current_stock, min_threshold, cost_per_unit, last_restocked_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `, [
    id, name, generatedSku, category || 'General', unit,
    current_stock || 0, min_threshold || 5, cost_per_unit
  ]);

  const created = queryOne<InventoryItem>(`SELECT * FROM inventory_items WHERE id = ?`, [id]);
  res.status(201).json({ item: created });
});

// Update inventory item details
inventoryRouter.put('/:id', (req: Request, res: Response): void => {
  const { name, category, unit, min_threshold, cost_per_unit } = req.body;

  execute(`
    UPDATE inventory_items
    SET name = COALESCE(?, name),
        category = COALESCE(?, category),
        unit = COALESCE(?, unit),
        min_threshold = COALESCE(?, min_threshold),
        cost_per_unit = COALESCE(?, cost_per_unit)
    WHERE id = ?
  `, [name, category, unit, min_threshold, cost_per_unit, req.params.id]);

  const updated = queryOne<InventoryItem>(`SELECT * FROM inventory_items WHERE id = ?`, [req.params.id]);
  res.json({ item: updated });
});

// Stock intake or Wastage adjustment
inventoryRouter.post('/adjust', (req: Request, res: Response): void => {
  const { inventory_item_id, type, quantity, notes } = req.body;

  if (!inventory_item_id || !type || quantity === undefined) {
    res.status(400).json({ error: 'Item ID, type, and quantity are required' });
    return;
  }

  const item = queryOne<InventoryItem>(`SELECT * FROM inventory_items WHERE id = ?`, [inventory_item_id]);
  if (!item) {
    res.status(404).json({ error: 'Inventory item not found' });
    return;
  }

  const qty = Number(quantity);
  const cost = Math.abs(qty) * item.cost_per_unit;

  if (type === 'restock') {
    execute(`
      UPDATE inventory_items
      SET current_stock = current_stock + ?, last_restocked_at = datetime('now')
      WHERE id = ?
    `, [qty, inventory_item_id]);
  } else if (type === 'wastage' || type === 'manual_adjustment') {
    execute(`
      UPDATE inventory_items
      SET current_stock = MAX(0, current_stock - ?)
      WHERE id = ?
    `, [Math.abs(qty), inventory_item_id]);
  }

  execute(`
    INSERT INTO stock_transactions (id, inventory_item_id, type, quantity, cost, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [uuidv4(), inventory_item_id, type, qty, cost, notes || '']);

  const updatedItem = queryOne<InventoryItem>(`SELECT * FROM inventory_items WHERE id = ?`, [inventory_item_id]);
  res.json({ success: true, item: updatedItem });
});

// Get stock transaction history
inventoryRouter.get('/transactions', (_req: Request, res: Response) => {
  const transactions = queryAll<StockTransaction>(`
    SELECT st.*, ii.name as item_name, ii.unit
    FROM stock_transactions st
    JOIN inventory_items ii ON st.inventory_item_id = ii.id
    ORDER BY st.created_at DESC
    LIMIT 100
  `);
  res.json({ transactions });
});

