export interface Brand {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  cuisine?: string;
  logo_url?: string;
  banner_color?: string;
  is_active: number;
  rating: number;
  item_count?: number;
}

export interface Category {
  id: string;
  brand_id: string;
  brand_name?: string;
  name: string;
  display_order: number;
  is_active: number;
}

export interface MenuItem {
  id: string;
  brand_id: string;
  category_id: string;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  is_veg: number;
  is_available: number;
  station: string;
  prep_time_minutes: number;
  swiggy_price?: number;
  zomato_price?: number;
  brand_name?: string;
  brand_logo?: string;
  category_name?: string;
}

export interface ItemModifier {
  id: string;
  group_id: string;
  name: string;
  price: number;
  is_available: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  min_selection: number;
  max_selection: number;
  is_required: number;
  modifiers?: ItemModifier[];
}

export interface OrderItem {
  id?: string;
  menu_item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  total_price: number;
  station?: string;
  status?: 'pending' | 'cooking' | 'ready';
  modifiers?: Array<{ name: string; price: number }>;
}

export type OrderChannel = 'direct_pos' | 'takeaway' | 'swiggy' | 'zomato' | 'ubereats';
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'aggregator_prepaid' | 'unpaid';

export interface Order {
  id: string;
  order_number: string;
  brand_id: string;
  brand_name?: string;
  brand_logo?: string;
  customer_name: string;
  customer_phone: string;
  delivery_address?: string;
  channel: OrderChannel;
  channel_order_id?: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: string;
  subtotal: number;
  tax_amount: number;
  packaging_fee: number;
  delivery_fee: number;
  discount_amount: number;
  total_amount: number;
  special_instructions?: string;
  prep_time_minutes: number;
  rider_id?: string;
  rider_name?: string;
  rider_phone?: string;
  created_at: string;
  accepted_at?: string;
  prepared_at?: string;
  dispatched_at?: string;
  delivered_at?: string;
  items?: OrderItem[];
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
  is_low_stock?: boolean;
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
}

export interface DashboardStats {
  today: {
    revenue: number;
    orders: number;
    avg_ticket: number;
    active_orders: number;
  };
  brand_sales: Array<{
    brand_id: string;
    brand_name: string;
    banner_color: string;
    revenue: number;
    order_count: number;
  }>;
  channel_breakdown: Array<{
    channel: string;
    order_count: number;
    total_sales: number;
  }>;
  top_items: Array<{
    item_name: string;
    total_quantity: number;
    total_sales: number;
  }>;
  low_stock_count: number;
}

