import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Clock,
  MapPin,
  Phone,
  User,
  Printer,
  ChevronRight,
  CheckCircle,
  Truck,
  Flame,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { playOrderAlert, playKdsBump } from '../services/sound';
import { getSocket } from '../services/socket';
import { Order, OrderStatus } from '../types';

interface LiveOrdersProps {
  onSelectReceipt: (order: Order) => void;
}

export const LiveOrders: React.FC<LiveOrdersProps> = ({ onSelectReceipt }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { orders: orderList } = await api.getOrders({
        status: statusFilter,
        channel: channelFilter,
        search
      });
      setOrders(orderList);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Listen for WebSocket live order updates
    const socket = getSocket();
    const handleNewOrder = (data: { order: Order; sound?: boolean }) => {
      if (data.sound) playOrderAlert();
      fetchOrders();
    };

    const handleUpdateOrder = () => {
      fetchOrders();
    };

    socket.on('order:new', handleNewOrder);
    socket.on('order:updated', handleUpdateOrder);

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('order:updated', handleUpdateOrder);
    };
  }, [statusFilter, channelFilter, search]);

  // Status transitions
  const handleNextStatus = async (order: Order) => {
    let nextStatus: OrderStatus = 'accepted';
    if (order.status === 'pending') nextStatus = 'accepted';
    else if (order.status === 'accepted') nextStatus = 'preparing';
    else if (order.status === 'preparing') nextStatus = 'ready';
    else if (order.status === 'ready') nextStatus = 'dispatched';
    else if (order.status === 'dispatched') nextStatus = 'delivered';

    try {
      playKdsBump();
      await api.updateOrderStatus(order.id, nextStatus);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const channelBadges: Record<string, { bg: string; text: string }> = {
    swiggy: { bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400', text: 'Swiggy' },
    zomato: { bg: 'bg-red-500/10 border-red-500/30 text-red-400', text: 'Zomato' },
    ubereats: { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', text: 'UberEats' },
    direct_pos: { bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400', text: 'Direct POS' },
    takeaway: { bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400', text: 'Takeaway' }
  };

  const statusConfigs: Record<string, { label: string; badge: string; nextLabel?: string }> = {
    pending: { label: 'Pending Acceptance', badge: 'bg-amber-400/10 border-amber-400/30 text-amber-400', nextLabel: 'Accept Order' },
    accepted: { label: 'Accepted', badge: 'bg-blue-400/10 border-blue-400/30 text-blue-400', nextLabel: 'Send to KDS Cook' },
    preparing: { label: 'In Kitchen Cooking', badge: 'bg-orange-400/10 border-orange-400/30 text-orange-400', nextLabel: 'Mark Order Ready' },
    ready: { label: 'Ready for Dispatch', badge: 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400', nextLabel: 'Dispatch to Rider' },
    dispatched: { label: 'Out for Delivery', badge: 'bg-purple-400/10 border-purple-400/30 text-purple-400', nextLabel: 'Mark Delivered' },
    delivered: { label: 'Completed', badge: 'bg-gray-800 text-gray-400 border-gray-700' }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Top Filter and Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-900/90 p-4 rounded-2xl border border-gray-800">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'active', label: 'Active Pipeline' },
            { id: 'pending', label: 'Pending' },
            { id: 'preparing', label: 'In Kitchen' },
            { id: 'ready', label: 'Ready' },
            { id: 'dispatched', label: 'Out for Delivery' },
            { id: 'delivered', label: 'Delivered' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                  : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Channel and Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={channelFilter}
            onChange={e => setChannelFilter(e.target.value)}
            className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Channels</option>
            <option value="swiggy">Swiggy</option>
            <option value="zomato">Zomato</option>
            <option value="ubereats">UberEats</option>
            <option value="direct_pos">Direct POS</option>
            <option value="takeaway">Takeaway</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search order #, customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-500 space-y-3 bg-gray-900/50 rounded-2xl border border-gray-800">
          <AlertCircle className="w-8 h-8 text-gray-600" />
          <p className="text-sm">No orders matching current filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map(order => {
            const ch = channelBadges[order.channel] || { bg: 'bg-gray-800 text-gray-200', text: order.channel };
            const statusConfig = statusConfigs[order.status] || { label: order.status, badge: 'bg-gray-800' };

            return (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-gray-900/90 border border-gray-800 flex flex-col justify-between hover:border-gray-700 transition-all shadow-xl space-y-4"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-white tracking-tight">{order.order_number}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${ch.bg}`}>
                        {ch.text}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.badge}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-medium text-amber-400">{order.brand_name}</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-3 bg-gray-950/70 rounded-xl border border-gray-800/80 text-xs space-y-1 text-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {order.customer_name}
                    </span>
                    <span className="text-gray-400 font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {order.customer_phone}
                    </span>
                  </div>
                  {order.delivery_address && (
                    <div className="text-[11px] text-gray-400 flex items-start gap-1 pt-1 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                      <span>{order.delivery_address}</span>
                    </div>
                  )}
                  {order.special_instructions && (
                    <div className="text-[11px] text-amber-300/90 italic pt-1 border-t border-gray-800/80">
                      Note: "{order.special_instructions}"
                    </div>
                  )}
                </div>

                {/* Ordered Items List */}
                <div className="space-y-1.5 text-xs">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Dishes to Prepare ({order.items?.length || 0})
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-gray-300 text-xs py-0.5">
                        <span className="font-medium text-white">
                          <span className="text-amber-400 font-bold mr-1.5">{item.quantity}x</span>
                          {item.item_name}
                        </span>
                        <span className="text-gray-400 font-mono">₹{item.total_price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer with Financial Total and Action Buttons */}
                <div className="pt-3 border-t border-gray-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-bold">Total Bill</span>
                    <span className="font-black text-base text-amber-400 font-mono">₹{order.total_amount.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectReceipt(order)}
                      className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition-colors"
                      title="View & Print 80mm Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {statusConfig.nextLabel && (
                      <button
                        onClick={() => handleNextStatus(order)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-extrabold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                      >
                        <span>{statusConfig.nextLabel}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

