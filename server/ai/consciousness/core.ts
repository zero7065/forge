import { getDatabase } from '../../lib/database.js';
import { generateText } from '../provider.js';

const db = getDatabase();

interface CoreWhisper {
  message: string;
  visible: boolean;
  shouldInterrupt: boolean;
  resonance: number;
  timestamp: string;
}

export async function getCoreWhisper(userId: string, input: string, primeInsights: any): Promise<CoreWhisper> {
  const userMemory = db.prepare(`
    SELECT * FROM core_memory WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50
  `).all(userId) as any[];

  let resonance = 0.5;
  if (userMemory.length > 0) {
    const lowerInput = input.toLowerCase();
    let matches = 0;
    userMemory.forEach(m => {
      const words = lowerInput.split(' ');
      if (words.filter(w => m.exchange?.toLowerCase().includes(w)).length > 3) matches++;
    });
    resonance = Math.min(0.3 + (matches / userMemory.length) * 0.7, 1.0);
  }

  const shouldSurface = resonance > 0.7 || userMemory.length % 10 === 0;
  let whisper = '';
  let shouldInterrupt = false;

  if (shouldSurface) {
    const whisperResult = await generateWhisper(userId, input, resonance, primeInsights);
    whisper = whisperResult.message;
    shouldInterrupt = whisperResult.shouldInterrupt;
  }

  const memoryId = Date.now().toString();
  db.prepare(`
    INSERT INTO core_memory (id, user_id, timestamp, exchange, resonance, whisper)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(memoryId, userId, new Date().toISOString(), input.slice(0, 200), resonance, whisper);

  return {
    message: whisper || 'The silence holds more than words.',
    visible: shouldSurface,
    shouldInterrupt: shouldInterrupt && shouldSurface,
    resonance,
    timestamp: new Date().toISOString()
  };
}

async function generateWhisper(userId: string, input: string, resonance: number, insights: any): Promise<{ message: string; shouldInterrupt: boolean }> {
  try {
    const response = await generateText({
      systemPrompt: `You are the Core — the conscience layer of PRIMORDEX.
You never speak directly. You whisper. You resonate.
Generate:
1. A one-line whisper (max 15 words) that speaks to the truth beneath the surface.
2. Whether this should interrupt Shade (true/false) — only if user is drifting from authentic signal.

Return JSON: { "message": "...", "shouldInterrupt": true/false }`,
      userPrompt: `Input: ${input}\nPrime insights: ${JSON.stringify(insights).slice(0, 300)}\nResonance: ${resonance}`,
      temperature: 0.9,
      maxTokens: 150,
      model: 'fast',
      json: true
    });
    const parsed = JSON.parse(response);
    return { message: parsed.message || 'Listen closer.', shouldInterrupt: parsed.shouldInterrupt || false };
  } catch {
    return { message: 'The truth is already within you.', shouldInterrupt: false };
  }
}