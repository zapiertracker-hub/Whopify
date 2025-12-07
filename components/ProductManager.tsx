
import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../AppContext';
import { 
  Plus, Search, Edit2, ExternalLink, 
  TrendingUp, X, Trash2, Edit, Check, Layout, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CheckoutPage } from '../types';

const ProductManager = () => {
  const { checkouts, addCheckout, deleteCheckout, updateCheckout, settings } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPageName, setNewPageName] = useState('');

  // Dropdown State
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // Modals State
  const [renameState, setRenameState] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' });
  const [deleteState, setDeleteState] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreate = () => {
    if (!newPageName) return;
    addCheckout(newPageName);
    setIsModalOpen(false);
    setNewPageName('');
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteState({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (deleteState.id) {
      deleteCheckout(deleteState.id);
      setDeleteState({ isOpen: false, id: null });
    }
  };

  const openRenameModal = (page: CheckoutPage, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenameState({ isOpen: true, id: page.id, name: page.name });
    setActiveMenu(null);
  };

  const handleRenameSave = () => {
    if (!renameState.name) return;
    updateCheckout(renameState.id, { name: renameState.name });
    setRenameState({ ...renameState, isOpen: false });
  };

  const handlePreview = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const isBlob = window.location.protocol === 'blob:';
    const url = isBlob ? `#/p/${id}` : `${window.location.href.split('#')[0]}#/p/${id}`;
    window.open(url, '_blank');
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  // Enhanced Gradients that adapt to light mode
  const getGradient = (id: string) => {
    // These gradients fade to transparent or card bg color
    const gradients = [
      'bg-gradient-to-tr from-orange-400 to-orange-600',
      'bg-gradient-to-tr from-blue-400 to-blue-600',
      'bg-gradient-to-tr from-purple-400 to-purple-600',
      'bg-gradient-to-tr from-emerald-400 to-emerald-600',
      'bg-gradient-to-tr from-rose-400 to-rose-600',
    ];
    const charCode = id.charCodeAt(id.length - 1);
    return gradients[charCode % gradients.length];
  };

  const filteredCheckouts = checkouts.filter(page => {
    const matchesTab = activeTab === 'all' || page.status === activeTab;
    const matchesSearch = page.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in" onClick={() => setActiveMenu(null)}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Checkouts</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your high-converting sales pages.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#f97316] hover:bg-[#ea580c] text-white dark:text-black px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-[#f97316]/20 font-bold hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          Create Checkout
        </button>
      </div>

      {/* Filters & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-[#111111] p-2 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
        <div className="flex bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl w-full md:w-auto">
          {(['all', 'active', 'draft'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 capitalize flex-1 md:flex-none ${
                activeTab === tab 
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-gray-700' 
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search checkouts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-all placeholder-gray-400 dark:placeholder-gray-600"
          />
        </div>
      </div>

      {/* List View */}
      <div className="space-y-4 pb-12">
        
        {/* Create New Row */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="group border border-dashed border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20 rounded-xl flex items-center p-4 cursor-pointer hover:bg-white dark:hover:bg-gray-900/60 hover:border-[#f97316]/50 transition-all active:scale-95 shadow-sm hover:shadow-md"
        >
          <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mr-4 shadow-sm border border-gray-200 dark:border-gray-700 group-hover:border-[#f97316]/30 transition-colors">
            <Plus size={20} className="text-gray-400 dark:text-gray-500 group-hover:text-[#f97316]" />
          </div>
          <span className="font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">Create New Checkout</span>
        </div>

        {filteredCheckouts.map((page) => {
          const isPlaceholder = !page.thumbnail || page.thumbnail.includes('via.placeholder');
          const gradientClass = getGradient(page.id);

          return (
            <div key={page.id} className="group relative bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-4 transition-all shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              
              {/* Thumbnail & Identity */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-16 h-16 rounded-lg shrink-0 relative overflow-hidden ${isPlaceholder ? gradientClass : 'bg-gray-100 dark:bg-gray-800'}`}>
                      {!isPlaceholder && (
                          <img 
                              src={page.thumbnail} 
                              alt={page.name} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          />
                      )}
                      {page.logo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                              <img src={page.logo} alt="Logo" className="w-8 h-8 object-contain rounded drop-shadow-lg" />
                          </div>
                      )}
                  </div>
                  <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-[#f97316] transition-colors cursor-pointer" onClick={() => navigate(`/checkouts/${page.id}`)}>
                             {page.name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${page.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'}`}>
                              {page.status}
                          </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1"><Layout size={12}/> {page.products.length} Products</span>
                          <button onClick={(e) => openRenameModal(page, e)} className="hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors"><Edit2 size={10} /> Rename</button>
                      </div>
                  </div>
              </div>

              {/* Stats (Revenue & Conv) */}
              <div className="flex items-center gap-8 md:px-8 md:border-l md:border-r border-gray-100 dark:border-gray-800">
                  <div className="min-w-[80px]">
                      <p className="text-[10px] uppercase text-gray-400 font-bold mb-0.5">Revenue</p>
                      <p className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                          {settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : 'MAD '} 
                          {page.totalRevenue.toLocaleString()}
                      </p>
                  </div>
                  <div className="min-w-[80px]">
                      <p className="text-[10px] uppercase text-gray-400 font-bold mb-0.5">Conv. Rate</p>
                      <p className="font-bold text-[#f97316] text-sm flex items-center gap-1">
                          {((page.conversions / (page.visits || 1)) * 100).toFixed(1)}%
                          <TrendingUp size={10} className="text-[#f97316]" />
                      </p>
                  </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-start md:self-auto w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800">
                  <button 
                    onClick={() => navigate(`/checkouts/${page.id}`)}
                    className="flex-1 md:flex-none h-9 px-4 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black rounded-lg text-sm font-bold transition-all shadow-md active:scale-95 whitespace-nowrap"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  
                  <div className="flex gap-1.5">
                      <button 
                        onClick={(e) => handlePreview(e, page.id)}
                        title="View Live Page"
                        className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all active:scale-95 shadow-sm"
                      >
                        <ExternalLink size={14} />
                      </button>
                      
                      <button 
                        onClick={(e) => handleDeleteClick(e, page.id)}
                        title="Delete Checkout"
                        className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/30 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all active:scale-95 shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                  </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-8 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Create Checkout</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors active:scale-95"><X size={24}/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Checkout Name</label>
                <input 
                  type="text" 
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder="e.g., Summer E-book Sale"
                  className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-all placeholder-gray-400 dark:placeholder-gray-600"
                  autoFocus
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={!newPageName.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-[#f97316] text-white dark:text-black hover:bg-[#ea580c] transition-all active:scale-95 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#f97316]/20"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Rename Checkout</h3>
            <input 
              type="text" 
              value={renameState.name}
              onChange={(e) => setRenameState({ ...renameState, name: e.target.value })}
              className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#f97316] mb-6"
            />
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setRenameState({ ...renameState, isOpen: false })}
                className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button 
                onClick={handleRenameSave}
                className="px-6 py-2 bg-[#f97316] text-white dark:text-black rounded-lg text-sm font-bold hover:bg-[#ea580c] active:scale-95 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteState.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 dark:bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 transform transition-all scale-100 animate-in zoom-in-95">
               <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4 mx-auto text-red-600 dark:text-red-500">
                   <AlertTriangle size={24} />
               </div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">Delete Checkout?</h3>
               <p className="text-gray-600 dark:text-gray-400 text-center text-sm mb-6 leading-relaxed">
                   Are you sure you want to delete this checkout? This action cannot be undone and all associated data will be lost.
               </p>
               <div className="flex gap-3">
                   <button 
                       onClick={() => setDeleteState({ isOpen: false, id: null })}
                       className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 font-medium text-sm"
                   >
                       Cancel
                   </button>
                   <button 
                       onClick={confirmDelete}
                       className="flex-1 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all active:scale-95 font-bold text-sm shadow-lg shadow-red-600/20"
                   >
                       Delete
                   </button>
               </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default ProductManager;
