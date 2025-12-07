
import React, { useState } from 'react';
import { Terminal, Key, Webhook, Copy, Check, Eye, EyeOff, ShieldAlert, Plus } from 'lucide-react';

const DevelopersPage = () => {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const copyKey = () => {
    navigator.clipboard.writeText("pk_live_51Ox..."); 
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Developers</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage API keys and webhooks.</p>
        </div>
        <button className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-sm font-bold transition-colors">
           <span className="text-blue-500">Docs</span> API Reference
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              {/* API Keys */}
              <div className="bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              <Key size={18} className="text-[#f97316]" /> API Keys
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Use these keys to authenticate your API requests.</p>
                      </div>
                      <button className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg shadow-sm hover:opacity-90">Roll Key</button>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Publishable Key</label>
                          <div className="flex gap-2">
                              <div className="flex-1 bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-gray-600 dark:text-gray-300 flex items-center justify-between">
                                  <span>{showKey ? 'pk_live_51Ox...' : 'pk_live_••••••••••••••••'}</span>
                                  <button onClick={() => setShowKey(!showKey)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                              </div>
                              <button onClick={copyKey} className="px-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                  {copied ? <Check size={18} /> : <Copy size={18} />}
                              </button>
                          </div>
                      </div>
                      
                      <div className="flex gap-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-xl">
                          <ShieldAlert size={16} className="shrink-0" />
                          <p>Your secret keys should be treated like passwords. Do not share them or expose them in client-side code.</p>
                      </div>
                  </div>
              </div>

              {/* Webhooks */}
              <div className="bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                      <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              <Webhook size={18} className="text-blue-500" /> Webhooks
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Receive real-time updates about your store events.</p>
                      </div>
                      <button className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1">
                          <Plus size={14} /> Add Endpoint
                      </button>
                  </div>

                  <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                      <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                          <Webhook size={24} />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No webhooks configured.</p>
                  </div>
              </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#111] to-black text-white rounded-xl p-6 border border-gray-800">
                  <h4 className="font-bold mb-2 flex items-center gap-2"><Terminal size={16} /> API Status</h4>
                  <div className="flex items-center gap-2 text-sm text-green-400 mb-4">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      All Systems Operational
                  </div>
                  <div className="space-y-2 text-xs text-gray-400">
                      <div className="flex justify-between"><span>Success Rate</span><span className="text-white font-mono">99.99%</span></div>
                      <div className="flex justify-between"><span>Latency</span><span className="text-white font-mono">24ms</span></div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default DevelopersPage;
