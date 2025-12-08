

import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  BarChart2,
  ShoppingBag,
  ShoppingCart,
  Users,
  ChevronDown,
  HelpCircle,
  User,
  CreditCard,
  Sparkles,
  Rocket,
  Store,
  Ghost,
  PieChart,
  FlaskConical,
  Search,
  Sun,
  Moon,
  Bell,
  Timer,
  ArrowRight,
  Check,
  Grid,
  Tags,
  Puzzle,
  FileText,
  Megaphone,
  Code
} from 'lucide-react';
import DashboardHome from './components/DashboardHome';
import AnalyticsPage from './components/AnalyticsPage';
import StoreBuilder from './components/StoreBuilder';
import ProductManager from './components/ProductManager';
import SettingsPage from './components/SettingsPage';
import OrdersPage from './components/OrdersPage';
import CustomersPage from './components/CustomersPage';
import CheckoutView from './components/CheckoutView';
import OrderConfirmation from './components/OrderConfirmation';
import PageTracker from './components/PageTracker'; 
import HelpCenterPage from './components/HelpCenterPage';
import GhostLinkPage from './components/GhostLinkPage'; 
import InvoicesPage from './components/InvoicesPage';
import AppsPage from './components/AppsPage';
import DiscountsPage from './components/DiscountsPage';
import AffiliatesPage from './components/AffiliatesPage';
import DevelopersPage from './components/DevelopersPage';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import { AppContext, UserProfile } from './AppContext'; 

import { Language, CheckoutPage, StoreSettings, Theme, Coupon } from './types';

// Detect API URL: if production (hosted), use relative path. If local, use localhost:3000
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

// Initial Mock Data
const initialCheckouts: CheckoutPage[] = [];

const defaultSettings: StoreSettings = {
  storeName: 'Demo Store',
  supportEmail: 'support@example.com',
  currency: 'USD',
  timezone: '(GMT-05:00) New York',
  
  stripeEnabled: false,
  paypalEnabled: false,
  cryptoEnabled: false,
  cashAppEnabled: false,
  bankTransferEnabled: false,

  stripeTestMode: true,
  stripePublishableKey: '',
  stripeSecretKey: '',
  stripeSigningSecret: '',

  manualPaymentEnabled: false,
  manualPaymentLabel: 'Manual Payment',
  manualPaymentInstructions: '',

  bankTransferDetails: '',
  bankTransferInstructions: '',
  
  cryptoWalletAddress: '',
  cryptoOptions: ['BTC', 'ETH', 'USDT'],

  // Customer Portal Defaults
  portalAllowCancellation: true,
  portalAllowPlanChange: false,
  portalAllowPaymentUpdate: true,
  portalShowHistory: true,

  taxEnabled: false,
  taxRate: 0,
  taxName: 'Tax',

  // Integrations Defaults
  crispEnabled: false,
  crispWebsiteId: '',
  whatsappEnabled: false,
  whatsappNumber: '',
  
  // Google Sheets Integration
  googleSheetsEnabled: false,
  googleSheetsUrl: '',

  // Security Defaults
  twoFactorEnabled: false
};

const defaultCoupons: Coupon[] = [];

interface LayoutProps {
  children?: ReactNode;
  onLogout?: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: any;
  disabled?: boolean;
  badge?: boolean | string;
}

interface NavGroup {
  title: string | null;
  items: NavItem[];
}

