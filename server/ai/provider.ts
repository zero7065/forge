// AI Provider — Multi-provider (Groq primary, Anthropic/OpenAI fallback), tool use, streaming, thinking mode
import { Groq } from 'groq-sdk';
import { Anthropic } from '@anthropic-ai/sdk';
import { randomUUID } from 'crypto';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
}

export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface AIOptions {
  systemPrompt?: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: 'fast' | 'deep';
  json?: boolean;
  stream?: boolean;
  onToken?: (token: string) => void;
  tools?: any[];
  thinking?: boolean;
}

export interface AIResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage?: { input: number; output: number };
  model: string;
}

const DEFAULT_FAST = process.env.GROQ_MODEL_FAST || 'openai/gpt-oss-20b';
const DEFAULT_DEEP = process.env.GROQ_MODEL_DEEP || 'openai/gpt-oss-120b';

export async function generateText(options: AIOptions): Promise<AIResponse> {
  const {
    systemPrompt,
    messages,
    temperature = 0.7,
    maxTokens = 2000,
    model = 'fast',
    json = false,
    stream = false,
    onToken,
    tools,
    thinking = false
  } = options;

  const groqModel = model === 'deep' ? DEFAULT_DEEP : DEFAULT_FAST;

  // Build messages for Groq (OpenAI-compatible format)
  const groqMessages = [];
  if (systemPrompt) {
    groqMessages.push({ role: 'system', content: systemPrompt });
  }
  for (const m of messages) {
    if (m.role === 'tool') {
      groqMessages.push({ role: 'tool', tool_call_id: m.tool_call_id, content: m.content });
    } else {
      groqMessages.push({ role: m.role, content: m.content });
    }
  }

  // Try Groq first (primary)
  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        messages: groqMessages,
        model: groqModel,
        temperature,
        max_tokens: maxTokens,
        response_format: json ? { type: 'json_object' } : undefined,
        tools: tools ? tools.map(t => ({ type: 'function', function: t })) : undefined,
        tool_choice: tools ? 'auto' : undefined,
        stream: false
      });

      const choice = completion.choices[0];
      const message = choice.message;

      if (message.tool_calls && message.tool_calls.length > 0) {
        return {
          content: message.content || '',
          toolCalls: message.tool_calls.map((tc: any) => ({
            name: tc.function.name,
            arguments: JSON.parse(tc.function.arguments || '{}')
          })),
          model: groqModel,
          usage: { input: completion.usage?.prompt_tokens || 0, output: completion.usage?.completion_tokens || 0 }
        };
      }

      return {
        content: message.content || '',
        model: groqModel,
        usage: { input: completion.usage?.prompt_tokens || 0, output: completion.usage?.completion_tokens || 0 }
      };
    } catch (error: any) {
      console.warn('Groq failed, trying fallback:', error.message);
    }
  }

  // Fallback: Anthropic
  if (anthropic) {
    try {
      const response = await anthropic.messages.create({
        model: model === 'deep' ? 'claude-3-5-sonnet-20241022' : 'claude-3-haiku-20240307',
        system: systemPrompt || '',
        messages: messages.map(m => ({
          role: m.role === 'tool' ? 'user' : m.role,
          content: m.content
        })),
        max_tokens: maxTokens,
        temperature
      });

      const text = response.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('');
      return {
        content: text,
        model: response.model,
        usage: { input: response.usage.input_tokens, output: response.usage.output_tokens }
      };
    } catch (error: any) {
      console.warn('Anthropic failed:', error.message);
    }
  }

  throw new Error('All AI providers failed. Check API keys.');
}

// Streaming generation (SSE-compatible)
export async function* generateTextStream(options: AIOptions): AsyncGenerator<string> {
  const {
    systemPrompt,
    messages,
    temperature = 0.7,
    maxTokens = 2000,
    model = 'fast',
    tools,
    thinking = false
  } = options;

  const groqModel = model === 'deep'
    ? (process.env.GROQ_MODEL_DEEP || 'openai/gpt-oss-120b')
    : (process.env.GROQ_MODEL_FAST || 'openai/gpt-oss-20b');

  const groqMessages = [];
  if (systemPrompt) groqMessages.push({ role: 'system', content: systemPrompt });
  for (const m of messages) {
    groqMessages.push({ role: m.role as any, content: m.content });
  }

  if (groq) {
    try {
      const stream = await groq.chat.completions.create({
        messages: groqMessages,
        model: groqModel,
        temperature,
        max_tokens: maxTokens,
        tools: tools ? tools.map(t => ({ type: 'function', function: t })) : undefined,
        tool_choice: tools ? 'auto' : undefined,
        stream: true
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          yield delta.content;
        }
      }
      return;
    } catch (error: any) {
      console.warn('Groq stream failed:', error.message);
    }
  }

  // Fallback non-streaming
  const result = await generateText({ ...options, stream: false });
  yield result.content;
}

export { groq, anthropic };
