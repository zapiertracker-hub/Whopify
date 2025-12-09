

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
  price: number;
  image?: string;
  // Added fields based on StoreBuilder usage
  offerType?: 'one_time' | 'multi_month';
  monthlyPrice?: number;
  durationMonths?: number;
}

export interface GhostConfig {
  enabled: boolean;
  referrerMode: 'google' | 'facebook' | 'tiktok' | 'custom' | 'none';
  customReferrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface CheckoutPage {
  id: string;
  name: string;
  currency: string;
  status: 'active' | 'draft';
  visits: number;
  conversions: number;
  totalRevenue: number;
  thumbnail?: string;
  themeColor?: string;
  appearance?: 'light' | 'dark';
  paymentMethods: PaymentMethod[];
  products: Product[];
  upsells?: OrderBump[];
  upsell?: OrderBump; // Legacy/Single upsell support
  components: CheckoutComponent[];
  logo?: string;
  logoScale?: number;
  collectFullName?: boolean;
  collectPhoneNumber?: boolean;
  language?: Language;
  customThankYouLink?: {
    enabled: boolean;
    text?: string;
    url: string;
  };
  ghost?: GhostConfig;
}

export interface StripeAccount {
  id: string;
  label: string;
  publishableKey: string;
  secretKey: string;
  currentRevenue?: number;
  revenueLimit?: number;
}

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  currency: string;
  timezone: string;
  
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  cryptoEnabled: boolean;
  cashAppEnabled: boolean;
  bankTransferEnabled: boolean;

  stripeTestMode: boolean;
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeSigningSecret: string;
  
  stripeAccounts?: StripeAccount[];
  activeStripeAccountId?: string;

  paypalClientId?: string;
  paypalSecret?: string;
  paypalMode?: 'sandbox' | 'live';

  manualPaymentEnabled: boolean;
  manualPaymentLabel?: string;
  manualPaymentInstructions?: string;

  bankTransferDetails?: string;
  bankTransferInstructions?: string;
  
  cryptoWalletAddress?: string;
  cryptoOptions?: string[];

  // Customer Portal Defaults
  portalAllowCancellation: boolean;
  portalAllowPlanChange: boolean;
  portalAllowPaymentUpdate: boolean;
  portalShowHistory: boolean;

  taxEnabled: boolean;
  taxRate: number;
  taxName: string;

  // Integrations Defaults
  crispEnabled?: boolean;
  crispWebsiteId?: string;
  whatsappEnabled?: boolean;
  whatsappNumber?: string;
  
  // Google Sheets Integration
  googleSheetsEnabled?: boolean;
  googleSheetsUrl?: string;

  // Shopify Integration
  shopifyEnabled?: boolean;
  shopifyStoreUrl?: string;
  shopifyAccessToken?: string;

  // WooCommerce Integration
  wooCommerceEnabled?: boolean;
  wooCommerceUrl?: string;
  wooCommerceConsumerKey?: string;
  wooCommerceConsumerSecret?: string;

  // n8n Integration
  n8nEnabled?: boolean;
  n8nWebhookUrl?: string;

  // Google Analytics
  gaEnabled?: boolean;
  gaMeasurementId?: string;

  // Helpspace
  helpspaceEnabled?: boolean;
  helpspaceWidgetId?: string;

  // Socials
  socialsEnabled?: boolean;
  socialFacebook?: string;
  socialTwitter?: string;
  socialInstagram?: string;
  socialYoutube?: string;
  socialTiktok?: string;

  // Discord
  discordEnabled?: boolean;
  discordWebhookUrl?: string;

  // Security Defaults
  twoFactorEnabled?: boolean;

  // Custom Domain
  customDomain?: string;
  domainStatus?: 'active' | 'pending' | 'none';
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  status: 'active' | 'expired' | 'disabled';
  usedCount: number;
  usageLimit?: number;
  expiryDate?: string;
}