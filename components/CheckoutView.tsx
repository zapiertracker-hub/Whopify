
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckoutPage, StoreSettings, PaymentMethod, OrderBump } from '../types';
import { AppContext } from '../AppContext';
import { 
  CreditCard, ChevronDown, ChevronUp, ShoppingCart, Loader2,
  AlertTriangle, Lock, AlertCircle, MessageCircle, ShoppingBag, Banknote,
  Landmark, DollarSign, Upload, Wallet, ArrowRight, CheckCircle2
} from 'lucide-react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { 
  Elements, useStripe, useElements,
  CardNumberElement, CardExpiryElement, CardCvcElement
} from '@stripe/react-stripe-js';
import { 
  trackAddPaymentInfo, trackPurchase, trackEvent 
} from '../services/analytics';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

// ... (Translations Object - Keep as is) ...
const translations = {
  en: {
    orderSummary: "Order summary",
    totalDue: "Total due today",
    fullName: "Full name",
    email: "Email address",
    phoneNumber: "Phone number",
    country: "Country or region",
    cardNumber: "Card number",
    expiry: "Expiration date",
    cvc: "Security code",
    promoCode: "Promo code",
    enterPromo: "Enter your promo code",
    apply: "Apply",
    payWithCard: "Card",
    payWithBank: "Bank Transfer",
    payWithCrypto: "Crypto",
    payWithManual: "Manual",
    orderNow: "Order now",
    placeOrder: "Place Order",
    completeOrder: "Complete Order",
    sentPayment: "I Have Sent Payment",
    processing: "Processing...",
    securedBy: "Secured by",
    terms: "Terms",
    privacy: "Privacy",
    disclaimer: "By joining, you agree to Terms and Conditions and allow Whopify to charge your card for this payment.",
    noMethods: "No payment methods are currently available.",
    accountDetails: "Account Details",
    instructions: "Instructions",
    paymentRef: "Payment Reference",
    proof: "Proof of Payment (Optional)",
    selectCurrency: "Select Currency",
    sendTo: "Send {coin} to this address",
    cryptoWarning: "Only send {coin} to this address. Sending any other currency may result in permanent loss.",
    orderFailed: "Order Failed",
    paymentFailed: "Payment Failed",
    demoMode: "Demo Mode: Payments simulated.",
    required: "Required",
    invalid: "Invalid"
  },
  fr: {
    orderSummary: "Récapitulatif de la commande",
    totalDue: "Total à payer aujourd'hui",
    fullName: "Nom complet",
    email: "Adresse e-mail",
    phoneNumber: "Numéro de téléphone",
    country: "Pays ou région",
    cardNumber: "Numéro de carte",
    expiry: "Date d'expiration",
    cvc: "Code de sécurité",
    promoCode: "Code promo",
    enterPromo: "Saisir votre code promo",
    apply: "Appliquer",
    payWithCard: "Carte bancaire",
    payWithBank: "Virement bancaire",
    payWithCrypto: "Crypto",
    payWithManual: "Manuel",
    orderNow: "Payer maintenant",
    placeOrder: "Commander",
    completeOrder: "Finaliser la commande",
    sentPayment: "J'ai envoyé le paiement",
    processing: "Traitement...",
    securedBy: "Sécurisé par",
    terms: "Conditions",
    privacy: "Confidentialité",
    disclaimer: "En confirmant, vous acceptez les Conditions Générales et autorisez Whopify à débiter votre carte pour ce paiement.",
    noMethods: "Aucun moyen de paiement n'est disponible pour le moment.",
    accountDetails: "Coordonnées bancaires",
    instructions: "Instructions",
    paymentRef: "Référence de paiement",
    proof: "Preuve de paiement (Optionnel)",
    selectCurrency: "Sélectionner la devise",
    sendTo: "Envoyer {coin} à cette adresse",
    cryptoWarning: "Envoyez uniquement du {coin} à cette adresse. L'envoi de toute autre devise peut entraîner une perte définitive.",
    orderFailed: "Échec de la commande",
    paymentFailed: "Échec du paiement",
    demoMode: "Mode Démo : Paiements simulés.",
    required: "Requis",
    invalid: "Invalide"
  }
};

type LangCode = 'en' | 'fr';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const SecurityFooter = ({ t }: { t: any }) => (
  <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex flex-col items-center gap-3 animate-in fade-in opacity-80">
    <div className="flex justify-center items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
      <Lock size={12} className="text-[var(--text-secondary)]" />
      <span>{t.securedBy} <span className="text-[var(--text-primary)] font-bold">Whopify</span></span>
    </div>
    <div className="flex items-center gap-4 text-[11px] text-[var(--text-secondary)]">
      <a href="#" className="hover:text-[var(--text-primary)] hover:underline transition-colors">{t.terms}</a>
      <span className="opacity-30">•</span>
      <a href="#" className="hover:text-[var(--text-primary)] hover:underline transition-colors">{t.privacy}</a>
    </div>
  </div>
);

