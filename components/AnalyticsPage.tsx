
import React, { useContext, useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  MoreHorizontal, ArrowUpRight, ArrowDownRight, Upload, DollarSign, Wallet, CreditCard,
  Globe, TrendingUp, RefreshCw, ShoppingCart, CheckCircle, Clock, XCircle, User,
  Calendar, Filter, ChevronDown, Activity, Zap, ExternalLink, Map as MapIcon, Layers
} from 'lucide-react';
import { AppContext } from '../AppContext';

// --- Reusable Modern Components ---

const Card = ({ children, className = '', noPadding = false }: { children?: React.ReactNode, className?: string, noPadding?: boolean }) => (
  <div className={`bg-white dark:bg-[#09090b] rounded-xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none overflow-hidden flex flex-col ${noPadding ? '' : 'p-5'} ${className}`}>
    {children}
  </div>
);

const MetricItem = ({ label, value, trend, icon: Icon, currency = false, currencySymbol = '$' }: any) => (
  <div className="flex flex-col justify-between h-full relative group">
    <div className="flex justify-between items-start mb-3">
       <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/5 group-hover:bg-gray-100 dark:group-hover:bg-white/10 transition-colors">
          <Icon size={18} />
       </div>
       {trend && (
         <span className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${trend > 0 ? 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'text-red-600 bg-red-50 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
            {trend > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {Math.abs(trend)}%
         </span>
       )}
    </div>
    <div>
       <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white font-mono tracking-tighter tabular-nums">
          {currency && <span className="text-gray-400 mr-0.5 text-lg align-top relative top-1">{currencySymbol}</span>}
          {value}
       </div>
       <div className="text-xs font-bold text-gray-500 dark:text-gray-500 mt-1 uppercase tracking-wide">{label}</div>
    </div>
  </div>
);

const MapSVG = ({ countries }: { countries: any[] }) => (
  <svg viewBox="0 0 1000 450" className="w-full h-full text-gray-200 dark:text-gray-800 fill-current">
    <path d="M842.8,193.3c-2.6-0.3-5.2,0.6-6.9,2.6c-2.3,2.6-2.5,6.4-0.6,9.2c1.9,2.8,5.4,4.1,8.7,3.2c3.3-0.9,5.8-3.7,6.3-7.1C850.8,197.8,847.6,193.9,842.8,193.3z" />
    <path d="M192.9,150.7c-0.8-1.5-2.6-2.3-4.3-2c-1.7,0.3-3,1.6-3.3,3.3c-0.3,1.7,0.5,3.5,2,4.3c1.5,0.8,3.5,0.5,4.7-0.7C193.2,154.3,193.6,152.3,192.9,150.7z" />
    <path d="M152.1,387.6c-1.3-1.1-3.2-1.3-4.7-0.4c-1.5,0.9-2.2,2.7-1.7,4.4c0.5,1.7,2.1,2.9,3.8,2.9c1.7,0,3.3-1.2,3.8-2.9C154,390,153.4,388.5,152.1,387.6z" />
    <path d="M784.7,337.8c-23.7-14.2-38.6,8.3-43.1,13.6c-6.8,8-20.8,1.2-25.5-2.4c-2.4-1.8-8.9-6-7.1-10.7c1.8-4.7,11.3,0.6,16,2.4c4.7,1.8,10.1,1.2,12.5-3.6c2.4-4.7-3-11.3-7.1-13c-4.2-1.8-13.6-1.2-17.8,3.6c-4.2,4.7-4.2,13.6,1.8,17.8c5.9,4.2,20.2,10.7,33.2-1.2c5.6-5.1,18.4-15.6,26.7-11.3C782.7,337.2,784.7,337.8,784.7,337.8z"/>
    <path d="M224,119c-12-11-50,6-40,24s41-10 40-24Z" opacity="0.6"/>
    <path d="M600,100c-30,10-10,50 10,40s10-40-10-40Z" opacity="0.6"/>
    <path d="M850,350c-20,10-10,40 10,30s20-30-10-30Z" opacity="0.6"/>
    <path d="M350,250c-40-20-60,50-10,40s40-50 10-40Z" opacity="0.6"/>
    <path d="M680,200c-10-20-50,10-30,30s50-10 30-30Z" opacity="0.6"/>
    <path d="M150,180c-20-30-70,10-40,40s60-10 40-40Z" opacity="0.6"/>
     
    {/* Dynamic Dots based on data availability (Simulation) */}
    {countries.length > 0 && <circle cx="200" cy="160" r="3" className="text-[#f97316] fill-current animate-pulse" />}
    {countries.find(c => c.name === 'MA') && <circle cx="480" cy="180" r="3" className="text-[#f97316] fill-current opacity-80" />}
    <circle cx="580" cy="140" r="3" className="text-[#f97316] fill-current opacity-60" />
    <circle cx="280" cy="120" r="3" className="text-[#f97316] fill-current opacity-60" />
  </svg>
);

const MOCK_ANALYTICS_DATA = {
    kpi: {
        revenue: 12450.00,
        gross: 14200.00,
        orders: 156,
        customers: 142,
        refunds: 120.00
    },
    charts: {
        daily: Array.from({length: 7}, (_, i) => ({
             name: new Date(Date.now() - (6-i)*86400000).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
             revenue: Math.floor(Math.random() * 800) + 200
        })),
        sources: [
            { name: 'Website', value: 65 },
            { name: 'Mobile', value: 32 },
            { name: 'Social', value: 12 }
        ],
        countries: [
            { name: 'MA', value: 65 },
            { name: 'US', value: 35 },
            { name: 'FR', value: 25 },
            { name: 'UK', value: 15 }
        ]
    },
    recentOrders: Array.from({length: 6}, (_, i) => ({
        id: `ord_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        description: ['Premium Plan', 'E-Book Bundle', 'Consultation', 'Course Access'][i % 4],
        amount: (Math.random() * 200 + 20).toFixed(2),
        status: ['succeeded', 'succeeded', 'succeeded', 'pending'][i % 4],
        source: ['website', 'mobile', 'website', 'agent'][i % 4],
        date: 'Just now'
    }))
};

const AnalyticsPage = () => {
  const { theme, settings } = useContext(AppContext);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const fetchAnalytics = async () => {
     if (!backendAvailable) return;

     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), 3000);

     try {
         const res = await fetch(`http://localhost:3000/api/analytics?range=${timeRange}`, {
             signal: controller.signal
         });
         if (!res.ok) throw new Error("Backend unavailable");
         const json = await res.json();
         setData(json);
     } catch (e) {
         setBackendAvailable(false);
         setData(MOCK_ANALYTICS_DATA);
     } finally {
         clearTimeout(timeoutId);
         setLoading(false);
     }
  };

  useEffect(() => {
     fetchAnalytics();
     if (backendAvailable) {
        const interval = setInterval(fetchAnalytics, 15000); 
        return () => clearInterval(interval);
     }
  }, [backendAvailable, timeRange]);

  if (loading || !data) {
     return <div className="p-8 flex flex-col items-center justify-center h-[50vh] text-gray-500 gap-3">
         <div className="relative">
             <div className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-800 opacity-30"></div>
             <div className="w-10 h-10 rounded-full border-2 border-t-[#f97316] animate-spin absolute inset-0"></div>
         </div>
         <p className="text-xs font-mono font-medium">SYNCING DATA...</p>
     </div>;
  }

  // Colors & Formats
  const currencySymbol = settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : 'MAD ';
  const chartColors = {
      grid: theme === 'dark' ? '#27272a' : '#f3f4f6',
      text: theme === 'dark' ? '#71717a' : '#9ca3af',
      tooltip: theme === 'dark' ? '#18181b' : '#ffffff',
      tooltipBorder: theme === 'dark' ? '#27272a' : '#e5e7eb',
  };

  // Source Donut Data Preparation
  const donutData = data.charts.sources || [];
  const donutColors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'];

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 animate-fade-in font-sans pb-12 p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
         <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
               Analytics 
               <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Live
               </span>
            </h1>
         </div>

         {/* Controls */}
         <div className="flex items-center gap-2">
            <div className="relative group">
               <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="appearance-none bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg pl-3 pr-8 py-2 focus:ring-1 focus:ring-[#f97316] focus:border-[#f97316] outline-none shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
               >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 3 Months</option>
               </select>
               <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600 dark:group-hover:text-gray-200" />
            </div>
            <button className="p-2 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors shadow-sm">
               <RefreshCw size={14} onClick={fetchAnalytics} className={loading ? 'animate-spin' : ''} />
            </button>
         </div>
      </div>

      {/* KPI Grid (Bento Box Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <Card>
            <MetricItem 
                label="Net Revenue" 
                value={data.kpi.revenue.toFixed(2)} 
                trend={12.5} 
                icon={DollarSign} 
                currency={true} 
                currencySymbol={currencySymbol} 
            />
         </Card>
         <Card>
            <MetricItem 
                label="Total Orders" 
                value={data.kpi.orders} 
                trend={8.2} 
                icon={ShoppingCart} 
            />
         </Card>
         <Card>
            <MetricItem 
                label="Unique Customers" 
                value={data.kpi.customers} 
                trend={-2.4} 
                icon={User} 
            />
         </Card>
         <Card>
            <MetricItem 
                label="Refund Rate" 
                value={`${((data.kpi.refunds / (data.kpi.gross || 1)) * 100).toFixed(1)}%`} 
                trend={0} 
                icon={RefreshCw} 
            />
         </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[320px]">
         
         {/* Revenue Area Chart */}
         <Card className="lg:col-span-2 min-h-0">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wide">Revenue Overview</h3>
               <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><MoreHorizontal size={16} /></button>
            </div>
            <div className="flex-1 w-full min-h-0 -ml-4">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.charts.daily}>
                     <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} opacity={0.4} />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: chartColors.text, fontSize: 10, fontFamily: 'monospace', fontWeight: 500}} 
                        dy={10} 
                     />
                     <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: chartColors.text, fontSize: 10, fontFamily: 'monospace', fontWeight: 500}} 
                        tickFormatter={(value) => `${value}`} 
                        width={40}
                     />
                     <Tooltip 
                        contentStyle={{ 
                           backgroundColor: chartColors.tooltip, 
                           borderColor: chartColors.tooltipBorder,
                           borderRadius: '8px',
                           fontSize: '12px',
                           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                           color: chartColors.text
                        }}
                        itemStyle={{ color: '#f97316', fontWeight: 600, fontFamily: 'monospace' }}
                        formatter={(value: any) => [`${currencySymbol}${value}`, 'Revenue']}
                        labelStyle={{ color: chartColors.text, marginBottom: '0.25rem', fontSize: '10px', textTransform: 'uppercase' }}
                        cursor={{ stroke: chartColors.grid, strokeWidth: 1 }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#f97316" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                        activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </Card>

         {/* Sales Source Donut */}
         <Card className="min-h-0">
            <div className="flex justify-between items-center mb-2">
               <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wide">Traffic Source</h3>
            </div>
            <div className="flex-1 relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                     >
                        {donutData.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                        ))}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               {/* Center Metric */}
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <Layers size={18} className="text-gray-400 mb-1" />
                   <span className="text-[10px] font-bold text-gray-500 uppercase">Channel</span>
               </div>
            </div>
            
            {/* Compact Legend */}
            <div className="grid grid-cols-2 gap-2 mt-2">
                {donutData.slice(0, 4).map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: donutColors[index % donutColors.length] }}></div>
                        <span className="text-gray-500 dark:text-gray-400 flex-1 truncate font-medium">{entry.name}</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-gray-200">{entry.value}%</span>
                    </div>
                ))}
            </div>
         </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         
         {/* Live Orders Table - Compact */}
         <Card className="lg:col-span-2 flex flex-col h-[350px]" noPadding>
            <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
               <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wide">Recent Transactions</h3>
               <button className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#f97316] hover:text-orange-500 transition-colors">
                  View All <ArrowUpRight size={12} />
               </button>
            </div>
            <div className="flex-1 overflow-auto">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-white dark:bg-[#09090b] sticky top-0 z-10 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5">
                     <tr>
                        <th className="px-4 py-2">Order</th>
                        <th className="px-4 py-2">Amount</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2 text-right">Time</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                     {data.recentOrders?.map((order: any, i: number) => (
                        <tr key={i} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                           <td className="px-4 py-2.5">
                              <div className="font-medium text-gray-900 dark:text-white text-xs truncate max-w-[180px]">{order.description}</div>
                              <div className="text-[10px] text-gray-400 font-mono group-hover:text-[#f97316] transition-colors">{order.id}</div>
                           </td>
                           <td className="px-4 py-2.5">
                              <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">
                                 {currencySymbol}{order.amount}
                              </span>
                           </td>
                           <td className="px-4 py-2.5">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                 order.status === 'succeeded' 
                                 ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-100 dark:border-green-500/20' 
                                 : 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-500/20'
                              }`}>
                                 {order.status === 'succeeded' ? <CheckCircle size={8} /> : <Clock size={8} />}
                                 {order.status}
                              </span>
                           </td>
                           <td className="px-4 py-2.5 text-right text-[10px] text-gray-400 font-mono">
                              {order.date}
                           </td>
                        </tr>
                     ))}
                     {(!data.recentOrders || data.recentOrders.length === 0) && (
                        <tr><td colSpan={4} className="px-5 py-8 text-center text-xs text-gray-500">No recent transactions found.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </Card>

         {/* Customer Map - Compact */}
         <Card className="flex flex-col h-[350px] bg-gradient-to-b from-white to-gray-50 dark:from-[#09090b] dark:to-[#0c0c0e]">
             <div className="flex justify-between items-start mb-2">
               <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wide">Active Regions</h3>
               <MapIcon size={14} className="text-gray-400" />
             </div>
             
             {/* Map Visualization */}
             <div className="flex-1 w-full relative">
                 <div className="absolute inset-0 opacity-80">
                     <MapSVG countries={data.charts.countries} />
                 </div>
                 
                 {/* Top Countries Overlay List */}
                 <div className="absolute bottom-0 left-0 right-0 p-3">
                     <div className="space-y-1.5">
                        {data.charts.countries?.slice(0, 3).map((c: any, i: number) => (
                           <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-white/60 dark:bg-black/40 backdrop-blur-md rounded border border-gray-100 dark:border-white/5 shadow-sm">
                              <div className="flex items-center gap-2">
                                 <span className="font-bold text-gray-700 dark:text-gray-300 w-6">{c.name}</span>
                                 <div className="h-1 w-16 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                     <div className="h-full bg-[#f97316]" style={{width: `${c.value}%`}}></div>
                                 </div>
                              </div>
                              <span className="font-mono text-[10px] text-gray-500">{c.value}%</span>
                           </div>
                        ))}
                     </div>
                 </div>
             </div>
         </Card>
      </div>

    </div>
  );
};

export default AnalyticsPage;
