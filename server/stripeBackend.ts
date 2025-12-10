







import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Buffer } from 'buffer';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// --- Mock Database Implementation (Local JSON File) ---
const DB_FILE = path.resolve('local_db.json');

const loadDb = () => {
  const defaultDb = { 
    checkouts: [], 
    orders: [], 
    customers: [],
    ghostLinks: [],
    settings: { 
      currency: 'USD', 
      stripeEnabled: false,
      stripePublishableKey: '',
      stripeSecretKey: '',
      stripeAccounts: [],
      activeStripeAccountId: undefined,
      paypalEnabled: false,
      paypalClientId: '',
      paypalSecret: '',
      paypalMode: 'sandbox',
      // New Defaults
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
      discordWebhookUrl: ''
    } 
  };

  if (!fs.existsSync(DB_FILE)) {
    return defaultDb;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    if (!content.trim()) return defaultDb;
    const parsed = JSON.parse(content);
    // Merge with default to ensure all root keys exist
    return { ...defaultDb, ...parsed, settings: { ...defaultDb.settings, ...parsed.settings } };
  } catch (e) {
    console.warn("Failed to parse local_db.json, using default DB.", e);
    return defaultDb;
  }
};

const saveDb = (data: any) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

const db = {
  getCheckout: async (id: string) => {
    const data = loadDb();
    return data.checkouts.find((c: any) => c.id === id);
  },
  saveOrder: async (order: any) => {
    const data = loadDb();
    data.orders.push(order);
    // Auto-create customer if not exists
    if (!data.customers.find((c: any) => c.email === (order.email || order.customerEmail))) {
       data.customers.push({
           id: Date.now().toString(),
           name: order.customerName || 'Guest',
           email: order.email || order.customerEmail,
           location: order.customerCountry || 'Unknown',
           orders: 1,
           spent: order.amount,
           lastActive: 'Just now'
       });
    }
    saveDb(data);
  },
  getSettings: async () => {
    const data = loadDb();
    return data.settings || {};
  },
  getAllCheckouts: async () => {
    const data = loadDb();
    return data.checkouts;
  },
  updateCheckout: async (id: string, checkoutData: any) => {
    const data = loadDb();
    const idx = data.checkouts.findIndex((c: any) => c.id === id);
    if (idx >= 0) {
      data.checkouts[idx] = checkoutData;
    } else {
      data.checkouts.push(checkoutData);
    }
    saveDb(data);
  },
  updateSettings: async (settings: any) => {
    const data = loadDb();
    data.settings = settings;
    saveDb(data);
  },
  // Ghost Link Methods
  getAllGhostLinks: async () => {
    const data = loadDb();
    return data.ghostLinks || [];
  },
  getGhostLinkBySlug: async (slug: string) => {
    const data = loadDb();
    return (data.ghostLinks || []).find((l: any) => l.slug === slug);
  },
  saveGhostLink: async (link: any) => {
    const data = loadDb();
    if (!data.ghostLinks) data.ghostLinks = [];
    const idx = data.ghostLinks.findIndex((l: any) => l.id === link.id);
    if (idx >= 0) {
      data.ghostLinks[idx] = link;
    } else {
      data.ghostLinks.unshift(link);
    }
    saveDb(data);
  },
  deleteGhostLink: async (id: string) => {
    const data = loadDb();
    if (data.ghostLinks) {
        data.ghostLinks = data.ghostLinks.filter((l: any) => l.id !== id);
        saveDb(data);
    }
  },
  incrementGhostLinkClicks: async (id: string) => {
      const data = loadDb();
      if (data.ghostLinks) {
          const idx = data.ghostLinks.findIndex((l: any) => l.id === id);
          if (idx >= 0) {
              data.ghostLinks[idx].click_total += 1;
              data.ghostLinks[idx].click_today += 1;
              data.ghostLinks[idx].click_month += 1;
              saveDb(data);
          }
      }
  }
};

const ensureStripe = async () => {
  const settings = await db.getSettings();
  if (settings.stripeEnabled && settings.stripeSecretKey) {
    return new Stripe(settings.stripeSecretKey, { apiVersion: '2023-10-16' });
  }
  return null;
};