const CustomerFields = ({ values, onChange, errors, onBlur, t }: { values: any, onChange: (field: string, value: string) => void, errors: any, onBlur?: (field: string) => void, t: any }) => (
  <div className="space-y-4">
     <div>
        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-2">{t.email}</label>
        <input type="email" value={values.email} onChange={(e) => onChange('email', e.target.value)} onBlur={() => onBlur && onBlur('email')} className={`w-full bg-[var(--bg-input)] border rounded-lg px-3 py-3 text-[var(--text-primary)] text-base lg:text-sm outline-none transition-all placeholder-[var(--text-placeholder)] ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--border-color)] focus:border-blue-600'}`} placeholder="you@example.com" />
        {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.email}</p>}
     </div>
     <div>
        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-2">{t.phoneNumber}</label>
        <input type="tel" value={values.phoneNumber} onChange={(e) => onChange('phoneNumber', e.target.value)} onBlur={() => onBlur && onBlur('phoneNumber')} className={`w-full bg-[var(--bg-input)] border rounded-lg px-3 py-3 text-[var(--text-primary)] text-base lg:text-sm outline-none transition-all placeholder-[var(--text-placeholder)] ${errors.phoneNumber ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--border-color)] focus:border-blue-600'}`} placeholder="+1 (555) 000-0000" />
        {errors.phoneNumber && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.phoneNumber}</p>}
     </div>
     <div>
        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-2">{t.fullName}</label>
        <input type="text" value={values.fullName} onChange={(e) => onChange('fullName', e.target.value)} onBlur={() => onBlur && onBlur('fullName')} className={`w-full bg-[var(--bg-input)] border rounded-lg px-3 py-3 text-[var(--text-primary)] text-base lg:text-sm outline-none transition-all placeholder-[var(--text-placeholder)] ${errors.fullName ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--border-color)] focus:border-blue-600'}`} />
        {errors.fullName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.fullName}</p>}
     </div>
     <div>
        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-2">{t.country}</label>
        <div className="relative">
            <select value={values.country} onChange={(e) => onChange('country', e.target.value)} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-3 text-[var(--text-primary)] text-base lg:text-sm outline-none focus:border-blue-600 appearance-none transition-all cursor-pointer">
                <option value="Morocco">Morocco</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="France">France</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
        </div>
     </div>
  </div>
);

// ... (Keep InteractiveCreditCardForm and LiveCreditCardForm as is) ...
const InteractiveCreditCardForm = ({ cardState, setCardState, errors, setErrors, t }: any) => {
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardState({ ...cardState, cardNumber: formatted });
    if (errors.cardNumber) setErrors({ ...errors, cardNumber: '' });
  };
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    let formatted = val;
    if (val.length >= 3) formatted = `${val.slice(0, 2)} / ${val.slice(2)}`;
    setCardState({ ...cardState, expiry: formatted });
    if (errors.expiry) setErrors({ ...errors, expiry: '' });
  };
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    setCardState({ ...cardState, cvc: val });
    if (errors.cvc) setErrors({ ...errors, cvc: '' });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">{t.cardNumber}</label>
        <div className={`relative group bg-[var(--bg-input)] border rounded-lg focus-within:ring-1 focus-within:ring-blue-600/20 transition-all ${errors.cardNumber ? 'border-red-500/50 focus-within:border-red-500' : 'border-[var(--border-color)] focus-within:border-blue-600'}`}>
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CreditCard size={16} className="text-[var(--text-secondary)]" /></div>
           <input type="text" value={cardState.cardNumber} onChange={handleCardNumberChange} placeholder="1234 1234 1234 1234" className="w-full bg-transparent border-none rounded-lg px-3 py-3 pl-10 text-[var(--text-primary)] text-base lg:text-sm outline-none font-mono placeholder-[var(--text-placeholder)]" />
           <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2 pointer-events-none">
              <div className="w-8 h-5 bg-white/10 rounded-sm flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-red-500/80 -mr-1.5 z-10"></div><div className="w-3 h-3 rounded-full bg-yellow-500/80"></div></div>
           </div>
        </div>
        {errors.cardNumber && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.cardNumber}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">{t.expiry}</label>
          <div className={`bg-[var(--bg-input)] border rounded-lg focus-within:ring-1 focus-within:ring-blue-600/20 transition-all ${errors.expiry ? 'border-red-500/50 focus-within:border-red-500' : 'border-[var(--border-color)] focus-within:border-blue-600'}`}>
              <input type="text" value={cardState.expiry} onChange={handleExpiryChange} placeholder="MM / YY" className="w-full bg-transparent border-none rounded-lg px-3 py-3 text-[var(--text-primary)] text-base lg:text-sm outline-none font-mono placeholder-[var(--text-placeholder)]" />
          </div>
          {errors.expiry && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.expiry}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">{t.cvc}</label>
          <div className={`relative bg-[var(--bg-input)] border rounded-lg focus-within:ring-1 focus-within:ring-blue-600/20 transition-all ${errors.cvc ? 'border-red-500/50 focus-within:border-red-500' : 'border-[var(--border-color)] focus-within:border-blue-600'}`}>
              <input type="text" value={cardState.cvc} onChange={handleCvcChange} placeholder="CVC" className="w-full bg-transparent border-none rounded-lg px-3 py-3 text-[var(--text-primary)] text-base lg:text-sm outline-none font-mono placeholder-[var(--text-placeholder)]" />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><CreditCard size={16} className="text-[var(--text-secondary)]" /></div>
          </div>
          {errors.cvc && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.cvc}</p>}
        </div>
      </div>
    </div>
  );
};

