# Synthesis Forge — Dashboard Panel Summary

## Panels (all in `client/src/components/panels/`)
1. **ApprovalQueue.tsx** — pending SQL/audit items; approve/reject via `POST /api/audit/:id/approve|reject`
2. **AuditViewer.tsx** — paginated immutable audit log via `GET /api/audit`
3. **BriefingsViewer.tsx** — daily briefings via `GET /api/briefings`; "Run Today" → `POST /api/brief/run`
4. **AlertsPanel.tsx** — alert rules via `GET /api/alerts`; "Run Now" → `POST /api/alerts/run`
5. **LegalViewer.tsx** — regulatory flags via `GET /api/legal`; "Run Scan" → `POST /api/legal/scan`

All panels import `apiGet`/`apiPost` from `../../utils/api` and require an authenticated session (JWT in `Authorization: Bearer <token>`).

## Live Capabilities
- Alerts evaluate against real metrics: user signups, audit error count, average API latency
- Legal scan fetches enabled RSS sources and asks Groq to flag regulatory relevance; results stored in `legal_flags`
- Briefings generate via Shade→Prime→Core using Groq and persist to `briefings` table + `/briefings/` files

## Configuration
Alert rules seeded from `config/alerts.json`; legal RSS sources from `config/legal-sources.json`. Both loaded at server boot.
