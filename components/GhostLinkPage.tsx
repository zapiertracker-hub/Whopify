

import React, { useState } from 'react';
import { 
  Ghost, Link as LinkIcon, Copy, ArrowRight, Check, 
  Settings, Facebook, Globe, Instagram, Search, Shuffle, ExternalLink 
} from 'lucide-react';

const GhostLinkPage = () => {
  const [targetUrl, setTargetUrl] = useState('');
  const [redirectType, setRedirectType] = useState('307');
  const [alias, setAlias] = useState('');
  
  // UTM State
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  
  // Result State
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState<any[]>([
    { id: 1, original: 'https://myshop.com/product-1', ghost: 'https://g.milek.store/x9sA2', type: '307', clicks: 124, date: '2 hours ago' },
    { id: 2, original: 'https://myshop.com/promo', ghost: 'https://g.milek.store/promo24', type: '301', clicks: 856, date: '1 day ago' },
  ]);

  const handleGenerate = () => {
    if (!targetUrl) return;

    // Simulate link generation
    const randomSlug = alias || Math.random().toString(36).substring(7);
    const ghostUrl = `https://g.milek.store/${randomSlug}`;
    
    setGeneratedLink(ghostUrl);
    
    // Add to history
    const newEntry = {
        id: Date.now(),
        original: targetUrl,
        ghost: ghostUrl,
        type: redirectType,
        clicks: 0,
        date: 'Just now'
    };
    setHistory([newEntry, ...history]);
  };

  const handleCopy = () => {
    if (generatedLink) {
        navigator.clipboard.writeText(generatedLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSimulateClick = (id: number) => {
    setHistory(prevHistory => prevHistory.map(item => 
      item.id === id ? { ...item, clicks: item.clicks + 1 } : item
    ));
  };

  const applyPreset = (platform: 'facebook' | 'google' | 'tiktok') => {
      if (platform === 'facebook') {
          setUtmSource('facebook');
          setUtmMedium('cpc');
          setUtmCampaign('fb_prospecting_v1');
      } else if (platform === 'google') {
          setUtmSource('google');
          setUtmMedium('cpc');
          setUtmCampaign('search_brand');
      } else {
          setUtmSource('tiktok');
          setUtmMedium('video');
          setUtmCampaign('tt_viral_creative');
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white">
            <Ghost size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Ghost Link</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Generate stealth redirects and track traffic sources.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Generator Form */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm">
                
                {/* Target URL */}
                <div className="space-y-4 mb-8">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                        <LinkIcon size={16} /> Target URL
                    </label>
                    <div className="relative group">
                        <input 
                            type="url" 
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            placeholder="https://your-store.com/product/..."
                            className="w-full pl-4 pr-4 py-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none transition-all font-medium text-lg"
                        />
                    </div>
                </div>

                {/* Configuration Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Redirect Type</label>
                        <select 
                            value={redirectType}
                            onChange={(e) => setRedirectType(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#f97316] outline-none"
                        >
                            <option value="301">301 (Permanent)</option>
                            <option value="302">302 (Found)</option>
                            <option value="307">307 (Temporary)</option>
                            <option value="meta">Meta Refresh (Cloak)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Custom Alias (Optional)</label>
                        <div className="flex items-center">
                            <span className="bg-gray-100 dark:bg-gray-800 px-3 py-3 rounded-l-xl text-gray-500 dark:text-gray-400 text-sm border-y border-l border-gray-200 dark:border-gray-700">g.milek.store/</span>
                            <input 
                                type="text"
                                value={alias}
                                onChange={(e) => setAlias(e.target.value)}
                                placeholder="sale24"
                                className="flex-1 px-4 py-3 bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-700 rounded-r-xl text-gray-900 dark:text-white focus:border-[#f97316] outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* UTM Builder */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                            <Settings size={16} /> UTM Parameters
                        </label>
                        
                        {/* Presets */}
                        <div className="flex gap-2">
                            <button onClick={() => applyPreset('facebook')} title="Facebook Ads Preset" className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-95"><Facebook size={16} /></button>
                            <button onClick={() => applyPreset('google')} title="Google Ads Preset" className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-all active:scale-95"><Search size={16} /></button>
                            <button onClick={() => applyPreset('tiktok')} title="TikTok Preset" className="p-2 bg-pink-50 dark:bg-pink-900/20 text-pink-600 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-all active:scale-95"><Globe size={16} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input 
                            type="text" 
                            placeholder="Source (e.g. facebook)" 
                            value={utmSource}
                            onChange={(e) => setUtmSource(e.target.value)}
                            className="px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none"
                        />
                        <input 
                            type="text" 
                            placeholder="Medium (e.g. cpc)" 
                            value={utmMedium}
                            onChange={(e) => setUtmMedium(e.target.value)}
                            className="px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none"
                        />
                        <input 
                            type="text" 
                            placeholder="Campaign (e.g. spring_sale)" 
                            value={utmCampaign}
                            onChange={(e) => setUtmCampaign(e.target.value)}
                            className="px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:border-[#f97316] outline-none"
                        />
                    </div>
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={!targetUrl}
                    className="mt-8 w-full bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-black font-bold text-lg py-4 rounded-xl shadow-lg shadow-[#f97316]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <Ghost size={20} /> Generate Ghost Link
                </button>
            </div>
        </div>

        {/* Sidebar / Result */}
        <div className="space-y-6">
            
            {/* Result Card */}
            <div className={`bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg transition-all ${generatedLink ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none'}`}>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Your Ghost Link</h3>
                
                <div className="p-4 bg-gray-100 dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 mb-4 break-all font-mono text-sm text-[#f97316]">
                    {generatedLink || 'https://g.milek.store/...'}
                </div>

                <button 
                    onClick={handleCopy}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${isCopied ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-200'}`}
                >
                    {isCopied ? <Check size={18} /> : <Copy size={18} />}
                    {isCopied ? 'Copied!' : 'Copy Link'}
                </button>
            </div>

            {/* History */}
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shuffle size={18} /> Recent Ghosts
                </h3>
                <div className="space-y-4">
                    {history.map((item) => (
                        <div key={item.id} className="p-3 rounded-xl bg-gray-50 dark:bg-[#161616] border border-gray-100 dark:border-gray-800 group hover:border-[#f97316]/30 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{item.type}</span>
                                <span className="text-[10px] text-gray-400">{item.date}</span>
                            </div>
                            
                            {/* Clickable Ghost Link to simulate traffic */}
                            <button 
                                onClick={() => handleSimulateClick(item.id)}
                                title="Click to simulate a visit"
                                className="w-full text-left font-mono text-xs text-[#f97316] mb-1 truncate hover:underline flex items-center gap-1 group-hover:text-orange-500"
                            >
                                {item.ghost} <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            
                            <div className="text-[10px] text-gray-400 truncate max-w-[200px]">{item.original}</div>
                            <div className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Search size={10} /> {item.clicks} clicks
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};

export default GhostLinkPage;