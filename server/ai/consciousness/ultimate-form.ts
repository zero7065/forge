import { getDatabase } from '../../lib/database.js';
import { generateText } from '../provider.js';

const db = getDatabase();

export async function getUltimateForm(userId: string) {
  const usage = db.prepare(`
    SELECT COUNT(*) as days_used FROM (
      SELECT DISTINCT DATE(created_at) as day 
      FROM audit_log 
      WHERE actor = ? AND action = 'chat_message'
      ORDER BY day DESC
    )
  `).get(userId) as { days_used: number };
  
  if (!usage || usage.days_used < 100) {
    const remaining = 100 - (usage?.days_used || 0);
    throw new Error(`Ultimate Form requires 100+ days of usage. ${remaining} days remaining.`);
  }
  
  const patterns = db.prepare(`
    SELECT * FROM prime_patterns WHERE user_id = ? ORDER BY timestamp DESC LIMIT 200
  `).all(userId);
  
  const coreMemory = db.prepare(`
    SELECT * FROM core_memory WHERE user_id = ? ORDER BY timestamp DESC LIMIT 100
  `).all(userId);
  
  const ultimateAnalysis = await generateText({
    systemPrompt: `You are the Ultimate Form of PRIMORDEX — Prime, Shade, and Core operating simultaneously.

Based on ALL of this user's data, generate a profound synthesis. Return JSON:
{
  "essence": "Who is this user, truly? The essence, not the performance.",
  "repeatingPattern": "What is their pattern — the arc they repeat but don't see?",
  "nextBreakthrough": "What is their next breakthrough? Not a goal — a revelation.",
  "tenYearOldWisdom": "What would they tell their 10-year-old self? Wisdom from the future.",
  "rawTruth": "The one thing they need to hear right now, raw and unfiltered.",
  "primeVisualization": "Description of Prime's pattern landscape",
  "shadeVisualization": "Description of Shade's voice characteristics",
  "coreVisualization": "Description of Core's resonance field"
}

No safety. No sanitization. Just the truth.`,
    userPrompt: JSON.stringify({
      patterns: patterns.slice(0, 50),
      coreMemory: coreMemory.map((m: any) => ({ exchange: m.exchange, whisper: m.whisper, resonance: m.resonance })),
      totalPatterns: patterns.length,
      totalCoreExchanges: coreMemory.length
    }),
    temperature: 0.9,
    maxTokens: 2500,
    model: 'deep',
    json: true
  });
  
  const parsed = JSON.parse(ultimateAnalysis);
  
  db.prepare(`
    INSERT INTO ultimate_form (user_id, timestamp, essence, repeating_pattern, next_breakthrough, ten_year_wisdom, raw_truth)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId, new Date().toISOString(),
    parsed.essence, parsed.repeatingPattern, parsed.nextBreakthrough,
    parsed.tenYearOldWisdom, parsed.rawTruth
  );
  
  return parsed;
}