
import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderConfirmation = () => {
  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-gray-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
        <p className="text-gray-400 mb-8">
          Thank you for your purchase. We've sent a confirmation email with your order details and access link.
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

          <Link 
            to="/" 
            className="block w-full bg-[#f97316] hover:bg-[#ea580c] text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Return to Store <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
