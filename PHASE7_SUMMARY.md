# Synthesis Forge — Phase 7 Multi-User Auth (Summary)

## Auth System
- `server/auth/auth-service.ts` — register, login, JWT, bcrypt, refresh tokens, invite, role change, deactivate, owner bootstrap
- Roles: **owner** (full), **admin** (all except user mgmt), **viewer** (read-only)
- Protected routes: `requireAuth` / `requireRole` middleware
- Owner auto-created on first boot if `OWNER_EMAIL` / `OWNER_PASSWORD` set
- All auth events logged to `audit_log`

## Key API Routes
- `POST /api/auth/login` — access + refresh token
- `POST /api/auth/refresh` — rotate access token
- `GET /api/auth/sessions` — active sessions for user
- `GET|POST|PATCH|DELETE /api/users*` — owner-only user management

## UI
- Login page, AuthContext, ProtectedRoute, UsersPanel (owner only)
- Role-based sidebar navigation

## Env
`AUTH_JWT_SECRET`, `AUTH_TOKEN_EXPIRY`, `SALT_ROUNDS`, `OWNER_EMAIL`, `OWNER_PASSWORD`
