import {
  Brand, Category, MenuItem, Order, InventoryItem, DeliveryRider, Customer, DashboardStats
} from '../types';

const API_BASE = '/api';

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: any; error?: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  // Brands
  async getBrands(): Promise<{ brands: Brand[] }> {
    const res = await fetch(`${API_BASE}/brands`);
    return res.json();
  },

  async createBrand(data: Partial<Brand>): Promise<{ brand: Brand }> {
    const res = await fetch(`${API_BASE}/brands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async toggleBrand(id: string): Promise<{ success: boolean; is_active: number }> {
    const res = await fetch(`${API_BASE}/brands/${id}/toggle`, { method: 'PATCH' });
    return res.json();
  },

  // Menu & Categories
  async getCategories(brandId?: string): Promise<{ categories: Category[] }> {
    const url = brandId ? `${API_BASE}/menu/categories?brand_id=${brandId}` : `${API_BASE}/menu/categories`;
    const res = await fetch(url);
    return res.json();
  },

  async getMenuItems(params?: { brand_id?: string; category_id?: string; search?: string; available_only?: boolean }): Promise<{ items: MenuItem[] }> {
    const query = new URLSearchParams();
    if (params?.brand_id) query.set('brand_id', params.brand_id);
    if (params?.category_id) query.set('category_id', params.category_id);
    if (params?.search) query.set('search', params.search);
    if (params?.available_only) query.set('available_only', 'true');
    const res = await fetch(`${API_BASE}/menu/items?${query.toString()}`);
    return res.json();
  },

  async getMenuItemDetails(id: string): Promise<{ item: MenuItem; modifiers: any[] }> {
    const res = await fetch(`${API_BASE}/menu/items/${id}`);
    return res.json();
  },

  async createMenuItem(data: any): Promise<{ item: MenuItem }> {
    const res = await fetch(`${API_BASE}/menu/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async toggleStock(id: string): Promise<{ success: boolean; is_available: number; itemId: string }> {
    const res = await fetch(`${API_BASE}/menu/items/${id}/toggle-stock`, { method: 'PATCH' });
    return res.json();
  },

  // Orders & Billing
  async getOrders(params?: { status?: string; channel?: string; brand_id?: string; search?: string; limit?: string | number }): Promise<{ orders: Order[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.channel) query.set('channel', params.channel);
    if (params?.brand_id) query.set('brand_id', params.brand_id);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', String(params.limit));
    const res = await fetch(`${API_BASE}/orders?${query.toString()}`);
    return res.json();
  },

  async createOrder(data: any): Promise<{ order: Order }> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateOrderStatus(id: string, status: string): Promise<{ order: Order }> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async assignRider(orderId: string, riderId: string): Promise<{ order: Order }> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/assign-rider`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rider_id: riderId })
    });
    return res.json();
  },

  async simulateOrder(): Promise<{ message: string; order: Order }> {
    const res = await fetch(`${API_BASE}/orders/simulate`, { method: 'POST' });
    return res.json();
  },

  // Kitchen Display System (KDS)
  async getKdsTickets(params?: { station?: string; brand_id?: string }): Promise<{ tickets: any[] }> {
    const query = new URLSearchParams();
    if (params?.station) query.set('station', params.station);
    if (params?.brand_id) query.set('brand_id', params.brand_id);
    const res = await fetch(`${API_BASE}/kds/tickets?${query.toString()}`);
    return res.json();
  },

  async bumpKdsTicket(orderId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/kds/bump/${orderId}`, { method: 'POST' });
    return res.json();
  },

  async toggleKdsItem(itemId: string): Promise<{ success: boolean; status: string }> {
    const res = await fetch(`${API_BASE}/kds/items/${itemId}/toggle`, { method: 'PATCH' });
    return res.json();
  },

  // Inventory & BOM
  async getInventory(lowStockOnly = false): Promise<{ items: InventoryItem[] }> {
    const res = await fetch(`${API_BASE}/inventory?low_stock_only=${lowStockOnly}`);
    return res.json();
  },

  async adjustStock(data: { inventory_item_id: string; type: string; quantity: number; notes?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/inventory/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async createInventoryItem(data: any): Promise<{ item: InventoryItem }> {
    const res = await fetch(`${API_BASE}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getRecipe(menuItemId: string): Promise<{ recipes: any[]; estimated_food_cost: number }> {
    const res = await fetch(`${API_BASE}/recipes/item/${menuItemId}`);
    return res.json();
  },

  // Delivery & Riders
  async getRiders(): Promise<{ riders: DeliveryRider[] }> {
    const res = await fetch(`${API_BASE}/delivery/riders`);
    return res.json();
  },

  async createRider(data: Partial<DeliveryRider>): Promise<{ rider: DeliveryRider }> {
    const res = await fetch(`${API_BASE}/delivery/riders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateRiderStatus(id: string, status: string): Promise<{ rider: DeliveryRider }> {
    const res = await fetch(`${API_BASE}/delivery/riders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Customers
  async getCustomers(search?: string): Promise<{ customers: Customer[] }> {
    const url = search ? `${API_BASE}/customers?search=${encodeURIComponent(search)}` : `${API_BASE}/customers`;
    const res = await fetch(url);
    return res.json();
  },

  async saveCustomer(data: Partial<Customer>): Promise<{ customer: Customer }> {
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Analytics
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/analytics/dashboard`);
    return res.json();
  },

  async getSalesReport(fromDate?: string, toDate?: string): Promise<any> {
    const query = new URLSearchParams();
    if (fromDate) query.set('from_date', fromDate);
    if (toDate) query.set('to_date', toDate);
    const res = await fetch(`${API_BASE}/analytics/sales-report?${query.toString()}`);
    return res.json();
  }
};
