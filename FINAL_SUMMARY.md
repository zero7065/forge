# Synthesis Forge — Complete Sovereign AI OS (Production Summary)

## Status
- **Branch:** `main` (`zero7065/forge`)
- **Last commit:** `5828cea` — live-data pass
- **Working tree:** clean
- **Server:** verified running on `http://localhost:3000` (`healthy`)

## Architecture
**Tech stack:** Node.js + Express + TypeScript + Vite + React 18 + Tailwind CSS + SQLite (`better-sqlite3`) + Groq SDK (AI only)
**Deployment model:** Local-first / self-hosted. Zero cloud dependencies for core logic. One external call: Groq chat API.

## AI — Groq Only
- `server/ai/provider.ts` — Groq SDK only. No Gemini/Anthropic/OpenAI.
- Models: `GROQ_MODEL_FAST` (default `openai/gpt-oss-20b`), `GROQ_MODEL_DEEP` (default `openai/gpt-oss-120b`)
- Model IDs read from env at runtime; swap keys in `.env` to change models.
- `generateEmbedding` uses local hash fallback (Groq has no public embeddings endpoint).

## Three-Layer Consciousness (Shade → Prime → Core)
- **Shade** (`server/ai/consciousness/shade.ts`) — generates the primary chat response using SOUL_STATEMENT + chamber rules + prime insights + core whisper.
- **Prime** (`server/ai/consciousness/prime.ts`) — accumulates patterns per user (topic/emotion/language) into `prime_patterns`; derives topic clusters, emotional arc, recommended prompt.
- **Core** (`server/ai/consciousness/core.ts`) — resonance memory in `core_memory`; can interrupt Shade with a whisper when resonance > 0.7.

## Features Implemented (verified live)
| Feature | Status | Detail |
|---------|--------|--------|
| Auth / RBAC | ✅ | JWT + bcrypt, owner/admin/viewer, refresh token, login lockout |
| DB / migrations | ✅ | 27+ tables, auto-migrate, idempotent (`INSERT OR IGNORE`) |
| Pattern knowledge bank | ✅ | `prime_patterns`, `prime_insights`, `core_memory` |
| Live chat pipeline | ✅ | emotion → prime → core → shade; Groq-backed |
| 5 Dashboard panels | ✅ | ApprovalQueue, AuditViewer, BriefingsViewer, AlertsPanel, LegalViewer |
| Alerts (live) | ✅ | `GET/POST /api/alerts`, seeded from `config/alerts.json`, live metrics |
| Legal scan (live RSS + Groq) | ✅ | `POST /api/legal/scan`, RSS fetched, Groq judges relevance, flags saved |
| Briefings | ✅ | `POST /api/brief/run`, `GET /api/briefings` |
| NL→SQL + approval | ✅ | `POST /api/chat` audit, `POST /api/audit/:id/approve|reject` |
| Audit trail | ✅ | Immutable `audit_log`, append-only |
| Webhook receiver | ✅ | `server/connectors/webhook-receiver.ts` |
| Scheduler | ✅ | node-cron: briefings 07:00, alerts */15 min, legal Mondays 08:00 |
| Error handling | ✅ | `errorHelper`/`successHelper`, consistent responses |

## Deployment Readiness
- Server boots and listens on `PORT` (default 3000).
- Redis optional; gracefully falls back to memory store when absent.
- Sessions: `express-session` with memory store by default; Redis session store if `REDIS_HOST` set.
- Health endpoint: `GET /api/health` → `{"status":"healthy","checks":{"database":"ok","redis":"memory-fallback"}}`

## Notes
- `.env` contains secrets and is **gitignored**; it was never committed.
- Push to `zero7065/forge` `main` succeeded.
- Legal scan depends on live RSS sources; disable unreachable URLs in `config/legal-sources.json` if needed.
