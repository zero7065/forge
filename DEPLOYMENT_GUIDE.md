# Deployment & Operations Guide — Synthesis Forge

## Prerequisites
- Node.js >= 18
- Groq API key (free): https://groq.com/
- 500 MB disk + 1 GB RAM (2 GB+ recommended)

## 1. Install
```bash
cd the-forge
npm install
```

## 2. Configure `.env`
Create `.env` at project root (never commit secrets):

```env
# Server
NODE_ENV=production
PORT=3000
APP_URL=https://yourdomain.com

# Auth
AUTH_JWT_SECRET=<generate-32+ random-chars>
AUTH_TOKEN_EXPIRY=24h
SALT_ROUNDS=12

# Owner bootstrap (change after first login)
OWNER_EMAIL=you@yourdomain.com
OWNER_PASSWORD=<strong-password>

# Database
DB_TYPE=sqlite
DB_PATH=./data/primordex.db

# Groq AI — sole AI provider
GROQ_API_KEY=<your-groq-key>
GROQ_MODEL_FAST=openai/gpt-oss-20b
GROQ_MODEL_DEEP=openai/gpt-oss-120b

# Vector store (ChromaDB path)
CHROMA_DB_PATH=./chromadb_data
EMBEDDING_MODEL=text-embedding-004

# Optional Redis (disabled by default; memory fallback works)
# REDIS_HOST=localhost
# REDIS_PORT=6379

# Scheduler
BRIEFING_TIME=07:00
ALERT_INTERVAL=900000
LEGAL_SCAN_DAY=1
LEGAL_SCAN_TIME=08:00

# Misc
MAX_UPLOAD_SIZE=52428800
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=60
CONSCIOUSNESS_STATE=ACTIVE
```

## 3. Optional config files
- `config/alerts.json` — alert rules (seed into `alert_rules` on boot)
- `config/legal-sources.json` — RSS sources for legal scan

Example `config/alerts.json`:
```json
[
  {"id":"signups_low","source":"app_users","metric":"signups","threshold":"<10","window":"1h","message":"Signups below 10/hour","enabled":true},
  {"id":"errors_spike","source":"system_logs","metric":"errors","threshold":">50","window":"15m","message":"Error spike","enabled":true}
]
```

## 4. Run (development)
```bash
npm run dev
```
Server: `:3000`, Client: Vite dev port. Login with `OWNER_EMAIL`/`OWNER_PASSWORD`.

## 5. Production build
```bash
npm run build      # npm run build:server + build:client
npm start          # node server/index.js
```

## 6. Go online for users
1. Point a domain at the server host (A record or reverse proxy).
2. Set `APP_URL=https://yourdomain.com`.
3. Terminate TLS with nginx/Traefik/Caddy in front of `:3000`; forward `/` and `/api/*` to the Node server.
4. Set `NODE_ENV=production` and a strong `AUTH_JWT_SECRET`.
5. Change `OWNER_PASSWORD` after first login.
6. Ensure `data/` directory is writable and backed up regularly.
7. (Optional) Configure `REDIS_HOST`/`REDIS_PORT` for distributed sessions/rate limiting across multiple server instances.
8. Monitor `GET /api/health` — expect `{"status":"healthy",...}`.

## Environment variable reference
| Var | Required | Default | Purpose |
|-----|----------|---------|---------|
| NODE_ENV | no | development | production / development |
| PORT | no | 3000 | HTTP listen port |
| APP_URL | yes | http://localhost:3000 | CORS origin + public URL |
| AUTH_JWT_SECRET | yes | — | JWT signing secret (32+ chars) |
| AUTH_TOKEN_EXPIRY | no | 24h | Access token TTL |
| SALT_ROUNDS | no | 12 | bcrypt cost |
| OWNER_EMAIL | yes | — | First admin account |
| OWNER_PASSWORD | yes | — | First admin password |
| DB_PATH | no | ./data/primordex.db | SQLite file path |
| GROQ_API_KEY | yes | — | Groq chat API key |
| GROQ_MODEL_FAST | no | openai/gpt-oss-20b | Fast model |
| GROQ_MODEL_DEEP | no | openai/gpt-oss-120b | Deep model |
| CHROMA_DB_PATH | no | ./chromadb_data | ChromaDB path |
| EMBEDDING_MODEL | no | text-embedding-004 | Embedding model name |
| REDIS_HOST | no | — | Redis host (optional) |
| REDIS_PORT | no | 6379 | Redis port |
| MAX_UPLOAD_SIZE | no | 52428800 | Max file upload bytes |
| RATE_LIMIT_WINDOW | no | 60000 | Rate-limit window ms |
| RATE_LIMIT_MAX | no | 60 | Max requests per window |

## API routes (auth required unless noted)
- `POST /api/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/change-password`, `/auth/logout`, `/auth/sessions`
- `GET /api/audit`, `POST /api/audit/:id/approve|reject`
- `GET /api/alerts`, `POST /api/alerts/run`
- `GET /api/legal`, `POST /api/legal/scan`
- `POST /api/brief/run`, `GET /api/briefings`
- `POST /api/chat`, `GET /api/health`

## Security notes
- SQLite file contains password hashes — restrict filesystem perms on `data/`.
- Rotate `AUTH_JWT_SECRET` and `GROQ_API_KEY` periodically.
- Use HTTPS in production; `secure` cookies are only set when `NODE_ENV=production`.
- Do not commit `.env`.
