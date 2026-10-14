import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  DollarSign,
  TrendingDown,
  RefreshCw,
  Search,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { InventoryItem, MenuItem } from '../types';

export const InventoryBOM: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // BOM Explorer State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('');
  const [recipeIngredients, setRecipeIngredients] = useState<any[]>([]);
  const [estimatedFoodCost, setEstimatedFoodCost] = useState<number>(0);

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustItemId, setAdjustItemId] = useState('');
  const [adjustType, setAdjustType] = useState<'restock' | 'wastage'>('restock');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');

  const fetchInventory = async () => {
    try {
      const [invData, menuData] = await Promise.all([
        api.getInventory(lowStockFilter),
        api.getMenuItems()
      ]);
      setItems(invData.items);
      setMenuItems(menuData.items);
      if (menuData.items.length > 0 && !selectedMenuItem) {
        setSelectedMenuItem(menuData.items[0].id);
      }
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [lowStockFilter]);

  // Load recipe when selectedMenuItem changes
  useEffect(() => {
    if (!selectedMenuItem) return;
    async function loadRecipe() {
      try {
        const data = await api.getRecipe(selectedMenuItem);
        setRecipeIngredients(data.recipes);
        setEstimatedFoodCost(data.estimated_food_cost);
      } catch (e) {
        console.error('Failed to load recipe', e);
      }
    }
    loadRecipe();
  }, [selectedMenuItem]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItemId || !adjustQty) return;

    try {
      await api.adjustStock({
        inventory_item_id: adjustItemId,
        type: adjustType,
        quantity: Number(adjustQty),
        notes: adjustNotes
      });
      setIsAdjustModalOpen(false);
      setAdjustQty('');
      setAdjustNotes('');
      fetchInventory();
    } catch (err) {
      console.error('Failed to adjust stock', err);
    }
  };

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const selectedDish = menuItems.find(m => m.id === selectedMenuItem);
  const foodCostPercent = selectedDish && selectedDish.base_price > 0
    ? Math.round((estimatedFoodCost / selectedDish.base_price) * 1000) / 10
    : 0;

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Inventory & Recipe Bill of Materials (BOM)
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
              Auto-Deduction Active
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Raw materials stock counts, ingredient wastage tracking, and recipe portion costing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (items.length > 0) {
                setAdjustItemId(items[0].id);
                setAdjustType('restock');
                setIsAdjustModalOpen(true);
              }
            }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-all shadow-md text-xs flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4" />
            Stock Inward
          </button>
          <button
            onClick={() => {
              if (items.length > 0) {
                setAdjustItemId(items[0].id);
                setAdjustType('wastage');
                setIsAdjustModalOpen(true);
              }
            }}
            className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 font-bold rounded-xl transition-all text-xs flex items-center gap-1.5"
          >
            <TrendingDown className="w-4 h-4" />
            Log Wastage
          </button>
        </div>
      </div>

      {/* Row: Recipe BOM Explorer (Enterprise Feature) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 border border-gray-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Recipe Portion & Food Cost Analyzer</h3>
              <p className="text-xs text-gray-400">
                Inspect how many grams of raw materials are consumed when this dish is ordered.
              </p>
            </div>
          </div>

          {/* Dish Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Inspect Dish:</span>
            <select
              value={selectedMenuItem}
              onChange={e => setSelectedMenuItem(e.target.value)}
              className="px-3 py-1.5 bg-gray-950 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {menuItems.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (₹{m.base_price})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Costing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 text-xs space-y-1">
            <span className="text-gray-400">Selling Price:</span>
            <div className="text-xl font-black text-white">₹{selectedDish?.base_price || 0}</div>
          </div>
          <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 text-xs space-y-1">
            <span className="text-gray-400">Estimated Ingredient Cost (BOM):</span>
            <div className="text-xl font-black text-amber-400">₹{estimatedFoodCost}</div>
          </div>
          <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 text-xs space-y-1">
            <span className="text-gray-400">Target Food Cost %:</span>
            <div className={`text-xl font-black ${foodCostPercent < 30 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {foodCostPercent}% {foodCostPercent < 30 ? '(Excellent Margin)' : '(High Food Cost)'}
            </div>
          </div>
        </div>

        {/* Ingredients in this Recipe */}
        <div className="pt-2">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Ingredients Deducted Per Order
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {recipeIngredients.map(r => (
              <div key={r.id} className="p-3 rounded-xl bg-gray-950 border border-gray-800/80 text-xs">
                <div className="font-bold text-gray-200 line-clamp-1">{r.ingredient_name}</div>
                <div className="text-amber-400 font-mono text-[11px] mt-1">
                  Qty: {r.quantity_required} {r.unit}
                </div>
                <div className="text-gray-500 text-[10px]">
                  Unit Cost: ₹{r.cost_per_unit}/{r.unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Raw Materials Inventory Table */}
      <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLowStockFilter(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                !lowStockFilter ? 'bg-amber-500 text-black' : 'bg-gray-950 text-gray-400 border border-gray-800'
              }`}
            >
              All Inventory ({items.length})
            </button>
            <button
              onClick={() => setLowStockFilter(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                lowStockFilter ? 'bg-rose-500 text-white' : 'bg-gray-950 text-rose-400 border border-rose-500/30'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Low Stock Alerts
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ingredient, SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Material Name</th>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Min. Threshold</th>
                <th className="py-3 px-4">Unit Cost (₹)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80">
              {filteredItems.map(item => {
                const isLow = item.current_stock <= item.min_threshold;
                return (
                  <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{item.name}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-400">{item.sku}</td>
                    <td className="py-3.5 px-4 text-gray-300">{item.category}</td>
                    <td className="py-3.5 px-4 font-extrabold text-sm font-mono text-white">
                      {item.current_stock} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-400">
                      {item.min_threshold} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-400">₹{item.cost_per_unit}/{item.unit}</td>
                    <td className="py-3.5 px-4">
                      {isLow ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 w-max">
                          Adequate
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setAdjustItemId(item.id);
                          setAdjustType('restock');
                          setIsAdjustModalOpen(true);
                        }}
                        className="px-3 py-1 bg-gray-800 hover:bg-emerald-500 hover:text-black rounded-lg text-xs font-semibold transition-colors"
                      >
                        + Add Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Record Stock Adjustment</h3>
            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('restock')}
                    className={`py-2 rounded-xl font-bold transition-colors ${
                      adjustType === 'restock' ? 'bg-emerald-500 text-black' : 'bg-gray-950 text-gray-400 border border-gray-800'
                    }`}
                  >
                    Restock Inward
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('wastage')}
                    className={`py-2 rounded-xl font-bold transition-colors ${
                      adjustType === 'wastage' ? 'bg-rose-500 text-white' : 'bg-gray-950 text-gray-400 border border-gray-800'
                    }`}
                  >
                    Log Wastage
                  </button>
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Raw Material</label>
                <select
                  value={adjustItemId}
                  onChange={e => setAdjustItemId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white"
                >
                  {items.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Current: {i.current_stock} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 5.0"
                  value={adjustQty}
                  onChange={e => setAdjustQty(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Notes / Invoice Ref</label>
                <input
                  type="text"
                  placeholder="e.g. Vendor delivery invoice #889"
                  value={adjustNotes}
                  onChange={e => setAdjustNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all"
                >
                  Save Entry
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
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

