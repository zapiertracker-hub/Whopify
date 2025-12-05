

import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const OrderConfirmation = () => {
  const location = useLocation();
  const { customLink } = location.state || {};
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (customLink && customLink.enabled && customLink.url) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = customLink.url;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [customLink]);

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-gray-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
        <p className="text-gray-400 mb-8">
          Thank you for your purchase. We've sent a confirmation email with your order details.
        </p>

        <div className="space-y-4">
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Order Number</span>
              <span className="text-white font-mono">#ORD-{Math.floor(Math.random() * 10000)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="text-green-400 font-medium">Processing</span>
            </div>
          </div>

          {customLink && customLink.enabled && customLink.url ? (
              <div className="bg-emerald-900/20 border border-emerald-900/50 p-4 rounded-xl text-center space-y-2 animate-pulse">
                  <p className="text-emerald-400 font-medium">Redirecting in {countdown} seconds...</p>
                  <a 
                      href={customLink.url}
                      className="text-xs text-emerald-500/70 hover:text-emerald-400 hover:underline"
                  >
                      Click here if not redirected
                  </a>
              </div>
          ) : null}

          <Link 
            to="/" 
            className="block w-full text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea580c]"
          >
            Return to Store <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
