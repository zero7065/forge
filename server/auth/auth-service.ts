import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { randomUUID, randomBytes } from 'crypto';
import { getDatabase } from '../lib/database.js';
import { getEnv } from '../lib/env.js';
import { createChildLogger } from '../lib/logger.js';

const log = createChildLogger('auth');

export async function loginUser(email: string, password: string, ip: string = '0.0.0.0') {
  const env = getEnv();
  const bcrypt = await import('bcrypt');
  const db = getDatabase();

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email) as any;
  if (!user) {
    log.warn({ email }, 'Login attempt for non-existent user');
    throw new Error('Invalid credentials');
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    log.warn({ email, ip }, 'Failed login attempt');
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    env.AUTH_JWT_SECRET,
    { expiresIn: env.AUTH_TOKEN_EXPIRY as any }
  );

  const refreshToken = randomBytes(40).toString('hex');
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare('INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)').run(sessionId, user.id, token, expiresAt);
  db.prepare('UPDATE users SET last_login = datetime(\'now\'), last_login_ip = ? WHERE id = ?').run(ip, user.id);

  log.info({ userId: user.id, email: user.email }, 'User logged in');

  return {
    token,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role },
    sessionId
  };
}

export async function registerUser(email: string, password: string) {
  const env = getEnv();
  const bcrypt = await import('bcrypt');
  const db = getDatabase();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) throw new Error('Email already registered');

  const id = randomUUID();
  const saltRounds = parseInt(env.SALT_ROUNDS) || 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  db.prepare('INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)').run(id, email, passwordHash, 'viewer');

  const token = jwt.sign(
    { userId: id, email, role: 'viewer' },
    env.AUTH_JWT_SECRET,
    { expiresIn: env.AUTH_TOKEN_EXPIRY as any }
  );

  const refreshToken = randomBytes(40).toString('hex');
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  db.prepare('INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)').run(sessionId, id, token, expiresAt);

  log.info({ userId: id, email }, 'New user registered');

  return {
    token,
    refreshToken,
    user: { id, email, role: 'viewer' },
    sessionId
  };
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const env = getEnv();
    const db = getDatabase();
    const decoded = jwt.verify(token, env.AUTH_JWT_SECRET) as any;

    const session = db.prepare('SELECT id FROM sessions WHERE token = ? AND expires_at > datetime(\'now\')').get(token);
    if (!session) {
      log.debug({ userId: decoded.userId }, 'Token not found in active sessions');
      return null;
    }

    const user = db.prepare('SELECT id, email, role, is_active FROM users WHERE id = ? AND is_active = 1').get(decoded.userId);
    return user || null;
  } catch {
    return null;
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<any> {
  const env = getEnv();
  const db = getDatabase();

  const session = db.prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > datetime(\'now\')').get(refreshToken) as any;
  if (!session) return null;

  const user = db.prepare('SELECT id, email, role, is_active FROM users WHERE id = ? AND is_active = 1').get(session.user_id) as any;
  if (!user) return null;

  const newToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    env.AUTH_JWT_SECRET,
    { expiresIn: env.AUTH_TOKEN_EXPIRY as any }
  );

  db.prepare('UPDATE sessions SET token = ?, expires_at = datetime(\'now\', \'+24 hours\') WHERE id = ?').run(newToken, session.id);

  return { token: newToken, user: { id: user.id, email: user.email, role: user.role } };
}

export async function revokeSession(token: string): Promise<void> {
  const db = getDatabase();
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export async function revokeAllSessions(userId: string): Promise<void> {
  const db = getDatabase();
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
  log.info({ userId }, 'All sessions revoked');
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  const user = await verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  (req as any).user = { userId: (user as any).id, email: (user as any).email, role: (user as any).role };
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(user.role) && user.role !== 'owner') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export async function getAllUsers() {
  const db = getDatabase();
  return db.prepare('SELECT id, email, role, created_at, last_login, is_active, risk_score, last_login_ip, last_login_country FROM users ORDER BY created_at').all();
}

export async function getUsers() {
  const db = getDatabase();
  return db.prepare('SELECT id, email, role, created_at, last_login, is_active FROM users ORDER BY created_at').all();
}

export async function inviteUser(email: string, role: 'owner' | 'admin' | 'viewer', invitedBy: string) {
  const bcrypt = await import('bcrypt');
  const db = getDatabase();
  const temporaryPassword = randomBytes(16).toString('hex');
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);
  const id = randomUUID();

  db.prepare('INSERT INTO users (id, email, password_hash, role, invited_by) VALUES (?, ?, ?, ?, ?)').run(id, email, passwordHash, role, invitedBy);

  log.info({ userId: id, email, role, invitedBy }, 'User invited');
  return { id, temporaryPassword };
}

export async function changeUserRole(userId: string, newRole: 'owner' | 'admin' | 'viewer') {
  const db = getDatabase();
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(newRole, userId);
  log.info({ userId, newRole }, 'User role changed');
}

export async function deactivateUser(userId: string) {
  const db = getDatabase();
  db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(userId);
  await revokeAllSessions(userId);
  log.info({ userId }, 'User deactivated');
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string) {
  const bcrypt = await import('bcrypt');
  const db = getDatabase();
  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId) as any;
  if (!user) throw new Error('User not found');

  const match = await bcrypt.compare(oldPassword, user.password_hash);
  if (!match) throw new Error('Invalid current password');

  const newHash = await bcrypt.hash(newPassword, 12);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, userId);
  await revokeAllSessions(userId);
  log.info({ userId }, 'Password changed, all sessions revoked');
}

export async function bootstrapOwner() {
  const env = getEnv();
  const db = getDatabase();
  const existing = db.prepare('SELECT id FROM users WHERE role = \'owner\' LIMIT 1').get();
  if (!existing) {
    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.hash(env.OWNER_PASSWORD, 12);
    db.prepare('INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)').run(randomUUID(), env.OWNER_EMAIL, hash, 'owner');
    log.info({ email: env.OWNER_EMAIL }, 'Owner account bootstrapped');
  }
}
