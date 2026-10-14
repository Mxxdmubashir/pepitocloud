import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, initDatabase, execute, queryOne } from './db.js';

export function runSeed() {
  console.log('⚡ Initializing database schema...');
  initDatabase();

  // Clear existing records to ensure fresh seed
  db.exec(`
    DELETE FROM stock_transactions;
    DELETE FROM order_item_modifiers;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM recipes;
    DELETE FROM inventory_items;
    DELETE FROM delivery_riders;
    DELETE FROM customers;
    DELETE FROM item_modifiers;
    DELETE FROM modifier_groups;
    DELETE FROM menu_items;
    DELETE FROM categories;
    DELETE FROM brands;
    DELETE FROM outlets;
    DELETE FROM users;
  `);

  console.log('🌱 Seeding Staff Users...');
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('admin123', salt);
  const chefHash = bcrypt.hashSync('chef123', salt);
  const cashierHash = bcrypt.hashSync('cashier123', salt);
  const riderHash = bcrypt.hashSync('rider123', salt);

  const adminId = uuidv4();
  const chefId = uuidv4();
  const cashierId = uuidv4();
  const riderUserId = uuidv4();

  execute(`INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`, [
    adminId, 'Marcus Vance', 'admin@pepito.kitchen', passwordHash, 'admin'
  ]);
  execute(`INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`, [
    chefId, 'Chef Antonio Rossi', 'chef@pepito.kitchen', chefHash, 'kitchen'
  ]);
  execute(`INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`, [
    cashierId, 'Priya Sharma', 'cashier@pepito.kitchen', cashierHash, 'cashier'
  ]);
  execute(`INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`, [
    riderUserId, 'Rahul Kumar', 'rider@pepito.kitchen', riderHash, 'rider'
  ]);

  console.log('🌱 Seeding Outlet Hub...');
  const outletId = uuidv4();
  execute(`
    INSERT INTO outlets (id, name, code, address, phone, tax_rate, packaging_fee, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    outletId,
    'Pepito Central Cloud Kitchen - Hub 01',
    'CK-BLR-01',
    '#442, 100ft Road, Indiranagar, Bengaluru, KA 560038',
    '+91 80 4455 6677',
    5.0,
    25.0,
    1
  ]);

  console.log('🌱 Seeding Virtual Brands...');
  const brand1Id = uuidv4();
  const brand2Id = uuidv4();
  const brand3Id = uuidv4();
  const brand4Id = uuidv4();

  execute(`
    INSERT INTO brands (id, outlet_id, name, slug, tagline, cuisine, logo_url, banner_color, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    brand1Id, outletId,
    "Pepito's Artisan Pizza & Pastas",
    'pepito-pizza',
    'Slow-fermented sourdough pizzas and handmade Italian pastas',
    'Italian & Woodfired',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop',
    '#E11D48',
    4.9
  ]);

  execute(`
    INSERT INTO brands (id, outlet_id, name, slug, tagline, cuisine, logo_url, banner_color, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    brand2Id, outletId,
    'Burger Beast Smokehouse',
    'burger-beast',
    'Smashed Angus burgers, crispy Nashville chicken, and loaded tallow fries',
    'American Smokehouse',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
    '#EA580C',
    4.8
  ]);

  execute(`
    INSERT INTO brands (id, outlet_id, name, slug, tagline, cuisine, logo_url, banner_color, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    brand3Id, outletId,
    'Wok & Roll Asian Bowls',
    'wok-and-roll',
    'Smoky wok-tossed noodles, ramen broths, and firecracker dim sums',
    'Pan-Asian & Bowls',
    'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=200&h=200&fit=crop',
    '#059669',
    4.7
  ]);

  execute(`
    INSERT INTO brands (id, outlet_id, name, slug, tagline, cuisine, logo_url, banner_color, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    brand4Id, outletId,
    'Sweet Escape Bakery & Shakes',
    'sweet-escape',
    'Artisanal NYC style cookies, molten lava cakes, and thick velvet shakes',
    'Desserts & Beverages',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop',
    '#9333EA',
    4.9
  ]);

  console.log('🌱 Seeding Categories & Menu Items...');
  // Brand 1: Pepito's Pizza Categories & Items
  const catP1 = uuidv4();
  const catP2 = uuidv4();
  const catP3 = uuidv4();
  execute(`INSERT INTO categories (id, brand_id, name, display_order) VALUES (?, ?, ?, ?)`, [catP1, brand1Id, 'Signature Sourdough Pizzas (11")', 1]);
  execute(`INSERT INTO categories (id, brand_id, name, display_order) VALUES (?, ?, ?, ?)`, [catP2, brand1Id, 'Handmade Pastas', 2]);
  execute(`INSERT INTO categories (id, brand_id, name, display_order) VALUES (?, ?, ?, ?)`, [catP3, brand1Id, 'Garlic Breads & Sides', 3]);

  const pItem1 = uuidv4();
  const pItem2 = uuidv4();
  const pItem3 = uuidv4();
  const pItem4 = uuidv4();
  const pItem5 = uuidv4();

  execute(`
    INSERT INTO menu_items (id, brand_id, category_id, name, description, base_price, image_url, is_veg, is_available, station, prep_time_minutes, swiggy_price, zomato_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    pItem1, brand1Id, catP1,
    'Truffle Wild Mushroom Pizza',
    'San Marzano sauce, fresh fior di latte mozzarella, roasted porcini mushrooms, white truffle oil drizzle, fresh basil',
    480,
    'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&fit=crop',
    1, 1, 'Oven', 14, 520, 520
  ]);

  execute(`
    INSERT INTO menu_items (id, brand_id, category_id, name, description, base_price, image_url, is_veg, is_available, station, prep_time_minutes, swiggy_price, zomato_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    pItem2, brand1Id, catP1,
    'Spicy Pepperoni & Hot Honey Pizza',
    'Imported pork pepperoni, house chilli crisp, crushed hot honey, fresh buffalo mozzarella',
    560,
    'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&fit=crop',
    0, 1, 'Oven', 15, 610, 610
  ]);

  execute(`
    INSERT INTO menu_items (id, brand_id, category_id, name, description, base_price, image_url, is_veg, is_available, station, prep_time_minutes, swiggy_price, zomato_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    pItem3, brand1Id, catP2,
    'Creamy Truffle Fettuccine Alfredo',
    'Silky parmesan butter sauce, garlic confit, roasted forest mushrooms, chives',
    390,
    'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&fit=crop',
    1, 1, 'Prep', 12, 420, 420
  ]);

  execute(`
    INSERT INTO menu_items (id, brand_id, category_id, name, description, base_price, image_url, is_veg, is_available, station, prep_time_minutes, swiggy_price, zomato_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    pItem4, brand1Id, catP2,
    'Slow-Braised Chicken Rigatoni Bolognese',
    '8-hour braised chicken ragu, San Marzano tomatoes, rosemary, pecorino cheese',
    440,
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&fit=crop',
    0, 1, 'Prep', 12, 470, 470
  ]);

  execute(`
    INSERT INTO menu_items (id, brand_id, category_id, name, description, base_price, image_url, is_veg, is_available, station, prep_time_minutes, swiggy_price, zomato_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    pItem5, brand1Id, catP3,
    'Cheesy Garlic Sourdough Pull-Apart',
    'Herb garlic butter, molten mozzarella, toasted sesame, spicy marinara dip',
    220,
    'https://images.unsplash.com/photo-1619895092538-128341789043?w=500&fit=crop',
    1, 1, 'Oven', 8, 240, 240
  ]);

  // Brand 2: Burger Beast Categories & Items
  const catB1 = uuidv4();
  const catB2 = uuidv4();
  execute(`INSERT INTO categories (id, brand_id, name, display_order) VALUES (?, ?, ?, ?)`, [catB1, brand2Id, 'Smashed Gourmet Burgers', 1]);
  execute(`INSERT INTO categories (id, brand_id, name, display_order) VALUES (?, ?, ?, ?)`, [catB2, brand2Id, 'Loaded Crispy Sides', 2]);

  const bItem1 = uuidv4();
  const bItem2 = uuidv4();
  const bItem3 = uuidv4();

  execute(`
    INSERT INTO menu_items (id, brand_id, category_id, name, description, base_price, image_url, is_veg, is_available, station, prep_time_minutes, swiggy_price, zomato_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    bItem1, brand2Id, catB1,
    'Double Beast Smashed Cheeseburger',
    'Two grilled seasoned beef patties, double aged cheddar, caramelized shallots, secret beast sauce, brioche bun',
    380,
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&fit=crop',
    0, 1, 'Grill', 10, 420, 420
  ]);

  execute(`
    INSERT INTO menu_items (id, brand_id, category_id, name, description, base_price, image_url, is_veg, is_available, station, prep_time_minutes, swiggy_price, zomato_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    bItem2, brand2Id, catB1,
    'Nashville Hot Crispy Chicken Burger',
    'Buttermilk fried chicken thigh dunked in Nashville cayenne oil, house slaw, dill pickles, garlic ranch',
    350,
    'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&fit=crop',
    0, 1, 'Fryer', 11, 380, 380
  ]);

  execute(`
    INSERT INTO menu_items (id, brand_id, category_id, name, description, base_price, image_url, is_veg, is_available, station, prep_time_minutes, swiggy_price, zomato_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    bItem3, brand2Id, catB2,
    'Truffle & Parmesan Loaded Crinkle Fries',
    'Crispy golden potato crinkles, white truffle oil, freshly grated grana padano, chive sour cream',
    210,
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&fit=crop',
    1, 1, 'Fryer', 6, 230, 230
  ]);

  // Brand 3: Wok & Roll Categories & Items
  const catW1 = uuidv4();
  const catW2 = uuidv4();
  execute(`INSERT INTO categories (id, brand_id, name, display_order) VALUES (?, ?, ?, ?)`, [catW1, brand3Id, 'Asian Rice & Noodle Bowls', 1]);
  execute(`INSERT INTO categories (id, brand_id, name, display_order) VALUES (?, ?, ?, ?)`, [catW2, brand3Id, 'Dim Sums & Baos', 2]);

  const wItem1 = uuidv4();
  const wItem2 = uuidv4();

  execute(`
    INSERT INTO menu_items (id, brand_id, category_id, name, description, base_price, image_url, is_veg, is_available, station, prep_time_minutes, swiggy_price, zomato_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    wItem1, brand3Id, catW1,
    'Fiery Schezwan Chicken Hakka Noodles',
    'Wok-charred wheat noodles, crispy chicken shreds, bell peppers, scallions, fiery roasted chilli garlic paste',
    320,
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&fit=crop',
    0, 1, 'Wok', 9, 350, 350
  ]);

  execute(`
    INSERT INTO menu_items (id, brand_id, category_id, name, description, base_price, image_url, is_veg, is_available, station, prep_time_minutes, swiggy_price, zomato_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    wItem2, brand3Id, catW2,
    'Steamed Truffle Edamame Dim Sum (6 pcs)',
    'Translucent potato starch dumplings, minced edamame, water chestnuts, black truffle oil, sweet soy dip',
    290,
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500&fit=crop',
    1, 1, 'Assembly', 8, 310, 310
  ]);

  // Brand 4: Sweet Escape Categories & Items
  const catS1 = uuidv4();
  execute(`INSERT INTO categories (id, brand_id, name, display_order) VALUES (?, ?, ?, ?)`, [catS1, brand4Id, 'Decadent Desserts & Shakes', 1]);

  const sItem1 = uuidv4();
  const sItem2 = uuidv4();

  execute(`
    INSERT INTO menu_items (id, brand_id, category_id, name, description, base_price, image_url, is_veg, is_available, station, prep_time_minutes, swiggy_price, zomato_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    sItem1, brand4Id, catS1,
    'Belgian Chocolate Molten Lava Cake',
    'Warm Callebaut 70% dark chocolate cake with a molten core, served with Madagascar vanilla gelato',
    240,
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&fit=crop',
    1, 1, 'Oven', 7, 260, 260
  ]);

  execute(`
    INSERT INTO menu_items (id, brand_id, category_id, name, description, base_price, image_url, is_veg, is_available, station, prep_time_minutes, swiggy_price, zomato_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    sItem2, brand4Id, catS1,
    'Thick Lotus Biscoff Shake',
    'Rich vanilla soft serve blended with caramelized speculoos butter, crushed cookies, whipped cream',
    210,
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&fit=crop',
    1, 1, 'Beverage', 5, 230, 230
  ]);

  console.log('🌱 Seeding Modifiers...');
  const grpCrust = uuidv4();
  execute(`INSERT INTO modifier_groups (id, name, min_selection, max_selection, is_required) VALUES (?, ?, ?, ?, ?)`, [
    grpCrust, 'Choose Crust Style', 1, 1, 1
  ]);
  execute(`INSERT INTO item_modifiers (id, group_id, menu_item_id, name, price) VALUES (?, ?, ?, ?, ?)`, [
    uuidv4(), grpCrust, pItem1, 'Neapolitan Thin Crust', 0
  ]);
  execute(`INSERT INTO item_modifiers (id, group_id, menu_item_id, name, price) VALUES (?, ?, ?, ?, ?)`, [
    uuidv4(), grpCrust, pItem1, 'Cheese Burst Sourdough', 90
  ]);

  const grpExtras = uuidv4();
  execute(`INSERT INTO modifier_groups (id, name, min_selection, max_selection, is_required) VALUES (?, ?, ?, ?, ?)`, [
    grpExtras, 'Add Extra Toppings', 0, 3, 0
  ]);
  execute(`INSERT INTO item_modifiers (id, group_id, menu_item_id, name, price) VALUES (?, ?, ?, ?, ?)`, [
    uuidv4(), grpExtras, pItem1, 'Extra Fior di Latte Mozzarella', 70
  ]);
  execute(`INSERT INTO item_modifiers (id, group_id, menu_item_id, name, price) VALUES (?, ?, ?, ?, ?)`, [
    uuidv4(), grpExtras, pItem1, 'Fresh Jalapeños', 40
  ]);

  console.log('🌱 Seeding Inventory Items & Stock...');
  const invItems = [
    { id: uuidv4(), name: 'Fior Di Latte Mozzarella', sku: 'INV-MOZZ-01', category: 'Dairy', unit: 'kg', stock: 18.5, min: 10, cost: 420 },
    { id: uuidv4(), name: 'Organic Sourdough Pizza Flour', sku: 'INV-FLOUR-02', category: 'Dry Goods', unit: 'kg', stock: 65.0, min: 25, cost: 65 },
    { id: uuidv4(), name: 'San Marzano Pizza Sauce', sku: 'INV-SAUCE-03', category: 'Sauces & Condiments', unit: 'kg', stock: 24.0, min: 12, cost: 180 },
    { id: uuidv4(), name: 'Truffle Oil White (500ml)', sku: 'INV-TRUF-04', category: 'Sauces & Condiments', unit: 'pcs', stock: 3.0, min: 5, cost: 1200 }, // Low stock!
    { id: uuidv4(), name: 'Prime Angus Beef Patty (150g)', sku: 'INV-PATT-05', category: 'Meat & Poultry', unit: 'pcs', stock: 45.0, min: 20, cost: 110 },
    { id: uuidv4(), name: 'Brioche Burger Buns', sku: 'INV-BUNS-06', category: 'Bakery', unit: 'pcs', stock: 52.0, min: 30, cost: 25 },
    { id: uuidv4(), name: 'Fresh Chicken Breast', sku: 'INV-CHIK-07', category: 'Meat & Poultry', unit: 'kg', stock: 22.0, min: 15, cost: 240 },
    { id: uuidv4(), name: 'Belgian Dark Chocolate 70%', sku: 'INV-CHOC-08', category: 'Bakery', unit: 'kg', stock: 8.5, min: 5, cost: 750 },
    { id: uuidv4(), name: 'Crinkle Cut French Fries Frozen', sku: 'INV-FRIE-09', category: 'Produce', unit: 'kg', stock: 35.0, min: 15, cost: 140 },
    { id: uuidv4(), name: 'Takeaway Eco Boxes (11" Pizza)', sku: 'INV-PK-PZ-10', category: 'Packaging', unit: 'pcs', stock: 180.0, min: 50, cost: 16 },
    { id: uuidv4(), name: 'Kraft Burger Clamshell Box', sku: 'INV-PK-BG-11', category: 'Packaging', unit: 'pcs', stock: 220.0, min: 60, cost: 8 }
  ];

  for (const item of invItems) {
    execute(`
      INSERT INTO inventory_items (id, name, sku, category, unit, current_stock, min_threshold, cost_per_unit, last_restocked_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 days'))
    `, [item.id, item.name, item.sku, item.category, item.unit, item.stock, item.min, item.cost]);
  }

  console.log('🌱 Seeding Recipes (Bill of Materials)...');
  // Link Truffle Pizza to ingredients
  const mozz = invItems.find(i => i.sku === 'INV-MOZZ-01')!;
  const flour = invItems.find(i => i.sku === 'INV-FLOUR-02')!;
  const sauce = invItems.find(i => i.sku === 'INV-SAUCE-03')!;
  const pizzaBox = invItems.find(i => i.sku === 'INV-PK-PZ-10')!;

  execute(`INSERT INTO recipes (id, menu_item_id, inventory_item_id, quantity_required) VALUES (?, ?, ?, ?)`, [
    uuidv4(), pItem1, mozz.id, 0.14 // 140g cheese
  ]);
  execute(`INSERT INTO recipes (id, menu_item_id, inventory_item_id, quantity_required) VALUES (?, ?, ?, ?)`, [
    uuidv4(), pItem1, flour.id, 0.22 // 220g flour dough ball
  ]);
  execute(`INSERT INTO recipes (id, menu_item_id, inventory_item_id, quantity_required) VALUES (?, ?, ?, ?)`, [
    uuidv4(), pItem1, sauce.id, 0.09 // 90g sauce
  ]);
  execute(`INSERT INTO recipes (id, menu_item_id, inventory_item_id, quantity_required) VALUES (?, ?, ?, ?)`, [
    uuidv4(), pItem1, pizzaBox.id, 1 // 1 box
  ]);

  // Link Double Beast Burger to ingredients
  const patty = invItems.find(i => i.sku === 'INV-PATT-05')!;
  const bun = invItems.find(i => i.sku === 'INV-BUNS-06')!;
  const burgerBox = invItems.find(i => i.sku === 'INV-PK-BG-11')!;

  execute(`INSERT INTO recipes (id, menu_item_id, inventory_item_id, quantity_required) VALUES (?, ?, ?, ?)`, [
    uuidv4(), bItem1, patty.id, 2 // 2 patties
  ]);
  execute(`INSERT INTO recipes (id, menu_item_id, inventory_item_id, quantity_required) VALUES (?, ?, ?, ?)`, [
    uuidv4(), bItem1, bun.id, 1 // 1 bun
  ]);
  execute(`INSERT INTO recipes (id, menu_item_id, inventory_item_id, quantity_required) VALUES (?, ?, ?, ?)`, [
    uuidv4(), bItem1, burgerBox.id, 1
  ]);

  console.log('🌱 Seeding Delivery Fleet Riders...');
  const rider1Id = uuidv4();
  const rider2Id = uuidv4();
  const rider3Id = uuidv4();

  execute(`
    INSERT INTO delivery_riders (id, name, phone, vehicle_type, vehicle_number, status, current_orders_count, total_deliveries)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [rider1Id, 'Rahul Kumar', '+91 98860 11223', 'Electric Scooter', 'KA-03-ES-9102', 'delivering', 1, 142]);

  execute(`
    INSERT INTO delivery_riders (id, name, phone, vehicle_type, vehicle_number, status, current_orders_count, total_deliveries)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [rider2Id, 'Amit Sharma', '+91 98450 33445', 'Motorbike', 'KA-01-MB-4021', 'available', 0, 98]);

  execute(`
    INSERT INTO delivery_riders (id, name, phone, vehicle_type, vehicle_number, status, current_orders_count, total_deliveries)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [rider3Id, 'Vignesh P.', '+91 99001 77889', 'Bike', 'KA-04-TR-5510', 'available', 0, 76]);

  console.log('🌱 Seeding Customers CRM...');
  const cust1Id = uuidv4();
  const cust2Id = uuidv4();
  const cust3Id = uuidv4();

  execute(`
    INSERT INTO customers (id, name, phone, email, address, city, notes, loyalty_points, total_orders, total_spent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    cust1Id, 'Kavya Raman', '+91 98765 43210', 'kavya.raman@gmail.com',
    'Apt 4B, Prestige Oasis, 12th Main, HAL 2nd Stage', 'Bengaluru',
    'Prefers contactless delivery, ring bell twice', 320, 8, 3840
  ]);

  execute(`
    INSERT INTO customers (id, name, phone, email, address, city, notes, loyalty_points, total_orders, total_spent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    cust2Id, 'Rohan Mehta', '+91 98112 23344', 'rohan.m@outlook.com',
    'Villa 19, Palm Meadows, Whitefield', 'Bengaluru',
    'Extra spicy requested for Mexican and Asian orders', 150, 4, 1920
  ]);

  execute(`
    INSERT INTO customers (id, name, phone, email, address, city, notes, loyalty_points, total_orders, total_spent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    cust3Id, 'Sneha Krishnan', '+91 99440 55667', 'sneha.k@gmail.com',
    '#204, Brigade Gateway, Malleshwaram', 'Bengaluru',
    'Allergic to peanuts', 410, 11, 5600
  ]);

  console.log('🌱 Seeding Live and Historical Orders for KDS, POS, and Analytics...');
  // 1. Pending incoming order from Swiggy (Brand 1)
  const ord1Id = uuidv4();
  execute(`
    INSERT INTO orders (
      id, order_number, brand_id, outlet_id, customer_id, customer_name, customer_phone, delivery_address,
      channel, channel_order_id, status, payment_method, payment_status, subtotal, tax_amount, packaging_fee, delivery_fee, total_amount,
      special_instructions, prep_time_minutes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-3 minutes'))
  `, [
    ord1Id, 'ORD-SWIG-941', brand1Id, outletId, cust1Id, 'Kavya Raman', '+91 98765 43210',
    'Apt 4B, Prestige Oasis, 12th Main, HAL 2nd Stage, Bengaluru',
    'swiggy', 'SWIG-8849102', 'pending', 'aggregator_prepaid', 'paid', 700, 35, 25, 0, 760,
    'Please send extra napkins and oregano sachets', 15
  ]);
  const oItem1 = uuidv4();
  execute(`
    INSERT INTO order_items (id, order_id, menu_item_id, item_name, price, quantity, total_price, station, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [oItem1, ord1Id, pItem1, 'Truffle Wild Mushroom Pizza', 480, 1, 480, 'Oven', 'pending']);
  execute(`
    INSERT INTO order_items (id, order_id, menu_item_id, item_name, price, quantity, total_price, station, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [uuidv4(), ord1Id, pItem5, 'Cheesy Garlic Sourdough Pull-Apart', 220, 1, 220, 'Oven', 'pending']);

  // 2. Preparing order on KDS from Zomato (Brand 2)
  const ord2Id = uuidv4();
  execute(`
    INSERT INTO orders (
      id, order_number, brand_id, outlet_id, customer_id, customer_name, customer_phone, delivery_address,
      channel, channel_order_id, status, payment_method, payment_status, subtotal, tax_amount, packaging_fee, delivery_fee, total_amount,
      special_instructions, prep_time_minutes, created_at, accepted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-9 minutes'), datetime('now', '-8 minutes'))
  `, [
    ord2Id, 'ORD-ZOM-218', brand2Id, outletId, cust2Id, 'Rohan Mehta', '+91 98112 23344',
    'Villa 19, Palm Meadows, Whitefield, Bengaluru',
    'zomato', 'ZOM-441092', 'preparing', 'aggregator_prepaid', 'paid', 590, 29.5, 25, 0, 644.5,
    'Well done patties please', 12
  ]);
  execute(`
    INSERT INTO order_items (id, order_id, menu_item_id, item_name, price, quantity, total_price, station, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [uuidv4(), ord2Id, bItem1, 'Double Beast Smashed Cheeseburger', 380, 1, 380, 'Grill', 'cooking']);
  execute(`
    INSERT INTO order_items (id, order_id, menu_item_id, item_name, price, quantity, total_price, station, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [uuidv4(), ord2Id, bItem3, 'Truffle & Parmesan Loaded Crinkle Fries', 210, 1, 210, 'Fryer', 'cooking']);

  // 3. Ready for pickup order (Brand 3 - Direct Takeaway)
  const ord3Id = uuidv4();
  execute(`
    INSERT INTO orders (
      id, order_number, brand_id, outlet_id, customer_id, customer_name, customer_phone, delivery_address,
      channel, status, payment_method, payment_status, subtotal, tax_amount, packaging_fee, delivery_fee, total_amount,
      prep_time_minutes, created_at, accepted_at, prepared_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-18 minutes'), datetime('now', '-16 minutes'), datetime('now', '-2 minutes'))
  `, [
    ord3Id, 'ORD-POS-103', brand3Id, outletId, cust3Id, 'Sneha Krishnan', '+91 99440 55667',
    'Takeaway - Counter Pickup',
    'takeaway', 'ready', 'upi', 'paid', 610, 30.5, 15, 0, 655.5,
    10
  ]);
  execute(`
    INSERT INTO order_items (id, order_id, menu_item_id, item_name, price, quantity, total_price, station, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [uuidv4(), ord3Id, wItem1, 'Fiery Schezwan Chicken Hakka Noodles', 320, 1, 320, 'Wok', 'ready']);
  execute(`
    INSERT INTO order_items (id, order_id, menu_item_id, item_name, price, quantity, total_price, station, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [uuidv4(), ord3Id, wItem2, 'Steamed Truffle Edamame Dim Sum (6 pcs)', 290, 1, 290, 'Assembly', 'ready']);

  // 4. Dispatched Order out for delivery with Rahul Kumar
  const ord4Id = uuidv4();
  execute(`
    INSERT INTO orders (
      id, order_number, brand_id, outlet_id, customer_name, customer_phone, delivery_address,
      channel, status, payment_method, payment_status, subtotal, tax_amount, packaging_fee, delivery_fee, total_amount,
      rider_id, rider_name, rider_phone, prep_time_minutes, created_at, accepted_at, prepared_at, dispatched_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-32 minutes'), datetime('now', '-30 minutes'), datetime('now', '-15 minutes'), datetime('now', '-8 minutes'))
  `, [
    ord4Id, 'ORD-DIR-804', brand1Id, outletId, 'Aditya Roy', '+91 97722 33441',
    'Tower 2, 703, Divyasree Republic of Whitefield',
    'direct_pos', 'dispatched', 'card', 'paid', 950, 47.5, 25, 40, 1062.5,
    rider1Id, 'Rahul Kumar', '+91 98860 11223', 15
  ]);
  execute(`
    INSERT INTO order_items (id, order_id, menu_item_id, item_name, price, quantity, total_price, station, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [uuidv4(), ord4Id, pItem2, 'Spicy Pepperoni & Hot Honey Pizza', 560, 1, 560, 'Oven', 'ready']);
  execute(`
    INSERT INTO order_items (id, order_id, menu_item_id, item_name, price, quantity, total_price, station, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [uuidv4(), ord4Id, pItem3, 'Creamy Truffle Fettuccine Alfredo', 390, 1, 390, 'Prep', 'ready']);

  // 5. Seed historical delivered orders for today & yesterday to produce realistic charts and analytics
  const pastOrders = [
    { brand: brand1Id, channel: 'swiggy', subtotal: 940, items: [{ item: pItem1, qty: 2, price: 480 }], minAgo: 65 },
    { brand: brand2Id, channel: 'zomato', subtotal: 730, items: [{ item: bItem1, qty: 1, price: 380 }, { item: bItem2, qty: 1, price: 350 }], minAgo: 95 },
    { brand: brand3Id, channel: 'direct_pos', subtotal: 610, items: [{ item: wItem1, qty: 1, price: 320 }, { item: wItem2, qty: 1, price: 290 }], minAgo: 140 },
    { brand: brand4Id, channel: 'swiggy', subtotal: 450, items: [{ item: sItem1, qty: 1, price: 240 }, { item: sItem2, qty: 1, price: 210 }], minAgo: 180 },
    { brand: brand2Id, channel: 'ubereats', subtotal: 590, items: [{ item: bItem1, qty: 1, price: 380 }, { item: bItem3, qty: 1, price: 210 }], minAgo: 220 },
    { brand: brand1Id, channel: 'zomato', subtotal: 1040, items: [{ item: pItem1, qty: 1, price: 480 }, { item: pItem2, qty: 1, price: 560 }], minAgo: 260 },
    { brand: brand4Id, channel: 'direct_pos', subtotal: 420, items: [{ item: sItem2, qty: 2, price: 210 }], minAgo: 310 },
    { brand: brand3Id, channel: 'swiggy', subtotal: 640, items: [{ item: wItem1, qty: 2, price: 320 }], minAgo: 360 },
    { brand: brand1Id, channel: 'direct_pos', subtotal: 700, items: [{ item: pItem1, qty: 1, price: 480 }, { item: pItem5, qty: 1, price: 220 }], minAgo: 420 },
    { brand: brand2Id, channel: 'takeaway', subtotal: 350, items: [{ item: bItem2, qty: 1, price: 350 }], minAgo: 480 }
  ];

  pastOrders.forEach((po, idx) => {
    const oId = uuidv4();
    const tax = po.subtotal * 0.05;
    const pkg = 20;
    const total = po.subtotal + tax + pkg;
    execute(`
      INSERT INTO orders (
        id, order_number, brand_id, outlet_id, customer_name, customer_phone, delivery_address,
        channel, status, payment_method, payment_status, subtotal, tax_amount, packaging_fee, delivery_fee, total_amount,
        prep_time_minutes, created_at, accepted_at, prepared_at, dispatched_at, delivered_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-${po.minAgo} minutes'), datetime('now', '-${po.minAgo - 2} minutes'), datetime('now', '-${po.minAgo - 15} minutes'), datetime('now', '-${po.minAgo - 20} minutes'), datetime('now', '-${po.minAgo - 40} minutes'))
    `, [
      oId, `ORD-HIST-${100 + idx}`, po.brand, outletId, `Customer ${idx + 1}`, `+91 99000 ${10000 + idx}`,
      'Bengaluru Urban Delivery Address', po.channel, 'delivered', 'aggregator_prepaid', 'paid',
      po.subtotal, tax, pkg, 0, total, 14
    ]);

    for (const it of po.items) {
      execute(`
        INSERT INTO order_items (id, order_id, menu_item_id, item_name, price, quantity, total_price, station, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ready')
      `, [uuidv4(), oId, it.item, 'Menu Item', it.price, it.qty, it.price * it.qty, 'Oven']);
    }
  });

  console.log('✅ Pepito Cloud Kitchen Software Database Seeded Successfully!');
}

// Run immediately if executed directly via CLI
runSeed();

