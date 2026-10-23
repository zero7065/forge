// AI Gateway — "One Door" for everything AI
// Request → Analyse → Decide → Route → Respond → Store → Synthesize
// All AI traffic funnels through this server; no direct browser→provider calls.

import { getDatabase } from '../lib/database.js';
import { generateText } from '../provider.js';
import { randomUUID } from 'crypto';

// =====================================================
// 1. INTENT CLASSIFICATION
// =====================================================

export type AIIntent = 
  | 'chat'
  | 'explanation'
  | 'vision'
  | 'study_plan'
  | 'prediction'
  | 'code'
  | 'creative'
  | 'analysis'
  | 'summarization'
  | 'translation'
  | 'legal'
  | 'unknown';

export interface IntentResult {
  intent: AIIntent;
  confidence: number;
  reasoning: string;
}

const INTENT_PROMPT = `You are an intent classifier for a sovereign AI operating system.
Classify the user's request into exactly ONE of these intents:
chat, explanation, vision, study_plan, prediction, code, creative, analysis, summarization, translation, legal, unknown.

Return ONLY JSON: {"intent": "...", "confidence": 0.0-1.0, "reasoning": "short reason"}

Rules:
- chat: general conversation, greetings, casual
- explanation: "how does X work", "explain", "teach me"
- vision: image, picture, see, visual, describe image
- study_plan: "make a plan", "curriculum", "syllabus", "learn X in Y weeks"
- prediction: "will happen", "forecast", "predict", "future", "probability"
- code: write code, debug, programming, script
- creative: write story, poem, song, fiction, imagine
- analysis: analyze data, compare, pros/cons, evaluate
- summarization: summarize, tl;dr, condense
- translation: translate, language conversion
- legal: law, regulation, compliance, contract, rights
- unknown: cannot determine

Input: "{{message}}"`;

export async function classifyIntent(message: string): Promise<IntentResult> {
  try {
    const response = await generateText({
      systemPrompt: INTENT_PROMPT,
      messages: [{ role: 'user', content: message }],
      temperature: 0.1,
      maxTokens: 200,
      model: 'fast',
      json: true
    });

    const parsed = JSON.parse(response.content) as {
      intent: AIIntent;
      confidence: number;
      reasoning: string;
    };

    return {
      intent: parsed.intent || 'unknown',
      confidence: parsed.confidence ?? 0.5,
      reasoning: parsed.reasoning || 'auto-classified'
    };
  } catch {
    // Fallback: keyword-based classification
    return classifyIntentFallback(message);
  }
}

function classifyIntentFallback(message: string): IntentResult {
  const lower = message.toLowerCase();
  
  if (/explain|how does|teach|what is/.test(lower)) return { intent: 'explanation', confidence: 0.7, reasoning: 'keyword fallback' };
  if (/plan|curriculum|syllabus|learn.*weeks/.test(lower)) return { intent: 'study_plan', confidence: 0.7, reasoning: 'keyword fallback' };
  if (/predict|forecast|will happen|future/.test(lower)) return { intent: 'prediction', confidence: 0.7, reasoning: 'keyword fallback' };
  if (/code|program|script|debug|function/.test(lower)) return { intent: 'code', confidence: 0.7, reasoning: 'keyword fallback' };
  if (/poem|story|song|imagine|fiction/.test(lower)) return { intent: 'creative', confidence: 0.7, reasoning: 'keyword fallback' };
  if (/summarize|tl;dr|condense|brief/.test(lower)) return { intent: 'summarization', confidence: 0.7, reasoning: 'keyword fallback' };
  if (/translate|language/.test(lower)) return { intent: 'translation', confidence: 0.7, reasoning: 'keyword fallback' };
  if (/law|regulation|contract|legal|compliance/.test(lower)) return { intent: 'legal', confidence: 0.7, reasoning: 'keyword fallback' };
  if (/image|picture|see|visual/.test(lower)) return { intent: 'vision', confidence: 0.6, reasoning: 'keyword fallback' };
  
  return { intent: 'chat', confidence: 0.5, reasoning: 'default fallback' };
}

// =====================================================
// 2. PROVIDER SELECTION (cost-aware, health-aware, plan-aware)
// =====================================================

export type AIProvider = 'groq' | 'anthropic' | 'openai';

export interface ProviderHealth {
  provider: AIProvider;
  healthy: boolean;
  latency: number; // ms
  lastChecked: string;
  errorRate: number; // 0-1
}

