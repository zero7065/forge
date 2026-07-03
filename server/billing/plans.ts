export const PLANS = {
  STARTER: 'starter',
  BUSINESS: 'business',
  SOVEREIGN: 'sovereign'
} as const;

export type PlanId = typeof PLANS[keyof typeof PLANS];

export const PLAN_DETAILS: Record<PlanId, {
  name: string;
  amount: number;
  currency: 'NGN' | 'USD';
  limits: {
    ai_questions_per_month: number;
    briefings_per_month: number;
    legal_scans_per_month: number;
    projects: number;
    collaborators: number;
    storage_gb: number;
    api_access: boolean;
    ultimate_form: boolean;
  };
  features: string[];
}> = {
  [PLANS.STARTER]: {
    name: 'Starter',
    amount: 15000,
    currency: 'NGN',
    limits: {
      ai_questions_per_month: 100,
      briefings_per_month: 4,
      legal_scans_per_month: 2,
      projects: 5,
      collaborators: 1,
      storage_gb: 1,
      api_access: false,
      ultimate_form: false
    },
    features: [
      '100 AI questions/month',
      '4 briefings/month',
      '2 legal scans/month',
      '5 projects',
      '1 collaborator',
      '1GB storage',
      'Email support'
    ]
  },
  [PLANS.BUSINESS]: {
    name: 'Business',
    amount: 45000,
    currency: 'NGN',
    limits: {
      ai_questions_per_month: 1000,
      briefings_per_month: 20,
      legal_scans_per_month: 10,
      projects: 50,
      collaborators: 10,
      storage_gb: 10,
      api_access: true,
      ultimate_form: false
    },
    features: [
      '1,000 AI questions/month',
      '20 briefings/month',
      '10 legal scans/month',
      '50 projects',
      '10 collaborators',
      '10GB storage',
      'API access',
      'Priority support',
      'Custom integrations'
    ]
  },
  [PLANS.SOVEREIGN]: {
    name: 'Sovereign',
    amount: 120000,
    currency: 'NGN',
    limits: {
      ai_questions_per_month: -1,
      briefings_per_month: -1,
      legal_scans_per_month: -1,
      projects: -1,
      collaborators: -1,
      storage_gb: 100,
      api_access: true,
      ultimate_form: true
    },
    features: [
      'Unlimited AI questions',
      'Unlimited briefings',
      'Unlimited legal scans',
      'Unlimited projects',
      'Unlimited collaborators',
      '100GB storage',
      'Full API access',
      'Ultimate Form access',
      'Dedicated support',
      'White-label options',
      'Custom deployment'
    ]
  }
};

export function getPlanDetails(planId: string) {
  return PLAN_DETAILS[planId as PlanId] || PLAN_DETAILS[PLANS.STARTER];
}

export function isValidPlan(planId: string): boolean {
  return Object.values(PLANS).includes(planId as PlanId);
}

export function getPlanLimit(planId: string, metric: string): number {
  const plan = getPlanDetails(planId);
  return (plan.limits as any)[metric] ?? 0;
}