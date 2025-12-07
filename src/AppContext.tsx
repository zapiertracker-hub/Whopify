import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { StoreSettings, CheckoutPage, Coupon } from './types';

// Extended User type for local state management including auth
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'seller' | 'admin';
  avatar: string;
  username?: string;
  password?: string;
}

interface AppContextType {
  settings: StoreSettings;
  saveSettings: (settings: StoreSettings) => void;
  checkouts: CheckoutPage[];
  addCheckout: (name: string) => void;
  updateCheckout: (id: string, data: Partial<CheckoutPage>) => void;
  deleteCheckout: (id: string) => void;
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (id: string, data: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  ghostMode: boolean;
  toggleGhostMode: () => void;
  user: UserProfile;
  updateUser: (data: Partial<UserProfile>) => void;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [ghostMode, setGhostMode] = useState(false);

  // User State - Default Credentials: admin / admin
  const [user, setUser] = useState<UserProfile>({
    id: 'u1',
    name: 'Youssef B.',
    email: 'admin@whopify.io',
    role: 'admin',
    avatar: '',
    username: 'admin',
    password: 'admin'
  });

  // Settings State
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'Whopify Store',
    supportEmail: 'support@whopify.io',
    currency: 'USD',
    timezone: 'UTC',
    stripeEnabled: false,
    paypalEnabled: false,
    cryptoEnabled: false,
    cashAppEnabled: false,
    stripeTestMode: true,
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeSigningSecret: '',
    taxEnabled: false,
    taxRate: 0,
    taxName: 'Tax'
  });

  // Checkouts State
  const [checkouts, setCheckouts] = useState<CheckoutPage[]>([]);

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Persistence (Simulated)
  useEffect(() => {
    const loadedSettings = localStorage.getItem('whopify_settings');
    if (loadedSettings) setSettings(JSON.parse(loadedSettings));

    const loadedCheckouts = localStorage.getItem('whopify_checkouts');
    if (loadedCheckouts) setCheckouts(JSON.parse(loadedCheckouts));
    
    const loadedCoupons = localStorage.getItem('whopify_coupons');
    if (loadedCoupons) setCoupons(JSON.parse(loadedCoupons));

    const loadedUser = localStorage.getItem('whopify_user');
    if (loadedUser) setUser(JSON.parse(loadedUser));

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('whopify_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('whopify_checkouts', JSON.stringify(checkouts));
  }, [checkouts]);

  useEffect(() => {
      localStorage.setItem('whopify_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
      localStorage.setItem('whopify_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Actions
  const saveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
  };

  const addCheckout = (name: string) => {
    const newCheckout: CheckoutPage = {
      id: Date.now().toString(),
      name,
      status: 'draft',
      thumbnail: `https://via.placeholder.com/150?text=${name.charAt(0)}`,
      visits: 0,
      conversions: 0,
      totalRevenue: 0,
      currency: settings.currency,
      themeColor: '#f97316',
      paymentMethods: [],
      products: [],
      components: [],
      upsells: []
    };
    setCheckouts([...checkouts, newCheckout]);
  };

  const updateCheckout = (id: string, data: Partial<CheckoutPage>) => {
    setCheckouts(checkouts.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCheckout = (id: string) => {
    setCheckouts(checkouts.filter(c => c.id !== id));
  };

  const addCoupon = (coupon: Coupon) => {
      setCoupons([...coupons, coupon]);
  };

  const updateCoupon = (id: string, data: Partial<Coupon>) => {
      setCoupons(coupons.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCoupon = (id: string) => {
      setCoupons(coupons.filter(c => c.id !== id));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleGhostMode = () => {
    setGhostMode(prev => !prev);
  };

  const updateUser = (data: Partial<UserProfile>) => {
      setUser(prev => ({ ...prev, ...data }));
  };

  return (
    <AppContext.Provider value={{
      settings,
      saveSettings,
      checkouts,
      addCheckout,
      updateCheckout,
      deleteCheckout,
      coupons,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      theme,
      toggleTheme,
      ghostMode,
      toggleGhostMode,
      user,
      updateUser
    }}>
      {children}
    </AppContext.Provider>
  );
};