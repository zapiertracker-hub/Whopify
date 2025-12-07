import React, { useContext, useEffect, useState } from 'react';
import { 
  Building, User, CreditCard, Wallet, Store, Globe, Megaphone, Tags, Grid, Sparkles, 
  Save, Eye, EyeOff, Loader2 
} from 'lucide-react';
import { AppContext, UserProfile } from '../AppContext';
import { StoreSettings } from '../types';

const SettingsPage = () => {
  const { settings, saveSettings, user, updateUser, theme } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('general');
  const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
  const [isLoading, setIsLoading] = useState(false);

  // Profile State
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profileAvatar, setProfileAvatar] = useState(user.avatar);
  const [profileUsername, setProfileUsername] = useState(user.username || 'admin');
  const [profilePassword, setProfilePassword] = useState(user.password || 'admin');
  const [showPassword, setShowPassword] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: Building, desc: 'Store details & currency' },
    { id: 'account', label: 'Account', icon: User, desc: 'Profile & security' },
    { id: 'payments', label: 'Payments', icon: Wallet, desc: 'Gateways & keys' },
    { id: 'tax', label: 'Taxes', icon: CreditCard, desc: 'Tax rates & calculation' },
  ];

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    setProfileName(user.name);
    setProfileEmail(user.email);
    setProfileAvatar(user.avatar);
    setProfileUsername(user.username || 'admin');
    setProfilePassword(user.password || 'admin');
  }, [user]);

  // Check URL params for tab
  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && tabs.some(t => t.id === tab)) {
          setActiveTab(tab);
      }
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
    saveSettings(localSettings);
    
    if (activeTab === 'account') {
        updateUser({
            name: profileName,
            email: profileEmail,
            avatar: profileAvatar,
            username: profileUsername,
            password: profilePassword
        });
    }

    setIsLoading(false);
  };

  const handleInputChange = (field: keyof StoreSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const TabButton = ({ id, label, icon: Icon, desc }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left ${activeTab === id ? 'bg-white dark:bg-white/10 shadow-sm border border-gray-200 dark:border-white/5' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}
    >
      <div className={`p-2.5 rounded-lg ${activeTab === id ? 'bg-[#f97316] text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400'}`}>
        <Icon size={20} />
      </div>
      <div>
        <div className={`font-bold text-sm ${activeTab === id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{label}</div>
        <div className="text-xs text-gray-500 dark:text-gray-500">{desc}</div>
      </div>
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your store configuration and preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="bg-[#f97316] hover:bg-[#ea580c] text-white dark:text-black font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-[#f97316]/20 transition-all active:scale-95 disabled:opacity-70"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-72 flex flex-col gap-2 shrink-0">
           {tabs.map(tab => <TabButton key={tab.id} {...tab} />)}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm">
          
          {activeTab === 'general' && (
             <div className="space-y-6 max-w-2xl">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">General Settings</h2>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Store Name</label>
                  <input 
                    type="text" 
                    value={localSettings.storeName}
                    onChange={(e) => handleInputChange('storeName', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:border-[#f97316] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Support Email</label>
                  <input 
                    type="email" 
                    value={localSettings.supportEmail}
                    onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:border-[#f97316] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                    <select 
                      value={localSettings.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:border-[#f97316] outline-none appearance-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="MAD">MAD (DH)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
                    <select 
                      value={localSettings.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:border-[#f97316] outline-none appearance-none"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">EST</option>
                      <option value="PST">PST</option>
                      <option value="CET">CET</option>
                    </select>
                  </div>
                </div>
             </div>
          )}

          {activeTab === 'account' && (
             <div className="space-y-6 max-w-2xl">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Account Profile</h2>
                
                <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 bg-[#f97316] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {profileName.charAt(0)}
                    </div>
                    <div>
                        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            Change Avatar
                        </button>
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                  <input 
                    type="text" 
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:border-[#f97316] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:border-[#f97316] outline-none"
                  />
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Login Credentials</h3>
                    
                    <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Username</label>
                          <input 
                            type="text" 
                            value={profileUsername}
                            onChange={(e) => setProfileUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:border-[#f97316] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Password</label>
                          <div className="relative">
                              <input 
                                type={showPassword ? "text" : "password"}
                                value={profilePassword}
                                onChange={(e) => setProfilePassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:border-[#f97316] outline-none"
                              />
                              <button 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                              >
                                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                          </div>
                        </div>
                    </div>
                </div>
             </div>
          )}

          {activeTab === 'payments' && (
             <div className="space-y-8 max-w-2xl">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Providers</h2>
                
                {/* Stripe */}
                <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#161616]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="text-[#635BFF] font-bold text-2xl italic">stripe</div>
                        </div>
                        <button 
                             onClick={() => handleInputChange('stripeEnabled', !localSettings.stripeEnabled)}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.stripeEnabled ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${localSettings.stripeEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {localSettings.stripeEnabled && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center gap-2 mb-2">
                                <input 
                                    type="checkbox" 
                                    id="stripeTestMode" 
                                    checked={localSettings.stripeTestMode}
                                    onChange={(e) => handleInputChange('stripeTestMode', e.target.checked)}
                                    className="rounded border-gray-300 text-[#f97316] focus:ring-[#f97316]"
                                />
                                <label htmlFor="stripeTestMode" className="text-sm text-gray-700 dark:text-gray-300">Enable Test Mode</label>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Publishable Key</label>
                                <input 
                                    type="text" 
                                    value={localSettings.stripePublishableKey}
                                    onChange={(e) => handleInputChange('stripePublishableKey', e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none font-mono"
                                    placeholder="pk_test_..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Secret Key</label>
                                <input 
                                    type="password" 
                                    value={localSettings.stripeSecretKey}
                                    onChange={(e) => handleInputChange('stripeSecretKey', e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none font-mono"
                                    placeholder="sk_test_..."
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* PayPal */}
                <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#161616]">
                    <div className="flex justify-between items-start">
                         <h3 className="text-xl font-bold text-[#003087]">PayPal</h3>
                         <button 
                             onClick={() => handleInputChange('paypalEnabled', !localSettings.paypalEnabled)}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.paypalEnabled ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${localSettings.paypalEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    {localSettings.paypalEnabled && <p className="text-sm text-gray-500 mt-2">PayPal configuration coming soon.</p>}
                </div>

                 {/* Manual Payment */}
                 <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#161616]">
                    <div className="flex justify-between items-start mb-4">
                         <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">Manual Payment</h3>
                         <button 
                             onClick={() => handleInputChange('manualPaymentEnabled', !localSettings.manualPaymentEnabled)}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.manualPaymentEnabled ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${localSettings.manualPaymentEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    
                    {localSettings.manualPaymentEnabled && (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Method Label</label>
                                <input 
                                    type="text" 
                                    value={localSettings.manualPaymentLabel || ''}
                                    onChange={(e) => handleInputChange('manualPaymentLabel', e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none"
                                    placeholder="e.g. Cash on Delivery"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instructions</label>
                                <textarea 
                                    value={localSettings.manualPaymentInstructions || ''}
                                    onChange={(e) => handleInputChange('manualPaymentInstructions', e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none min-h-[100px]"
                                    placeholder="Instructions for the customer..."
                                />
                            </div>
                        </div>
                    )}
                </div>
             </div>
          )}

          {activeTab === 'tax' && (
              <div className="space-y-6 max-w-2xl">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tax Configuration</h2>
                 
                 <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#161616] rounded-xl border border-gray-200 dark:border-gray-800">
                      <span className="font-bold text-gray-900 dark:text-white">Enable Tax Calculation</span>
                      <button 
                             onClick={() => handleInputChange('taxEnabled', !localSettings.taxEnabled)}
                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.taxEnabled ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${localSettings.taxEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                 </div>

                 {localSettings.taxEnabled && (
                     <div className="grid grid-cols-2 gap-6 animate-fade-in">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tax Name</label>
                            <input 
                                type="text" 
                                value={localSettings.taxName}
                                onChange={(e) => handleInputChange('taxName', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:border-[#f97316] outline-none"
                                placeholder="VAT, Sales Tax"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tax Rate (%)</label>
                            <input 
                                type="number" 
                                value={localSettings.taxRate}
                                onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:border-[#f97316] outline-none"
                                placeholder="20"
                            />
                        </div>
                     </div>
                 )}
              </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
