-- =========================================================================
-- Pepito Cloud Kitchen Software Database Schema
-- Multi-Brand Cloud Kitchen Management, POS, Inventory, KDS & Aggregator Hub
-- =========================================================================

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- 1. Users & Staff Authentication
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'kitchen', 'cashier', 'rider')),
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Physical Kitchen Outlets / Hubs
CREATE TABLE IF NOT EXISTS outlets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    tax_rate REAL DEFAULT 5.0,
    packaging_fee REAL DEFAULT 20.0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Virtual Brands Operating in Cloud Kitchen Hub
CREATE TABLE IF NOT EXISTS brands (
    id TEXT PRIMARY KEY,
    outlet_id TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT,
    cuisine TEXT,
    logo_url TEXT,
    banner_color TEXT,
    is_active INTEGER DEFAULT 1,
    rating REAL DEFAULT 4.8,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE
);

-- 4. Categories per Brand
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    brand_id TEXT NOT NULL,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
);

-- 5. Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    brand_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    base_price REAL NOT NULL,
    image_url TEXT,
    is_veg INTEGER DEFAULT 1, -- 0: Non-veg, 1: Veg, 2: Vegan/Egg
    is_available INTEGER DEFAULT 1, -- 86 Out of Stock toggle
    station TEXT DEFAULT 'Prep', -- 'Grill', 'Oven', 'Fryer', 'Wok', 'Assembly', 'Packing', 'Beverage'
    prep_time_minutes INTEGER DEFAULT 12,
    swiggy_price REAL,
    zomato_price REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 6. Modifier Groups & Modifiers
CREATE TABLE IF NOT EXISTS modifier_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    min_selection INTEGER DEFAULT 0,
    max_selection INTEGER DEFAULT 1,
    is_required INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS item_modifiers (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    menu_item_id TEXT, -- NULL if global or reusable
    name TEXT NOT NULL,
    price REAL DEFAULT 0.0,
    is_available INTEGER DEFAULT 1,
    FOREIGN KEY (group_id) REFERENCES modifier_groups(id) ON DELETE CASCADE
);

-- 7. Customers / CRM
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    address TEXT,
    city TEXT,
    notes TEXT,
    loyalty_points INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Delivery Riders (Internal or Partner Fleets)
CREATE TABLE IF NOT EXISTS delivery_riders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    vehicle_type TEXT DEFAULT 'Bike',
    vehicle_number TEXT,
    status TEXT DEFAULT 'available' CHECK(status IN ('available', 'delivering', 'offline')),
    current_orders_count INTEGER DEFAULT 0,
    total_deliveries INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Raw Material Inventory
CREATE TABLE IF NOT EXISTS inventory_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    current_stock REAL NOT NULL DEFAULT 0.0,
    min_threshold REAL NOT NULL DEFAULT 5.0,
    cost_per_unit REAL NOT NULL DEFAULT 0.0,
    last_restocked_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Recipe Bill of Materials (BOM) linking Menu Items to Ingredients
CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    menu_item_id TEXT NOT NULL,
    inventory_item_id TEXT NOT NULL,
    quantity_required REAL NOT NULL,
    notes TEXT,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);

-- 11. Orders (Multi-Channel Aggregated Orders)
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    brand_id TEXT NOT NULL,
    outlet_id TEXT NOT NULL,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT,
    channel TEXT NOT NULL CHECK(channel IN ('direct_pos', 'takeaway', 'swiggy', 'zomato', 'ubereats')),
    channel_order_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled')),
    payment_method TEXT DEFAULT 'cash' CHECK(payment_method IN ('cash', 'card', 'upi', 'aggregator_prepaid', 'unpaid')),
    payment_status TEXT DEFAULT 'paid' CHECK(payment_status IN ('paid', 'pending', 'refunded')),
    subtotal REAL NOT NULL,
    tax_amount REAL NOT NULL,
    packaging_fee REAL DEFAULT 0.0,
    delivery_fee REAL DEFAULT 0.0,
    discount_amount REAL DEFAULT 0.0,
    total_amount REAL NOT NULL,
    special_instructions TEXT,
    kds_station TEXT DEFAULT 'All',
    prep_time_minutes INTEGER DEFAULT 15,
    rider_id TEXT,
    rider_name TEXT,
    rider_phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    accepted_at DATETIME,
    prepared_at DATETIME,
    dispatched_at DATETIME,
    delivered_at DATETIME,
    FOREIGN KEY (brand_id) REFERENCES brands(id),
    FOREIGN KEY (outlet_id) REFERENCES outlets(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (rider_id) REFERENCES delivery_riders(id)
);

-- 12. Order Line Items
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    menu_item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price REAL NOT NULL,
    station TEXT DEFAULT 'Prep',
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'cooking', 'ready')),
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- 13. Order Item Modifiers
CREATE TABLE IF NOT EXISTS order_item_modifiers (
    id TEXT PRIMARY KEY,
    order_item_id TEXT NOT NULL,
    modifier_name TEXT NOT NULL,
    price REAL DEFAULT 0.0,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
);

-- 14. Stock Transactions Log (Auto deduction, restock, wastage)
CREATE TABLE IF NOT EXISTS stock_transactions (
    id TEXT PRIMARY KEY,
    inventory_item_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('deduction_order', 'restock', 'wastage', 'manual_adjustment')),
    quantity REAL NOT NULL,
    cost REAL DEFAULT 0.0,
    order_id TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_brand ON orders(brand_id);
CREATE INDEX IF NOT EXISTS idx_orders_channel ON orders(channel);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_menu_items_brand ON menu_items(brand_id);
CREATE INDEX IF NOT EXISTS idx_recipes_menu ON recipes(menu_item_id);