const getPayPalAccessToken = async () => {
  const settings = await db.getSettings();
  const clientId = settings.paypalClientId;
  const clientSecret = settings.paypalSecret;
  const mode = settings.paypalMode || 'sandbox';
  const baseUrl = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret) return null;

  try {
    const auth = Buffer.from(clientId + ":" + clientSecret).toString("base64");
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data: any = await response.json();
    return { accessToken: data.access_token, baseUrl };
  } catch (e) {
    console.error("PayPal Auth Error", e);
    return null;
  }
};

// --- Ghost Link Logic ---

const detectContext = (req: express.Request) => {
    const userAgent = req.headers['user-agent'] || '';
    let device = 'desktop';
    if (/mobile/i.test(userAgent)) device = 'mobile';
    if (/tablet|ipad/i.test(userAgent)) device = 'tablet';

    // Simple IP-based geo simulation or header check
    // In production, use MaxMind or Cloudflare headers
    const country = (req.headers['cf-ipcountry'] as string) || 'US'; 

    return { device, country };
};

const resolveGhostRedirect = (link: any, context: { country: string, device: string }) => {
    const logs: string[] = [];
    const now = new Date();

    logs.push(`1. Analyzing Link: /${link.slug}`);

    // Status Check
    if (link.status === 'disabled') {
        logs.push(`2. Status DISABLED. Blocked.`);
        return { url: 'Blocked', reason: 'Link is disabled', logs, type: 'error' };
    }
    
    // Schedule Check
    if (link.schedule_start && new Date(link.schedule_start) > now) {
        logs.push(`3. Scheduled for future (${link.schedule_start}). Blocked.`);
        return { url: 'Blocked', reason: 'Not yet active', logs, type: 'error' };
    }
    if (link.schedule_end && new Date(link.schedule_end) < now) {
        logs.push(`3. Expired on ${link.schedule_end}. Blocked.`);
        return { url: 'Blocked', reason: 'Link expired', logs, type: 'error' };
    }

    // Limit Check
    if (link.click_limit !== null && link.click_total >= link.click_limit) {
        logs.push(`4. Click limit (${link.click_limit}) reached. Blocked.`);
        return { url: 'Blocked', reason: 'Click limit reached', logs, type: 'error' };
    }

    // Device Rules
    if (link.device_redirects && link.device_redirects[context.device]) {
        const target = link.device_redirects[context.device];
        logs.push(`5. Matched Device Rule (${context.device}) -> ${target}`);
        return finalizeUrl(target, link, logs, `Device Rule: ${context.device}`);
    }

    // Geo Rules
    if (link.geo_redirects && link.geo_redirects[context.country]) {
        const target = link.geo_redirects[context.country];
        logs.push(`6. Matched Geo Rule (${context.country}) -> ${target}`);
        return finalizeUrl(target, link, logs, `Geo Rule: ${context.country}`);
    }

    // Split Testing
    let finalUrl = link.destination_urls[0];
    if (link.destination_urls.length > 1 && link.split_weights) {
        const totalWeight = link.split_weights.reduce((a: number, b: number) => a+b, 0);
        let random = Math.random() * totalWeight;
        let selectedIndex = 0;
        for (let i = 0; i < link.split_weights.length; i++) {
            if (random < link.split_weights[i]) {
                selectedIndex = i;
                break;
            }
            random -= link.split_weights[i];
        }
        finalUrl = link.destination_urls[selectedIndex];
        logs.push(`7. Split Test: Selected Variant ${selectedIndex} (${link.split_weights[selectedIndex]} weight)`);
    } else {
        logs.push(`7. Using Default Destination`);
    }

    return finalizeUrl(finalUrl, link, logs, 'Default');
};

const finalizeUrl = (url: string, link: any, logs: string[], reason: string) => {
    let finalUrl = url;
    
    // UTM Appending
    if (link.utm_enabled && link.utm_params) {
        try {
            const u = new URL(finalUrl);
            if (link.utm_params.source) u.searchParams.set('utm_source', link.utm_params.source);
            if (link.utm_params.medium) u.searchParams.set('utm_medium', link.utm_params.medium);
            if (link.utm_params.campaign) u.searchParams.set('utm_campaign', link.utm_params.campaign);
            finalUrl = u.toString();
            logs.push(`8. Appended UTM parameters.`);
        } catch(e) {
            logs.push(`8. Failed to append UTMs (Invalid URL).`);
        }
    }

    return { url: finalUrl, reason, logs, type: 'redirect', method: `HTTP ${link.redirect_type}` };
};


