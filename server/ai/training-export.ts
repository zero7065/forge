import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth/auth-service.js';
import { getDatabase } from '../lib/database.js';
import { getPrimeInsights } from './consciousness/prime.js';

const router = Router();
const db = getDatabase();

router.get('/export/training', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const patterns = db.prepare('SELECT * FROM prime_patterns WHERE user_id = ? ORDER BY timestamp').all(userId) as any[];
    const coreMemory = db.prepare('SELECT * FROM core_memory WHERE user_id = ? ORDER BY timestamp').all(userId) as any[];
    const insights = await getPrimeInsights(userId, null);
    const conversations = db.prepare("SELECT * FROM audit_log WHERE actor = ? AND action = 'chat_message' ORDER BY created_at").all(userId) as any[];

    const trainingData = {
      user_id: userId,
      export_date: new Date().toISOString(),
      version: '1.0',
      patterns: patterns.map(p => ({
        category: p.category,
        content: p.content,
        frequency: p.frequency,
        intensity: p.intensity,
        timestamp: p.timestamp
      })),
      core_memory: coreMemory.map(m => ({
        exchange: m.exchange,
        resonance: m.resonance,
        whisper: m.whisper,
        timestamp: m.timestamp
      })),
      insights: {
        summary: insights.summary,
        topic_clusters: insights.topicClusters,
        emotional_arc: insights.emotionalArc
      },
      conversations: conversations.map(c => ({
        input: c.input,
        output: c.output,
        timestamp: c.timestamp
      }))
    };

    const trainingInstruction = `
# PRIMORDEX Prime Model Training Data

## Dataset
${trainingData.patterns.length} patterns, ${trainingData.core_memory.length} core memories, ${trainingData.conversations.length} conversations.

## Convert to JSONL
\`\`\`python
import json
with open('primordex_export.json') as f:
    data = json.load(f)
training_data = [{'instruction': 'You are PRIMORDEX.', 'input': c['input'], 'output': c['output']} for c in data['conversations']]
with open('training_data.jsonl', 'w') as f:
    for item in training_data:
        f.write(json.dumps(item) + '\\n')
\`\`\`

## Recommended Hyperparameters
- Learning Rate: 2e-4, Batch Size: 4, Epochs: 3
- LoRA Rank: 16, Alpha: 32
- Target: q_proj, k_proj, v_proj, o_proj
- Model: meta-llama/Llama-3.1-8B-Instruct
`;

    res.json({ data: trainingData, instruction: trainingInstruction, format: 'jsonl', recommendedModel: 'llama-3.1-8b-instruct' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as trainingRouter };
