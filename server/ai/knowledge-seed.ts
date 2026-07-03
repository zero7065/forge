import { getDatabase } from '../lib/database.js';
import { generateText } from './provider.js';

const db = getDatabase();

export async function detectKnowledgeGaps(userId: string): Promise<string[]> {
  const patterns = db.prepare('SELECT DISTINCT content FROM prime_patterns WHERE user_id = ? ORDER BY frequency DESC LIMIT 20').all(userId) as any[];
  const topics = patterns.map(p => p.content).filter(Boolean);

  const existingEntries = db.prepare('SELECT DISTINCT topic FROM knowledge_entries').all() as any[];
  const existingTopics = new Set(existingEntries.map(t => t.topic?.toLowerCase()));

  const gaps = topics.filter(topic => topic && !existingTopics.has(topic.toLowerCase()));
  return gaps.slice(0, 5);
}

export async function generateKnowledgeSeed(gap: string): Promise<any> {
  const content = await generateText({
    systemPrompt: `You are PRIMORDEX. Generate a comprehensive knowledge entry about "${gap}".

Include:
1. A clear definition/explanation
2. Key principles or concepts
3. How this relates to consciousness, creativity, or technology
4. Why this matters
5. Practical application

Write in the Jadai voice — layered, philosophical, and deeply grounded.
Target 200-400 words.`,
    userPrompt: `Create a knowledge seed for: ${gap}`,
    temperature: 0.8,
    maxTokens: 1200,
    model: 'deep'
  });

  const id = `seed_${Date.now()}`;
  const tags = JSON.stringify([gap, 'generated']);

  db.prepare('INSERT INTO knowledge_entries (id, topic, subtopic, content, tags) VALUES (?, ?, ?, ?, ?)').run(id, gap, 'Auto-generated', content, tags);

  return { id, topic: gap, content };
}

export async function runKnowledgeSeedGeneration(userId: string): Promise<any[]> {
  const gaps = await detectKnowledgeGaps(userId);
  const results = [];
  for (const gap of gaps) {
    try {
      const seed = await generateKnowledgeSeed(gap);
      results.push(seed);
    } catch (error) {
      console.error(`Failed to generate seed for ${gap}:`, error);
    }
  }
  return results;
}
