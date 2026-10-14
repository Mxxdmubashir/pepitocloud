import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  Shield,
  ChefHat,
  Receipt,
  Bike,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onLoginSuccess: (user: any, token: string, defaultTab?: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string, targetTab?: string) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPassword = customPassword || password;

    if (!loginEmail || !loginPassword) {
      setError('Please provide email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await api.login(loginEmail, loginPassword);
      if (data.error) {
        setError(data.error);
        return;
      }

      onLoginSuccess(data.user, data.token, targetTab);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const quickStaffAccounts = [
    {
      role: 'Super Admin / Owner',
      name: 'Marcus Vance',
      email: 'admin@pepito.kitchen',
      pass: 'admin123',
      defaultTab: 'dashboard',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400',
      icon: Shield,
      desc: 'Full system control, financials & brand config'
    },
    {
      role: 'Head Chef / Kitchen Mgr',
      name: 'Chef Antonio Rossi',
      email: 'chef@pepito.kitchen',
      pass: 'chef123',
      defaultTab: 'kds',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
      icon: ChefHat,
      desc: 'Opens directly to KDS & Recipe inventory'
    },
    {
      role: 'Cashier / Front Desk',
      name: 'Priya Sharma',
      email: 'cashier@pepito.kitchen',
      pass: 'cashier123',
      defaultTab: 'pos',
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/40 text-blue-400',
      icon: Receipt,
      desc: 'Opens directly to POS Billing & Live Orders'
    },
    {
      role: 'Delivery Fleet Driver',
      name: 'Rahul Kumar',
      email: 'rider@pepito.kitchen',
      pass: 'rider123',
      defaultTab: 'delivery',
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/40 text-purple-400',
      icon: Bike,
      desc: 'Opens directly to Order Dispatch & Hand-off'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-gray-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Staff Authentication & Role Switcher</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Sign In / Switch Active Staff Profile
          </h2>
          <p className="text-xs text-gray-400">
            Log in with credentials or click a pre-configured profile below for 1-click role testing.
          </p>
        </div>

        {/* Currently Active Profile Indicator */}
        {currentUser && (
          <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="text-gray-400">Currently logged in as:</span>
                <span className="font-bold text-white ml-1.5">{currentUser.name}</span>
                <span className="text-[10px] ml-2 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-mono uppercase">
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 1-Click Quick Role Switcher Buttons */}
        <div className="space-y-2">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block">
            ⚡ Quick 1-Click Staff Profiles:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {quickStaffAccounts.map(acc => {
              const Icon = acc.icon;
              const isCurrent = currentUser?.email === acc.email;

              return (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleLogin(undefined, acc.email, acc.pass, acc.defaultTab)}
                  className={`p-3 rounded-2xl border bg-gradient-to-br transition-all text-left flex flex-col justify-between hover:scale-[1.02] active:scale-[0.98] ${acc.color} ${
                    isCurrent ? 'ring-2 ring-amber-400 shadow-lg' : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide">
                      {acc.role}
                    </span>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{acc.name}</h4>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{acc.email}</p>
                    <p className="text-[10px] text-gray-300 mt-1 line-clamp-1">{acc.desc}</p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-gray-400">Pass: {acc.pass}</span>
                    <span className="font-bold underline">Login ➔</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Manual Credentials Form */}
        <div className="pt-2 border-t border-gray-800">
          <form onSubmit={e => handleLogin(e)} className="space-y-3 text-xs">
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-gray-400 block mb-1">Staff Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="e.g. chef@pepito.kitchen"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In with Email & Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