const LiveCreditCardForm = ({ appearance, errors, setErrors, t }: { appearance: 'light' | 'dark', errors: any, setErrors: any, t: any }) => {
  const elementOptions = {
    style: {
      base: { fontSize: '16px', color: appearance === 'light' ? '#111827' : '#ffffff', '::placeholder': { color: appearance === 'light' ? '#9ca3af' : '#525252' }, fontFamily: 'Inter, sans-serif', iconColor: appearance === 'light' ? '#6b7280' : '#9ca3af' },
      invalid: { color: '#ef4444' },
    },
  };
  const handleChange = (event: any, field: string) => {
    if (event.error) setErrors((prev: any) => ({ ...prev, [field]: event.error.message }));
    else setErrors((prev: any) => ({ ...prev, [field]: '' }));
  };
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">{t.cardNumber}</label>
        <div className={`relative group bg-[var(--bg-input)] border rounded-lg focus-within:ring-1 focus-within:ring-blue-600/20 transition-all ${errors.cardNumber ? 'border-red-500/50 focus-within:border-red-500' : 'border-[var(--border-color)] focus-within:border-blue-600'}`}>
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CreditCard size={16} className="text-[var(--text-secondary)]" /></div>
           <div className="pl-10 pr-3 py-3.5"><CardNumberElement options={{...elementOptions, showIcon: false}} onChange={(e) => handleChange(e, 'cardNumber')} /></div>
           <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2 pointer-events-none"><div className="w-8 h-5 bg-white/10 rounded-sm flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-red-500/80 -mr-1.5 z-10"></div><div className="w-3 h-3 rounded-full bg-yellow-500/80"></div></div></div>
        </div>
        {errors.cardNumber && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.cardNumber}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">{t.expiry}</label>
          <div className={`bg-[var(--bg-input)] border rounded-lg focus-within:ring-1 focus-within:ring-blue-600/20 transition-all ${errors.expiry ? 'border-red-500/50 focus-within:border-red-500' : 'border-[var(--border-color)] focus-within:border-blue-600'}`}>
              <div className="px-3 py-3.5"><CardExpiryElement options={elementOptions} onChange={(e) => handleChange(e, 'expiry')} /></div>
          </div>
          {errors.expiry && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.expiry}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">{t.cvc}</label>
          <div className={`relative bg-[var(--bg-input)] border rounded-lg focus-within:ring-1 focus-within:ring-blue-600/20 transition-all ${errors.cvc ? 'border-red-500/50 focus-within:border-red-500' : 'border-[var(--border-color)] focus-within:border-blue-600'}`}>
              <div className="px-3 py-3.5"><CardCvcElement options={elementOptions} onChange={(e) => handleChange(e, 'cvc')} /></div>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><CreditCard size={16} className="text-[var(--text-secondary)]" /></div>
          </div>
          {errors.cvc && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.cvc}</p>}
        </div>
      </div>
    </div>
  );
};

const InternalCheckoutForm = ({ totalDue, config, billingDetails, setBillingDetails, onValidationFailed, currency, appearance, errors, t, selectedUpsellIds }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardErrors, setCardErrors] = useState({ cardNumber: '', expiry: '', cvc: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = onValidationFailed(); // Validates customer fields in parent
    if (!isValid || Object.values(cardErrors).some(err => err !== '')) return;
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);
    trackAddPaymentInfo('stripe_elements', config.products, currency, totalDue);

    try {
      const res = await fetch(`${API_URL}/api/create-payment-intent`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ 
             checkoutId: config.id,
             customerEmail: billingDetails.email,
             customerName: billingDetails.fullName,
             selectedUpsellIds: Array.from(selectedUpsellIds)
         })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Payment initialization failed');

      const clientSecret = data.clientSecret;
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) throw new Error("Card element not found");

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { 
             name: billingDetails.fullName, 
             email: billingDetails.email, 
             phone: billingDetails.phoneNumber,
             address: { country: billingDetails.country === 'Morocco' ? 'MA' : 'US' } 
          }
        }
      });

      if (error) {
        setErrorMessage(error.message || "An unexpected error occurred.");
        setIsProcessing(false);
        trackEvent('payment_error', { error_type: error.type, error_message: error.message });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
         await fetch(`${API_URL}/api/verify-payment`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ paymentIntentId: paymentIntent.id })
         });
         trackPurchase(paymentIntent.id, totalDue, currency, config.products);
         navigate('/order-confirmation');
      }
    } catch (err: any) {
       setErrorMessage(err.message || "Network error. Please try again.");
       setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in pt-2">
      <LiveCreditCardForm appearance={appearance} errors={cardErrors} setErrors={setCardErrors} t={t} />
      {errorMessage && <div className="flex items-start gap-3 text-red-400 text-sm bg-red-900/10 p-4 rounded-xl border border-red-900/30"><AlertTriangle size={20} className="shrink-0 mt-0.5 text-red-500" /><div className="flex-1"><span className="font-semibold block mb-1 text-red-300">{t.paymentFailed}</span><span>{errorMessage}</span></div></div>}
      <div>
        <button type="submit" disabled={!stripe || isProcessing} className="w-full bg-[#1754d8] hover:bg-[#154dc0] text-white font-bold py-3.5 rounded-lg transition-all active:scale-95 shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isProcessing ? (<><Loader2 size={16} className="animate-spin" /> {t.processing}</>) : (t.orderNow)}
        </button>
      </div>
    </form>
  );
};

