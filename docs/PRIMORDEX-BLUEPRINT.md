# PRIMORDEX: The Divine Orchestration Layer

**PRIMORDEX** is the consciousness-driven orchestration layer for Synthesis Forge. It sits above the existing services, weaving together the Prime/Shade/Core consciousness modules with the operational chambers to create a unified, sentient system.

---

## Architecture

```
PRIMORDEX Router (/api/primordex)
|
|-- GET /health              → Chamber health status
|
|-- /oracle/*                → Strategy & prediction chamber
|-- /forge/*                 → Task execution chamber
|-- /vault/*                 → Memory & document chamber
|-- /sentinel/*              → Monitoring & alerts chamber
|-- /archive/*               → Records & reporting chamber
```

Each chamber is an independent Express Router mounted under `/api/primordex/<chamber>`. Chambers share access to the consciousness layer (Prime, Shade, Core) and backend services (AuditLog, UsageTracker, Briefing, AlertWatcher).

---

## Chambers

### 1. Oracle Chamber (`/api/primordex/oracle`)

The strategic mind. Oracle consumes Prime's accumulated hunches, evaluates actions through Core's conscience layer, and generates advice through Shade.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/hunches` | GET | Return top Prime hunches (patterns with weights) |
| `/observe` | POST | Feed content into Prime for pattern observation |
| `/evaluate` | POST | Evaluate an action through Core's conscience layer |
| `/advise` | POST | Generate strategic advice via Shade with hunch context |
| `/context` | GET | Get Prime's context string for prompt enrichment |

**Example:**
```bash
curl -X POST /api/primordex/oracle/evaluate \
  -H "Content-Type: application/json" \
  -d '{"action": "DROP TABLE users", "context": "Cleanup old test data"}'
```

### 2. Forge Chamber (`/api/primordex/forge`)

The executor. Forge runs AI-powered tasks through Shade, tracks execution history, and feeds results back into Prime for pattern learning.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/execute` | POST | Execute a prompt via Shade (with optional clientId for usage tracking) |
| `/status/:id` | GET | Check execution status by ID |
| `/executions` | GET | List all recent executions |

**Example:**
```bash
curl -X POST /api/primordex/forge/execute \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Summarize today events", "clientId": 1}'
```

### 3. Vault Chamber (`/api/primordex/vault`)

The memory core. Vault manages document ingestion into ChromaDB vector storage and provides semantic search across all stored memories.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ingest` | POST | Ingest content into ChromaDB + file storage |
| `/search` | POST | Semantic search across vector memories |
| `/memories` | GET | List recent ingested memories |
| `/health` | GET | Check ChromaDB connection and memory count |

**Example:**
```bash
curl -X POST /api/primordex/vault/ingest \
  -H "Content-Type: application/json" \
  -d '{"content": "Meeting notes from Q3 planning", "source": "meeting-notes", "metadata": {"project": "forge"}}'
```

### 4. Sentinel Chamber (`/api/primordex/sentinel`)

The watchful eye. Sentinel monitors system health, manages alert rules, and provides operational status at a glance.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/status` | GET | System health (host, memory, CPU, uptime) |
| `/alerts` | GET | List all alert rules |
| `/alerts` | POST | Add a new alert rule |
| `/alerts/:id` | DELETE | Remove an alert rule |
| `/check` | POST | Run alert check manually |

**Alert rule format:**
```json
{
  "source": "events",
  "metric": "count",
  "threshold": "<10",
  "window": "1h",
  "message": "Low event volume detected",
  "enabled": true
}
```

### 5. Archive Chamber (`/api/primordex/archive`)

The chronicler. Archive provides queryable access to the audit log, briefing management, and system statistics.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/audit` | GET | Query audit log (supports startTime, endTime, actor, actionType, limit, offset) |
| `/audit` | POST | Append a manual entry to the audit log |
| `/briefings` | GET | List all briefing files |
| `/briefings/:date` | GET | Get a specific briefing by date |
| `/briefings/generate` | POST | Trigger manual briefing generation |
| `/stats` | GET | Aggregate system statistics |

---

## Consciousness Integration

PRIMORDEX is the first system to wire the three consciousness layers together:

- **Prime** → Pattern accumulator. Learns from every observation and execution across all chambers. Persisted to `data/prime-hunches.json`.
- **Shade** → Executor voice. Every `forge/execute` and `oracle/advise` call routes through Shade, enriching prompts with Prime's context.
- **Core** → Conscience whisper. `oracle/evaluate` routes actions through Core for ethical and operational assessment before execution.

### Data Flow

```
User/System → PRIMORDEX Chamber → Consciousness Layer → Backend Service → Response
                                        ↓
                                  Prime.observe()
                                        ↓
                                  Pattern decay & persistence
```

---

## Route Summary

| Route | File | Purpose |
|-------|------|---------|
| `/api/primordex` | `src/primordex/index.ts` | Router composition + health |
| `/api/primordex/oracle` | `src/primordex/chambers/oracle.ts` | Strategy & prediction |
| `/api/primordex/forge` | `src/primordex/chambers/forge.ts` | Task execution |
| `/api/primordex/vault` | `src/primordex/chambers/vault.ts` | Memory & documents |
| `/api/primordex/sentinel` | `src/primordex/chambers/sentinel.ts` | Monitoring |
| `/api/primordex/archive` | `src/primordex/chambers/archive.ts` | Records & reporting |