export interface ProviderCost {
  provider: AIProvider;
  costPer1kTokens: number; // USD
  dailySpend: number;
  dailyLimit: number;
  remaining: number;
}

// Default per-1k-token costs (approximate, USD)
const DEFAULT_COSTS: Record<AIProvider, number> = {
  groq: 0.0002,      // ~$0.20 per 1M tokens
  anthropic: 0.003,  // ~$3.00 per 1M tokens
  openai: 0.0015,    // ~$1.50 per 1M tokens
};

export interface ProviderSelection {
  provider: AIProvider;
  model: string;
  reason: string;
  estimatedCost: number;
}

export class ProviderRouter {
  private health: Map<AIProvider, ProviderHealth> = new Map();
  private costs: Map<AIProvider, ProviderCost> = new Map();
  private userPlans: Map<string, { planId: string; dailyLimit: number }> = new Map();

  constructor() {
    // Initialize health checks
    this.health.set('groq', { provider: 'groq', healthy: true, latency: 200, lastChecked: new Date().toISOString(), errorRate: 0 });
    this.health.set('anthropic', { provider: 'anthropic', healthy: true, latency: 800, lastChecked: new Date().toISOString(), errorRate: 0 });
    this.health.set('openai', { provider: 'openai', healthy: true, latency: 600, lastChecked: new Date().toISOString(), errorRate: 0 });

    // Initialize costs
    for (const p of ['groq', 'anthropic', 'openai'] as AIProvider[]) {
      this.costs.set(p, {
        provider: p,
        costPer1kTokens: DEFAULT_COSTS[p],
        dailySpend: 0,
        dailyLimit: 50, // $50/day per provider
        remaining: 50
      });
    }
  }

  updateHealth(provider: AIProvider, healthy: boolean, latency: number, error: boolean) {
    const h = this.health.get(provider);
    if (h) {
      h.healthy = healthy;
      h.latency = latency;
      h.lastChecked = new Date().toISOString();
      h.errorRate = error ? Math.min(1, h.errorRate + 0.1) : Math.max(0, h.errorRate - 0.05);
    }
  }

  updateCost(provider: AIProvider, tokens: number, cost: number) {
    const c = this.costs.get(provider);
    if (c) {
      c.dailySpend += cost;
      c.remaining = Math.max(0, c.dailyLimit - c.dailySpend);
    }
  }

  setUserPlan(userId: string, planId: string, dailyLimit: number) {
    this.userPlans.set(userId, { planId, dailyLimit });
  }

  selectProvider(
    intent: AIIntent,
    userId: string,
    messageLength: number
  ): ProviderSelection {
    const userPlan = this.userPlans.get(userId);
    const userDailyLimit = userPlan?.dailyLimit || 10; // $10/day default for free users

    // Filter healthy providers
    const healthyProviders = [...this.health.entries()]
      .filter(([_, h]) => h.healthy && h.errorRate < 0.5)
      .map(([p, _]) => p);

    if (healthyProviders.length === 0) {
      // All unhealthy — fall back to groq (primary)
      return {
        provider: 'groq',
        model: process.env.GROQ_MODEL_FAST || 'openai/gpt-oss-20b',
        reason: 'all providers degraded; defaulting to groq',
        estimatedCost: 0
      };
    }

    // Intent-based preferences
    const intentPreferences: Record<AIIntent, AIProvider[]> = {
      chat: ['groq', 'anthropic', 'openai'],
      explanation: ['anthropic', 'groq', 'openai'],
      vision: ['groq', 'anthropic', 'openai'], // vision via groq multimodal
      study_plan: ['anthropic', 'groq', 'openai'],
      prediction: ['groq', 'anthropic', 'openai'],
      code: ['groq', 'anthropic', 'openai'],
      creative: ['groq', 'anthropic', 'openai'],
      analysis: ['anthropic', 'groq', 'openai'],
      summarization: ['groq', 'anthropic', 'openai'],
      translation: ['groq', 'anthropic', 'openai'],
      legal: ['anthropic', 'groq', 'openai'],
      unknown: ['groq', 'anthropic', 'openai']
    };

    const preferred = intentPreferences[intent] || ['groq', 'anthropic', 'openai'];

    // Score providers: health (latency, error rate), cost (remaining budget), preference order
    let best: { provider: AIProvider; score: number; reason: string } | null = null;

    for (let i = 0; i < preferred.length; i++) {
      const p = preferred[i];
      const h = this.health.get(p);
      const c = this.costs.get(p);

      if (!h || !c) continue;
      if (!h.healthy || h.errorRate >= 0.5) continue;
      if (c.remaining <= 0) continue; // budget exhausted

      // Score: lower latency is better, lower error rate is better, more remaining budget is better
      // Preference order gives bonus to earlier entries
      const latencyScore = Math.max(0, 1 - h.latency / 5000); // 5s = 0 score
      const errorScore = 1 - h.errorRate;
      const budgetScore = c.remaining / c.dailyLimit;
      const preferenceScore = 1 - i / preferred.length;

      const score = latencyScore * 0.3 + errorScore * 0.2 + budgetScore * 0.3 + preferenceScore * 0.2;

      if (!best || score > best.score) {
        best = {
          provider: p,
          score,
          reason: `intent=${intent}, healthy, latency=${h.latency}ms, budget remaining=$${c.remaining.toFixed(2)}`
        };
      }
    }

    if (!best) {
      return {
        provider: 'groq',
        model: process.env.GROQ_MODEL_FAST || 'openai/gpt-oss-20b',
        reason: 'no healthy provider with budget; defaulting to groq',
        estimatedCost: 0
      };
    }

    const model = best.provider === 'groq'
      ? process.env.GROQ_MODEL_FAST || 'openai/gpt-oss-20b'
      : best.provider === 'anthropic'
        ? 'claude-3-haiku-20240307'
        : 'gpt-4o-mini';

    const estimatedTokens = Math.ceil(messageLength / 4); // rough estimate
    const estimatedCost = (estimatedTokens / 1000) * DEFAULT_COSTS[best.provider];

    return {
      provider: best.provider,
      model,
      reason: best.reason,
      estimatedCost
    };
  }

