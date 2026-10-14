import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Clock,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  Store,
  ChevronRight,
  CheckCircle2,
  Package
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, Order } from '../types';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onSelectOrder?: (order: Order) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectOrder }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statsData, ordersData] = await Promise.all([
        api.getDashboardStats(),
        api.getOrders({ limit: 6 })
      ]);
      setStats(statsData);
      setRecentOrders(ordersData.orders.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center text-gray-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Cloud Kitchen Operations Hub...</span>
        </div>
      </div>
    );
  }

  const channelBadges: Record<string, { bg: string; text: string }> = {
    swiggy: { bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400', text: 'Swiggy' },
    zomato: { bg: 'bg-red-500/10 border-red-500/30 text-red-400', text: 'Zomato' },
    ubereats: { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', text: 'UberEats' },
    direct_pos: { bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400', text: 'Direct POS' },
    takeaway: { bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400', text: 'Takeaway' }
  };

  const statusColors: Record<string, string> = {
    pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    accepted: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    preparing: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    ready: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    dispatched: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    delivered: 'text-gray-400 bg-gray-400/10 border-gray-400/20'
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 p-6 rounded-2xl border border-gray-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Operations Command Center
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">Live</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Real-time multi-brand kitchen metrics, live aggregator pipeline & order throughput.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('pos')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            New POS Bill
          </button>
          <button
            onClick={() => onNavigate('kds')}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl border border-gray-700 transition-all flex items-center gap-2 text-sm"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            Kitchen Display
          </button>
        </div>
      </div>

      {/* 4 Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-gray-900/90 border border-gray-800 relative overflow-hidden group hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            ₹{(stats?.today.revenue || 0).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs yesterday</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-gray-900/90 border border-gray-800 relative overflow-hidden group hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {stats?.today.orders || 0} Orders
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Across 4 virtual brands
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-gray-900/90 border border-gray-800 relative overflow-hidden group hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Order Value</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            ₹{stats?.today.avg_ticket || 0}
          </div>
          <div className="mt-2 text-xs text-purple-400">
            Healthy basket size
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-gray-900/90 border border-gray-800 relative overflow-hidden group hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active in Kitchen</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 tracking-tight">
            {stats?.today.active_orders || 0} Orders
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Avg prep time: <span className="text-white font-medium">13.5 mins</span>
          </div>
        </div>
      </div>

      {/* Row: Virtual Brands Performance & Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Virtual Brands Breakdown (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-white">Virtual Brand Revenue Share</h3>
            </div>
            <button
              onClick={() => onNavigate('menu')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              Manage Brands <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {stats?.brand_sales.map((brand) => {
              const maxRev = Math.max(...(stats.brand_sales.map(b => b.revenue) || [1]));
              const percent = maxRev > 0 ? (brand.revenue / maxRev) * 100 : 0;
              return (
                <div key={brand.brand_id} className="p-3.5 rounded-xl bg-gray-950/60 border border-gray-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: brand.banner_color || '#F59E0B' }}
                      />
                      <span className="font-semibold text-sm text-gray-200">{brand.brand_name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-white">₹{brand.revenue.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 ml-2">({brand.order_count} orders)</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: brand.banner_color || '#F59E0B'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Channel Breakdown (1 Col) */}
        <div className="p-6 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-base text-white">Channel Aggregation</h3>
          </div>

          <div className="space-y-3 pt-2">
            {stats?.channel_breakdown.map((ch) => {
              const badge = channelBadges[ch.channel] || { bg: 'bg-gray-800 text-gray-200', text: ch.channel };
              return (
                <div key={ch.channel} className="flex items-center justify-between p-3 rounded-xl bg-gray-950/60 border border-gray-800/80">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${badge.bg}`}>
                    {badge.text}
                  </span>
                  <div className="text-right">
                    <div className="font-bold text-sm text-white">{ch.order_count} orders</div>
                    <div className="text-[11px] text-gray-400">₹{ch.total_sales.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Low Stock Callout */}
          {stats && stats.low_stock_count > 0 && (
            <div
              onClick={() => onNavigate('inventory')}
              className="cursor-pointer mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 hover:bg-amber-500/20 transition-colors"
            >
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-400">{stats.low_stock_count} Raw Materials</span>
                <p className="text-gray-300">Below minimum threshold. Reorder needed.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row: Recent Live Orders Stream & Top Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Orders Stream (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base text-white">Live Kitchen Orders Stream</h3>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              View All Orders ({recentOrders.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-800/80">
            {recentOrders.map((order) => {
              const ch = channelBadges[order.channel] || { bg: 'bg-gray-800 text-gray-200', text: order.channel };
              const stClass = statusColors[order.status] || 'text-gray-400 bg-gray-800';

              return (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder ? onSelectOrder(order) : onNavigate('orders')}
                  className="py-3.5 flex items-center justify-between hover:bg-gray-800/30 px-3 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{order.order_number}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${ch.bg}`}>
                          {ch.text}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {order.brand_name} • {order.customer_name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${stClass}`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-sm text-white">
                      ₹{order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Dishes (1 Col) */}
        <div className="p-6 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Top Selling Dishes</h3>
          </div>

          <div className="space-y-3 pt-2">
            {stats?.top_items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-950/60 border border-gray-800/80">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-200 line-clamp-1">{item.item_name}</h4>
                    <span className="text-[11px] text-gray-400">{item.total_quantity} portions sold</span>
                  </div>
                </div>
                <div className="font-bold text-xs text-amber-400">
                  ₹{item.total_sales.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
