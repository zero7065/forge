# BEYOND V2.1: The Sovereign AI Operating System

**A full-stack, local-first sovereign AI platform for consciousness-driven task execution.**

Credit: Built by Jadai Studios ([jadai.dev](https://jadai.dev))

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — required vars:
#   AUTH_JWT_SECRET=<random 32+ chars>
#   OWNER_EMAIL=you@email.com
#   OWNER_PASSWORD=YourSecurePass123!
#   GEMINI_API_KEY=your-key  (optional, uses Ollama fallback)

# 3. Run (client + server)
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3000
- Health: http://localhost:3000/health

---

## Architecture

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | React 18, Tailwind, Framer Motion | 7-chamber sovereign UI |
| Backend | Node.js, Express, TypeScript | REST API, auth, AI orchestration |
| Database | SQLite (better-sqlite3) | Users, projects, patterns, audit |
| Auth | JWT, bcrypt, session tracking | Multi-session, role-based access |
| AI | Gemini / Groq / Ollama | Local-first with cloud fallback |
| Billing | Paystack (NGN) | 3-tier subscriptions |
| GitHub | OAuth, REST API | Repo management, file editing, PRs |

---

## BEYOND Chambers

| # | Chamber | Route | Purpose |
|---|---------|-------|---------|
| 1 | **Forge** | `/chamber/forge` | AI chat, consciousness, task execution |
| 2 | **Vault** | `/chamber/vault` | Knowledge base, document ingestion, semantic search |
| 3 | **Sentinel** | `/chamber/sentinel` | Monitoring, alerts, system health |
| 4 | **Archive** | `/chamber/archive` | Audit logs, reports, statistics |
| 5 | **Oracle** | `/chamber/oracle` | Strategy, prediction, pattern analysis |
| 6 | **Soul Forge** | `/chamber/soul-forge` | Emotional frequency, learning states |
| 7 | **Ultimate Form** | `/chamber/ultimate-form` | Voice-to-text, collaborative war room, training export |
| 8 | **The Mirror** | `/the-mirror` | Hidden chamber (8th) |

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/beyond/auth/register` | Create account |
| POST | `/api/beyond/auth/login` | Login, returns JWT |
| POST | `/api/beyond/auth/verify` | Verify token |
| GET | `/api/auth/me` | Current user |

### Chat & AI
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/beyond/chat` | Send message (authenticated) |
| POST | `/api/beyond/analyze-code` | Code analysis |
| POST | `/api/beyond/generate-link-preview` | Link preview |

### GitHub Integration
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/github/status` | Connection status |
| GET | `/api/github/oauth/url` | Get OAuth URL |
| GET | `/api/github/oauth/callback` | OAuth callback |
| GET | `/api/github/repos` | List repos |
| GET | `/api/github/repos/:owner/:repo/files` | Browse files |
| GET | `/api/github/repos/:owner/:repo/file` | Read file |
| PUT | `/api/github/repos/:owner/:repo/file` | Save file |
| POST | `/api/github/repos/:owner/:repo/commit` | Commit changes |
| POST | `/api/github/repos/:owner/:repo/branch` | Create branch |
| GET | `/api/github/repos/:owner/:repo/pullrequests` | List PRs |
| POST | `/api/github/repos/:owner/:repo/pullrequests` | Create PR |
| DELETE | `/api/github/repos/:owner/:repo/collaborators/:username` | Remove collaborator |

### Billing & Usage
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/beyond/usage` | Usage summary |
| POST | `/api/billing/paystack/webhook` | Payment webhook |

### Portal
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/portal/auth/register` | Portal user registration |
| POST | `/api/portal/auth/login` | Portal login |

---

## Security

- **Env validation**: Fails fast on startup if `AUTH_JWT_SECRET` or `OWNER_PASSWORD` missing
- **Rate limiting**: Auth (20/15min), chat (30/min), upload (10/hr), global (100/min)
- **Input validation**: Zod schemas on all endpoints
- **Helmet**: CSP, XSS protection, frame deny, HSTS
- **File upload**: Whitelist (images, PDFs, docs, code), 2MB limit
- **Password policy**: 12+ chars, uppercase, lowercase, number, special char
- **Session management**: Multi-device, revocation support

---

## Docker

```bash
docker build -t beyond .
docker run -p 3000:3000 -e AUTH_JWT_SECRET=secret -e OWNER_EMAIL=admin@example.com -e OWNER_PASSWORD=SecurePass123! beyond
```

---

## Project Structure

```
server/
  index.ts              — Express app, middleware, graceful shutdown
  auth/                 — JWT auth, password hashing, session management
  api/                  — Route handlers (beyond, portal, github, billing)
  ai/                   — AI providers, consciousness (Prime/Shade/Core), knowledge seeds
  billing/              — Usage tracking, plan definitions, Paystack webhooks
  lib/                  — Database, env validation, logger, security, validation
  scheduler/            — Memory consolidation cron jobs

client/src/
  pages/                — Landing, Dashboard, Inner Sanctum, The Mirror
  components/
    chambers/           — ForgeChat, Vault, Sentinel, Archive, Oracle, SoulForge, UltimateForm, TheMirror
    common/             — ErrorBoundary, Background, Navigation, SacredGeometry
    github/             — GitHubConnect (OAuth, repo browser, file editor)
  auth/                 — AuthContext, Login, Register, ProtectedRoute
  hooks/                — useSpeech (Web Speech + Whisper)
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AUTH_JWT_SECRET` | Yes | — | JWT signing secret (min 32 chars) |
| `OWNER_EMAIL` | Yes | — | Initial owner account email |
| `OWNER_PASSWORD` | Yes | — | Initial owner password (12+ chars) |
| `PORTAL_JWT_SECRET` | Yes | `AUTH_JWT_SECRET` | Portal JWT secret |
| `PORT` | No | `3000` | Server port |
| `VITE_GEMINI_API_KEY` | No | — | Gemini API key (client) |
| `GEMINI_API_KEY` | No | — | Gemini API key (server) |
| `GROQ_API_KEY` | No | — | Groq API key |
| `GITHUB_CLIENT_ID` | No | — | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | No | — | GitHub OAuth client secret |
| `PAYSTACK_SECRET_KEY` | No | — | Paystack webhook secret |

---

## TypeScript

```bash
npx tsc --noEmit   # Must pass with zero errors
```

---

## License

**2026 Jadai Studios. Sovereign Architecture for the Sovereign Mind.**
