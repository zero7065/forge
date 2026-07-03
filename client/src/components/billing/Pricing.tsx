import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Building2 } from 'lucide-react';

interface PricingProps {
  onSelectPlan?: (plan: string) => void;
  className?: string;
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₦15,000',
    period: '/month',
    icon: <Zap className="w-5 h-5" />,
    description: 'For individual builders getting started',
    features: [
      '100 AI conversations/month',
      '3 daily briefings',
      '1 legal scan/week',
      'All 7 chambers',
      'Basic personality modes',
      'Community access',
    ],
    highlighted: false,
  },
  {
    id: 'business',
    name: 'Business',
    price: '₦45,000',
    period: '/month',
    icon: <Building2 className="w-5 h-5" />,
    description: 'For teams building seriously',
    features: [
      '500 AI conversations/month',
      'Unlimited briefings',
      'Daily legal scans',
      'All 7 chambers + Ultimate Form',
      'All personality modes + custom',
      'Hiring engine access',
      'Code analysis',
      'Priority support',
    ],
    highlighted: true,
  },
  {
    id: 'sovereign',
    name: 'Sovereign',
    price: '₦120,000',
    period: '/month',
    icon: <Crown className="w-5 h-5" />,
    description: 'Full sovereignty, no limits',
    features: [
      'Unlimited AI conversations',
      'Unlimited briefings & scans',
      'All chambers + Ultimate Form',
      'Custom personality builder',
      'Hiring engine + Link preview',
      'Full code analysis',
      'API access',
      'Dedicated support',
      'White-label option',
    ],
    highlighted: false,
  },
];

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {PLANS.map((plan, i) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i }}
          className={`relative bg-void-black/60 rounded-xl p-6 border transition-all duration-300 ${
            plan.highlighted
              ? 'border-ancient-gold/30 shadow-lg shadow-ancient-gold/5'
              : 'border-ancient-gold/10 hover:border-ancient-gold/20'
          }`}
        >
          {plan.highlighted && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-ancient-gold/20 border border-ancient-gold/30 rounded-full text-[10px] text-ancient-gold font-cinzel">
              RECOMMENDED
            </div>
          )}

          <div className="flex items-center gap-2 mb-3 text-ancient-gold/60">
            {plan.icon}
            <h3 className="font-cinzel text-lg text-ancient-gold">{plan.name}</h3>
          </div>

          <div className="mb-4">
            <span className="text-3xl font-bold text-ghost-white">{plan.price}</span>
            <span className="text-xs text-ancient-gold/30">{plan.period}</span>
          </div>

          <p className="text-xs text-ancient-gold/40 mb-4">{plan.description}</p>

          <ul className="space-y-2 mb-6">
            {plan.features.map((feature, j) => (
              <li key={j} className="flex items-start gap-2 text-xs text-ghost-white/50">
                <Check className="w-3 h-3 text-ancient-gold/40 mt-0.5 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={() => onSelectPlan?.(plan.id)}
            className={`w-full py-2.5 rounded-lg text-sm font-cinzel transition-all duration-300 ${
              plan.highlighted
                ? 'bg-ancient-gold/20 border border-ancient-gold/30 text-ancient-gold hover:bg-ancient-gold/30'
                : 'bg-void-black/50 border border-ancient-gold/10 text-ancient-gold/50 hover:text-ancient-gold hover:border-ancient-gold/20'
            }`}
          >
            Get Started
          </button>
        </motion.div>
      ))}
    </div>
  );
};

export default Pricing;
