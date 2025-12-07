
import React, { useState, useContext } from 'react';
import { FileText, Download, Settings, Save, Printer, Search } from 'lucide-react';
import { AppContext } from '../AppContext';

const InvoicesPage = () => {
  const { settings } = useContext(AppContext);
  const [taxId, setTaxId] = useState('');
  const [invoiceFooter, setInvoiceFooter] = useState('');
  const [search, setSearch] = useState('');

  // Mock Invoice Data
  const invoices = [
    { id: 'INV-2023-001', orderId: '#ORD-8842', date: 'Oct 24, 2023', customer: 'Alex M.', location: 'New York, USA', amount: 49.99, status: 'Paid' },
    { id: 'INV-2023-002', orderId: '#ORD-8843', date: 'Oct 24, 2023', customer: 'Sarah K.', location: 'London, UK', amount: 29.00, status: 'Paid' },
    { id: 'INV-2023-003', orderId: '#ORD-8844', date: 'Oct 23, 2023', customer: 'Michael B.', location: 'Toronto, CA', amount: 99.00, status: 'Paid' },
    { id: 'INV-2023-004', orderId: '#ORD-8845', date: 'Oct 23, 2023', customer: 'Emma W.', location: 'Paris, FR', amount: 19.99, status: 'Refunded' },
    { id: 'INV-2023-005', orderId: '#ORD-8846', date: 'Oct 22, 2023', customer: 'David R.', location: 'Berlin, DE', amount: 149.00, status: 'Paid' },
  ];

  const filteredInvoices = invoices.filter(inv => 
    inv.id.toLowerCase().includes(search.toLowerCase()) || 
    inv.customer.toLowerCase().includes(search.toLowerCase()) ||
    inv.orderId.toLowerCase().includes(search.toLowerCase())
  );

  const currencySymbol = settings.currency === 'EUR' ? '€' : settings.currency === 'MAD' ? 'DH' : '$';

  const handleDownload = (id: string) => {
      // In a real app, this would generate a PDF blob and trigger download
      alert(`Downloading invoice ${id} with branding and tax info...`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices & Receipts</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Auto-generate and manage customer invoices.</p>
            </div>
            <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2">
                <Settings size={16} /> Configure Template
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Card */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-[#f97316]" /> Invoice Settings
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Tax ID / VAT Number</label>
                            <input 
                                type="text" 
                                value={taxId}
                                onChange={(e) => setTaxId(e.target.value)}
                                placeholder="e.g. US-123456789"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-[#f97316]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Footer Text</label>
                            <textarea 
                                value={invoiceFooter}
                                onChange={(e) => setInvoiceFooter(e.target.value)}
                                placeholder="Thank you for your business!"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-[#f97316] h-20 resize-none"
                            />
                        </div>
                        <div className="pt-2">
                            <button className="w-full py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                                <Save size={14} /> Save Settings
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/5 border border-orange-200 dark:border-orange-500/20 rounded-xl p-6">
                    <h4 className="font-bold text-orange-800 dark:text-orange-200 text-sm mb-2">Branding Preview</h4>
                    <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
                        Invoices will use your store logo and theme color automatically. Ensure your logo is uploaded in Store Settings.
                    </p>
                </div>
            </div>

            {/* Invoices List */}
            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center gap-4">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search invoices..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-lg text-sm outline-none focus:border-[#f97316]"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"><Printer size={18} /></button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-white/5 text-xs text-gray-500 font-bold uppercase">
                                <tr>
                                    <th className="px-4 py-3">Invoice</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                            {inv.id}
                                            <span className="block text-[10px] text-gray-400 font-normal">{inv.orderId}</span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{inv.date}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-gray-900 dark:text-white font-medium">{inv.customer}</div>
                                            <div className="text-xs text-gray-500">{inv.location}</div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-gray-900 dark:text-white">{currencySymbol}{inv.amount.toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${inv.status === 'Paid' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button 
                                                onClick={() => handleDownload(inv.id)}
                                                className="p-1.5 text-[#f97316] hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md transition-colors"
                                                title="Download PDF"
                                            >
                                                <Download size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default InvoicesPage;
