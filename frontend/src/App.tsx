import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ReceiptModal } from './components/ReceiptModal';
import { LoginModal } from './components/LoginModal';
import { Dashboard } from './pages/Dashboard';
import { POSBilling } from './pages/POSBilling';
import { LiveOrders } from './pages/LiveOrders';
import { KDSView } from './pages/KDSView';
import { MenuBrands } from './pages/MenuBrands';
import { InventoryBOM } from './pages/InventoryBOM';
import { DeliveryDispatch } from './pages/DeliveryDispatch';
import { CustomersCRM } from './pages/CustomersCRM';
import { AnalyticsReports } from './pages/AnalyticsReports';
import { api } from './services/api';
import { getSocket } from './services/socket';
import { Order } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('pepito_staff_user');
    return saved ? JSON.parse(saved) : {
      name: 'Marcus Vance',
      email: 'admin@pepito.kitchen',
      role: 'admin'
    };
  });
  const [brandCount, setBrandCount] = useState(4);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [kdsTicketsCount, setKdsTicketsCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  const refreshBadges = async () => {
    try {
      const [stats, kds, brands] = await Promise.all([
        api.getDashboardStats(),
        api.getKdsTickets(),
        api.getBrands()
      ]);
      setActiveOrdersCount(stats.today.active_orders);
      setLowStockCount(stats.low_stock_count);
      setKdsTicketsCount(kds.tickets.length);
      setBrandCount(brands.brands.length);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    refreshBadges();
    const interval = setInterval(refreshBadges, 10000);

    const socket = getSocket();
    const handleEvent = () => refreshBadges();
    socket.on('order:new', handleEvent);
    socket.on('order:updated', handleEvent);
    socket.on('kds:ticket_bumped', handleEvent);

    return () => {
      clearInterval(interval);
      socket.off('order:new', handleEvent);
      socket.off('order:updated', handleEvent);
      socket.off('kds:ticket_bumped', handleEvent);
    };
  }, []);

  const handleOrderCreated = (order: Order) => {
    setSelectedReceiptOrder(order);
    refreshBadges();
  };

  const handleLoginSuccess = (user: any, token: string, defaultTab?: string) => {
    setCurrentUser(user);
    localStorage.setItem('pepito_staff_user', JSON.stringify(user));
    localStorage.setItem('pepito_auth_token', token);
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-950 font-sans text-gray-100">
      {/* Top Universal Navbar */}
      <Navbar
        onOrderSimulated={refreshBadges}
        brandCount={brandCount}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main Workspace with Sidebar and View Area */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeOrdersCount={activeOrdersCount}
          kdsTicketsCount={kdsTicketsCount}
          lowStockCount={lowStockCount}
        />

        <main className="flex-1 flex flex-col overflow-hidden bg-gray-950">
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigate={setActiveTab}
              onSelectOrder={setSelectedReceiptOrder}
            />
          )}
          {activeTab === 'pos' && (
            <POSBilling onOrderCreated={handleOrderCreated} />
          )}
          {activeTab === 'orders' && (
            <LiveOrders onSelectReceipt={setSelectedReceiptOrder} />
          )}
          {activeTab === 'kds' && (
            <KDSView />
          )}
          {activeTab === 'menu' && (
            <MenuBrands />
          )}
          {activeTab === 'inventory' && (
            <InventoryBOM />
          )}
          {activeTab === 'delivery' && (
            <DeliveryDispatch />
          )}
          {activeTab === 'customers' && (
            <CustomersCRM />
          )}
          {activeTab === 'reports' && (
            <AnalyticsReports />
          )}
        </main>
      </div>

      {/* 80mm Thermal Receipt & Tax Invoice Modal */}
      <ReceiptModal
        order={selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
      />

      {/* Staff Login & Role Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}

export default App;