  getHealth(): ProviderHealth[] {
    return [...this.health.values()];
  }

  getCosts(): ProviderCost[] {
    return [...this.costs.values()];
  }
}

export const providerRouter = new ProviderRouter();

// =====================================================
// 3. PII SCRUBBING (nothing leaks to long-term storage)
// =====================================================

const PII_PATTERNS = [
  // Email
  { name: 'email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[EMAIL]' },
  // Phone
  { name: 'phone', regex: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, replacement: '[PHONE]' },
  // SSN
  { name: 'ssn', regex: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN]' },
  // Credit card (rough)
  { name: 'cc', regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: '[CARD]' },
  // API keys (generic)
  { name: 'api_key', regex: /\b(sk|pk|rk|ghp|gho|glpat|xoxb)-[A-Za-z0-9]{16,}/g, replacement: '[API_KEY]' },
  // IP addresses
  { name: 'ip', regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, replacement: '[IP]' },
  // Names (rough heuristic - capitalized words at sentence start)
  { name: 'name', regex: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, replacement: '[NAME]' }
];

export function scrubPII(text: string): { scrubbed: string; piiFound: boolean } {
  let scrubbed = text;
  let piiFound = false;

  for (const { regex, replacement } of PII_PATTERNS) {
    if (regex.test(scrubbed)) {
      piiFound = true;
      scrubbed = scrubbed.replace(regex, replacement);
    }
  }

  return { scrubbed, piiFound };
}

// =====================================================
// 4. LIFECYCLE LOGGING
// =====================================================

export interface AILifecycleRecord {
  id: string;
  userId: string;
  timestamp: string;
  intent: AIIntent;
  intentConfidence: number;
  intentReasoning: string;
  provider: AIProvider;
  model: string;
  requestTokens: number;
  responseTokens: number;
  estimatedCost: number;
  actualCost: number;
  latencyMs: number;
  inputScrubbed: boolean;
  outputScrubbed: boolean;
  piiFoundInput: boolean;
  piiFoundOutput: boolean;
  status: 'success' | 'error' | 'rate_limited' | 'blocked';
  errorMessage?: string;
  rawInputHash: string; // SHA-256 of input (not the text itself)
  rawOutputHash: string; // SHA-256 of output (not the text itself)
  metadata: Record<string, any>;
}

