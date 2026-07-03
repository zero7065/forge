import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { getDatabase } from '../lib/database.js';

const db = getDatabase();

const JWT_SECRET = process.env.AUTH_JWT_SECRET || 'primordex-dev-secret-change-in-production';
const TOKEN_EXPIRY = process.env.AUTH_TOKEN_EXPIRY || '24h';

// =====================================================
// TOKEN / AUTH HELPERS
// =====================================================

export async function loginUser(email: string, password: string, ip: string = '0.0.0.0') {
  const bcrypt = await import('bcrypt');

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email) as any;
  if (!user) throw new Error('Invalid credentials');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY as any }
  );

  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)').run(sessionId, user.id, token, expiresAt);
  db.prepare('UPDATE users SET last_login = datetime(\'now\'), last_login_ip = ? WHERE id = ?').run(ip, user.id);

  return {
    token,
    user: { id: user.id, email: user.email, role: user.role },
    sessionId
  };
}

export async function registerUser(email: string, password: string, name?: string) {
  const bcrypt = await import('bcrypt');

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) throw new Error('Email already registered');

  const id = randomUUID();
  const passwordHash = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS) || 12);

  db.prepare('INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)').run(id, email, passwordHash, 'viewer');

  const token = jwt.sign(
    { userId: id, email, role: 'viewer' },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY as any }
  );

  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)').run(sessionId, id, token, expiresAt);

  return {
    token,
    user: { id, email, role: 'viewer' },
    sessionId
  };
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.prepare('SELECT id, email, role, is_active FROM users WHERE id = ? AND is_active = 1').get(decoded.userId);
    return user || null;
  } catch {
    return null;
  }
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
  return db.prepare('SELECT id, email, role, created_at, last_login, is_active, risk_score, last_login_ip, last_login_country FROM users ORDER BY created_at').all();
}

export async function getUsers() {
  return db.prepare('SELECT id, email, role, created_at, last_login, is_active FROM users ORDER BY created_at').all();
}

export async function inviteUser(email: string, role: 'owner' | 'admin' | 'viewer', invitedBy: string) {
  const bcrypt = await import('bcrypt');
  const temporaryPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);
  const id = Date.now().toString();

  db.prepare('INSERT INTO users (id, email, password_hash, role, invited_by) VALUES (?, ?, ?, ?, ?)').run(id, email, passwordHash, role, invitedBy);

  return { id, temporaryPassword };
}

export async function changeUserRole(userId: string, newRole: 'owner' | 'admin' | 'viewer') {
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(newRole, userId);
}

export async function deactivateUser(userId: string) {
  db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(userId);
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string) {
  const bcrypt = await import('bcrypt');
  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId);
  if (!user) throw new Error('User not found');

  const match = await bcrypt.compare(oldPassword, (user as any).password_hash);
  if (!match) throw new Error('Invalid current password');

  const newHash = await bcrypt.hash(newPassword, 12);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, userId);
}

export async function bootstrapOwner() {
  const existing = db.prepare('SELECT id FROM users WHERE role = \'owner\' LIMIT 1').get();
  if (!existing) {
    const bcrypt = await import('bcrypt');
    const email = process.env.OWNER_EMAIL || 'jehu@jadai.dev';
    const password = process.env.OWNER_PASSWORD || 'ChangeMeNow123!';
    const hash = await bcrypt.hash(password, 12);
    db.prepare('INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)').run(randomUUID(), email, hash, 'owner');
    console.log(`Owner account bootstrapped: ${email}`);
  }
}
