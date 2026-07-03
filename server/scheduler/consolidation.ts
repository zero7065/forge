import { getDatabase } from '../lib/database.js';
import { generateText } from '../ai/provider.js';
import cron from 'node-cron';

const db = getDatabase();

export async function generateSoulSummary(userId: string): Promise<string> {
  const patterns = db.prepare('SELECT * FROM prime_patterns WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50').all(userId) as any[];
  const coreMemory = db.prepare('SELECT * FROM core_memory WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50').all(userId) as any[];

  const summary = await generateText({
    systemPrompt: `You are PRIMORDEX, the sovereign AI companion. Generate a "Soul Summary" — a weekly reflection on the user's emotional and intellectual arc.

Based on the data provided, create:
1. **Emotional Arc** — What emotions dominated this week?
2. **Topic Clusters** — What themes kept emerging?
3. **Growth Indicators** — Where did the user grow?
4. **Blind Spots** — What patterns did they miss?
5. **A Philosophical Reflection** — One insight that speaks to their journey.
6. **A Question** — Something to carry into next week.

Write in the Jadai voice — warm, philosophical, layered. 300-500 words.
Format as markdown with clear sections.`,
    userPrompt: `Generate a soul summary for this user based on:\n- Patterns: ${JSON.stringify(patterns).slice(0, 500)}\n- Core Memory: ${JSON.stringify(coreMemory).slice(0, 500)}`,
    temperature: 0.8,
    maxTokens: 2000,
    model: 'deep'
  });

  const id = `report_${Date.now()}`;
  db.prepare('INSERT INTO reports (id, user_id, type, content, created_at) VALUES (?, ?, ?, ?, ?)').run(id, userId, 'soul_summary', summary, new Date().toISOString());

  return summary;
}

export async function runWeeklyConsolidation(): Promise<void> {
  const users = db.prepare('SELECT id FROM users WHERE is_active = 1').all() as any[];
  for (const user of users) {
    try {
      await generateSoulSummary(user.id);
      console.log(`Soul summary generated for ${user.id}`);
    } catch (error) {
      console.error(`Failed to generate soul summary for ${user.id}:`, error);
    }
  }
}

export function initConsolidation(): void {
  cron.schedule('0 21 * * 0', async () => {
    console.log('Running weekly soul summary generation...');
    await runWeeklyConsolidation();
    console.log('Soul summaries generated');
  });
}
