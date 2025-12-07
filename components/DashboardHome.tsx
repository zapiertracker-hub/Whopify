
import React, { useContext, useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Play, Mail, ArrowRight } from 'lucide-react';
import { AppContext } from '../AppContext';
import { useNavigate } from 'react-router-dom';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

const DashboardHome = () => {
  const { settings, theme, ghostMode, checkouts } = useContext(AppContext);
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('30d');
  
  // Real Data State
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    visits: 0, 
    customers: 0,
    chartData: [] as any[]
  });

  const [isLoading, setIsLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(true);

  const fetchStats = async () => {
      setIsLoading(true);

      // 1. Try Fetching from Backend (Orders API for real calculation)
      if (backendAvailable) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

          try {
              const res = await fetch(`${API_URL}/api/orders`, {
                signal: controller.signal
              });
              
              if (!res.ok) throw new Error("Backend unreachable");
              const orders = await res.json();
              
              // Filter by Time Range
              const now = new Date();
              const cutoff = new Date();
              if (timeRange === '24h') cutoff.setHours(now.getHours() - 24);
              if (timeRange === '7d') cutoff.setDate(now.getDate() - 7);
              if (timeRange === '30d') cutoff.setDate(now.getDate() - 30);

              const filteredOrders = Array.isArray(orders) ? orders.filter((o: any) => {
                  const d = o.timestamp ? new Date(o.timestamp) : new Date(o.date);
                  return d >= cutoff;
              }) : [];

              // Calculate KPI
              const totalRevenue = filteredOrders.reduce((acc: number, o: any) => acc + parseFloat(o.amount || 0), 0);
              const totalOrdersCount = filteredOrders.length;
              const uniqueCustomers = new Set(filteredOrders.map((o: any) => o.customerEmail)).size;
              // Use checkouts context sum for visits as it's the source of truth for page views if tracked
              const totalVisits = checkouts.reduce((acc, c) => acc + (c.visits || 0), 0);

              // Chart Data
              const chartMap = new Map();
              const isHourly = timeRange === '24h';
              const labels: string[] = [];
              
              if (isHourly) {
                 for(let i=23; i>=0; i--) {
                     const d = new Date(now.getTime() - i * 60 * 60 * 1000);
                     const label = d.getHours() + ':00';
                     labels.push(label);
                     chartMap.set(label, 0);
                 }
              } else {
                 const days = timeRange === '7d' ? 7 : 30;
                 for(let i=days-1; i>=0; i--) {
                     const d = new Date(now.getTime() - i * 86400000);
                     const label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                     labels.push(label);
                     chartMap.set(label, 0);
                 }
              }

              filteredOrders.forEach((o: any) => {
                  const timestamp = o.timestamp ? new Date(o.timestamp) : new Date(o.date);
                  let key;
                  if (isHourly) {
                      key = timestamp.getHours() + ':00';
                  } else {
                      key = timestamp.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                  }
                  
                  if (chartMap.has(key)) {
                      chartMap.set(key, chartMap.get(key) + parseFloat(o.amount || 0));
                  }
              });

              const chartData = labels.map(name => ({ name, revenue: chartMap.get(name) || 0 }));

              setStats({
                  revenue: totalRevenue,
                  orders: totalOrdersCount,
                  visits: totalVisits,
                  customers: uniqueCustomers,
                  chartData
              });
              
              setIsLoading(false);
              return; // Exit successfully
          } catch (e) {
              setBackendAvailable(false);
          } finally {
              clearTimeout(timeoutId);
          }
      }

      // 2. Fallback: Aggregate from checkouts (likely 0 if no backend sync, but consistent)
      const totalRevenue = checkouts.reduce((acc, c) => acc + (c.totalRevenue || 0), 0);
      const totalOrders = checkouts.reduce((acc, c) => acc + (c.conversions || 0), 0);
      const totalVisits = checkouts.reduce((acc, c) => acc + (c.visits || 0), 0);
      
      // Empty chart for fallback (No random data)
      let mockChartData = [];
      const now = new Date();
      if (timeRange === '24h') {
         mockChartData = Array.from({length: 24}, (_, i) => {
             const d = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
             return { name: d.getHours() + ':00', revenue: 0 };
         });
      } else {
         const days = timeRange === '7d' ? 7 : 30;
         mockChartData = Array.from({length: days}, (_, i) => ({
             name: new Date(Date.now() - (days-1-i)*86400000).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
             revenue: 0 
         }));
      }
      
      setStats({
          revenue: totalRevenue,
          orders: totalOrders,
          visits: totalVisits,
          customers: totalOrders, 
          chartData: mockChartData
      });
      setIsLoading(false);
  };

  useEffect(() => {
      fetchStats();
      // Only poll if backend is available to avoid wasted calls
      if (backendAvailable) {
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
      }
  }, [timeRange, backendAvailable, checkouts]); 

  // Chart Colors
  const gridColor = theme === 'dark' ? '#1f2937' : '#e5e7eb';
  const tickColor = theme === 'dark' ? '#6b7280' : '#9ca3af';
  const tooltipBg = theme === 'dark' ? '#111111' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#374151' : '#e5e7eb';
  const tooltipText = theme === 'dark' ? '#fff' : '#111827';

  // Helper for ghost mode class
  const blurClass = ghostMode ? 'blur-md select-none' : '';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pt-4 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-2 font-serif">
            Hey, {settings.storeName.split(' ')[0] || 'Seller'}
          </h1>
          <div className="flex items-center gap-3 mt-1">
             <span className="relative flex h-2.5 w-2.5">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
             </span>
             <span className="text-sm font-medium text-gray-400 dark:text-gray-400 tracking-wide">Your checkout is live</span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/checkouts')}
          className="shrink-0 bg-[#f97316] hover:bg-[#ea580c] text-black font-bold px-6 py-3 rounded-full flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-[#f97316]/20"
        >
          <Plus size={20} /> Add Checkout
        </button>
      </div>

      {/* Main Stats Card */}
      <div className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-2xl">
        
        {/* Card Header & Controls */}
        <div className="p-8 pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-medium text-gray-900 dark:text-white">Sales & traffic</h2>
          
          <div className="bg-gray-100 dark:bg-gray-900/50 p-1 rounded-full border border-gray-200 dark:border-gray-800 flex overflow-x-auto max-w-full">
            <button 
              onClick={() => setTimeRange('24h')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 whitespace-nowrap ${timeRange === '24h' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Last 24 hours
            </button>
            <button 
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 whitespace-nowrap ${timeRange === '7d' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Last 7 days
            </button>
            <button 
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 whitespace-nowrap ${timeRange === '30d' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Last 30 days
            </button>
          </div>
        </div>

        {/* Chart Area */}
        <div className={`h-64 w-full mt-8 px-4 transition-all duration-300 ${blurClass}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chartData.length ? stats.chartData : [{name: 'Today', revenue: 0}]}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: tickColor, fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: tickColor, fontSize: 12}} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: tooltipBg, borderRadius: '12px', border: `1px solid ${tooltipBorder}`, color: tooltipText }}
                itemStyle={{ color: '#f97316' }}
                cursor={{ stroke: tooltipBorder, strokeWidth: 1 }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Stats Row */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 border-t border-gray-200 dark:border-gray-800">
          
          {/* Customers */}
          <div className="p-8 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161616]/50">
            <p className="text-gray-500 font-medium mb-2">Unique Customers</p>
            <h3 className={`text-4xl font-bold text-gray-900 dark:text-white transition-all duration-300 ${blurClass}`}>
               {stats.customers}
            </h3>
          </div>

          {/* Orders */}
          <div className="p-8 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161616]/50">
            <p className="text-gray-500 font-medium mb-2">Total Orders</p>
            <h3 className={`text-4xl font-bold text-gray-900 dark:text-white transition-all duration-300 ${blurClass}`}>
               {stats.orders}
            </h3>
          </div>

          {/* Revenue (Highlighted) */}
          <div className="p-8 bg-[#f97316] relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-black/70 font-bold mb-2 uppercase tracking-wide text-xs">Total Revenue</p>
              <h3 className={`text-5xl font-black text-black tracking-tight transition-all duration-300 ${blurClass}`}>
                 ${stats.revenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </h3>
            </div>
            
            {/* Decorative Icon */}
            <div className="absolute -bottom-6 -right-6 text-black/10 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
               <ArrowRight size={120} />
            </div>
          </div>

        </div>
      </div>

      <div className="flex justify-end">
         <button 
           onClick={() => navigate('/analytics')}
           className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg active:scale-95"
         >
           Show detailed analytics <ArrowRight size={16} />
         </button>
      </div>

      {/* --- NOTIFICATIONS FEED (Shopify Style) --- */}
      <div className="space-y-4">
         
         {/* Live View / BFCM Card */}
         <div className="relative overflow-hidden rounded-2xl bg-black dark:bg-[#050505] shadow-lg group">
             {/* Gradient Background Effect */}
             <div className="absolute inset-0 flex opacity-60">
                 <div className="flex-1 bg-gradient-to-b from-blue-900 to-black/0"></div>
                 <div className="flex-1 bg-gradient-to-b from-purple-900 to-black/0"></div>
                 <div className="flex-1 bg-gradient-to-b from-pink-900 to-black/0"></div>
                 <div className="flex-1 bg-gradient-to-b from-red-900 to-black/0"></div>
                 <div className="flex-1 bg-gradient-to-b from-orange-900 to-black/0"></div>
                 <div className="flex-1 bg-gradient-to-b from-yellow-900 to-black/0"></div>
                 <div className="flex-1 bg-gradient-to-b from-green-900 to-black/0"></div>
                 <div className="flex-1 bg-gradient-to-b from-cyan-900 to-black/0"></div>
             </div>
             
             <div className="relative z-10 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div className="max-w-xl">
                     <h3 className="text-xl font-bold text-white mb-2">Black Friday Cyber Monday 2025</h3>
                     <p className="text-gray-300">See your sales, orders, and visitors in real time.</p>
                 </div>
                 <button 
                    onClick={() => navigate('/analytics')}
                    className="bg-white text-black hover:bg-gray-100 font-bold py-2.5 px-6 rounded-lg transition-all active:scale-95 text-sm"
                 >
                    Go to live view
                 </button>
             </div>
         </div>

         {/* Video / Education Card */}
         <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex flex-col md:flex-row gap-6">
                 <div className="flex-1 space-y-4">
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ready for the biggest weekend of the year?</h3>
                     <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                         This video is for you, the ones ready to take on Black Friday. You're built different, and we're here to cheer you on the entire way.
                     </p>
                     <button className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-2 px-4 rounded-lg transition-all active:scale-95 text-sm">
                         Watch video
                     </button>
                 </div>
                 <div className="md:w-1/3 relative group cursor-pointer overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900">
                     <img 
                        src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                        alt="Video Thumbnail" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                     />
                     <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                             <Play size={20} className="text-black ml-1" fill="currentColor" />
                         </div>
                     </div>
                 </div>
             </div>
         </div>

         {/* Feature Card: Abandoned Cart */}
         <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex flex-col md:flex-row items-center gap-6">
                 <div className="flex-1 space-y-2">
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recover sales with your abandoned checkout email</h3>
                     <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                         An automated email is already created for you. Take a moment to review the email and make any additional adjustments to the design, messaging, or recipient list.
                     </p>
                     <div className="pt-2">
                        <button className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-2 px-4 rounded-lg transition-all active:scale-95 text-sm">
                            Review email
                        </button>
                     </div>
                 </div>
                 <div className="md:w-48 flex justify-center">
                     <div className="relative w-40 h-28 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center p-4">
                         {/* Abstract UI Representation */}
                         <div className="absolute top-2 left-2 w-8 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                         <div className="absolute top-6 left-2 w-24 h-2 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                         <div className="absolute bottom-2 right-2 w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                         
                         <div className="relative z-10 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg border border-gray-100 dark:border-gray-700">
                             <Mail size={24} className="text-yellow-500" />
                             <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                         </div>
                     </div>
                 </div>
             </div>
         </div>

         {/* Feature Card: Shop Sign In */}
         <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex flex-col md:flex-row items-center gap-6">
                 <div className="flex-1 space-y-2">
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white">Shop sign-in added to your store</h3>
                     <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                         Customers can now use their Shop account to sign in to your store, creating a seamless experience that can reduce cart abandonment and increase conversions.
                     </p>
                     <div className="pt-2 flex items-center gap-4">
                        <button className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-2 px-4 rounded-lg transition-all active:scale-95 text-sm">
                            View settings
                        </button>
                        <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                            Learn more
                        </button>
                     </div>
                 </div>
                 <div className="md:w-48 flex justify-center">
                     <div className="relative w-40 h-28 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-8 bg-gray-700 flex items-center px-2 gap-1">
                            <div className="w-1 h-1 rounded-full bg-white/30"></div>
                            <div className="w-1 h-1 rounded-full bg-white/30"></div>
                         </div>
                         <div className="w-32 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 mt-4 flex flex-col gap-2">
                             <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 mx-auto"></div>
                             <div className="h-2 w-20 bg-gray-50 dark:bg-gray-900 rounded-full mx-auto"></div>
                             <div className="h-4 w-full bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"></div>
                         </div>
                         <div className="absolute bottom-4 -left-2 bg-[#5a31f4] text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg transform -rotate-3">
                            shop
                         </div>
                     </div>
                 </div>
             </div>
         </div>

      </div>

    </div>
  );
};

export default DashboardHome;