// --- Endpoints ---

// Checkouts
app.get('/api/checkouts', async (req, res) => {
  const checkouts = await db.getAllCheckouts();
  res.json(checkouts);
});

app.post('/api/checkouts', async (req, res) => {
  const { id, data } = req.body;
  await db.updateCheckout(id, data);
  res.json({ success: true });
});

app.delete('/api/checkouts/:id', async (req, res) => {
    const data = loadDb();
    data.checkouts = data.checkouts.filter((c: any) => c.id !== req.params.id);
    saveDb(data);
    res.json({ success: true });
});

// Settings
app.get('/api/settings', async (req, res) => {
  const settings = await db.getSettings();
  res.json(settings);
});

app.post('/api/settings', async (req, res) => {
  await db.updateSettings(req.body);
  res.json({ success: true });
});

// Public Config
app.get('/api/public-config/:checkoutId', async (req, res) => {
  const checkout = await db.getCheckout(req.params.checkoutId);
  const settings = await db.getSettings();
  
  if (!checkout) return res.status(404).json({ error: 'Not found' });

  res.json({
    checkout,
    stripeEnabled: settings.stripeEnabled,
    stripePublishableKey: settings.stripePublishableKey,
    paypalEnabled: settings.paypalEnabled,
    paypalClientId: settings.paypalClientId,
    paypalMode: settings.paypalMode,
    currency: settings.currency || 'USD',
    whatsappEnabled: settings.whatsappEnabled,
    whatsappNumber: settings.whatsappNumber,
    manualPaymentEnabled: settings.manualPaymentEnabled,
    manualPaymentLabel: settings.manualPaymentLabel,
    manualPaymentInstructions: settings.manualPaymentInstructions,
    bankTransferEnabled: settings.bankTransferEnabled,
    bankTransferDetails: settings.bankTransferDetails,
    bankTransferInstructions: settings.bankTransferInstructions,
    cryptoEnabled: settings.cryptoEnabled,
    cryptoOptions: settings.cryptoOptions,
    cryptoWalletAddress: settings.cryptoWalletAddress
  });
});

