import { getDatabase } from '../lib/database.js';
import { getPlanDetails, getPlanLimit, PlanId, PLAN_DETAILS } from './plans.js';
import { randomUUID } from 'crypto';

const db = getDatabase();

export async function trackUsage(userId: string, metric: string, amount: number = 1): Promise<void> {
  const period = new Date().toISOString().slice(0, 7);
  const id = randomUUID();

  db.prepare(`
    INSERT INTO usage_tracking (id, user_id, metric, count, period, last_updated)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, metric, period) DO UPDATE SET
      count = count + excluded.count,
      last_updated = datetime('now')
  `).run(id, userId, metric, amount, period);
}

export async function getUsage(userId: string, metric: string, period?: string): Promise<number> {
  const targetPeriod = period || new Date().toISOString().slice(0, 7);
  const row = db.prepare(`
    SELECT count FROM usage_tracking WHERE user_id = ? AND metric = ? AND period = ?
  `).get(userId, metric, targetPeriod) as { count: number } | undefined;
  return row?.count || 0;
}

export async function isWithinLimit(userId: string, metric: string, planId: PlanId): Promise<{ withinLimit: boolean; current: number; limit: number }> {
  const current = await getUsage(userId, metric);
  const limit = getPlanLimit(planId, metric as any);
  const withinLimit = limit === -1 || current < limit;
  return { withinLimit, current, limit };
}

export async function resetPeriod(userId: string, period?: string): Promise<void> {
  const targetPeriod = period || new Date().toISOString().slice(0, 7);
  db.prepare('UPDATE usage_tracking SET count = 0, last_updated = datetime(\'now\') WHERE user_id = ? AND period = ?')
    .run(userId, targetPeriod);
}

export async function getUsageSummary(userId: string, planId: PlanId): Promise<Record<string, { current: number; limit: number; withinLimit: boolean }>> {
  const metrics = ['ai_questions_per_month', 'briefings_per_month', 'legal_scans_per_month'] as const;
  const summary: Record<string, { current: number; limit: number; withinLimit: boolean }> = {};

  for (const metric of metrics) {
    const { withinLimit, current, limit } = await isWithinLimit(userId, metric, planId);
    summary[metric] = { current, limit, withinLimit };
  }

  return summary;
}