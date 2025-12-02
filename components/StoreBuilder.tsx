import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../AppContext';
import { CheckoutPage, Product, PaymentMethod } from '../types';
import { CheckoutRenderer } from './CheckoutView';
import { generateMarketingCopy } from '../services/geminiService';
import { 
  ArrowLeft, Settings, ShoppingBag, Plus, Save, Image as ImageIcon,
  X, Upload, AlertCircle, CheckCircle2, Tablet, Monitor, Smartphone, Palette,
  Sun, Moon, Link as LinkIcon, Check, DollarSign, ExternalLink, Copy, Sparkles,
  Loader2, Trash2, Package, RefreshCw, CreditCard, Calendar, PieChart, Eye,
  Wallet, Landmark, Banknote, ArrowUp, ArrowDown, ChevronDown, Globe
} from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

const StoreBuilder = () => {
  const { checkoutId } = useParams();
  const navigate = useNavigate();
  const { checkouts, updateCheckout, settings } = useContext(AppContext);
  
  const [activeTab, setActiveTab] = useState<'settings' | 'products'>('settings');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const [config, setConfig] = useState<CheckoutPage | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

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
  }, [editingProduct?.id]); // Only runs when opening a different product ID or on mount
  
  // Load config from context
  useEffect(() => {
    if (checkoutId) {
      const found = checkouts.find(c => c.id === checkoutId);
      if (found) {
        setConfig(prev => {
            if (!prev) return found;
            // Prevent overwriting unsaved changes if just re-rendering
            if (prev.id !== checkoutId) return found;
            return prev;
        });
      } else {
        // If not found in context (e.g. refresh), context will load it eventually.
        // But for now, if context is empty, we wait or redirect.
        if (checkouts.length > 0) navigate('/checkouts'); 
      }
    }
  }, [checkoutId, checkouts, navigate]);

  if (!config) return <div className="min-h-screen flex items-center justify-center bg-[#020202] text-white"><div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading Editor...</div></div>;

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
        alert("Product name is required");
        return;
    }

    // Determine price based on active mode
    let primaryPrice = 0;
    const finalPricing = { ...editingProduct.pricing };
    const currencyKey = (editingProduct.currency || 'USD').toLowerCase();

    // Reset all to disabled first, then enable active
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
    // Ensure all pricing fields exist for editing
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
     // Save config to ensure preview is live and up to date
     if (config && checkoutId) {
        updateCheckout(checkoutId, config);
     }

     const isBlob = window.location.protocol === 'blob:';
     const url = isBlob ? `#/p/${checkoutId}` : `${window.location.href.split('#')[0]}#/p/${checkoutId}`;
     window.open(url, '_blank');
  };

  const handleSaveChanges = async () => {
     if (config && checkoutId) {
        if (config.products.length === 0) {
            setValidationError("Please add at least one product before publishing.");
            setActiveTab('products');
            setTimeout(() => setValidationError(null), 5000);
            return;
        }

        // Update Local Context
        updateCheckout(checkoutId, config);

        // Try Sync to Backend
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

  // Helper to check if a method is enabled globally
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
              [model]: {
                  ...editingProduct.pricing[model],
                  prices: newPrices
              }
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
          </div>
          <button onClick={handleOpenLive} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"><Eye size={16} /> Live Preview</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* LEFT PANEL */}
        <div className="w-full lg:w-96 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col shrink-0">

          {activeTab === 'settings' && (
             <div className="p-6 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 h-full">
                
                {/* General Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Settings size={16} /> General
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Internal Name</label>
                            <input type="text" value={config.name} onChange={(e) => setConfig({...config, name: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:border-gray-500 dark:focus:border-white"/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Checkout Language</label>
                            <select
                                value={config.language || 'en'}
                                onChange={(e) => setConfig({...config, language: e.target.value as any})}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:border-gray-500 dark:focus:border-white appearance-none cursor-pointer"
                            >
                                <option value="en">English (US)</option>
                                <option value="fr">Français (French)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-800"></div>

                {/* Branding Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Palette size={16} /> Branding
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Checkout Logo</label>
                            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                {config.logo ? <div className="w-12 h-12 bg-gray-100 dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 flex items-center justify-center"><img src={config.logo} alt="Logo" className="max-w-full max-h-full object-contain" /></div> : <div className="w-12 h-12 bg-gray-100 dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0"><ImageIcon size={20} className="text-gray-400 dark:text-gray-500" /></div>}
                                <label className="cursor-pointer px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-all active:scale-95">
                                    Upload Logo
                                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Logo Size ({config.logoScale || 100}%)</label>
                            <input type="range" min="50" max="200" value={config.logoScale || 100} onChange={(e) => setConfig({...config, logoScale: parseInt(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-black dark:accent-white" />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-800"></div>

                {/* Payment Methods Section (Updated) */}
                <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Wallet size={16} /> Payment Methods
                        </h3>
                     </div>
                     <p className="text-xs text-gray-500">
                         Configure which payment gateways are shown on this checkout. 
                         <br/>
                         <span className="text-xs opacity-70">(Only globally enabled gateways can be added)</span>
                     </p>
                     
                     <div className="space-y-2">
                        {/* List Active Methods */}
                        {config.paymentMethods.map((method, index) => {
                            const isEnabledGlobally = isMethodEnabledGlobally(method);
                            return (
                                <div key={method} className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border ${isEnabledGlobally ? 'border-gray-200 dark:border-gray-700' : 'border-red-200 dark:border-red-900/30'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded border ${isEnabledGlobally ? 'bg-white dark:bg-black border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
                                            {getMethodIcon(method)}
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white block">{getMethodName(method)}</span>
                                            {!isEnabledGlobally && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle size={10} /> Disabled in Global Settings</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button disabled={index === 0} onClick={() => movePaymentMethod(index, 'up')} className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30"><ArrowUp size={14} /></button>
                                        <button disabled={index === config.paymentMethods.length - 1} onClick={() => movePaymentMethod(index, 'down')} className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30"><ArrowDown size={14} /></button>
                                        <button onClick={() => togglePaymentMethod(method)} className="ml-2 text-gray-400 hover:text-red-500"><X size={16} /></button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Available to Add */}
                        {availableMethodsToAdd.length > 0 && (
                            <div className="pt-2">
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Available to Add</label>
                                <div className="space-y-2">
                                    {availableMethodsToAdd.map(method => (
                                        <button 
                                            key={method}
                                            onClick={() => togglePaymentMethod(method)}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
                                        >
                                            <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                                                <Plus size={16} />
                                            </div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">{getMethodName(method)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {config.paymentMethods.length === 0 && availableMethodsToAdd.length === 0 && (
                             <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center text-xs text-gray-500">
                                 No payment methods are enabled in Global Settings. <br/>
                                 Go to <b>Settings > Payments</b> to enable gateways.
                             </div>
                        )}
                     </div>
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-800"></div>

                {/* Appearance Section */}
                <div className="space-y-4">
                     <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Monitor size={16} /> Appearance
                    </h3>
                     <div className="grid grid-cols-2 gap-4">
                         <button onClick={() => setConfig({...config, appearance: 'light'})} className={`group relative p-4 rounded-xl border-2 transition-all active:scale-95 flex flex-col items-center gap-3 ${config.appearance === 'light' ? 'border-[#f97316] bg-gray-50' : 'border-gray-200 dark:border-gray-700'}`}>
                            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-yellow-500 shadow-sm"><Sun size={20} /></div>
                            <span className={`text-sm font-bold ${config.appearance === 'light' ? 'text-[#f97316]' : 'text-gray-700 dark:text-gray-300'}`}>Light Mode</span>
                         </button>
                         <button onClick={() => setConfig({...config, appearance: 'dark'})} className={`group relative p-4 rounded-xl border-2 transition-all active:scale-95 flex flex-col items-center gap-3 ${config.appearance !== 'light' ? 'border-[#f97316] bg-gray-900/50' : 'border-gray-200 dark:border-gray-700'}`}>
                            <div className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-white shadow-sm"><Moon size={20} /></div>
                            <span className={`text-sm font-bold ${config.appearance !== 'light' ? 'text-[#f97316]' : 'text-gray-700 dark:text-gray-300'}`}>Dark Mode</span>
                         </button>
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
                                <button 
                                    onClick={() => handleCopyProductLink(p.id)} 
                                    className={`p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 ${copiedProductId === p.id ? 'text-green-500' : 'text-gray-400'}`}
                                    title="Copy Link"
                                >
                                    {copiedProductId === p.id ? <Check size={14} /> : <LinkIcon size={14} />}
                                </button>
                                <button onClick={() => openEditProductModal(p)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"><Settings size={14} /></button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"><X size={14} /></button>
                             </div>
                          </div>
                       );
                   })}
                </div>
             </>
          )}

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-b-xl mt-auto">
             {validationError && (
                <div className="mb-3 px-3 py-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in">
                    <AlertCircle size={14} className="shrink-0" /> {validationError}
                </div>
             )}
             <button onClick={handleSaveChanges} className="w-full bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2">
                 <Save size={18} /> Save Changes
             </button>
          </div>

        </div>

        {/* RIGHT PREVIEW */}
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-[#050505] rounded-xl border border-gray-200 dark:border-gray-800 shadow-inner overflow-hidden relative">
            
            {/* Toolbar */}
            <div className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-1 border border-gray-200 dark:border-gray-800">
                    <button onClick={() => setPreviewMode('desktop')} className={`p-1.5 rounded ${previewMode === 'desktop' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><Monitor size={16}/></button>
                    <button onClick={() => setPreviewMode('tablet')} className={`p-1.5 rounded ${previewMode === 'tablet' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><Tablet size={16}/></button>
                    <button onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded ${previewMode === 'mobile' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><Smartphone size={16}/></button>
                </div>
                <div className="text-xs text-gray-500">Live Editor Preview</div>
            </div>

            {/* Preview Frame */}
            <div className="flex-1 overflow-auto flex justify-center bg-gray-200/50 dark:bg-black/20 p-8">
                 <div 
                    className={`bg-white dark:bg-black shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-800 ${
                        previewMode === 'mobile' ? 'w-[375px] h-[667px] rounded-3xl border-8 border-gray-900' : 
                        previewMode === 'tablet' ? 'w-[768px] h-[1024px] rounded-xl border-4 border-gray-900' : 
                        'w-full h-full rounded-lg'
                    }`}
                 >
                    <CheckoutRenderer checkout={config} settings={settings} isPreview={true} previewMode={previewMode} />
                 </div>
            </div>

        </div>

      </div>

      {/* Product Modal */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
               <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingProduct.id ? 'Edit Product' : 'Add New Product'}</h3>
                   <button onClick={() => setIsProductModalOpen(false)} className="text-gray-500 hover:text-black dark:hover:text-white"><X size={20}/></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                   <div className="flex gap-6">
                       <div className="w-32 space-y-2">
                           <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Image</label>
                           <label className="block w-32 h-32 bg-gray-100 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer flex items-center justify-center relative overflow-hidden group">
                               {editingProduct.image ? <img src={editingProduct.image} alt="" className="w-full h-full object-cover" /> : <Upload className="text-gray-400" />}
                               <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                   <span className="text-white text-xs font-bold">Change</span>
                               </div>
                               <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                           </label>
                       </div>
                       <div className="flex-1 space-y-4">
                           <div>
                               <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Product Name</label>
                               <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white outline-none focus:border-[#f97316]" placeholder="e.g. Premium Plan" />
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 flex justify-between">
                                  <span>Description</span>
                                  <button onClick={handleGenerateDescription} disabled={!editingProduct.name || isGeneratingAI} className="flex items-center gap-1 text-[#f97316] hover:text-[#ea580c] disabled:opacity-50 text-[10px]">
                                     {isGeneratingAI ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} AI Generate
                                  </button>
                               </label>
                               <textarea value={editingProduct.description} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} rows={3} className="w-full px-4 py-2 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white outline-none focus:border-[#f97316]" placeholder="Product details..." />
                           </div>
                       </div>
                   </div>

                   <div className="h-px bg-gray-200 dark:bg-gray-800"></div>

                   {/* Pricing Mode Selector */}
                   <div>
                       <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Pricing Model</label>
                       <div className="grid grid-cols-3 gap-3">
                           <button 
                              type="button"
                              onClick={() => setActivePricingMode('oneTime')}
                              className={`p-3 rounded-xl border text-left transition-all ${activePricingMode === 'oneTime' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300'}`}
                           >
                               <div className="font-bold text-sm text-gray-900 dark:text-white mb-1">One-time</div>
                               <div className="text-xs text-gray-500">Single payment</div>
                           </button>
                           <button 
                              type="button"
                              onClick={() => setActivePricingMode('subscription')}
                              className={`p-3 rounded-xl border text-left transition-all ${activePricingMode === 'subscription' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 ring-1 ring-purple-500' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300'}`}
                           >
                               <div className="font-bold text-sm text-gray-900 dark:text-white mb-1">Subscription</div>
                               <div className="text-xs text-gray-500">Recurring billing</div>
                           </button>
                           <button 
                              type="button"
                              onClick={() => setActivePricingMode('paymentPlan')}
                              className={`p-3 rounded-xl border text-left transition-all ${activePricingMode === 'paymentPlan' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 ring-1 ring-orange-500' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300'}`}
                           >
                               <div className="font-bold text-sm text-gray-900 dark:text-white mb-1">Payment Plan</div>
                               <div className="text-xs text-gray-500">Split payments</div>
                           </button>
                       </div>
                   </div>

                   {/* Dynamic Pricing Fields with Currency Switcher */}
                   <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                       
                       {activePricingMode === 'oneTime' && (
                           <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                               <div>
                                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Price</label>
                                   <div className="flex rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 overflow-hidden bg-white dark:bg-black focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                                        {/* Currency Selector */}
                                        <div className="relative border-r border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0 w-20">
                                            <select 
                                                value={editingProduct.currency || 'USD'} 
                                                onChange={(e) => setEditingProduct({...editingProduct, currency: e.target.value})}
                                                className="w-full h-full pl-3 pr-8 py-2 bg-transparent text-gray-900 dark:text-white text-sm font-bold outline-none appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                                <option value="GBP">GBP</option>
                                                <option value="MAD">MAD</option>
                                            </select>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                <ChevronDown size={12} />
                                            </div>
                                        </div>
                                        
                                        {/* Price Input */}
                                        <input 
                                            type="number" 
                                            value={getCurrentPrice('oneTime')}
                                            onChange={(e) => updatePriceValue('oneTime', parseFloat(e.target.value))}
                                            className="flex-1 w-full pl-4 pr-4 py-2 bg-transparent text-gray-900 dark:text-white outline-none" 
                                            placeholder="0.00"
                                        />
                                   </div>
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Compare at (Optional)</label>
                                   <div className="flex rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 overflow-hidden bg-white dark:bg-black">
                                       <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-700 text-gray-500 text-sm font-bold">
                                           {getCurrencySymbol(editingProduct.currency || 'USD')}
                                       </div>
                                       <input type="number" className="flex-1 w-full px-4 py-2 bg-transparent text-gray-900 dark:text-white outline-none" placeholder="0.00" />
                                   </div>
                               </div>
                           </div>
                       )}

                       {activePricingMode === 'subscription' && (
                           <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                               <div>
                                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Price</label>
                                   <div className="flex rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 overflow-hidden bg-white dark:bg-black focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all">
                                        {/* Currency Selector */}
                                        <div className="relative border-r border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0 w-20">
                                            <select 
                                                value={editingProduct.currency || 'USD'} 
                                                onChange={(e) => setEditingProduct({...editingProduct, currency: e.target.value})}
                                                className="w-full h-full pl-3 pr-8 py-2 bg-transparent text-gray-900 dark:text-white text-sm font-bold outline-none appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                                <option value="GBP">GBP</option>
                                                <option value="MAD">MAD</option>
                                            </select>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                <ChevronDown size={12} />
                                            </div>
                                        </div>
                                        
                                        {/* Price Input */}
                                        <input 
                                            type="number" 
                                            value={getCurrentPrice('subscription')}
                                            onChange={(e) => updatePriceValue('subscription', parseFloat(e.target.value))}
                                            className="flex-1 w-full pl-4 pr-4 py-2 bg-transparent text-gray-900 dark:text-white outline-none" 
                                            placeholder="0.00"
                                        />
                                   </div>
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Billing Interval</label>
                                   <select value={editingProduct.pricing.subscription.interval} onChange={(e) => setEditingProduct({...editingProduct, pricing: { ...editingProduct.pricing, subscription: { ...editingProduct.pricing.subscription, interval: e.target.value as any } }})} className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white outline-none focus:border-purple-500">
                                       <option value="month">Monthly</option>
                                       <option value="year">Yearly</option>
                                       <option value="week">Weekly</option>
                                   </select>
                               </div>
                           </div>
                       )}

                        {activePricingMode === 'paymentPlan' && (
                           <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                               <div>
                                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Total Price</label>
                                   <div className="flex rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 overflow-hidden bg-white dark:bg-black focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
                                        {/* Currency Selector */}
                                        <div className="relative border-r border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0 w-20">
                                            <select 
                                                value={editingProduct.currency || 'USD'} 
                                                onChange={(e) => setEditingProduct({...editingProduct, currency: e.target.value})}
                                                className="w-full h-full pl-3 pr-8 py-2 bg-transparent text-gray-900 dark:text-white text-sm font-bold outline-none appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                                <option value="GBP">GBP</option>
                                                <option value="MAD">MAD</option>
                                            </select>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                <ChevronDown size={12} />
                                            </div>
                                        </div>
                                        
                                        {/* Price Input */}
                                        <input 
                                            type="number" 
                                            value={getCurrentPrice('paymentPlan')}
                                            onChange={(e) => updatePriceValue('paymentPlan', parseFloat(e.target.value))}
                                            className="flex-1 w-full pl-4 pr-4 py-2 bg-transparent text-gray-900 dark:text-white outline-none" 
                                            placeholder="0.00"
                                        />
                                   </div>
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Installments</label>
                                   <select value={editingProduct.pricing.paymentPlan.installments} onChange={(e) => setEditingProduct({...editingProduct, pricing: { ...editingProduct.pricing, paymentPlan: { ...editingProduct.pricing.paymentPlan, installments: parseInt(e.target.value) } }})} className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white outline-none focus:border-orange-500">
                                       <option value="2">2 Payments</option>
                                       <option value="3">3 Payments</option>
                                       <option value="4">4 Payments</option>
                                       <option value="6">6 Payments</option>
                                   </select>
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
               <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
                   <CheckCircle2 size={32} />
               </div>
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