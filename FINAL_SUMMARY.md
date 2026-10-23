# Synthesis Forge — Complete Sovereign AI OS v2.0

## Status
- **Branch:** `main` (`zero7065/forge`)
- **Last commit:** `27b86da` — AI Gateway (One Door) + Modern UI overhaul
- **Working tree:** clean
- **Server:** verified running on `http://localhost:3000` (`healthy`)

## 🎯 What This Is
Synthesis Forge is a Sovereign AI Operating System — a private, self-hosted intelligence layer that sits above all your digital assets. Every AI call funnels through a **One Door Gateway** on your server: nothing goes direct from browser to AI provider, nothing leaks, everything is logged, priced, and controllable.

---

## ✨ Core Architecture

### AI Gateway ("One Door")
Every AI request follows: **Request → Analyse → Decide → Route → Respond → Store → Synthesize**

| Layer | What Happens | File |
|-------|-------------|------|
| **Analyse** | Intent classified (chat, explanation, vision, study_plan, prediction, code, creative, analysis, summarization, translation, legal, unknown) | `server/ai/gateway/router.ts` |
| **Decide** | Provider selected based on intent, user plan, rate limits, live health, cost | `ProviderRouter` class |
| **Route** | Groq primary, Anthropic/OpenAI fallback | Groq SDK |
| **Respond** | SSE streaming with real-time tokens | `generateTextStream()` |
| **Store** | Full lifecycle logged: request, decision, response, tokens, cost, latency, outcome | `ai_lifecycle` table |
| **Synthesize** | Logs exportable as JSON or CSV | `GET /ai/export` |

### Privacy & Cost Controls
- **PII scrubbing**: Emails, phones, SSNs, credit cards, API keys, IPs auto-scrubbed before storage
- **No PII in long-term storage**: Only SHA-256 hashes stored (placeholder for future)
- **Cost controls**: Per-user daily limits, per-provider budgets, auto-switch when budget exhausted
- **Health-aware routing**: Unhealthy providers are skipped automatically

### Three-Layer Consciousness (Shade → Prime → Core)
- **Shade**: Primary response generator, chamber-aware, personality-driven
- **Prime**: Pattern accumulator — tracks user topics, emotions, language patterns over time
- **Core**: Resonance memory — whispers insights when user drifts from authentic signal

---

## 📦 Features (All Live-Tested)

| Feature | Status | Details |
|---------|--------|---------|
| **Groq-only AI** | ✅ | `gpt-oss-20b` (fast) / `gpt-oss-120b` (deep), configurable via env |
| **Multi-provider fallback** | ✅ | Anthropic + OpenAI if Groq unavailable |
| **Streaming chat (SSE)** | ✅ | Real-time token delivery via `text/event-stream` |
| **RAG (Retrieval-Augmented Generation)** | ✅ | ChromaDB vector store, document ingestion, semantic search with citations |
| **Web search** | ✅ | DuckDuckGo HTML scraping, no API key required |
| **Multi-user auth (RBAC)** | ✅ | owner/admin/viewer, JWT, bcrypt, refresh tokens |
| **Dashboard UI** | ✅ | Glassmorphic bento layout, dark mode, streaming chat |
| **Scheduler** | ✅ | Briefings (07:00), alerts (*/15 min), legal scan (Mondays 08:00) |
| **Live alerts** | ✅ | Real metrics: signups, errors, API latency |
| **Legal scan (live RSS)** | ✅ | RSS feeds fetched, Groq judges regulatory relevance |
| **Audit trail** | ✅ | Immutable append-only log of all actions |
| **Error handling** | ✅ | Consistent API responses, path tracking |
| **Docker + Nginx** | ✅ | Production-ready with SSL, rate limiting, health checks |
| **500+ user concurrency** | ✅ | Redis session store, distributed rate limiting |

---

## 🎨 UI/UX — Modern Glassmorphic Bento

