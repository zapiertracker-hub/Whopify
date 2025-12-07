
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckoutPage, StoreSettings, PaymentMethod, OrderBump, Coupon } from '../types';
import { AppContext } from '../AppContext';
import { 
  CreditCard, ChevronDown, ChevronUp, ShoppingCart, Loader2,
  AlertTriangle, Lock, AlertCircle, MessageCircle, ShoppingBag, Banknote,
  Landmark, DollarSign, Upload, Wallet, ArrowRight, CheckCircle2, Tag, X
} from 'lucide-react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { 
  Elements, useStripe, useElements,
  CardNumberElement, CardExpiryElement, CardCvcElement,
  PaymentRequestButtonElement
} from '@stripe/react-stripe-js';
import { 
  trackAddPaymentInfo, trackPurchase, trackEvent 
} from '../services/analytics';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

const COUNTRIES_LIST = [
  "France", "United States", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const translations = {
  en: {
    orderSummary: "Order summary",
    totalDue: "Total due today",
    customerInfo: "Customer Info",
    payment: "Payment",
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
    invalid: "Invalid",
    orPayWithCard: "Or pay with card",
    expressCheckout: "Express Checkout",
    discountApplied: "Discount Applied",
    codeInvalid: "Invalid code",
    codeExpired: "Code expired"
  },
  fr: {
    orderSummary: "Résumé de la commande",
    totalDue: "Total à payer",
    customerInfo: "Coordonnées",
    payment: "Paiement",
    fullName: "Nom complet",
    email: "Adresse e-mail",
    phoneNumber: "Téléphone",
    country: "Pays ou région",
    cardNumber: "Numéro de carte",
    expiry: "Expiration",
    cvc: "CVC",
    promoCode: "Code promo",
    enterPromo: "Ajouter un code promo",
    apply: "Appliquer",
    payWithCard: "Carte bancaire",
    payWithBank: "Virement bancaire",
    payWithCrypto: "Cryptomonnaie",
    payWithManual: "Paiement manuel",
    orderNow: "Payer",
    placeOrder: "Commander",
    completeOrder: "Confirmer la commande",
    sentPayment: "Paiement envoyé",
    processing: "Traitement...",
    securedBy: "Sécurisé par",
    terms: "Conditions",
    privacy: "Confidentialité",
    disclaimer: "En validant, vous acceptez les Conditions Générales et autorisez le débit de votre carte.",
    noMethods: "Aucune méthode de paiement disponible.",
    accountDetails: "Coordonnées bancaires",
    instructions: "Instructions",
    paymentRef: "Référence de paiement",
    proof: "Preuve de paiement (Facultatif)",
    selectCurrency: "Choisir la devise",
    sendTo: "Envoyer {coin} à cette adresse",
    cryptoWarning: "Envoyez uniquement du {coin} à cette adresse. Tout autre envoi sera perdu.",
    orderFailed: "Échec de la commande",
    paymentFailed: "Échec du paiement",
    demoMode: "Mode Démo : Paiements simulés.",
    required: "Requis",
    invalid: "Invalide",
    orPayWithCard: "Ou payer par carte",
    expressCheckout: "Paiement Rapide",
    discountApplied: "Réduction appliquée",
    codeInvalid: "Code invalide",
    codeExpired: "Code expiré"
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

const CustomerFields = ({ values, onChange, errors, onBlur, t, collectPhone = true }: { values: any, onChange: (field: string, value: string) => void, errors: any, onBlur?: (field: string) => void, t: any, collectPhone?: boolean }) => (
  <div className="space-y-4">
     <div>
        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-2">{t.email}</label>
        <input type="email" value={values.email} onChange={(e) => onChange('email', e.target.value)} onBlur={() => onBlur && onBlur('email')} className={`w-full bg-[var(--bg-input)] border rounded-lg px-3 py-3 text-[var(--text-primary)] text-base lg:text-sm outline-none transition-all placeholder-[var(--text-placeholder)] ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--border-color)] focus:border-blue-600'}`} placeholder="you@example.com" />
        {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.email}</p>}
     </div>
     {collectPhone && (
         <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-2">{t.phoneNumber}</label>
            <input type="tel" value={values.phoneNumber} onChange={(e) => onChange('phoneNumber', e.target.value)} onBlur={() => onBlur && onBlur('phoneNumber')} className={`w-full bg-[var(--bg-input)] border rounded-lg px-3 py-3 text-[var(--text-primary)] text-base lg:text-sm outline-none transition-all placeholder-[var(--text-placeholder)] ${errors.phoneNumber ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--border-color)] focus:border-blue-600'}`} placeholder="+1 (555) 000-0000" />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.phoneNumber}</p>}
         </div>
     )}
     <div>
        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-2">{t.fullName}</label>
        <input type="text" value={values.fullName} onChange={(e) => onChange('fullName', e.target.value)} onBlur={() => onBlur && onBlur('fullName')} className={`w-full bg-[var(--bg-input)] border rounded-lg px-3 py-3 text-[var(--text-primary)] text-base lg:text-sm outline-none transition-all placeholder-[var(--text-placeholder)] ${errors.fullName ? 'border-red-500/50 focus:border-red-500' : 'border-[var(--border-color)] focus:border-blue-600'}`} />
        {errors.fullName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.fullName}</p>}
    </div>
    <div>
        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-2">{t.country}</label>
        <div className="relative">
            <select value={values.country} onChange={(e) => onChange('country', e.target.value)} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-3 text-[var(--text-primary)] text-base lg:text-sm outline-none focus:border-blue-600 appearance-none transition-all cursor-pointer">
                {COUNTRIES_LIST.map(country => (
                    <option key={country} value={country}>{country}</option>
                ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
        </div>
    </div>
  </div>
);

// --- Logos ---
const ApplePayLogo = () => (
  <svg width="40" height="17" viewBox="0 0 40 17" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.7 6.8C5.7 9.3 7.8 10.3 7.9 10.4C7.9 10.4 7.6 11.5 6.8 12.6C6.1 13.6 5.4 14.6 4.3 14.6C3.2 14.6 2.9 13.9 1.7 13.9C0.5 13.9 0.1 14.6 -0.9 14.6C-1.9 14.6 -2.6 13.7 -3.3 12.7C-4.7 10.7 -5.2 8.1 -4.5 6.2C-4.1 5.2 -3.1 4.1 -1.8 4.1C-0.8 4.1 0.1 4.8 0.7 4.8C1.3 4.8 2.6 4.1 3.8 4.1C4.3 4.1 5.7 4.3 6.3 5.2C6.3 5.2 5.7 5.6 5.7 6.8Z" transform="translate(6.5, -1)" />
    <path d="M3.3 2.9C3.8 2.3 4.1 1.5 4 0.7C3.3 0.8 2.4 1.2 1.9 1.8C1.4 2.4 1.1 3.2 1.2 4C2 4 2.8 3.5 3.3 2.9Z" transform="translate(6.5, -1)" />
    <path d="M12.9 14.4H14.8V7.5H16.8C18.3 7.5 19.3 8.3 19.3 9.7C19.3 11.2 18.2 12 16.8 12H14.8V14.4ZM14.8 10.5H16.6C17.4 10.5 17.7 10.2 17.7 9.7C17.7 9.3 17.4 8.9 16.6 8.9H14.8V10.5Z" />
    <path d="M24.7 14.4H26.5V11.8H26.6L28.7 14.4H31L28.1 11C29.4 10.7 30 9.9 30 8.8C30 7.3 28.8 6.5 26.9 6.5H23V14.4H24.7ZM24.7 10.4V7.9H26.7C27.6 7.9 28.2 8.2 28.2 9.1C28.2 10.1 27.6 10.4 26.6 10.4H24.7Z" transform="translate(-1.5, 1)"/>
    <path d="M35.5 14.4H37.4L39.8 8.6L42.2 14.4H44.1L47 7.5H45.1L43.2 12.6L41.3 7.5H39.4L37.5 12.6L35.6 7.5H33.7L36.6 14.4H35.5Z" transform="translate(-3, 1)"/>
  </svg>
);

const GooglePayLogo = () => (
  <svg width="45" height="18" viewBox="0 0 45 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.1029 7.62353V10.8706H10.9765V12.5118H2.98235V10.8706H6.85588V7.62353H2.98235V5.98235H10.9765V7.62353H7.1029Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M19.7471 6.15882C19.7471 6.15882 19.7471 6.15882 19.7471 6.15882L22.9941 12.5118H21.2647L20.5059 10.9941H17.2294L16.4706 12.5118H14.7412L17.9882 6.15882H19.7471ZM18.8647 7.69412L17.9353 9.54706H19.8176L18.8647 7.69412Z" fill="currentColor"/>
    <path d="M25.7471 5.98235L27.9706 9.38824L30.1588 5.98235H32.1706L28.8529 10.9059V12.5118H27.0882V10.9059L23.7706 5.98235H25.7471Z" fill="currentColor"/>
    <path d="M42.0176 10.8706H38.1441V7.62353H42.0176V5.98235H34.0235V7.62353H37.8971V10.8706H34.0235V12.5118H42.0176V10.8706Z" fill="currentColor"/>
  </svg>
);

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
      base: { fontSize: '16px', color: appearance === 'light' ? '#111827' : '#ffffff', '::placeholder': { color: appearance === 'light' ? '#9ca3af' : '#71717a' }, fontFamily: 'Inter, sans-serif', iconColor: appearance === 'light' ? '#6b7280' : '#a1a1aa' },
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

// --- Stripe Express Checkout Component ---
const StripeExpressCheckout = ({ totalDue, currency, config, appearance, t, selectedUpsellIds }: any) => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: 'US', // Default to US or make dynamic if needed
      currency: currency.toLowerCase(),
      total: {
        label: config.name,
        amount: Math.round(totalDue * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
      }
    });

    pr.on('paymentmethod', async (ev) => {
        try {
             const res = await fetch(`${API_URL}/api/create-payment-intent`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ 
                     checkoutId: config.id,
                     customerEmail: ev.payerEmail,
                     customerName: ev.payerName,
                     selectedUpsellIds: Array.from(selectedUpsellIds)
                 })
              });
              
              if (!res.ok) {
                  ev.complete('fail');
                  return;
              }

              const { clientSecret } = await res.json();

              const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                  payment_method: ev.paymentMethod.id,
              }, { handleActions: false });

              if (confirmError) {
                  ev.complete('fail');
              } else {
                  ev.complete('success');
                   await fetch(`${API_URL}/api/verify-payment`, {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ paymentIntentId: paymentIntent.id })
                   });
                   trackPurchase(paymentIntent.id, totalDue, currency, config.products);
                   navigate('/order-confirmation', { state: { customLink: config.customThankYouLink } });
              }
        } catch (e) {
            ev.complete('fail');
        }
    });
  }, [stripe, totalDue, currency, config, selectedUpsellIds, navigate]);

  if (!paymentRequest) return null;

  return (
    <div className="mb-6 animate-fade-in">
        <PaymentRequestButtonElement options={{paymentRequest, style: { paymentRequestButton: { theme: appearance === 'dark' ? 'dark' : 'light', height: '48px' }}}} />
        <div className="relative mt-6 mb-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-color)]"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[var(--bg-page)] px-2 text-[var(--text-secondary)] font-medium">{t.orPayWithCard}</span></div>
        </div>
    </div>
  );
};

