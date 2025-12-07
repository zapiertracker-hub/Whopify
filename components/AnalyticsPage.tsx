
import React, { useContext, useEffect, useState, useRef, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
  ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, User, RefreshCw, 
  Activity, Search, Smartphone, Monitor, Tablet, Zap, Calendar, ShoppingBag,
  CreditCard, Filter, ChevronDown, Clock, Eye, MousePointer2, MapPin, Globe,
  ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { AppContext } from '../AppContext';

// --- Types ---

interface Session {
  id: string;
  location: string;
  device: 'Mobile' | 'Desktop' | 'Tablet';
  page: string;
  status: 'Viewing' | 'Cart' | 'Checkout';
  duration: string;
  flag: string;
  lat?: number;
  lng?: number;
}

// --- Constants ---

const CITY_COORDS: Record<string, [number, number]> = {
  'Casablanca': [33.5731, -7.5898],
  'Paris': [48.8566, 2.3522],
  'New York': [40.7128, -74.0060],
  'London': [51.5074, -0.1278],
  'Dubai': [25.2048, 55.2708],
  'Tokyo': [35.6762, 139.6503],
  'Toronto': [43.6510, -79.3470],
  'Sydney': [-33.8688, 151.2093],
  'Berlin': [52.5200, 13.4050],
  'Sao Paulo': [-23.5505, -46.6333],
  'Los Angeles': [34.0522, -118.2437],
  'Mumbai': [19.0760, 72.8777],
  'Singapore': [1.3521, 103.8198],
  'Cape Town': [-33.9249, 18.4241],
  'Moscow': [55.7558, 37.6173]
};

// Detect API URL
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

// --- Components ---

const Card = ({ children, className = '', noPadding = false }: { children?: React.ReactNode, className?: string, noPadding?: boolean }) => (
  <div className={`bg-white dark:bg-[#09090b] rounded-xl border border-gray-200 dark:border-white/10 shadow-sm flex flex-col ${noPadding ? '' : 'p-6'} ${className}`}>
    {children}
  </div>
);

const MetricItem = ({ label, value, trend, icon: Icon, prefix = '', suffix = '', trendLabel = 'vs last period' }: any) => {
  const isPositive = trend >= 0;
  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
         <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/5">
            <Icon size={20} />
         </div>
         {trend !== undefined && !isNaN(trend) && (
           <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${isPositive ? 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'text-rose-700 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20'}`}>
              {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(trend)}%
           </div>
         )}
      </div>
      <div>
         <div className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight tabular-nums">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
         </div>
         <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">{label}</span>
            {trendLabel && <span className="text-[10px] text-gray-400 dark:text-gray-600 hidden xl:inline-block">{trendLabel}</span>}
         </div>
      </div>
    </div>
  );
};

const Globe3D = ({ locations }: { locations: string[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const getPosition = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return { x, y, z };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    let scale = window.devicePixelRatio || 1;
    
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

    const GLOBE_RADIUS = Math.min(width, height) * 0.35;
    const DOT_COUNT = 800;
    const DOT_RADIUS = 1.2;
    let rotation = 0;
    
    const dots: {x: number, y: number, z: number}[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); 
    for (let i = 0; i < DOT_COUNT; i++) {
        const y = 1 - (i / (DOT_COUNT - 1)) * 2; 
        const radius = Math.sqrt(1 - y * y);
        const theta = phi * i;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        dots.push({ x: x * GLOBE_RADIUS, y: y * GLOBE_RADIUS, z: z * GLOBE_RADIUS });
    }

    let animationFrameId: number;

    const render = () => {
        ctx.clearRect(0, 0, width, height);
        const cx = width / 2;
        const cy = height / 2;

        rotation += 0.003; 

        // 1. Draw Globe Dots
        dots.forEach(dot => {
            const x = dot.x * Math.cos(rotation) - dot.z * Math.sin(rotation);
            const z = dot.x * Math.sin(rotation) + dot.z * Math.cos(rotation);
            const scaleProjected = (GLOBE_RADIUS * 2) / (GLOBE_RADIUS * 2 + z); 
            const alpha = scaleProjected * 0.5 + 0.1;
            
            if (z < 0) {
               ctx.fillStyle = `rgba(80, 80, 80, ${Math.max(0, alpha * 0.3)})`; 
            } else {
               ctx.fillStyle = `rgba(150, 150, 150, ${Math.max(0, alpha)})`;
            }
            
            const px = x * scaleProjected + cx;
            const py = dot.y * scaleProjected + cy;

            ctx.beginPath();
            ctx.arc(px, py, DOT_RADIUS * scaleProjected, 0, Math.PI * 2);
            ctx.fill();
        });

        // 2. Draw Active Locations
        locations.forEach(loc => {
            const coords = CITY_COORDS[loc] || [0,0];
            const pos = getPosition(coords[0], coords[1], GLOBE_RADIUS);
            
            const x = pos.x * Math.cos(rotation) - pos.z * Math.sin(rotation);
            const z = pos.x * Math.sin(rotation) + pos.z * Math.cos(rotation);
            
            const scaleProjected = (GLOBE_RADIUS * 2) / (GLOBE_RADIUS * 2 + z);
            const px = x * scaleProjected + cx;
            const py = pos.y * scaleProjected + cy;

            if (z > -20) {
                const pulse = (Date.now() % 2000) / 2000;
                
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px, py - 15 * scaleProjected);
                ctx.strokeStyle = `rgba(249, 115, 22, ${1 - z/GLOBE_RADIUS})`;
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(px, py - 15 * scaleProjected, 3 * scaleProjected, 0, Math.PI * 2);
                ctx.fillStyle = '#f97316';
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(px, py - 15 * scaleProjected, (3 + pulse * 10) * scaleProjected, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(249, 115, 22, ${1 - pulse})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });

        animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
        cancelAnimationFrame(animationFrameId);
    };
  }, [locations]);

  return <canvas ref={canvasRef} className="w-full h-full cursor-move" />;
};

// Date Utils
const isSameDay = (d1: Date, d2: Date) => 
    d1.getDate() === d2.getDate() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getFullYear() === d2.getFullYear();

const isDateInRange = (date: Date, start: Date | null, end: Date | null) => {
    if (!start || !end) return false;
    // Normalize to start of day
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return d >= s && d <= e;
};

const DateRangePicker = ({ startDate, endDate, onApply, onClose }: { startDate: Date, endDate: Date, onApply: (s: Date, e: Date) => void, onClose: () => void }) => {
    const [localStart, setLocalStart] = useState<Date>(startDate);
    const [localEnd, setLocalEnd] = useState<Date>(endDate);
    const [viewDate, setViewDate] = useState<Date>(new Date(endDate)); // Controls the month shown in right calendar
    const [hoverDate, setHoverDate] = useState<Date | null>(null);

    // Helpers
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const presets = [
        { label: 'Today', getValue: () => [new Date(), new Date()] },
        { label: 'Yesterday', getValue: () => { const d = new Date(); d.setDate(d.getDate() - 1); return [d, d]; } },
        { label: 'Last 7 days', getValue: () => { const d = new Date(); d.setDate(d.getDate() - 6); return [d, new Date()]; } },
        { label: 'Last 30 days', getValue: () => { const d = new Date(); d.setDate(d.getDate() - 29); return [d, new Date()]; } },
        { label: 'This Month', getValue: () => { const now = new Date(); return [new Date(now.getFullYear(), now.getMonth(), 1), new Date()]; } },
        { label: 'Last Month', getValue: () => { const now = new Date(); return [new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 0)]; } },
    ];

    const handleDateClick = (date: Date) => {
        if (!localStart || (localStart && localEnd) || date < localStart) {
            setLocalStart(date);
            setLocalEnd(null as any);
        } else {
            setLocalEnd(date);
        }
    };

    const handlePresetClick = (getRange: () => Date[]) => {
        const [start, end] = getRange();
        setLocalStart(start);
        setLocalEnd(end);
        setViewDate(new Date(end)); // Move view to end date
    };

    const renderCalendar = (baseDate: Date) => {
        const year = baseDate.getFullYear();
        const month = baseDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const startDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Padding
        for (let i = 0; i < startDay; i++) days.push(null);
        // Days
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

        return (
            <div className="w-64">
                <div className="text-center font-bold text-gray-900 dark:text-white mb-4 text-sm">
                    {baseDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-7 gap-y-1 gap-x-0 text-center mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <div key={d} className="text-[10px] font-bold text-gray-400 uppercase">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1 gap-x-0">
                    {days.map((date, i) => {
                        if (!date) return <div key={i}></div>;
                        
                        const isStart = localStart && isSameDay(date, localStart);
                        const isEnd = localEnd && isSameDay(date, localEnd);
                        const inRange = isDateInRange(date, localStart, localEnd || hoverDate);
                        
                        // Styling Logic
                        let cellClass = "relative h-8 w-full flex items-center justify-center text-xs cursor-pointer transition-all z-10 ";
                        let bgClass = "";
                        let textClass = "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full";

                        if (inRange && !isStart && !isEnd) {
                            bgClass = "bg-orange-50 dark:bg-orange-900/30";
                            textClass = "text-gray-900 dark:text-gray-100";
                        }
                        
                        if (isStart || isEnd) {
                            textClass = "bg-[#f97316] text-white font-bold rounded-full shadow-md z-20";
                            bgClass = inRange ? (isStart ? "bg-gradient-to-r from-transparent to-orange-50 dark:to-orange-900/30" : "bg-gradient-to-l from-transparent to-orange-50 dark:to-orange-900/30") : "";
                        }

                        // Specific adjustment for single day selection or start=end
                        if (isStart && isEnd) {
                             bgClass = ""; // No range background needed
                        }

                        return (
                            <div 
                                key={i} 
                                className={`relative p-0 ${bgClass}`}
                                onMouseEnter={() => setHoverDate(date)}
                            >
                                <button 
                                    onClick={() => handleDateClick(date)}
                                    className={`${cellClass} ${textClass}`}
                                >
                                    {date.getDate()}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="absolute top-full right-0 mt-2 z-50 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#333] rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden w-auto animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
            {/* Sidebar Presets */}
            <div className="w-48 bg-gray-50/50 dark:bg-[#202023] border-r border-gray-200 dark:border-[#333] p-2 flex flex-col gap-1">
                {presets.map((preset) => (
                    <button
                        key={preset.label}
                        onClick={() => handlePresetClick(preset.getValue)}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5 hover:text-black dark:hover:text-white rounded-lg transition-colors"
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            <div className="flex flex-col">
                <div className="flex p-6 gap-8">
                    <button 
                        onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                        className="absolute left-52 top-6 p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    {renderCalendar(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                    {renderCalendar(viewDate)}
                    <button 
                        onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                        className="absolute right-6 top-6 p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
                
                <div className="border-t border-gray-200 dark:border-[#333] p-4 flex justify-end gap-3 items-center bg-gray-50/30 dark:bg-black/20">
                    <div className="text-xs text-gray-500 mr-auto font-mono">
                        {localStart?.toLocaleDateString()} - {localEnd?.toLocaleDateString()}
                    </div>
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => { onApply(localStart, localEnd || localStart); onClose(); }}
                        disabled={!localStart}
                        className="px-4 py-2 rounded-lg bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

const AnalyticsPage = () => {
  const { settings, theme, checkouts } = useContext(AppContext);
  const [viewMode, setViewMode] = useState<'overview' | 'live'>('overview');
  
  // Date Range State
  const [dateRange, setDateRange] = useState<{ start: Date, end: Date }>({
      start: new Date(new Date().setDate(new Date().getDate() - 30)),
      end: new Date()
  });

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [aggregatedData, setAggregatedData] = useState<any>(null);
  
  // Date Picker Visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const currencySymbol = settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : 'MAD ';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch Real Data from Backend
  useEffect(() => {
      const fetchData = async () => {
          setLoading(true);
          try {
              const res = await fetch(`${API_URL}/api/orders`);
              if (res.ok) {
                  const data = await res.json();
                  setOrders(Array.isArray(data) ? [...data].reverse() : []);
              }
          } catch (e) {
              console.error("Failed to fetch orders, using context checkouts where possible.");
          } finally {
              setLoading(false);
          }
      };
      fetchData();
      
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
  }, []);

  // Process Data based on Range
  useEffect(() => {
      if (!orders) return;

      // Filter orders by date range
      const filteredOrders = orders.filter(o => {
          const d = new Date(o.date);
          // Normalize dates to remove time component for accurate comparison
          const orderDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const start = new Date(dateRange.start.getFullYear(), dateRange.start.getMonth(), dateRange.start.getDate());
          const end = new Date(dateRange.end.getFullYear(), dateRange.end.getMonth(), dateRange.end.getDate());
          return orderDate >= start && orderDate <= end;
      });
      
      const totalRevenue = filteredOrders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);
      const totalOrders = filteredOrders.length;
      const uniqueCustomers = new Set(filteredOrders.map(o => o.customerEmail)).size;
      const totalVisitsContext = checkouts.reduce((sum, c) => sum + (c.visits || 0), 0);
      
      const chartMap = new Map();
      const diffTime = Math.abs(dateRange.end.getTime() - dateRange.start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      const isHourly = diffDays <= 1; // If range is 1 day or less, show hourly
      
      if (isHourly) {
          // Fill 24 hours
          const baseDate = new Date(dateRange.start);
          baseDate.setHours(0,0,0,0);
          for(let i=0; i<24; i++) {
              const key = i + ':00';
              chartMap.set(key, 0);
          }
      } else {
          // Fill days
          for(let i=0; i<=diffDays; i++) {
              const d = new Date(dateRange.start);
              d.setDate(d.getDate() + i);
              const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              chartMap.set(key, 0);
          }
      }

      filteredOrders.forEach(o => {
          const d = new Date(o.date);
          let key;
          if (isHourly) {
              key = d.getHours() + ':00';
          } else {
              key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
          if (chartMap.has(key)) {
              chartMap.set(key, chartMap.get(key) + parseFloat(o.amount || 0));
          }
      });

      const chartData = Array.from(chartMap.entries()).map(([name, revenue]) => ({ name, revenue }));

      setAggregatedData({
          revenue: totalRevenue,
          orders: totalOrders,
          customers: uniqueCustomers,
          conversion: totalVisitsContext > 0 ? (totalOrders / totalVisitsContext * 100) : 0,
          chartData
      });

  }, [orders, checkouts, dateRange]);

  const liveLocations = useMemo(() => {
      const recent = orders.slice(0, 20);
      const locs = recent.map(o => {
          if (o.customerCountry === 'Morocco' || o.customerCountry === 'MA') return 'Casablanca';
          if (o.customerCountry === 'United States' || o.customerCountry === 'US') return 'New York';
          if (o.customerCountry === 'France' || o.customerCountry === 'FR') return 'Paris';
          if (o.customerCountry === 'United Kingdom' || o.customerCountry === 'GB') return 'London';
          return 'New York';
      });
      return [...new Set(locs)];
  }, [orders]);

  const recentSales = orders.slice(0, 10);

  const colors = {
      primary: '#f97316',
      grid: theme === 'dark' ? '#27272a' : '#f3f4f6',
      text: theme === 'dark' ? '#71717a' : '#9ca3af',
      tooltipBg: theme === 'dark' ? '#18181b' : '#ffffff',
      tooltipBorder: theme === 'dark' ? '#27272a' : '#e5e7eb',
  };

  const formatDateRangeLabel = (start: Date, end: Date) => {
      if (isSameDay(start, end)) {
          if (isSameDay(start, new Date())) return "Today";
          return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in font-sans pb-12 p-4 md:p-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Analytics</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Track your store performance and real-time visitor activity.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto bg-white dark:bg-[#09090b] p-1.5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-full sm:w-auto">
                  <button 
                      onClick={() => setViewMode('overview')}
                      className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'overview' ? 'bg-white dark:bg-[#09090b] text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                      Overview
                  </button>
                  <button 
                      onClick={() => setViewMode('live')}
                      className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${viewMode === 'live' ? 'bg-white dark:bg-[#09090b] text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Live View
                  </button>
              </div>

              {/* Date Picker Custom Component */}
              <div className={`relative group w-full sm:w-auto transition-opacity duration-300 ${viewMode === 'live' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`} ref={datePickerRef}>
                  <button 
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      disabled={viewMode === 'live'}
                      className={`flex items-center justify-between w-full sm:w-56 pl-3 pr-3 py-2.5 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50`}
                  >
                      <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span>{formatDateRangeLabel(dateRange.start, dateRange.end)}</span>
                      </div>
                      <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {showDatePicker && (
                      <DateRangePicker 
                          startDate={dateRange.start}
                          endDate={dateRange.end}
                          onApply={(s, e) => setDateRange({ start: s, end: e })}
                          onClose={() => setShowDatePicker(false)} 
                      />
                  )}
              </div>

              <button 
                  onClick={() => setDateRange({...dateRange})} 
                  disabled={loading}
                  className="hidden sm:flex p-2.5 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95 disabled:opacity-50"
                  title="Refresh Data"
              >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
          </div>
      </div>

      {viewMode === 'live' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* Left: 3D Globe & Stats Overlay */}
                  <div className="xl:col-span-2 space-y-6">
                      <div className="relative h-[600px] bg-[#050505] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl flex flex-col group ring-1 ring-white/5">
                          <div className="absolute top-0 left-0 right-0 p-8 z-10 flex justify-between items-start pointer-events-none">
                              <div>
                                  <div className="flex items-center gap-2 mb-2 bg-black/40 backdrop-blur-md w-fit px-3 py-1 rounded-full border border-white/10">
                                      <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                      </span>
                                      <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Active Now</span>
                                  </div>
                                  <h2 className="text-7xl font-black text-white tracking-tighter tabular-nums transition-all drop-shadow-2xl">
                                      {orders.length > 0 ? '1' : '0'}
                                  </h2>
                                  <p className="text-base text-gray-400 font-medium">real-time visitors</p>
                              </div>
                          </div>

                          <div className="absolute inset-0 cursor-move">
                              <Globe3D locations={liveLocations} />
                          </div>
                          
                          <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent via-transparent to-[#050505]/80"></div>

                          {/* Live Event Feed based on Recent Orders */}
                          <div className="absolute bottom-8 left-8 right-8 pointer-events-none flex flex-col gap-3 items-start">
                              {recentSales.slice(0, 3).map((order, idx) => (
                                  <div 
                                    key={order.id} 
                                    style={{ opacity: 1 - idx * 0.15, transform: `scale(${1 - idx * 0.05}) translateY(${idx * 5}px)` }}
                                    className="bg-black/60 backdrop-blur-xl text-white text-xs font-medium px-4 py-3 rounded-2xl border border-white/10 shadow-xl animate-in slide-in-from-left-4 fade-in duration-500 max-w-sm flex items-center gap-3 transition-all"
                                  >
                                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                                          <DollarSign size={14} />
                                      </div>
                                      <div>
                                          <p className="leading-tight">Order from {order.customerName || 'Guest'} in {order.customerCountry}</p>
                                          <p className="text-[10px] text-gray-500 mt-0.5">{new Date(order.date).toLocaleDateString()}</p>
                                      </div>
                                  </div>
                              ))}
                              {recentSales.length === 0 && <div className="text-gray-500 text-xs italic">Waiting for live events...</div>}
                          </div>
                      </div>
                  </div>

                  {/* Right: Breakdown Panels */}
                  <div className="space-y-6">
                      <Card className="min-h-0">
                          <div className="flex items-center gap-2 mb-6">
                              <div className="p-1.5 bg-orange-50 dark:bg-orange-900/20 text-[#f97316] rounded-lg"><Zap size={16} /></div>
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Top Active Pages</h3>
                          </div>
                          <div className="space-y-5">
                              {checkouts.slice(0, 4).map((page, i) => (
                                  <div key={page.id} className="group">
                                      <div className="flex justify-between text-xs font-medium mb-2">
                                          <span className="text-gray-700 dark:text-gray-300 truncate max-w-[180px] font-mono flex items-center gap-2">
                                              <span className="text-[10px] text-gray-400 w-4">{i+1}</span>
                                              /{page.name.toLowerCase().replace(/\s+/g, '-')}
                                          </span>
                                          <span className="text-gray-900 dark:text-white font-bold">{page.visits}</span>
                                      </div>
                                      <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                          <div className="h-full bg-[#f97316] transition-all duration-500 rounded-full" style={{width: `${Math.min(100, page.visits * 5)}%`}}></div>
                                      </div>
                                  </div>
                              ))}
                              {checkouts.length === 0 && <p className="text-xs text-gray-500">No active pages yet.</p>}
                          </div>
                      </Card>

                      <Card>
                          <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg"><Monitor size={16} /></div>
                                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Device Type</h3>
                              </div>
                          </div>
                          
                          <div className="flex h-3 w-full rounded-full overflow-hidden mb-6 bg-gray-100 dark:bg-white/5">
                              <div className="bg-[#f97316]" style={{ width: '65%' }}></div>
                              <div className="bg-blue-500" style={{ width: '30%' }}></div>
                              <div className="bg-purple-500" style={{ width: '5%' }}></div>
                          </div>

                          <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-[#f97316]"></div>
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Mobile</span>
                                  </div>
                                  <span className="text-sm font-bold text-gray-900 dark:text-white">65%</span>
                              </div>
                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Desktop</span>
                                  </div>
                                  <span className="text-sm font-bold text-gray-900 dark:text-white">30%</span>
                              </div>
                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Tablet</span>
                                  </div>
                                  <span className="text-sm font-bold text-gray-900 dark:text-white">5%</span>
                              </div>
                          </div>
                      </Card>
                  </div>
              </div>
          </div>
      ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* Overview Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <Card className="transform transition-all hover:translate-y-[-2px] hover:shadow-md">
                      <MetricItem 
                          label="Total Revenue" 
                          value={loading ? '-' : aggregatedData?.revenue.toFixed(2)} 
                          prefix={currencySymbol}
                          trend={12.5} 
                          icon={DollarSign} 
                      />
                  </Card>
                  <Card className="transform transition-all hover:translate-y-[-2px] hover:shadow-md">
                      <MetricItem 
                          label="Total Orders" 
                          value={loading ? '-' : aggregatedData?.orders} 
                          trend={8.2} 
                          icon={ShoppingCart} 
                      />
                  </Card>
                  <Card className="transform transition-all hover:translate-y-[-2px] hover:shadow-md">
                      <MetricItem 
                          label="Unique Customers" 
                          value={loading ? '-' : aggregatedData?.customers} 
                          trend={5.4} 
                          icon={User} 
                      />
                  </Card>
                  <Card className="transform transition-all hover:translate-y-[-2px] hover:shadow-md">
                      <MetricItem 
                          label="Avg. Conversion" 
                          value={loading ? '-' : aggregatedData?.conversion.toFixed(2)} 
                          suffix="%"
                          trend={-1.1} 
                          icon={Activity} 
                      />
                  </Card>
              </div>

              {/* Revenue Chart */}
              <Card className="h-[450px]">
                  <div className="flex justify-between items-center mb-8">
                      <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Performance</h3>
                          <p className="text-sm text-gray-500 mt-0.5">Gross sales volume over selected period ({formatDateRangeLabel(dateRange.start, dateRange.end)})</p>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">
                              <div className="w-2 h-2 rounded-full bg-[#f97316]"></div> Revenue
                          </span>
                      </div>
                  </div>
                  <div className="flex-1 w-full min-h-0 -ml-2">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={aggregatedData?.chartData || []}>
                              <defs>
                                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                              <XAxis 
                                  dataKey="name" 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{fill: colors.text, fontSize: 11, fontFamily: 'monospace', fontWeight: 500}} 
                                  dy={15} 
                                  interval={0}
                              />
                              <YAxis 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{fill: colors.text, fontSize: 11, fontFamily: 'monospace', fontWeight: 500}} 
                                  tickFormatter={(value) => `${value}`}
                                  dx={-10}
                              />
                              <Tooltip 
                                  contentStyle={{ 
                                      backgroundColor: colors.tooltipBg, 
                                      borderColor: colors.tooltipBorder,
                                      borderRadius: '12px',
                                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                      color: colors.text,
                                      padding: '12px'
                                  }}
                                  itemStyle={{ color: colors.primary, fontWeight: 700, fontSize: '13px' }}
                                  labelStyle={{ color: colors.text, fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}
                                  formatter={(value: any) => [`${currencySymbol}${value}`, 'Revenue']}
                              />
                              <Area 
                                  type="monotone" 
                                  dataKey="revenue" 
                                  stroke={colors.primary} 
                                  strokeWidth={3} 
                                  fillOpacity={1} 
                                  fill="url(#colorRevenue)" 
                                  activeDot={{ r: 6, strokeWidth: 0, fill: colors.primary }}
                              />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </Card>

              {/* Bottom Row: Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Sales Feed */}
                  <Card className="h-[400px]" noPadding>
                      <div className="p-5 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] flex justify-between items-center">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide flex items-center gap-2">
                              <ShoppingBag size={16} className="text-gray-400" /> Recent Sales
                          </h3>
                      </div>
                      <div className="flex-1 overflow-auto p-0 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10">
                          <table className="w-full text-left text-sm">
                              <thead className="bg-gray-50 dark:bg-white/5 sticky top-0 z-10 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-white/5">
                                  <tr>
                                      <th className="px-6 py-3">Customer</th>
                                      <th className="px-6 py-3 text-right">Amount</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                  {recentSales.map((sale: any, i: number) => (
                                      <tr key={i} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                          <td className="px-6 py-4">
                                              <div className="flex items-center gap-3">
                                                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 shrink-0 border border-gray-200 dark:border-white/10">
                                                      {(sale.customerName || 'G').charAt(0)}
                                                  </div>
                                                  <div className="min-w-0">
                                                      <div className="text-gray-900 dark:text-white font-bold text-xs truncate max-w-[140px]">{sale.customerName || 'Guest'}</div>
                                                      <div className="text-[10px] text-gray-500 truncate max-w-[140px]">{sale.customerEmail}</div>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                              <div className="font-mono font-bold text-gray-900 dark:text-white">{currencySymbol}{parseFloat(sale.amount).toFixed(2)}</div>
                                              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Paid</div>
                                          </td>
                                      </tr>
                                  ))}
                                  {recentSales.length === 0 && (
                                      <tr><td colSpan={2} className="px-6 py-12 text-center text-gray-500">No recent sales.</td></tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </Card>

                  {/* Traffic Sources & Info */}
                  <Card className="h-[400px]">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide flex items-center gap-2">
                              <Eye size={16} className="text-gray-400" /> Traffic Sources
                          </h3>
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center">
                          {/* Traffic Source Bars */}
                          <div className="space-y-6">
                              {[ {name: 'Direct', value: 70}, {name: 'Social', value: 25}, {name: 'Search', value: 5} ].map((source: any, i: number) => (
                                  <div key={i}>
                                      <div className="flex justify-between text-sm font-medium mb-2">
                                          <span className="text-gray-700 dark:text-gray-300">{source.name}</span>
                                          <span className="text-gray-900 dark:text-white font-bold">{source.value}%</span>
                                      </div>
                                      <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                                          <div 
                                              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                                  i === 0 ? 'bg-[#f97316]' : i === 1 ? 'bg-blue-500' : 'bg-emerald-500'
                                              }`} 
                                              style={{width: `${source.value}%`}}
                                          ></div>
                                      </div>
                                  </div>
                              ))}
                          </div>

                          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 grid grid-cols-2 gap-4">
                              <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Avg. Order Value</div>
                                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                                      {currencySymbol}{aggregatedData?.orders > 0 ? (aggregatedData.revenue / aggregatedData.orders).toFixed(2) : '0.00'}
                                  </div>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-center">
                                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Returning Rate</div>
                                  <div className="text-xl font-bold text-gray-900 dark:text-white">18.4%</div>
                              </div>
                          </div>
                      </div>
                  </Card>

              </div>
          </div>
      )}

    </div>
  );
};

export default AnalyticsPage;