const ManualCheckoutForm = ({ config, settings, billingDetails, setBillingDetails, onValidationFailed, errors, t, selectedUpsellIds }: any) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = onValidationFailed();
    if (!isValid) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
        const res = await fetch(`${API_URL}/api/create-manual-order`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ 
                 checkoutId: config.id,
                 customerEmail: billingDetails.email,
                 customerName: billingDetails.fullName,
                 customerPhone: billingDetails.phoneNumber,
                 customerCountry: billingDetails.country,
                 selectedUpsellIds: Array.from(selectedUpsellIds)
             })
        });
        
        if (!res.ok) throw new Error('Failed to create order');
        const data = await res.json();
        
        navigate('/order-confirmation');
    } catch (err: any) {
        setErrorMessage("Could not submit order. Please try again.");
        setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in pt-2">
        <div className="bg-[var(--bg-input)] p-4 rounded-lg border border-[var(--border-color)]">
                <p className="text-sm text-[var(--text-primary)] whitespace-pre-line leading-relaxed">
                    {settings.manualPaymentInstructions || 'Please contact support for payment instructions.'}
                </p>
        </div>
        {errorMessage && <div className="flex items-start gap-3 text-red-400 text-sm bg-red-900/10 p-4 rounded-xl border border-red-900/30"><AlertTriangle size={20} className="shrink-0 mt-0.5 text-red-500" /><div className="flex-1"><span className="font-semibold block mb-1 text-red-300">{t.orderFailed}</span><span>{errorMessage}</span></div></div>}
        <button type="submit" disabled={isProcessing} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-lg transition-all active:scale-95 shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isProcessing ? (<><Loader2 size={16} className="animate-spin" /> {t.processing}</>) : (t.placeOrder)}
        </button>
    </form>
  );
};

// ... Bank and Crypto Forms Unchanged but omitting for brevity in this response ...
// (Assume BankTransferForm and CryptoPaymentForm exist as before)
const BankTransferForm = ({ settings, billingDetails, setBillingDetails, onValidationFailed, errors, t }: any) => {
  const [reference, setReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onValidationFailed()) return;
    if (!reference.trim()) {
        alert("Please enter the payment reference.");
        return;
    }

    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
        navigate('/order-confirmation');
    }, 1500);
  };

  return (
      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in pt-2">
        <div className="space-y-4">
             <div className="bg-[var(--bg-input)] p-4 rounded-lg border border-[var(--border-color)]">
                    <p className="text-sm font-bold text-[var(--text-primary)] mb-2">{t.accountDetails}</p>
                    <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line font-mono">
                        {settings.bankTransferDetails || 'No bank details configured.'}
                    </p>
            </div>
            <div className="bg-[var(--bg-input)] p-4 rounded-lg border border-[var(--border-color)]">
                    <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line">
                        {settings.bankTransferInstructions || 'Please transfer the total amount to the account above.'}
                    </p>
            </div>
        </div>
        
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-2">{t.paymentRef}</label>
                <input 
                    type="text" 
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-3 text-[var(--text-primary)] outline-none focus:border-blue-600 transition-all placeholder-[var(--text-placeholder)]"
                    placeholder="e.g. Transaction ID, Sender Name"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-2">{t.proof}</label>
                <div className="relative">
                    <input 
                        type="file" 
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
                    />
                    <Upload size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
                </div>
            </div>
        </div>

        <button type="submit" disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-all active:scale-95 shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {isProcessing ? (<><Loader2 size={16} className="animate-spin" /> {t.processing}</>) : (t.completeOrder)}
        </button>
    </form>
  )
}

