





import React, { useContext, useState } from 'react';
import { 
  BarChart2, MessageCircle, LifeBuoy, Share2, Gamepad2, ShoppingBag, 
  Bitcoin, CreditCard, Wallet, DollarSign, Plus, Check, Settings as SettingsIcon,
  X, Save, Loader2, ChevronRight, LayoutDashboard, Facebook, Twitter, Youtube, Send,
  FileSpreadsheet, Zap, Globe
} from 'lucide-react';
import { AppContext } from '../AppContext';
import { useNavigate } from 'react-router-dom';

type AppId = 'crisp' | 'whatsapp' | 'ga' | 'helpspace' | 'socials' | 'discord' | 'shopify' | 'woocommerce' | 'n8n' | 'crypto' | 'stripe' | 'paypal' | 'cashapp' | 'google_sheets';

const AppsPage = () => {
  const { settings, saveSettings } = useContext(AppContext);
  const navigate = useNavigate();
  const [configuringApp, setConfiguringApp] = useState<AppId | null>(null);
  
  // Crisp State
  const [crispId, setCrispId] = useState(settings.crispWebsiteId || '');
  const [isCrispEnabled, setIsCrispEnabled] = useState(settings.crispEnabled || false);

  // Google Sheets State
  const [sheetUrl, setSheetUrl] = useState(settings.googleSheetsUrl || '');
  const [isSheetsEnabled, setIsSheetsEnabled] = useState(settings.googleSheetsEnabled || false);

  // Shopify State
  const [shopifyUrl, setShopifyUrl] = useState(settings.shopifyStoreUrl || '');
  const [shopifyToken, setShopifyToken] = useState(settings.shopifyAccessToken || '');
  const [isShopifyEnabled, setIsShopifyEnabled] = useState(settings.shopifyEnabled || false);

  // WooCommerce State
  const [wooUrl, setWooUrl] = useState(settings.wooCommerceUrl || '');
  const [wooKey, setWooKey] = useState(settings.wooCommerceConsumerKey || '');
  const [wooSecret, setWooSecret] = useState(settings.wooCommerceConsumerSecret || '');
  const [isWooEnabled, setIsWooEnabled] = useState(settings.wooCommerceEnabled || false);

  // n8n State
  const [n8nUrl, setN8nUrl] = useState(settings.n8nWebhookUrl || '');
  const [isN8nEnabled, setIsN8nEnabled] = useState(settings.n8nEnabled || false);

  // Google Analytics State
  const [gaId, setGaId] = useState(settings.gaMeasurementId || '');
  const [isGaEnabled, setIsGaEnabled] = useState(settings.gaEnabled || false);

  // Helpspace State
  const [helpspaceId, setHelpspaceId] = useState(settings.helpspaceWidgetId || '');
  const [isHelpspaceEnabled, setIsHelpspaceEnabled] = useState(settings.helpspaceEnabled || false);

  // Socials State
  const [socialFb, setSocialFb] = useState(settings.socialFacebook || '');
  const [socialTw, setSocialTw] = useState(settings.socialTwitter || '');
  const [socialIg, setSocialIg] = useState(settings.socialInstagram || '');
  const [socialYt, setSocialYt] = useState(settings.socialYoutube || '');
  const [socialTt, setSocialTt] = useState(settings.socialTiktok || '');
  const [isSocialsEnabled, setIsSocialsEnabled] = useState(settings.socialsEnabled || false);

  // Discord State
  const [discordWebhook, setDiscordWebhook] = useState(settings.discordWebhookUrl || '');
  const [isDiscordEnabled, setIsDiscordEnabled] = useState(settings.discordEnabled || false);

  const handleInstallClick = (appId: string) => {
      if (appId === 'crisp') {
          setCrispId(settings.crispWebsiteId || '');
          setIsCrispEnabled(settings.crispEnabled || false);
          setConfiguringApp('crisp');
      } else if (appId === 'google_sheets') {
          setSheetUrl(settings.googleSheetsUrl || '');
          setIsSheetsEnabled(settings.googleSheetsEnabled || false);
          setConfiguringApp('google_sheets');
      } else if (appId === 'shopify') {
          setShopifyUrl(settings.shopifyStoreUrl || '');
          setShopifyToken(settings.shopifyAccessToken || '');
          setIsShopifyEnabled(settings.shopifyEnabled || false);
          setConfiguringApp('shopify');
      } else if (appId === 'woocommerce') {
          setWooUrl(settings.wooCommerceUrl || '');
          setWooKey(settings.wooCommerceConsumerKey || '');
          setWooSecret(settings.wooCommerceConsumerSecret || '');
          setIsWooEnabled(settings.wooCommerceEnabled || false);
          setConfiguringApp('woocommerce');
      } else if (appId === 'n8n') {
          setN8nUrl(settings.n8nWebhookUrl || '');
          setIsN8nEnabled(settings.n8nEnabled || false);
          setConfiguringApp('n8n');
      } else if (appId === 'ga') {
          setGaId(settings.gaMeasurementId || '');
          setIsGaEnabled(settings.gaEnabled || false);
          setConfiguringApp('ga');
      } else if (appId === 'helpspace') {
          setHelpspaceId(settings.helpspaceWidgetId || '');
          setIsHelpspaceEnabled(settings.helpspaceEnabled || false);
          setConfiguringApp('helpspace');
      } else if (appId === 'socials') {
          setSocialFb(settings.socialFacebook || '');
          setSocialTw(settings.socialTwitter || '');
          setSocialIg(settings.socialInstagram || '');
          setSocialYt(settings.socialYoutube || '');
          setSocialTt(settings.socialTiktok || '');
          setIsSocialsEnabled(settings.socialsEnabled || false);
          setConfiguringApp('socials');
      } else if (appId === 'discord') {
          setDiscordWebhook(settings.discordWebhookUrl || '');
          setIsDiscordEnabled(settings.discordEnabled || false);
          setConfiguringApp('discord');
      } else if (appId === 'stripe' || appId === 'paypal' || appId === 'crypto' || appId === 'cashapp') {
          navigate('/settings?tab=payments');
      } else {
          alert(`Installation for ${appId} is coming soon!`);
      }
  };

  const handleSaveCrisp = () => {
      saveSettings({ ...settings, crispEnabled: isCrispEnabled, crispWebsiteId: crispId });
      setConfiguringApp(null);
  };

  const handleSaveSheets = () => {
      saveSettings({ ...settings, googleSheetsEnabled: isSheetsEnabled, googleSheetsUrl: sheetUrl });
      setConfiguringApp(null);
  };

  const handleSaveShopify = () => {
      saveSettings({ ...settings, shopifyEnabled: isShopifyEnabled, shopifyStoreUrl: shopifyUrl, shopifyAccessToken: shopifyToken });
      setConfiguringApp(null);
  };

  const handleSaveWoo = () => {
      saveSettings({ ...settings, wooCommerceEnabled: isWooEnabled, wooCommerceUrl: wooUrl, wooCommerceConsumerKey: wooKey, wooCommerceConsumerSecret: wooSecret });
      setConfiguringApp(null);
  };

  const handleSaveN8n = () => {
      saveSettings({ ...settings, n8nEnabled: isN8nEnabled, n8nWebhookUrl: n8nUrl });
      setConfiguringApp(null);
  };

  const handleSaveGa = () => {
      saveSettings({ ...settings, gaEnabled: isGaEnabled, gaMeasurementId: gaId });
      setConfiguringApp(null);
  };

  const handleSaveHelpspace = () => {
      saveSettings({ ...settings, helpspaceEnabled: isHelpspaceEnabled, helpspaceWidgetId: helpspaceId });
      setConfiguringApp(null);
  };

  const handleSaveSocials = () => {
      saveSettings({ 
          ...settings, 
          socialsEnabled: isSocialsEnabled, 
          socialFacebook: socialFb,
          socialTwitter: socialTw,
          socialInstagram: socialIg,
          socialYoutube: socialYt,
          socialTiktok: socialTt
      });
      setConfiguringApp(null);
  };

  const handleSaveDiscord = () => {
      saveSettings({ ...settings, discordEnabled: isDiscordEnabled, discordWebhookUrl: discordWebhook });
      setConfiguringApp(null);
  };

  const categories = [
    {
      title: "Third party apps",
      apps: [
        { 
            id: 'google_sheets', 
            name: 'Google Sheets', 
            description: "Automatically sync new orders and customer data to a Google Sheet in real-time.", 
            icon: <div className="text-emerald-500"><FileSpreadsheet size={28} /></div>,
            installed: settings.googleSheetsEnabled
        },
        { 
            id: 'n8n', 
            name: 'n8n', 
            description: "Build advanced automation workflows. Trigger n8n webhooks on every new order.", 
            icon: <div className="text-[#FF6D5A] font-bold text-xl">n8n</div>,
            installed: settings.n8nEnabled
        },
        { 
            id: 'ga', 
            name: 'Google analytics', 
            description: "Analyze interactions with your storefront through Google's powerful analytics, directly embedded to Paylix.", 
            icon: <div className="text-orange-500"><BarChart2 size={28} /></div>,
            installed: settings.gaEnabled
        },
        { 
            id: 'crisp', 
            name: 'Crisp', 
            description: "Support and help your customers directly through your storefront, not a single line of code required.", 
            icon: <div className="text-blue-500"><MessageCircle size={28} /></div>,
            installed: settings.crispEnabled
        },
        { 
            id: 'helpspace', 
            name: 'Helpspace', 
            description: "A well-rounded customer service tool that you and your customers will love! Benefit from team inbox, intuitive interface.", 
            icon: <div className="text-purple-500"><LifeBuoy size={28} /></div>,
            installed: settings.helpspaceEnabled
        },
        { 
            id: 'socials', 
            name: 'Socials', 
            description: "Connect your preferred social networks, they will be displayed on your storefront for your customers to access and choose from.", 
            icon: <div className="flex -space-x-1">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] border border-[#111111]"><Facebook size={12} fill="currentColor"/></div>
                <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-white text-[10px] border border-[#111111]"><Twitter size={12} fill="currentColor"/></div>
                <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] border border-[#111111]"><Youtube size={12} fill="currentColor"/></div>
                <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center text-white text-[10px] border border-[#111111]"><Send size={10} fill="currentColor"/></div>
            </div>,
            installed: settings.socialsEnabled
        },
        { 
            id: 'discord', 
            name: 'Discord', 
            description: "Get product updates, stock alerts, notifications, all straight to your Discord server in minutes.", 
            icon: <div className="text-[#5865F2]"><Gamepad2 size={28} /></div>,
            installed: settings.discordEnabled
        },
        { 
            id: 'shopify', 
            name: 'Shopify', 
            description: "Sync orders with your Shopify store for centralized management and fulfillment.", 
            icon: <div className="text-[#96bf48]"><ShoppingBag size={28} /></div>,
            installed: settings.shopifyEnabled
        },
        { 
            id: 'woocommerce', 
            name: 'WooCommerce', 
            description: "Connect your WordPress WooCommerce store to sync products and orders seamlessly.", 
            icon: <div className="text-[#96588a] font-bold text-lg">Woo</div>,
            installed: settings.wooCommerceEnabled
        },
      ]
    },
    {
      title: "Payments",
      apps: [
        { 
            id: 'crypto', 
            name: 'Cryptocurrencies', 
            description: "We allow you to accept cryptocurrencies through our platform, through integrations like Cryptomus and NOWPayments.", 
            icon: <div className="flex gap-1">
                <div className="w-6 h-6 rounded-full bg-[#F7931A] text-white flex items-center justify-center font-bold text-[10px]">₿</div>
                <div className="w-6 h-6 rounded-full bg-[#627EEA] text-white flex items-center justify-center font-bold text-[10px]">Ξ</div>
                <div className="w-6 h-6 rounded-full bg-[#26A17B] text-white flex items-center justify-center font-bold text-[10px]">T</div>
            </div>,
            installed: settings.cryptoEnabled
        },
        { 
            id: 'stripe', 
            name: 'Stripe', 
            description: "Stripe powers payments infrastructure for the world. In minutes you can start selling with Stripe through your Paylix storefront.", 
            icon: <div className="text-[#635BFF] font-bold text-xl italic tracking-tighter">stripe</div>,
            installed: settings.stripeEnabled
        },
        { 
            id: 'paypal', 
            name: 'PayPal', 
            description: "PayPal is the most recognizable and trusted payments platform. Accept payments through a safe and known platform.", 
            icon: <div className="text-[#003087]"><Wallet size={28} /></div>,
            installed: settings.paypalEnabled
        },
        { 
            id: 'cashapp', 
            name: 'Cash App', 
            description: "CashApp's mobile payments is imperative to your growth through digital ecommerce. Accept payments through CashApp.", 
            icon: <div className="text-[#00D632]"><DollarSign size={28} /></div>,
            installed: settings.cashAppEnabled
        },
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
       
       {/* Header */}
       <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">App Store</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Discover and install apps to supercharge your store.</p>
       </div>

       {categories.map((category, idx) => (
           <div key={idx} className="space-y-4">
               <h2 className="text-lg font-bold text-gray-900 dark:text-white">{category.title}</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {category.apps.map((app) => (
                       <div key={app.id} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col hover:border-gray-300 dark:hover:border-gray-700 transition-colors shadow-sm dark:shadow-none">
                           <div className="mb-4 h-10 flex items-center">
                               {app.icon}
                           </div>
                           <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{app.name}</h3>
                           <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6 line-clamp-4 flex-1">
                               {app.description}
                           </p>
                           
                           <button 
                               onClick={() => handleInstallClick(app.id)}
                               className="w-full bg-gray-100 dark:bg-white hover:bg-gray-200 dark:hover:bg-gray-200 text-gray-900 dark:text-black font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
                           >
                               {app.installed ? (
                                   <><SettingsIcon size={16} /> Configure</>
                               ) : (
                                   <><div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center"><Plus size={10} strokeWidth={4} /></div> Install</>
                               )}
                           </button>
                       </div>
                   ))}
               </div>
           </div>
       ))}

      {/* Configuration Modal for Crisp */}
      {configuringApp === 'crisp' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#1972F5] flex items-center justify-center text-white font-bold text-lg shadow-lg">C</div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configure Crisp</h3>
                      </div>
                      <button onClick={() => setConfiguringApp(null)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"><X size={20}/></button>
                  </div>

                  <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">Enable Chat Widget</span>
                          <button 
                             onClick={() => setIsCrispEnabled(!isCrispEnabled)}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isCrispEnabled ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${isCrispEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>

                      <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Website ID</label>
                          <input 
                              type="text" 
                              value={crispId}
                              onChange={(e) => setCrispId(e.target.value)}
                              placeholder="e.g. 845a7c2-..."
                              className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none font-mono text-sm"
                          />
                          <p className="text-xs text-gray-400 mt-1">Found in Crisp Settings {'>'} Website Settings {'>'} Setup Instructions.</p>
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button 
                          onClick={() => setConfiguringApp(null)} 
                          className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleSaveCrisp}
                          className="flex-1 py-3 rounded-xl bg-[#f97316] text-white dark:text-black font-bold text-sm shadow-lg hover:bg-[#ea580c] transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                          <Save size={16} /> Save
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Configuration Modal for Google Sheets */}
      {configuringApp === 'google_sheets' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg">
                              <FileSpreadsheet size={24} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configure Google Sheets</h3>
                      </div>
                      <button onClick={() => setConfiguringApp(null)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"><X size={20}/></button>
                  </div>

                  <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">Enable Auto-Sync</span>
                          <button 
                             onClick={() => setIsSheetsEnabled(!isSheetsEnabled)}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isSheetsEnabled ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${isSheetsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>

                      <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Webhook URL</label>
                          <input 
                              type="text" 
                              value={sheetUrl}
                              onChange={(e) => setSheetUrl(e.target.value)}
                              placeholder="https://script.google.com/macros/s/..."
                              className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none font-mono text-sm"
                          />
                          <p className="text-xs text-gray-400 mt-1">Paste your Google Apps Script Webhook URL here.</p>
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button 
                          onClick={() => setConfiguringApp(null)} 
                          className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleSaveSheets}
                          className="flex-1 py-3 rounded-xl bg-[#f97316] text-white dark:text-black font-bold text-sm shadow-lg hover:bg-[#ea580c] transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                          <Save size={16} /> Save
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Configuration Modal for Shopify */}
      {configuringApp === 'shopify' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#96bf48]/20 flex items-center justify-center text-[#96bf48] shadow-lg">
                              <ShoppingBag size={24} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configure Shopify</h3>
                      </div>
                      <button onClick={() => setConfiguringApp(null)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"><X size={20}/></button>
                  </div>

                  <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">Sync Orders</span>
                          <button 
                             onClick={() => setIsShopifyEnabled(!isShopifyEnabled)}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isShopifyEnabled ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${isShopifyEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>

                      <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Store URL</label>
                          <input 
                              type="text" 
                              value={shopifyUrl}
                              onChange={(e) => setShopifyUrl(e.target.value)}
                              placeholder="my-store.myshopify.com"
                              className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none font-mono text-sm"
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Admin Access Token</label>
                          <input 
                              type="password" 
                              value={shopifyToken}
                              onChange={(e) => setShopifyToken(e.target.value)}
                              placeholder="shpat_..."
                              className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none font-mono text-sm"
                          />
                          <p className="text-xs text-gray-400 mt-1">Found in Shopify Admin {'>'} Apps {'>'} App development.</p>
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button onClick={() => setConfiguringApp(null)} className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95">Cancel</button>
                      <button onClick={handleSaveShopify} className="flex-1 py-3 rounded-xl bg-[#f97316] text-white dark:text-black font-bold text-sm shadow-lg hover:bg-[#ea580c] transition-all active:scale-95 flex items-center justify-center gap-2"><Save size={16} /> Save</button>
                  </div>
              </div>
          </div>
      )}

      {/* Configuration Modal for WooCommerce */}
      {configuringApp === 'woocommerce' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#96588a]/20 flex items-center justify-center text-[#96588a] font-bold text-sm shadow-lg">Woo</div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configure WooCommerce</h3>
                      </div>
                      <button onClick={() => setConfiguringApp(null)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"><X size={20}/></button>
                  </div>

                  <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">Sync Orders</span>
                          <button 
                             onClick={() => setIsWooEnabled(!isWooEnabled)}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isWooEnabled ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${isWooEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>

                      <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Site URL</label>
                          <input 
                              type="text" 
                              value={wooUrl}
                              onChange={(e) => setWooUrl(e.target.value)}
                              placeholder="https://your-wordpress-site.com"
                              className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none font-mono text-sm"
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Consumer Key</label>
                          <input 
                              type="text" 
                              value={wooKey}
                              onChange={(e) => setWooKey(e.target.value)}
                              placeholder="ck_..."
                              className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none font-mono text-sm"
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Consumer Secret</label>
                          <input 
                              type="password" 
                              value={wooSecret}
                              onChange={(e) => setWooSecret(e.target.value)}
                              placeholder="cs_..."
                              className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none font-mono text-sm"
                          />
                          <p className="text-xs text-gray-400 mt-1">Generate keys in WooCommerce {'>'} Settings {'>'} Advanced {'>'} REST API.</p>
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button onClick={() => setConfiguringApp(null)} className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95">Cancel</button>
                      <button onClick={handleSaveWoo} className="flex-1 py-3 rounded-xl bg-[#f97316] text-white dark:text-black font-bold text-sm shadow-lg hover:bg-[#ea580c] transition-all active:scale-95 flex items-center justify-center gap-2"><Save size={16} /> Save</button>
                  </div>
              </div>
          </div>
      )}

      {/* Configuration Modal for n8n */}
      {configuringApp === 'n8n' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#FF6D5A]/20 flex items-center justify-center text-[#FF6D5A] font-bold text-sm shadow-lg">n8n</div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configure n8n</h3>
                      </div>
                      <button onClick={() => setConfiguringApp(null)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"><X size={20}/></button>
                  </div>

                  <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">Enable Webhook</span>
                          <button 
                             onClick={() => setIsN8nEnabled(!isN8nEnabled)}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isN8nEnabled ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${isN8nEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>

                      <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Webhook URL</label>
                          <input 
                              type="text" 
                              value={n8nUrl}
                              onChange={(e) => setN8nUrl(e.target.value)}
                              placeholder="https://your-n8n-instance.com/webhook/..."
                              className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none font-mono text-sm"
                          />
                          <p className="text-xs text-gray-400 mt-1">This URL will be called with a JSON payload whenever a new order is created.</p>
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button onClick={() => setConfiguringApp(null)} className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95">Cancel</button>
                      <button onClick={handleSaveN8n} className="flex-1 py-3 rounded-xl bg-[#f97316] text-white dark:text-black font-bold text-sm shadow-lg hover:bg-[#ea580c] transition-all active:scale-95 flex items-center justify-center gap-2"><Save size={16} /> Save</button>
                  </div>
              </div>
          </div>
      )}

      {/* Configuration Modal for Google Analytics */}
      {configuringApp === 'ga' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-lg">
                              <BarChart2 size={24} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configure Analytics</h3>
                      </div>
                      <button onClick={() => setConfiguringApp(null)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"><X size={20}/></button>
                  </div>

                  <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">Enable Tracking</span>
                          <button 
                             onClick={() => setIsGaEnabled(!isGaEnabled)}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isGaEnabled ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${isGaEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>

                      <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Measurement ID</label>
                          <input 
                              type="text" 
                              value={gaId}
                              onChange={(e) => setGaId(e.target.value)}
                              placeholder="G-XXXXXXXXXX"
                              className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none font-mono text-sm"
                          />
                          <p className="text-xs text-gray-400 mt-1">Found in Google Analytics {'>'} Admin {'>'} Data Streams.</p>
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button onClick={() => setConfiguringApp(null)} className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95">Cancel</button>
                      <button onClick={handleSaveGa} className="flex-1 py-3 rounded-xl bg-[#f97316] text-white dark:text-black font-bold text-sm shadow-lg hover:bg-[#ea580c] transition-all active:scale-95 flex items-center justify-center gap-2"><Save size={16} /> Save</button>
                  </div>
              </div>
          </div>
      )}

      {/* Configuration Modal for Helpspace */}
      {configuringApp === 'helpspace' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-lg">
                              <LifeBuoy size={24} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configure Helpspace</h3>
                      </div>
                      <button onClick={() => setConfiguringApp(null)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"><X size={20}/></button>
                  </div>

                  <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">Enable Widget</span>
                          <button 
                             onClick={() => setIsHelpspaceEnabled(!isHelpspaceEnabled)}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isHelpspaceEnabled ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${isHelpspaceEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>

                      <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Widget ID</label>
                          <input 
                              type="text" 
                              value={helpspaceId}
                              onChange={(e) => setHelpspaceId(e.target.value)}
                              placeholder="e.g. ws-..."
                              className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none font-mono text-sm"
                          />
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button onClick={() => setConfiguringApp(null)} className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95">Cancel</button>
                      <button onClick={handleSaveHelpspace} className="flex-1 py-3 rounded-xl bg-[#f97316] text-white dark:text-black font-bold text-sm shadow-lg hover:bg-[#ea580c] transition-all active:scale-95 flex items-center justify-center gap-2"><Save size={16} /> Save</button>
                  </div>
              </div>
          </div>
      )}

      {/* Configuration Modal for Socials */}
      {configuringApp === 'socials' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-lg">
                              <Share2 size={24} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configure Socials</h3>
                      </div>
                      <button onClick={() => setConfiguringApp(null)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"><X size={20}/></button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-5 px-1">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">Show Social Icons</span>
                          <button 
                             onClick={() => setIsSocialsEnabled(!isSocialsEnabled)}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isSocialsEnabled ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${isSocialsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>

                      <div className="space-y-4">
                          {[
                              { label: 'Facebook', icon: <Facebook size={16} />, val: socialFb, set: setSocialFb },
                              { label: 'Twitter / X', icon: <Twitter size={16} />, val: socialTw, set: setSocialTw },
                              { label: 'Instagram', icon: <div className="font-bold text-xs">IG</div>, val: socialIg, set: setSocialIg },
                              { label: 'YouTube', icon: <Youtube size={16} />, val: socialYt, set: setSocialYt },
                              { label: 'TikTok', icon: <div className="font-bold text-xs">TT</div>, val: socialTt, set: setSocialTt },
                          ].map((s, i) => (
                              <div key={i}>
                                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                      {s.icon} {s.label}
                                  </label>
                                  <input 
                                      type="text" 
                                      value={s.val}
                                      onChange={(e) => s.set(e.target.value)}
                                      placeholder={`https://${s.label.toLowerCase().split(' ')[0]}.com/...`}
                                      className="w-full px-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none text-sm"
                                  />
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <button onClick={() => setConfiguringApp(null)} className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95">Cancel</button>
                      <button onClick={handleSaveSocials} className="flex-1 py-3 rounded-xl bg-[#f97316] text-white dark:text-black font-bold text-sm shadow-lg hover:bg-[#ea580c] transition-all active:scale-95 flex items-center justify-center gap-2"><Save size={16} /> Save</button>
                  </div>
              </div>
          </div>
      )}

      {/* Configuration Modal for Discord */}
      {configuringApp === 'discord' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#5865F2]/20 flex items-center justify-center text-[#5865F2] shadow-lg">
                              <Gamepad2 size={24} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configure Discord</h3>
                      </div>
                      <button onClick={() => setConfiguringApp(null)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"><X size={20}/></button>
                  </div>

                  <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">Enable Notifications</span>
                          <button 
                             onClick={() => setIsDiscordEnabled(!isDiscordEnabled)}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDiscordEnabled ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${isDiscordEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>

                      <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Webhook URL</label>
                          <input 
                              type="text" 
                              value={discordWebhook}
                              onChange={(e) => setDiscordWebhook(e.target.value)}
                              placeholder="https://discord.com/api/webhooks/..."
                              className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none font-mono text-sm"
                          />
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button onClick={() => setConfiguringApp(null)} className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95">Cancel</button>
                      <button onClick={handleSaveDiscord} className="flex-1 py-3 rounded-xl bg-[#f97316] text-white dark:text-black font-bold text-sm shadow-lg hover:bg-[#ea580c] transition-all active:scale-95 flex items-center justify-center gap-2"><Save size={16} /> Save</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AppsPage;