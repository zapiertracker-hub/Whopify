
import React, { useState, useContext, useEffect } from 'react';
import { 
  Ghost, Link as LinkIcon, Copy, ArrowRight, Check, 
  Settings, Facebook, Globe, Instagram, Search, Shuffle, ExternalLink,
  Activity, MousePointer2, Smartphone, ArrowUpRight, ArrowDownRight, Tablet, MapPin
} from 'lucide-react';
import { AppContext } from '../AppContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

interface GhostLink {
    id: number;
    alias: string;
    target: string;
    original: string;
    ghost: string;
    created: string;
    type: string;
    clicks: number;
    ctr: string;
}

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
  const [targetUrl, setTargetUrl] = useState('');
  const [redirectType, setRedirectType] = useState('307');
  const [alias, setAlias] = useState('');
  
  // UTM State
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  
  // Link & Analytics State
  const [links, setLinks] = useState<GhostLink[]>([]);
  const [isCopied, setIsCopied] = useState<number | null>(null);
  
  // Mock Analytics Data State
  const [clickData, setClickData] = useState([
    { name: 'Mon', clicks: 12 },
    { name: 'Tue', clicks: 19 },
    { name: 'Wed', clicks: 3 },
    { name: 'Thu', clicks: 5 },
    { name: 'Fri', clicks: 2 },
    { name: 'Sat', clicks: 0 },
    { name: 'Sun', clicks: 0 }, // Today
  ]);

  const [deviceData, setDeviceData] = useState([
    { name: 'Mobile', value: 65, color: '#f97316' },
    { name: 'Desktop', value: 25, color: '#3b82f6' },
    { name: 'Tablet', value: 10, color: '#10b981' },
  ]);

  const [totalClicks, setTotalClicks] = useState(41);

  const handleGenerate = () => {
    if (!targetUrl) return;

    // Simulate link generation
    const randomSlug = alias || Math.random().toString(36).substring(7);
    const ghostUrl = `https://g.milek.store/${randomSlug}`;
    
    // Add to history
    const newEntry: GhostLink = {
        id: Date.now(),
        alias: randomSlug,
        target: targetUrl,
        original: targetUrl,
        ghost: ghostUrl,
        type: redirectType,
        created: 'Just now',
        clicks: 0,
        ctr: '0%'
    };
    setLinks([newEntry, ...links]);
    
    // Reset form
    setTargetUrl('');
    setAlias('');
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleSimulateClick = (id: number) => {
    // 1. Update Link specific stats
    setLinks(prevLinks => prevLinks.map(link => 
      link.id === id ? { ...link, clicks: link.clicks + 1, ctr: `${((link.clicks + 1) * 1.5).toFixed(1)}%` } : link
    ));

    // 2. Update Global Analytics
    setTotalClicks(prev => prev + 1);

    // 3. Update Chart (Increment last day)
    setClickData(prev => {
        const newData = [...prev];
        const lastDay = newData[newData.length - 1];
        newData[newData.length - 1] = { ...lastDay, clicks: lastDay.clicks + 1 };
        return newData;
    });

    // 4. Update Device Distribution (Randomly)
    setDeviceData(prev => {
        const rand = Math.random();
        const idx = rand > 0.6 ? 0 : (rand > 0.3 ? 1 : 2); // Bias towards mobile
        const newData = [...prev];
        newData[idx] = { ...newData[idx], value: newData[idx].value + 1 };
        return newData;
    });
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

  // Chart Styling
  const chartColors = {
      grid: theme === 'dark' ? '#27272a' : '#f3f4f6',
      text: theme === 'dark' ? '#71717a' : '#9ca3af',
      tooltip: theme === 'dark' ? '#18181b' : '#ffffff',
      tooltipBorder: theme === 'dark' ? '#27272a' : '#e5e7eb',
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in pb-12 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl text-[#f97316]">
            <Ghost size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Ghost Links</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Generate stealth redirects and track performance in real-time.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Generator */}
        <div className="xl:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <LinkIcon size={18} className="text-[#f97316]" /> Create New Ghost
                </h3>
                
                {/* Target URL */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Target URL</label>
                        <input 
                            type="url" 
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            placeholder="https://your-store.com/product/..."
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none transition-all font-medium text-sm"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Redirect Type</label>
                            <select 
                                value={redirectType}
                                onChange={(e) => setRedirectType(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:border-[#f97316] outline-none"
                            >
                                <option value="301">301 (Permanent)</option>
                                <option value="302">302 (Found)</option>
                                <option value="307">307 (Temporary)</option>
                                <option value="meta">Meta Refresh (Cloak)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Custom Alias</label>
                            <input 
                                type="text"
                                value={alias}
                                onChange={(e) => setAlias(e.target.value)}
                                placeholder="summer-sale"
                                className="w-full px-3 py-2.5 bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:border-[#f97316] outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* UTM Builder */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                            UTM Parameters
                        </label>
                        <div className="flex gap-1.5">
                            <button onClick={() => applyPreset('facebook')} title="Facebook" className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded hover:bg-blue-100 transition-all"><Facebook size={14} /></button>
                            <button onClick={() => applyPreset('google')} title="Google" className="p-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded hover:bg-green-100 transition-all"><Search size={14} /></button>
                            <button onClick={() => applyPreset('tiktok')} title="TikTok" className="p-1.5 bg-pink-50 dark:bg-pink-900/20 text-pink-600 rounded hover:bg-pink-100 transition-all"><Globe size={14} /></button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <input type="text" placeholder="Source (e.g. facebook)" value={utmSource} onChange={(e) => setUtmSource(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white focus:border-[#f97316] outline-none" />
                        <input type="text" placeholder="Medium (e.g. cpc)" value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white focus:border-[#f97316] outline-none" />
                        <input type="text" placeholder="Campaign (e.g. spring_sale)" value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white focus:border-[#f97316] outline-none" />
                    </div>
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={!targetUrl}
                    className="mt-6 w-full bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-black font-bold py-3.5 rounded-xl shadow-lg shadow-[#f97316]/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                >
                    <Ghost size={18} /> Generate Link
                </button>
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
                    <MetricItem label="Active Ghosts" value={links.length} icon={Activity} />
                </Card>
                <Card className="py-4 px-5">
                    <MetricItem label="Avg. CTR" value="4.2%" trend={-2.1} icon={ExternalLink} />
                </Card>
                <Card className="py-4 px-5">
                    <MetricItem label="Top Source" value="Facebook" icon={Globe} />
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[300px]">
                {/* Click Trend */}
                <Card className="lg:col-span-2 min-h-0">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wide">Clicks (Last 7 Days)</h3>
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

                {/* Device Donut */}
                <Card className="min-h-0">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wide">Devices</h3>
                    </div>
                    <div className="flex-1 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none" cornerRadius={4}>
                                    {deviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <Smartphone size={24} className="text-gray-400 mb-1" />
                        </div>
                    </div>
                    <div className="flex justify-center gap-3 mt-2">
                        {deviceData.map((item, i) => (
                            <div key={i} className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: item.color}}></div>
                                <span className="text-[10px] text-gray-500 font-medium">{item.name}</span>
                            </div>
                        ))}
                    </div>
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
                                <th className="px-5 py-3">Ghost Alias</th>
                                <th className="px-5 py-3">Target URL</th>
                                <th className="px-5 py-3">Clicks</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {links.length === 0 && (
                                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-500 text-sm">No links generated yet.</td></tr>
                            )}
                            {links.map((link) => (
                                <tr key={link.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-3">
                                        <button 
                                            onClick={() => handleSimulateClick(link.id)} 
                                            className="font-mono text-sm font-medium text-[#f97316] hover:underline flex items-center gap-1"
                                            title="Simulate Visit"
                                        >
                                            /{link.alias} <ExternalLink size={10} className="opacity-50" />
                                        </button>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{link.target}</div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">{link.clicks}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 uppercase tracking-wide border border-green-200 dark:border-green-800">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <button 
                                            onClick={() => handleCopy(link.id, link.ghost)}
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
    </div>
  );
};

export default GhostLinkPage;
