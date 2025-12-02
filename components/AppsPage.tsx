

import React, { useContext, useState } from 'react';
import { Grid, Check, Download, ExternalLink, Settings as SettingsIcon, X, Loader2, Save, MessageCircle } from 'lucide-react';
import { AppContext } from '../AppContext';

type AppId = 'crisp' | 'whatsapp' | 'ga' | 'pixel' | 'zapier' | 'slack' | 'mailchimp' | 'intercom';

const AppsPage = () => {
  const { settings, saveSettings } = useContext(AppContext);
  const [configuringApp, setConfiguringApp] = useState<AppId | null>(null);
  
  // Crisp State
  const [crispId, setCrispId] = useState(settings.crispWebsiteId || '');
  const [isCrispEnabled, setIsCrispEnabled] = useState(settings.crispEnabled || false);

  // WhatsApp State
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '');
  const [isWhatsappEnabled, setIsWhatsappEnabled] = useState(settings.whatsappEnabled || false);

  const handleOpenConfig = (appId: AppId) => {
      if (appId === 'crisp') {
          setCrispId(settings.crispWebsiteId || '');
          setIsCrispEnabled(settings.crispEnabled || false);
      } else if (appId === 'whatsapp') {
          setWhatsappNumber(settings.whatsappNumber || '');
          setIsWhatsappEnabled(settings.whatsappEnabled || false);
      }
      setConfiguringApp(appId);
  };

  const handleSaveCrisp = () => {
      saveSettings({
          ...settings,
          crispEnabled: isCrispEnabled,
          crispWebsiteId: crispId
      });
      setConfiguringApp(null);
  };

  const handleSaveWhatsapp = () => {
      saveSettings({
          ...settings,
          whatsappEnabled: isWhatsappEnabled,
          whatsappNumber: whatsappNumber
      });
      setConfiguringApp(null);
  };

  const apps = [
    { 
        id: 'crisp', 
        name: 'Crisp Live Chat', 
        category: 'Support', 
        description: 'Chat with visitors in real-time, handle support tickets, and build a knowledge base.', 
        installed: settings.crispEnabled, 
        icon: 'bg-[#1972F5]',
        configurable: true
    },
    { 
        id: 'whatsapp', 
        name: 'WhatsApp Chat', 
        category: 'Support', 
        description: 'Add a floating WhatsApp button to your checkout to chat with customers instantly.', 
        installed: settings.whatsappEnabled, 
        icon: 'bg-[#25D366]',
        configurable: true
    },
    { id: 'ga', name: 'Google Analytics', category: 'Analytics', description: 'Track visitors and conversions.', installed: true, icon: 'bg-orange-500', configurable: false },
    { id: 'pixel', name: 'Facebook Pixel', category: 'Marketing', description: 'Retarget visitors with ads.', installed: true, icon: 'bg-blue-600', configurable: false },
    { id: 'zapier', name: 'Zapier', category: 'Automation', description: 'Connect with 5000+ apps.', installed: false, icon: 'bg-orange-600', configurable: false },
    { id: 'slack', name: 'Slack', category: 'Communication', description: 'Get notifications for new sales.', installed: false, icon: 'bg-purple-600', configurable: false },
    { id: 'mailchimp', name: 'Mailchimp', category: 'Email', description: 'Sync customers to your lists.', installed: false, icon: 'bg-yellow-500', configurable: false },
    { id: 'intercom', name: 'Intercom', category: 'Support', description: 'Chat with customers in real-time.', installed: false, icon: 'bg-blue-500', configurable: false },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in relative">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">App Store</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Supercharge your store with integrations.</p>
        </div>
        <div className="relative">
           <input 
              type="text" 
              placeholder="Search apps..." 
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-brand-500 focus:border-brand-500 w-64 shadow-sm focus:outline-none focus:border-[#f97316]"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {apps.map(app => (
            <div key={app.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col hover:border-gray-300 dark:hover:border-gray-700 transition-all group shadow-sm dark:shadow-none hover:shadow-md">
               <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl ${app.icon} flex items-center justify-center text-white font-bold text-xl shadow-md`}>
                     {app.id === 'whatsapp' ? <MessageCircle size={24} /> : app.name.charAt(0)}
                  </div>
                  {app.installed ? (
                     <span className="flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded border border-green-200 dark:border-green-900/50">
                        <Check size={12} /> Installed
                     </span>
                  ) : (
                     <button 
                        onClick={() => app.configurable ? handleOpenConfig(app.id as AppId) : null}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
                     >
                        <Download size={18} />
                     </button>
                  )}
               </div>
               
               <h3 className="font-bold text-gray-900 dark:text-white text-lg">{app.name}</h3>
               <span className="text-xs text-[#f97316] font-medium mb-2">{app.category}</span>
               <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1">{app.description}</p>
               
               <button 
                  onClick={() => app.configurable ? handleOpenConfig(app.id as AppId) : null}
                  className={`w-full py-2 rounded-lg border text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2 
                    ${app.configurable 
                        ? 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white' 
                        : 'border-transparent text-gray-400 cursor-not-allowed opacity-50'
                    }`}
               >
                  {app.installed ? 'Configure' : 'Install'} <SettingsIcon size={14} />
               </button>
            </div>
         ))}
      </div>

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

      {/* Configuration Modal for WhatsApp */}
      {configuringApp === 'whatsapp' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#25D366] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              <MessageCircle size={24} fill="currentColor" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configure WhatsApp</h3>
                      </div>
                      <button onClick={() => setConfiguringApp(null)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"><X size={20}/></button>
                  </div>

                  <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">Enable Chat Button</span>
                          <button 
                             onClick={() => setIsWhatsappEnabled(!isWhatsappEnabled)}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isWhatsappEnabled ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${isWhatsappEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>

                      <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone Number</label>
                          <input 
                              type="text" 
                              value={whatsappNumber}
                              onChange={(e) => setWhatsappNumber(e.target.value)}
                              placeholder="e.g. 212600000000"
                              className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none font-mono text-sm"
                          />
                          <p className="text-xs text-gray-400 mt-1">Include country code without '+' (e.g., 1234567890).</p>
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
                          onClick={handleSaveWhatsapp}
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