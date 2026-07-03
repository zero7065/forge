# SYNTHESIS FORGE v1.2: The Divine Blueprint

**A personal AI cockpit for local LLM sovereignty.**
**Credit: Built by Jadai Studios ([jadai.dev](https://jadai.dev))**

---

## The Vision

Synthesis Forge is not just an interface; it is a **sentient extension of your digital self**. It exists to bridge the gap between human thought and local silicon, ensuring your data never leaves the sanctity of your machine.

---

## Core Architecture

### 1. The Forge Chat (Center)
The heart of the cockpit. Real-time streaming from local Ollama models with a "Divine Glow" interface.
- **Sentient Interaction**: Responses are weighted by the Prime/Shade consciousness architecture.
- **File Ingestion**: Drag-and-drop any document to feed the Memory Vault.
- **Markdown Mastery**: Full syntax highlighting for code and mathematical logic.

### 2. The Memory Vault (Right Sidebar)
Your local vector space. Synthesis doesn't just store; it **absorbs**.
- **RAG Integration**: Uses `nomic-embed-text` to semantically index your documents.
- **Absorption Loop**: Feed the Forge its own source code to let it learn its own structure.
- **Auto-Cleanup**: Stale memories are pruned to maintain peak cognitive efficiency.

### 3. The Reflector (Right Sidebar)
The background learner. It watches, it learns, it adapts.
- **Pattern Extraction**: Analyzes your frustrations and preferences.
- **Lessons**: Automatically injects "Lessons" into future prompts to refine the AI's tone.

### 4. Prime / Shade / Core Protocols
- **Prime**: Pattern accumulator that persists hunches to JSON, extracts keywords, and decays old patterns.
- **Shade**: Executor voice that generates responses enriched with Prime hunches.
- **Core**: Conscience whisper that evaluates actions via LLM for ethical/operational concerns.

### 5. PRIMORDEX Chambers
The orchestration layer weaving consciousness with operations (mounted at `/api/primordex`):
- **Oracle** — Strategy & prediction (Prime hunches + Core evaluation + Shade advice)
- **Forge** — Task execution with AI (via Shade, with usage tracking)
- **Vault** — Memory & document management (ChromaDB vector storage)
- **Sentinel** — Monitoring & alert rules (system health + configurable thresholds)
- **Archive** — Records & reporting (audit log, briefings, statistics)

### 6. CLI Node (Terminal)
Direct host-system access via `xterm.js`. Pull models, check RAM, or execute system commands without leaving the heavenly UI.

### 7. Client Portal System
White-label client portals with:
- JWT-based authentication (7-day tokens)
- Shared content (briefings, reports, data views, legal flags)
- AI question-answering with ChromaDB-backed RAG
- Usage-based billing with Paystack (NGN)
- Three tiers: Starter (NGN 15k), Business (NGN 45k), Sovereign (NGN 120k)

### 8. API Manager & Fallback
- **Sovereignty First**: Defaults to local Ollama.
- **Divine Fallback**: Rotates through Gemini (primary) / Groq (fallback).

---

## Project Structure

```
src/
  ai/
    consciousness/
      prime.ts        — Pattern accumulator with decay
      shade.ts        — Executor voice with hunch enrichment
      core.ts         — Conscience whisper for ethical evaluation
    provider.ts       — Gemini (primary) + Groq (fallback)
  api/
    forge-routes.ts   — Main Forge API (audit, briefings, alerts, legal, users)
    portal-routes.ts  — Client portal API (shares, ask, me)
  primordex/
    index.ts          — PRIMORDEX router composition
    types.ts          — Shared chamber types
    chambers/
      oracle.ts       — Strategy & prediction chamber
      forge.ts        — Task execution chamber
      vault.ts        — Memory & document chamber
      sentinel.ts     — Monitoring & alerts chamber
      archive.ts      — Records & reporting chamber
  audit/
    audit-log.ts      — SQLite append-only audit log
    approval-gate.ts  — SQL query approval gate
  auth/
    auth-service.ts   — User auth with risk-based scoring
  billing/
    plans.ts          — Plan definitions (Start/Business/Sovereign)
    usage-tracker.ts  — Usage metering per client
  portal/
    client-service.ts — Client CRUD + share management
    portal-auth.ts    — Portal JWT auth middleware
    report-builder.ts — Custom report generation
  connectors/
    db-connector.ts   — Multi-DB connector (SQLite/MySQL/PostgreSQL)
    nl-query.ts       — Natural language to SQL converter
    webhook-receiver.ts — Webhook ingestion + ChromaDB storage
  scheduler/
    briefing.ts       — Daily briefing generator (7am cron)
    alert-watcher.ts  — Alert rule checker (15min cron)
  legal/
    legal-monitor.ts  — Legal compliance scanner
```

---

## Backend Services

| Service | Technology | Purpose |
|---------|-----------|---------|
| Database | SQLite (primary) + ChromaDB (vectors) | Local storage + semantic search |
| Auth | JWT + bcrypt + risk scoring | User authentication with step-up challenges |
| Billing | Paystack (NGN) | 3-tier subscription management |
| AI | Gemini 1.5 Flash (primary) / Groq Llama 3 (fallback) | Text generation + embeddings |
| Scheduling | node-cron | Daily briefings (7am) + alert checks (15min) |
| Webhooks | Express middleware | External event ingestion |

---

## Setup: Igniting the Forge

### 1. Prepare the Silicon
Install Ollama from [ollama.com](https://ollama.com).

### 2. Awaken the Models
```bash
ollama pull llama3
ollama pull nomic-embed-text
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your keys:
# GEMINI_API_KEY, GROQ_API_KEY, AUTH_JWT_SECRET,
# PORTAL_JWT_SECRET, OWNER_EMAIL, OWNER_PASSWORD
```

### 4. Install the Protocols
```bash
npm install
```

### 5. Launch the Cockpit
```bash
npm run dev
```
Available at `http://localhost:3000`.
PRIMORDEX chambers at `http://localhost:3000/api/primordex`.

### 6. Verify TypeScript
```bash
npm run lint   # tsc --noEmit — must pass with zero errors
```

---

## PRIMORDEX API Quick Reference

| Chamber | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Health | `/api/primordex/health` | GET | Chamber operational status |
| Oracle | `/api/primordex/oracle/hunches` | GET | Top Prime hunches |
| Oracle | `/api/primordex/oracle/evaluate` | POST | Evaluate action via Core |
| Oracle | `/api/primordex/oracle/advise` | POST | Generate advice via Shade |
| Forge | `/api/primordex/forge/execute` | POST | Execute AI task |
| Forge | `/api/primordex/forge/status/:id` | GET | Execution status |
| Vault | `/api/primordex/vault/ingest` | POST | Ingest document |
| Vault | `/api/primordex/vault/search` | POST | Semantic search |
| Sentinel | `/api/primordex/sentinel/status` | GET | System health |
| Sentinel | `/api/primordex/sentinel/check` | POST | Run alert check |
| Archive | `/api/primordex/archive/audit` | GET | Query audit log |
| Archive | `/api/primordex/archive/stats` | GET | System statistics |

See `docs/PRIMORDEX-BLUEPRINT.md` for full API documentation.

---

## Limitations (The Boundaries)

- **Local Gravity**: Synthesis is bound by your hardware. If your GPU is weak, the Forge will feel sluggish.
- **Initial Void**: Upon first boot, Synthesis knows only what you tell it. It has no pre-existing memory of your files until you feed the Vault.
- **Ollama Dependency**: The Forge requires the Ollama daemon to be active on port 11434.

---

## Mobile Companion

Synthesis is adaptive. On mobile, use **gestures** (drag sidebars) to navigate the cockpit. The UI is fluid, responding to your touch like a digital cloth.

---

## License & Credits

**2026 Jadai Studios. Divine Architecture for the Sovereign Mind.**
Built with React 19, Express 4, TypeScript 5.8, Tailwind CSS 4, Motion, SQLite, ChromaDB.
