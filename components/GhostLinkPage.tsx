


import React, { useState, useContext, useEffect } from 'react';
import { 
  Ghost, Link as LinkIcon, Copy, ArrowRight, Check, 
  Settings, Facebook, Globe, Search, Shuffle, ExternalLink,
  Activity, MousePointer2, Smartphone, ArrowUpRight, ArrowDownRight, MapPin,
  Calendar, Layers, Plus, Trash2, Split, Bell, AlertCircle, Play, Tag, MessageCircle, Mail,
  List, Power, Loader2
} from 'lucide-react';
import { AppContext } from '../AppContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { GhostLink } from '../types';

// --- Constants & Helpers ---

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'MA', name: 'Morocco' },
  { code: 'AE', name: 'UAE' },
  { code: 'SA', name: 'Saudi Arabia' },
];

const DEVICES = [
  { id: 'mobile', label: 'Mobile (iOS/Android)' },
  { id: 'desktop', label: 'Desktop (Win/Mac)' },
  { id: 'tablet', label: 'Tablet' },
];

const Card = ({ children, className = '', noPadding = false }: { children?: React.ReactNode, className?: string, noPadding?: boolean }) => (
  <div className={`bg-white dark:bg-[#09090b] rounded-xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none overflow-hidden flex flex-col ${noPadding ? '' : 'p-5'} ${className}`}>
    {children}
  </div>
);