// Payments
app.post("/api/create-payment-intent", async (req, res) => {
  const stripe = await ensureStripe();
  if (!stripe) return res.status(500).json({ error: "Stripe not configured" });

  const { checkoutId, customerEmail, selectedUpsellIds } = req.body;
  if (!checkoutId) return res.status(400).json({ error: "Missing checkoutId" });

  const checkout = await db.getCheckout(checkoutId);
  if (!checkout) return res.status(404).json({ error: "Checkout not found" });

  let total = 0;
  const settings = await db.getSettings();
  const currencyKey = (settings.currency || 'USD').toLowerCase();

  for (const p of checkout.products || []) {
    let price = 0;
    if (p.pricing?.oneTime?.enabled) {
      price = p.pricing.oneTime.prices[currencyKey] ?? p.pricing.oneTime.prices.usd;
    } else if (p.pricing?.subscription?.enabled) {
      price = p.pricing.subscription.prices[currencyKey] ?? p.pricing.subscription.prices.usd;
    } else if (p.pricing?.paymentPlan?.enabled) {
      price = p.pricing.paymentPlan.prices[currencyKey] ?? p.pricing.paymentPlan.prices.usd;
    } else {
      price = p.price ?? 0;
    }
    if (price == null || isNaN(price)) price = 0;
    total += price;
  }

  if (Array.isArray(selectedUpsellIds) && selectedUpsellIds.length > 0) {
      const allUpsells = [...(checkout.upsells || []), ...(checkout.upsell?.enabled ? [checkout.upsell] : [])];
      selectedUpsellIds.forEach((id: string) => {
          const found = allUpsells.find((u: any) => u.id === id && u.enabled);
          if (found) {
              total += (found.price || 0);
          }
      });
  }

  if (total <= 0) return res.status(400).json({ error: "Total amount must be greater than zero" });

  try {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: settings.currency.toLowerCase(),
      receipt_email: customerEmail,
      metadata: {
        checkout_id: checkoutId,
        upsells_count: (Array.isArray(selectedUpsellIds) ? selectedUpsellIds.length : 0).toString()
      },
    });

    res.json({ clientSecret: intent.client_secret });
  } catch (err: any) {
    console.error("Stripe Error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/create-manual-order", async (req, res) => {
  const { checkoutId, selectedUpsellIds, customerEmail, customerName, customerPhone, customerCountry } = req.body;
  if (!checkoutId) return res.status(400).json({ error: "Missing checkoutId" });

  const checkout = await db.getCheckout(checkoutId);
  if (!checkout) return res.status(404).json({ error: "Checkout not found" });

  const settings = await db.getSettings();
  let total = 0;
  const currencyKey = (settings.currency || 'USD').toLowerCase();

  for (const p of checkout.products || []) {
    let price = 0;
    if (p.pricing?.oneTime?.enabled) {
      price = p.pricing.oneTime.prices[currencyKey] ?? p.pricing.oneTime.prices.usd;
    } else if (p.pricing?.subscription?.enabled) {
      price = p.pricing.subscription.prices[currencyKey] ?? p.pricing.subscription.prices.usd;
    } else if (p.pricing?.paymentPlan?.enabled) {
      price = p.pricing.paymentPlan.prices[currencyKey] ?? p.pricing.paymentPlan.prices.usd;
    } else {
      price = p.price ?? 0;
    }
    if (price == null || isNaN(price)) price = 0;
    total += price;
  }

  if (Array.isArray(selectedUpsellIds) && selectedUpsellIds.length > 0) {
      const allUpsells = [...(checkout.upsells || []), ...(checkout.upsell?.enabled ? [checkout.upsell] : [])];
      selectedUpsellIds.forEach((id: string) => {
          const found = allUpsells.find((u: any) => u.id === id && u.enabled);
          if (found) {
              total += (found.price || 0);
          }
      });
  }

  const orderId = "man_" + Math.random().toString(36).slice(2, 9);
  
  // Ghost data from checkout settings
  let ghostMetadata = {};
  if (checkout.ghost && checkout.ghost.enabled) {
      ghostMetadata = {
          referrer: checkout.ghost.referrerMode === 'custom' ? checkout.ghost.customReferrer : (checkout.ghost.referrerMode === 'none' ? undefined : `https://${checkout.ghost.referrerMode}.com`),
          utm_source: checkout.ghost.utmSource,
          utm_medium: checkout.ghost.utmMedium,
          utm_campaign: checkout.ghost.utmCampaign
      };
  }

  await db.saveOrder({
    id: orderId,
    amount: total.toFixed(2),
    amount_cents: Math.round(total * 100),
    currency: settings.currency,
    status: "pending",
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    items: (checkout.products?.length || 0) + (Array.isArray(selectedUpsellIds) ? selectedUpsellIds.length : 0),
    checkoutId,
    paymentProvider: "manual",
    customerEmail,
    customerName,
    customerPhone,
    customerCountry,
    ...ghostMetadata
  });

  res.json({ success: true, orderId });
});

app.post('/api/verify-payment', async (req, res) => {
  const { paymentIntentId } = req.body;
  if (!paymentIntentId) return res.status(400).json({ error: "Missing paymentIntentId" });

  const stripe = await ensureStripe();
  if (!stripe) return res.status(500).json({ error: "Stripe not configured" });

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') return res.status(400).json({ error: "Payment not succeeded" });

    const dbData = loadDb();
    if (dbData.orders.some((o: any) => o.id === paymentIntent.id)) {
        return res.json({ success: true, orderId: paymentIntent.id, message: "Order already recorded" });
    }

    let customerName = 'Guest';
    let customerEmail = paymentIntent.receipt_email || '';
    let customerCountry = '';

    if (paymentIntent.latest_charge) {
        const chargeId = typeof paymentIntent.latest_charge === 'string' ? paymentIntent.latest_charge : paymentIntent.latest_charge.id;
        try {
            const charge = await stripe.charges.retrieve(chargeId);
            customerName = charge.billing_details?.name || customerName;
            customerEmail = charge.billing_details?.email || customerEmail;
            customerCountry = charge.billing_details?.address?.country || '';
        } catch (e) {
            console.error("Could not retrieve charge details", e);
        }
    }

    const checkoutId = paymentIntent.metadata.checkout_id;
    const upsellsCount = paymentIntent.metadata.upsells_count ? parseInt(paymentIntent.metadata.upsells_count) : 0;
    
    // Fetch checkout for ghost config
    const checkout = await db.getCheckout(checkoutId);
    let ghostMetadata = {};
    if (checkout && checkout.ghost && checkout.ghost.enabled) {
        ghostMetadata = {
            referrer: checkout.ghost.referrerMode === 'custom' ? checkout.ghost.customReferrer : (checkout.ghost.referrerMode === 'none' ? undefined : `https://${checkout.ghost.referrerMode}.com`),
            utm_source: checkout.ghost.utmSource,
            utm_medium: checkout.ghost.utmMedium,
            utm_campaign: checkout.ghost.utmCampaign
        };
    }

    const order = {
        id: paymentIntent.id,
        amount: (paymentIntent.amount / 100).toFixed(2),
        amount_cents: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
        status: "succeeded",
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        items: 1 + upsellsCount,
        checkoutId: checkoutId,
        paymentProvider: "stripe",
        customerEmail,
        customerName,
        customerCountry,
        ...ghostMetadata
    };

    await db.saveOrder(order);
    res.json({ success: true, orderId: order.id });

  } catch (e: any) {
    console.error("Verify Payment Error", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/verify-connection', async (req, res) => {
    const key = req.headers['x-stripe-secret-key'] as string;
    if (!key) return res.status(400).json({ status: 'error', message: 'No key provided' });

    try {
        if (key.startsWith('sk_') || key.startsWith('rk_')) {
             res.json({ status: 'connected', mode: key.startsWith('sk_test') ? 'Test Mode' : 'Live Mode', currency: 'USD' });
        } else {
             throw new Error("Invalid key format");
        }
    } catch (e: any) {
        res.status(400).json({ status: 'error', message: e.message });
    }
});

app.post("/api/create-paypal-order", async (req, res) => {
  const { checkoutId, selectedUpsellIds } = req.body;
  if (!checkoutId) return res.status(400).json({ error: "Missing checkoutId" });

  const checkout = await db.getCheckout(checkoutId);
  if (!checkout) return res.status(404).json({ error: "Checkout not found" });

  const settings = await db.getSettings();
  let total = 0;
  const currencyKey = (settings.currency || 'USD').toLowerCase();
  
  for (const p of checkout.products || []) {
    let price = 0;
    if (p.pricing?.oneTime?.enabled) {
      price = p.pricing.oneTime.prices[currencyKey] ?? p.pricing.oneTime.prices.usd;
    } else if (p.pricing?.subscription?.enabled) {
      price = p.pricing.subscription.prices[currencyKey] ?? p.pricing.subscription.prices.usd;
    } else if (p.pricing?.paymentPlan?.enabled) {
      price = p.pricing.paymentPlan.prices[currencyKey] ?? p.pricing.paymentPlan.prices.usd;
    } else {
      price = p.price ?? 0;
    }
    if (price == null || isNaN(price)) price = 0;
    total += price;
  }

  if (Array.isArray(selectedUpsellIds) && selectedUpsellIds.length > 0) {
      const allUpsells = [...(checkout.upsells || []), ...(checkout.upsell?.enabled ? [checkout.upsell] : [])];
      selectedUpsellIds.forEach((id: string) => {
          const found = allUpsells.find((u: any) => u.id === id && u.enabled);
          if (found) {
              total += (found.price || 0);
          }
      });
  }

  const auth = await getPayPalAccessToken();
  if (!auth || !auth.accessToken) return res.status(500).json({ error: "PayPal configuration error" });

  try {
      const url = `${auth.baseUrl}/v2/checkout/orders`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: settings.currency,
                value: total.toFixed(2),
              },
              description: `Order from ${checkout.name}`,
            },
          ],
        }),
      });

      const data: any = await response.json();
      res.json(data);
  } catch (e) {
      res.status(500).json({ error: "Failed to connect to PayPal" });
  }
});

