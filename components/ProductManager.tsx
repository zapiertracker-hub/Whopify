import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../AppContext';
import { 
  Plus, Search, Edit2, Copy, ExternalLink, 
  TrendingUp, X, Trash2, Edit, Check, Layout, AlertTriangle, MoreVertical 
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

  // Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleCopyLink = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const baseUrl = window.location.href.split('#')[0];
    const url = `${baseUrl}#/p/${id}`; 
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
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
      'bg-gradient-to-bl from-orange-600 via-orange-900 to-transparent dark:to-[#111111]',
      'bg-gradient-to-bl from-blue-600 via-blue-900 to-transparent dark:to-[#111111]',
      'bg-gradient-to-bl from-purple-600 via-purple-900 to-transparent dark:to-[#111111]',
      'bg-gradient-to-bl from-emerald-600 via-emerald-900 to-transparent dark:to-[#111111]',
      'bg-gradient-to-bl from-rose-600 via-rose-900 to-transparent dark:to-[#111111]',
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
        
        {/* Create New Card */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="group border border-dashed border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20 rounded-3xl flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-white dark:hover:bg-gray-900/60 hover:border-[#f97316]/50 transition-all active:scale-95 min-h-[380px] hover:shadow-lg dark:hover:shadow-none"
        >
          <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-700 group-hover:border-[#f97316]/30 group-hover:shadow-[#f97316]/20">
            <Plus size={36} className="text-gray-400 dark:text-gray-500 group-hover:text-[#f97316] transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-400 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">New Checkout</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-2 max-w-[200px]">Launch a new product funnel in seconds.</p>
        </div>

        {filteredCheckouts.map((page) => {
          const isPlaceholder = !page.thumbnail || page.thumbnail.includes('via.placeholder');
          const gradientClass = getGradient(page.id);

          return (
            <div key={page.id} className="group relative flex flex-col bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-black/50">
              
              {/* Banner Area */}
              <div className={`h-48 relative overflow-hidden ${isPlaceholder ? gradientClass : 'bg-gray-100 dark:bg-gray-800'}`}>
                
                {/* Image / Pattern */}
                {!isPlaceholder ? (
                  <img 
                    src={page.thumbnail} 
                    alt={page.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 dark:opacity-80 group-hover:opacity-100" 
                  />
                ) : (
                   /* Abstract Pattern Overlay */
                   <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                      backgroundSize: '24px 24px'
                   }}></div>
                )}

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

                {/* Status Badge (Top Left) */}
                <div className="absolute top-4 left-4 z-20">
                  <div className="backdrop-blur-md bg-white/70 dark:bg-black/40 border border-black/5 dark:border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      page.status === 'active' 
                        ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]' 
                        : 'bg-gray-400 dark:bg-gray-400'
                    }`}></div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        page.status === 'active' ? 'text-emerald-700 dark:text-emerald-100' : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      {page.status}
                    </span>
                  </div>
                </div>

                {/* Rename Menu Trigger (Top Right) */}
                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => toggleMenu(e, page.id)}
                        className="p-1.5 rounded-full bg-white/80 dark:bg-black/50 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-black/80 transition-colors backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-lg active:scale-95"
                    >
                        <MoreVertical size={16} />
                    </button>
                    
                    {/* Floating Rename Menu */}
                    {activeMenu === page.id && (
                        <div 
                        ref={menuRef}
                        className="absolute top-8 right-0 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                        >
                        <button 
                            onClick={(e) => openRenameModal(page, e)}
                            className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white flex items-center gap-2 transition-colors active:scale-95"
                        >
                            <Edit2 size={12} /> Rename
                        </button>
                        </div>
                    )}
                </div>

                {/* Centered Stylish Logo */}
                {page.logo && (
                   <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#111111] shadow-2xl border border-gray-100 dark:border-gray-800 p-2 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                         <img src={page.logo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                      </div>
                   </div>
                )}
                
              </div>

              {/* Content Body */}
              <div className="p-6 flex-1 flex flex-col relative z-10 -mt-10">
                
                {/* Title & Product Count */}
                <div className="mb-6 pt-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate leading-tight group-hover:text-[#f97316] transition-colors drop-shadow-sm dark:drop-shadow-md text-center">
                        {page.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center gap-1.5">
                       <Layout size={12} />
                       {page.products.length} {page.products.length === 1 ? 'Product' : 'Products'} included
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden mb-6 shadow-inner">
                  <div className="bg-gray-50 dark:bg-[#161616] p-3 flex flex-col items-center justify-center hover:bg-white dark:hover:bg-[#1a1a1a] transition-colors">
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold mb-1">Revenue</div>
                    <div className="font-bold text-gray-900 dark:text-white text-base">
                       {settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : 'MAD '} 
                       {page.totalRevenue.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#161616] p-3 flex flex-col items-center justify-center hover:bg-white dark:hover:bg-[#1a1a1a] transition-colors">
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold mb-1">Conv. Rate</div>
                    <div className="font-bold text-[#f97316] text-base flex items-center gap-1">
                      {((page.conversions / (page.visits || 1)) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-auto flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/checkouts/${page.id}`)}
                    className="flex-1 h-10 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black rounded-lg text-sm font-bold transition-all shadow-md active:scale-95"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  
                  <div className="flex gap-1.5">
                      <button 
                        onClick={(e) => handleCopyLink(e, page.id)}
                        title={copiedId === page.id ? "Copied!" : "Copy Link"}
                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all active:scale-95 shadow-sm"
                      >
                        {copiedId === page.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                      </button>

                      <button 
                        onClick={(e) => handlePreview(e, page.id)}
                        title="View Live Page"
                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all active:scale-95 shadow-sm"
                      >
                        <ExternalLink size={16} />
                      </button>
                      
                      <button 
                        onClick={(e) => handleDeleteClick(e, page.id)}
                        title="Delete Checkout"
                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/30 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all active:scale-95 shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                  </div>
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