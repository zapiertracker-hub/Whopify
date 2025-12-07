import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../AppContext';
import { CheckoutPage, Product, PaymentMethod, OrderBump } from '../types';
import { CheckoutRenderer } from './CheckoutView';
import { generateMarketingCopy } from '../services/geminiService';
import { 
  ArrowLeft, Settings, ShoppingBag, Plus, Save, Image as ImageIcon,
  X, Upload, AlertCircle, CheckCircle2, Tablet, Monitor, Smartphone, Palette,
  Sun, Moon, Link as LinkIcon, Check, DollarSign, ExternalLink, Copy, Sparkles,
  Loader2, Trash2, Package, RefreshCw, CreditCard, Calendar, PieChart, Eye,
  Wallet, Landmark, Banknote, ArrowUp, ArrowDown, ChevronDown, Globe, Zap, Edit2, User,
  ArrowRight
} from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

const StoreBuilder = () => {
  const { checkoutId } = useParams();
  const navigate = useNavigate();
  const { checkouts, updateCheckout, settings } = useContext(AppContext);
  
  const [activeTab, setActiveTab] = useState<'settings' | 'products' | 'upsells' | 'thankyou'>('settings');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const [config, setConfig] = useState<CheckoutPage | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Product Editing State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Upsell Editing State
  const [editingUpsell, setEditingUpsell] = useState<OrderBump | null>(null);
  const [isUpsellModalOpen, setIsUpsellModalOpen] = useState(false);

  // Track copied state for individual product buttons
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);

  // Helper to determine active pricing mode for UI state
  const getActivePricingMode = (product: Product) => {
    if (product.pricing.subscription.enabled) return 'subscription';
    if (product.pricing.paymentPlan.enabled) return 'paymentPlan';
    return 'oneTime';
  };

  const [activePricingMode, setActivePricingMode] = useState<'oneTime' | 'subscription' | 'paymentPlan'>('oneTime');

  // Sync active mode when editing product changes
  useEffect(() => {
    if (editingProduct) {
        setActivePricingMode(getActivePricingMode(editingProduct));
    }
  }, [editingProduct?.id]); 
  
  // Load config from context
  useEffect(() => {
    if (checkoutId) {
      const found = checkouts.find(c => c.id === checkoutId);
      if (found) {
        setConfig(prev => {
            if (!prev) return found;
            if (prev.id !== checkoutId) return found;
            return prev;
        });
      } else {
        if (checkouts.length > 0) navigate('/checkouts'); 
      }
    }
  }, [checkoutId, checkouts, navigate]);

  if (!config) return <div className="min-h-screen flex items-center justify-center bg-[#020202] text-white"><div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading Editor...</div></div>;

  // --- Upsell Handlers ---

  const handleSaveUpsell = () => {
      if (!editingUpsell) return;
      if (!editingUpsell.title) return alert("Title is required");

      const upsells = config.upsells || [];
      const index = upsells.findIndex(u => u.id === editingUpsell.id);
      
      let updatedUpsells;
      if (index >= 0) {
          updatedUpsells = [...upsells];
          updatedUpsells[index] = editingUpsell;
      } else {
          updatedUpsells = [...upsells, editingUpsell];
      }

      setConfig({ ...config, upsells: updatedUpsells });
      setEditingUpsell(null);
      setIsUpsellModalOpen(false);
  };

  const handleDeleteUpsell = (id: string) => {
      setConfig({ ...config, upsells: (config.upsells || []).filter(u => u.id !== id) });
  };

  const openNewUpsellModal = () => {
      // Defaulting to monthly pricing logic as requested
      const defaultMonthly = 2.99;
      const defaultMonths = 12;
      setEditingUpsell({
          id: Date.now().toString(),
          enabled: true,
          title: '',
          description: '',
          price: parseFloat((defaultMonthly * defaultMonths).toFixed(2)),
          offerType: 'multi_month',
          monthlyPrice: defaultMonthly,
          durationMonths: defaultMonths
      });
      setIsUpsellModalOpen(true);
  };

  const openEditUpsellModal = (upsell: OrderBump) => {
      setEditingUpsell({ ...upsell });
      setIsUpsellModalOpen(true);
  };

  const updateUpsellPricing = (field: string, value: any) => {
      if (!editingUpsell) return;
      
      // Ensure numeric values are stored as numbers
      let storageValue = value;
      if (['price', 'monthlyPrice', 'durationMonths'].includes(field)) {
          storageValue = field === 'durationMonths' ? parseInt(value) || 0 : parseFloat(value) || 0;
      }

      let updates: any = { [field]: storageValue };

      if (field === 'offerType' && value === 'multi_month') {
          // Initialize defaults when switching to multi-month
          const monthly = editingUpsell.monthlyPrice || 2.99;
          const months = editingUpsell.durationMonths || 12;
          updates.monthlyPrice = monthly;
          updates.durationMonths = months;
          updates.price = parseFloat((monthly * months).toFixed(2));
      } else if (editingUpsell.offerType === 'multi_month' || (field === 'offerType' && value === 'multi_month')) {
          // Calculate sum if in multi-month mode
          const monthly = field === 'monthlyPrice' ? (parseFloat(value) || 0) : (editingUpsell.monthlyPrice || 0);
          const months = field === 'durationMonths' ? (parseInt(value) || 0) : (editingUpsell.durationMonths || 12);
          updates.price = parseFloat((monthly * months).toFixed(2));
      }

      setEditingUpsell(prev => prev ? { ...prev, ...updates } : null);
  };

  // --- Product Handlers ---

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
        alert("Product name is required");
        return;
    }

    let primaryPrice = 0;
    const finalPricing = { ...editingProduct.pricing };
    const currencyKey = (editingProduct.currency || 'USD').toLowerCase();

    finalPricing.oneTime.enabled = false;
    finalPricing.subscription.enabled = false;
    finalPricing.paymentPlan.enabled = false;

    if (activePricingMode === 'oneTime') {
        finalPricing.oneTime.enabled = true;
        primaryPrice = finalPricing.oneTime.prices[currencyKey] || 0;
    } else if (activePricingMode === 'subscription') {
        finalPricing.subscription.enabled = true;
        primaryPrice = finalPricing.subscription.prices[currencyKey] || 0;
    } else if (activePricingMode === 'paymentPlan') {
        finalPricing.paymentPlan.enabled = true;
        primaryPrice = finalPricing.paymentPlan.prices[currencyKey] || 0;
    }
    
    if (primaryPrice <= 0) {
        alert("Price must be greater than 0");
        return;
    }

    const productToSave = { 
        ...editingProduct,
        pricing: finalPricing,
        price: primaryPrice,
        currency: editingProduct.currency || 'USD'
    };

    if (config.products.find(p => p.id === productToSave.id)) {
      setConfig({
        ...config,
        products: config.products.map(p => p.id === productToSave.id ? productToSave : p)
      });
    } else {
      setConfig({
        ...config,
        products: [...config.products, productToSave]
      });
    }
    
    if (validationError) setValidationError(null);
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    setConfig({
      ...config,
      products: config.products.filter(p => p.id !== id)
    });
  };

  const openNewProductModal = () => {
    const newProd: Product = {
      id: Date.now().toString(),
      name: '',
      image: '', 
      description: '',
      price: 0,
      currency: 'USD',
      pricing: {
        oneTime: { enabled: true, prices: { usd: 0, eur: 0, gbp: 0, mad: 0 } },
        subscription: { enabled: false, prices: { usd: 0, eur: 0, gbp: 0, mad: 0 }, interval: 'month' },
        paymentPlan: { enabled: false, prices: { usd: 0, eur: 0, gbp: 0, mad: 0 }, installments: 3 }
      }
    };
    setEditingProduct(newProd);
    setActivePricingMode('oneTime');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    const productCopy = JSON.parse(JSON.stringify(product));
    ['oneTime', 'subscription', 'paymentPlan'].forEach((key: any) => {
         if (!productCopy.pricing[key].prices.gbp) productCopy.pricing[key].prices.gbp = 0;
         if (!productCopy.pricing[key].prices.mad) productCopy.pricing[key].prices.mad = 0;
    });

    setEditingProduct(productCopy); 
    setIsProductModalOpen(true);
  };

  const handleGenerateDescription = async () => {
      if (!editingProduct?.name) return;
      setIsGeneratingAI(true);
      try {
          const description = await generateMarketingCopy(editingProduct.name, 'Product', 'en');
          setEditingProduct(prev => prev ? { ...prev, description } : null);
      } catch (error) {
          console.error("AI Error", error);
      } finally {
          setIsGeneratingAI(false);
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct({ ...editingProduct, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpsellImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && editingUpsell) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setEditingUpsell({ ...editingUpsell, image: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && config) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig({ ...config, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleOpenLive = () => {
     if (config && checkoutId) updateCheckout(checkoutId, config);
     const isBlob = window.location.protocol === 'blob:';
     const url = isBlob ? `#/p/${checkoutId}` : `${window.location.href.split('#')[0]}#/p/${checkoutId}`;
     window.open(url, '_blank');
  };

  const validatePublish = () => {
      if (config.products.length === 0) return { valid: false, msg: "Please add at least one product.", tab: 'products' };
      // Simplified price check based on legacy field or pricing structure
      if (config.products.some(p => p.price <= 0)) return { valid: false, msg: "All products must have a price greater than 0.", tab: 'products' };
      if (config.paymentMethods.length === 0) return { valid: false, msg: "Enable at least one payment method in Settings.", tab: 'settings' };
      return { valid: true };
  };

  const handleNextStep = () => {
      if (!config) return;
      setValidationError(null);

      // IMPORTANT: Save progress to context/local storage on every step
      // This ensures the "Next" button behaves like "Save & Next"
      if (checkoutId) updateCheckout(checkoutId, config); 

      if (activeTab === 'settings') {
          if (!config.name.trim()) {
              setValidationError("Internal name is required.");
              return;
          }
          if (config.paymentMethods.length === 0) {
               setValidationError("Please enable at least one payment method.");
               return;
          }
          setActiveTab('products');
      } else if (activeTab === 'products') {
          if (config.products.length === 0) {
              setValidationError("Please add at least one product before proceeding.");
              return;
          }
          setActiveTab('upsells');
      } else if (activeTab === 'upsells') {
          setActiveTab('thankyou');
      } else if (activeTab === 'thankyou') {
          const check = validatePublish();
          if (!check.valid) {
              setValidationError(check.msg || "Validation failed");
              if (check.tab) setActiveTab(check.tab as any);
              return;
          }
          handleSaveChanges();
      }
  };

  const handleSaveChanges = async () => {
     if (config && checkoutId) {
        updateCheckout(checkoutId, config);
        try {
            await fetch(`${API_URL}/api/checkouts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: checkoutId, data: config })
            });
        } catch (error) {
            console.warn("Could not sync checkout to backend (Beta Mode)");
        }
        setShowShareModal(true);
     }
  };

  const handleCopyLink = () => {
    const isBlob = window.location.protocol === 'blob:';
    const url = isBlob ? `#/p/${checkoutId}` : `${window.location.href.split('#')[0]}#/p/${checkoutId}`;
    navigator.clipboard.writeText(url).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleCopyProductLink = (productId: string) => {
    const isBlob = window.location.protocol === 'blob:';
    const url = isBlob ? `#/p/${checkoutId}` : `${window.location.href.split('#')[0]}#/p/${checkoutId}`;
    navigator.clipboard.writeText(url).then(() => {
        setCopiedProductId(productId);
        setTimeout(() => setCopiedProductId(null), 2000);
    });
  };

  const getCurrencySymbol = (code: string) => {
    switch(code) {
        case 'EUR': return '€';
        case 'GBP': return '£';
        case 'MAD': return 'DH';
        default: return '$';
    }
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    if (!config) return;
    const currentMethods = config.paymentMethods || [];
    let updatedMethods;
    if (currentMethods.includes(method)) {
      updatedMethods = currentMethods.filter(m => m !== method);
    } else {
      updatedMethods = [...currentMethods, method];
    }
    setConfig({ ...config, paymentMethods: updatedMethods });
  };

  const movePaymentMethod = (index: number, direction: 'up' | 'down') => {
    if (!config || !config.paymentMethods) return;
    const methods = [...config.paymentMethods];
    if (direction === 'up' && index > 0) {
      [methods[index - 1], methods[index]] = [methods[index], methods[index - 1]];
    } else if (direction === 'down' && index < methods.length - 1) {
      [methods[index + 1], methods[index]] = [methods[index], methods[index + 1]];
    }
    setConfig({ ...config, paymentMethods: methods });
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
        case 'stripe': return <CreditCard size={16} />;
        case 'bank_transfer': return <Landmark size={16} />;
        case 'crypto': return <DollarSign size={16} />;
        case 'manual': return <Banknote size={16} />;
        default: return <Wallet size={16} />;
    }
  };

  const getMethodName = (method: PaymentMethod) => {
      switch (method) {
          case 'stripe': return 'Credit Card (Stripe)';
          case 'bank_transfer': return 'Bank Transfer';
          case 'crypto': return 'Cryptocurrency';
          case 'manual': return settings.manualPaymentLabel || 'Manual Payment';
          default: return method;
      }
  };

  const isMethodEnabledGlobally = (method: PaymentMethod) => {
      switch (method) {
          case 'stripe': return settings.stripeEnabled;
          case 'bank_transfer': return settings.bankTransferEnabled;
          case 'crypto': return settings.cryptoEnabled;
          case 'manual': return settings.manualPaymentEnabled;
          default: return false;
      }
  };

  const availableMethodsToAdd: PaymentMethod[] = (['stripe', 'bank_transfer', 'crypto', 'manual'] as PaymentMethod[])
      .filter(m => !config?.paymentMethods.includes(m) && isMethodEnabledGlobally(m));

  const updatePriceValue = (model: 'oneTime' | 'subscription' | 'paymentPlan', value: number) => {
      if (!editingProduct) return;
      const currencyKey = (editingProduct.currency || 'USD').toLowerCase();
      const newPrices = { ...editingProduct.pricing[model].prices, [currencyKey]: value };
      setEditingProduct({
          ...editingProduct,
          pricing: {
              ...editingProduct.pricing,
              [model]: { ...editingProduct.pricing[model], prices: newPrices }
          }
      });
  };

  const getCurrentPrice = (model: 'oneTime' | 'subscription' | 'paymentPlan') => {
      if (!editingProduct) return 0;
      const currencyKey = (editingProduct.currency || 'USD').toLowerCase();
      return editingProduct.pricing[model].prices[currencyKey] || 0;
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/checkouts')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors active:scale-95">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {config.name}
              <span className={`px-2 py-0.5 border text-xs rounded-full font-bold ${config.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                {config.status}
              </span>
            </h1>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1 border border-gray-200 dark:border-gray-800">
             <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all active:scale-95 ${activeTab === 'settings' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'}`}><Settings size={16} /> Settings</button>
             <button onClick={() => setActiveTab('products')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all active:scale-95 ${activeTab === 'products' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'}`}><ShoppingBag size={16} /> Products</button>
             <button onClick={() => setActiveTab('upsells')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all active:scale-95 ${activeTab === 'upsells' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'}`}><Zap size={16} /> Upsells</button>
             <button onClick={() => setActiveTab('thankyou')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all active:scale-95 ${activeTab === 'thankyou' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'}`}><CheckCircle2 size={16} /> Thank You Page</button>
          </div>
          <button onClick={handleOpenLive} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"><Eye size={16} /> Live Preview</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* LEFT PANEL */}
        <div className="w-full lg:w-96 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col shrink-0">

          {activeTab === 'settings' && (
             <div className="p-6 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 h-full">
                
                {/* General Settings Card */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Settings size={16} className="text-[#f97316]" /> General
                    </h3>
                    <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-5">
                        {/* Internal Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Internal Name</label>
                            <input 
                                type="text" 
                                value={config.name} 
                                onChange={(e) => setConfig({...config, name: e.target.value})} 
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] outline-none transition-all placeholder-gray-400"
                                placeholder="e.g. Black Friday Sale"
                            />
                        </div>
                        {/* Language */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Checkout Language</label>
                            <div className="relative">
                                <select 
                                    value={config.language || 'en'} 
                                    onChange={(e) => setConfig({...config, language: e.target.value as any})} 
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] outline-none appearance-none cursor-pointer"
                                >
                                    <option value="en">English (US)</option>
                                    <option value="fr">Français (French)</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <ChevronDown size={14} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <User size={16} className="text-[#f97316]" /> Customer Info
                    </h3>
                    <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
                        
                        {/* Full Name Toggle */}
                        <div 
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group ${config.collectFullName === true ? 'bg-orange-50 dark:bg-orange-900/10 border-[#f97316]/30' : 'bg-gray-50 dark:bg-[#161616] border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                            onClick={() => setConfig({ ...config, collectFullName: !config.collectFullName })}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-lg border transition-colors ${config.collectFullName === true ? 'bg-[#f97316] border-[#f97316] text-white shadow-md shadow-orange-500/20' : 'bg-white dark:bg-black border-gray-200 dark:border-gray-800 text-gray-500'}`}>
                                    <User size={18} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold transition-colors ${config.collectFullName === true ? 'text-[#f97316]' : 'text-gray-900 dark:text-white'}`}>Full Name</span>
                                        {config.collectFullName === true && (
                                            <span className="text-[9px] font-extrabold bg-[#f97316] text-white px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">Required</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f97316] ${config.collectFullName === true ? 'bg-[#f97316]' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition transition-transform ${config.collectFullName === true ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                        </div>

                        {/* Phone Number Toggle */}
                        <div 
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group ${config.collectPhoneNumber === true ? 'bg-orange-50 dark:bg-orange-900/10 border-[#f97316]/30' : 'bg-gray-50 dark:bg-[#161616] border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                            onClick={() => setConfig({ ...config, collectPhoneNumber: !config.collectPhoneNumber })}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-lg border transition-colors ${config.collectPhoneNumber === true ? 'bg-[#f97316] border-[#f97316] text-white shadow-md shadow-orange-500/20' : 'bg-white dark:bg-black border-gray-200 dark:border-gray-800 text-gray-500'}`}>
                                    <Smartphone size={18} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold transition-colors ${config.collectPhoneNumber === true ? 'text-[#f97316]' : 'text-gray-900 dark:text-white'}`}>Phone Number</span>
                                        {config.collectPhoneNumber === true && (
                                            <span className="text-[9px] font-extrabold bg-[#f97316] text-white px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">Required</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f97316] ${config.collectPhoneNumber === true ? 'bg-[#f97316]' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition transition-transform ${config.collectPhoneNumber === true ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Branding */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Palette size={16} className="text-[#f97316]" /> Branding
                    </h3>
                    <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-6">
                        {/* Logo */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Checkout Logo</label>
                            <div className="p-4 bg-gray-50 dark:bg-[#161616] rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                                <div className="w-16 h-16 bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden shrink-0 relative group shadow-sm">
                                    {config.logo ? (
                                        <img src={config.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <ImageIcon size={24} className="text-gray-300 dark:text-gray-600" />
                                    )}
                                </div>
                                <div>
                                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 shadow-sm">
                                        <Upload size={14} />
                                        <span>Upload Logo</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                    </label>
                                    {config.logo && (
                                        <button onClick={() => setConfig({...config, logo: undefined})} className="ml-2 text-xs text-red-500 hover:underline">Remove</button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Theme */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Checkout Theme</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setConfig({...config, appearance: 'light'})}
                                    className={`group relative p-4 rounded-xl border transition-all active:scale-[0.98] ${config.appearance === 'light' ? 'bg-white border-[#f97316] shadow-sm ring-1 ring-[#f97316]' : 'bg-gray-50 dark:bg-[#161616] border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Sun size={20} className={config.appearance === 'light' ? 'text-[#f97316]' : 'text-gray-400'} />
                                        <span className={`text-sm font-bold ${config.appearance === 'light' ? 'text-gray-900' : 'text-gray-500 dark:text-gray-400'}`}>Light Mode</span>
                                    </div>
                                    {config.appearance === 'light' && <div className="absolute top-2 right-2 w-2 h-2 bg-[#f97316] rounded-full"></div>}
                                </button>
                                <button 
                                    onClick={() => setConfig({...config, appearance: 'dark'})}
                                    className={`group relative p-4 rounded-xl border transition-all active:scale-[0.98] ${config.appearance === 'dark' || !config.appearance ? 'bg-[#050505] border-[#f97316] shadow-sm ring-1 ring-[#f97316]' : 'bg-gray-50 dark:bg-[#161616] border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Moon size={20} className={config.appearance === 'dark' || !config.appearance ? 'text-[#f97316]' : 'text-gray-400'} />
                                        <span className={`text-sm font-bold ${config.appearance === 'dark' || !config.appearance ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>Dark Mode</span>
                                    </div>
                                    {(config.appearance === 'dark' || !config.appearance) && <div className="absolute top-2 right-2 w-2 h-2 bg-[#f97316] rounded-full"></div>}
                                </button>
                            </div>
                        </div>

                        {/* Logo Scale */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Logo Size ({config.logoScale || 100}%)</label>
                            </div>
                            <input 
                                type="range" 
                                min="50" 
                                max="150" 
                                value={config.logoScale || 100} 
                                onChange={(e) => setConfig({...config, logoScale: parseInt(e.target.value)})} 
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#f97316]" 
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Wallet size={16} className="text-[#f97316]" /> Payment Methods
                    </h3>
                    <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                            Configure which payment gateways are shown on this checkout. 
                            <br/><span className="opacity-70">(Only globally enabled gateways can be added)</span>
                        </p>
                        
                        {/* Active Methods List - Reordered */}
                        <div className="space-y-2 mb-6">
                            {config.paymentMethods.map((method, index) => {
                                const isEnabledGlobally = isMethodEnabledGlobally(method);
                                return (
                                    <div key={method} className="group flex items-center justify-between p-3 bg-gray-50 dark:bg-[#161616] rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#f97316]/30 transition-all select-none">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg border ${isEnabledGlobally ? 'bg-white dark:bg-black border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-500'}`}>
                                                {getMethodIcon(method)}
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-gray-900 dark:text-white block">{getMethodName(method)}</span>
                                                {!isEnabledGlobally && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1">Requires Global Setup</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="flex flex-col gap-0.5 mr-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button disabled={index === 0} onClick={() => movePaymentMethod(index, 'up')} className="text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 p-0.5"><ArrowUp size={12} /></button>
                                                <button disabled={index === config.paymentMethods.length - 1} onClick={() => movePaymentMethod(index, 'down')} className="text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 p-0.5"><ArrowDown size={12} /></button>
                                            </div>
                                            <button onClick={() => togglePaymentMethod(method)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><X size={16} /></button>
                                        </div>
                                    </div>
                                );
                            })}
                            {config.paymentMethods.length === 0 && (
                                <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                                    <p className="text-xs text-gray-500 font-medium">No payment methods active.</p>
                                </div>
                            )}
                        </div>

                        {/* Available Methods */}
                        {availableMethodsToAdd.length > 0 && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Add Payment Method</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {availableMethodsToAdd.map(method => (
                                        <button 
                                            key={method} 
                                            onClick={() => togglePaymentMethod(method)} 
                                            className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#161616] hover:border-gray-400 dark:hover:border-gray-600 transition-all text-left group"
                                        >
                                            <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                                                <Plus size={14} />
                                            </div>
                                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                                                {getMethodName(method)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

             </div>
          )}

          {activeTab === 'products' && (
             <>
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                  <div><h2 className="font-semibold text-gray-900 dark:text-gray-100">Products</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage items sold.</p></div>
                  <button onClick={openNewProductModal} className="p-2 bg-gray-900 dark:bg-white rounded-lg text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all active:scale-95"><Plus size={16} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                   {config.products.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">No products added yet.</div>}
                   {config.products.map((p) => {
                       const price = p.pricing.oneTime.enabled 
                            ? (p.pricing.oneTime.prices[(p.currency || 'USD').toLowerCase()] || p.pricing.oneTime.prices.usd) 
                            : (p.pricing.subscription.enabled 
                                ? (p.pricing.subscription.prices[(p.currency || 'USD').toLowerCase()] || p.pricing.subscription.prices.usd)
                                : (p.pricing.paymentPlan.prices[(p.currency || 'USD').toLowerCase()] || p.pricing.paymentPlan.prices.usd));
                       return (
                          <div key={p.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex gap-3">
                             <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden shrink-0">{p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={20} /></div>}</div>
                             <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{getCurrencySymbol(p.currency || 'USD')} {price.toFixed(2)} {p.pricing.subscription.enabled ? `/${p.pricing.subscription.interval}` : ''}</p>
                             </div>
                             <div className="flex items-center gap-1">
                                <button onClick={() => handleCopyProductLink(p.id)} className={`p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 ${copiedProductId === p.id ? 'text-green-500' : 'text-gray-400'}`} title="Copy Link">{copiedProductId === p.id ? <Check size={14} /> : <LinkIcon size={14} />}</button>
                                <button onClick={() => openEditProductModal(p)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"><Settings size={14} /></button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"><X size={14} /></button>
                             </div>
                          </div>
                       );
                   })}
                </div>
             </>
          )}

          {activeTab === 'upsells' && (
              <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                      <div>
                          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <Zap size={16} className="text-[#f97316]" /> Order Bumps <span className="text-gray-500 font-normal text-xs">(Optional)</span>
                          </h2>
                          <p className="text-xs text-gray-500 mt-1">Offer additional products at checkout.</p>
                      </div>
                      <button 
                          onClick={openNewUpsellModal}
                          className="p-2 bg-gray-900 dark:bg-white rounded-lg text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all active:scale-95"
                      >
                          <Plus size={16} />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {(!config.upsells || config.upsells.length === 0) && (
                          <div className="text-center py-12 flex flex-col items-center">
                              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-3">
                                  <Zap size={24} />
                              </div>
                              <p className="text-sm text-gray-500">No upsells added yet.</p>
                              <button onClick={openNewUpsellModal} className="mt-4 text-xs font-bold text-[#f97316] hover:underline">Create your first upsell</button>
                          </div>
                      )}

                      {config.upsells?.map(upsell => (
                          <div key={upsell.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex gap-3 group relative hover:border-[#f97316]/50 transition-all">
                              <div className="w-12 h-12 bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 flex items-center justify-center">
                                  {upsell.image ? <img src={upsell.image} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-gray-400" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate pr-6">{upsell.title}</h4>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs font-bold text-[#f97316]">
                                          {getCurrencySymbol(config.currency || 'USD')}{upsell.price.toFixed(2)}
                                      </span>
                                      {upsell.offerType === 'multi_month' && (
                                          <span className="text-[10px] text-gray-500 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                              {upsell.durationMonths}mo Bundle
                                          </span>
                                      )}
                                  </div>
                              </div>
                              <div className="flex items-center gap-1 self-center">
                                  <button onClick={() => openEditUpsellModal(upsell)} className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white"><Edit2 size={14} /></button>
                                  <button onClick={() => handleDeleteUpsell(upsell.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {activeTab === 'thankyou' && (
              <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                      <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <CheckCircle2 size={16} /> Thank You Page
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">Customize the post-purchase experience.</p>
                  </div>
                  <div className="p-6 space-y-6 overflow-y-auto">
                      <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                              <div>
                                  <label className="text-sm font-medium text-gray-900 dark:text-white">Custom Redirect</label>
                                  <p className="text-xs text-gray-500 mt-1">Automatically redirect to a URL after 5 seconds.</p>
                              </div>
                              <button
                                  onClick={() => setConfig({
                                      ...config,
                                      customThankYouLink: {
                                          enabled: !(config.customThankYouLink?.enabled),
                                          text: '', // Clear legacy text
                                          url: config.customThankYouLink?.url || ''
                                      }
                                  })}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.customThankYouLink?.enabled ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}
                              >
                                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${config.customThankYouLink?.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                              </button>
                          </div>
                          
                          {config.customThankYouLink?.enabled && (
                              <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
                                  <div>
                                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Target URL</label>
                                      <input 
                                          type="url" 
                                          value={config.customThankYouLink.url} 
                                          onChange={(e) => setConfig({
                                              ...config, 
                                              customThankYouLink: { ...config.customThankYouLink!, url: e.target.value }
                                          })}
                                          className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:border-[#f97316] outline-none"
                                          placeholder="https://your-site.com/thank-you"
                                      />
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          )}

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-b-xl mt-auto">
             {validationError && (
                <div className="mb-3 px-3 py-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in">
                    <AlertCircle size={14} className="shrink-0" /> {validationError}
                </div>
             )}
             <button onClick={handleNextStep} className="w-full bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2">
                 {activeTab === 'thankyou' ? (
                     <><CheckCircle2 size={18} /> Publish & Get Link</>
                 ) : (
                     <><ArrowRight size={18} /> Next Step</>
                 )}
             </button>
          </div>

        </div>

        {/* RIGHT PREVIEW */}
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-[#050505] rounded-xl border border-gray-200 dark:border-gray-800 shadow-inner overflow-hidden relative">
            <div className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-1 border border-gray-200 dark:border-gray-800">
                    <button onClick={() => setPreviewMode('desktop')} className={`p-1.5 rounded ${previewMode === 'desktop' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><Monitor size={16}/></button>
                    <button onClick={() => setPreviewMode('tablet')} className={`p-1.5 rounded ${previewMode === 'tablet' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><Tablet size={16}/></button>
                    <button onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded ${previewMode === 'mobile' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><Smartphone size={16}/></button>
                </div>
                <div className="text-xs text-gray-500">Live Editor Preview</div>
            </div>
            <div className="flex-1 overflow-auto flex justify-center bg-gray-200/50 dark:bg-black/20 p-8">
                 <div className={`bg-white dark:bg-black shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-800 ${previewMode === 'mobile' ? 'w-[375px] h-[667px] rounded-3xl border-8 border-gray-900' : previewMode === 'tablet' ? 'w-[768px] h-[1024px] rounded-xl border-4 border-gray-900' : 'w-full h-full rounded-lg'}`}>
                    <CheckoutRenderer checkout={config} settings={settings} isPreview={true} previewMode={previewMode} />
                 </div>
            </div>
        </div>

      </div>

      {/* Product Modal */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
               {/* ... Product Modal Content (Unchanged) ... */}
               <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingProduct.id ? 'Edit Product' : 'Add New Product'}</h3>
                   <button onClick={() => setIsProductModalOpen(false)} className="text-gray-500 hover:text-black dark:hover:text-white"><X size={20}/></button>
               </div>
               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                   {/* Product Fields... */}
                   <div className="flex gap-6">
                       <div className="w-32 space-y-2">
                           <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Image</label>
                           <label className="block w-32 h-32 bg-gray-100 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer flex items-center justify-center relative overflow-hidden group">
                               {editingProduct.image ? <img src={editingProduct.image} alt="" className="w-full h-full object-cover" /> : <Upload className="text-gray-400" />}
                               <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                           </label>
                       </div>
                       <div className="flex-1 space-y-4">
                           <div>
                               <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Product Name</label>
                               <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white outline-none focus:border-[#f97316]" placeholder="e.g. Premium Plan" />
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 flex justify-between"><span>Description</span><button onClick={handleGenerateDescription} disabled={!editingProduct.name || isGeneratingAI} className="flex items-center gap-1 text-[#f97316] hover:text-[#ea580c] disabled:opacity-50 text-[10px]">{isGeneratingAI ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} AI Generate</button></label>
                               <textarea value={editingProduct.description} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} rows={3} className="w-full px-4 py-2 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white outline-none focus:border-[#f97316]" placeholder="Product details..." />
                           </div>
                       </div>
                   </div>
                   <div className="h-px bg-gray-200 dark:bg-gray-800"></div>
                   <div>
                       <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Pricing Model</label>
                       <div className="grid grid-cols-3 gap-3">
                           <button type="button" onClick={() => setActivePricingMode('oneTime')} className={`p-3 rounded-xl border text-left transition-all ${activePricingMode === 'oneTime' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300'}`}>
                               <div className="font-bold text-sm text-gray-900 dark:text-white mb-1">One-time</div>
                               <div className="text-xs text-gray-500">Single payment</div>
                           </button>
                           <button type="button" onClick={() => setActivePricingMode('subscription')} className={`p-3 rounded-xl border text-left transition-all ${activePricingMode === 'subscription' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 ring-1 ring-purple-500' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300'}`}>
                               <div className="font-bold text-sm text-gray-900 dark:text-white mb-1">Subscription</div>
                               <div className="text-xs text-gray-500">Recurring billing</div>
                           </button>
                           <button type="button" onClick={() => setActivePricingMode('paymentPlan')} className={`p-3 rounded-xl border text-left transition-all ${activePricingMode === 'paymentPlan' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 ring-1 ring-orange-500' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300'}`}>
                               <div className="font-bold text-sm text-gray-900 dark:text-white mb-1">Payment Plan</div>
                               <div className="text-xs text-gray-500">Split payments</div>
                           </button>
                       </div>
                   </div>
                   <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                       {activePricingMode === 'oneTime' && (
                           <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                               <div>
                                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Price</label>
                                   <div className="flex rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 overflow-hidden bg-white dark:bg-black focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                                        <div className="relative border-r border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0 w-20">
                                            <select value={editingProduct.currency || 'USD'} onChange={(e) => setEditingProduct({...editingProduct, currency: e.target.value})} className="w-full h-full pl-3 pr-8 py-2 bg-transparent text-gray-900 dark:text-white text-sm font-bold outline-none appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="MAD">MAD</option>
                                            </select>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronDown size={12} /></div>
                                        </div>
                                        <input type="number" value={getCurrentPrice('oneTime')} onChange={(e) => updatePriceValue('oneTime', parseFloat(e.target.value))} className="flex-1 w-full pl-4 pr-4 py-2 bg-transparent text-gray-900 dark:text-white outline-none" placeholder="0.00"/>
                                   </div>
                               </div>
                           </div>
                       )}
                       {activePricingMode === 'subscription' && (
                           <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                               <div>
                                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Price</label>
                                   <div className="flex rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 overflow-hidden bg-white dark:bg-black focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all">
                                        <div className="relative border-r border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0 w-20">
                                            <select value={editingProduct.currency || 'USD'} onChange={(e) => setEditingProduct({...editingProduct, currency: e.target.value})} className="w-full h-full pl-3 pr-8 py-2 bg-transparent text-gray-900 dark:text-white text-sm font-bold outline-none appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="MAD">MAD</option>
                                            </select>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronDown size={12} /></div>
                                        </div>
                                        <input type="number" value={getCurrentPrice('subscription')} onChange={(e) => updatePriceValue('subscription', parseFloat(e.target.value))} className="flex-1 w-full pl-4 pr-4 py-2 bg-transparent text-gray-900 dark:text-white outline-none" placeholder="0.00"/>
                                   </div>
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Billing Interval</label>
                                   <select value={editingProduct.pricing.subscription.interval} onChange={(e) => setEditingProduct({...editingProduct, pricing: { ...editingProduct.pricing, subscription: { ...editingProduct.pricing.subscription, interval: e.target.value as any } }})} className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white outline-none focus:border-purple-500"><option value="month">Monthly</option><option value="year">Yearly</option><option value="week">Weekly</option></select>
                               </div>
                           </div>
                       )}
                       {activePricingMode === 'paymentPlan' && (
                           <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                               <div>
                                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Total Price</label>
                                   <div className="flex rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 overflow-hidden bg-white dark:bg-black focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
                                        <div className="relative border-r border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0 w-20">
                                            <select value={editingProduct.currency || 'USD'} onChange={(e) => setEditingProduct({...editingProduct, currency: e.target.value})} className="w-full h-full pl-3 pr-8 py-2 bg-transparent text-gray-900 dark:text-white text-sm font-bold outline-none appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="MAD">MAD</option>
                                            </select>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronDown size={12} /></div>
                                        </div>
                                        <input type="number" value={getCurrentPrice('paymentPlan')} onChange={(e) => updatePriceValue('paymentPlan', parseFloat(e.target.value))} className="flex-1 w-full pl-4 pr-4 py-2 bg-transparent text-gray-900 dark:text-white outline-none" placeholder="0.00"/>
                                   </div>
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Installments</label>
                                   <select value={editingProduct.pricing.paymentPlan.installments} onChange={(e) => setEditingProduct({...editingProduct, pricing: { ...editingProduct.pricing, paymentPlan: { ...editingProduct.pricing.paymentPlan, installments: parseInt(e.target.value) } }})} className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white outline-none focus:border-orange-500"><option value="2">2 Payments</option><option value="3">3 Payments</option><option value="4">4 Payments</option><option value="6">6 Payments</option></select>
                               </div>
                           </div>
                       )}
                   </div>
               </div>
               <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
                   <button onClick={() => setIsProductModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                   <button onClick={handleSaveProduct} className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-sm hover:opacity-90 transition-colors shadow-lg">Save Product</button>
               </div>
           </div>
        </div>
      )}

      {/* Upsell Edit Modal */}
      {isUpsellModalOpen && editingUpsell && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Zap size={18} className="text-[#f97316]" /> 
                          {editingUpsell.id ? 'Edit Upsell' : 'Create Upsell'}
                      </h3>
                      <button onClick={() => setIsUpsellModalOpen(false)} className="text-gray-500 hover:text-black dark:hover:text-white"><X size={20}/></button>
                  </div>
                  
                  <div className="p-6 space-y-5">
                      {/* Image & Title */}
                      <div className="flex gap-4">
                          <div className="w-24 shrink-0">
                              <label className="block w-full h-24 bg-gray-100 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#f97316] cursor-pointer flex items-center justify-center overflow-hidden relative group">
                                  {editingUpsell.image ? <img src={editingUpsell.image} className="w-full h-full object-cover" /> : <Upload className="text-gray-400" />}
                                  <input type="file" className="hidden" accept="image/*" onChange={handleUpsellImageUpload} />
                              </label>
                          </div>
                          <div className="flex-1 space-y-3">
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Headline</label>
                                  <input 
                                      type="text" 
                                      value={editingUpsell.title} 
                                      onChange={(e) => setEditingUpsell({ ...editingUpsell, title: e.target.value })} 
                                      className="w-full px-3 py-2 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-[#f97316]"
                                      placeholder="e.g. Yes! Add 12 Months Access"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Short Description</label>
                                  <textarea 
                                      value={editingUpsell.description} 
                                      onChange={(e) => setEditingUpsell({ ...editingUpsell, description: e.target.value })} 
                                      className="w-full px-3 py-2 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-[#f97316] resize-none h-16"
                                      placeholder="Explain the offer briefly..."
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="h-px bg-gray-200 dark:bg-gray-800"></div>

                      {/* Pricing Config */}
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Pricing Structure</label>
                          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-800 mb-4">
                              <button 
                                  onClick={() => updateUpsellPricing('offerType', 'one_time')}
                                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${editingUpsell.offerType === 'one_time' ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm' : 'text-gray-500'}`}
                              >
                                  One-Time
                              </button>
                              <button 
                                  onClick={() => updateUpsellPricing('offerType', 'multi_month')}
                                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${editingUpsell.offerType === 'multi_month' ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm' : 'text-gray-500'}`}
                              >
                                  Multi-Month Bundle
                              </button>
                          </div>

                          {editingUpsell.offerType === 'one_time' ? (
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Price</label>
                                  <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">{getCurrencySymbol(config.currency)}</span>
                                      <input 
                                          type="number" 
                                          value={editingUpsell.price} 
                                          onChange={(e) => updateUpsellPricing('price', e.target.value)}
                                          className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:border-[#f97316]"
                                      />
                                  </div>
                              </div>
                          ) : (
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monthly Price</label>
                                      <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">{getCurrencySymbol(config.currency)}</span>
                                          <input 
                                              type="number" 
                                              value={editingUpsell.monthlyPrice} 
                                              onChange={(e) => updateUpsellPricing('monthlyPrice', e.target.value)}
                                              className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:border-[#f97316]"
                                          />
                                      </div>
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Months (Duration)</label>
                                      <input 
                                          type="number" 
                                          value={editingUpsell.durationMonths} 
                                          onChange={(e) => updateUpsellPricing('durationMonths', e.target.value)}
                                          className="w-full px-4 py-2 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:border-[#f97316]"
                                      />
                                  </div>
                              </div>
                          )}
                          
                          {/* Total Summary */}
                          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-lg flex justify-between items-center">
                              <span className="text-sm text-orange-800 dark:text-orange-200">Total charged to customer:</span>
                              <span className="text-lg font-bold text-[#f97316]">{getCurrencySymbol(config.currency)}{editingUpsell.price.toFixed(2)}</span>
                          </div>
                      </div>
                  </div>

                  <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
                      <button onClick={() => setIsUpsellModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
                      <button onClick={handleSaveUpsell} className="px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-sm shadow-lg hover:opacity-90">Save Upsell</button>
                  </div>
              </div>
          </div>
      )}

      {/* Share Modal (Unchanged) */}
      {showShareModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
               <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400"><CheckCircle2 size={32} /></div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Checkout Published!</h3>
               <p className="text-gray-500 text-sm mb-6">Your checkout is now live and ready to accept payments.</p>
               <div className="flex gap-2 mb-6">
                   <input readOnly value={`${window.location.origin}/#/p/${checkoutId}`} className="flex-1 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-500" />
                   <button onClick={handleCopyLink} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">{isCopied ? <Check size={16} /> : <Copy size={16} />}</button>
               </div>
               <div className="flex gap-3">
                   <button onClick={() => setShowShareModal(false)} className="flex-1 py-3 border border-gray-200 dark:border-gray-800 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">Close</button>
                   <button onClick={handleOpenLive} className="flex-1 py-3 bg-[#f97316] text-white rounded-xl font-bold text-sm hover:bg-[#ea580c] transition-colors shadow-lg shadow-[#f97316]/20">View Live</button>
               </div>
           </div>
        </div>
      )}
      
    </div>
  );
};

export default StoreBuilder;