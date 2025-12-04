
import React, { useState, useEffect } from 'react';
import { Check, Shield, Zap, Cloud, Download, Loader2, X, CreditCard } from 'lucide-react';

interface PremiumProps {
  isPremium: boolean;
  onUpgrade: () => Promise<void>;
}

const Premium: React.FC<PremiumProps> = ({ isPremium, onUpgrade }) => {
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  
  // Payment Sheet Logic
  const handleLaunchBillingFlow = () => {
    setShowPaymentSheet(true);
  };

  const handlePurchaseCompleted = async () => {
    // This function is called only after the "Payment Sheet" reports success
    await onUpgrade();
    setShowPaymentSheet(false);
  };

  return (
    <div className="p-4 md:p-8 pb-24 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upgrade to CardSnap Premium</h1>
        <p className="text-gray-500">Unlock Document Vault, unlimited scans, and advanced security.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm opacity-60 grayscale-[0.5]">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Free Plan</h3>
          <div className="text-3xl font-bold mb-6">$0 <span className="text-sm font-normal text-gray-500">/ forever</span></div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-gray-600">
              <Check size={18} /> 5 Card Scans
            </li>
            <li className="flex items-center gap-3 text-gray-600">
              <Check size={18} /> Basic Storage
            </li>
            <li className="flex items-center gap-3 text-gray-400 line-through">
              <Shield size={18} /> Biometric Lock
            </li>
             <li className="flex items-center gap-3 text-gray-400 line-through">
              <Cloud size={18} /> Cloud Sync
            </li>
          </ul>
          
          <button disabled className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-semibold cursor-not-allowed">
            Current Plan
          </button>
        </div>

        {/* Premium Plan */}
        <div className="relative bg-gray-900 rounded-3xl p-8 shadow-2xl text-white transform md:-translate-y-4 border border-gray-800">
          <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-3xl">POPULAR</div>
          
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            Premium <Zap size={20} className="text-yellow-400 fill-yellow-400" />
          </h3>
          <div className="text-3xl font-bold mb-6">$2.99 <span className="text-sm font-normal text-gray-400">/ month</span></div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-gray-200">
              <div className="p-1 bg-brand-500/20 rounded-full text-brand-400"><Check size={14} /></div> Unlimited Scans
            </li>
             <li className="flex items-center gap-3 text-gray-200">
              <div className="p-1 bg-brand-500/20 rounded-full text-brand-400"><Check size={14} /></div> ID & Document Vault
            </li>
            <li className="flex items-center gap-3 text-gray-200">
              <div className="p-1 bg-brand-500/20 rounded-full text-brand-400"><Shield size={14} /></div> Advanced Security
            </li>
             <li className="flex items-center gap-3 text-gray-200">
              <div className="p-1 bg-brand-500/20 rounded-full text-brand-400"><Cloud size={14} /></div> Cloud Backup
            </li>
            <li className="flex items-center gap-3 text-gray-200">
              <div className="p-1 bg-brand-500/20 rounded-full text-brand-400"><Download size={14} /></div> Export PDF/Excel
            </li>
          </ul>
          
          {isPremium ? (
             <button disabled className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2">
               <Check size={20} /> Active
             </button>
          ) : (
            <button 
                onClick={handleLaunchBillingFlow}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2"
            >
                Start Premium Subscription
            </button>
          )}
        </div>
      </div>

      {/* Simulated Google Play Billing Sheet */}
      {showPaymentSheet && (
        <PaymentSheet 
          onClose={() => setShowPaymentSheet(false)} 
          onSuccess={handlePurchaseCompleted} 
        />
      )}
    </div>
  );
};

// Mock Component to simulate Google Play Bottom Sheet
const PaymentSheet: React.FC<{ onClose: () => void, onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<'review' | 'processing' | 'success'>('review');

  const handleBuy = () => {
    setStep('processing');
    // Simulate network delay for purchase verification
    setTimeout(() => {
      setStep('success');
      // Simulate success delay before closing
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
           <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
             <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Google_Play_Store_badge_en.svg" className="w-6 opacity-80" alt="Play" />
           </div>
           <div>
             <h3 className="font-bold text-gray-900 text-sm">Google Play</h3>
             <p className="text-xs text-gray-500">Test Account</p>
           </div>
           <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {step === 'review' && (
          <>
            <div className="flex items-start gap-4 mb-6">
               <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white">
                 <Zap size={24} fill="currentColor" />
               </div>
               <div>
                 <h4 className="font-bold text-gray-900">CardSnap Premium (Monthly)</h4>
                 <p className="text-sm text-gray-500">CardSnap: Wallet & Scanner</p>
               </div>
               <div className="ml-auto font-bold text-gray-900">$2.99</div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3 mb-8 border border-gray-200">
               <CreditCard size={20} className="text-gray-600" />
               <div>
                  <div className="text-xs font-bold text-gray-700">Visa •••• 4242</div>
                  <div className="text-[10px] text-gray-500">Primary payment method</div>
               </div>
            </div>

            <button 
              onClick={handleBuy}
              className="w-full py-3 rounded-full bg-brand-600 text-white font-bold hover:bg-brand-700 transition"
            >
              Subscribe
            </button>
            <p className="text-[10px] text-center text-gray-400 mt-4">
               By tapping Subscribe, you accept the following terms of service.
            </p>
          </>
        )}

        {step === 'processing' && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="animate-spin text-brand-600 mb-4" size={40} />
            <h4 className="font-bold text-gray-900">Processing...</h4>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
              <Check size={24} strokeWidth={3} />
            </div>
            <h4 className="font-bold text-gray-900">Payment Successful</h4>
            <p className="text-sm text-gray-500">Your features are now unlocked.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Premium;