app.post("/api/capture-paypal-order", async (req, res) => {
  const { orderID, checkoutId, customerEmail, customerName, customerCountry } = req.body;
  const auth = await getPayPalAccessToken();
  if (!auth || !auth.accessToken) return res.status(500).json({ error: "PayPal configuration error" });

  try {
      const url = `${auth.baseUrl}/v2/checkout/orders/${orderID}/capture`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });

      const data: any = await response.json();
      
      if (data.status === 'COMPLETED') {
          const settings = await db.getSettings();
          const captureAmount = data.purchase_units[0].payments.captures[0].amount.value;
          const captureCurrency = data.purchase_units[0].payments.captures[0].amount.currency_code;

          // Fetch checkout for ghost config
          const checkout = await db.getCheckout(checkoutId);
          let ghostMetadata = {};
          if (checkout && checkout.ghost && checkout.ghost.enabled) {
              ghostMetadata = {
                  referrer: checkout.ghost.referrerMode === 'custom' ? checkout.ghost.customReferrer : (checkout.ghost.referrerMode === 'none' ? undefined : `https://${checkout.ghost.referrerMode}.com`),
                  utm_source: checkout.ghost.utmSource,
                  utm_medium: checkout.ghost.utmMedium,
                  utm_campaign: checkout.ghost.utmCampaign
              };
          }

          const order = {
            id: data.id,
            amount: captureAmount,
            amount_cents: Math.round(parseFloat(captureAmount) * 100),
            currency: captureCurrency,
            status: "succeeded",
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            items: 1, 
            checkoutId: checkoutId,
            paymentProvider: "paypal",
            customerEmail: customerEmail || data.payer?.email_address,
            customerName: customerName || `${data.payer?.name?.given_name} ${data.payer?.name?.surname}`,
            customerCountry: customerCountry || data.payer?.address?.country_code,
            ...ghostMetadata
          };

          await db.saveOrder(order);
          res.json({ success: true, orderId: data.id });
      } else {
          res.status(400).json({ error: "Payment not completed" });
      }
  } catch (e) {
      res.status(500).json({ error: "PayPal Capture Error" });
  }
});

