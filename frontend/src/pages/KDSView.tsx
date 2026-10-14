import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Clock,
  Check,
  CheckCircle,
  AlertTriangle,
  Flame,
  Volume2,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { playKdsBump, playOrderAlert } from '../services/sound';
import { getSocket } from '../services/socket';

interface KDSTicket {
  id: string;
  order_number: string;
  brand_id: string;
  brand_name: string;
  banner_color: string;
  channel: string;
  status: string;
  created_at: string;
  accepted_at?: string;
  special_instructions?: string;
  prep_time_minutes: number;
  items: Array<{
    id: string;
    item_name: string;
    quantity: number;
    station: string;
    status: 'pending' | 'cooking' | 'ready';
  }>;
}

export const KDSView: React.FC = () => {
  const [tickets, setTickets] = useState<KDSTicket[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  // Keep live elapsed time updated every second
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 2000);
    return () => clearInterval(timer);
  }, []);

  const fetchTickets = async () => {
    try {
      const { tickets: kdsTickets } = await api.getKdsTickets({ station: selectedStation });
      setTickets(kdsTickets);
    } catch (err) {
      console.error('Failed to load KDS tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    const socket = getSocket();
    const handleTicketChange = () => {
      fetchTickets();
    };

    socket.on('order:new', handleTicketChange);
    socket.on('order:updated', handleTicketChange);
    socket.on('kds:ticket_bumped', handleTicketChange);
    socket.on('kds:item_updated', handleTicketChange);

    return () => {
      socket.off('order:new', handleTicketChange);
      socket.off('order:updated', handleTicketChange);
      socket.off('kds:ticket_bumped', handleTicketChange);
      socket.off('kds:item_updated', handleTicketChange);
    };
  }, [selectedStation]);

  // Bump whole ticket
  const handleBump = async (orderId: string) => {
    try {
      playKdsBump();
      await api.bumpKdsTicket(orderId);
      setTickets(prev => prev.filter(t => t.id !== orderId));
    } catch (err) {
      console.error('Failed to bump ticket', err);
    }
  };

  // Toggle single item cooked
  const handleToggleItem = async (itemId: string) => {
    try {
      playKdsBump();
      await api.toggleKdsItem(itemId);
      setTickets(prev =>
        prev.map(t => ({
          ...t,
          items: t.items.map(i =>
            i.id === itemId
              ? { ...i, status: i.status === 'ready' ? 'cooking' : 'ready' }
              : i
          )
        }))
      );
    } catch (err) {
      console.error('Failed to toggle item', err);
    }
  };

  // Calculate elapsed time in minutes
  const getElapsedMinutes = (createdAt: string) => {
    const diffMs = now - new Date(createdAt).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  const stations = [
    { id: 'all', label: 'All Kitchen Stations' },
    { id: 'Oven', label: 'Oven & Pizza' },
    { id: 'Grill', label: 'Grill & Smoke' },
    { id: 'Wok', label: 'Wok & Asian' },
    { id: 'Fryer', label: 'Fryer & Sides' },
    { id: 'Assembly', label: 'Assembly & Dim Sum' },
    { id: 'Beverage', label: 'Beverages & Shakes' }
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-950">
      {/* KDS Header & Station Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-900 p-4 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              KITCHEN DISPLAY SYSTEM (KDS)
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                {tickets.length} Active Tickets
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              Live line tickets prioritized by wait time and station routing.
            </p>
          </div>
        </div>

        {/* Station Selectors */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {stations.map(st => (
            <button
              key={st.id}
              onClick={() => setSelectedStation(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStation === st.id
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Cards Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="h-80 flex flex-col items-center justify-center text-gray-500 space-y-3 bg-gray-900/40 rounded-2xl border border-gray-800">
          <CheckCircle className="w-12 h-12 text-emerald-500/50" />
          <h3 className="text-base font-bold text-gray-300">All Kitchen Orders Cleared!</h3>
          <p className="text-xs text-gray-500">
            No active tickets at this station. New incoming orders will pop up automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {tickets.map(ticket => {
            const elapsed = getElapsedMinutes(ticket.created_at);
            const isUrgent = elapsed >= 18;
            const isWarning = elapsed >= 10 && elapsed < 18;

            const cardBorder = isUrgent
              ? 'border-rose-500 shadow-xl shadow-rose-500/10 animate-urgent'
              : isWarning
              ? 'border-amber-500/60'
              : 'border-emerald-500/40';

            const timerBg = isUrgent
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
              : isWarning
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';

            const allItemsReady = ticket.items.every(i => i.status === 'ready');

            return (
              <div
                key={ticket.id}
                className={`p-5 rounded-2xl bg-gray-900 border-2 ${cardBorder} flex flex-col justify-between space-y-4 shadow-2xl transition-all`}
              >
                {/* Header */}
                <div className="space-y-2 pb-3 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-white tracking-tight">{ticket.order_number}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-800 text-gray-300 border border-gray-700">
                        {ticket.channel}
                      </span>
                    </div>

                    {/* Timer Badge */}
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${timerBg}`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{elapsed}m elapsed</span>
                    </div>
                  </div>

                  {/* Brand Tag */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: ticket.banner_color || '#F59E0B' }}
                    />
                    <span className="text-xs font-bold text-gray-300">{ticket.brand_name}</span>
                  </div>
                </div>

                {/* Items to Cook */}
                <div className="flex-1 space-y-2 py-1">
                  <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                    Dishes To Cook (Click to check off)
                  </p>
                  <div className="space-y-1.5">
                    {ticket.items.map(item => {
                      const isReady = item.status === 'ready';
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleItem(item.id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isReady
                              ? 'bg-emerald-950/30 border-emerald-500/30 text-gray-400 line-through'
                              : 'bg-gray-950 border-gray-800 text-white hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                              {item.quantity}x
                            </span>
                            <span className="text-xs font-bold truncate">{item.item_name}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">
                              {item.station}
                            </span>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                              isReady ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-gray-700 text-transparent'
                            }`}>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {ticket.special_instructions && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 font-medium">
                      ⚠️ Note: "{ticket.special_instructions}"
                    </div>
                  )}
                </div>

                {/* Bump Ticket Action */}
                <div className="pt-3 border-t border-gray-800">
                  <button
                    onClick={() => handleBump(ticket.id)}
                    className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 ${
                      allItemsReady
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                        : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{allItemsReady ? 'Ready! Bump Ticket' : 'Bump Order Ready'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

