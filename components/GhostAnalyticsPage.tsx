
import React, { useContext, useState } from 'react';
import { AppContext } from '../AppContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
  Activity, MousePointer2, Smartphone, Monitor, Globe,
  ArrowUpRight, ArrowDownRight, Link as LinkIcon, ExternalLink, Copy, Check,
  Tablet, MapPin, Chrome, LucideIcon
} from 'lucide-react';

const Card = ({ children, className = '', noPadding = false }: { children?: React.ReactNode, className?: string, noPadding?: boolean }) => (
  <div className={`bg-white dark:bg-[#09090b] rounded-xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none overflow-hidden flex flex-col ${noPadding ? '' : 'p-5'} ${className}`}>
    {children}
  </div>
);

const MetricItem = ({ label, value, trend, icon: Icon, colorClass = "text-[#f97316]" }: { label: string, value: string | number, trend?: number, icon: LucideIcon, colorClass?: string }) => (
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

const GhostAnalyticsPage = () => {
  const { theme } = useContext(AppContext);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Mock Data
  const clickData = [
    { name: 'Mon', clicks: 240 },
    { name: 'Tue', clicks: 450 },
    { name: 'Wed', clicks: 380 },
    { name: 'Thu', clicks: 620 },
    { name: 'Fri', clicks: 890 },
    { name: 'Sat', clicks: 750 },
    { name: 'Sun', clicks: 920 },
  ];

  const deviceData = [
    { name: 'Mobile', value: 65, color: '#f97316' },
    { name: 'Desktop', value: 25, color: '#3b82f6' },
    { name: 'Tablet', value: 10, color: '#10b981' },
  ];

  const topGhosts = [
    { id: 1, alias: '/summer-sale', target: 'myshop.com/promo', clicks: '12.5k', ctr: '4.2%', created: '2 days ago' },
    { id: 2, alias: '/tiktok-viral', target: 'myshop.com/p/leggings', clicks: '8.2k', ctr: '3.8%', created: '5 days ago' },
    { id: 3, alias: '/fb-ad-v2', target: 'myshop.com/landing-b', clicks: '3.1k', ctr: '2.1%', created: '1 week ago' },
    { id: 4, alias: '/email-welcome', target: 'myshop.com/discount', clicks: '1.2k', ctr: '12.5%', created: '2 weeks ago' },
  ];

  const locationData = [
    { name: 'USA', value: 45 },
    { name: 'UK', value: 20 },
    { name: 'Canada', value: 15 },
    { name: 'Morocco', value: 12 },
    { name: 'France', value: 8 },
  ];

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(`https://g.milek.store${text}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Chart Styling
  const chartColors = {
      grid: theme === 'dark' ? '#27272a' : '#f3f4f6',
      text: theme === 'dark' ? '#71717a' : '#9ca3af',
      tooltip: theme === 'dark' ? '#18181b' : '#ffffff',
      tooltipBorder: theme === 'dark' ? '#27272a' : '#e5e7eb',
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-fade-in font-sans pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
               Ghost Analytics 
               <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#f97316] text-[10px] font-bold uppercase tracking-wider">
                  Live Tracking
               </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Real-time performance metrics for your smart links.</p>
         </div>
         
         <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-mono">
            Last updated: <span className="text-gray-900 dark:text-white font-bold">Just now</span>
         </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
            <MetricItem label="Total Clicks" value="24,892" trend={15.4} icon={MousePointer2} />
        </Card>
        <Card>
            <MetricItem label="Active Ghosts" value="42" trend={5.2} icon={Activity} />
        </Card>
        <Card>
            <MetricItem label="Avg. CTR" value="4.8%" trend={-1.2} icon={ExternalLink} />
        </Card>
        <Card>
            <MetricItem label="Top Source" value="TikTok" trend={22.8} icon={Globe} />
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[350px]">
        
        {/* Clicks Trend */}
        <Card className="lg:col-span-2 min-h-0">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wide">Clicks Over Time (7d)</h3>
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
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: chartColors.text, fontSize: 10, fontFamily: 'monospace'}} 
                            dy={10} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: chartColors.text, fontSize: 10, fontFamily: 'monospace'}} 
                        />
                        <RechartsTooltip 
                            contentStyle={{ 
                                backgroundColor: chartColors.tooltip, 
                                borderColor: chartColors.tooltipBorder,
                                borderRadius: '8px',
                                fontSize: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                color: chartColors.text
                            }}
                            itemStyle={{ color: '#f97316', fontWeight: 600, fontFamily: 'monospace' }}
                            cursor={{ stroke: chartColors.grid, strokeWidth: 1 }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="clicks" 
                            stroke="#f97316" 
                            strokeWidth={2} 
                            fillOpacity={1} 
                            fill="url(#colorClicks)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>

        {/* Device Breakdown */}
        <Card className="min-h-0">
             <div className="flex justify-between items-center mb-2">
               <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wide">Device Breakdown</h3>
            </div>
            <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={deviceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                        >
                            {deviceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                 {/* Center Icon */}
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <Smartphone size={24} className="text-gray-400 mb-1" />
                   <span className="text-[10px] font-bold text-gray-500 uppercase">Devices</span>
               </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-2">
                {deviceData.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                        <span className="text-xs text-gray-500 font-medium">{item.name}</span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{item.value}%</span>
                    </div>
                ))}
            </div>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Top Ghosts Table */}
          <Card className="lg:col-span-2 h-[400px]" noPadding>
             <div className="p-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
               <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wide">Top Performing Ghosts</h3>
             </div>
             <div className="overflow-auto flex-1">
                 <table className="w-full text-left border-collapse">
                     <thead className="bg-white dark:bg-[#09090b] sticky top-0 z-10 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5">
                         <tr>
                             <th className="px-5 py-3">Alias</th>
                             <th className="px-5 py-3">Clicks</th>
                             <th className="px-5 py-3">CTR</th>
                             <th className="px-5 py-3 text-right">Action</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                         {topGhosts.map((ghost) => (
                             <tr key={ghost.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                 <td className="px-5 py-3">
                                     <div className="flex items-center gap-2">
                                         <div className="p-1.5 rounded bg-orange-50 dark:bg-orange-900/10 text-[#f97316]">
                                             <LinkIcon size={12} />
                                         </div>
                                         <div>
                                             <div className="font-medium text-gray-900 dark:text-white text-sm">{ghost.alias}</div>
                                             <div className="text-[10px] text-gray-400 max-w-[150px] truncate">{ghost.target}</div>
                                         </div>
                                     </div>
                                 </td>
                                 <td className="px-5 py-3">
                                     <span className="font-mono text-sm font-bold text-gray-700 dark:text-gray-300">{ghost.clicks}</span>
                                 </td>
                                 <td className="px-5 py-3">
                                     <div className="flex items-center gap-1.5">
                                         <div className="h-1.5 w-12 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                             <div className="h-full bg-emerald-500 rounded-full" style={{width: ghost.ctr}}></div>
                                         </div>
                                         <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{ghost.ctr}</span>
                                     </div>
                                 </td>
                                 <td className="px-5 py-3 text-right">
                                     <button 
                                        onClick={() => handleCopy(ghost.id, ghost.alias)}
                                        className="p-2 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                    >
                                        {copiedId === ghost.id ? <Check size={14} className="text-emerald-500"/> : <Copy size={14} />}
                                     </button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          </Card>

          {/* Geo Chart (Simplified Bar) */}
          <Card className="h-[400px]">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wide">Top Locations</h3>
               <MapPin size={14} className="text-gray-400" />
            </div>
            <div className="flex-1 w-full min-h-0 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={locationData} barSize={12}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={chartColors.grid} opacity={0.4} />
                        <XAxis type="number" hide />
                        <YAxis 
                            dataKey="name" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: chartColors.text, fontSize: 11, fontWeight: 500}} 
                            width={80}
                        />
                        <RechartsTooltip 
                             cursor={{fill: theme === 'dark' ? '#ffffff10' : '#00000005'}}
                             contentStyle={{ 
                                backgroundColor: chartColors.tooltip, 
                                borderColor: chartColors.tooltipBorder,
                                borderRadius: '8px',
                                fontSize: '12px',
                                color: chartColors.text
                            }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#f97316" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </Card>

      </div>
    </div>
  );
};

export default GhostAnalyticsPage;