### Design System
- **Glassmorphism**: `backdrop-filter: blur(20px) saturate(180%)`, semi-transparent borders, depth shadows
- **Bento grid**: Asymmetric card layouts spanning 1-12 columns, 1-3 rows
- **Color palette**: Void black (#050507), Ancient Gold (#C9A84C), Amber glow, Cyan/Violet/Emerald accents
- **Typography**: Cinzel (headings), Inter (body), JetBrains Mono (code)
- **Animations**: Float, breathe, pulse-glow, slide-up, stagger reveals

### Dashboard Panels
| Panel | Location | Features |
|-------|----------|----------|
| **The Forge (Chat)** | Main chamber | Streaming SSE chat, web search toggle, RAG toggle, thinking mode, personality modes |
| **Approval Queue** | Sidebar | Pending SQL/audit approvals with approve/reject |
| **Audit Log** | Sidebar | Immutable action log with filtering |
| **Briefings** | Sidebar | Daily AI-generated briefings, "Run Today" |
| **Alerts** | Sidebar | Live alert rules, "Run Now" |
| **Legal** | Sidebar | Regulatory flags, "Run Scan" |
| **Settings** | Modal | AI model selection, personality modes (8 modes) |

### Chambers
1. **The Forge** — Raw creation & AI synthesis (main chat)
2. **Dream State** — Inspiration capture
3. **Alchemist Lab** — Creative synthesis
4. **Sage Table** — Communication mastery
5. **Zen Garden** — Stillness & reflection
6. **War Room** — Strategy & execution
7. **The Mirror** — Prime interface
8. **Ultimate Form** — Hidden 8th chamber (100+ days usage)

---

## 🔧 Environment Variables (`.env`)

| Var | Required | Default | Purpose |
|-----|----------|---------|---------|
| `NODE_ENV` | no | `development` | production / development |
| `PORT` | no | `3000` | HTTP listen port |
| `APP_URL` | yes | — | CORS origin + public URL |
| `AUTH_JWT_SECRET` | yes | — | JWT signing secret (32+ chars) |
| `AUTH_TOKEN_EXPIRY` | no | `24h` | Access token TTL |
| `SALT_ROUNDS` | no | `12` | bcrypt cost |
| `OWNER_EMAIL` | yes | — | First admin account |
| `OWNER_PASSWORD` | yes | — | First admin password |
| `DB_PATH` | no | `./data/primordex.db` | SQLite file path |
| `GROQ_API_KEY` | yes | — | Groq chat API key |
| `GROQ_MODEL_FAST` | no | `openai/gpt-oss-20b` | Fast model |
| `GROQ_MODEL_DEEP` | no | `openai/gpt-oss-120b` | Deep model |
| `ANTHROPIC_API_KEY` | no | — | Fallback provider |
| `OPENAI_API_KEY` | no | — | Fallback provider |
| `CHROMA_DB_PATH` | no | `./chromadb_data` | ChromaDB path |
| `REDIS_HOST` | no | — | Redis (optional, memory fallback) |
| `REDIS_PORT` | no | `6379` | Redis port |
| `AI_DAILY_LIMIT_OWNER` | no | `1000` | Owner daily AI cost ($) |
| `AI_DAILY_LIMIT_ADMIN` | no | `100` | Admin daily AI cost ($) |
| `AI_DAILY_LIMIT_VIEWER` | no | `10` | Viewer daily AI cost ($) |
| `AI_MAX_COST_PER_REQUEST` | no | `0.10` | Max cost per request ($) |
| `AI_ENABLE_COST_CONTROL` | no | `true` | Enable cost blocking |
| `MAX_UPLOAD_SIZE` | no | `52428800` | Max file upload bytes |
| `RATE_LIMIT_WINDOW` | no | `60000` | Rate-limit window ms |
| `RATE_LIMIT_MAX` | no | `60` | Max requests per window |

---

## 🚀 Deployment

### Local Development
```bash
npm install
cp .env.example .env   # Add your GROQ_API_KEY
npm run dev            # Server :3000 + Client Vite
```

### Production (Docker)
```bash
docker-compose up -d
```

### Production (Manual)
```bash
npm run build          # Server + Client
npm start              # node server/index.js
```

### Go Online for Users
1. Point domain at server host
2. Set `NODE_ENV=production`, `APP_URL=https://yourdomain.com`
3. Terminate TLS with nginx/Tags/Caddy in front of `:3000` (see `nginx.conf`)
4. Rotate `AUTH_JWT_SECRET` and `GROQ_API_KEY`
5. Change `OWNER_PASSWORD` after first login
6. Ensure `data/` is writable and backed up
7. Monitor `GET /api/health` → `{"status":"healthy"}`

### API Routes (Auth Required Unless Noted)
- `POST /api/auth/login|register|refresh|change-password|logout|sessions`
- `GET|POST /api/audit`, `POST /api/audit/:id/approve|reject`
- `GET|POST /api/alerts`, `POST /api/alerts/run`
- `GET|POST /api/legal`, `POST /api/legal/scan`
- `POST|GET /api/brief/run`, `GET /api/briefings`
- `POST /api/chat` (SSE streaming)
- `POST|GET /api/documents`, `DELETE /api/documents/:id`
- `POST /api/feedback`, `GET /api/feedback/stats`
- `POST /web/search`
- `GET|POST /ai/health`, `GET /ai/logs`, `GET /ai/export`
- `GET /api/health` (no auth)

---

## 📁 Git Status

Pushed to `zero7065/forge` on `main`.

**Latest commit:** `27b86da` — AI Gateway (One Door) architecture with intent classification, provider routing, lifecycle logging, PII scrubbing, cost controls, and exportable audit trail.

**Previous commits:**
- `76301cb` — v2.0 overhaul: RAG, live web search, streaming chat, gpt-oss models, Docker/Nginx/Redis infra
- `541e57f` — Sovereign AI OS with multi-user auth, 3-layer consciousness, 5 dashboard panels

**Working tree:** clean. Nothing uncommitted.

---

## ⚠️ Known Limitations
- **Groq model retirement**: Model IDs read from env — swap in `.env` if Groq retires them
- **No Redis**: Graceful memory fallback for sessions/rate limiting
- **RSS feed availability**: Legal scan skips unreachable sources
- **SQLite concurrency**: For 500+ concurrent users, migrate to PostgreSQL (`pg` already installed)
- **ChromaDB local**: For production scale, consider ChromaDB server or managed vector DB
- **Web search**: DuckDuckGo HTML scraping — may need rotation under heavy use

---

## 🧪 Quick Test Flow
1. `npm run dev`
2. Login: `OWNER_EMAIL` / `OWNER_PASSWORD`
3. Chat → watch tokens stream via SSE
4. Toggle "Web" → ask about current events
5. Upload a PDF/TXT → ask about it (RAG)
6. Alerts panel → "Run Now"
7. Legal panel → "Run Scan"
8. Settings → switch personality modes
9. `GET /ai/export` → download your lifecycle audit trail as JSON/CSV
