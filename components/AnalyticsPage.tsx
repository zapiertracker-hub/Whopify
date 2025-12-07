
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

type DateRange = '24h' | '7d' | '30d' | '90d';

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
           <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${isPositive ? 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'text-rose-700 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-500/10 dark:border-