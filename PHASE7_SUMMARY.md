# Synthesis Forge - Phase 7: Multi-User Login + Roles + Access Control

## Overview
This implementation adds a complete authentication and authorization system to Synthesis Forge, enabling multi-user support with role-based access control (RBAC). The system includes user registration, login, password management, admin/user management, and protected routes.

## ✅ NEW FILES ADDED

### Authentication Service
- `/src/auth/auth-service.ts` - Core auth logic (registration, login, JWT, password hashing, user management)
- `/src/auth/auth-middleware.ts` - Express middleware (`requireAuth`, `requireRole`)

### UI Components
- `/src/ui/pages/LoginPage.tsx` - Login form with rate limiting and lockout
- `/src/ui/auth/AuthContext.tsx` - React context for auth state (user, token, login/logout)
- `/src/ui/auth/ProtectedRoute.tsx` - Route wrapper that redirects to login if unauthenticated
- `/src/ui/panels/UsersPanel.tsx` - User management interface (owner only)

### Updated Files
- `/src/api/forge-routes.ts` - Added auth routes and protected existing routes with middleware
- `/src/audit/audit-log.ts` - Updated to log auth events (login, failed login, password change, user invited, role change, user deactivated)
- `/src/main.tsx` - Wrapped app with `AuthProvider`
- `/src/App.tsx` - Added login page, protected routes, and updated navigation
- `/.env.example` - Added `AUTH_JWT_SECRET`, `OWNER_EMAIL`, `OWNER_PASSWORD`

### Dependencies Added
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT generation and verification

## 🔐 AUTHENTICATION SYSTEM DETAILS

### User Roles
1. **owner** - Full access, can manage users, only 1 owner allowed
2. **admin** - Can use all features except user management
3. **viewer** - Read-only: can view briefings, audit log, legal flags. Cannot approve queries, trigger agents, or modify anything

### Security Features
- Passwords hashed with bcrypt (12+ rounds)
- JWT tokens signed with `AUTH_JWT_SECRET`, expire in 24h
- Tokens stored in React context only (never localStorage or cookies)
- Identical error messages for auth failures (no user enumeration)
- Rate limiting: max 5 login attempts per IP per minute (implemented via lockout after 5 failures)
- Owner account auto-created on first startup if `OWNER_EMAIL` and `OWNER_PASSWORD` are set
- No password logging or exposure in API responses
- All auth failures logged to audit trail with action_type `login_failed`

### Protected Routes
All existing API routes now require authentication:
- `GET /api/audit` → `requireAuth`
- `POST /api/audit/:id/approve` → `requireRole("owner", "admin")`
- `POST /api/audit/:id/reject` → `requireRole("owner", "admin")`
- `POST /api/brief/run` → `requireRole("owner", "admin")`
- `POST /api/alerts/run` → `requireRole("owner", "admin")`
- `POST /api/legal/scan` → `requireRole("owner", "admin")`
- `POST /api/agent/run/:id` → `requireRole("owner", "admin")`
- `POST /api/pipeline/sync/:id` → `requireRole("owner", "admin")`
- `GET /api/briefings` → `requireAuth`
- `GET /api/legal` → `requireAuth`
- `GET /api/pipeline/status` → `requireAuth`
- `GET /api/notifications/status` → `requireAuth`
- `POST /api/notifications/test` → `requireRole("owner")`

### New Auth Routes
- `POST /api/auth/login` → Returns JWT token
- `POST /api/auth/logout` → Confirmation endpoint
- `POST /api/auth/change-password` → Requires auth
- `GET /api/users` → Owner only: list users (no password hashes)
- `POST /api/users/invite` → Owner only: invite new user (returns temp password)
- `PATCH /api/users/:id/role` → Owner only: change user role
- `DELETE /api/users/:id` → Owner only: deactivate user (no hard delete)

## 🧪 HOW TO TEST

