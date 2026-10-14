import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Award,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import { api } from '../services/api';
import { Customer } from '../types';

export const CustomersCRM: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const data = await api.getCustomers(search);
      setCustomers(data.customers);
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Customer Relationship Management (CRM)
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
              {customers.length} Registered Patrons
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Track customer order history, lifetime value, delivery addresses, and dietary preferences.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer phone, name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {customers.map(c => (
          <div key={c.id} className="p-5 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col justify-between space-y-4 hover:border-gray-700 transition-all shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-white tracking-tight">{c.name}</h3>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Award className="w-3.5 h-3.5" />
                  {c.loyalty_points} Pts
                </span>
              </div>

              <div className="text-xs text-gray-400 space-y-1 font-mono">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-500" />
                  <span>{c.phone}</span>
                </div>
                {c.email && (
                  <div className="flex items-center gap-2 font-sans text-gray-400">
                    <Mail className="w-3.5 h-3.5 text-gray-500" />
                    <span>{c.email}</span>
                  </div>
                )}
              </div>

              {c.address && (
                <div className="p-2.5 rounded-xl bg-gray-950 border border-gray-800/80 text-xs text-gray-300 flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{c.address}, {c.city}</span>
                </div>
              )}

              {c.notes && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                  Note: "{c.notes}"
                </div>
              )}
            </div>

            {/* Lifetime metrics */}
            <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-gray-400">
                <ShoppingBag className="w-4 h-4 text-gray-500" />
                <span>{c.total_orders} Orders</span>
              </div>
              <div className="font-extrabold text-white text-sm font-mono">
                ₹{c.total_spent.toLocaleString()} spent
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

