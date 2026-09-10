import { Groq } from 'groq-sdk';
import { randomUUID } from 'crypto';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

const GROQ_KEY = GROQ_API_KEY || '';

interface GenerateOptions {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  model?: 'fast' | 'deep';
  json?: boolean;
}

export async function generateText(options: GenerateOptions): Promise<string> {
  const {
    systemPrompt,
    userPrompt,
    temperature = 0.7,
    maxTokens = 2000,
    model = 'fast',
    json = false
  } = options;

  // Groq ONLY - no fallback to other providers
  if (!groq) {
    throw new Error('Groq API key not configured. Set GROQ_API_KEY in .env');
  }

  try {
    const groqModel = model === 'deep' ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant';
    const completion = await groq.chat.completions.create({
      messages: [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        { role: 'user' as const, content: userPrompt }
      ],
      model: groqModel,
      temperature,
      max_tokens: maxTokens,
      response_format: json ? { type: 'json_object' } : undefined
    });
    return completion.choices[0].message.content || '';
  } catch (error: any) {
    console.error('Groq AI error:', error.message);
    throw new Error(`Groq AI failed: ${error.message}`);
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // Groq embedding (using their default model or local fallback)
  if (groq) {
    try {
      const result: any = await groq.embeddings.create({
        model: 'all-MiniLM-L6-v2',
        input: text
      });
      // Handle both string and number[] return types
      const embedding = result.data?.[0]?.embedding;
      if (Array.isArray(embedding)) {
        return embedding;
      }
      // If string, convert to number array
      if (typeof embedding === 'string') {
        const encoder = new TextEncoder();
        const data = encoder.encode(embedding);
        const arr = new Uint8Array(data);
        return Array.from(arr.slice(0, 768).map(b => b / 255.0));
      }
      // Fallback: create from text hash
      return localEmbedding(text);
    } catch (error) {
      console.warn('Groq embedding failed, using local fallback');
    }
  }

  // Local fallback
  return localEmbedding(text);
}

function localEmbedding(text: string): number[] {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const arr = new Uint8Array(data);
  const embedding = new Array(768).fill(0);
  for (let i = 0; i < Math.min(arr.length, 768); i++) {
    embedding[i] = arr[i] / 255.0;
  }
  return embedding;
}