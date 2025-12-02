import React from 'react';
import { Tag, Plus, Clock, Copy, Trash2, CheckCircle2 } from 'lucide-react';

const DiscountsPage = () => {
  const discounts = [
    { id: 1, code: 'SUMMER2024', type: 'Percentage', value: '20% OFF', usage: '45/100', status: 'active', expiry: 'Oct 30, 2024' },
    { id: 2, code: 'WELCOME10', type: 'Fixed Amount', value: '$10.00 OFF', usage: '128/∞', status: 'active', expiry: 'Never' },
    { id: 3, code: 'FLASH50', type: 'Percentage', value: '50% OFF', usage: '10/10', status: 'expired', expiry: 'Sep 15, 2023' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discounts</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Create coupons and promotional codes.</p>
        </div>
        <button className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white dark:text-black rounded-lg flex items-center gap-2 shadow-lg shadow-[#f97316]/20 font-bold">
           <Plus size={18} /> Create Discount
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {discounts.map(discount => (
           <div key={discount.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 relative group hover:border-gray-300 dark:hover:border-brand-500/50 transition-all shadow-sm dark:shadow-none hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-50 dark:bg-brand-900/20 rounded-lg text-orange-600 dark:text-brand-400">
                       <Tag size={24} />
                    </div>
                    <div>
                       <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-wide">{discount.code}</h3>
                       <p className="text-xs text-gray-500 dark:text-gray-400">{discount.type}</p>
                    </div>
                 </div>
                 <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${discount.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                    {discount.status}
                 </span>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Discount Value</span>
                    <span className="font-bold text-gray-900 dark:text-white">{discount.value}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Usage Limits</span>
                    <span className="text-gray-700 dark:text-gray-300">{discount.usage}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Expires</span>
                    <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                       <Clock size={12} /> {discount.expiry}
                    </span>
                 </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                 <button className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                    <Copy size={14} /> Copy Code
                 </button>
                 <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 transition-colors">
                    <Trash2 size={16} />
                 </button>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default DiscountsPage;