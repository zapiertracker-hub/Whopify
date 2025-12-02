import React from 'react';
import { Search, Book, MessageCircle, FileText, ArrowRight, Zap, Shield, CreditCard, LifeBuoy } from 'lucide-react';

const HelpCenterPage = () => {
  const categories = [
    { icon: Zap, title: "Getting Started", description: "Learn the basics of setting up your store and first product." },
    { icon: CreditCard, title: "Payments & Billing", description: "Connect Stripe, manage payouts, and handle taxes." },
    { icon: Shield, title: "Account & Security", description: "Manage your profile, team members, and 2FA." },
    { icon: FileText, title: "Products & Checkouts", description: "Guides on customizing checkout flows and product types." },
  ];

  const popularArticles = [
    "How to connect your Stripe account",
    "Setting up a custom domain",
    "Creating your first subscription product",
    "Understanding analytics and conversion rates",
    "How to issue a refund"
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-12">
      
      {/* Hero Search Section */}
      <div className="text-center space-y-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">How can we help you?</h1>
        <div className="max-w-2xl mx-auto relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
           <input 
             type="text" 
             placeholder="Search for articles, guides, and tutorials..." 
             className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111111] text-gray-900 dark:text-white shadow-lg shadow-gray-200/50 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-[#f97316] transition-all text-lg"
           />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat, idx) => (
          <div key={idx} className="group p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer shadow-sm hover:shadow-md dark:shadow-none">
             <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-[#f97316]">
                   <cat.icon size={24} />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#f97316] transition-colors">{cat.title}</h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{cat.description}</p>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Popular Articles */}
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
         <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Book size={20} className="text-[#f97316]" /> Popular Articles
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {popularArticles.map((article, idx) => (
               <a key={idx} href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 text-gray-700 dark:text-gray-300 hover:text-[#f97316] dark:hover:text-[#f97316] transition-colors group">
                  <span className="text-sm font-medium">{article}</span>
                  <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
               </a>
            ))}
         </div>
      </div>

      {/* Support Contact */}
      <div className="bg-gradient-to-br from-[#f97316] to-orange-700 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-orange-500/20">
         <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
               <LifeBuoy size={32} />
            </div>
            <div>
               <h2 className="text-2xl font-bold mb-1">Need more help?</h2>
               <p className="text-orange-100">Our support team is available 24/7 to assist you.</p>
            </div>
         </div>
         <button className="px-8 py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-lg flex items-center gap-2">
            <MessageCircle size={20} /> Contact Support
         </button>
      </div>

    </div>
  );
};

export default HelpCenterPage;