
import React, { useContext, useState } from 'react';
import { AppContext } from '../AppContext';
import { 
  Copy, Code, ExternalLink, Check, X, Globe, 
  LayoutTemplate, Monitor, Smartphone, CheckCircle2,
  Box, ArrowRight, Zap, Link as LinkIcon
} from 'lucide-react';

const PaymentLinksPage = () => {
  const { checkouts } = useContext(AppContext);
  const [selectedCheckoutId, setSelectedCheckoutId] = useState<string | null>(null);
  const [embedMode, setEmbedMode] = useState<'overlay' | 'inline'>('overlay');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Embed Customization State
  const [buttonText, setButtonText] = useState('Pay Now');
  const [buttonColor, setButtonColor] = useState('#f97316');
  const [buttonTextColor, setButtonTextColor] = useState('#ffffff');
  const [showButtonIcon, setShowButtonIcon] = useState(true);

  const selectedCheckout = checkouts.find(c => c.id === selectedCheckoutId);
  const activeCheckouts = checkouts; // Showing all checkouts for now

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getEmbedCode = () => {
    if (!selectedCheckout) return '';
    const baseUrl = window.location.origin;
    const checkoutUrl = `${baseUrl}/#/p/${selectedCheckout.id}`;

    if (embedMode === 'inline') {
      return `<iframe
  src="${checkoutUrl}"
  style="width: 100%; height: 700px; border: none; border-radius: 12px;"
  title="${selectedCheckout.name}"
></iframe>`;
    }

    // Overlay Mode (Mock script representation)
    return `<!-- Whopify Embed Code -->
<script src="https://cdn.whopify.io/embed.js"></script>
<button
  data-whopify-checkout="${selectedCheckout.id}"
  style="background-color: ${buttonColor}; color: ${buttonTextColor}; padding: 12px 24px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-family: system-ui, -apple-system, sans-serif;"
>
  ${showButtonIcon ? '<span>⚡</span>' : ''}${buttonText}
</button>`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Payment Links</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Create shareable links and embeddable buttons for your products.</p>
        </div>
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {activeCheckouts.length === 0 && (
           <div className="col-span-full py-16 text-center bg-white dark:bg-[#111] rounded-2xl border border-dashed border-gray-300 dark:border-gray-800">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <LinkIcon size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Payment Links</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm max-w-sm mx-auto">You haven't created any checkouts yet. Create a checkout to generate payment links.</p>
              <a href="/#/checkouts" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f97316] text-white rounded-xl font-bold text-sm hover:bg-[#ea580c] transition-colors">
                  <Zap size={16} /> Create Checkout
              </a>
           </div>
        )}

        {activeCheckouts.map(checkout => (
          <div key={checkout.id} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all group relative overflow-hidden">
             
             {/* Status Badge */}
             <div className="absolute top-4 right-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${checkout.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'}`}>
                    {checkout.status}
                </span>
             </div>

             <div className="flex flex-col h-full">
                <div className="flex items-start gap-4 mb-6">
                   <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                      {checkout.thumbnail && !checkout.thumbnail.includes('placeholder') ? (
                        <img src={checkout.thumbnail} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <Zap size={24} />
                      )}
                   </div>
                   <div className="flex-1 min-w-0 pr-8">
                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 text-base">{checkout.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{checkout.products.length} Product{checkout.products.length !== 1 ? 's' : ''}</p>
                   </div>
                </div>

                <div className="mt-auto space-y-3">
                    {/* URL Bar */}
                    <div className="p-2.5 bg-gray-50 dark:bg-[#161616] rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3 group-hover:border-gray-300 dark:group-hover:border-gray-700 transition-colors">
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 truncate font-mono flex-1">
                            <Globe size={14} className="shrink-0 text-gray-400" />
                            <span className="truncate opacity-80">{window.location.origin}/#/p/{checkout.id}</span>
                        </div>
                        <button 
                            onClick={() => handleCopy(`${window.location.origin}/#/p/${checkout.id}`, `link-${checkout.id}`)}
                            className="p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-black dark:hover:text-white transition-colors shrink-0"
                            title="Copy URL"
                        >
                            {copiedId === `link-${checkout.id}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <a 
                            href={`/#/p/${checkout.id}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <ExternalLink size={16} /> Open
                        </a>
                        <button 
                            onClick={() => setSelectedCheckoutId(checkout.id)}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-90 transition-opacity shadow-sm"
                        >
                            <Code size={16} /> Embed
                        </button>
                    </div>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Embed Modal */}
      {selectedCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] animate-slide-up">
              
              {/* Left Configuration Panel */}
              <div className="w-full md:w-[400px] bg-gray-50 dark:bg-[#161616] border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col overflow-y-auto custom-scrollbar">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Embed Checkout</h3>
                    <button onClick={() => setSelectedCheckoutId(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors">
                       <X size={20} />
                    </button>
                 </div>

                 <div className="space-y-6">
                    {/* Mode Selection */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Embed Type</label>
                        <div className="p-1 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 flex shadow-sm">
                        <button 
                            onClick={() => setEmbedMode('overlay')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${embedMode === 'overlay' ? 'bg-[#f97316] text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            <LayoutTemplate size={16} /> Button
                        </button>
                        <button 
                            onClick={() => setEmbedMode('inline')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${embedMode === 'inline' ? 'bg-[#f97316] text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            <Box size={16} /> Inline
                        </button>
                        </div>
                    </div>

                    {/* Button Customization (Only for Overlay) */}
                    {embedMode === 'overlay' && (
                       <div className="space-y-5 animate-in slide-in-from-left-4 fade-in duration-300">
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-2 mt-4">Button Text</label>
                             <input 
                                type="text" 
                                value={buttonText} 
                                onChange={(e) => setButtonText(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-sm outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-all" 
                             />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Background</label>
                                <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800">
                                   <input type="color" value={buttonColor} onChange={(e) => setButtonColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent p-0" />
                                   <span className="text-xs font-mono text-gray-500">{buttonColor}</span>
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Text Color</label>
                                <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800">
                                   <input type="color" value={buttonTextColor} onChange={(e) => setButtonTextColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent p-0" />
                                   <span className="text-xs font-mono text-gray-500">{buttonTextColor}</span>
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800">
                             <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Zap size={14} className="text-[#f97316]" /> Show Icon</span>
                             <button 
                                onClick={() => setShowButtonIcon(!showButtonIcon)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showButtonIcon ? 'bg-[#f97316]' : 'bg-gray-200 dark:bg-gray-700'}`}
                             >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${showButtonIcon ? 'translate-x-6' : 'translate-x-1'}`} />
                             </button>
                          </div>
                       </div>
                    )}

                    {/* Info Box */}
                    <div className="mt-auto">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl flex gap-3">
                            <div className="shrink-0 text-blue-600 dark:text-blue-400 mt-0.5"><CheckCircle2 size={16} /></div>
                            <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed font-medium">
                                {embedMode === 'overlay' 
                                    ? "Generates a button that opens a secure popup overlay. Optimized for high conversion on landing pages."
                                    : "Embeds the full checkout form directly into your page layout. Perfect for dedicated pricing sections."}
                            </p>
                        </div>
                    </div>
                 </div>
              </div>

              {/* Right Preview Panel */}
              <div className="flex-1 bg-white dark:bg-[#0a0a0a] flex flex-col relative">
                 <div className="flex-1 flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-gray-50 dark:bg-[#111] relative overflow-hidden p-8">
                    
                    {/* Live Preview */}
                    {embedMode === 'overlay' ? (
                       <div className="text-center z-10">
                          <button
                             style={{
                                backgroundColor: buttonColor,
                                color: buttonTextColor,
                                padding: '14px 32px',
                                borderRadius: '10px',
                                fontWeight: 'bold',
                                border: 'none',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '16px',
                                fontFamily: 'system-ui, sans-serif'
                             }}
                             className="transform transition-all hover:scale-105 active:scale-95 cursor-default"
                          >
                             {showButtonIcon && <span>⚡</span>}
                             {buttonText}
                          </button>
                          <div className="mt-12 inline-flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full border border-gray-200 dark:border-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                             Live Preview
                          </div>
                       </div>
                    ) : (
                       <div className="w-full max-w-lg h-[500px] bg-white dark:bg-black rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden z-10">
                          <div className="h-10 bg-gray-100 dark:bg-[#161616] border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-2">
                             <div className="w-3 h-3 rounded-full bg-red-400"></div>
                             <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                             <div className="w-3 h-3 rounded-full bg-green-400"></div>
                             <div className="ml-4 h-5 w-full max-w-[200px] bg-gray-200 dark:bg-gray-800 rounded-md"></div>
                          </div>
                          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                             <div className="w-16 h-16 bg-gray-50 dark:bg-[#161616] rounded-2xl mb-6 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                                <Monitor size={32} className="text-gray-400" />
                             </div>
                             <h4 className="text-gray-900 dark:text-white font-bold text-lg">{selectedCheckout.name}</h4>
                             <div className="mt-4 w-full max-w-[200px] h-2 bg-gray-100 dark:bg-[#161616] rounded-full"></div>
                             <div className="mt-2 w-full max-w-[160px] h-2 bg-gray-100 dark:bg-[#161616] rounded-full"></div>
                             
                             <div className="mt-8 w-full max-w-xs h-10 bg-[#f97316] rounded-lg opacity-20"></div>
                          </div>
                       </div>
                    )}
                 </div>

                 {/* Code Snippet Area */}
                 <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-[#0a0a0a]">
                    <div className="flex justify-between items-center mb-3">
                       <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                          <Code size={14} className="text-[#f97316]" /> Generated Code
                       </label>
                       <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">HTML / JS</span>
                    </div>
                    <div className="relative group">
                       <pre className="w-full bg-gray-900 text-gray-300 font-mono text-xs p-4 rounded-xl overflow-x-auto border border-gray-800 custom-scrollbar leading-relaxed">
                          {getEmbedCode()}
                       </pre>
                       <div className="absolute top-2 right-2 flex gap-2">
                           <button 
                              onClick={() => handleCopy(getEmbedCode(), 'embed-code')}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${copiedId === 'embed-code' ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                           >
                              {copiedId === 'embed-code' ? <Check size={14} /> : <Copy size={14} />}
                              {copiedId === 'embed-code' ? 'Copied' : 'Copy'}
                           </button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default PaymentLinksPage;