const Layout = ({ children, onLogout }: LayoutProps) => {
  const { isRTL, theme, setTheme, checkouts, user } = React.useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Profile Dropdown State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Notifications State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Welcome to Whopify', message: 'Set up your first checkout to get started.', time: 'Just now', read: false, type: 'info' }
  ]);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id: number) => {
     setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
     setIsNotificationsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === '/' && !isSearchFocused && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault();
            searchInputRef.current?.focus();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused]);

  const filteredCheckouts = searchQuery.trim() 
    ? checkouts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3) 
    : [];

  const handleSearchNavigation = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleProfileNavigation = (path: string) => {
    navigate(path);
    setIsProfileOpen(false);
  };

  // Navigation Structure
  const navGroups: NavGroup[] = [
    {
      title: null,
      items: [
        { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
        { path: '/analytics', label: 'Analytics', icon: BarChart2 },
      ]
    },
    {
      title: 'Store',
      items: [
        { path: '/checkouts', label: 'Checkouts', icon: ShoppingBag }, 
        { path: '/orders', label: 'Orders', icon: ShoppingCart },
        { path: '/customers', label: 'Customers', icon: Users, badge: true },
        { path: '/coupons', label: 'Coupons', icon: Tags },
        { path: '/abandoned', label: 'Abandoned', icon: Timer, disabled: true, badge: 'Soon' },
      ]
    },
    {
      title: 'Tools',
      items: [
        { path: '/tools/ghost-links', label: 'Ghost Links', icon: Ghost },
        { path: '/tools/invoices', label: 'Invoices', icon: FileText },
        { path: '/affiliates', label: 'Affiliates', icon: Megaphone },
        { path: '/developers', label: 'Developers', icon: Code },
      ]
    },
    {
      title: 'Support',
      items: [
        { path: '/help', label: 'Help Center', icon: HelpCircle },
        { path: '/apps', label: 'App Store', icon: Puzzle },
      ]
    }
  ];

  return (
    <div className={`min-h-screen bg-[#f1f1f1] dark:bg-[#020202] text-gray-900 dark:text-gray-100 flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-50
        bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-gray-800 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] dark:shadow-none transform transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}
        lg:translate-x-0 flex flex-col
        w-64 lg:w-20 lg:hover:w-64 group
      `}>
        {/* Logo Header */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100 dark:border-gray-800 transition-all justify-start lg:justify-center lg:group-hover:justify-start">
             <div className="w-10 h-10 bg-[#f97316] rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/20">
                <span className="font-bold text-xl font-serif italic">W</span>
             </div>
             <span className={`ml-3 font-bold text-xl tracking-tight text-gray-900 dark:text-white whitespace-nowrap lg:w-0 lg:opacity-0 lg:overflow-hidden lg:group-hover:w-auto lg:group-hover:opacity-100 transition-all duration-300`}>
                Whopify
             </span>
        </div>

        {/* Scrollable Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 overflow-x-hidden">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="px-3">
              {/* Section Title */}
              {group.title && (
                <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500/80 mb-2 px-3 uppercase tracking-widest whitespace-nowrap lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                  {group.title}
                </h3>
              )}
              {/* Spacer */}
              {group.title && <div className="h-4 lg:hidden lg:group-hover:hidden" />}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  const Icon = item.icon;
                  const isDisabled = item.disabled;
                  const badge = item.badge;

                  const content = (
                    <>
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#f97316]' : (isDisabled ? 'text-gray-300 dark:text-gray-700' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200')}`} />
                      
                      <span className={`
                        truncate transition-all duration-300 whitespace-nowrap text-sm font-semibold
                        ml-3 lg:ml-0 lg:w-0 lg:opacity-0 
                        lg:group-hover:ml-3 lg:group-hover:w-auto lg:group-hover:opacity-100
                        ${isDisabled ? 'text-gray-300 dark:text-gray-600' : ''}
                      `}>
                        {item.label}
                      </span>

                      {/* Orange Badge */}
                      {badge === true && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#f97316] lg:group-hover:block lg:hidden shadow-sm"></span>
                      )}

                      {/* Coming Soon Badge */}
                      {typeof badge === 'string' && (
                         <span className="ml-auto text-[9px] font-bold bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-800 lg:group-hover:block lg:hidden whitespace-nowrap">
                            {badge.toUpperCase()}
                         </span>
                      )}
                    </>
                  );

                  if (isDisabled) {
                    return (
                        <div
                            key={item.path}
                            className={`
                                flex items-center rounded-lg transition-all relative px-3 py-2
                                justify-start lg:justify-center lg:group-hover:justify-start
                                cursor-not-allowed
                            `}
                        >
                            {content}
                        </div>
                    );
                  }

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center rounded-lg transition-all active:scale-95 relative px-3 py-2
                        justify-start lg:justify-center lg:group-hover:justify-start
                        ${isActive 
                          ? 'bg-orange-50 text-gray-900 dark:bg-gray-800 dark:text-white' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                        }
                      `}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
          
          {/* Settings Link */}
          <Link
            to="/settings"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`
              flex items-center rounded-lg transition-all active:scale-95 relative px-3 py-2
              justify-start lg:justify-center lg:group-hover:justify-start
              ${location.pathname === '/settings' 
                ? 'bg-orange-50 text-gray-900 dark:bg-gray-800 dark:text-white font-medium' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            <Settings size={20} className={`shrink-0 ${location.pathname === '/settings' ? 'text-[#f97316]' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200'}`} />
            <span className={`
              truncate transition-all duration-300 whitespace-nowrap text-sm font-semibold
              ml-3 lg:ml-0 lg:w-0 lg:opacity-0 
              lg:group-hover:ml-3 lg:group-hover:w-auto lg:group-hover:opacity-100
            `}>
              Settings
            </span>
          </Link>

          {/* Log Out */}
          <div 
            onClick={onLogout}
            className="flex items-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95 cursor-pointer px-3 py-2 justify-start lg:justify-center lg:group-hover:justify-start"
          >
            <LogOut size={20} className="shrink-0 text-gray-500 dark:text-gray-400" />
            <span className={`
              ml-3 lg:ml-0 lg:w-0 lg:opacity-0 
              lg:group-hover:ml-3 lg:group-hover:w-auto lg:group-hover:opacity-100
              truncate transition-all duration-300 whitespace-nowrap text-sm font-semibold
            `}>
              Log Out
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f1f1f1] dark:bg-[#020202] transition-all duration-300 ${isRTL ? 'lg:pr-20' : 'lg:pl-20'}`}>
        {/* Top Header */}
        <header className="bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4 lg:px-8 shadow-sm dark:shadow-none z-10 gap-4">
          <div className="flex items-center shrink-0">
             <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white mr-4 transition-transform active:scale-95"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="text-sm breadcrumbs flex items-center">
              <span className="text-gray-500 dark:text-gray-500 font-medium">Store</span>
              <span className="mx-2 text-gray-300 dark:text-gray-700">/</span>
              <span className="text-gray-900 dark:text-white font-semibold">
                 {navGroups.flatMap(g => g.items).find(i => location.pathname.startsWith(i.path) && i.path !== '/') ?.label || (location.pathname === '/settings' ? 'Settings' : location.pathname === '/help' ? 'Help Center' : location.pathname === '/apps' ? 'App Store' : 'Dashboard')}
              </span>
            </h2>
          </div>

          {/* Centered Search Bar */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-md mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className={`h-4 w-4 transition-colors ${isSearchFocused ? 'text-[#f97316]' : 'text-gray-400 dark:text-gray-500'}`} />
              </div>
              <input 
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search checkouts, orders..." 
                  className="block w-full pl-10 pr-12 py-2 bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-gray-800 rounded-full text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <kbd className="hidden lg:inline-flex items-center gap-1 rounded border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[#222] px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 font-mono">
                      /
                  </kbd>
              </div>

              {/* Search Results Dropdown */}
              {isSearchFocused && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                      <div className="p-2">
                          {filteredCheckouts.length > 0 && (
                              <div className="mb-2">
                                  <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase px-3 py-1">Checkouts</div>
                                  {filteredCheckouts.map(checkout => (
                                      <button 
                                          key={checkout.id}
                                          onClick={() => handleSearchNavigation(`/checkouts/${checkout.id}`)}
                                          className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                                      >
                                          <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-800 overflow-hidden flex items-center justify-center text-gray-500">
                                              {checkout.thumbnail && !checkout.thumbnail.includes('placeholder') ? <img src={checkout.thumbnail} className="w-full h-full object-cover" /> : <ShoppingBag size={14} />}
                                          </div>
                                          <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#f97316]">{checkout.name}</span>
                                          <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                                      </button>
                                  ))}
                              </div>
                          )}
                          
                          <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase px-3 py-1">Search In</div>
                          <button 
                              onClick={() => handleSearchNavigation(`/orders?q=${encodeURIComponent(searchQuery)}`)}
                              className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                          >
                              <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-500"><ShoppingCart size={14} /></div>
                              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Find <strong>"{searchQuery}"</strong> in Orders</span>
                          </button>
                          <button 
                              onClick={() => handleSearchNavigation(`/customers?q=${encodeURIComponent(searchQuery)}`)}
                              className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                          >
                              <div className="p-1.5 rounded bg-green-50 dark:bg-green-900/20 text-green-500"><Users size={14} /></div>
                              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Find <strong>"{searchQuery}"</strong> in Customers</span>
                          </button>
                      </div>
                  </div>
              )}
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
             {/* Theme Toggle */}
             <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
             >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             {/* Notifications */}
             <div className="relative" ref={notifRef}>
                <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95 relative"
                    title="Notifications"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#f97316] rounded-full ring-2 ring-white dark:ring-[#111111]"></span>}
                </button>

                {isNotificationsOpen && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-[60] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-[10px] font-bold text-[#f97316] hover:text-[#ea580c]">
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">No new notifications.</div>
                            ) : (
                                notifications.map(notif => (
                                    <div 
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif.id)}
                                        className={`p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors relative ${!notif.read ? 'bg-orange-50/30 dark:bg-orange-900/10' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!notif.read ? 'bg-[#f97316]' : 'bg-transparent'}`}></div>
                                            <div>
                                                <p className={`text-sm ${!notif.read ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-2 border-t border-gray-100 dark:border-gray-800 text-center">
                            <button className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white">View all activity</button>
                        </div>
                    </div>
                )}
             </div>

             {/* Profile Dropdown */}
             <div ref={profileRef} className="relative ml-2 pl-2 border-l border-gray-200 dark:border-gray-800">
                  <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1.5 pr-2 rounded-full transition-all active:scale-95 outline-none"
                  >
                       <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 dark:from-gray-700 dark:to-gray-900 border-2 border-white dark:border-gray-800 shrink-0 shadow-sm flex items-center justify-center text-white font-serif italic font-bold overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0)
                          )}
                       </div>
                       <div className="hidden md:flex flex-col items-start">
                           <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user.name}</span>
                           <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-none mt-1">Admin</span>
                       </div>
                       <ChevronDown size={14} className="text-gray-400 hidden md:block" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                      <div className="absolute top-full right-0 mt-2 w-60 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-[60] p-1.5 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                          <button onClick={() => handleProfileNavigation('/settings?tab=account')} className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3 transition-all active:scale-95">
                              <User size={18} className="text-gray-400 dark:text-gray-500" /> Account
                          </button>
                          <button onClick={() => handleProfileNavigation('/settings?tab=billing')} className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3 transition-all active:scale-95">
                              <CreditCard size={18} className="text-gray-400 dark:text-gray-500" /> Plan & billing
                          </button>
                          <button onClick={() => handleProfileNavigation('/settings?tab=portal')} className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3 transition-all active:scale-95">
                              <Store size={18} className="text-gray-400 dark:text-gray-500" /> Customer portal
                          </button>
                          <button onClick={() => handleProfileNavigation('/settings?tab=updates')} className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3 transition-all active:scale-95">
                              <Sparkles size={18} className="text-gray-400 dark:text-gray-500" /> What's new
                          </button>
                          <button onClick={() => handleProfileNavigation('/settings?tab=marketing')} className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3 transition-all active:scale-95">
                              <Rocket size={18} className="text-gray-400 dark:text-gray-500" /> Affiliate program
                          </button>
                          <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2"></div>
                          <button 
                            onClick={onLogout}
                            className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg flex items-center gap-3 transition-all active:scale-95"
                          >
                              <LogOut size={18} /> Sign out
                          </button>
                      </div>
                  )}
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#f1f1f1] dark:bg-[#020202] p-4 lg:p-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {children}
        </main>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');
  const [ghostMode, setGhostMode] = useState(false);
  const isRTL = language === 'ar';
  
  // Offline/Beta Mode State
  const [isBetaMode, setIsBetaMode] = useState(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
      // Persist login state
      return localStorage.getItem('whopify_auth') === 'true';
  });

  const toggleGhostMode = () => setGhostMode(!ghostMode);

  // Global State
  const [checkouts, setCheckouts] = useState<CheckoutPage[]>(initialCheckouts);
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [coupons, setCoupons] = useState<Coupon[]>(defaultCoupons);
  
  // User Profile State
  const [user, setUser] = useState<UserProfile>({
    name: 'Youssef B.',
    email: 'admin@whopify.io',
    avatar: ''
  });

  const handleLogin = () => {
      setIsAuthenticated(true);
      localStorage.setItem('whopify_auth', 'true');
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      localStorage.removeItem('whopify_auth');
  };

  // Load user from local storage
  useEffect(() => {
      const savedUser = localStorage.getItem('whopify_user');
      if (savedUser) {
          try {
             setUser(JSON.parse(savedUser));
          } catch(e) {}
      }
  }, []);

  const updateUser = (updates: Partial<UserProfile>) => {
      setUser(prev => {
          const next = { ...prev, ...updates };
          localStorage.setItem('whopify_user', JSON.stringify(next));
          return next;
      });
  };

  // Hydrate from Backend on Mount with Fallback
  useEffect(() => {
    if (!isAuthenticated) return; // Only fetch if logged in

    const fetchData = async () => {
        try {
            // Promise.all for parallel fetching
            const [setRes, checkRes] = await Promise.all([
                fetch(`${API_URL}/api/settings`),
                fetch(`${API_URL}/api/checkouts`)
            ]);

            if (setRes.ok && checkRes.ok) {
                const setData = await setRes.json();
                const checkData = await checkRes.json();
                setSettings(setData);
                setCheckouts(checkData);
                setIsBetaMode(false);
            } else {
                throw new Error("Failed to fetch");
            }
        } catch (e) {
            console.warn("Backend unreachable. Switching to Beta/Demo mode.");
            setIsBetaMode(true);
            
            // Try loading from localStorage
            const localSettings = localStorage.getItem('whopify_settings');
            const localCheckouts = localStorage.getItem('whopify_checkouts');
            const localCoupons = localStorage.getItem('whopify_coupons');

            if (localSettings) setSettings(JSON.parse(localSettings));
            if (localCheckouts) setCheckouts(JSON.parse(localCheckouts));
            if (localCoupons) setCoupons(JSON.parse(localCoupons));
        }
    };
    fetchData();
  }, [isAuthenticated]);

  // Persist Coupons locally
  useEffect(() => {
      if (isBetaMode) {
          localStorage.setItem('whopify_coupons', JSON.stringify(coupons));
      }
  }, [coupons, isBetaMode]);

  // Crisp Chat Injection Logic
  useEffect(() => {
    if (settings.crispEnabled && settings.crispWebsiteId) {
      // Check if already injected to prevent duplicates
      if (!window.$crisp) {
        window.$crisp = [];
        window.CRISP_WEBSITE_ID = settings.crispWebsiteId;
        (function() {
          const d = document;
          const s = d.createElement("script");
          s.src = "https://client.crisp.chat/l.js";
          s.async = true;
          d.getElementsByTagName("head")[0].appendChild(s);
        })();
        console.log("Crisp Chat Injected");
      } else {
        // If already loaded, ensure it's visible (in case it was hidden)
        try {
           if(window.$crisp.push) window.$crisp.push(['do', 'chat:show']);
        } catch(e) {}
      }
    } else {
       // If disabled, try to hide it if it exists
       if (window.$crisp) {
         try {
           window.$crisp.push(['do', 'chat:hide']);
         } catch(e) {}
       }
    }
  }, [settings.crispEnabled, settings.crispWebsiteId]);

  const addCheckout = (name: string) => {
    const newId = Date.now().toString();
    const newCheckout: CheckoutPage = {
      id: newId,
      name,
      currency: settings.currency, 
      visits: 0,
      conversions: 0,
      totalRevenue: 0,
      status: 'draft',
      thumbnail: 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(name),
      themeColor: '#0078FF',
      appearance: 'dark',
      paymentMethods: settings.stripeEnabled ? ['stripe'] : [],
      products: [],
      upsells: [],
      components: [
        { id: '1', type: 'header', title: 'Header', isVisible: true },
        { id: '2', type: 'product-summary', title: 'Product Summary', isVisible: true },
        { id: '3', type: 'customer-form', title: 'Customer Info', isVisible: true },
        { id: '4', type: 'payment-section', title: 'Payment', isVisible: true },
      ]
    };
    
    const updatedCheckouts = [...checkouts, newCheckout];
    setCheckouts(updatedCheckouts);

    if (isBetaMode) {
        localStorage.setItem('whopify_checkouts', JSON.stringify(updatedCheckouts));
    } else {
        fetch(`${API_URL}/api/checkouts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: newId, data: newCheckout })
        }).catch(() => {
            // Fallback if network fails during operation
             localStorage.setItem('whopify_checkouts', JSON.stringify(updatedCheckouts));
             setIsBetaMode(true);
        });
    }

    return newId; 
  };

  const updateCheckout = (id: string, updates: Partial<CheckoutPage>) => {
    setCheckouts(prev => {
        const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
        const updated = next.find(c => c.id === id);
        
        if (updated) {
            if (isBetaMode) {
                localStorage.setItem('whopify_checkouts', JSON.stringify(next));
            } else {
                fetch(`${API_URL}/api/checkouts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, data: updated })
                }).catch(() => {
                    localStorage.setItem('whopify_checkouts', JSON.stringify(next));
                    setIsBetaMode(true);
                });
            }
        }
        return next;
    });
  };

  const deleteCheckout = (id: string) => {
    const next = checkouts.filter(c => c.id !== id);
    setCheckouts(next);
    
    if (isBetaMode) {
        localStorage.setItem('whopify_checkouts', JSON.stringify(next));
    } else {
        fetch(`${API_URL}/api/checkouts/${id}`, { method: 'DELETE' })
        .catch(() => {
            localStorage.setItem('whopify_checkouts', JSON.stringify(next));
            setIsBetaMode(true);
        });
    }
  };

  const saveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    if (isBetaMode) {
        localStorage.setItem('whopify_settings', JSON.stringify(newSettings));
    } else {
        fetch(`${API_URL}/api/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSettings)
        }).catch(() => {
            localStorage.setItem('whopify_settings', JSON.stringify(newSettings));
            setIsBetaMode(true);
        });
    }
  };

  const addCoupon = (coupon: Coupon) => {
      setCoupons(prev => [...prev, coupon]);
  };

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCoupon = (id: string) => {
      setCoupons(prev => prev.filter(c => c.id !== id));
  };

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isRTL, language, theme]);

  return (
    <AppContext.Provider value={{ 
      language, 
      setLanguage, 
      isRTL, 
      theme,
      setTheme,
      ghostMode,
      toggleGhostMode,
      checkouts,
      addCheckout,
      updateCheckout,
      deleteCheckout,
      settings,
      saveSettings,
      coupons,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      user,
      updateUser
    }}>
      <HashRouter>
        <PageTracker /> 
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />} />
          
          {/* Standalone Checkout Views (Public) */}
          <Route path="/p/:checkoutId" element={<CheckoutView />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />

          {/* Protected Dashboard Routes */}
          <Route path="/*" element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Routes>
                  <Route path="/dashboard" element={<DashboardHome />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/checkouts" element={<ProductManager />} />
                  <Route path="/checkouts/:checkoutId" element={<StoreBuilder />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/coupons" element={<DiscountsPage />} />
                  <Route path="/apps" element={<AppsPage />} />
                  <Route path="/tools/ghost-links" element={<GhostLinkPage />} />
                  <Route path="/tools/invoices" element={<InvoicesPage />} />
                  <Route path="/affiliates" element={<AffiliatesPage />} />
                  <Route path="/developers" element={<DevelopersPage />} />
                  <Route path="/help" element={<HelpCenterPage />} />

                  {/* Fallback for logged in users */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
                
                {/* Beta Mode Indicator */}
                {isBetaMode && (
                    <div className="fixed bottom-4 right-4 z-[100] bg-blue-500/10 backdrop-blur-md border border-blue-500/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm">
                        <FlaskConical size={14} /> Beta Mode
                    </div>
                )}
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          } />
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
}