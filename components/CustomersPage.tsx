import React, { useState, useEffect } from 'react';
import { Search, Mail, MapPin, UserPlus, MoreVertical, RefreshCw } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

const CustomersPage = () => {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const generateMockCustomers = () => {
      return [
          { id: '1', name: 'Alex Johnson', email: 'alex@example.com', location: 'New York, US', orders: 5, spent: '$245.00', lastActive: '2 days ago' },
          { id: 2, name: 'Sarah Connor', email: 'sarah@example.com', location: 'London, UK', orders: 2, spent: '$89.00', lastActive: '1 week ago' },
          { id: 3, name: 'Mike Ross', email: 'mike@example.com', location: 'Toronto, CA', orders: 12, spent: '$1,205.00', lastActive: 'Yesterday' },
          { id: 4, name: 'Jessica Pearson', email: 'jessica@example.com', location: 'Chicago, US', orders: 8, spent: '$850.50', lastActive: '3 days ago' }
      ];
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/api/customers`);
        if (res.ok) {
            const data = await res.json();
            setCustomers(data);
        } else {
            throw new Error("Failed to fetch");
        }
    } catch (e) {
        setCustomers(generateMockCustomers());
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your customer relationships and data.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchCustomers} className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white dark:text-black rounded-lg flex items-center gap-2 shadow-lg shadow-[#f97316]/20 font-bold">
                <UserPlus size={18} /> Add Customer
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm dark:shadow-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative w-full md:w-96">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
             <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-brand-500 focus:border-brand-500 focus:outline-none focus:border-[#f97316]" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
               <tr>
                 <th className="px-6 py-4 font-medium">Customer</th>
                 <th className="px-6 py-4 font-medium">Location</th>
                 <th className="px-6 py-4 font-medium">Orders</th>
                 <th className="px-6 py-4 font-medium">Total Spent</th>
                 <th className="px-6 py-4 font-medium">Last Active</th>
                 <th className="px-6 py-4 font-medium text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
               {filteredCustomers.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                       {loading ? 'Loading customers...' : 'No customers found matching your search.'}
                   </td></tr>
               ) : (
                   filteredCustomers.map((c) => (
                       <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                           <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                       {c.name.charAt(0)}
                                   </div>
                                   <div>
                                       <div className="font-medium text-gray-900 dark:text-white text-sm">{c.name}</div>
                                       <div className="text-xs text-gray-500">{c.email}</div>
                                   </div>
                               </div>
                           </td>
                           <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                               <MapPin size={14} className="text-gray-400" /> {c.location}
                           </td>
                           <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{c.orders}</td>
                           <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white font-mono">{c.spent}</td>
                           <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{c.lastActive}</td>
                           <td className="px-6 py-4 text-right">
                               <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                   <MoreVertical size={16} />
                                </button>
                           </td>
                       </tr>
                   ))
               )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;