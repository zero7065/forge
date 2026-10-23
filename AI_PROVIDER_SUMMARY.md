# Synthesis Forge — AI Provider (Groq Only)

## Provider (`server/ai/provider.ts`)
- Imports `groq-sdk` only. Removed Gemini, Anthropic, OpenAI fallbacks from primary path (fallback retained in provider code).
- `generateText(options)` — Groq chat completions with system/user messages, temperature, maxTokens, JSON mode, tool use
- `generateEmbedding(text)` — Groq embedding attempt with local hash fallback
- Model selection driven by env:
  - `GROQ_MODEL_FAST` → `openai/gpt-oss-20b`
  - `GROQ_MODEL_DEEP` → `openai/gpt-oss-120b`
- Throws clear error if `GROQ_API_KEY` missing

## Streaming (`generateTextStream`)
- SSE-compatible async generator
- Yields tokens as they arrive from Groq

## Consciousness Layers
- **Shade** — primary response generator (chamber-aware, personality modes)
- **Prime** — pattern accumulator (`prime_patterns`, topic/emotion/language clusters)
- **Core** — resonance memory (`core_memory`) with whisper interrupt

## Env
`GROQ_API_KEY` (required), `GROQ_MODEL_FAST`, `GROQ_MODEL_DEEP`
