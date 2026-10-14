export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'kitchen' | 'cashier' | 'rider';
  avatar?: string;
  created_at: string;
}

export interface Outlet {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  tax_rate: number;
  packaging_fee: number;
  is_active: number;
  created_at: string;
}

export interface Brand {
  id: string;
  outlet_id: string;
  name: string;
  slug: string;
  tagline?: string;
  cuisine?: string;
  logo_url?: string;
  banner_color?: string;
  is_active: number;
  rating: number;
  created_at: string;
}

export interface Category {
  id: string;
  brand_id: string;
  name: string;
  display_order: number;
  is_active: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  brand_id: string;
  category_id: string;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  is_veg: number; // 0: Non-veg, 1: Veg, 2: Vegan/Egg
  is_available: number; // 86 Out of Stock toggle
  station: string; // 'Grill' | 'Oven' | 'Fryer' | 'Wok' | 'Assembly' | 'Packing' | 'Beverage'
  prep_time_minutes: number;
  swiggy_price?: number;
  zomato_price?: number;
  brand_name?: string;
  category_name?: string;
  created_at: string;
}

export interface ModifierGroup {
  id: string;
  name: string;
  min_selection: number;
  max_selection: number;
  is_required: number;
  modifiers?: ItemModifier[];
}

export interface ItemModifier {
  id: string;
  group_id: string;
  menu_item_id?: string;
  name: string;
  price: number;
  is_available: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
  loyalty_points: number;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

export interface DeliveryRider {
  id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  vehicle_number?: string;
  status: 'available' | 'delivering' | 'offline';
  current_orders_count: number;
  total_deliveries: number;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  current_stock: number;
  min_threshold: number;
  cost_per_unit: number;
  last_restocked_at?: string;
  created_at: string;
  is_low_stock?: boolean;
}

export interface Recipe {
  id: string;
  menu_item_id: string;
  inventory_item_id: string;
  quantity_required: number;
  notes?: string;
  ingredient_name?: string;
  unit?: string;
  cost_per_unit?: number;
}

export type OrderChannel = 'direct_pos' | 'takeaway' | 'swiggy' | 'zomato' | 'ubereats';
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'aggregator_prepaid' | 'unpaid';
export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export interface OrderItemModifier {
  id: string;
  order_item_id: string;
  modifier_name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  total_price: number;
  station: string;
  status: 'pending' | 'cooking' | 'ready';
  notes?: string;
  modifiers?: OrderItemModifier[];
}

export interface Order {
  id: string;
  order_number: string;
  brand_id: string;
  outlet_id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  delivery_address?: string;
  channel: OrderChannel;
  channel_order_id?: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  tax_amount: number;
  packaging_fee: number;
  delivery_fee: number;
  discount_amount: number;
  total_amount: number;
  special_instructions?: string;
  kds_station?: string;
  prep_time_minutes: number;
  rider_id?: string;
  rider_name?: string;
  rider_phone?: string;
  created_at: string;
  accepted_at?: string;
  prepared_at?: string;
  dispatched_at?: string;
  delivered_at?: string;
  brand_name?: string;
  brand_logo?: string;
  items?: OrderItem[];
}

export interface StockTransaction {
  id: string;
  inventory_item_id: string;
  type: 'deduction_order' | 'restock' | 'wastage' | 'manual_adjustment';
  quantity: number;
  cost: number;
  order_id?: string;
  notes?: string;
  created_at: string;
  item_name?: string;
  unit?: string;
}

