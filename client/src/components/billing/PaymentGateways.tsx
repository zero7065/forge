import React from 'react';
import { CreditCard, Bitcoin, Building2 } from 'lucide-react';

interface PaymentGatewaysProps {
  selectedMethod?: string;
  onSelect?: (method: string) => void;
  className?: string;
}

export const PaymentGateways: React.FC<PaymentGatewaysProps> = ({ selectedMethod, onSelect, className = '' }) => {
  const gateways = [
    {
      id: 'paystack',
      name: 'Paystack',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Nigerian payment processing',
      currencies: ['NGN'],
      methods: ['Card', 'Bank Transfer', 'USSD', 'Mobile Money'],
    },
    {
      id: 'stripe',
      name: 'Stripe',
      icon: <Building2 className="w-5 h-5" />,
      description: 'International payment processing',
      currencies: ['USD', 'EUR', 'GBP'],
      methods: ['Card', 'Apple Pay', 'Google Pay'],
    },
    {
      id: 'coinbase',
      name: 'Coinbase Commerce',
      icon: <Bitcoin className="w-5 h-5" />,
      description: 'Cryptocurrency payments',
      currencies: ['BTC', 'ETH', 'USDC', 'USDT'],
      methods: ['Bitcoin', 'Ethereum', 'Stablecoins'],
    },
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      {gateways.map(gw => (
        <button key={gw.id}
          onClick={() => onSelect?.(gw.id)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
            selectedMethod === gw.id
              ? 'border-ancient-gold/30 bg-ancient-gold/5'
              : 'border-ancient-gold/10 bg-void-black/30 hover:border-ancient-gold/20'
          }`}>
          <div className="text-ancient-gold/40">{gw.icon}</div>
          <div className="flex-1">
            <p className="text-xs text-ghost-white/60">{gw.name}</p>
            <p className="text-[10px] text-ancient-gold/20">{gw.description}</p>
          </div>
          <div className="flex flex-wrap gap-1 justify-end max-w-[120px]">
            {gw.currencies.slice(0, 3).map(c => (
              <span key={c} className="text-[9px] px-1.5 py-0.5 bg-void-black/50 rounded text-ancient-gold/20">{c}</span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
};

export default PaymentGateways;
