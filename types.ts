

export type Language = 'en' | 'fr' | 'ar';

export type PaymentMethod = 'stripe' | 'paypal' | 'crypto' | 'cashapp' | 'manual' | 'bank_transfer';

export type Theme = 'light' | 'dark';

export interface PriceValue {
  usd: number;
  eur: number;
  gbp?: number;
  mad?: number;
  [key: string]: number | undefined;
}

export interface PricingOptions {
  oneTime: { enabled: boolean; prices: PriceValue };
  subscription: { enabled: boolean; prices: PriceValue; interval: 'month' | 'year' };
  paymentPlan: { enabled: boolean; prices: PriceValue; installments: number };
}

export interface Product {
  id: string;
  name: string;
  image: string;
  description?: string;
  
  // New Pricing Structure
  pricing: PricingOptions;
  
  // Deprecated/Derived fields for backward compatibility
  price: number;
  currency: string;
  
  // Advanced Pricing Fields (Legacy)
  billingModel?: 'one-time' | 'subscription' | 'payment-plan' | 'pwyw';
  pricingType?: 'single' | 'multiple';
  compareAtPrice?: number; 
  setupFee?: number;
  recurringInterval?: 'month' | 'year' | 'week';
}

export interface CheckoutComponent {
  id: string;
  type: 'header' | 'product-summary' | 'customer-form' | 'payment-section' | 'testimonials' | 'guarantee';
  title: string;
  isVisible: boolean;
  content?: string;
}

export interface OrderBump {
  id: string;
  enabled: boolean;
  title: string;
  description: string;
  image?: string;
  
  // Pricing Configuration
  offerType: 'one_time' | 'multi_month'; // Standard or "2.99 x 12 months"
  price: number; // The total price charged (e.g. 35.88)
  
  // Display details for multi-month
  monthlyPrice?: number;
  durationMonths?: number;
}

export interface CheckoutPage {
  id: string;
  name: string; // Internal name
  status: 'active' | 'draft';
  thumbnail: string;
  logo?: string; // Custom Logo for the checkout page
  logoScale?: number; // Percentage scale (e.g. 100 for 100%)
  appearance?: 'light' | 'dark'; // Visual Theme Preference
  language?: 'en' | 'fr'; // Checkout Language
  
  // Analytics
  visits: number;
  conversions: number;
  totalRevenue: number;

  // Configuration
  currency: string;
  themeColor: string;
  paymentMethods: PaymentMethod[];
  products: Product[];
  components: CheckoutComponent[];
  
  upsells: OrderBump[]; // New Array support
  upsell?: OrderBump; // Deprecated single upsell
}

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  currency: string;
  timezone: string;
  
  // Payment Gateways
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  cryptoEnabled: boolean;
  cashAppEnabled: boolean;
  bankTransferEnabled?: boolean;

  stripeTestMode: boolean;
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeSigningSecret: string;

  // Manual Payment
  manualPaymentEnabled?: boolean;
  manualPaymentLabel?: string;
  manualPaymentInstructions?: string;

  // Bank Transfer
  bankTransferDetails?: string; // Account info
  bankTransferInstructions?: string;

  // Crypto
  cryptoWalletAddress?: string;
  cryptoOptions?: string[]; // e.g. ['BTC', 'ETH']

  // Tax Settings
  taxEnabled: boolean;
  taxRate: number; // Percentage
  taxName: string; // e.g. VAT, Sales Tax

  // Integrations
  crispEnabled?: boolean;
  crispWebsiteId?: string;
  whatsappEnabled?: boolean;
  whatsappNumber?: string;

  // Domains
  customDomain?: string;
  domainStatus?: 'none' | 'pending' | 'active' | 'failed';

  // Security
  twoFactorEnabled?: boolean;
}

export interface User {
  id: string;
  name: string;
  role: 'seller' | 'admin';
  avatar: string;
}