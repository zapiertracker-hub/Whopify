
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle2, ShieldCheck, Zap, 
  Globe, BarChart2, Lock, ShoppingBag, Terminal
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#f97316] selection:text-white overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#f97316] rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/20">
                <span className="font-bold text-xl font-serif italic">W</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Whopify</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#blog" className="hover:text-white transition-colors">Blog</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-bold text-gray-300 hover:text-white transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="bg-white text-black px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-100 transition-all active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#f97316]/20 rounded-[100%] blur-[120px] opacity-20"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#f97316] text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in">
            <Zap size={14} /> The Future of Digital Commerce
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.1]">
            Sell Digital Products.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] to-yellow-400">Undetected. Unstoppable.</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            The all-in-one platform for creators to sell digital goods, subscriptions, and services. 
            Bypass friction with high-converting checkouts and AI-powered tools.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto h-14 px-8 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#f97316]/25 hover:scale-105"
            >
              Start Selling Free <ArrowRight size={20} />
            </button>
            <button 
              className="w-full sm:w-auto h-14 px-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg flex items-center justify-center gap-2 transition-all backdrop-blur-sm"
            >
              View Demo Store
            </button>
          </div>

          <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-gray-500 font-medium">
             <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#f97316]" /> No credit card required</div>
             <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#f97316]" /> Instant setup</div>
             <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#f97316]" /> 0% transaction fees (Beta)</div>
          </div>
        </div>
      </section>

      {/* Feature Grid (Undetectable.io Style) */}
      <section id="features" className="py-24 bg-[#0a0a0a] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to scale</h2>
            <p className="text-gray-400">Powerful tools embedded directly into your workflow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-[#f97316]/50 transition-all duration-300">
              <div className="w-12 h-12 bg-[#f97316]/10 rounded-lg flex items-center justify-center text-[#f97316] mb-6 group-hover:scale-110 transition-transform">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Ghost Links</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Generate stealth redirect links to track traffic sources while protecting your original URLs from scrapers and bans.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-[#f97316]/50 transition-all duration-300">
              <div className="w-12 h-12 bg-[#f97316]/10 rounded-lg flex items-center justify-center text-[#f97316] mb-6 group-hover:scale-110 transition-transform">
                <BarChart2 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Live Analytics</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Watch your visitors in real-time on a 3D globe. Track conversions, revenue, and active carts with zero latency.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-[#f97316]/50 transition-all duration-300">
              <div className="w-12 h-12 bg-[#f97316]/10 rounded-lg flex items-center justify-center text-[#f97316] mb-6 group-hover:scale-110 transition-transform">
                <Terminal size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Developer API</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Full programmatic access to your store. Create products, manage orders, and automate workflows via our REST API.
              </p>
            </div>

            {/* Card 4 */}
            <div className="group bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-[#f97316]/50 transition-all duration-300">
              <div className="w-12 h-12 bg-[#f97316]/10 rounded-lg flex items-center justify-center text-[#f97316] mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Fraud Protection</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Built-in risk analysis blocks fraudulent transactions before they happen, saving you from chargebacks.
              </p>
            </div>

            {/* Card 5 */}
            <div className="group bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-[#f97316]/50 transition-all duration-300">
              <div className="w-12 h-12 bg-[#f97316]/10 rounded-lg flex items-center justify-center text-[#f97316] mb-6 group-hover:scale-110 transition-transform">
                <ShoppingBag size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">High-Converting Checkout</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Optimized for speed and conversion. Supports Apple Pay, Google Pay, Crypto, and local payment methods.
              </p>
            </div>

            {/* Card 6 */}
            <div className="group bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-[#f97316]/50 transition-all duration-300">
              <div className="w-12 h-12 bg-[#f97316]/10 rounded-lg flex items-center justify-center text-[#f97316] mb-6 group-hover:scale-110 transition-transform">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Digital Delivery</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Files are securely delivered to customers only after successful payment. Supports license keys and serials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-[#f97316]/10"></div>
         <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to start selling?</h2>
            <p className="text-xl text-gray-300 mb-10">Join thousands of creators earning more with Whopify.</p>
            <button 
              onClick={() => navigate('/login')}
              className="h-16 px-10 rounded-xl bg-white text-black font-bold text-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
            >
              Launch Your Store
            </button>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#020202] border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#333] rounded-lg flex items-center justify-center text-white font-serif italic font-bold">W</div>
              <span className="font-bold text-gray-400">Whopify &copy; 2023</span>
           </div>
           <div className="flex gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
           </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
