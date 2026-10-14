import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  ShoppingBag,
  UtensilsCrossed,
  Layers,
  Boxes,
  Bike,
  Users,
  BarChart3,
  Flame,
  AlertCircle
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeOrdersCount?: number;
  kdsTicketsCount?: number;
  lowStockCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeOrdersCount = 0,
  kdsTicketsCount = 0,
  lowStockCount = 0
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'POS & Billing', icon: Receipt, highlight: true },
    { id: 'orders', label: 'Live Orders Hub', icon: ShoppingBag, badge: activeOrdersCount > 0 ? activeOrdersCount : undefined, badgeColor: 'bg-rose-500' },
    { id: 'kds', label: 'Kitchen Display (KDS)', icon: UtensilsCrossed, badge: kdsTicketsCount > 0 ? kdsTicketsCount : undefined, badgeColor: 'bg-amber-500 text-black' },
    { id: 'menu', label: 'Brands & Menus', icon: Layers },
    { id: 'inventory', label: 'Inventory & BOM', icon: Boxes, badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined, badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
    { id: 'delivery', label: 'Delivery Dispatch', icon: Bike },
    { id: 'customers', label: 'Customers CRM', icon: Users },
    { id: 'reports', label: 'Analytics & Z-Report', icon: BarChart3 }
  ];

  return (
    <aside className="w-64 bg-gray-950/90 border-r border-gray-800 flex flex-col justify-between p-4 select-none shrink-0">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Operations & Control
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20'
                    : 'text-gray-300 hover:text-white hover:bg-gray-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : item.highlight ? 'text-amber-400' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-black text-amber-400' : item.badgeColor || 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cloud Kitchen Info Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/80 text-xs space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-semibold">
          <Flame className="w-4 h-4" />
          <span>Multi-Brand Engine</span>
        </div>
        <p className="text-gray-400 text-[11px] leading-relaxed">
          Aggregating Zomato, Swiggy, UberEats, and Direct POS orders into unified stations.
        </p>
        <div className="pt-1 text-[10px] text-gray-500 flex items-center justify-between border-t border-gray-800">
          <span>v1.0.0 Enterprise</span>
          <span className="text-emerald-400 font-mono">SQLite-WAL</span>
        </div>
      </div>
    </aside>
  );
};