const MetricItem = ({ label, value, trend, icon: Icon }: any) => (
  <div className="flex flex-col justify-between h-full relative group">
    <div className="flex justify-between items-start mb-3">
       <div className={`p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/5 group-hover:bg-gray-100 dark:group-hover:bg-white/10 transition-colors`}>
          <Icon size={18} />
       </div>
       {trend !== undefined && (
         <span className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${trend > 0 ? 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'text-red-600 bg-red-50 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
            {trend > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {Math.abs(trend)}%
         </span>
       )}
    </div>
    <div>
       <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white font-mono tracking-tighter tabular-nums">
          {value}
       </div>
       <div className="text-xs font-bold text-gray-500 dark:text-gray-500 mt-1 uppercase tracking-wide">{label}</div>
    </div>
  </div>
);

const GhostLinkPage = () => {
  const { theme } = useContext(AppContext);
  
  // --- Component State ---
  const [activeTab, setActiveTab] = useState<'general' | 'targeting' | 'abtest' | 'constraints'>('general');
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [notificationToast, setNotificationToast] = useState<{msg: string, type: 'email' | 'whatsapp'} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ghostLinks, setGhostLinks] = useState<GhostLink[]>([]);

  // --- Form State ---
  const [formData, setFormData] = useState({
      targetUrl: '',
      slug: '',
      redirectType: '307',
      category: 'General',
      tags: '',
      scheduleStart: '',
      scheduleEnd: '',
      clickLimit: '',
      utmEnabled: false,
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      notifyEmail: false,
      notifyWhatsapp: false
  });

  const [geoRules, setGeoRules] = useState<{id: string, country: string, url: string}[]>([]);
  const [deviceRules, setDeviceRules] = useState<{id: string, device: string, url: string}[]>([]);
  const [splitVariants, setSplitVariants] = useState<{id: string, url: string, percent: number}[]>([]);

  // Simulation State
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simContext, setSimContext] = useState({ country: 'US', device: 'mobile' });
  const [simResult, setSimResult] = useState<{url: string, reason: string, logs: string[], method?: string, type?: string} | null>(null);
  const [activeLinkForSim, setActiveLinkForSim] = useState<GhostLink | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // --- Functions ---

  const fetchLinks = async () => {
      try {
          const res = await fetch(`${API_URL}/api/ghost-links`);
          if (res.ok) {
              const data = await res.json();
              setGhostLinks(data);
          }
      } catch (e) {
          console.error("Failed to fetch ghost links");
      }
  };

  useEffect(() => {
      fetchLinks();
      const interval = setInterval(fetchLinks, 10000); // Polling for click updates
      return () => clearInterval(interval);
  }, []);

  const showNotification = (msg: string, type: 'email' | 'whatsapp') => {
      setNotificationToast({ msg, type });
      setTimeout(() => setNotificationToast(null), 4000);
  };

  const validateUrl = (url: string) => {
    if (!url) return false;
    if (url.trim().toLowerCase().startsWith('javascript:')) return false;
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleGenerate = async () => {
      if (!validateUrl(formData.targetUrl)) return alert("Please enter a valid Target URL.");
      if (splitVariants.some(v => !validateUrl(v.url))) return alert("Invalid URL in A/B variants.");
      if (geoRules.some(r => !validateUrl(r.url))) return alert("Invalid URL in Geo rules.");
      if (deviceRules.some(r => !validateUrl(r.url))) return alert("Invalid URL in Device rules.");

      const totalVariantWeight = splitVariants.reduce((sum, v) => sum + v.percent, 0);
      if (totalVariantWeight > 100) return alert("Total split weight cannot exceed 100%.");
      
      const primaryWeight = 100 - totalVariantWeight;
      const destination_urls = [formData.targetUrl, ...splitVariants.map(v => v.url)];
      const split_weights = [primaryWeight, ...splitVariants.map(v => v.percent)];

      const newLink: GhostLink = {
          id: Date.now().toString(),
          slug: formData.slug || Math.random().toString(36).substring(7),
          destination_urls,
          split_weights,
          redirect_type: formData.redirectType as any,
          status: 'active',
          category: formData.category,
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
          click_total: 0,
          click_today: 0,
          click_month: 0,
          schedule_start: formData.scheduleStart || null,
          schedule_end: formData.scheduleEnd || null,
          click_limit: formData.clickLimit ? parseInt(formData.clickLimit) : null,
          geo_redirects: geoRules.reduce((acc, rule) => ({...acc, [rule.country]: rule.url}), {}),
          device_redirects: deviceRules.reduce((acc, rule) => ({...acc, [rule.device]: rule.url}), {}),
          utm_enabled: formData.utmEnabled,
          utm_params: {
              source: formData.utmSource,
              medium: formData.utmMedium,
              campaign: formData.utmCampaign
          },
          notification_email: formData.notifyEmail,
          notification_whatsapp: formData.notifyWhatsapp,
          created_at: new Date().toISOString()
      };

      setIsLoading(true);
      try {
          const res = await fetch(`${API_URL}/api/ghost-links`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newLink)
          });
          
          if (res.ok) {
              setGhostLinks([newLink, ...ghostLinks]);
              if (newLink.notification_email) showNotification(`Link /${newLink.slug} Created`, 'email');
              if (newLink.notification_whatsapp) setTimeout(() => showNotification(`Link /${newLink.slug} Created`, 'whatsapp'), 1500);
              
              // Reset Form
              setFormData({
                  targetUrl: '', slug: '', redirectType: '307', category: 'General', tags: '',
                  scheduleStart: '', scheduleEnd: '', clickLimit: '', utmEnabled: false,
                  utmSource: '', utmMedium: '', utmCampaign: '', notifyEmail: false, notifyWhatsapp: false
              });
              setGeoRules([]);
              setDeviceRules([]);
              setSplitVariants([]);
              setActiveTab('general');
          }
      } catch (e) {
          alert("Failed to save link");
      } finally {
          setIsLoading(false);
      }
  };

  const handleToggleStatus = async (link: GhostLink) => {
      const newStatus = link.status === 'active' ? 'disabled' : 'active';
      const updatedLink = { ...link, status: newStatus };
      
      try {
          const res = await fetch(`${API_URL}/api/ghost-links`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedLink)
          });
          
          if (res.ok) {
              setGhostLinks(prev => prev.map(l => l.id === link.id ? updatedLink : l));
              const msg = `Status changed to ${newStatus.toUpperCase()}`;
              if (link.notification_email) showNotification(msg, 'email');
          }
      } catch (e) {
          console.error("Failed to update status");
      }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Are you sure?")) return;
      try {
          await fetch(`${API_URL}/api/ghost-links/${id}`, { method: 'DELETE' });
          setGhostLinks(prev => prev.filter(l => l.id !== id));
      } catch (e) {
          console.error("Delete failed");
      }
  };

  const handleSimulate = async () => {
      if (!activeLinkForSim) return;
      setIsSimulating(true);
      setSimResult(null);
      
      try {
          const res = await fetch(`${API_URL}/api/ghost-links/simulate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ linkId: activeLinkForSim.id, context: simContext })
          });
          const result = await res.json();
          setSimResult(result);
      } catch (e) {
          setSimResult({ url: 'Error', reason: 'Simulation Failed', logs: ['API Error'], type: 'error' });
      } finally {
          setIsSimulating(false);
      }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  // Rule Builders
  const addGeoRule = () => setGeoRules([...geoRules, {id: Date.now().toString(), country: 'US', url: ''}]);
  const updateGeoRule = (id: string, f: string, v: string) => setGeoRules(geoRules.map(r => r.id === id ? {...r, [f]: v} : r));
  const removeGeoRule = (id: string) => setGeoRules(geoRules.filter(r => r.id !== id));

  const addDeviceRule = () => setDeviceRules([...deviceRules, {id: Date.now().toString(), device: 'mobile', url: ''}]);
  const updateDeviceRule = (id: string, f: string, v: string) => setDeviceRules(deviceRules.map(r => r.id === id ? {...r, [f]: v} : r));
  const removeDeviceRule = (id: string) => setDeviceRules(deviceRules.filter(r => r.id !== id));

  const addVariant = () => setSplitVariants([...splitVariants, {id: Date.now().toString(), url: '', percent: 50}]);
  const updateVariant = (id: string, f: string, v: any) => setSplitVariants(splitVariants.map(r => r.id === id ? {...r, [f]: v} : r));
  const removeVariant = (id: string) => setSplitVariants(splitVariants.filter(r => r.id !== id));

  const totalClicks = ghostLinks.reduce((acc, l) => acc + (l.click_total || 0), 0);
  const clickData = [
    { name: 'Mon', clicks: totalClicks * 0.1 },
    { name: 'Tue', clicks: totalClicks * 0.2 },
    { name: 'Wed', clicks: totalClicks * 0.15 },
    { name: 'Thu', clicks: totalClicks * 0.3 },
    { name: 'Fri', clicks: totalClicks * 0.25 },
    { name: 'Sat', clicks: 0 },
    { name: 'Sun', clicks: 0 },
  ];

  const chartColors = {
      grid: theme === 'dark' ? '#27272a' : '#f3f4f6',
      text: theme === 'dark' ? '#71717a' : '#9ca3af',
      tooltip: theme === 'dark' ? '#18181b' : '#ffffff',
      tooltipBorder: theme === 'dark' ? '#27272a' : '#e5e7eb',
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in pb-12 font-sans relative">
      
      {/* Notifications Toast */}
      {notificationToast && (
          <div className="fixed top-24 right-8 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
              <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl p-4 flex items-center gap-3 min-w-[300px]">
                  <div className={`p-2 rounded-full ${notificationToast.type === 'email' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                      {notificationToast.type === 'email' ? <Mail size={18} /> : <MessageCircle size={18} />}
                  </div>
                  <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Notification Sent</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{notificationToast.msg}</p>
                  </div>
              </div>
          </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl text-[#f97316]">
            <Ghost size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Ghost Links</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Smart link engine with advanced routing & analytics.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Link Builder */}
        <div className="xl:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
                    {[
                      { id: 'general', icon: LinkIcon, label: 'General' },
                      { id: 'targeting', icon: Globe, label: 'Targeting' },
                      { id: 'abtest', icon: Split, label: 'A/B Test' },
                      { id: 'constraints', icon: Settings, label: 'Constraints' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide flex flex-col items-center gap-1.5 transition-all ${activeTab === tab.id ? 'text-[#f97316] bg-white dark:bg-[#111111] border-t-2 border-t-[#f97316]' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 border-t-2 border-t-transparent'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                    {activeTab === 'general' && (
                        <div className="space-y-5 animate-in fade-in">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Target URL <span className="text-red-500">*</span></label>
                                <input 
                                    type="url" 
                                    value={formData.targetUrl}
                                    onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Redirect Type</label>
                                    <select value={formData.redirectType} onChange={(e) => setFormData({...formData, redirectType: e.target.value})} className="w-full px-3 py-2.5 bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:border-[#f97316] outline-none">
                                        <option value="301">301 (Permanent)</option>
                                        <option value="302">302 (Found)</option>
                                        <option value="307">307 (Temporary)</option>
                                        <option value="cloak">Cloak (Masked)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Custom Slug</label>
                                    <input type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} placeholder="promo-24" className="w-full px-3 py-2.5 bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:border-[#f97316] outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Category & Tags</label>
                                <div className="flex gap-2">
                                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-1/3 px-3 py-2.5 bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-[#f97316]">
                                        <option>General</option><option>Social</option><option>Ads</option><option>Email</option>
                                    </select>
                                    <input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} placeholder="Tags (comma separated)" className="flex-1 px-3 py-2.5 bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-[#f97316] outline-none" />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2"><Tag size={14}/> UTM Builder</label>
                                    <button onClick={() => setFormData({...formData, utmEnabled: !formData.utmEnabled})} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${formData.utmEnabled ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}><span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${formData.utmEnabled ? 'translate-x-4' : 'translate-x-1'}`} /></button>
                                </div>
                                {formData.utmEnabled && (
                                    <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1">
                                        <input type="text" placeholder="utm_source" value={formData.utmSource} onChange={(e) => setFormData({...formData, utmSource: e.target.value})} className="px-3 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-xs" />
                                        <input type="text" placeholder="utm_medium" value={formData.utmMedium} onChange={(e) => setFormData({...formData, utmMedium: e.target.value})} className="px-3 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-xs" />
                                        <input type="text" placeholder="utm_campaign" value={formData.utmCampaign} onChange={(e) => setFormData({...formData, utmCampaign: e.target.value})} className="col-span-2 px-3 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-xs" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'targeting' && (
                        <div className="space-y-6 animate-in fade-in">
                            {/* Geo Rules */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2"><MapPin size={14}/> Geo Redirects</label>
                                    <button onClick={addGeoRule} className="text-[10px] bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 px-2 py-1 rounded font-bold"><Plus size={10} inline /> Add</button>
                                </div>
                                {geoRules.map(r => (
                                    <div key={r.id} className="flex gap-2 mb-2">
                                        <select value={r.country} onChange={(e) => updateGeoRule(r.id, 'country', e.target.value)} className="w-24 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-2 text-xs font-bold">
                                            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                        </select>
                                        <input type="text" placeholder="https://..." value={r.url} onChange={(e) => updateGeoRule(r.id, 'url', e.target.value)} className="flex-1 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#f97316]" />
                                        <button onClick={() => removeGeoRule(r.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                                {geoRules.length === 0 && <p className="text-xs text-gray-400 italic text-center p-2 border border-dashed rounded-lg border-gray-200 dark:border-gray-800">No geo rules configured.</p>}
                            </div>
                            
                            {/* Device Rules */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2"><Smartphone size={14}/> Device Redirects</label>
                                    <button onClick={addDeviceRule} className="text-[10px] bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 px-2 py-1 rounded font-bold"><Plus size={10} inline /> Add</button>
                                </div>
                                {deviceRules.map(r => (
                                    <div key={r.id} className="flex gap-2 mb-2">
                                        <select value={r.device} onChange={(e) => updateDeviceRule(r.id, 'device', e.target.value)} className="w-24 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-2 text-xs font-bold">
                                            {DEVICES.map(d => <option key={d.id} value={d.id}>{d.label.split(' ')[0]}</option>)}
                                        </select>
                                        <input type="text" placeholder="https://..." value={r.url} onChange={(e) => updateDeviceRule(r.id, 'url', e.target.value)} className="flex-1 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#f97316]" />
                                        <button onClick={() => removeDeviceRule(r.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                                {deviceRules.length === 0 && <p className="text-xs text-gray-400 italic text-center p-2 border border-dashed rounded-lg border-gray-200 dark:border-gray-800">No device rules configured.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'abtest' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl flex gap-3 text-xs text-blue-800 dark:text-blue-300">
                                <AlertCircle size={16} className="shrink-0" />
                                <p>A/B testing splits traffic randomly. Remaining percentage goes to Main Target URL.</p>
                            </div>
                            <div>
                                <div className="flex gap-2 items-center opacity-70 mb-3">
                                    <span className="w-16 text-xs font-bold text-gray-500 text-right">Main</span>
                                    <input disabled type="text" value={formData.targetUrl || 'Set Target URL first'} className="flex-1 bg-gray-100 dark:bg-[#161616] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-500" />
                                    <span className="w-16 text-center text-xs font-mono font-bold bg-gray-100 dark:bg-gray-800 py-2 rounded-lg text-gray-500">Auto %</span>
                                </div>
                                {splitVariants.map((v, i) => (
                                    <div key={v.id} className="flex gap-2 items-center mb-2">
                                        <span className="w-16 text-xs font-bold text-[#f97316] text-right">Var {String.fromCharCode(65 + i)}</span>
                                        <input type="text" placeholder="https://..." value={v.url} onChange={(e) => updateVariant(v.id, 'url', e.target.value)} className="flex-1 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#f97316]" />
                                        <div className="relative w-16">
                                            <input type="number" min="1" max="100" value={v.percent} onChange={(e) => updateVariant(v.id, 'percent', parseInt(e.target.value))} className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg pl-2 pr-4 py-2 text-xs outline-none text-center" />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">%</span>
                                        </div>
                                        <button onClick={() => removeVariant(v.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                                <button onClick={addVariant} className="w-full mt-2 py-2 border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    + Add Variant
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'constraints' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2"><Calendar size={14}/> Schedule</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><span className="text-[10px] text-gray-400 block mb-1">Start Date</span><input type="datetime-local" value={formData.scheduleStart} onChange={(e) => setFormData({...formData, scheduleStart: e.target.value})} className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-xs dark:text-white outline-none focus:border-[#f97316]" /></div>
                                    <div><span className="text-[10px] text-gray-400 block mb-1">End Date</span><input type="datetime-local" value={formData.scheduleEnd} onChange={(e) => setFormData({...formData, scheduleEnd: e.target.value})} className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-xs dark:text-white outline-none focus:border-[#f97316]" /></div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2"><Activity size={14}/> Click Limit</label>
                                <input type="number" placeholder="Max clicks (e.g. 1000)" value={formData.clickLimit} onChange={(e) => setFormData({...formData, clickLimit: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-xs dark:text-white outline-none focus:border-[#f97316]" />
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Notifications</label>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <span className="text-xs font-medium dark:text-gray-300 flex items-center gap-2"><Mail size={14}/> Email Me (on create/expire/limit)</span>
                                        <button onClick={() => setFormData({...formData, notifyEmail: !formData.notifyEmail})} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${formData.notifyEmail ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}><span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${formData.notifyEmail ? 'translate-x-4' : 'translate-x-1'}`} /></button>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <span className="text-xs font-medium dark:text-gray-300 flex items-center gap-2"><MessageCircle size={14}/> WhatsApp Notification</span>
                                        <button onClick={() => setFormData({...formData, notifyWhatsapp: !formData.notifyWhatsapp})} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${formData.notifyWhatsapp ? 'bg-[#f97316]' : 'bg-gray-300 dark:bg-gray-700'}`}><span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${formData.notifyWhatsapp ? 'translate-x-4' : 'translate-x-1'}`} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button 
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white dark:text-black font-bold py-3.5 rounded-xl shadow-lg shadow-[#f97316]/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Ghost size={18} />} Create Smart Link
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Analytics & List */}
        <div className="xl:col-span-2 space-y-6">
            
            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="py-4 px-5">
                    <MetricItem label="Total Clicks" value={totalClicks} trend={12} icon={MousePointer2} />
                </Card>
                <Card className="py-4 px-5">
                    <MetricItem label="Active Ghosts" value={ghostLinks.filter(l => l.status === 'active').length} icon={Activity} />
                </Card>
                <Card className="py-4 px-5">
                    <MetricItem label="Avg. CTR" value="4.2%" trend={-2.1} icon={ExternalLink} />
                </Card>
                <Card className="py-4 px-5">
                    <MetricItem label="Top Source" value="Direct" icon={Globe} />
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[300px]">
                <Card className="lg:col-span-2 min-h-0">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wide">Traffic Volume</h3>
                    </div>
                    <div className="flex-1 w-full min-h-0 -ml-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={clickData}>
                                <defs>
                                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} opacity={0.4} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: chartColors.text, fontSize: 10, fontFamily: 'monospace'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: chartColors.text, fontSize: 10, fontFamily: 'monospace'}} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: chartColors.tooltip, borderColor: chartColors.tooltipBorder, borderRadius: '8px', fontSize: '12px', color: chartColors.text }}
                                    itemStyle={{ color: '#f97316', fontWeight: 600 }}
                                    cursor={{ stroke: chartColors.grid, strokeWidth: 1 }}
                                />
                                <Area type="monotone" dataKey="clicks" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="min-h-0 justify-center items-center">
                    <p className="text-gray-400 text-xs italic">Device Analytics Unavailable in Demo</p>
                </Card>
            </div>

            {/* Links Table */}
            <Card className="min-h-[400px]" noPadding>
                <div className="p-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                    <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wide flex items-center gap-2">
                        <Shuffle size={14} /> Active Ghost Links
                    </h3>
                </div>
                <div className="overflow-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white dark:bg-[#09090b] sticky top-0 z-10 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5">
                            <tr>
                                <th className="px-5 py-3">Slug</th>
                                <th className="px-5 py-3">Rules</th>
                                <th className="px-5 py-3">Destinations</th>
                                <th className="px-5 py-3">Clicks</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {ghostLinks.length === 0 && (
                                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-500 text-sm">No links generated yet.</td></tr>
                            )}
                            {ghostLinks.map((link) => (
                                <tr key={link.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-3">
                                        <span className="font-mono text-sm font-medium text-[#f97316]">/{link.slug}</span>
                                        <div className="text-[10px] text-gray-400 mt-0.5">{link.category}</div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex gap-1 flex-wrap">
                                            {Object.keys(link.geo_redirects).length > 0 && <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/30 flex items-center gap-1"><Globe size={10}/> {Object.keys(link.geo_redirects).length}</span>}
                                            {Object.keys(link.device_redirects).length > 0 && <span className="text-[10px] bg-purple-50 dark:bg-purple-900/20 text-purple-600 px-1.5 py-0.5 rounded border border-purple-100 dark:border-purple-900/30 flex items-center gap-1"><Smartphone size={10}/> {Object.keys(link.device_redirects).length}</span>}
                                            {link.destination_urls.length > 1 && <span className="text-[10px] bg-orange-50 dark:bg-orange-900/20 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 dark:border-orange-900/30 flex items-center gap-1"><Split size={10}/> A/B</span>}
                                            {link.schedule_end && <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 flex items-center gap-1"><Calendar size={10}/></span>}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="text-xs text-gray-500 truncate max-w-[150px]">{link.destination_urls[0]}</div>
                                        {link.destination_urls.length > 1 && <div className="text-[10px] text-gray-400">+{link.destination_urls.length - 1} others</div>}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">{link.click_total}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <button 
                                            onClick={() => handleToggleStatus(link)}
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border transition-all ${link.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/50' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                        >
                                            {link.status === 'active' ? 'Active' : 'Disabled'} <Power size={10} />
                                        </button>
                                    </td>
                                    <td className="px-5 py-3 text-right flex justify-end gap-1">
                                        <button 
                                            onClick={() => handleDelete(link.id)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title="Delete Link"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <button 
                                            onClick={() => { setActiveLinkForSim(link); setSimModalOpen(true); setSimResult(null); }}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            title="Test / Simulate"
                                        >
                                            <Play size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleCopy(link.id, `${API_URL}/g/${link.slug}`)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                            title="Copy Link"
                                        >
                                            {isCopied === link.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
      </div>

      {/* Simulation Modal */}
      {simModalOpen && activeLinkForSim && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Play size={18} className="text-[#f97316]" /> Test Redirection Logic
                      </h3>
                      <div className="text-xs font-mono text-gray-500">/{activeLinkForSim.slug}</div>
                  </div>
                  
                  <div className="p-6 space-y-6 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Simulated Country</label>
                              <select value={simContext.country} onChange={(e) => setSimContext({...simContext, country: e.target.value})} className="w-full p-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:border-[#f97316] outline-none">
                                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Simulated Device</label>
                              <select value={simContext.device} onChange={(e) => setSimContext({...simContext, device: e.target.value})} className="w-full p-2.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:border-[#f97316] outline-none">
                                  {DEVICES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                              </select>
                          </div>
                      </div>
                      
                      {simResult && (
                          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                              
                              <div className={`p-4 rounded-xl border ${simResult.type === 'error' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30'}`}>
                                  <div className="flex items-center gap-2 mb-2">
                                      {simResult.type === 'error' ? <AlertCircle size={16} className="text-red-500" /> : <Check size={16} className="text-emerald-500" />}
                                      <span className={`text-sm font-bold ${simResult.type === 'error' ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                          {simResult.type === 'error' ? 'Blocked / Failed' : 'Success'}
                                      </span>
                                  </div>
                                  
                                  <div className="space-y-1">
                                      <div className="flex text-xs">
                                          <span className="w-20 font-bold text-gray-500">Method:</span>
                                          <span className="font-mono text-gray-900 dark:text-white">{simResult.method || 'N/A'}</span>
                                      </div>
                                      <div className="flex text-xs">
                                          <span className="w-20 font-bold text-gray-500">Reason:</span>
                                          <span className="text-gray-900 dark:text-white">{simResult.reason}</span>
                                      </div>
                                      <div className="flex text-xs">
                                          <span className="w-20 font-bold text-gray-500">Destination:</span>
                                          <a href={simResult.url} target="_blank" rel="noreferrer" className="text-[#f97316] hover:underline truncate flex-1 block">{simResult.url}</a>
                                      </div>
                                  </div>
                              </div>

                              <div className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4 font-mono text-xs text-gray-600 dark:text-gray-400 overflow-hidden">
                                  <div className="flex items-center gap-2 mb-3 text-gray-900 dark:text-white font-bold uppercase tracking-wider text-[10px]">
                                      <List size={12} /> Execution Log
                                  </div>
                                  <ul className="space-y-1.5 list-disc list-inside">
                                      {simResult.logs.map((log, i) => (
                                          <li key={i} className="leading-relaxed">{log}</li>
                                      ))}
                                  </ul>
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3 bg-gray-50 dark:bg-[#161616]">
                      <button onClick={() => setSimModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Close</button>
                      <button onClick={handleSimulate} disabled={isSimulating} className="flex-1 py-3 rounded-xl bg-[#f97316] text-white font-bold text-sm hover:bg-[#ea580c] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                          {isSimulating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Run Test
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default GhostLinkPage;
