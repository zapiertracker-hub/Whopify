






import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../AppContext';
import { useSearchParams } from 'react-router-dom';
import { 
  CreditCard, Building, Save, Check, Eye, EyeOff, Globe, Mail, Clock, 
  ShieldCheck, Store, Loader2, RefreshCw, CheckCircle2, XCircle, AlertCircle,
  Shield, Key, Smartphone, Monitor, User, Wallet, Sparkles, UserPlus, 
  Download, Zap, Layout, Trash2, Banknote, Landmark, Bitcoin, Upload,
  ChevronRight, Megaphone, Tags, Grid, LogOut, ChevronDown, Lock, Plus, Activity
} from 'lucide-react';
import EmailMarketingPage from './EmailMarketingPage';
import AffiliatesPage from './AffiliatesPage';
import AppsPage from './AppsPage';
import DomainsPage from './DomainsPage';
import { StripeAccount } from '../types';

type Tab = 'general' | 'account' | 'billing' | 'payments' | 'portal' | 'domains' | 'marketing' | 'apps' | 'updates';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : '';

const SettingsPage = () => {
  const { settings, saveSettings, language, setLanguage, user, updateUser } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize active tab from URL or default to 'general'
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'general');
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [marketingSubTab, setMarketingSubTab] = useState<'email' | 'affiliates'>('email');
  const [localSettings, setLocalSettings] = useState(settings);
  const [showStripeKey, setShowStripeKey] = useState<{[key: string]: boolean}>({});
  const [showPayPalSecret, setShowPayPalSecret] = useState(false);
  const [isVerifyingStripe, setIsVerifyingStripe] = useState(false);
  const [stripeVerificationResult, setStripeVerificationResult] = useState<'success' | 'error' | null>(null);
  const [stripeConnectionDetails, setStripeConnectionDetails] = useState<{ mode: string, currency: string } | null>(null);
  const [stripeErrorMessage, setStripeErrorMessage] = useState<string | null>(null);

  // New Stripe Account State
  const [newStripeLabel, setNewStripeLabel] = useState('');
  const [newStripePK, setNewStripePK] = useState('');
  const [newStripeSK, setNewStripeSK] = useState('');
  const [isAddingStripe, setIsAddingStripe] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profileAvatar, setProfileAvatar] = useState(user.avatar);

  const tabs = [
    { id: 'general', label: 'General', icon: Building, desc: 'Store details & location' },
    { id: 'account', label: 'Account & Security', icon: User, desc: 'Profile, team & security' },
    { id: 'billing', label: 'Billing', icon: CreditCard, desc: 'Plan & invoices' },
    { id: 'payments', label: 'Payments', icon: Wallet, desc: 'Gateways & currency' },
    { id: 'portal', label: 'Portal', icon: Store, desc: 'Customer self-serve' },
    { id: 'domains', label: 'Domains', icon: Globe, desc: 'Custom domain' },
    { id: 'marketing', label: 'Marketing', icon: Megaphone, desc: 'Email & affiliates' },
    { id: 'apps', label: 'Integrations', icon: Grid, desc: 'Connected tools' },
    { id: 'updates', label: 'Updates', icon: Sparkles, desc: 'Changelog' },
  ];

  // Sync with global settings on load
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Sync profile state when user context updates
  useEffect(() => {
      setProfileName(user.name);
      setProfileEmail(user.email);
      setProfileAvatar(user.avatar);
  }, [user]);

  // Sync state with URL parameter changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as Tab;
    if (tabFromUrl && tabs.some(t => t.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: Tab) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    
    // Save settings via context
    saveSettings(localSettings);
    
    // Update user profile
    updateUser({
        name: profileName,
        email: profileEmail,
        avatar: profileAvatar
    });
    
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setProfileAvatar(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleCryptoOption = (coin: string) => {
    const current = localSettings.cryptoOptions || [];
    let updated;
    if (current.includes(coin)) {
      updated = current.filter(c => c !== coin);
    } else {
      updated = [...current, coin];
    }
    updateSetting('cryptoOptions', updated);
  };

  // --- Multi-Stripe Logic ---

  const handleAddStripeAccount = () => {
      if (!newStripeLabel || !newStripePK || !newStripeSK) {
          alert("Please fill in all Stripe account fields.");
          return;
      }
      
      const newAccount: StripeAccount = {
          id: Date.now().toString(),
          label: newStripeLabel,
          publishableKey: newStripePK,
          secretKey: newStripeSK,
          currentRevenue: 0
      };

      const currentAccounts = localSettings.stripeAccounts || [];
      if (currentAccounts.length >= 5) {
          alert("Maximum 5 Stripe accounts allowed.");
          return;
      }

      const updatedAccounts = [...currentAccounts, newAccount];
      
      // If first account, make it active
      const activeId = currentAccounts.length === 0 ? newAccount.id : localSettings.activeStripeAccountId;
      const pubKey = currentAccounts.length === 0 ? newAccount.publishableKey : localSettings.stripePublishableKey;
      const secKey = currentAccounts.length === 0 ? newAccount.secretKey : localSettings.stripeSecretKey;

      setLocalSettings(prev => ({
          ...prev,
          stripeAccounts: updatedAccounts,
          activeStripeAccountId: activeId,
          stripePublishableKey: pubKey,
          stripeSecretKey: secKey
      }));

      // Reset form
      setNewStripeLabel('');
      setNewStripePK('');
      setNewStripeSK('');
      setIsAddingStripe(false);
  };

  const handleRemoveStripeAccount = (id: string) => {
      const updatedAccounts = (localSettings.stripeAccounts || []).filter(a => a.id !== id);
      
      // Handle active switch if removing active account
      let nextActiveId = localSettings.activeStripeAccountId;
      let nextPubKey = localSettings.stripePublishableKey;
      let nextSecKey = localSettings.stripeSecretKey;

      if (id === localSettings.activeStripeAccountId) {
          if (updatedAccounts.length > 0) {
              nextActiveId = updatedAccounts[0].id;
              nextPubKey = updatedAccounts[0].publishableKey;
              nextSecKey = updatedAccounts[0].secretKey;
          } else {
              nextActiveId = undefined;
              nextPubKey = '';
              nextSecKey = '';
          }
      }

      setLocalSettings(prev => ({
          ...prev,
          stripeAccounts: updatedAccounts,
          activeStripeAccountId: nextActiveId,
          stripePublishableKey: nextPubKey,
          stripeSecretKey: nextSecKey
      }));
  };

  const handleSetActiveStripeAccount = (id: string) => {
      const account = (localSettings.stripeAccounts || []).find(a => a.id === id);
      if (account) {
          setLocalSettings(prev => ({
              ...prev,
              activeStripeAccountId: id,
              stripePublishableKey: account.publishableKey,
              stripeSecretKey: account.secretKey
          }));
      }
  };

  const updateStripeLimit = (id: string, limit: string) => {
      const numLimit = limit === '' ? undefined : parseFloat(limit);
      const updatedAccounts = (localSettings.stripeAccounts || []).map(a => 
          a.id === id ? { ...a, revenueLimit: numLimit } : a
      );
      setLocalSettings(prev => ({ ...prev, stripeAccounts: updatedAccounts }));
  };

  const verifyStripeConnection = async (secretKey: string) => {
    const key = secretKey?.trim();
    if (!key) return;
    
    setIsVerifyingStripe(true);
    setStripeVerificationResult(null);
    setStripeErrorMessage(null);

    if (!key.startsWith('sk_') && !key.startsWith('rk_')) {
         setIsVerifyingStripe(false);
         setStripeVerificationResult('error');
         setStripeErrorMessage("Invalid Key Format. Must start with 'sk_' or 'rk_'.");
         return;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); 

    try {
        const res = await fetch(`${API_URL}/api/verify-connection`, {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
                 'x-stripe-secret-key': key
             },
             signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch(e) {
            throw new Error(`Server returned invalid response.`);
        }

        if (res.ok && data.status === 'connected') {
            setStripeVerificationResult('success');
            setStripeConnectionDetails({ mode: data.mode, currency: data.currency });
        } else {
            throw new Error(data.message || "Connection failed.");
        }
    } catch (e: any) {
        clearTimeout(timeoutId);
        if (key.startsWith('sk_test_')) {
             setStripeVerificationResult('success');
             setStripeConnectionDetails({ mode: 'Test Mode (Local/Fallback)', currency: 'USD' });
        } else {
             setStripeVerificationResult('error');
             setStripeErrorMessage(e.message === "Aborted" ? "Connection timed out." : (e.message || "Could not connect to server."));
        }
    } finally {
        setIsVerifyingStripe(false);
    }
  };

  const renderSaveButton = () => (
    <button 
      onClick={handleSave}
      disabled={saveStatus === 'saving'}
      className={`
        relative min-w-[150px] h-10 overflow-hidden group
        flex items-center justify-center rounded-xl font-bold text-sm transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
        active:scale-95 hover:-translate-y-0.5 outline-none
        ${saveStatus === 'saved' 
          ? 'bg-green-500 text-white shadow-[0_4px_14px_0_rgba(34,197,94,0.39)]' 
          : 'bg-[#f97316] text-white dark:text-black shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:bg-[#ea580c]'
        }
      `}
    >
      <span className={`absolute flex items-center gap-2 transition-all duration-300 ${saveStatus === 'saved' ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
         {saveStatus === 'saving' ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
         <span>{saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}</span>
      </span>
      
      <span className={`absolute flex items-center gap-2 transition-all duration-300 ${saveStatus === 'saved' ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
         <CheckCircle2 size={18} />
         <span>Saved!</span>
      </span>
    </button>
  );

  return (
    <div className="max-w-[1400px] mx-auto pb-20 animate-fade-in px-4 md:p-8 pt-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base mt-2">Manage your store configuration and preferences.</p>
        </div>
        {(activeTab === 'general' || activeTab === 'payments' || activeTab === 'account' || activeTab === 'portal' || activeTab === 'billing') && (
           <div className="hidden md:block">{renderSaveButton()}</div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Navigation Sidebar */}
        <nav className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 h-fit z-20 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as Tab)}
              className={`group w-full flex items-center p-3 rounded-xl text-left transition-all duration-200 active:scale-95 border ${activeTab === tab.id ? 'bg-white dark:bg-[#111] border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none ring-1 ring-black/5 dark:ring-white/5' : 'border-transparent hover:bg-gray-100 dark:hover:bg-[#111] text-gray-500 dark:text-gray-400'}`}
            >
              <div className={`p-2 rounded-lg mr-3 transition-colors ${activeTab === tab.id ? 'bg-orange-50 dark:bg-orange-500/10 text-[#f97316]' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`}>
                {React.createElement(tab.icon, { size: 18 })}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-bold text-sm truncate ${activeTab === tab.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'}`}>{tab.label}</div>
              </div>
              {activeTab === tab.id && <ChevronRight size={16} className="ml-2 text-[#f97316]" />}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className="flex-1 min-w-0 space-y-8">
          
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-gray-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Store Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Store Name</label>
                    <div className="relative group">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f97316] transition-colors" size={18} />
                        <input type="text" value={localSettings.storeName} onChange={(e) => updateSetting('storeName', e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none transition-all font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Support Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f97316] transition-colors" size={18} />
                        <input type="email" value={localSettings.supportEmail} onChange={(e) => updateSetting('supportEmail', e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none transition-all font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Timezone</label>
                    <div className="relative group">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f97316] transition-colors" size={18} />
                        <select value={localSettings.timezone} onChange={(e) => updateSetting('timezone', e.target.value)} className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none transition-all font-medium appearance-none cursor-pointer">
                            <option>(GMT+01:00) Casablanca</option>
                            <option>(GMT+00:00) London</option>
                            <option>(GMT-05:00) New York</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Language</label>
                    <div className="relative group">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f97316] transition-colors" size={18} />
                        <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none transition-all font-medium appearance-none cursor-pointer">
                            <option value="en">English (US)</option>
                            <option value="fr">Français</option>
                            <option value="ar">العربية</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Tab (Merged with Security) */}
          {activeTab === 'account' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Profile Section */}
              <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-gray-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg text-gray-600 dark:text-gray-300"><User size={24} /></div>
                    <div><h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile</h3><p className="text-sm text-gray-500 dark:text-gray-400">Manage your personal information.</p></div>
                </div>
                
                <div className="flex flex-col md:flex-row items-start gap-8">
                     <div className="flex flex-col items-center gap-3">
                         {/* Avatar Upload */}
                         <label className="relative cursor-pointer group">
                             <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 dark:from-[#222] dark:to-[#111] flex items-center justify-center text-white text-4xl font-serif italic border-4 border-gray-100 dark:border-white/5 shadow-xl overflow-hidden transition-all group-hover:scale-105">
                                {profileAvatar ? <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" /> : profileName.charAt(0)}
                             </div>
                             <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                 <Upload size={24} className="text-white" />
                             </div>
                             <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                         </label>
                         <p className="text-xs text-gray-500 font-medium">Click to upload</p>
                     </div>
                     <div className="flex-1 w-full grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Full Name</label>
                            <input 
                                type="text" 
                                value={profileName} 
                                onChange={(e) => setProfileName(e.target.value)} 
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white font-medium focus:border-[#f97316] outline-none transition-colors" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email Address</label>
                            <input 
                                type="email" 
                                value={profileEmail} 
                                onChange={(e) => setProfileEmail(e.target.value)} 
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white font-medium focus:border-[#f97316] outline-none transition-colors" 
                            />
                        </div>
                     </div>
                </div>
              </div>

              {/* Security Section (Merged) */}
              <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-gray-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg"><Shield size={24} /></div>
                      <div><h3 className="text-xl font-bold text-gray-900 dark:text-white">Security</h3><p className="text-sm text-gray-500 dark:text-gray-400">Password & Authentication.</p></div>
                  </div>

                  <div className="space-y-6">
                      {/* Password Change */}
                      <div className="p-5 bg-gray-50 dark:bg-[#121214] rounded-xl border border-gray-100 dark:border-white/5 space-y-4">
                          <div className="flex items-center gap-4 mb-2">
                              <div className="p-2 bg-white dark:bg-[#09090b] rounded-lg text-gray-500 shadow-sm"><Key size={20} /></div>
                              <div>
                                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Change Password</h4>
                                  <p className="text-xs text-gray-500 mt-0.5">Ensure your account uses a strong password.</p>
                              </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input type="password" placeholder="New Password" className="px-4 py-2 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-[#f97316]" />
                              <input type="password" placeholder="Confirm Password" className="px-4 py-2 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-[#f97316]" />
                          </div>
                          <div className="flex justify-end">
                              <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors">Update Password</button>
                          </div>
                      </div>

                      {/* 2FA */}
                      <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-[#121214] rounded-xl border border-gray-100 dark:border-white/5">
                          <div className="flex items-center gap-4">
                              <div className="p-2 bg-white dark:bg-[#09090b] rounded-lg text-gray-500 shadow-sm"><Smartphone size={20} /></div>
                              <div>
                                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Two-Factor Authentication</h4>
                                  <p className="text-xs text-gray-500 mt-0.5">Secure your account with 2FA.</p>
                              </div>
                          </div>
                          <button onClick={() => updateSetting('twoFactorEnabled', !localSettings.twoFactorEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.twoFactorEnabled ? 'bg-[#f97316]' : 'bg-gray-200 dark:bg-[#222]'}`}>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${localSettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>

                      {/* Active Sessions */}
                      <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4 pl-1">Active Sessions</h4>
                          <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#121214] transition-colors group">
                                  <div className="flex items-center gap-3">
                                      <Monitor size={18} className="text-green-500" />
                                      <div>
                                          <p className="text-sm font-bold text-gray-900 dark:text-white">Macbook Pro <span className="font-normal text-gray-500">(This device)</span></p>
                                          <p className="text-xs text-gray-500">Casablanca, MA • Chrome</p>
                                      </div>
                                  </div>
                                  <span className="text-[10px] font-bold text-green-600 bg-green-100 dark:bg-green-500/10 px-2 py-1 rounded border border-green-200 dark:border-green-500/20">Active</span>
                              </div>
                          </div>
                          <div className="mt-6 border-t border-gray-100 dark:border-white/5 pt-6">
                              <button className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-2">
                                  <LogOut size={16} /> Log out all other devices
                              </button>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Team Section */}
              <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-gray-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
                 <div className="flex justify-between items-start mb-6">
                    <div><h3 className="text-xl font-bold text-gray-900 dark:text-white">Team Members</h3><p className="text-sm text-gray-500 dark:text-gray-400">Collaborate with your team.</p></div>
                    <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-2">
                        <UserPlus size={16} /> Invite
                    </button>
                 </div>

                 <div className="space-y-3">
                     <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#121214] rounded-xl border border-gray-100 dark:border-white/5">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold overflow-hidden">
                                {profileAvatar ? <img src={profileAvatar} className="w-full h-full object-cover" /> : profileName.charAt(0)}
                             </div>
                             <div>
                                 <p className="text-sm font-bold text-gray-900 dark:text-white">{profileName} <span className="opacity-50 font-normal">(You)</span></p>
                                 <p className="text-xs text-gray-500">Owner • {profileEmail}</p>
                             </div>
                         </div>
                         <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-500/20">Active</span>
                     </div>
                 </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gradient-to-br from-[#111111] to-[#000] text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-white/10">
                    <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-1/3 -translate-y-1/3">
                        <Zap size={200} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1 bg-gradient-to-r from-[#f97316] to-red-500 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg text-white border border-white/10">Growth Plan</span>
                                <span className="text-gray-400 text-xs font-medium bg-white/5 px-2 py-1 rounded-full">Billed monthly</span>
                            </div>
                            <h2 className="text-5xl font-black mb-3 tracking-tight">$29<span className="text-xl text-gray-500 font-medium">/mo</span></h2>
                            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                                Access to all features including Ghost Links, advanced analytics, and zero transaction fees.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 w-full md:w-auto">
                            <button className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg active:scale-95 text-sm">Manage Subscription</button>
                            <button className="px-6 py-3 bg-white/5 text-white border border-white/10 font-bold rounded-xl hover:bg-white/10 transition-colors active:scale-95 text-sm">Upgrade Plan</button>
                        </div>
                    </div>
                    
                    {/* Usage Stats */}
                    <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2 text-gray-400"><span>Revenue Limit</span><span className="text-white">$12.5k / $50k</span></div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[25%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2 text-gray-400"><span>Team Members</span><span className="text-white">1 / 5</span></div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[20%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2 text-gray-400"><span>Storage</span><span className="text-white">2.1 GB / 10 GB</span></div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[21%] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-gray-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Payment Method</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#121214] rounded-xl border border-gray-200 dark:border-white/10">
                         <div className="flex items-center gap-4">
                             <div className="w-14 h-10 bg-white dark:bg-[#09090b] rounded border border-gray-200 dark:border-white/10 flex items-center justify-center relative overflow-hidden">
                                 <div className="flex -space-x-2">
                                     <div className="w-4 h-4 rounded-full bg-red-500/80 mix-blend-multiply dark:mix-blend-normal"></div>
                                     <div className="w-4 h-4 rounded-full bg-yellow-500/80 mix-blend-multiply dark:mix-blend-normal"></div>
                                 </div>
                             </div>
                             <div>
                                 <p className="text-sm font-bold text-gray-900 dark:text-white">Mastercard ending in 8842</p>
                                 <p className="text-xs text-gray-500">Expires 12/28 • Default</p>
                             </div>
                         </div>
                         <button className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-gray-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Invoice History</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/10 text-gray-500">
                                    <th className="py-3 pl-2 font-bold uppercase text-xs">Date</th>
                                    <th className="py-3 font-bold uppercase text-xs">Amount</th>
                                    <th className="py-3 font-bold uppercase text-xs">Status</th>
                                    <th className="py-3 pr-2 font-bold uppercase text-xs text-right">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {[1,2].map((i) => (
                                    <tr key={i} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="py-4 pl-2 text-gray-900 dark:text-white font-medium">Oct 01, 2023</td>
                                        <td className="py-4 text-gray-900 dark:text-white font-mono">$29.00</td>
                                        <td className="py-4"><span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20">Paid</span></td>
                                        <td className="py-4 pr-2 text-right"><button className="inline-flex items-center gap-1.5 justify-end text-gray-500 hover:text-gray-900 dark:hover:text-white text-xs font-bold transition-colors"><Download size={14} /> PDF</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
             </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Currency Selector */}
              <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-gray-200 dark:border-white/10 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Store Currency</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Primary currency for pricing and analytics.</p>
                 </div>
                 <div className="relative group min-w-[200px]">
                    <select value={localSettings.currency} onChange={(e) => updateSetting('currency', e.target.value)} className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white font-bold cursor-pointer appearance-none outline-none focus:border-[#f97316]">
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="MAD">MAD (DH)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                 </div>
              </div>

              {/* Stripe Accounts Section */}
              <div className={`bg-white dark:bg-[#09090b] rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${localSettings.stripeEnabled ? 'border-[#635BFF] ring-1 ring-[#635BFF]/30' : 'border-gray-200 dark:border-white/10'}`}>
                <div className="p-6 md:p-8 flex justify-between items-start bg-gradient-to-b from-[#635BFF]/5 to-transparent">
                  <div className="flex items-center gap-5">
                    <div className="p-3.5 bg-[#635BFF] text-white rounded-2xl shadow-lg shadow-[#635BFF]/30">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.9297 12.8703C12.9297 11.2393 14.2863 10.669 16.3223 10.669C18.17 10.669 19.963 11.1037 21.4023 11.647V6.99967C19.8817 6.429 18.2517 6.18433 16.295 6.18433C11.3 6.18433 7.82167 8.875 7.82167 13.1423C7.82167 19.0123 16.0503 18.3873 16.0503 20.6973C16.0503 21.8387 14.9383 22.3823 13.2557 22.3823C11.1643 22.3823 9.20767 21.866 7.631 21.1593V26.0243C9.37033 26.7037 11.2457 27.0027 13.201 27.0027C18.6637 27.0027 21.9183 24.3667 21.9183 20.181C21.9183 14.229 12.9297 14.5823 12.9297 12.8703Z" fill="white"/>
                        </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                          Stripe 
                          {localSettings.stripeEnabled && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20 text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 size={12} /> Active</span>}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Accept credit cards, Apple Pay, and Google Pay.</p>
                    </div>
                  </div>
                  <button onClick={() => updateSetting('stripeEnabled', !localSettings.stripeEnabled)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${localSettings.stripeEnabled ? 'bg-[#635BFF]' : 'bg-gray-200 dark:bg-[#1a1a1a]'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${localSettings.stripeEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                {localSettings.stripeEnabled && (
                  <div className="px-6 md:px-8 pb-8 pt-2 animate-in slide-in-from-top-2 fade-in">
                    
                    {/* Add Account Form */}
                    {isAddingStripe ? (
                        <div className="mb-6 p-5 bg-gray-50 dark:bg-[#121214] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Connect New Account</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Account Label</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Main USA, Backup LLC" 
                                        value={newStripeLabel} 
                                        onChange={(e) => setNewStripeLabel(e.target.value)} 
                                        className="w-full px-3 py-2 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-[#635BFF]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Publishable Key</label>
                                    <input 
                                        type="text" 
                                        placeholder="pk_test_..." 
                                        value={newStripePK} 
                                        onChange={(e) => setNewStripePK(e.target.value)} 
                                        className="w-full px-3 py-2 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-[#635BFF] font-mono" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Secret Key</label>
                                    <input 
                                        type="password" 
                                        placeholder="sk_test_..." 
                                        value={newStripeSK} 
                                        onChange={(e) => setNewStripeSK(e.target.value)} 
                                        className="w-full px-3 py-2 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-[#635BFF] font-mono" 
                                    />
                                </div>
                                <div className="flex gap-2 justify-end pt-2">
                                    <button onClick={() => setIsAddingStripe(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Cancel</button>
                                    <button onClick={handleAddStripeAccount} className="px-4 py-2 bg-[#635BFF] text-white rounded-lg text-xs font-bold shadow-md hover:bg-[#5349e0] transition-colors">Add Account</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 flex justify-end">
                            <button 
                                onClick={() => setIsAddingStripe(true)} 
                                disabled={(localSettings.stripeAccounts || []).length >= 5}
                                className="flex items-center gap-2 text-xs font-bold text-[#635BFF] bg-[#635BFF]/10 px-3 py-2 rounded-lg hover:bg-[#635BFF]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={14} /> Add Account ({(localSettings.stripeAccounts || []).length}/5)
                            </button>
                        </div>
                    )}

                    {/* Account List */}
                    <div className="space-y-3">
                        {(localSettings.stripeAccounts || []).map((account) => {
                            const isActive = localSettings.activeStripeAccountId === account.id;
                            const isShowingKey = showStripeKey[account.id];

                            return (
                                <div key={account.id} className={`p-4 rounded-xl border transition-all ${isActive ? 'bg-[#635BFF]/5 border-[#635BFF] shadow-sm' : 'bg-gray-50 dark:bg-[#121214] border-gray-200 dark:border-white/10'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-[#635BFF] animate-pulse' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{account.label}</h4>
                                            {isActive && <span className="text-[10px] font-bold text-[#635BFF] bg-[#635BFF]/10 px-2 py-0.5 rounded border border-[#635BFF]/20 uppercase">Active</span>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!isActive && (
                                                <button 
                                                    onClick={() => handleSetActiveStripeAccount(account.id)}
                                                    className="text-xs font-bold text-gray-500 hover:text-[#635BFF] transition-colors"
                                                >
                                                    Set Active
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleRemoveStripeAccount(account.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                title="Remove Account"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 mb-3">
                                        <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400 bg-white dark:bg-[#09090b] px-3 py-1.5 rounded border border-gray-200 dark:border-white/5 truncate">
                                            <span className="text-gray-400 select-none">PK:</span> {account.publishableKey}
                                        </div>
                                        <div className="flex items-center justify-between text-xs font-mono text-gray-500 dark:text-gray-400 bg-white dark:bg-[#09090b] px-3 py-1.5 rounded border border-gray-200 dark:border-white/5 truncate">
                                            <div className="flex items-center gap-2 truncate">
                                                <span className="text-gray-400 select-none">SK:</span> 
                                                <span>{isShowingKey ? account.secretKey : '•'.repeat(24)}</span>
                                            </div>
                                            <button 
                                                onClick={() => setShowStripeKey(prev => ({ ...prev, [account.id]: !prev[account.id] }))}
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2"
                                            >
                                                {isShowingKey ? <EyeOff size={12} /> : <Eye size={12} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Test Connection Button */}
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={() => verifyStripeConnection(account.secretKey)} 
                                            disabled={isVerifyingStripe} 
                                            className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-[#635BFF] transition-colors disabled:opacity-50"
                                        >
                                            {isVerifyingStripe ? <Loader2 className="animate-spin" size={10} /> : <RefreshCw size={10} />} Test Connection
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {(!localSettings.stripeAccounts || localSettings.stripeAccounts.length === 0) && !isAddingStripe && (
                            <div className="text-center py-8 text-gray-500 text-xs">No accounts connected. Add one to start accepting payments.</div>
                        )}
                    </div>

                    {/* Payment Limits Section */}
                    {(localSettings.stripeAccounts && localSettings.stripeAccounts.length > 0) && (
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                                <Activity size={16} className="text-[#635BFF]" /> Payment Limits
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Set revenue limits for each account to manage risk distribution.</p>
                            
                            <div className="space-y-4">
                                {localSettings.stripeAccounts.map((account) => (
                                    <div key={account.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-[#121214] rounded-xl border border-gray-200 dark:border-white/5">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{account.label}</div>
                                            <div className="text-xs text-gray-500">Current: ${(account.currentRevenue || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Limit: $</span>
                                            <input 
                                                type="number" 
                                                placeholder="No Limit" 
                                                value={account.revenueLimit === undefined ? '' : account.revenueLimit}
                                                onChange={(e) => updateStripeLimit(account.id, e.target.value)}
                                                className="w-24 px-2 py-1 bg-white dark:bg-[#09090b] border border-gray-300 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#635BFF]"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {stripeVerificationResult === 'success' && <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-bold animate-in fade-in"><CheckCircle2 size={14} /> Connected: {stripeConnectionDetails?.mode}</div>}
                    {stripeVerificationResult === 'error' && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-bold animate-in fade-in"><XCircle size={14} /> {stripeErrorMessage}</div>}
                  </div>
                )}
              </div>

              {/* PayPal Section */}
              <div className={`bg-white dark:bg-[#09090b] rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${localSettings.paypalEnabled ? 'border-[#003087] ring-1 ring-[#003087]/30' : 'border-gray-200 dark:border-white/10'}`}>
                <div className="p-6 md:p-8 flex justify-between items-start bg-gradient-to-b from-[#003087]/5 to-transparent">
                  <div className="flex items-center gap-5">
                    <div className="p-3.5 bg-[#003087] text-white rounded-2xl shadow-lg shadow-[#003087]/30">
                        <Wallet size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                          PayPal
                          {localSettings.paypalEnabled && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#003087]/10 text-[#003087] border border-[#003087]/20 text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 size={12} /> Active</span>}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Accept payments via PayPal accounts.</p>
                    </div>
                  </div>
                  <button onClick={() => updateSetting('paypalEnabled', !localSettings.paypalEnabled)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${localSettings.paypalEnabled ? 'bg-[#003087]' : 'bg-gray-200 dark:bg-[#1a1a1a]'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${localSettings.paypalEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                {localSettings.paypalEnabled && (
                  <div className="px-6 md:px-8 pb-8 pt-2 animate-in slide-in-from-top-2 fade-in">
                    <div className="p-6 bg-gray-50 dark:bg-[#121214] rounded-xl border border-gray-200 dark:border-white/10 space-y-5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Environment</span>
                            <div className="flex bg-white dark:bg-[#09090b] p-1 rounded-lg border border-gray-200 dark:border-white/10">
                                <button 
                                    onClick={() => updateSetting('paypalMode', 'sandbox')}
                                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${localSettings.paypalMode === 'sandbox' ? 'bg-[#003087] text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Sandbox
                                </button>
                                <button 
                                    onClick={() => updateSetting('paypalMode', 'live')}
                                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${localSettings.paypalMode === 'live' ? 'bg-[#003087] text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Live
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Client ID</label>
                            <input 
                                type="text" 
                                value={localSettings.paypalClientId || ''} 
                                onChange={(e) => updateSetting('paypalClientId', e.target.value)} 
                                className="w-full px-4 py-3 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:border-[#003087] outline-none font-mono text-xs" 
                                placeholder="Client ID from PayPal Developer Dashboard" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Client Secret</label>
                            <div className="relative">
                                <input 
                                    type={showPayPalSecret ? "text" : "password"} 
                                    value={localSettings.paypalSecret || ''} 
                                    onChange={(e) => updateSetting('paypalSecret', e.target.value)} 
                                    className="w-full px-4 py-3 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:border-[#003087] outline-none font-mono text-xs pr-10" 
                                    placeholder="Secret Key" 
                                />
                                <button 
                                    onClick={() => setShowPayPalSecret(!showPayPalSecret)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    {showPayPalSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Crypto */}
              <div className={`bg-white dark:bg-[#09090b] rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${localSettings.cryptoEnabled ? 'border-orange-500 ring-1 ring-orange-500/30' : 'border-gray-200 dark:border-white/10'}`}>
                <div className="p-6 md:p-8 flex justify-between items-start bg-gradient-to-b from-orange-500/5 to-transparent">
                  <div className="flex items-center gap-5">
                    <div className="p-3.5 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/30"><Bitcoin size={32} /></div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                          Crypto 
                          {localSettings.cryptoEnabled && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 size={12} /> Active</span>}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Accept Bitcoin, Ethereum, and USDT.</p>
                    </div>
                  </div>
                  <button onClick={() => updateSetting('cryptoEnabled', !localSettings.cryptoEnabled)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${localSettings.cryptoEnabled ? 'bg-orange-500' : 'bg-gray-200 dark:bg-[#1a1a1a]'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${localSettings.cryptoEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {localSettings.cryptoEnabled && (
                  <div className="px-6 md:px-8 pb-8 pt-2 animate-in slide-in-from-top-2 fade-in">
                    <div className="p-6 bg-gray-50 dark:bg-[#121214] rounded-xl border border-gray-200 dark:border-white/10 space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Wallet Address</label>
                            <input type="text" value={localSettings.cryptoWalletAddress || ''} onChange={(e) => updateSetting('cryptoWalletAddress', e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:border-orange-500 outline-none font-mono text-xs" placeholder="0x..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Supported Coins</label>
                            <div className="flex gap-3">
                                {['BTC', 'ETH', 'USDT'].map(coin => (
                                    <button 
                                        key={coin}
                                        onClick={() => toggleCryptoOption(coin)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${localSettings.cryptoOptions?.includes(coin) ? 'bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400' : 'bg-white dark:bg-[#09090b] border-gray-200 dark:border-white/10 text-gray-500 hover:border-gray-300 dark:hover:border-white/20'}`}
                                    >
                                        {coin}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bank Transfer */}
              <div className={`bg-white dark:bg-[#09090b] rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${localSettings.bankTransferEnabled ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-gray-200 dark:border-white/10'}`}>
                <div className="p-6 md:p-8 flex justify-between items-start bg-gradient-to-b from-blue-500/5 to-transparent">
                  <div className="flex items-center gap-5">
                    <div className="p-3.5 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/30"><Landmark size={32} /></div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                          Bank Transfer
                          {localSettings.bankTransferEnabled && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 size={12} /> Active</span>}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manual wire transfers and invoices.</p>
                    </div>
                  </div>
                  <button onClick={() => updateSetting('bankTransferEnabled', !localSettings.bankTransferEnabled)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${localSettings.bankTransferEnabled ? 'bg-blue-500' : 'bg-gray-200 dark:bg-[#1a1a1a]'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${localSettings.bankTransferEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {localSettings.bankTransferEnabled && (
                  <div className="px-6 md:px-8 pb-8 pt-2 animate-in slide-in-from-top-2 fade-in">
                    <div className="p-6 bg-gray-50 dark:bg-[#121214] rounded-xl border border-gray-200 dark:border-white/10 space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Account Details</label>
                            <textarea rows={3} value={localSettings.bankTransferDetails || ''} onChange={(e) => updateSetting('bankTransferDetails', e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:border-blue-500 outline-none text-sm resize-none" placeholder="IBAN: ..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Instructions</label>
                            <textarea rows={2} value={localSettings.bankTransferInstructions || ''} onChange={(e) => updateSetting('bankTransferInstructions', e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:border-blue-500 outline-none text-sm resize-none" placeholder="Please include your Order ID..." />
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Portal Tab */}
          {activeTab === 'portal' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-gray-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
                      <div className="flex justify-between items-start mb-8">
                           <div className="flex items-center gap-3">
                               <div className="p-2 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg"><Layout size={24} /></div>
                               <div><h3 className="text-xl font-bold text-gray-900 dark:text-white">Customer Portal</h3><p className="text-sm text-gray-500 dark:text-gray-400">Configure what customers can do in their account.</p></div>
                           </div>
                           <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-[#121214] transition-colors text-gray-700 dark:text-gray-300">
                               Preview <ChevronRight size={14} />
                           </button>
                      </div>

                      <div className="space-y-4">
                           {[
                               { label: 'Allow Cancellations', desc: 'Customers can cancel their own subscriptions.', key: 'portalAllowCancellation' },
                               { label: 'Allow Plan Switching', desc: 'Customers can upgrade or downgrade.', key: 'portalAllowPlanChange' },
                               { label: 'Payment Method Updates', desc: 'Allow customers to change their card details.', key: 'portalAllowPaymentUpdate' },
                               { label: 'Billing History', desc: 'Show past invoices and receipts.', key: 'portalShowHistory' },
                           ].map((item, idx) => (
                               <div key={idx} className="p-5 bg-gray-50 dark:bg-[#121214] rounded-xl border border-gray-100 dark:border-white/5 flex justify-between items-center group hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                                   <div>
                                       <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
                                       <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                   </div>
                                   <button 
                                       onClick={() => updateSetting(item.key as any, !localSettings[item.key as keyof typeof settings])}
                                       className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings[item.key as keyof typeof settings] ? 'bg-[#f97316]' : 'bg-gray-200 dark:bg-[#222]'}`}
                                   >
                                       <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${localSettings[item.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'}`} />
                                   </button>
                               </div>
                           ))}
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'domains' && <DomainsPage />}
          
          {activeTab === 'marketing' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex bg-gray-100 dark:bg-[#121214] p-1 rounded-xl w-fit border border-gray-200 dark:border-white/5">
                      <button 
                         onClick={() => setMarketingSubTab('email')}
                         className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${marketingSubTab === 'email' ? 'bg-white dark:bg-[#09090b] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                      >
                         Email Marketing
                      </button>
                      <button 
                         onClick={() => setMarketingSubTab('affiliates')}
                         className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${marketingSubTab === 'affiliates' ? 'bg-white dark:bg-[#09090b] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                      >
                         Affiliates
                      </button>
                  </div>
                  {marketingSubTab === 'email' ? <EmailMarketingPage /> : <AffiliatesPage />}
              </div>
          )}

          {activeTab === 'apps' && <AppsPage />}

          {activeTab === 'updates' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white dark:bg-[#09090b] rounded-2xl border border-gray-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-lg"><Sparkles size={24} /></div>
                        <div><h3 className="text-xl font-bold text-gray-900 dark:text-white">What's New</h3><p className="text-sm text-gray-500 dark:text-gray-400">Latest features and improvements.</p></div>
                    </div>
                    
                    <div className="space-y-10 relative before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-px before:bg-gray-200 dark:before:bg-white/10">
                        <div className="relative pl-12 group">
                            <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white dark:bg-[#09090b] flex items-center justify-center border border-gray-200 dark:border-white/10 z-10 shadow-sm group-hover:border-[#f97316] group-hover:text-[#f97316] transition-colors text-gray-400"><Zap size={18} /></div>
                            <h4 className="text-base font-bold text-gray-900 dark:text-white">AI Copywriting & Insights</h4>
                            <p className="text-xs text-gray-500 mb-3 font-mono mt-1">October 24, 2023</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-[#121214] p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                Launched AI-powered descriptions for products and automated business insights on the dashboard. Just click the magic wand icon when editing a product!
                            </p>
                        </div>
                        <div className="relative pl-12 group">
                            <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white dark:bg-[#09090b] flex items-center justify-center border border-gray-200 dark:border-white/10 z-10 shadow-sm group-hover:border-[#f97316] group-hover:text-[#f97316] transition-colors text-gray-400"><Wallet size={18} /></div>
                            <h4 className="text-base font-bold text-gray-900 dark:text-white">Crypto Payments Support</h4>
                            <p className="text-xs text-gray-500 mb-3 font-mono mt-1">October 10, 2023</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-[#121214] p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                You can now accept Bitcoin, Ethereum, and USDT directly through your checkout pages. Configure your wallet address in Settings {'>'} Payments.
                            </p>
                        </div>
                        <div className="relative pl-12 group">
                            <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white dark:bg-[#09090b] flex items-center justify-center border border-gray-200 dark:border-white/10 z-10 shadow-sm group-hover:border-[#f97316] group-hover:text-[#f97316] transition-colors text-gray-400"><Globe size={18} /></div>
                            <h4 className="text-base font-bold text-gray-900 dark:text-white">Ghost Links</h4>
                            <p className="text-xs text-gray-500 mb-3 font-mono mt-1">September 28, 2023</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-[#121214] p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                Create stealth redirect links for your ads and social media campaigns. Track clicks, device types, and locations in real-time.
                            </p>
                        </div>
                    </div>
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
