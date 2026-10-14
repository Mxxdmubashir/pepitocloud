import React, { useState, useEffect } from 'react';
import {
  Bike,
  Plus,
  Phone,
  CheckCircle,
  Truck,
  MapPin,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { DeliveryRider, Order } from '../types';

export const DeliveryDispatch: React.FC = () => {
  const [riders, setRiders] = useState<DeliveryRider[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // New Rider Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [riderName, setRiderName] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('Bike');
  const [vehicleNumber, setVehicleNumber] = useState('');

  const loadData = async () => {
    try {
      const [ridersData, ordersData] = await Promise.all([
        api.getRiders(),
        api.getOrders({ status: 'ready' })
      ]);
      setRiders(ridersData.riders);
      setReadyOrders(ordersData.orders);
    } catch (err) {
      console.error('Failed to load dispatch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignRider = async (orderId: string, riderId: string) => {
    if (!riderId) return;
    try {
      await api.assignRider(orderId, riderId);
      loadData();
    } catch (err) {
      console.error('Failed to assign rider', err);
    }
  };

  const handleCreateRider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riderName || !riderPhone) return;

    try {
      await api.createRider({
        name: riderName,
        phone: riderPhone,
        vehicle_type: vehicleType,
        vehicle_number: vehicleNumber
      });
      setIsModalOpen(false);
      setRiderName('');
      setRiderPhone('');
      setVehicleNumber('');
      loadData();
    } catch (err) {
      console.error('Failed to create rider', err);
    }
  };

  const handleToggleRiderStatus = async (riderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'available' ? 'offline' : 'available';
    try {
      await api.updateRiderStatus(riderId, nextStatus);
      loadData();
    } catch (err) {
      console.error('Failed to toggle rider status', err);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Delivery Fleet & Order Dispatch
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
              {riders.filter(r => r.status === 'available').length} Drivers Available
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Assign internal kitchen delivery boys or monitor aggregator rider handoffs.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all shadow-md text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Delivery Driver
        </button>
      </div>

      {/* Row: Orders Ready for Pickup (Dispatched queue) */}
      <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">
              Orders Packed & Waiting for Driver Pickup ({readyOrders.length})
            </h3>
          </div>
        </div>

        {readyOrders.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-gray-500 space-y-1">
            <CheckCircle className="w-8 h-8 text-emerald-500/40" />
            <p className="text-xs">No pending orders awaiting dispatch.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyOrders.map(order => (
              <div key={order.id} className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{order.order_number}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Ready
                  </span>
                </div>

                <div className="text-xs text-gray-400 space-y-1">
                  <div>Brand: <span className="text-white font-medium">{order.brand_name}</span></div>
                  <div>Customer: <span className="text-white">{order.customer_name} ({order.customer_phone})</span></div>
                  <div className="truncate">Destination: <span className="text-gray-300">{order.delivery_address}</span></div>
                </div>

                {/* Driver Assigner */}
                <div className="pt-2 border-t border-gray-800 flex items-center gap-2">
                  <select
                    defaultValue=""
                    onChange={e => handleAssignRider(order.id, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="" disabled>Assign Driver...</option>
                    {riders.map(r => (
                      <option key={r.id} value={r.id} disabled={r.status !== 'available'}>
                        {r.name} ({r.vehicle_type}) - {r.status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fleet Drivers Roster */}
      <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
        <h3 className="font-bold text-sm text-white">Delivery Fleet Roster</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {riders.map(rider => {
            const isAvailable = rider.status === 'available';
            const isDelivering = rider.status === 'delivering';

            return (
              <div key={rider.id} className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Bike className="w-4 h-4" />
                  </div>
                  <button
                    onClick={() => handleToggleRiderStatus(rider.id, rider.status)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                      isAvailable
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : isDelivering
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}
                  >
                    {rider.status.toUpperCase()}
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-white">{rider.name}</h4>
                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 font-mono">
                    <Phone className="w-3 h-3 text-gray-500" />
                    <span>{rider.phone}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    {rider.vehicle_type} • {rider.vehicle_number || 'No plate'}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400 font-mono">
                  <span>Current: {rider.current_orders_count}</span>
                  <span className="text-amber-400 font-bold">{rider.total_deliveries} Delivered</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Rider Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Register New Driver</h3>
            <form onSubmit={handleCreateRider} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Rider Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh V."
                  value={riderName}
                  onChange={e => setRiderName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98450 12345"
                  value={riderPhone}
                  onChange={e => setRiderPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={e => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white"
                  >
                    <option value="Bike">Bike</option>
                    <option value="Electric Scooter">Electric Scooter</option>
                    <option value="Bicycle">Bicycle</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Vehicle Plate #</label>
                  <input
                    type="text"
                    placeholder="KA-01-AB-1234"
                    value={vehicleNumber}
                    onChange={e => setVehicleNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all"
                >
                  Save Driver
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

