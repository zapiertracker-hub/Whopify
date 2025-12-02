
// services/analytics.ts

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your Measurement ID

// Initialize Data Layer
export const initAnalytics = () => {
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }
  // @ts-ignore
  gtag('js', new Date());
  // @ts-ignore
  gtag('config', GA4_MEASUREMENT_ID, {
    send_page_view: false // We handle this manually in PageTracker
  });
};

// Generic Event Tracker
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null }); // Clear previous ecommerce object
    window.dataLayer.push({
      event: eventName,
      ...params,
      timestamp: new Date().toISOString()
    });
    console.log(`[Analytics] ${eventName}`, params);
  }
};

// --- E-commerce Funnel Events ---

export const trackViewItem = (product: any, currency: string) => {
  trackEvent('view_item', {
    ecommerce: {
      currency: currency,
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: 1
      }]
    }
  });
};

export const trackBeginCheckout = (products: any[], currency: string, value: number, version: string) => {
  trackEvent('begin_checkout', {
    checkout_version: version,
    ecommerce: {
      currency: currency,
      value: value,
      items: products.map(p => ({
        item_id: p.id,
        item_name: p.name,
        price: p.price
      }))
    }
  });
};

export const trackAddPaymentInfo = (paymentMethod: string, products: any[], currency: string, value: number) => {
  trackEvent('add_payment_info', {
    payment_type: paymentMethod,
    ecommerce: {
      currency: currency,
      value: value,
      items: products.map(p => ({
        item_id: p.id,
        item_name: p.name,
        price: p.price
      }))
    }
  });
};

export const trackPurchase = (transactionId: string, value: number, currency: string, products: any[]) => {
  trackEvent('purchase', {
    transaction_id: transactionId,
    ecommerce: {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: products.map(p => ({
        item_id: p.id,
        item_name: p.name,
        price: p.price
      }))
    }
  });
};

export const trackPageView = (path: string, title: string) => {
  trackEvent('page_view', {
    page_path: path,
    page_title: title
  });
};
