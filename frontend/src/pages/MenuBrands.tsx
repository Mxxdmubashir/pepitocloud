import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Search,
  Power,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  DollarSign,
  Clock,
  Store,
  ChefHat
} from 'lucide-react';
import { api } from '../services/api';
import { Brand, MenuItem } from '../types';

export const MenuBrands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State for New Item
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemBrand, setNewItemBrand] = useState('');
  const [newItemStation, setNewItemStation] = useState('Prep');
  const [newItemVeg, setNewItemVeg] = useState(1);
  const [newItemPrepTime, setNewItemPrepTime] = useState('12');

  const fetchData = async () => {
    try {
      const [brandData, itemData] = await Promise.all([
        api.getBrands(),
        api.getMenuItems({
          brand_id: selectedBrand === 'all' ? undefined : selectedBrand,
          search
        })
      ]);
      setBrands(brandData.brands);
      setItems(itemData.items);
      if (brandData.brands.length > 0 && !newItemBrand) {
        setNewItemBrand(brandData.brands[0].id);
      }
    } catch (err) {
      console.error('Failed to load menu data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBrand, search]);

  // Toggle 86 Out of Stock
  const handleToggleStock = async (itemId: string) => {
    try {
      const res = await api.toggleStock(itemId);
      setItems(prev =>
        prev.map(i => (i.id === itemId ? { ...i, is_available: res.is_available } : i))
      );
    } catch (err) {
      console.error('Failed to toggle stock', err);
    }
  };

  // Toggle Brand Online / Offline
  const handleToggleBrand = async (brandId: string) => {
    try {
      const res = await api.toggleBrand(brandId);
      setBrands(prev =>
        prev.map(b => (b.id === brandId ? { ...b, is_active: res.is_active } : b))
      );
    } catch (err) {
      console.error('Failed to toggle brand', err);
    }
  };

  // Add Item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice || !newItemBrand) return;

    try {
      // Find a category for this brand
      const catData = await api.getCategories(newItemBrand);
      const categoryId = catData.categories[0]?.id || 'default_cat';

      await api.createMenuItem({
        brand_id: newItemBrand,
        category_id: categoryId,
        name: newItemName,
        base_price: Number(newItemPrice),
        station: newItemStation,
        is_veg: Number(newItemVeg),
        prep_time_minutes: Number(newItemPrepTime)
      });

      setIsModalOpen(false);
      setNewItemName('');
      setNewItemPrice('');
      fetchData();
    } catch (err) {
      console.error('Failed to add item', err);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Brands & Menu Catalog
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
              {items.length} Menu Items
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Manage multi-brand virtual storefronts, channel markups, and instant 86 out-of-stock toggles.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          Add Menu Item
        </button>
      </div>

      {/* Brands Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {brands.map(brand => (
          <div
            key={brand.id}
            className={`p-4 rounded-2xl bg-gray-900 border transition-all ${
              brand.is_active === 1 ? 'border-gray-800' : 'border-rose-900/40 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: brand.banner_color || '#F59E0B' }}
              />
              <button
                onClick={() => handleToggleBrand(brand.id)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                  brand.is_active === 1
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                }`}
              >
                <Power className="w-3 h-3" />
                <span>{brand.is_active === 1 ? 'Online' : 'Offline'}</span>
              </button>
            </div>

            <h3 className="font-bold text-sm text-white line-clamp-1">{brand.name}</h3>
            <p className="text-xs text-amber-400/90 font-medium">{brand.cuisine}</p>
            <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">{brand.tagline}</p>

            <div className="mt-3 pt-2 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
              <span>{brand.item_count || 0} Dishes</span>
              <span className="text-amber-400 font-bold">★ {brand.rating}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Menu Table & Filters */}
      <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-gray-800">
          {/* Brand Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedBrand('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                selectedBrand === 'all'
                  ? 'bg-amber-500 text-black'
                  : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              All Brands
            </button>
            {brands.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBrand(b.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  selectedBrand === b.id
                    ? 'bg-amber-500 text-black'
                    : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Dish / Item</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4">Base POS (₹)</th>
                <th className="py-3 px-4">Swiggy (₹)</th>
                <th className="py-3 px-4">Zomato (₹)</th>
                <th className="py-3 px-4 rounded-r-xl text-right">86 / In-Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 shrink-0">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px]">No Pic</div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{item.name}</div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                          <span>{item.is_veg === 1 ? '🌱 Veg' : '🍗 Non-Veg'}</span>
                          <span>•</span>
                          <span>~{item.prep_time_minutes} mins</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-200">{item.brand_name}</td>
                  <td className="py-3.5 px-4 text-gray-400">{item.category_name}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono text-[11px]">
                      {item.station}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-amber-400 font-mono">₹{item.base_price}</td>
                  <td className="py-3.5 px-4 text-orange-400 font-mono">₹{item.swiggy_price || item.base_price}</td>
                  <td className="py-3.5 px-4 text-rose-400 font-mono">₹{item.zomato_price || item.base_price}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleStock(item.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                        item.is_available === 1
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
                      }`}
                    >
                      {item.is_available === 1 ? 'In Stock' : '86ed (Out of Stock)'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Add New Menu Dish</h3>
            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Select Virtual Brand</label>
                <select
                  value={newItemBrand}
                  onChange={e => setNewItemBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white"
                >
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sourdough Burrata Pizza"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="399"
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Station</label>
                  <select
                    value={newItemStation}
                    onChange={e => setNewItemStation(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white"
                  >
                    <option value="Oven">Oven</option>
                    <option value="Grill">Grill</option>
                    <option value="Wok">Wok</option>
                    <option value="Fryer">Fryer</option>
                    <option value="Prep">Prep</option>
                    <option value="Assembly">Assembly</option>
                    <option value="Beverage">Beverage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">Diet Type</label>
                  <select
                    value={newItemVeg}
                    onChange={e => setNewItemVeg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white"
                  >
                    <option value={1}>Vegetarian</option>
                    <option value={0}>Non-Vegetarian</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={newItemPrepTime}
                    onChange={e => setNewItemPrepTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all"
                >
                  Save Item
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

