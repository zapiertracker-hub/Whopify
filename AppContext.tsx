
import React from 'react';
import { Language, CheckoutPage, StoreSettings, Theme } from './types';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

export interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  // Ghost Mode
  ghostMode: boolean;
  toggleGhostMode: () => void;

  // Checkouts Data
  checkouts: CheckoutPage[];
  addCheckout: (name: string) => void;
  updateCheckout: (id: string, updates: Partial<CheckoutPage>) => void;
  deleteCheckout: (id: string) => void;

  // Settings Data
  settings: StoreSettings;
  saveSettings: (settings: StoreSettings) => void;

  // User Data
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
}

export const AppContext = React.createContext<AppContextType>({
  language: 'en',
  setLanguage: () => {},
  isRTL: false,
  theme: 'dark',
  setTheme: () => {},
  ghostMode: false,
  toggleGhostMode: () => {},
  checkouts: [],
  addCheckout: () => {},
  updateCheckout: () => {},
  deleteCheckout: () => {},
  settings: {
    storeName: '',
    supportEmail: '',
    currency: 'USD',
    timezone: '',
    // Payment Gateways
    stripeEnabled: false,
    paypalEnabled: false,
    cryptoEnabled: false,
    cashAppEnabled: false,
    stripeTestMode: true,
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeSigningSecret: '',
    // Tax Settings
    taxEnabled: false,
    taxRate: 0,
    taxName: 'Tax'
  },
  saveSettings: () => {},
  user: { name: 'Youssef B.', email: 'admin@whopify.io', avatar: '' },
  updateUser: () => {}
});
