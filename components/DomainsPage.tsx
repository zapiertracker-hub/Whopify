import React, { useContext, useState } from 'react';
import { AppContext } from '../AppContext';
import { Globe, Check, AlertCircle, RefreshCw, Trash2, Copy, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';

const DomainsPage = () => {
  const { settings, saveSettings } = useContext(AppContext);
  const [domainInput, setDomainInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Load existing domain state
  const currentDomain = settings.customDomain;
  const status = settings.domainStatus || 'none';

  const handleAddDomain = () => {
      if (!domainInput) return;
      // Remove protocol if user added it
      const cleanDomain = domainInput.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '');
      
      saveSettings({
          ...settings,
          customDomain: cleanDomain,
          domainStatus: 'pending'
      });
  };

  const handleRemoveDomain = () => {
      if (confirm('Are you sure? Your store will no longer be accessible via this domain.')) {
          saveSettings({
              ...settings,
              customDomain: undefined,
              domainStatus: 'none'
          });
          setDomainInput('');
      }
  };

  const handleVerify = () => {
      setIsVerifying(true);
      // Simulate API verification delay
      setTimeout(() => {
          setIsVerifying(false);
          // For demo purposes, we just switch to active. 
          // In real app, this would check DNS propagation.
          saveSettings({
              ...settings,
              domainStatus: 'active'
          });
      }, 2000);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
       
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Custom Domains</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Connect your existing domain to professionalize your store.</p>
        </div>
        <a 
          href="https://namecheap.com" 
          target="_blank" 
          rel="noreferrer"
          className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-sm font-medium transition-colors"
        >
           Buy a domain <ExternalLink size={14} />
        </a>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
          
          {/* 1. Input Section (Visible if no domain or replacing) */}
          {status === 'none' && (
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
                  <div className="max-w-md">
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Domain Name</label>
                      <div className="flex gap-3">
                          <input 
                              type="text" 
                              value={domainInput}
                              onChange={(e) => setDomainInput(e.target.value)}
                              placeholder="shop.yourbrand.com"
                              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none transition-all font-medium"
                          />
                          <button 
                              onClick={handleAddDomain}
                              disabled={!domainInput}
                              className="px-6 py-3 bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-black font-bold rounded-xl transition-colors shadow-lg shadow-[#f97316]/20"
                          >
                              Connect
                          </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Enter the full domain you want to use (e.g., store.example.com).</p>
                  </div>
              </div>
          )}

          {/* 2. Configuration & Status Section (Visible if domain exists) */}
          {status !== 'none' && currentDomain && (
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                  
                  {/* Domain Header */}
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${status === 'active' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'}`}>
                             <Globe size={24} />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{currentDomain}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                  <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                                      status === 'active' 
                                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
                                      : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                                  }`}>
                                      {status === 'active' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                      {status === 'active' ? 'Connected' : 'Pending Verification'}
                                  </span>
                                  {status === 'active' && (
                                     <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                        <ShieldCheck size={12} /> SSL Active
                                     </span>
                                  )}
                              </div>
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                          {status !== 'active' && (
                              <button 
                                  onClick={handleVerify}
                                  disabled={isVerifying}
                                  className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-200 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-70"
                              >
                                  <RefreshCw size={16} className={isVerifying ? 'animate-spin' : ''} />
                                  {isVerifying ? 'Verifying...' : 'Verify Connection'}
                              </button>
                          )}
                          <button 
                              onClick={handleRemoveDomain}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Remove Domain"
                          >
                              <Trash2 size={20} />
                          </button>
                      </div>
                  </div>

                  {/* DNS Instructions (Only if not active) */}
                  {status !== 'active' && (
                      <div className="p-6 md:p-8 bg-gray-50 dark:bg-[#0a0a0a]">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-4">DNS Configuration</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                              Log in to your domain provider (e.g., GoDaddy, Namecheap) and add the following record to your DNS settings.
                          </p>

                          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                              <table className="w-full text-left text-sm">
                                  <thead>
                                      <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 uppercase text-xs">
                                          <th className="px-4 py-3 font-bold">Type</th>
                                          <th className="px-4 py-3 font-bold">Name / Host</th>
                                          <th className="px-4 py-3 font-bold">Value / Target</th>
                                          <th className="px-4 py-3 font-bold text-right">Action</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                      <tr>
                                          <td className="px-4 py-4 font-mono font-bold text-gray-900 dark:text-white">CNAME</td>
                                          <td className="px-4 py-4 font-mono text-gray-600 dark:text-gray-300">
                                              {currentDomain.split('.').length > 2 ? currentDomain.split('.')[0] : 'www'}
                                          </td>
                                          <td className="px-4 py-4 font-mono text-[#f97316]">cname.whopify.io</td>
                                          <td className="px-4 py-4 text-right">
                                              <button 
                                                  onClick={() => copyToClipboard('cname.whopify.io')}
                                                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                                  title="Copy Value"
                                              >
                                                  <Copy size={16} />
                                              </button>
                                          </td>
                                      </tr>
                                  </tbody>
                              </table>
                          </div>
                          
                          <div className="mt-6 flex gap-3 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-4 rounded-xl">
                              <AlertCircle size={16} className="text-blue-500 shrink-0" />
                              <p>DNS changes can take up to 24-48 hours to propagate globally, although it usually happens within minutes.</p>
                          </div>
                      </div>
                  )}

                  {/* Success State */}
                  {status === 'active' && (
                      <div className="p-8 flex flex-col items-center justify-center text-center">
                          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                              <Check size={32} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You're all set!</h3>
                          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                              Your store is now live at <a href={`https://${currentDomain}`} target="_blank" className="text-[#f97316] hover:underline">{currentDomain}</a>. SSL certificate has been provisioned automatically.
                          </p>
                          <a href={`https://${currentDomain}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-900 dark:border-white hover:opacity-70 transition-opacity">
                              Visit Store
                          </a>
                      </div>
                  )}

              </div>
          )}

      </div>
    </div>
  );
};

export default DomainsPage;