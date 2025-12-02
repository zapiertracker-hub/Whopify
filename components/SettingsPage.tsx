import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../AppContext';
import { 
  CreditCard, Building, Save, Check, Eye, EyeOff, Percent, Tags, Megaphone,
  Palette, Grid, Sun, Moon, Globe, Mail, Clock, Languages, ChevronRight,
  ShieldCheck, Store, Loader2, RefreshCw, CheckCircle2, XCircle, AlertCircle,
  Shield, Key, Smartphone, Monitor, LogOut, User, Wallet, FileText, 
  Sparkles, UserPlus, Download, Zap, Layout, History, Trash2, Banknote, Landmark, Bitcoin
} from 'lucide-react';
import DiscountsPage from './DiscountsPage';
import EmailMarketingPage from './EmailMarketingPage';
import AffiliatesPage from './AffiliatesPage';
import AppsPage from './AppsPage';
import DomainsPage from './DomainsPage';

type Tab = 'general' | 'account' | 'security' | 'billing' | 'payments' | 'portal' | 'domains' | 'marketing' | 'discounts' | 'appearance' | 'apps' | 'updates';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

const SettingsPage = () => {
  const { settings, saveSettings, language, setLanguage, theme, setTheme } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [marketingSubTab, setMarketingSubTab] = useState<'email' | 'affiliates'>('email');
  const [localSettings, setLocalSettings] = useState(settings);
  const [showStripeKey, setShowStripeKey] = useState(false);
  const [isVerifyingStripe, setIsVerifyingStripe] = useState(false);
  const [stripeVerificationResult, setStripeVerificationResult] = useState<'success' | 'error' | null>(null);
  const [stripeConnectionDetails, setStripeConnectionDetails] = useState<{ mode: string, currency: string } | null>(null);
  const [stripeErrorMessage, setStripeErrorMessage] = useState<string | null>(null);

  const tabs = [
    { id: 'general', label: 'General', icon: Building, desc: 'Store details & location' },
    { id: 'account', label: 'Account', icon: User, desc: 'Profile & team' },
    { id: 'security', label: 'Security', icon: ShieldCheck, desc: 'Password & 2FA' },
    { id: 'billing', label: 'Plan & Billing', icon: CreditCard, desc: 'Subscription & invoices' },
    { id: 'payments', label: 'Payments', icon: Wallet, desc: 'Gateways & currency' },
    { id: 'portal', label: 'Customer Portal', icon: Store, desc: 'Self-serve settings' },
    { id: 'domains', label: 'Domains', icon: Globe, desc: 'Custom domain setup' },
    { id: 'marketing', label: 'Marketing', icon: Megaphone, desc: 'Email & affiliates' },
    { id: 'discounts', label: 'Discounts', icon: Tags, desc: 'Coupons & sales' },
    { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Theme & branding' },
    { id: 'apps', label: 'Integrations', icon: Grid, desc: 'Connected tools' },
    { id: 'updates', label: 'What\'s New', icon: Sparkles, desc: 'Changelog & features' },
  ];

  // Sync with global settings on load
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaveStatus('saving');
    
    // Save via context which handles offline/online logic
    saveSettings(localSettings);
    
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'stripeSecretKey' || key === 'stripePublishableKey') {
        setStripeVerificationResult(null);
        setStripeConnectionDetails(null);
        setStripeErrorMessage(null);
    }
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

  const verifyStripeConnection = async () => {
    const key = localSettings.stripeSecretKey?.trim();
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
    
    try {
        const res = await fetch(`${API_URL}/api/verify-connection`, {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
                 'x-stripe-secret-key': key
             }
        });
        const data = await res.json();

        if (res.ok && data.status === 'connected') {
            setStripeVerificationResult('success');
            setStripeConnectionDetails({ mode: data.mode, currency: data.currency });
        } else {
            throw new Error(data.message || "Connection failed.");
        }
    } catch (e: any) {
        setStripeVerificationResult('error');
        setStripeErrorMessage("Could not connect to server (Beta Mode).");
    } finally {
        setIsVerifyingStripe(false);
    }
  };

  const renderSaveButton = () => (
    <button 
      onClick={handleSave}
      disabled={saveStatus === 'saving'}
      className={`
        flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95
        ${saveStatus === 'saved' 
          ? 'bg-green-500 text-white shadow-green-500/25' 
          : 'bg-[#f97316] hover:bg-[#ea580c] text-white dark:text-black shadow-[#f97316]/20'
        }
      `}
    >
      {saveStatus === 'saved' ? (
        <><Check size={18} /> Saved</>
      ) : (
        <><Save size={18} className={saveStatus === 'saving' ? 'animate-spin' : ''} /> {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}</>
      )}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
      <div className="sticky top-0 z-30 bg-gray-50/80 dark:bg-[#020202]/80 backdrop-blur-xl -mx-4 px-4 py-4 md:mx-0 md:px-0 mb-8 border-b border-gray-200/50 dark:border-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your store configuration and preferences.</p>
        </div>
        {(activeTab === 'general' || activeTab === 'payments' || activeTab === 'appearance' || activeTab === 'account' || activeTab === 'portal' || activeTab === 'security') && (
           <div className="hidden md:block">{renderSaveButton()}</div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <nav className="w-full lg:w-72 shrink-0 lg:sticky lg:top-32 h-fit z-20">
          <div className="flex lg:hidden overflow-x-auto pb-4 gap-2 scrollbar-none -mx-4 px-4">
             {tabs.map((tab) => (
                <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as Tab)}
                   className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all active:scale-95 border ${activeTab === tab.id ? 'bg-[#f97316] border-[#f97316] text-white dark:text-black shadow-lg shadow-[#f97316]/20' : 'bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                   {React.createElement(tab.icon, { size: 16 })} {tab.label}
                </button>
             ))}
          </div>

          <div className="hidden lg:flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`group w-full flex items-center p-3 rounded-xl text-left transition-all duration-200 active:scale-95 border ${activeTab === tab.id ? 'bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400'}`}
              >
                <div className={`p-2.5 rounded-lg mr-4 transition-colors ${activeTab === tab.id ? 'bg-orange-50 dark:bg-orange-900/20 text-[#f97316]' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`}>
                  {React.createElement(tab.icon, { size: 20 })}
                </div>
                <div>
                  <div className={`font-bold text-sm ${activeTab === tab.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'}`}>{tab.label}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">{tab.desc}</div>
                </div>
                {activeTab === tab.id && <ChevronRight size={16} className="ml-auto text-[#f97316]" />}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex-1 min-w-0 space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Store Details */}
              <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Store Name</label>
                    <div className="relative group">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" value={localSettings.storeName} onChange={(e) => updateSetting('storeName', e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none transition-all font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Support Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="email" value={localSettings.supportEmail} onChange={(e) => updateSetting('supportEmail', e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none transition-all font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Timezone</label>
                    <div className="relative group">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select value={localSettings.timezone} onChange={(e) => updateSetting('timezone', e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none transition-all font-medium appearance-none cursor-pointer">
                            <option>(GMT+01:00) Casablanca</option>
                            <option>(GMT+00:00) London</option>
                            <option>(GMT-05:00) New York</option>
                        </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Dashboard Language</label>
                    <div className="relative group">
                        <Languages className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none transition-all font-medium appearance-none cursor-pointer">
                            <option value="en">English</option>
                            <option value="fr">Français</option>
                            <option value="ar">العربية</option>
                        </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Profile Details */}
              <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300"><User size={24} /></div>
                    <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Profile Settings</h3><p className="text-sm text-gray-500 dark:text-gray-400">Manage your personal information.</p></div>
                </div>
                
                <div className="flex items-start gap-6 mb-8">
                     <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 dark:from-gray-700 dark:to-gray-900 flex items-center justify-center text-white text-3xl font-serif italic border-4 border-white dark:border-[#111111] shadow-lg">
                        Y
                     </div>
                     <div className="space-y-3 flex-1 max-w-md">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
                            <input type="text" defaultValue="Youssef B." className="w-full px-4 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white font-medium focus:border-[#f97316] outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email Address</label>
                            <input type="email" defaultValue="admin@whopify.io" className="w-full px-4 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white font-medium focus:border-[#f97316] outline-none" />
                        </div>
                     </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm">
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg"><UserPlus size={24} /></div>
                        <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Team Members</h3><p className="text-sm text-gray-500 dark:text-gray-400">Collaborate with your team.</p></div>
                    </div>
                    <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition-all">Invite Member</button>
                 </div>

                 <div className="space-y-4">
                     <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">Y</div>
                             <div>
                                 <p className="text-sm font-bold text-gray-900 dark:text-white">Youssef B. (You)</p>
                                 <p className="text-xs text-gray-500">Owner • admin@whopify.io</p>
                             </div>
                         </div>
                         <span className="text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">Active</span>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800 opacity-60">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-500 flex items-center justify-center font-bold">S</div>
                             <div>
                                 <p className="text-sm font-bold text-gray-900 dark:text-white">Support Team</p>
                                 <p className="text-xs text-gray-500">Editor • support@whopify.io</p>
                             </div>
                         </div>
                         <button className="text-xs font-bold text-red-500 hover:text-red-600">Remove</button>
                     </div>
                 </div>
              </div>

               {/* Danger Zone */}
               <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 p-6 md:p-8">
                  <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                  <p className="text-sm text-red-500/80 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                  <button className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">Delete Account</button>
               </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Security Section Moved Here */}
              <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"><Shield size={24} /></div>
                      <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Security & Access</h3><p className="text-sm text-gray-500 dark:text-gray-400">Manage account security and sessions.</p></div>
                  </div>

                  <div className="space-y-6">
                      {/* 2FA */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-4">
                              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-gray-500"><Smartphone size={20} /></div>
                              <div>
                                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Two-Factor Authentication</h4>
                                  <p className="text-xs text-gray-500">Add an extra layer of security to your account.</p>
                              </div>
                          </div>
                          <button onClick={() => updateSetting('twoFactorEnabled', !localSettings.twoFactorEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.twoFactorEnabled ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${localSettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>

                      {/* Password */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-4">
                              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-gray-500"><Key size={20} /></div>
                              <div>
                                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Password</h4>
                                  <p className="text-xs text-gray-500">Last changed 3 months ago.</p>
                              </div>
                          </div>
                          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Change</button>
                      </div>

                      {/* Active Sessions */}
                      <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Active Sessions</h4>
                          <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                      <Monitor size={16} className="text-green-500" />
                                      <div>
                                          <p className="text-sm font-medium text-gray-900 dark:text-white">Macbook Pro (This device)</p>
                                          <p className="text-xs text-gray-500">Casablanca, MA • Just now</p>
                                      </div>
                                  </div>
                                  <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">Active</span>
                              </div>
                              <div className="flex items-center justify-between opacity-60">
                                  <div className="flex items-center gap-3">
                                      <Smartphone size={16} className="text-gray-400" />
                                      <div>
                                          <p className="text-sm font-medium text-gray-900 dark:text-white">iPhone 13 Pro</p>
                                          <p className="text-xs text-gray-500">Paris, FR • 2 days ago</p>
                                      </div>
                                  </div>
                                  <button className="text-xs font-bold text-red-500 hover:text-red-600">Revoke</button>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Plan Card */}
                <div className="bg-gradient-to-br from-[#111111] to-[#222] text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-gray-800">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Zap size={120} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-gradient-to-r from-[#f97316] to-pink-600 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">Growth Plan</span>
                                <span className="text-gray-400 text-xs font-medium">Billed monthly</span>
                            </div>
                            <h2 className="text-4xl font-bold mb-2">$29<span className="text-lg text-gray-400 font-normal">/mo</span></h2>
                            <p className="text-gray-400 text-sm max-w-sm">You have access to all features including Ghost Links, advanced analytics, and zero transaction fees.</p>
                        </div>
                        <div className="flex flex-col gap-3 w-full md:w-auto">
                            <button className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg active:scale-95">Manage Subscription</button>
                            <button className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors active:scale-95">Upgrade Plan</button>
                        </div>
                    </div>
                    
                    {/* Usage Bars */}
                    <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2 text-gray-400"><span>Revenue</span><span>$12.5k / $50k</span></div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[25%]"></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2 text-gray-400"><span>Team Members</span><span>2 / 5</span></div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[40%]"></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2 text-gray-400"><span>Checkouts</span><span>12 / Unlimited</span></div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[5%]"></div></div>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Payment Method</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-800">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-8 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                 <div className="flex -space-x-1"><div className="w-3 h-3 rounded-full bg-red-500/80"></div><div className="w-3 h-3 rounded-full bg-yellow-500/80"></div></div>
                             </div>
                             <div>
                                 <p className="text-sm font-bold text-gray-900 dark:text-white">Mastercard ending in 8842</p>
                                 <p className="text-xs text-gray-500">Expires 12/28</p>
                             </div>
                         </div>
                         <button className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">Edit</button>
                    </div>
                </div>

                {/* Invoices */}
                <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Invoice History</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500">
                                    <th className="py-3 font-medium">Date</th>
                                    <th className="py-3 font-medium">Amount</th>
                                    <th className="py-3 font-medium">Status</th>
                                    <th className="py-3 font-medium text-right">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                <tr>
                                    <td className="py-3 text-gray-900 dark:text-white">Oct 01, 2023</td>
                                    <td className="py-3 text-gray-900 dark:text-white font-mono">$29.00</td>
                                    <td className="py-3"><span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded font-bold">Paid</span></td>
                                    <td className="py-3 text-right"><button className="flex items-center gap-1 justify-end w-full text-gray-500 hover:text-gray-900 dark:hover:text-white"><Download size={14} /> PDF</button></td>
                                </tr>
                                <tr>
                                    <td className="py-3 text-gray-900 dark:text-white">Sep 01, 2023</td>
                                    <td className="py-3 text-gray-900 dark:text-white font-mono">$29.00</td>
                                    <td className="py-3"><span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded font-bold">Paid</span></td>
                                    <td className="py-3 text-right"><button className="flex items-center gap-1 justify-end w-full text-gray-500 hover:text-gray-900 dark:hover:text-white"><Download size={14} /> PDF</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
             </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg"><Globe size={24} /></div>
                    <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Store Currency</h3><p className="text-sm text-gray-500 dark:text-gray-400">Primary currency for pricing and analytics.</p></div>
                 </div>
                 <div className="relative group max-w-md">
                    <select value={localSettings.currency} onChange={(e) => updateSetting('currency', e.target.value)} className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-medium cursor-pointer appearance-none">
                        <option value="USD">United States Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                        <option value="MAD">Moroccan Dirham (MAD)</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={18} />
                 </div>
              </div>

              {/* Stripe */}
              <div className={`bg-white dark:bg-[#111111] rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${localSettings.stripeEnabled ? 'border-[#635BFF] ring-1 ring-[#635BFF]/20' : 'border-gray-200 dark:border-gray-800'}`}>
                <div className="p-6 md:p-8 flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#635BFF] text-white rounded-xl shadow-lg shadow-[#635BFF]/30"><CreditCard size={28} /></div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">Stripe Payments {localSettings.stripeEnabled && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 text-[10px] font-bold uppercase tracking-wider"><ShieldCheck size={10} /> Active</span>}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Accept credit cards securely.</p>
                    </div>
                  </div>
                  <button onClick={() => updateSetting('stripeEnabled', !localSettings.stripeEnabled)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${localSettings.stripeEnabled ? 'bg-[#635BFF]' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition transition-transform ${localSettings.stripeEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {localSettings.stripeEnabled && (
                  <div className="px-6 md:px-8 pb-8 pt-0 animate-in slide-in-from-top-4 fade-in">
                    <div className="p-6 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-800 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Publishable Key</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-gray-200 dark:bg-gray-800 rounded text-xs font-mono font-bold text-gray-500 dark:text-gray-400">PK</div>
                                <input type="text" value={localSettings.stripePublishableKey} onChange={(e) => updateSetting('stripePublishableKey', e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#635BFF]/20 focus:border-[#635BFF] outline-none transition-all font-mono text-sm" placeholder="pk_test_..." />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Secret Key</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-gray-200 dark:bg-gray-800 rounded text-xs font-mono font-bold text-gray-500 dark:text-gray-400">SK</div>
                                <input type={showStripeKey ? "text" : "password"} value={localSettings.stripeSecretKey} onChange={(e) => updateSetting('stripeSecretKey', e.target.value)} className="w-full pl-12 pr-12 py-3 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#635BFF]/20 focus:border-[#635BFF] outline-none transition-all font-mono text-sm" placeholder="sk_test_..." />
                                <button onClick={() => setShowStripeKey(!showStripeKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">{showStripeKey ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-end pt-2">
                                <button onClick={verifyStripeConnection} disabled={isVerifyingStripe || !localSettings.stripeSecretKey} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-all active:scale-95">
                                    {isVerifyingStripe ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />} {isVerifyingStripe ? 'Verifying...' : 'Test Connection'}
                                </button>
                            </div>
                            {stripeVerificationResult === 'success' && <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-sm text-green-700 dark:text-green-400"><CheckCircle2 size={16} /> <span className="font-bold">Connected ({stripeConnectionDetails?.mode})</span></div>}
                            {stripeVerificationResult === 'error' && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2 text-sm text-red-700 dark:text-red-400"><XCircle size={16} className="shrink-0 mt-0.5" /> <span>{stripeErrorMessage}</span></div>}
                        </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Bank Transfer */}
              <div className={`bg-white dark:bg-[#111111] rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${localSettings.bankTransferEnabled ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-gray-200 dark:border-gray-800'}`}>
                <div className="p-6 md:p-8 flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/30"><Landmark size={28} /></div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">Bank Transfer {localSettings.bankTransferEnabled && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 text-[10px] font-bold uppercase tracking-wider"><ShieldCheck size={10} /> Active</span>}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Accept payments via wire transfer.</p>
                    </div>
                  </div>
                  <button onClick={() => updateSetting('bankTransferEnabled', !localSettings.bankTransferEnabled)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${localSettings.bankTransferEnabled ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition transition-transform ${localSettings.bankTransferEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {localSettings.bankTransferEnabled && (
                  <div className="px-6 md:px-8 pb-8 pt-0 animate-in slide-in-from-top-4 fade-in">
                    <div className="p-6 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-800 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Account Details (IBAN, SWIFT, etc.)</label>
                            <textarea rows={3} value={localSettings.bankTransferDetails || ''} onChange={(e) => updateSetting('bankTransferDetails', e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm resize-none" placeholder="Bank Name: Example Bank&#10;Account Number: 123456789&#10;SWIFT: EXAMPLE" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Instructions</label>
                            <textarea rows={3} value={localSettings.bankTransferInstructions || ''} onChange={(e) => updateSetting('bankTransferInstructions', e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm resize-none" placeholder="Please send the proof of payment to email@example.com..." />
                        </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cryptocurrency */}
              <div className={`bg-white dark:bg-[#111111] rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${localSettings.cryptoEnabled ? 'border-orange-500 ring-1 ring-orange-500/20' : 'border-gray-200 dark:border-gray-800'}`}>
                <div className="p-6 md:p-8 flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/30"><Bitcoin size={28} /></div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">Crypto Payment {localSettings.cryptoEnabled && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 text-[10px] font-bold uppercase tracking-wider"><ShieldCheck size={10} /> Active</span>}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Accept Bitcoin, Ethereum, and USDT.</p>
                    </div>
                  </div>
                  <button onClick={() => updateSetting('cryptoEnabled', !localSettings.cryptoEnabled)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${localSettings.cryptoEnabled ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition transition-transform ${localSettings.cryptoEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {localSettings.cryptoEnabled && (
                  <div className="px-6 md:px-8 pb-8 pt-0 animate-in slide-in-from-top-4 fade-in">
                    <div className="p-6 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-800 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Wallet Address (or Instructions)</label>
                            <input type="text" value={localSettings.cryptoWalletAddress || ''} onChange={(e) => updateSetting('cryptoWalletAddress', e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-mono" placeholder="0x..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Supported Coins</label>
                            <div className="flex gap-3">
                                {['BTC', 'ETH', 'USDT'].map(coin => (
                                    <button 
                                        key={coin}
                                        onClick={() => toggleCryptoOption(coin)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${localSettings.cryptoOptions?.includes(coin) ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400' : 'bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
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
              
              {/* Manual Payment */}
              <div className={`bg-white dark:bg-[#111111] rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${localSettings.manualPaymentEnabled ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-gray-200 dark:border-gray-800'}`}>
                <div className="p-6 md:p-8 flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/30"><Banknote size={28} /></div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">Manual Payment {localSettings.manualPaymentEnabled && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 text-[10px] font-bold uppercase tracking-wider"><ShieldCheck size={10} /> Active</span>}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Accept cash on delivery or other manual methods.</p>
                    </div>
                  </div>
                  <button onClick={() => updateSetting('manualPaymentEnabled', !localSettings.manualPaymentEnabled)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${localSettings.manualPaymentEnabled ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition transition-transform ${localSettings.manualPaymentEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {localSettings.manualPaymentEnabled && (
                  <div className="px-6 md:px-8 pb-8 pt-0 animate-in slide-in-from-top-4 fade-in">
                    <div className="p-6 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-800 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Method Label</label>
                            <input type="text" value={localSettings.manualPaymentLabel || 'Manual Payment'} onChange={(e) => updateSetting('manualPaymentLabel', e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm" placeholder="e.g. Cash on Delivery" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Instructions</label>
                            <textarea rows={4} value={localSettings.manualPaymentInstructions || ''} onChange={(e) => updateSetting('manualPaymentInstructions', e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm resize-none" placeholder="e.g. Please send the payment to Bank Account X..." />
                            <p className="text-xs text-gray-500">These instructions will be shown to the customer at checkout.</p>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'portal' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                           <div className="flex items-center gap-3">
                               <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"><Layout size={24} /></div>
                               <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Customer Portal</h3><p className="text-sm text-gray-500 dark:text-gray-400">Manage what your customers can see and do.</p></div>
                           </div>
                           <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                               Preview Portal <ChevronRight size={14} />
                           </button>
                      </div>

                      <div className="space-y-4">
                           <div className="p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                               <div>
                                   <p className="text-sm font-bold text-gray-900 dark:text-white">Allow Cancellations</p>
                                   <p className="text-xs text-gray-500">Customers can cancel their own subscriptions.</p>
                               </div>
                               <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#f97316]">
                                   <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                               </button>
                           </div>
                           <div className="p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                               <div>
                                   <p className="text-sm font-bold text-gray-900 dark:text-white">Allow Plan Switching</p>
                                   <p className="text-xs text-gray-500">Customers can upgrade or downgrade.</p>
                               </div>
                               <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-700">
                                   <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                               </button>
                           </div>
                           <div className="p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                               <div>
                                   <p className="text-sm font-bold text-gray-900 dark:text-white">Show Invoice History</p>
                                   <p className="text-xs text-gray-500">Customers can download past invoices.</p>
                               </div>
                               <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#f97316]">
                                   <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                               </button>
                           </div>
                      </div>
                      
                      <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                           <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">Portal Branding</label>
                           <div className="flex gap-4">
                               <div className="w-16 h-16 bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs text-gray-400">Logo</div>
                               <div className="space-y-2">
                                   <button className="text-sm font-bold text-[#f97316] hover:underline">Upload Custom Logo</button>
                                   <p className="text-xs text-gray-500">Recommended 200x200px PNG.</p>
                               </div>
                           </div>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'domains' && <DomainsPage />}

          {activeTab === 'marketing' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex bg-white dark:bg-[#111111] p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 w-fit shadow-sm">
                   <button onClick={() => setMarketingSubTab('email')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${marketingSubTab === 'email' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Email Marketing</button>
                   <button onClick={() => setMarketingSubTab('affiliates')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${marketingSubTab === 'affiliates' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Affiliates</button>
               </div>
               {marketingSubTab === 'email' && <EmailMarketingPage />}
               {marketingSubTab === 'affiliates' && <AffiliatesPage />}
            </div>
          )}
          
          {activeTab === 'discounts' && <DiscountsPage />}
          
          {activeTab === 'appearance' && (
             <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-8">
                   <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg"><Palette size={24} /></div>
                   <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Interface Theme</h3><p className="text-sm text-gray-500 dark:text-gray-400">Choose dashboard appearance.</p></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <button onClick={() => setTheme('light')} className={`group relative p-6 rounded-2xl border-2 transition-all active:scale-95 text-left flex flex-col gap-4 overflow-hidden ${theme === 'light' ? 'border-[#f97316] bg-gray-50' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}>
                      <div className="flex items-center justify-between w-full z-10"><div className="p-3 bg-white rounded-full shadow-sm border border-gray-100"><Sun size={24} className="text-amber-500" /></div>{theme === 'light' && <div className="p-1 bg-[#f97316] rounded-full text-white"><Check size={14} /></div>}</div>
                      <div className="z-10"><h4 className="font-bold text-gray-900">Light Mode</h4></div>
                   </button>
                   <button onClick={() => setTheme('dark')} className={`group relative p-6 rounded-2xl border-2 transition-all active:scale-95 text-left flex flex-col gap-4 overflow-hidden ${theme === 'dark' ? 'border-[#f97316] bg-[#0a0a0a]' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}>
                      <div className="flex items-center justify-between w-full z-10"><div className="p-3 bg-[#1e1e1e] rounded-full shadow-sm border border-gray-800"><Moon size={24} className="text-purple-400" /></div>{theme === 'dark' && <div className="p-1 bg-[#f97316] rounded-full text-white"><Check size={14} /></div>}</div>
                      <div className="z-10"><h4 className="font-bold text-white">Dark Mode</h4></div>
                   </button>
                </div>
             </div>
          )}
          {activeTab === 'apps' && <AppsPage />}

          {activeTab === 'updates' && (
              <div className="max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg"><Sparkles size={24} /></div>
                      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">What's New</h1><p className="text-gray-500 dark:text-gray-400">Latest updates from the team.</p></div>
                  </div>

                  <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800">
                      
                      <div className="relative pl-12">
                          <div className="absolute left-2 top-1.5 w-4 h-4 bg-[#f97316] rounded-full border-4 border-white dark:border-[#020202]"></div>
                          <div className="mb-2">
                              <span className="text-xs font-bold text-[#f97316] uppercase tracking-wide mb-1 block">October 2023</span>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ghost Link Tool</h3>
                          </div>
                          <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                  We launched a new stealth redirect tool called Ghost Link. It allows you to create cloaked links for your ads that redirect to your checkout pages while stripping referrer data or adding custom UTMs.
                              </p>
                              <div className="mt-4 flex gap-2">
                                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">New Tool</span>
                                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">Analytics</span>
                              </div>
                          </div>
                      </div>

                      <div className="relative pl-12">
                          <div className="absolute left-2 top-1.5 w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded-full border-4 border-white dark:border-[#020202]"></div>
                          <div className="mb-2">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">September 2023</span>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dark Mode & Themes</h3>
                          </div>
                          <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                  The dashboard now fully supports Dark Mode! We've also added the ability for you to customize the appearance of your checkout pages with Light/Dark presets.
                              </p>
                          </div>
                      </div>

                      <div className="relative pl-12">
                          <div className="absolute left-2 top-1.5 w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded-full border-4 border-white dark:border-[#020202]"></div>
                          <div className="mb-2">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">August 2023</span>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Stripe Integration</h3>
                          </div>
                          <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                  Native Stripe integration is here. Connect your Stripe account directly in settings to start accepting credit cards with 0% extra transaction fees.
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