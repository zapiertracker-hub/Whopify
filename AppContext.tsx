
import React from 'react';
import { Language, CheckoutPage, StoreSettings, Theme, Coupon } from './types';

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

  // Coupons Data
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;

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
    bankTransferEnabled: false,
    manualPaymentEnabled: false,
    stripeTestMode: true,
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeSigningSecret: '',
    stripeAccounts: [],
    activeStripeAccountId: undefined,
    paypalClientId: '',
    paypalSecret: '',
    paypalMode: 'sandbox',
    manualPaymentLabel: '',
    manualPaymentInstructions: '',
    bankTransferDetails: '',
    bankTransferInstructions: '',
    cryptoWalletAddress: '',
    cryptoOptions: ['BTC', 'ETH', 'USDT'],
    // Portal Defaults
    portalAllowCancellation: true,
    portalAllowPlanChange: false,
    portalAllowPaymentUpdate: true,
    portalShowHistory: true,
    // Tax Settings
    taxEnabled: false,
    taxRate: 0,
    taxName: 'Tax',
    // Integrations
    crispEnabled: false,
    crispWebsiteId: '',
    whatsappEnabled: false,
    whatsappNumber: '',
    googleSheetsEnabled: false,
    googleSheetsUrl: '',
    shopifyEnabled: false,
    shopifyStoreUrl: '',
    shopifyAccessToken: '',
    wooCommerceEnabled: false,
    wooCommerceUrl: '',
    wooCommerceConsumerKey: '',
    wooCommerceConsumerSecret: '',
    n8nEnabled: false,
    n8nWebhookUrl: '',
    gaEnabled: false,
    gaMeasurementId: '',
    helpspaceEnabled: false,
    helpspaceWidgetId: '',
    socialsEnabled: false,
    socialFacebook: '',
    socialTwitter: '',
    socialInstagram: '',
    socialYoutube: '',
    socialTiktok: '',
    discordEnabled: false,
    discordWebhookUrl: '',
    twoFactorEnabled: false
  },
  saveSettings: () => {},
  coupons: [],
  addCoupon: () => {},
  updateCoupon: () => {},
  deleteCoupon: () => {},
  user: { name: 'Youssef B.', email: 'admin@whopify.io', avatar: '' },
  updateUser: () => {}
});