const CryptoPaymentForm = ({ settings, billingDetails, setBillingDetails, onValidationFailed, errors, t }: any) => {
    const [selectedCoin, setSelectedCoin] = useState(settings.cryptoOptions?.[0] || 'BTC');
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onValidationFailed()) return;
        setIsProcessing(true);
        setTimeout(() => navigate('/order-confirmation'), 1500);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in pt-2">
             <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-2">{t.selectCurrency}</label>
                    <div className="flex gap-2 flex-wrap">
                        {(settings.cryptoOptions || ['BTC', 'ETH']).map((coin: string) => (
                            <button
                                key={coin}
                                type="button"
                                onClick={() => setSelectedCoin(coin)}
                                className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${selectedCoin === coin ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-600 dark:text-orange-400' : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-orange-500/50'}`}
                            >
                                {coin}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="bg-[var(--bg-input)] p-4 rounded-lg border border-[var(--border-color)] text-center">
                        <p className="text-xs text-[var(--text-secondary)] uppercase mb-2 font-bold">{t.sendTo.replace('{coin}', selectedCoin)}</p>
                        <div className="font-mono text-sm text-[var(--text-primary)] break-all bg-[var(--bg-page)] p-3 rounded border border-[var(--border-color)] select-all">
                            {settings.cryptoWalletAddress || 'No wallet address configured.'}
                        </div>
                        <p className="text-xs text-orange-500 mt-2 font-medium">{t.cryptoWarning.replace('{coin}', selectedCoin)}</p>
                </div>
             </div>

             <button type="submit" disabled={isProcessing} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-lg transition-all active:scale-95 shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {isProcessing ? (<><Loader2 size={16} className="animate-spin" /> {t.processing}</>) : (t.sentPayment)}
            </button>
        </form>
    );
}

export const CheckoutRenderer = ({ checkout: config, settings, isPreview = false, previewMode = 'desktop' }: { checkout: CheckoutPage, settings: any, isPreview?: boolean, previewMode?: 'desktop' | 'mobile' | 'tablet' }) => {
  const navigate = useNavigate();
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const forceMobileLayout = isPreview && previewMode !== 'desktop';
  const [isDemo, setIsDemo] = useState(isPreview);
  const [promoCode, setPromoCode] = useState('');
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('Morocco');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [cardState, setCardState] = useState({ cardNumber: '', expiry: '', cvc: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Upsell State (Multiple)
  const [selectedUpsellIds, setSelectedUpsellIds] = useState<Set<string>>(new Set());

  // Enabled Payment Methods Logic
  const enabledMethods = config.paymentMethods.filter((m: PaymentMethod) => {
      switch (m) {
          case 'stripe': return settings.stripeEnabled && (isDemo || settings.stripePublishableKey);
          case 'manual': return settings.manualPaymentEnabled;
          case 'bank_transfer': return settings.bankTransferEnabled;
          case 'crypto': return settings.cryptoEnabled;
          default: return false;
      }
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
     if (enabledMethods.length > 0) {
         if (!paymentMethod || !enabledMethods.includes(paymentMethod)) {
             setPaymentMethod(enabledMethods[0]);
         }
     } else {
         setPaymentMethod(null);
     }
  }, [enabledMethods, paymentMethod]); 

  const updateBilling = (field: string, value: string) => {
      if (field === 'fullName') setFullName(value);
      if (field === 'email') setEmail(value);
      if (field === 'phoneNumber') setPhoneNumber(value);
      if (field === 'country') setCountry(value);
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleBillingBlur = (field: string) => {
      const newErrors = { ...errors };
      if (field === 'email') {
          if (!email) newErrors.email = t.required;
          else if (!isValidEmail(email)) newErrors.email = t.invalid;
          else newErrors.email = '';
      }
      if (field === 'phoneNumber') {
          if (!phoneNumber) newErrors.phoneNumber = t.required;
          else newErrors.phoneNumber = '';
      }
      setErrors(newErrors);
  };

  useEffect(() => {
    setIsDemo(isPreview || (!settings.stripePublishableKey && !settings.manualPaymentEnabled));
  }, [isPreview, settings.stripePublishableKey, settings.manualPaymentEnabled]);

  useEffect(() => {
    if (!isDemo && settings.stripeEnabled && settings.stripePublishableKey && !settings.stripePublishableKey.includes('...')) {
      setStripePromise(loadStripe(settings.stripePublishableKey));
    } else {
      setStripePromise(null);
    }
  }, [settings.stripeEnabled, settings.stripePublishableKey, isDemo]);

  const firstProduct = config.products && config.products.length > 0 ? config.products[0] : null;
  const currency = (firstProduct?.currency || config.currency || settings.currency || 'USD').toUpperCase();
  const lang: LangCode = (config.language as LangCode) || 'en';
  const t = translations[lang] || translations['en'];

  const getCurrencySymbol = (code: string) => {
    switch(code) {
        case 'EUR': return '€';
        case 'GBP': return '£';
        case 'MAD': return 'DH';
        default: return '$';
    }
  };
  
  const currencySymbol = getCurrencySymbol(currency);

  const getProductPrice = (p: any) => {
      const currencyKey = currency.toLowerCase();
      let price = 0;
      if (p.pricing?.oneTime?.enabled) {
          price = p.pricing.oneTime.prices[currencyKey] !== undefined ? p.pricing.oneTime.prices[currencyKey] : p.pricing.oneTime.prices.usd;
      } else if (p.pricing?.subscription?.enabled) {
          price = p.pricing.subscription.prices[currencyKey] !== undefined ? p.pricing.subscription.prices[currencyKey] : p.pricing.subscription.prices.usd;
      } else if (p.pricing?.paymentPlan?.enabled) {
          price = p.pricing.paymentPlan.prices[currencyKey] !== undefined ? p.pricing.paymentPlan.prices[currencyKey] : p.pricing.paymentPlan.prices.usd;
      } else {
           price = p.price || 0;
      }
      return price || 0;
  };

  const productTotal = config.products.reduce((acc: any, p: any) => acc + getProductPrice(p), 0);
  
  // Calculate Upsell Total
  // Legacy upsell support + new array support
  const allUpsells = [...(config.upsells || []), ...(config.upsell?.enabled ? [config.upsell] : [])].filter(u => u && u.enabled);
  
  const upsellTotal = allUpsells.reduce((acc, u) => {
      if (selectedUpsellIds.has(u.id)) {
          return acc + (u.price || 0);
      }
      return acc;
  }, 0);

  const totalDue = productTotal + upsellTotal;

  const toggleUpsell = (id: string) => {
      const newSet = new Set(selectedUpsellIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedUpsellIds(newSet);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullName || fullName.length < 2) newErrors.fullName = t.required;
    if (!email || !isValidEmail(email)) newErrors.email = t.invalid;
    if (!phoneNumber || phoneNumber.length < 6) newErrors.phoneNumber = t.invalid;
    if (isDemo && paymentMethod === 'stripe') {
        if (cardState.cardNumber.length < 16) newErrors.cardNumber = t.invalid;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleManualOrderPreview = () => {
     if (!validateForm()) return;
     setIsProcessing(true);
     setTimeout(() => { setIsProcessing(false); navigate('/order-confirmation'); }, 1500);
  };

  const appearance = config.appearance || 'dark';
  const themeStyles = {
    '--bg-page': appearance === 'light' ? '#f1f1f1' : '#020202',
    '--bg-panel': appearance === 'light' ? '#ffffff' : '#0a0a0a',
    '--bg-card': appearance === 'light' ? '#ffffff' : '#111111',
    '--bg-input': appearance === 'light' ? '#ffffff' : '#161616',
    '--text-primary': appearance === 'light' ? '#111827' : '#ffffff',
    '--text-secondary': appearance === 'light' ? '#6b7280' : '#9ca3af',
    '--border-color': appearance === 'light' ? '#e5e7eb' : '#27272a',
    '--text-placeholder': appearance === 'light' ? '#9ca3af' : '#525252',
  } as React.CSSProperties;

  const ProductList = () => (
      <div className="space-y-4 mb-6">
          {config.products.map((product: any) => {
              const price = getProductPrice(product);
              return (
                  <div key={product.id} className="flex gap-4 items-start">
                       <div className="relative w-16 h-16 bg-[var(--bg-input)] rounded-lg border border-[var(--border-color)] overflow-hidden shrink-0">
                           {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
                                  <ShoppingBag size={20} />
                              </div>
                           )}
                           <span className="absolute top-0 right-0 w-5 h-5 bg-[var(--text-secondary)] text-[var(--bg-panel)] rounded-bl-lg text-xs font-bold flex items-center justify-center">1</span>
                       </div>
                       <div className="flex-1">
                           <h3 className="font-bold text-[var(--text-primary)] text-sm">{product.name}</h3>
                           {product.description && <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-0.5">{product.description}</p>}
                       </div>
                       <div className="font-bold text-[var(--text-primary)] text-sm">
                           {currencySymbol}{price.toFixed(2)}
                       </div>
                  </div>
              );
          })}
          
          {/* Render Selected Upsells in Summary */}
          {allUpsells.map(upsell => {
              if (selectedUpsellIds.has(upsell.id)) {
                  return (
                      <div key={upsell.id} className="flex gap-4 items-start animate-in fade-in slide-in-from-top-2">
                           <div className="relative w-16 h-16 bg-[var(--bg-input)] rounded-lg border border-dashed border-[#f97316]/50 overflow-hidden shrink-0 flex items-center justify-center">
                               {upsell.image ? (
                                  <img src={upsell.image} alt="Upsell" className="w-full h-full object-cover" />
                               ) : (
                                  <div className="text-[#f97316]"><ArrowRight size={20} /></div>
                               )}
                           </div>
                           <div className="flex-1">
                               <h3 className="font-bold text-[var(--text-primary)] text-sm">{upsell.title}</h3>
                               {upsell.offerType === 'multi_month' && (
                                   <p className="text-[10px] text-[#f97316] font-bold mt-0.5">
                                       {upsell.durationMonths} Months Bundle
                                   </p>
                               )}
                           </div>
                           <div className="font-bold text-[var(--text-primary)] text-sm">
                               {currencySymbol}{upsell.price.toFixed(2)}
                           </div>
                      </div>
                  );
              }
              return null;
          })}
      </div>
  );

  const renderPaymentMethodIcon = (method: PaymentMethod) => {
      switch (method) {
          case 'stripe': return <CreditCard size={14} />;
          case 'bank_transfer': return <Landmark size={14} />;
          case 'crypto': return <DollarSign size={14} />;
          case 'manual': return <Banknote size={14} />;
          default: return <Wallet size={14} />;
      }
  };

  const renderPaymentMethodLabel = (method: PaymentMethod) => {
        switch (method) {
            case 'stripe': return t.payWithCard;
            case 'bank_transfer': return t.payWithBank;
            case 'crypto': return t.payWithCrypto;
            case 'manual': return settings.manualPaymentLabel || t.payWithManual;
            default: return method;
        }
  };

  return (
    <div style={themeStyles} className={`font-sans text-[var(--text-primary)] bg-[var(--bg-page)] ${isPreview ? 'h-full overflow-y-auto' : 'min-h-screen'} scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700`}>
      <div className={`${forceMobileLayout ? 'flex flex-col' : 'lg:grid lg:grid-cols-2'} ${isPreview ? 'min-h-full' : 'min-h-screen'}`}>
        <div className={`${forceMobileLayout ? 'hidden' : 'hidden lg:flex'} flex-col bg-[var(--bg-panel)] border-r border-[var(--border-color)] relative p-12 xl:p-24 ${isPreview ? 'min-h-full' : 'h-screen sticky top-0'} overflow-hidden`}>
           <div className="w-full max-w-md mx-auto my-auto space-y-8">
              {config.logo ? <div className="mb-8"><img src={config.logo} alt="Store Logo" style={{ height: `${(config.logoScale || 100) / 100 * 40}px` }} className="object-contain" /></div> : <div className="mb-8 text-3xl font-bold text-[var(--text-primary)] tracking-tight">{config.name}</div>}
              
              <ProductList />

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">{t.promoCode}</label>
                    <div className="flex items-center gap-0 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg p-1">
                        <input type="text" placeholder={t.enterPromo} value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="bg-transparent border-none text-sm text-[var(--text-primary)] w-full px-3 py-2 focus:ring-0 placeholder-[var(--text-placeholder)] outline-none" />
                        <button className="text-sm font-medium text-[#1754d8] bg-[#1754d8]/10 px-4 py-2 rounded-md transition-transform active:scale-95">{t.apply}</button>
                    </div>
                 </div>
                 <div className="flex justify-between items-center text-sm font-medium text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-6"><span>{t.totalDue}</span><span className="text-[var(--text-primary)] font-bold text-xl">{currencySymbol}{totalDue.toFixed(2)}</span></div>
              </div>
           </div>
        </div>
        <div className={`bg-[var(--bg-page)] flex flex-col ${isPreview ? 'min-h-full py-6' : 'min-h-screen py-8'} ${forceMobileLayout ? 'px-4' : 'p-4 lg:py-24 lg:p-24'} relative text-[var(--text-primary)]`}>
           <div className={`w-full max-w-lg mx-auto space-y-6 ${forceMobileLayout ? '' : 'lg:my-auto lg:space-y-8'}`}>
              <div className={`${forceMobileLayout ? 'flex' : 'lg:hidden flex'} justify-center mb-6`}>
                 {config.logo ? <img src={config.logo} alt="Logo" style={{ height: `${(config.logoScale || 100) / 100 * 32}px` }} className="object-contain" /> : <div className="text-2xl font-bold text-[var(--text-primary)]">{config.name}</div>}
              </div>
              <div className={`${forceMobileLayout ? 'block' : 'lg:hidden'}`}>
                  <button onClick={() => setShowMobileSummary(!showMobileSummary)} className="w-full py-3 px-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg flex items-center justify-between text-sm text-[var(--text-primary)] font-medium shadow-sm transition-colors active:scale-95">
                      <span className="flex items-center gap-2"><ShoppingCart size={16} /> {t.orderSummary}</span><span className="flex items-center gap-2 font-bold">{currencySymbol}{totalDue.toFixed(2)} {showMobileSummary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                  </button>
                  {showMobileSummary && (
                      <div className="mt-2 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] space-y-4">
                          <ProductList />
                          <div className="flex justify-between items-center text-sm font-medium text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-4"><span>{t.totalDue}</span><span className="text-[var(--text-primary)] text-lg font-bold">{currencySymbol}{totalDue.toFixed(2)}</span></div>
                      </div>
                  )}
              </div>
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  {/* Global Customer Fields */}
                  <CustomerFields values={{ fullName, email, phoneNumber, country }} onChange={updateBilling} errors={errors} onBlur={handleBillingBlur} t={t} />
                  
                  {/* Multiple Order Bumps */}
                  {allUpsells.length > 0 && (
                      <div className="mt-6 space-y-4">
                          {allUpsells.map(upsell => {
                              const isSelected = selectedUpsellIds.has(upsell.id);
                              return (
                                  <div 
                                     key={upsell.id}
                                     onClick={() => toggleUpsell(upsell.id)}
                                     className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex gap-4 items-start ${isSelected ? 'border-[#f97316] bg-[#f97316]/5' : 'border-dashed border-[var(--border-color)] bg-[var(--bg-card)] hover:border-gray-400'}`}
                                  >
                                     <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-[#f97316] border-[#f97316] text-white' : 'border-[var(--text-secondary)]'}`}>
                                         {isSelected && <ArrowRight size={14} className="rotate-45" strokeWidth={3} />}
                                     </div>
                                     <div className="flex-1">
                                         <div className="flex justify-between items-start">
                                             <h4 className="font-bold text-[var(--text-primary)] text-sm">{upsell.title}</h4>
                                             <span className="font-bold text-[#f97316] text-sm">{currencySymbol}{upsell.price.toFixed(2)}</span>
                                         </div>
                                         <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{upsell.description}</p>
                                         
                                         {/* Show calculation breakdown if applicable */}
                                         {upsell.offerType === 'multi_month' && upsell.monthlyPrice && (
                                             <div className="mt-2 inline-block px-2 py-1 bg-[#f97316]/10 rounded text-[10px] font-bold text-[#f97316]">
                                                 {currencySymbol}{upsell.monthlyPrice} / month × {upsell.durationMonths} months
                                             </div>
                                         )}
                                     </div>
                                     {upsell.image && <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0"><img src={upsell.image} className="w-full h-full object-cover" /></div>}
                                  </div>
                              );
                          })}
                      </div>
                  )}

                  {/* Payment Methods */}
                  <div className="space-y-4 mt-6">
                      {enabledMethods.length === 0 && (
                          <div className="p-4 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg text-sm text-center font-medium flex items-center justify-center gap-2">
                              <AlertCircle size={16} /> {t.noMethods}
                          </div>
                      )}

                      {enabledMethods.map((method) => {
                          const isSelected = paymentMethod === method;
                          return (
                              <div 
                                  key={method} 
                                  className={`border rounded-xl overflow-hidden transition-all duration-200 ${isSelected ? 'border-blue-600 ring-1 ring-blue-600 bg-[var(--bg-card)] shadow-md' : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-blue-300'}`}
                              >
                                  <div 
                                      onClick={() => setPaymentMethod(method)}
                                      className="flex items-center gap-3 p-4 cursor-pointer select-none"
                                  >
                                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-blue-600' : 'border-[var(--text-secondary)]'}`}>
                                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                      </div>
                                      <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                                          {renderPaymentMethodIcon(method)}
                                          {renderPaymentMethodLabel(method)}
                                      </div>
                                  </div>

                                  {isSelected && (
                                      <div className="p-4 pt-0 border-t border-[var(--border-color)] mt-2">
                                          {method === 'stripe' && (
                                              isDemo ? (
                                                  <div className="space-y-6 pt-2">
                                                      {!isPreview && <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400"><AlertTriangle size={14} /><span>{t.demoMode}</span></div>}
                                                      <InteractiveCreditCardForm cardState={cardState} setCardState={setCardState} errors={errors} setErrors={setErrors} t={t} />
                                                      <button disabled={isProcessing} onClick={handleManualOrderPreview} className="w-full bg-[#1754d8] hover:bg-[#154dc0] text-white font-bold py-3.5 rounded-lg transition-all active:scale-95 shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                                          {isProcessing ? (<><Loader2 size={16} className="animate-spin" /> {t.processing}</>) : (t.orderNow)}
                                                      </button>
                                                  </div>
                                              ) : (
                                                  stripePromise && (
                                                      <Elements stripe={stripePromise}>
                                                          <InternalCheckoutForm totalDue={totalDue} config={config} billingDetails={{ fullName, email, phoneNumber, country }} setBillingDetails={updateBilling} onValidationFailed={validateForm} currency={currency} appearance={appearance} errors={errors} t={t} selectedUpsellIds={selectedUpsellIds} />
                                                      </Elements>
                                                  )
                                              )
                                          )}
                                          {method === 'manual' && (
                                              <ManualCheckoutForm config={config} settings={settings} billingDetails={{ fullName, email, phoneNumber, country }} setBillingDetails={updateBilling} onValidationFailed={validateForm} errors={errors} t={t} selectedUpsellIds={selectedUpsellIds} />
                                          )}
                                          {method === 'bank_transfer' && (
                                              <BankTransferForm settings={settings} billingDetails={{ fullName, email, phoneNumber, country }} setBillingDetails={updateBilling} onValidationFailed={validateForm} errors={errors} t={t} />
                                          )}
                                          {method === 'crypto' && (
                                              <CryptoPaymentForm settings={settings} billingDetails={{ fullName, email, phoneNumber, country }} setBillingDetails={updateBilling} onValidationFailed={validateForm} errors={errors} t={t} />
                                          )}
                                      </div>
                                  )}
                              </div>
                          )
                      })}
                  </div>
              </div>
              <div className="mt-8 text-[10px] text-center text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">{t.disclaimer}</div>
              <SecurityFooter t={t} />
           </div>
        </div>
      </div>
      
      {settings.whatsappEnabled && settings.whatsappNumber && (
         <a 
           href={`https://wa.me/${settings.whatsappNumber}`} 
           target="_blank" 
           rel="noopener noreferrer"
           className="fixed bottom-6 left-6 z-50 bg-[#25D366] text-white p-3.5 rounded-full shadow-lg hover:bg-[#20b858] transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
           title="Chat on WhatsApp"
         >
           <MessageCircle size={28} fill="currentColor" />
         </a>
      )}
    </div>
  );
};

