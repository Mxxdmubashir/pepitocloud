import React, { useState, useEffect } from 'react';
import { ChefHat, Volume2, VolumeX, Sparkles, Wifi, Clock, Store } from 'lucide-react';
import { api } from '../services/api';
import { playOrderAlert } from '../services/sound';

interface NavbarProps {
  onOrderSimulated?: () => void;
  brandCount: number;
  currentUser?: any;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOrderSimulated, brandCount, currentUser, onOpenLogin }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSimulate = async () => {
    try {
      setIsSimulating(true);
      if (soundEnabled) {
        playOrderAlert();
      }
      await api.simulateOrder();
      if (onOrderSimulated) onOrderSimulated();
    } catch (e) {
      console.error('Simulation failed', e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <header className="h-16 bg-gray-900/90 border-b border-gray-800 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left Branding */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <ChefHat className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                PEPITO <span className="text-amber-400 font-medium text-xs px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">CLOUD KITCHEN</span>
              </h1>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <span>Central Kitchen Hub 01 (Indiranagar)</span>
              <span className="text-gray-600">•</span>
              <span className="text-amber-400/90 font-medium">{brandCount} Virtual Brands Active</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Realtime Gateway Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Wifi className="w-3.5 h-3.5" />
          <span>Realtime Sync</span>
        </div>

        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-300 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span>{time}</span>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-xl border transition-colors ${
            soundEnabled
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
          }`}
          title={soundEnabled ? 'Kitchen Sound Alerts Active' : 'Sound Alerts Muted'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Simulate Aggregator Incoming Order Button */}
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
          title="Simulate incoming order from Swiggy, Zomato, or UberEats to test live kitchen workflow"
        >
          <Sparkles className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Simulate Order (Swiggy/Zomato)</span>
          <span className="sm:hidden">Simulate</span>
        </button>
        {/* Staff Profile & Switch Role Button */}
        <button
          onClick={onOpenLogin}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-800/90 hover:bg-gray-800 border border-gray-700 hover:border-amber-500/50 transition-all text-left"
          title="Click to Switch Staff Role or Sign In"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-extrabold text-xs flex items-center justify-center">
            {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
          </div>
          <div className="hidden lg:block text-xs">
            <div className="font-bold text-white leading-tight flex items-center gap-1.5">
              <span>{currentUser?.name || 'Staff User'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono uppercase font-semibold">
                {currentUser?.role || 'Admin'}
              </span>
            </div>
            <div className="text-[10px] text-gray-400">Click to switch role</div>
          </div>
        </button>
      </div>
    </header>
  );
};

