
import React, { useState, useContext, useEffect } from 'react';
import { Search, Download, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { AppContext } from '../AppContext';
import { useSearchParams } from 'react-router-dom';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

const OrdersPage = () => {
  const { ghostMode } = useContext(AppContext);
  const [filter, setFilter] = useState('all');
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Update search if URL changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
        setSearch(q);
    }
  }, [searchParams]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/api/orders`);
        if (res.ok) {
            const data = await res.json();
            setOrders(data);
        } else {
            throw new Error("Failed to fetch");
        }
    } catch (e) {
        // Fallback to empty state
        setOrders([]);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Live refresh slower poll
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = orders.filter(order => {
    // Handling safe access if order structure varies slightly
    const customerName = order.customer?.name || order.customer || 'Guest';
    const orderId = order.id || '';
    const matchesSearch = customerName.toLowerCase().includes(search.toLowerCase()) || orderId.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || order.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'succeeded': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'failed': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'succeeded': return <CheckCircle size={14} className="mr-1.5" />;
      case 'pending': return <Clock size={14} className="mr-1.5" />;
      case 'failed': return <XCircle size={14} className="mr-1.5" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">View and manage your store transactions.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={fetchOrders} className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors">
             <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
           </button>
           <button className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white flex items-center gap-2 transition-colors shadow-sm">
              <Download size={18} /> Export
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm dark:shadow-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
            {['all', 'succeeded', 'pending', 'failed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize whitespace-nowrap transition-all ${filter === f ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
             <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-brand-500 focus:border-brand-500 focus:outline-none focus:border-[#f97316]" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">{loading ? 'Loading orders...' : 'No orders found.'}</td></tr>
              ) : (
                filteredOrders.map((order) => {
                    const customerName = typeof order.customer === 'object' ? order.customer.name : order.customer;
                    return (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white font-mono">{order.id.substring(0, 12)}...</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-brand-900/50 text-orange-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold">{customerName.charAt(0).toUpperCase()}</div>
                                {customerName}
                            </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{order.date}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{order.amount} {order.currency.toUpperCase()}</td>
                            <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)} capitalize`}>
                                {getStatusIcon(order.status)} {order.status}
                            </span>
                            </td>
                        </tr>
                    );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;