const CheckoutView = () => {
  const { checkoutId } = useParams();
  const { checkouts, settings } = useContext(AppContext);
  
  const [config, setConfig] = useState<CheckoutPage | null>(null);
  const [publicSettings, setPublicSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     fetch(`${API_URL}/api/public-config/${checkoutId}`)
       .then(res => {
           if (!res.ok) throw new Error("Not Found");
           return res.json();
       })
       .then(data => {
           setConfig(data.checkout);
           setPublicSettings({
               stripeEnabled: data.stripeEnabled,
               stripePublishableKey: data.stripePublishableKey,
               currency: data.currency,
               whatsappEnabled: data.whatsappEnabled,
               whatsappNumber: data.whatsappNumber,
               manualPaymentEnabled: data.manualPaymentEnabled,
               manualPaymentLabel: data.manualPaymentLabel,
               manualPaymentInstructions: data.manualPaymentInstructions,
               bankTransferEnabled: data.bankTransferEnabled,
               bankTransferDetails: data.bankTransferDetails,
               bankTransferInstructions: data.bankTransferInstructions,
               cryptoEnabled: data.cryptoEnabled,
               cryptoOptions: data.cryptoOptions,
               cryptoWalletAddress: data.cryptoWalletAddress
           });
       })
       .catch(err => {
           const found = checkouts.find(c => c.id === checkoutId);
           if (found) {
               setConfig(found);
               setPublicSettings({
                   stripeEnabled: false,
                   stripePublishableKey: '',
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
           }
       })
       .finally(() => setLoading(false));
  }, [checkoutId, checkouts]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black"><div className="text-center space-y-3"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /><p className="text-gray-500">Loading secure checkout...</p></div></div>;
  }

  if (!config || !publicSettings) {
      return <div className="min-h-screen flex items-center justify-center bg-black text-white">Checkout not found.</div>;
  }

  return <CheckoutRenderer checkout={config} settings={publicSettings} />;
};

export default CheckoutView;