// Ghost Link Endpoints
app.get('/api/ghost-links', async (req, res) => {
    const links = await db.getAllGhostLinks();
    res.json(links);
});

app.post('/api/ghost-links', async (req, res) => {
    const link = req.body;
    await db.saveGhostLink(link);
    res.json({ success: true });
});

app.delete('/api/ghost-links/:id', async (req, res) => {
    await db.deleteGhostLink(req.params.id);
    res.json({ success: true });
});

app.post('/api/ghost-links/simulate', async (req, res) => {
    const { linkId, context } = req.body;
    const links = await db.getAllGhostLinks();
    const link = links.find((l: any) => l.id === linkId);
    
    if (!link) return res.status(404).json({ error: 'Link not found' });
    
    // Simulate resolution
    const result = resolveGhostRedirect(link, context);
    res.json(result);
});

// The Actual Redirect Handler
app.get('/g/:slug', async (req, res) => {
    const { slug } = req.params;
    const link = await db.getGhostLinkBySlug(slug);
    
    if (!link) {
        return res.status(404).send('Link not found or expired.');
    }

    // Determine Context
    const context = detectContext(req);
    
    // Execute Logic
    const decision = resolveGhostRedirect(link, context);
    
    if (decision.type === 'error') {
        return res.status(403).send(decision.reason);
    }

    // Increment Stats (Fire and forget)
    db.incrementGhostLinkClicks(link.id);

    // Perform Action
    if (decision.type === 'cloak') {
        // Simple IFrame Cloaking
        res.send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${slug}</title>
                    <style>body,html,iframe{margin:0;padding:0;height:100%;width:100%;border:none;overflow:hidden;}</style>
                </head>
                <body>
                    <iframe src="${decision.url}" allowfullscreen></iframe>
                </body>
            </html>
        `);
    } else {
        // Standard Redirect
        res.redirect(parseInt(link.redirect_type) || 307, decision.url);
    }
});

// Common Data Endpoints
app.get('/api/orders', async (req, res) => {
    const data = loadDb();
    res.json(data.orders || []);
});

app.get('/api/customers', async (req, res) => {
    const data = loadDb();
    res.json(data.customers || []);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
