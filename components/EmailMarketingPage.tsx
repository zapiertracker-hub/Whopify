import React from 'react';
import { Mail, Send, Users, BarChart2, Plus, ArrowUpRight } from 'lucide-react';

const StatCard = ({ label, value, trend }: any) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm dark:shadow-none">
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <div className="flex items-end justify-between">
       <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
       <span className="text-xs text-green-600 dark:text-green-400 flex items-center bg-green-100 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
          <ArrowUpRight size={12} className="mr-1" /> {trend}
       </span>
    </div>
  </div>
);

const EmailMarketingPage = () => {
  const campaigns = [
    { id: 1, name: 'October Newsletter', status: 'Sent', sent: '2,450', openRate: '45.2%', clickRate: '12.8%', date: 'Oct 24, 2023' },
    { id: 2, name: 'Black Friday Teaser', status: 'Scheduled', sent: '-', openRate: '-', clickRate: '-', date: 'Nov 01, 2023' },
    { id: 3, name: 'Welcome Sequence', status: 'Active (Auto)', sent: '854', openRate: '68.5%', clickRate: '24.1%', date: 'Ongoing' },
    { id: 4, name: 'Cart Abandonment', status: 'Active (Auto)', sent: '120', openRate: '52.0%', clickRate: '18.5%', date: 'Ongoing' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Marketing</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Engage your audience with newsletters and automated flows.</p>
        </div>
        <button className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white dark:text-black rounded-lg flex items-center gap-2 shadow-lg shadow-[#f97316]/20 font-bold">
           <Plus size={18} /> New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatCard label="Total Subscribers" value="4,250" trend="+12%" />
         <StatCard label="Avg. Open Rate" value="42.8%" trend="+5%" />
         <StatCard label="Avg. Click Rate" value="15.2%" trend="+2.4%" />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm dark:shadow-lg">
         <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white">Recent Campaigns</h3>
            <button className="text-sm text-[#f97316] hover:text-orange-600 dark:hover:text-brand-300 font-medium">View All</button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-gray-50 dark:bg-gray-950/50 text-xs text-gray-500 dark:text-gray-400 uppercase">
                  <tr>
                     <th className="px-6 py-3 font-medium">Campaign</th>
                     <th className="px-6 py-3 font-medium">Status</th>
                     <th className="px-6 py-3 font-medium">Recipients</th>
                     <th className="px-6 py-3 font-medium">Open Rate</th>
                     <th className="px-6 py-3 font-medium">Click Rate</th>
                     <th className="px-6 py-3 font-medium text-right">Date</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {campaigns.map(c => (
                     <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-brand-400">
                                 <Mail size={16} />
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">{c.name}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${c.status === 'Sent' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : c.status === 'Scheduled' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800'}`}>
                              {c.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">{c.sent}</td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white text-sm font-medium">{c.openRate}</td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white text-sm font-medium">{c.clickRate}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm text-right">{c.date}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default EmailMarketingPage;