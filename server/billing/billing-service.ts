import { getDatabase } from '../lib/database.js';
import { getPlanDetails, PlanId } from './plans.js';
import { trackUsage, isWithinLimit } from './usage-tracker.js';
import { randomUUID } from 'crypto';

const db = getDatabase();

export async function createSubscription(userId: string, planId: PlanId, paymentMethod: 'paystack' | 'stripe' | 'crypto', paymentReference: string) {
  const plan = getPlanDetails(planId);
  const id = randomUUID();
  
  db.prepare(`
    INSERT INTO subscriptions (id, user_id, plan_id, payment_method, payment_reference, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'active', datetime('now'))
  `).run(id, userId, planId, paymentMethod, paymentReference);
  
  return { id, planId, status: 'active' };
}

export async function getSubscription(userId: string) {
  return db.prepare('SELECT * FROM subscriptions WHERE user_id = ? AND status = \'active\' ORDER BY created_at DESC LIMIT 1').get(userId);
}

export async function cancelSubscription(userId: string) {
  db.prepare('UPDATE subscriptions SET status = \'cancelled\' WHERE user_id = ? AND status = \'active\'').run(userId);
}

export async function checkLimit(userId: string, metric: string, planId: PlanId) {
  return isWithinLimit(userId, metric, planId);
}

export async function incrementUsage(userId: string, metric: string) {
  await trackUsage(userId, metric, 1);
}