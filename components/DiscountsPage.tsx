
import React, { useContext, useState } from 'react';
import { Tag, Plus, Clock, Copy, Trash2, CheckCircle2, Edit2, X, Save, AlertCircle } from 'lucide-react';
import { AppContext } from '../AppContext';
import { Coupon } from '../types';

const DiscountsPage = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon, settings } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<number>(0);
  const [status, setStatus] = useState<'active' | 'expired' | 'disabled'>('active');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState<string>(''); // as string for input handling

  const openCreateModal = () => {
      setEditingCoupon(null);
      setCode('');
      setType('percentage');
      setValue(0);
      setStatus('active');
      setExpiryDate('');
      setUsageLimit('');
      setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
      setEditingCoupon(coupon);
      setCode(coupon.code);
      setType(coupon.type);
      setValue(coupon.value);
      setStatus(coupon.status);
      setExpiryDate(coupon.expiryDate || '');
      setUsageLimit(coupon.usageLimit ? coupon.usageLimit.toString() : '');
      setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!code.trim()) return alert("Code is required");
      if (value <= 0) return alert("Value must be positive");

      const couponData: Partial<Coupon> = {
          code: code.toUpperCase(),
          type,
          value,
          status,
          expiryDate: expiryDate || undefined,
          usageLimit: usageLimit ? parseInt(usageLimit) : undefined
      };

      if (editingCoupon) {
          updateCoupon(editingCoupon.id, couponData);
      } else {
          addCoupon({
              id: Date.now().toString(),
              usedCount: 0,
              ...couponData
          } as Coupon);
      }
      setIsModalOpen(false);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupons</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Create coupons and promotional codes.</p>
        </div>
        <button 
            onClick={openCreateModal}
            className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white dark:text-black rounded-lg flex items-center gap-2 shadow-lg shadow-[#f97316]/20 font-bold active:scale-95 transition-all"
        >
           <Plus size={18} /> Create Discount
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {coupons.length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-800">
                 No coupons found. Create your first discount!
             </div>
         )}
         {coupons.map(discount => (
           <div key={discount.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 relative group hover:border-gray-300 dark:hover:border-[#f97316]/50 transition-all shadow-sm dark:shadow-none hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-50 dark:bg-[#f97316]/10 rounded-lg text-orange-600 dark:text-[#f97316]">
                       <Tag size={24} />
                    </div>
                    <div>
                       <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-wide">{discount.code}</h3>
                       <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{discount.type}</p>
                    </div>
                 </div>
                 <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${discount.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                    {discount.status}
                 </span>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Discount Value</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                        {discount.type === 'percentage' ? `${discount.value}% OFF` : `${settings.currency === 'USD' ? '$' : ''}${discount.value} OFF`}
                    </span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Usage Limits</span>
                    <span className="text-gray-700 dark:text-gray-300">{discount.usedCount}/{discount.usageLimit || '∞'}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Expires</span>
                    <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                       <Clock size={12} /> {discount.expiryDate ? new Date(discount.expiryDate).toLocaleDateString() : 'Never'}
                    </span>
                 </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                 <button onClick={() => copyToClipboard(discount.code)} className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                    <Copy size={14} /> Copy Code
                 </button>
                 <button onClick={() => openEditModal(discount)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <Edit2 size={16} />
                 </button>
                 <button onClick={() => { if(confirm('Delete coupon?')) deleteCoupon(discount.id) }} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 transition-colors">
                    <Trash2 size={16} />
                 </button>
              </div>
           </div>
         ))}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Tag size={18} className="text-[#f97316]" /> {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                      </h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black dark:hover:text-white"><X size={20}/></button>
                  </div>
                  
                  <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Code</label>
                          <input 
                              type="text" 
                              value={code} 
                              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                              className="w-full px-4 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white font-bold outline-none focus:border-[#f97316]"
                              placeholder="SUMMER2024"
                              required
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Type</label>
                              <select 
                                  value={type} 
                                  onChange={(e) => setType(e.target.value as any)}
                                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white outline-none focus:border-[#f97316]"
                              >
                                  <option value="percentage">Percentage (%)</option>
                                  <option value="fixed">Fixed Amount</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Value</label>
                              <input 
                                  type="number" 
                                  value={value} 
                                  onChange={(e) => setValue(parseFloat(e.target.value))}
                                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white outline-none focus:border-[#f97316]"
                                  min="0"
                                  required
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Status</label>
                          <div className="flex gap-2">
                              {['active', 'expired', 'disabled'].map(s => (
                                  <button
                                      key={s}
                                      type="button"
                                      onClick={() => setStatus(s as any)}
                                      className={`flex-1 py-2 text-xs font-bold rounded-lg border capitalize transition-all ${status === s ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'bg-transparent border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300 dark:hover:border-gray-700'}`}
                                  >
                                      {s}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Limit (Optional)</label>
                              <input 
                                  type="number" 
                                  value={usageLimit} 
                                  onChange={(e) => setUsageLimit(e.target.value)}
                                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white outline-none focus:border-[#f97316]"
                                  placeholder="∞"
                                  min="1"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Expiry (Optional)</label>
                              <input 
                                  type="date" 
                                  value={expiryDate} 
                                  onChange={(e) => setExpiryDate(e.target.value)}
                                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white outline-none focus:border-[#f97316]"
                              />
                          </div>
                      </div>
                  </form>

                  <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
                      <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                      <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-[#f97316] text-white dark:text-black font-bold text-sm shadow-lg hover:bg-[#ea580c] transition-all active:scale-95 flex items-center justify-center gap-2">
                          <Save size={16} /> Save Coupon
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default DiscountsPage;