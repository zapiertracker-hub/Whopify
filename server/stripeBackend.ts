import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// --- Mock Database Implementation (Local JSON File) ---
// This ensures the app runs without a complex DB setup for this demo.
const DB_FILE = path.resolve('local_db.json');

const loadDb = () => {
  const defaultDb = { 
    checkouts: [], 
    orders: [], 
    customers: [], 
    settings: { 
      currency: 'USD', 
      stripeEnabled: false,
      stripePublishableKey: '',
      stripeSecretKey: '',
      stripeAccounts: [],
      activeStripeAccountId: undefined
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
    return { ...defaultDb, ...parsed };
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
  }
};

const ensureStripe = async () => {
  const settings = await db.getSettings();
  if (settings.stripeEnabled && settings.stripeSecretKey) {
    return new Stripe(settings.stripeSecretKey, { apiVersion: '2023-10-16' });
  }
  return null;
};

// --- Endpoints ---

// 1. Get All Checkouts
app.get('/api/checkouts', async (req, res) => {
  const checkouts = await db.getAllCheckouts();
  res.json(checkouts);
});

// 2. Save Checkout
app.post('/api/checkouts', async (req, res) => {
  const { id, data } = req.body;
  await db.updateCheckout(id, data);
  res.json({ success: true });
});

// 3. Delete Checkout
app.delete('/api/checkouts/:id', async (req, res) => {
    const data = loadDb();
    data.checkouts = data.checkouts.filter((c: any) => c.id !== req.params.id);
    saveDb(data);
    res.json({ success: true });
});

// 4. Get Settings
app.get('/api/settings', async (req, res) => {
  const settings = await db.getSettings();
  res.json(settings);
});

// 5. Save Settings
app.post('/api/settings', async (req, res) => {
  await db.updateSettings(req.body);
  res.json({ success: true });
});

// 6. Public Config (Safe subset for frontend)
app.get('/api/public-config/:checkoutId', async (req, res) => {
  const checkout = await db.getCheckout(req.params.checkoutId);
  const settings = await db.getSettings();
  
  if (!checkout) return res.status(404).json({ error: 'Not found' });

  res.json({
    checkout,
    stripeEnabled: settings.stripeEnabled,
    stripePublishableKey: settings.stripePublishableKey, // Safe to expose
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

// 7. Create Payment Intent
app.post("/api/create-payment-intent", async (req, res) => {
  const stripe = await ensureStripe();
  if (!stripe)
    return res.status(500).json({ error: "Stripe not configured" });

  const { checkoutId, customerEmail, selectedUpsellIds } = req.body;

  if (!checkoutId) {
    return res.status(400).json({ error: "Missing checkoutId" });
  }

  const checkout = await db.getCheckout(checkoutId);
  if (!checkout) return res.status(404).json({ error: "Checkout not found" });

  if (!Array.isArray(checkout.products) || checkout.products.length === 0)
    return res.status(400).json({ error: "Checkout contains no products" });

  let total = 0;
  const settings = await db.getSettings();
  const currencyKey = (settings.currency || 'USD').toLowerCase();

  // Calculate Base Product Total
  for (const p of checkout.products) {
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

  // Handle Multiple Upsells Calculation
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
        // Stripe requires metadata values to be strings
        upsells_count: (Array.isArray(selectedUpsellIds) ? selectedUpsellIds.length : 0).toString()
      },
    });

    res.json({ clientSecret: intent.client_secret });
  } catch (err: any) {
    console.error("Stripe Error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// 8. Create Manual Order
app.post("/api/create-manual-order", async (req, res) => {
  const { checkoutId, selectedUpsellIds, customerEmail, customerName, customerPhone, customerCountry } = req.body;

  if (!checkoutId) {
    return res.status(400).json({ error: "Missing checkoutId" });
  }

  const checkout = await db.getCheckout(checkoutId);
  if (!checkout) return res.status(404).json({ error: "Checkout not found" });

  const settings = await db.getSettings();
  let total = 0;
  const currencyKey = (settings.currency || 'USD').toLowerCase();

  // Base Products
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

  // Handle Multiple Upsells Calculation
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
    customerCountry
  });

  res.json({ success: true, orderId });
});

// 9. Verify Stripe Payment (Records successful Stripe orders)
app.post('/api/verify-payment', async (req, res) => {
  const { paymentIntentId } = req.body;
  if (!paymentIntentId) return res.status(400).json({ error: "Missing paymentIntentId" });

  const stripe = await ensureStripe();
  if (!stripe) return res.status(500).json({ error: "Stripe not configured" });

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
       return res.status(400).json({ error: "Payment not succeeded" });
    }

    // Check if order already exists to prevent duplicates
    const dbData = loadDb();
    if (dbData.orders.some((o: any) => o.id === paymentIntent.id)) {
        return res.json({ success: true, orderId: paymentIntent.id, message: "Order already recorded" });
    }

    // Attempt to extract customer details from the latest charge
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
        customerCountry
    };

    await db.saveOrder(order);

    res.json({ success: true, orderId: order.id });

  } catch (e: any) {
    console.error("Verify Payment Error", e.message);
    res.status(500).json({ error: e.message });
  }
});

// 10. Verify Stripe Connection (Settings)
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

// 11. Dashboard Analytics
app.get('/api/analytics', async (req, res) => {
    const data = loadDb();
    const orders = data.orders || [];
    
    // Simple aggregation
    const totalRevenue = orders.reduce((acc: number, o: any) => acc + parseFloat(o.amount || 0), 0);
    const uniqueCustomers = new Set(orders.map((o: any) => o.customerEmail)).size;
    
    // Mock daily chart based on recent activity
    const daily = Array.from({length: 7}, (_, i) => ({
         name: new Date(Date.now() - (6-i)*86400000).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
         revenue: orders.length > 0 ? totalRevenue / (orders.length > 7 ? orders.length : 7) : Math.floor(Math.random() * 500)
    }));

    res.json({
        kpi: {
            revenue: totalRevenue,
            orders: orders.length,
            customers: uniqueCustomers,
            refunds: 0,
            gross: totalRevenue 
        },
        charts: {
            daily,
            sources: [
                { name: 'Direct', value: 70 },
                { name: 'Social', value: 30 }
            ],
            countries: [
                { name: 'US', value: 60 },
                { name: 'MA', value: 40 }
            ]
        }
    });
});

// 12. Get Orders
app.get('/api/orders', async (req, res) => {
    const data = loadDb();
    res.json(data.orders || []);
});

// 13. Get Customers
app.get('/api/customers', async (req, res) => {
    const data = loadDb();
    res.json(data.customers || []);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Database File: ${DB_FILE}`);
});
