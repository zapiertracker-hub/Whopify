
import React, { useContext, useState } from 'react';
import { 
  BarChart2, MessageCircle, LifeBuoy, Share2, Gamepad2, ShoppingBag, 
  Bitcoin, CreditCard, Wallet, DollarSign, Plus, Check, Settings as SettingsIcon,
  X, Save, Loader2, ChevronRight, LayoutDashboard, Facebook, Twitter, Youtube, Send
} from 'lucide-react';
import { AppContext } from '../AppContext';
import { useNavigate } from 'react-router-dom';

type AppId = 'crisp' | 'whatsapp' | 'ga' | 'helpspace' | 'socials' | 'discord' | 'shopify' | 'crypto' | 'stripe' | 'paypal' | 'cashapp';

const AppsPage = () => {
  const { settings, saveSettings } = useContext(AppContext);
  const navigate = useNavigate();
  const [configuringApp, setConfiguringApp] = useState<AppId | null>(null);
  
  // Crisp State
  const [crispId, setCrispId] = useState(settings.crispWebsiteId || '');
  const [isCrispEnabled, setIsCrispEnabled] = useState(settings.crispEnabled || false);

  const handleInstallClick = (appId: string) => {
      if (appId === 'crisp') {
          setCrispId(settings.crispWebsiteId || '');
          setIsCrispEnabled(settings.crispEnabled || false);
          setConfiguringApp('crisp');
      } else if (appId === 'stripe' || appId === 'paypal' || appId === 'crypto' || appId === 'cashapp') {
          // Redirect to payments settings for payment providers
          navigate('/settings?tab=payments');
      } else {
          alert(`Installation for ${appId} is coming soon!`);
      }
  };

  const handleSaveCrisp = () => {
      saveSettings({
          ...settings,
          crispEnabled: isCrispEnabled,
          crispWebsiteId: crispId
      });
      setConfiguringApp(null);
  };

  const categories = [
    {
      title: "Third party apps",
      apps: [
        { 
            id: 'ga', 
            name: 'Google analytics', 
            description: "Analyze interactions with your storefront through Google's powerful analytics, directly embedded to Paylix.", 
            icon: <div className="text-orange-500"><BarChart2 size={28} /></div> 
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
            icon: <div className="text-purple-500"><LifeBuoy size={28} /></div> 
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
            </div> 
        },
        { 
            id: 'discord', 
            name: 'Discord', 
            description: "Get product updates, stock alerts, notifications, all straight to your Discord server in minutes.", 
            icon: <div className="text-[#5865F2]"><Gamepad2 size={28} /></div> 
        },
        { 
            id: 'shopify', 
            name: 'Shopify', 
            description: "Shopify is a complete commerce platform that lets anyone start, grow, manage, and scale a business.", 
            icon: <div className="text-[#96bf48]"><ShoppingBag size={28} /></div> 
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
    </div>
  );
};

export default AppsPage;