export async function logLifecycle(record: Omit<AILifecycleRecord, 'id' | 'timestamp'>): Promise<string> {
  const db = getDatabase();
  const id = randomUUID();
  const timestamp = new Date().toISOString();

  db.prepare(
    `INSERT INTO ai_lifecycle (
      id, user_id, timestamp, intent, intent_confidence, intent_reasoning,
      provider, model, request_tokens, response_tokens, estimated_cost, actual_cost,
      latency_ms, input_scrubbed, output_scrubbed, pii_found_input, pii_found_output,
      status, error_message, raw_input_hash, raw_output_hash, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    record.userId,
    timestamp,
    record.intent,
    record.intentConfidence,
    record.intentReasoning,
    record.provider,
    record.model,
    record.requestTokens,
    record.responseTokens,
    record.estimatedCost,
    record.actualCost,
    record.latencyMs,
    record.inputScrubbed ? 1 : 0,
    record.outputScrubbed ? 1 : 0,
    record.piiFoundInput ? 1 : 0,
    record.piiFoundOutput ? 1 : 0,
    record.status,
    record.errorMessage || null,
    record.rawInputHash,
    record.rawOutputHash,
    JSON.stringify(record.metadata)
  );

  return id;
}

export async function getLifecycleLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<AILifecycleRecord[]> {
  const db = getDatabase();
  const rows = db.prepare(
    `SELECT * FROM ai_lifecycle WHERE user_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?`
  ).all(userId, limit, offset) as any[];

  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    timestamp: row.timestamp,
    intent: row.intent,
    intentConfidence: row.intent_confidence,
    intentReasoning: row.intent_reasoning,
    provider: row.provider,
    model: row.model,
    requestTokens: row.request_tokens,
    responseTokens: row.response_tokens,
    estimatedCost: row.estimated_cost,
    actualCost: row.actual_cost,
    latencyMs: row.latency_ms,
    inputScrubbed: Boolean(row.input_scrubbed),
    outputScrubbed: Boolean(row.output_scrubbed),
    piiFoundInput: Boolean(row.pii_found_input),
    piiFoundOutput: Boolean(row.pii_found_output),
    status: row.status,
    errorMessage: row.error_message,
    rawInputHash: row.raw_input_hash,
    rawOutputHash: row.raw_output_hash,
    metadata: JSON.parse(row.metadata || '{}')
  }));
}

export async function exportLifecycleLogs(
  userId: string,
  format: 'json' | 'csv' = 'json'
): Promise<{ data: string; filename: string; mimeType: string }> {
  const db = getDatabase();
  const rows = db.prepare(
    `SELECT * FROM ai_lifecycle WHERE user_id = ? ORDER BY timestamp DESC`
  ).all(userId) as any[];

  const records = rows.map(row => ({
    id: row.id,
    timestamp: row.timestamp,
    intent: row.intent,
    provider: row.provider,
    model: row.model,
    estimatedCost: row.estimated_cost,
    actualCost: row.actual_cost,
    latencyMs: row.latency_ms,
    status: row.status,
    piiFoundInput: Boolean(row.pii_found_input),
    piiFoundOutput: Boolean(row.pii_found_output)
  }));

  if (format === 'csv') {
    const headers = Object.keys(records[0] || {}).join(',');
    const lines = [headers, ...records.map(r => 
      Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    )];
    return {
      data: lines.join('\n'),
      filename: `ai-lifecycle-${userId}-${new Date().toISOString().slice(0,10)}.csv`,
      mimeType: 'text/csv'
    };
  }

  return {
    data: JSON.stringify(records, null, 2),
    filename: `ai-lifecycle-${userId}-${new Date().toISOString().slice(0,10)}.json`,
    mimeType: 'application/json'
  };
}

// Initialize lifecycle table
export async function initLifecycleTable() {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_lifecycle (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      intent TEXT NOT NULL,
      intent_confidence REAL NOT NULL,
      intent_reasoning TEXT,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      request_tokens INTEGER DEFAULT 0,
      response_tokens INTEGER DEFAULT 0,
      estimated_cost REAL DEFAULT 0,
      actual_cost REAL DEFAULT 0,
      latency_ms INTEGER DEFAULT 0,
      input_scrubbed INTEGER DEFAULT 0,
      output_scrubbed INTEGER DEFAULT 0,
      pii_found_input INTEGER DEFAULT 0,
      pii_found_output INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'success',
      error_message TEXT,
      raw_input_hash TEXT,
      raw_output_hash TEXT,
      metadata TEXT DEFAULT '{}',
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_ai_lifecycle_user ON ai_lifecycle(user_id);
    CREATE INDEX IF NOT EXISTS idx_ai_lifecycle_timestamp ON ai_lifecycle(timestamp);
    CREATE INDEX IF NOT EXISTS idx_ai_lifecycle_intent ON ai_lifecycle(intent);
    CREATE INDEX IF NOT EXISTS idx_ai_lifecycle_provider ON ai_lifecycle(provider);
    CREATE INDEX IF NOT EXISTS idx_ai_lifecycle_status ON ai_lifecycle(status);
  `);
}
