import React from 'react';
import { Users, DollarSign, Link as LinkIcon, Copy, Settings } from 'lucide-react';

const AffiliatesPage = () => {
  const affiliates = [
    { id: 1, name: 'Michael Scott', referrals: 45, earned: '$1,250.00', status: 'active', link: 'milek.io/ref/mscott' },
    { id: 2, name: 'Dwight Schrute', referrals: 128, earned: '$3,840.00', status: 'active', link: 'milek.io/ref/beets' },
    { id: 3, name: 'Jim Halpert', referrals: 12, earned: '$320.00', status: 'pending', link: 'milek.io/ref/bigtuna' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Affiliate Program</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage partners promoting your products.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:text-white flex items-center gap-2 shadow-sm">
              <Settings size={18} /> Settings
           </button>
           <button className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white dark:text-black rounded-lg flex items-center gap-2 shadow-lg shadow-[#f97316]/20 font-bold">
              <Users size={18} /> Invite Affiliate
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-gradient-to-br from-orange-100 to-white dark:from-brand-900/40 dark:to-gray-900 border border-orange-200 dark:border-brand-500/20 rounded-xl p-6 relative overflow-hidden shadow-sm">
             <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 text-orange-600 dark:text-white">
                <Users size={120} />
             </div>
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Total Affiliates</h3>
             <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">154</p>
             <p className="text-orange-600 dark:text-brand-400 text-sm font-medium">+12 this month</p>
         </div>
         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Total Commissions Paid</h3>
             <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">$12,450.00</p>
             <p className="text-gray-500 dark:text-gray-400 text-sm">Last payout: Oct 01, 2023</p>
         </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm dark:shadow-lg">
         <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white">Top Performing Affiliates</h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-gray-50 dark:bg-gray-950/50 text-xs text-gray-500 dark:text-gray-400 uppercase">
                  <tr>
                     <th className="px-6 py-3 font-medium">Affiliate</th>
                     <th className="px-6 py-3 font-medium">Referrals</th>
                     <th className="px-6 py-3 font-medium">Total Earned</th>
                     <th className="px-6 py-3 font-medium">Status</th>
                     <th className="px-6 py-3 font-medium text-right">Referral Link</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {affiliates.map(a => (
                     <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                           <div className="font-medium text-gray-900 dark:text-white">{a.name}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{a.referrals} sales</td>
                        <td className="px-6 py-4 text-green-600 dark:text-green-400 font-medium">{a.earned}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${a.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'}`}>
                              {a.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="truncate max-w-[150px] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{a.link}</span>
                              <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><Copy size={14} /></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default AffiliatesPage;