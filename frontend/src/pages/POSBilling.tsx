import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle,
  Clock,
  Phone,
  User,
  MapPin,
  CreditCard,
  Banknote,
  QrCode,
  Tag,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { playPosBeep } from '../services/sound';
import { Brand, MenuItem, Order, OrderItem } from '../types';

interface POSBillingProps {
  onOrderCreated?: (order: Order) => void;
}

export const POSBilling: React.FC<POSBillingProps> = ({ onOrderCreated }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart State
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [channel, setChannel] = useState<'direct_pos' | 'takeaway'>('direct_pos');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Brands and Initial Menu
  useEffect(() => {
    async function init() {
      try {
        const { brands: brandList } = await api.getBrands();
        setBrands(brandList);
        if (brandList.length > 0) {
          setSelectedBrand(brandList[0].id);
        }
      } catch (err) {
        console.error('Failed to load brands', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // When selected brand changes, load categories and menu items
  useEffect(() => {
    if (!selectedBrand) return;
    async function loadBrandData() {
      try {
        const [catData, itemData] = await Promise.all([
          api.getCategories(selectedBrand),
          api.getMenuItems({ brand_id: selectedBrand })
        ]);
        setCategories(catData.categories);
        setSelectedCategory('all');
        setMenuItems(itemData.items);
      } catch (err) {
        console.error('Failed to load brand menu', err);
      }
    }
    loadBrandData();
  }, [selectedBrand]);

  // Customer phone lookup
  const handlePhoneBlur = async () => {
    if (!customerPhone || customerPhone.length < 8) return;
    try {
      const { customers } = await api.getCustomers(customerPhone);
      if (customers.length > 0) {
        const c = customers[0];
        setCustomerName(c.name);
        if (c.address) setDeliveryAddress(c.address);
      }
    } catch (e) {
      // ignore
    }
  };

  // Add Item to Cart
  const addToCart = (item: MenuItem) => {
    if (item.is_available === 0) return;
    playPosBeep();

    setCart(prev => {
      const existing = prev.find(i => i.menu_item_id === item.id);
      if (existing) {
        return prev.map(i =>
          i.menu_item_id === item.id
            ? { ...i, quantity: i.quantity + 1, total_price: (i.quantity + 1) * i.price }
            : i
        );
      }
      return [
        ...prev,
        {
          menu_item_id: item.id,
          item_name: item.name,
          price: item.base_price,
          quantity: 1,
          total_price: item.base_price,
          station: item.station
        }
      ];
    });
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    playPosBeep();
    setCart(prev =>
      prev
        .map(i => {
          if (i.menu_item_id === menuItemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty, total_price: newQty * i.price } : null;
          }
          return i;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const removeItem = (menuItemId: string) => {
    setCart(prev => prev.filter(i => i.menu_item_id !== menuItemId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setSpecialNotes('');
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
  const tax = Math.round((Math.max(0, subtotal - discountAmount) * 0.05) * 100) / 100;
  const packagingFee = channel === 'takeaway' ? 15.0 : 0.0;
  const grandTotal = Math.max(0, subtotal - discountAmount + tax + packagingFee);

  // Submit and Place Order
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createOrder({
        brand_id: selectedBrand,
        customer_name: customerName,
        customer_phone: customerPhone || 'Walk-in',
        delivery_address: deliveryAddress || (channel === 'takeaway' ? 'Counter Pickup' : 'Dine-In / Quick POS'),
        channel,
        payment_method: paymentMethod,
        discount_amount: discountAmount,
        special_instructions: specialNotes,
        items: cart.map(i => ({
          menu_item_id: i.menu_item_id,
          item_name: i.item_name,
          price: i.price,
          quantity: i.quantity
        }))
      });

      // Clear cart
      clearCart();
      if (onOrderCreated) {
        onOrderCreated(res.order);
      }
    } catch (err: any) {
      alert(`Error creating order: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Items
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Menu Selection Section */}
      <div className="flex-1 flex flex-col border-r border-gray-800 bg-gray-950 overflow-hidden">
        {/* Brand Tabs Header */}
        <div className="p-4 bg-gray-900/90 border-b border-gray-800 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {brands.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBrand(b.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                  selectedBrand === b.id
                    ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: b.banner_color || '#F59E0B' }}
                />
                <span>{b.name}</span>
              </button>
            ))}
          </div>

          {/* Search & Category Filter Pills */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dish name (e.g. Pizza, Burger, Noodles)..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                All Items
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    selectedCategory === c.id
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <p className="text-sm">No items found matching your filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredItems.map(item => {
                const inCart = cart.find(c => c.menu_item_id === item.id);
                const isOutOfStock = item.is_available === 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => !isOutOfStock && addToCart(item)}
                    className={`relative p-3 rounded-2xl bg-gray-900 border transition-all text-left flex flex-col justify-between group ${
                      isOutOfStock
                        ? 'opacity-50 cursor-not-allowed border-gray-800'
                        : 'cursor-pointer hover:border-amber-500/50 hover:bg-gray-850 border-gray-800 shadow-md active:scale-98'
                    }`}
                  >
                    <div>
                      {/* Image & Badges */}
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-2.5 bg-gray-800">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                        )}

                        {/* Veg / Non-veg dot */}
                        <div className="absolute top-2 left-2 bg-gray-950/80 p-1 rounded-md backdrop-blur-sm border border-gray-800">
                          {item.is_veg === 1 ? (
                            <div className="w-3 h-3 border-2 border-emerald-500 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            </div>
                          ) : (
                            <div className="w-3 h-3 border-2 border-rose-500 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                            </div>
                          )}
                        </div>

                        {/* Station Tag */}
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-gray-950/80 text-[10px] font-mono text-gray-300 backdrop-blur-sm border border-gray-800">
                          {item.station}
                        </div>

                        {/* Out of stock overlay */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center font-bold text-xs text-rose-400">
                            86ed (Out of Stock)
                          </div>
                        )}
                      </div>

                      {/* Title & Desc */}
                      <h4 className="font-bold text-xs text-white line-clamp-1">{item.name}</h4>
                      {item.description && (
                        <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{item.description}</p>
                      )}
                    </div>

                    {/* Price & Cart Status */}
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-800/80">
                      <span className="font-extrabold text-sm text-amber-400">₹{item.base_price}</span>
                      {inCart ? (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-black font-extrabold text-xs">
                          x{inCart.quantity}
                        </span>
                      ) : (
                        <button
                          disabled={isOutOfStock}
                          className="w-6 h-6 rounded-lg bg-gray-800 hover:bg-amber-500 hover:text-black text-gray-300 flex items-center justify-center transition-colors disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Cart & Billing Sidebar (380px) */}
      <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col justify-between overflow-hidden shadow-2xl shrink-0">
        {/* Cart Top & Customer Info */}
        <div className="p-4 border-b border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
              <span>ACTIVE ORDER</span>
              <span className="text-amber-400 text-xs font-normal">({cart.length} items)</span>
            </h3>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Channel selector (Counter / Takeaway) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-950 rounded-xl border border-gray-800">
            <button
              onClick={() => setChannel('direct_pos')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                channel === 'direct_pos' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Counter Dine-In
            </button>
            <button
              onClick={() => setChannel('takeaway')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                channel === 'takeaway' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Takeaway Box
            </button>
          </div>

          {/* Customer Inputs */}
          <div className="space-y-2 text-xs">
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Customer Phone (Auto-search CRM)..."
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                onBlur={handlePhoneBlur}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Customer Name..."
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-4 overflow-y-auto divide-y divide-gray-800/80">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-600">
                <Tag className="w-6 h-6" />
              </div>
              <p className="text-xs">No items in ticket yet.</p>
              <p className="text-[11px] text-gray-600 text-center">
                Click on any menu item from the left to add it to the POS bill.
              </p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.menu_item_id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-white truncate">{item.item_name}</h4>
                  <div className="text-[11px] text-amber-400 font-bold">
                    ₹{item.price} each • <span className="text-white">₹{item.total_price}</span>
                  </div>
                </div>

                {/* Counter buttons */}
                <div className="flex items-center gap-1.5 bg-gray-950 px-2 py-1 rounded-lg border border-gray-800">
                  <button
                    onClick={() => updateQuantity(item.menu_item_id, -1)}
                    className="p-1 hover:text-amber-400 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-xs text-white px-1 font-mono">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.menu_item_id, 1)}
                    className="p-1 hover:text-amber-400 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.menu_item_id)}
                  className="p-1 text-gray-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Financials & Charge Button */}
        <div className="p-4 bg-gray-950 border-t border-gray-800 space-y-3">
          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cash', label: 'Cash', icon: Banknote },
              { id: 'upi', label: 'UPI / QR', icon: QrCode },
              { id: 'card', label: 'Card', icon: CreditCard }
            ].map(m => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    paymentMethod === m.id
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Subtotal, Tax, Total Breakdown */}
          <div className="space-y-1 text-xs pt-1 border-t border-gray-800 text-gray-400">
            <div className="flex justify-between">
              <span>Item Subtotal:</span>
              <span className="text-white">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%):</span>
              <span className="text-white">₹{tax.toFixed(2)}</span>
            </div>
            {packagingFee > 0 && (
              <div className="flex justify-between">
                <span>Takeaway Packaging:</span>
                <span className="text-white">₹{packagingFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-gray-800 text-sm font-extrabold text-white">
              <span>TOTAL DUE:</span>
              <span className="text-amber-400 font-mono text-base">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Charge & Print Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={cart.length === 0 || isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-extrabold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            <span>{isSubmitting ? 'Processing Bill...' : `Charge ₹${grandTotal.toFixed(2)} & Print`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