const DemoExpressCheckout = ({ appearance, t }: any) => {
    return (
        <div className="mb-6 animate-fade-in">
            <div className="grid grid-cols-1 gap-3">
                <button className="bg-black text-white h-12 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm active:scale-[0.98]">
                    <ApplePayLogo />
                </button>
            </div>
            <div className="relative mt-6 mb-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-color)]"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[var(--bg-page)] px-2 text-[var(--text-secondary)] font-medium">{t.orPayWithCard}</span></div>
            </div>
        </div>
    );
}

const CardPaymentForm = ({ totalDue, config, billingDetails, setBillingDetails, onValidationFailed, currency, appearance, errors, t, selectedUpsellIds }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardErrors, setCardErrors] = useState({ cardNumber: '', expiry: '', cvc: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = onValidationFailed(); 
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
         navigate('/order-confirmation', { state: { customLink: config.customThankYouLink } });
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
        
        navigate('/order-confirmation', { state: { customLink: config.customThankYouLink } });
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

const BankTransferForm = ({ settings, config, billingDetails, setBillingDetails, onValidationFailed, errors, t }: any) => {
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
        navigate('/order-confirmation', { state: { customLink: config.customThankYouLink } });
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

const CryptoPaymentForm = ({ settings, config, billingDetails, setBillingDetails, onValidationFailed, errors, t }: any) => {
    const [selectedCoin, setSelectedCoin] = useState(settings.cryptoOptions?.[0] || 'BTC');
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onValidationFailed()) return;
        setIsProcessing(true);
        setTimeout(() => navigate('/order-confirmation', { state: { customLink: config.customThankYouLink } }), 1500);
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

const CheckoutContent = ({ 
    config, settings, isDemo, t, currencySymbol, totalDue, allUpsells, selectedUpsellIds, toggleUpsell,
    billingDetails, updateBilling, errors, handleBillingBlur, validateForm, 
    enabledMethods, paymentMethod, setPaymentMethod, cardState, setCardState, currency, appearance 
}: any) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
            {/* Express Checkout Section (Top) */}
            {settings.stripeEnabled && (
                isDemo ? (
                    <DemoExpressCheckout appearance={appearance} t={t} />
                ) : (
                    <StripeExpressCheckout 
                        totalDue={totalDue} 
                        currency={currency} 
                        config={config} 
                        appearance={appearance}
                        t={t} 
                        selectedUpsellIds={selectedUpsellIds}
                    />
                )
            )}

            {/* Customer Info Title */}
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">{t.customerInfo}</h3>

            {/* Global Customer Fields */}
            <CustomerFields values={billingDetails} onChange={updateBilling} errors={errors} onBlur={handleBillingBlur} t={t} collectPhone={config.collectPhoneNumber !== false} />
            
            {/* Multiple Order Bumps */}
            {allUpsells.length > 0 && (
                <div className="mt-6 space-y-4">
                    {allUpsells.map((upsell: any) => {
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
                                        <span className="font-bold text-[#f97316] text-sm">
                                            {currencySymbol}
                                            {upsell.offerType === 'multi_month' && upsell.monthlyPrice
                                                ? Number(upsell.monthlyPrice).toFixed(2)
                                                : Number(upsell.price).toFixed(2)
                                            }
                                        </span>
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

            {/* Payment Title */}
            <h3 className="text-lg font-bold text-[var(--text-primary)] mt-6 mb-4">{t.payment}</h3>

            {/* Payment Methods */}
            <div className="space-y-4">
                {enabledMethods.length === 0 && (
                    <div className="p-4 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg text-sm text-center font-medium flex items-center justify-center gap-2">
                        <AlertCircle size={16} /> {t.noMethods}
                    </div>
                )}

                {enabledMethods.map((method: PaymentMethod) => {
                    const isSelected = paymentMethod === method;
                    const renderPaymentMethodIcon = (m: PaymentMethod) => {
                        switch (m) {
                            case 'stripe': return <CreditCard size={14} />;
                            case 'bank_transfer': return <Landmark size={14} />;
                            case 'crypto': return <DollarSign size={14} />;
                            case 'manual': return <Banknote size={14} />;
                            default: return <Wallet size={14} />;
                        }
                    };
                    const renderPaymentMethodLabel = (m: PaymentMethod) => {
                        switch (m) {
                            case 'stripe': return t.payWithCard;
                            case 'bank_transfer': return t.payWithBank;
                            case 'crypto': return t.payWithCrypto;
                            case 'manual': return settings.manualPaymentLabel || t.payWithManual;
                            default: return m;
                        }
                    };

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
                                                {!isDemo && <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400"><AlertTriangle size={14} /><span>{t.demoMode}</span></div>}
                                                <InteractiveCreditCardForm cardState={cardState} setCardState={setCardState} errors={errors} setErrors={() => {}} t={t} />
                                                <button disabled={false} onClick={validateForm} className="w-full bg-[#1754d8] hover:bg-[#154dc0] text-white font-bold py-3.5 rounded-lg transition-all active:scale-95 shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {t.orderNow}
                                                </button>
                                            </div>
                                        ) : (
                                            <CardPaymentForm totalDue={totalDue} config={config} billingDetails={billingDetails} setBillingDetails={updateBilling} onValidationFailed={validateForm} currency={currency} appearance={appearance} errors={errors} t={t} selectedUpsellIds={selectedUpsellIds} />
                                        )
                                    )}
                                    {method === 'manual' && (
                                        <ManualCheckoutForm config={config} settings={settings} billingDetails={billingDetails} setBillingDetails={updateBilling} onValidationFailed={validateForm} errors={errors} t={t} selectedUpsellIds={selectedUpsellIds} />
                                    )}
                                    {method === 'bank_transfer' && (
                                        <BankTransferForm settings={settings} config={config} billingDetails={billingDetails} setBillingDetails={updateBilling} onValidationFailed={validateForm} errors={errors} t={t} />
                                    )}
                                    {method === 'crypto' && (
                                        <CryptoPaymentForm settings={settings} config={config} billingDetails={billingDetails} setBillingDetails={updateBilling} onValidationFailed={validateForm} errors={errors} t={t} />
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
            <div className="mt-8 text-[10px] text-center text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">{t.disclaimer}</div>
            <SecurityFooter t={t} />
        </div>
    );
};

export const CheckoutRenderer = ({ checkout: config, settings, isPreview = false, previewMode = 'desktop' }: { checkout: CheckoutPage, settings: any, isPreview?: boolean, previewMode?: 'desktop' | 'mobile' | 'tablet', children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const { coupons } = useContext(AppContext);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const forceMobileLayout = isPreview && previewMode !== 'desktop';
  const isTabletPreview = isPreview && previewMode === 'tablet';
  const [isDemo, setIsDemo] = useState(isPreview);
  const [promoCode, setPromoCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  
  // Billing State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('France'); 
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [cardState, setCardState] = useState({ cardNumber: '', expiry: '', cvc: '' });
  
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

  // Auto-pick region based on IP
  useEffect(() => {
    const detectCountry = async () => {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            if (data && data.country_name) {
                setCountry(data.country_name);
            }
        } catch (e) {
            console.debug('Country auto-detection failed, using default.');
        }
    };
    detectCountry();
  }, []);

  const updateBilling = (field: string, value: string) => {
      if (field === 'fullName') setFullName(value);
      if (field === 'email') setEmail(value);
      if (field === 'phoneNumber') setPhoneNumber(value);
      if (field === 'country') setCountry(value);
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleBillingBlur = (field: string) => {
      const newErrors = { ...errors };
      const collectPhone = config.collectPhoneNumber !== false;
      const t = translations[(config.language as LangCode) || 'en'];

      if (field === 'email') {
          if (!email) newErrors.email = t.required;
          else if (!isValidEmail(email)) newErrors.email = t.invalid;
          else newErrors.email = '';
      }
      if (field === 'phoneNumber' && collectPhone) {
          if (!phoneNumber) newErrors.phoneNumber = t.required;
          else newErrors.phoneNumber = '';
      }
      setErrors(newErrors);
  };

  const handleApplyCoupon = () => {
      const t = translations[(config.language as LangCode) || 'en'];
      setCouponError('');
      setAppliedCoupon(null);

      if (!promoCode.trim()) return;

      const coupon = coupons.find(c => c.code === promoCode.toUpperCase() && c.status === 'active');
      
      if (!coupon) {
          setCouponError(t.codeInvalid);
          return;
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          setCouponError(t.codeExpired);
          return;
      }

      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
          setCouponError(t.codeExpired);
          return;
      }

      setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
      setAppliedCoupon(null);
      setPromoCode('');
      setCouponError('');
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
  const allUpsells = [...(config.upsells || []), ...(config.upsell?.enabled ? [config.upsell] : [])].filter(u => u && u.enabled);
  
  const upsellTotal = allUpsells.reduce((acc, u) => {
      if (selectedUpsellIds.has(u.id)) {
          return acc + (u.price || 0);
      }
      return acc;
  }, 0);

  const subtotal = productTotal + upsellTotal;
  
  // Calculate Discount
  let discountAmount = 0;
  if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
          discountAmount = (subtotal * appliedCoupon.value) / 100;
      } else {
          discountAmount = appliedCoupon.value;
      }
  }
  
  // Ensure discount doesn't exceed total
  discountAmount = Math.min(discountAmount, subtotal);
  const totalDue = Math.max(0, subtotal - discountAmount);

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
    const collectPhone = config.collectPhoneNumber !== false;
    
    if (!fullName || fullName.length < 2) newErrors.fullName = t.required;
    if (!email || !isValidEmail(email)) newErrors.email = t.invalid;
    if (collectPhone) {
        if (!phoneNumber || phoneNumber.length < 6) newErrors.phoneNumber = t.invalid;
    }
    if (isDemo && paymentMethod === 'stripe') {
        if (cardState.cardNumber.length < 16) newErrors.cardNumber = t.invalid;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const appearance = config.appearance || 'dark';
  const themeStyles = {
    '--bg-page': appearance === 'light' ? '#f3f4f6' : '#020202',
    '--bg-panel': appearance === 'light' ? '#ffffff' : '#0a0a0a',
    '--bg-card': appearance === 'light' ? '#ffffff' : '#111111',
    '--bg-input': appearance === 'light' ? '#ffffff' : '#161616',
    '--text-primary': appearance === 'light' ? '#111827' : '#ffffff',
    '--text-secondary': appearance === 'light' ? '#6b7280' : '#a1a1aa',
    '--border-color': appearance === 'light' ? '#e5e7eb' : '#27272a',
    '--text-placeholder': appearance === 'light' ? '#9ca3af' : '#71717a',
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
                               {upsell.offerType === 'multi_month' && upsell.monthlyPrice && (
                                   <p className="text-[10px] text-[#f97316] font-bold mt-0.5">
                                       {currencySymbol}{upsell.monthlyPrice}/mo × {upsell.durationMonths} months
                                   </p>
                               )}
                           </div>
                           <div className="font-bold text-[var(--text-primary)] text-sm">
                               {currencySymbol}
                               {(upsell.offerType === 'multi_month' && upsell.monthlyPrice 
                                   ? Number(upsell.monthlyPrice) 
                                   : Number(upsell.price)
                               ).toFixed(2)}
                           </div>
                      </div>
                  );
              }
              return null;
          })}
      </div>
  );

  const checkoutContentProps = {
      config, 
      settings, 
      isDemo, 
      t, 
      currencySymbol, 
      totalDue, 
      allUpsells, 
      selectedUpsellIds, 
      toggleUpsell,
      billingDetails: { fullName, email, phoneNumber, country }, 
      updateBilling, 
      errors, 
      handleBillingBlur, 
      validateForm, 
      enabledMethods, 
      paymentMethod, 
      setPaymentMethod,
      cardState,
      setCardState,
      currency,
      appearance
  };

  return (
    <div style={themeStyles} className={`font-sans text-[var(--text-primary)] bg-[var(--bg-page)] ${isPreview ? 'h-full overflow-y-auto' : 'min-h-screen'} scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700`}>
      <div className={`${forceMobileLayout ? 'flex flex-col' : 'lg:grid lg:grid-cols-2'} ${isPreview ? 'min-h-full' : 'min-h-screen'}`}>
        <div className={`${forceMobileLayout ? 'hidden' : 'hidden lg:flex'} flex-col justify-center items-end bg-[var(--bg-panel)] border-r border-[var(--border-color)] relative lg:py-12 lg:pl-6 lg:pr-10 xl:pr-16 ${isPreview ? 'min-h-full' : 'h-screen sticky top-0'} overflow-hidden`}>
           <div className="w-full max-w-md space-y-8">
              {config.logo ? <div className="mb-8"><img src={config.logo} alt="Store Logo" style={{ height: `${(config.logoScale || 100) / 100 * 40}px` }} className="object-contain" /></div> : <div className="mb-8 text-3xl font-bold text-[var(--text-primary)] tracking-tight">{config.name}</div>}
              
              <ProductList />

              <div className="space-y-6">
                 {/* Discount applied feedback */}
                 {appliedCoupon ? (
                     <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm">
                         <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold">
                             <Tag size={14} /> {appliedCoupon.code}
                         </span>
                         <div className="flex items-center gap-3">
                             <span className="text-green-600 dark:text-green-400 font-bold">
                                 -{currencySymbol}{discountAmount.toFixed(2)}
                             </span>
                             <button onClick={removeCoupon} className="text-[var(--text-secondary)] hover:text-red-500"><X size={14} /></button>
                         </div>
                     </div>
                 ) : (
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">{t.promoCode}</label>
                        <div className="flex items-center gap-0 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg p-1">
                            <input type="text" placeholder={t.enterPromo} value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="bg-transparent border-none text-sm text-[var(--text-primary)] w-full px-3 py-2 focus:ring-0 placeholder-[var(--text-placeholder)] outline-none" />
                            <button onClick={handleApplyCoupon} className="text-sm font-medium text-[#1754d8] bg-[#1754d8]/10 px-4 py-2 rounded-md transition-transform active:scale-95">{t.apply}</button>
                        </div>
                        {couponError && <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1"><AlertCircle size={10} /> {couponError}</p>}
                     </div>
                 )}

                 <div className="flex justify-between items-center text-sm font-medium text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-6"><span>{t.totalDue}</span><span className="text-[var(--text-primary)] font-bold text-xl">{currencySymbol}{totalDue.toFixed(2)}</span></div>
              </div>
           </div>
        </div>
        <div className={`bg-[var(--bg-page)] flex flex-col 
            ${!forceMobileLayout && 'lg:justify-center lg:items-start'} 
            ${isPreview ? 'min-h-full py-6' : 'min-h-screen py-8'} 
            ${forceMobileLayout 
                ? (isTabletPreview ? 'p-12 items-center justify-center' : 'px-4') 
                : 'p-4 md:p-12 md:items-center md:justify-center lg:py-12 lg:pl-10 lg:pr-6 xl:pl-16'
            } 
            relative text-[var(--text-primary)]`}
        >
           <div className={`w-full max-w-lg space-y-4 mx-auto lg:mx-0 ${forceMobileLayout ? '' : 'lg:space-y-4'}`}>
              <div className={`${forceMobileLayout ? 'flex' : 'lg:hidden flex'} justify-center mb-4`}>
                 {config.logo ? <img src={config.logo} alt="Logo" style={{ height: `${(config.logoScale || 100) / 100 * 32}px` }} className="object-contain" /> : <div className="text-2xl font-bold text-[var(--text-primary)]">{config.name}</div>}
              </div>
              <div className={`${forceMobileLayout ? 'block' : 'lg:hidden'}`}>
                  <button onClick={() => setShowMobileSummary(!showMobileSummary)} className="w-full py-3 px-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg flex items-center justify-between text-sm text-[var(--text-primary)] font-medium shadow-sm transition-colors active:scale-95">
                      <span className="flex items-center gap-2"><ShoppingCart size={16} /> {t.orderSummary}</span><span className="flex items-center gap-2 font-bold">{currencySymbol}{totalDue.toFixed(2)} {showMobileSummary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                  </button>
                  {showMobileSummary && (
                      <div className="mt-2 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] space-y-4">
                          <ProductList />
                          {appliedCoupon && (
                              <div className="flex justify-between items-center text-sm font-medium text-green-500">
                                  <span>{t.discountApplied} ({appliedCoupon.code})</span>
                                  <span>-{currencySymbol}{discountAmount.toFixed(2)}</span>
                              </div>
                          )}
                          <div className="flex justify-between items-center text-sm font-medium text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-4"><span>{t.totalDue}</span><span className="text-[var(--text-primary)] text-lg font-bold">{currencySymbol}{totalDue.toFixed(2)}</span></div>
                      </div>
                  )}
              </div>
              
              {(stripePromise && !isDemo) ? (
                  <Elements stripe={stripePromise} options={{ 
                      appearance: { theme: appearance === 'dark' ? 'night' : 'stripe', labels: 'floating' },
                      currency: currency.toLowerCase(),
                      mode: 'payment',
                      amount: Math.round(totalDue * 100)
                  }}>
                      <CheckoutContent {...checkoutContentProps} />
                  </Elements>
              ) : (
                  <CheckoutContent {...checkoutContentProps} />
              )}

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
