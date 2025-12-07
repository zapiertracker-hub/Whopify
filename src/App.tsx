import React, { useState, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Settings, Users, BarChart2, 
  HelpCircle, LogOut, Ghost, Globe, ShoppingBag, Box, Tag, Zap, Mail
} from 'lucide-react';
import { AppProvider, AppContext } from './AppContext';

// Components
import DashboardHome from './components/DashboardHome';
import StoreBuilder from './components/StoreBuilder';
import ProductManager from './components/ProductManager';
import SettingsPage from './components/SettingsPage';
import OrdersPage from './components/OrdersPage';
import CustomersPage from './components/CustomersPage';
import DiscountsPage from './components/DiscountsPage';
import AppsPage from './components/AppsPage';
import AnalyticsPage from './components/AnalyticsPage';
import CheckoutView from './components/CheckoutView';
import OrderConfirmation from './components/OrderConfirmation';
import HelpCenterPage from './components/HelpCenterPage';
import GhostLinkPage from './components/GhostLinkPage';
import GhostAnalyticsPage from './components/GhostAnalyticsPage';
import DomainsPage from './components/DomainsPage';
import EmailMarketingPage from './components/EmailMarketingPage';
import AffiliatesPage from './components/AffiliatesPage';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import PageTracker from './components/PageTracker';

const SidebarItem = ({ icon: Icon, label, path, active }: any) => {
  return (
    <Link to={path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm font-bold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}>
      <Icon size={20} className={`transition-colors ${active ? 'text-[#f97316]' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
      <span className="text-sm">{label}</span>
    </Link>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AppContext);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default true for demo

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  // If we are on login, landing or public checkout pages, don't show layout
  if (location.pathname === '/login' || location.pathname === '/' || location.pathname.startsWith('/p/') || location.pathname === '/order-confirmation') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#020202] transition-colors duration-300">
      <aside className="w-64 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-white/5 flex flex-col fixed inset-y-0 z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center text-white font-serif italic font-bold text-lg shadow-lg shadow-orange-500/20">W</div>
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Whopify</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1 py-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
          <SidebarItem icon={LayoutDashboard} label="Home" path="/dashboard" active={location.pathname === '/dashboard'} />
          <SidebarItem icon={ShoppingCart} label="Checkouts" path="/checkouts" active={location.pathname === '/checkouts'} />
          <SidebarItem icon={Box} label="Orders" path="/orders" active={location.pathname === '/orders'} />
          <SidebarItem icon={BarChart2} label="Analytics" path="/analytics" active={location.pathname === '/analytics'} />
          
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Marketing</div>
          <SidebarItem icon={Ghost} label="Ghost Links" path="/ghost-links" active={location.pathname === '/ghost-links'} />
          <SidebarItem icon={Tag} label="Coupons" path="/discounts" active={location.pathname === '/discounts'} />
          <SidebarItem icon={Mail} label="Emails" path="/emails" active={location.pathname === '/emails'} />
          <SidebarItem icon={Users} label="Affiliates" path="/affiliates" active={location.pathname === '/affiliates'} />
          
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Configuration</div>
          <SidebarItem icon={Zap} label="App Store" path="/apps" active={location.pathname === '/apps'} />
          <SidebarItem icon={Globe} label="Domains" path="/domains" active={location.pathname === '/domains'} />
          <SidebarItem icon={Settings} label="Settings" path="/settings" active={location.pathname === '/settings'} />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-white/5 space-y-2">
           <Link to="/help" className="flex items-center gap-3 px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">
              <HelpCircle size={18} /> Help Center
           </Link>
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-sm font-medium">
              <LogOut size={18} /> Sign Out
           </button>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/5">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xs">
                 {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                 <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                 <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
           </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 overflow-x-hidden min-h-screen">
         <div className="max-w-7xl mx-auto">
             {children}
         </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <PageTracker />
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/checkouts" element={<ProductManager />} />
            <Route path="/checkouts/:checkoutId" element={<StoreBuilder />} />
            
            {/* Public Checkout Routes */}
            <Route path="/p/:checkoutId" element={<CheckoutView />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />

            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/discounts" element={<DiscountsPage />} />
            <Route path="/apps" element={<AppsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/ghost-links" element={<GhostLinkPage />} />
            <Route path="/ghost-analytics" element={<GhostAnalyticsPage />} />
            <Route path="/domains" element={<DomainsPage />} />
            <Route path="/emails" element={<EmailMarketingPage />} />
            <Route path="/affiliates" element={<AffiliatesPage />} />
            
            {/* Redirects */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App;
