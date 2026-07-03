import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle, ArrowRight } from 'lucide-react';

interface CheckoutProps {
  plan: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const Checkout: React.FC<CheckoutProps> = ({ plan, onSuccess, onCancel, className = '' }) => {
  const [step, setStep] = useState<'method' | 'details' | 'confirm' | 'success'>('method');
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'stripe' | 'crypto'>('paystack');
  const [processing, setProcessing] = useState(false);

  const PLAN_PRICES: Record<string, string> = {
    starter: '₦15,000',
    business: '₦45,000',
    sovereign: '₦120,000',
  };

  const handlePay = async () => {
    setProcessing(true);
    // In production, this would redirect to Paystack/Stripe/Coinbase
    // For now, simulate success
    setTimeout(() => {
      setProcessing(false);
      setStep('success');
      onSuccess?.();
    }, 2000);
  };

  return (
    <div className={`bg-void-black/60 border border-ancient-gold/10 rounded-xl p-6 max-w-md mx-auto ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-4 h-4 text-ancient-gold/40" />
        <h3 className="text-sm font-cinzel text-ancient-gold">Secure Checkout</h3>
      </div>

      {step === 'method' && (
        <div className="space-y-3">
          <p className="text-xs text-ancient-gold/30 mb-3">Plan: {plan} &middot; {PLAN_PRICES[plan] || plan}</p>
          <p className="text-xs text-ghost-white/40 mb-3">Choose payment method:</p>

          {[
            { id: 'paystack', name: 'Paystack', desc: 'Nigerian cards, bank transfer, USSD', currency: 'NGN' },
            { id: 'stripe', name: 'Stripe', desc: 'International cards, Apple Pay', currency: 'USD' },
            { id: 'crypto', name: 'Coinbase Commerce', desc: 'BTC, ETH, USDC, USDT', currency: 'Crypto' },
          ].map(method => (
            <button key={method.id}
              onClick={() => { setPaymentMethod(method.id as any); setStep('details'); }}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                paymentMethod === method.id
                  ? 'border-ancient-gold/30 bg-ancient-gold/5'
                  : 'border-ancient-gold/10 bg-void-black/30 hover:border-ancient-gold/20'
              }`}>
              <div className="text-left">
                <p className="text-xs text-ghost-white/60">{method.name}</p>
                <p className="text-[10px] text-ancient-gold/20">{method.desc}</p>
              </div>
              <span className="text-[10px] text-ancient-gold/30">{method.currency}</span>
            </button>
          ))}
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-3">
          <p className="text-xs text-ancient-gold/30">Payment via {paymentMethod}</p>

          {paymentMethod === 'paystack' && (
            <div className="space-y-2">
              <input placeholder="Email" className="w-full bg-void-black/50 border border-ancient-gold/10 rounded px-3 py-2 text-xs text-ghost-white" />
              <input placeholder="Card number" className="w-full bg-void-black/50 border border-ancient-gold/10 rounded px-3 py-2 text-xs text-ghost-white" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="MM/YY" className="bg-void-black/50 border border-ancient-gold/10 rounded px-3 py-2 text-xs text-ghost-white" />
                <input placeholder="CVV" className="bg-void-black/50 border border-ancient-gold/10 rounded px-3 py-2 text-xs text-ghost-white" />
              </div>
            </div>
          )}

          {paymentMethod === 'stripe' && (
            <div className="space-y-2">
              <input placeholder="Email" className="w-full bg-void-black/50 border border-ancient-gold/10 rounded px-3 py-2 text-xs text-ghost-white" />
              <input placeholder="Card number" className="w-full bg-void-black/50 border border-ancient-gold/10 rounded px-3 py-2 text-xs text-ghost-white" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="MM/YY" className="bg-void-black/50 border border-ancient-gold/10 rounded px-3 py-2 text-xs text-ghost-white" />
                <input placeholder="CVC" className="bg-void-black/50 border border-ancient-gold/10 rounded px-3 py-2 text-xs text-ghost-white" />
              </div>
            </div>
          )}

          {paymentMethod === 'crypto' && (
            <div className="bg-void-black/40 rounded-lg p-4 text-center">
              <p className="text-xs text-ancient-gold/30 mb-2">You will be redirected to Coinbase Commerce</p>
              <p className="text-[10px] text-ghost-white/20">Supports BTC, ETH, USDC, USDT, DOGE</p>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button onClick={() => setStep('method')}
              className="flex-1 py-2 border border-ancient-gold/10 rounded-lg text-xs text-ancient-gold/30 hover:text-ancient-gold/50">
              Back
            </button>
            <button onClick={() => setStep('confirm')}
              className="flex-1 py-2 bg-ancient-gold/10 border border-ancient-gold/20 rounded-lg text-xs text-ancient-gold hover:bg-ancient-gold/20">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="bg-void-black/40 rounded-lg p-4 text-center">
            <p className="text-xs text-ancient-gold/30 mb-1">Confirm payment</p>
            <p className="text-xl font-cinzel text-ancient-gold">{PLAN_PRICES[plan]}</p>
            <p className="text-[10px] text-ghost-white/20 mt-1">via {paymentMethod}</p>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep('details')}
              className="flex-1 py-2 border border-ancient-gold/10 rounded-lg text-xs text-ancient-gold/30 hover:text-ancient-gold/50">
              Back
            </button>
            <button onClick={handlePay} disabled={processing}
              className="flex-1 py-2 bg-ancient-gold/20 border border-ancient-gold/30 rounded-lg text-xs text-ancient-gold hover:bg-ancient-gold/30 disabled:opacity-50">
              {processing ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center py-6">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-sm text-ghost-white mb-1">Payment successful</p>
          <p className="text-xs text-ancient-gold/30">Welcome to {plan}</p>
          <button onClick={onSuccess}
            className="mt-4 px-6 py-2 bg-ancient-gold/10 border border-ancient-gold/20 rounded-lg text-xs text-ancient-gold hover:bg-ancient-gold/20">
            Enter PRIMORDEX
          </button>
        </div>
      )}

      {step !== 'success' && onCancel && (
        <button onClick={onCancel} className="w-full mt-3 text-center text-[10px] text-ancient-gold/15 hover:text-ancient-gold/30">
          Cancel
        </button>
      )}
    </div>
  );
};

export default Checkout;
