import { GoogleGenerativeAI } from '@google/generative-ai';
import { Groq } from 'groq-sdk';
import { randomUUID } from 'crypto';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const gemini = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

const GEM_KEY = GEMINI_API_KEY || '';

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

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${userPrompt}` : userPrompt;

  // Try Groq first (fastest)
  if (groq) {
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
    } catch (error) {
      console.warn('Groq failed, trying next provider:', error);
    }
  }

  // Try Gemini
  if (gemini) {
    try {
      const geminiModel = model === 'deep' ? 'gemini-2.0-flash' : 'gemini-1.5-flash';
      const genModel = gemini.getGenerativeModel({ model: geminiModel });
      const result = await genModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens }
      });
      return result.response.text();
    } catch (error) {
      console.warn('Gemini failed:', error);
    }
  }

  // Try Anthropic
  if (ANTHROPIC_API_KEY) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        })
      });
      const data = await response.json() as any;
      return data.content[0]?.text || '';
    } catch (error) {
      console.warn('Anthropic failed:', error);
    }
  }

  // Try OpenAI
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: userPrompt }
          ],
          temperature,
          max_tokens: maxTokens
        })
      });
      const data = await response.json() as any;
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.warn('OpenAI failed:', error);
    }
  }

  throw new Error('All AI providers failed. Check API keys.');
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.warn('Gemini embedding failed:', error);
    }
  }

  // Fallback: return zero vector
  return new Array(768).fill(0);
}