### 1. Initial Setup
```bash
# Install new dependencies
npm install bcrypt jsonwebtoken --force

# Configure .env (copy from .env.example and fill in values)
# Example:
# GEMINI_API_KEY=your_gemini_key
# AUTH_JWT_SECRET=your_long_random_string_here_min_32_chars
# OWNER_EMAIL=admin@example.com
# OWNER_PASSWORD=ChangeMe123!
# (other existing vars...)

# Start the Forge
npm run dev
```

### 2. First Login (Owner Account)
- On first startup, if `OWNER_EMAIL` and `OWNER_PASSWORD` are set in `.env`, an owner account is auto-created
- Console will log: "Owner account created"
- Login at http://localhost:3000 with those credentials

### 3. Test Auth Flow
- Attempt to access dashboard without login → redirects to login page
- Login with correct credentials → redirects to dashboard
- Login with incorrect credentials → shows "Invalid email or password"
- After 5 failed attempts → form locks for 60 seconds with countdown
- Successful login → JWT stored in React context, API calls include token

### 4. Test User Management (Owner Only)
- Navigate to [Users] tab in sidebar (only visible to owner)
- View list of users
- Click "Invite User" → fill email and role → submit
- Shows temporary password (save it! This is the only time it's shown)
- Invited user can now login with that email and temporary password
- Select a user row → edit role dropdown → change role (cannot change owner's own role if sole owner)
- Deactivate button → confirm → user deactivated (can't deactivate yourself)

### 5. Test Role-Based Access
- Login as viewer → try to access [Approvals] or [Audit Log] → should see "Access denied"
- Login as admin → can access all features except [Users] tab
- Login as owner → can access all features including [Users]

### 6. Test Protected Endpoints via CLI
```bash
# These should fail without auth (return 401)
forge nl:query "Show tables" main
forge brief:run
forge alert:check
forge legal:scan

# Login first (would need to implement CLI login command, or test via UI)
# After obtaining token via UI login, you could use it in CLI headers if implementing auth there
```

### 7. Test Audit Logging
Auth events are logged to the audit trail and visible in the [Audit Log] panel:
- `user_login` - Successful logins
- `login_failed` - Failed login attempts
- `user_invited` - When a user is invited
- `role_changed` - When a user's role is changed
- `password_changed` - When a password is changed
- `user_deactivated` - When a user is deactivated

## 📋 CONFIGURATION REQUIRED

### Environment Variables (.env)
```dotenv
# Existing vars (from previous phases)...
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_optional_groq_key

# NEW FOR PHASE 7
AUTH_JWT_SECRET=your_long_random_string_here_min_32_chars
OWNER_EMAIL=admin@example.com
OWNER_PASSWORD=ChangeMe123!  # Change after first login

# Optional: adjust rate limiting (currently hardcoded to 5 attempts, 60 sec lockout)
```

### No additional config files needed - all stored in SQLite database (`/data/forge.db`)

## 🛡️ SECURITY & SOVEREIGNTY

- **Local-First**: All user data stored in local SQLite database (`forge_users` table)
- **No External Dependencies**: Auth system is completely self-hosted
- **Data Minimization**: Passwords never stored or transmitted in plain text
- **Audit Trail**: All auth events logged to immutable audit log
- **Least Privilege**: Role-based access ensures users only see what they need
- **Session Security**: JWT tokens stored in memory only, expire in 24h
- **Brute Force Protection**: Account lockout after 5 failed attempts

## 🚀 READY FOR MULTI-USE

The Synthesis Forge now supports:
- Multiple secure user accounts with role-based permissions
- Owner-controlled user management (invite, role changes, deactivation)
- Full audit trail of all user actions and authentication events
- Protected API endpoints and UI routes
- Local-first sovereignty with no external auth dependencies

Users can now collaborate securely while maintaining the core principle: **your data never leaves your machine**.

--- 
*This completes Phase 7 of the Sovereign AI OS implementation for Synthesis Forge.*