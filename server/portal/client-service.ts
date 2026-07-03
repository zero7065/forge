import { getDatabase } from '../lib/database.js';

const db = getDatabase();

export async function getClientClients(userId: string) {
  return db.prepare('SELECT * FROM clients WHERE user_id = ?').all(userId);
}

export async function createClient(userId: string, data: { email: string; company: string; name?: string }) {
  const id = Date.now().toString();
  const slug = data.company.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const portalSlug = `${slug}-${Date.now().toString(36)}`;
  
  db.prepare(`
    INSERT INTO clients (id, user_id, email, company, name, slug, portal_slug)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, data.email, data.company, data.name || '', slug, portalSlug);
  
  return { id, ...data, slug, portalSlug };
}

export async function createShare(clientId: string, data: { shareType: string; shareRef: string; label: string; expiresAt?: string }) {
  const id = Date.now().toString();
  db.prepare(`
    INSERT INTO client_shares (id, client_id, share_type, share_ref, label, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, clientId, data.shareType, data.shareRef, data.label, data.expiresAt || null);
  
  return { id, ...data };
}

export async function getClientShares(clientId: string) {
  return db.prepare('SELECT * FROM client_shares WHERE client_id = ? AND is_active = 1').all(clientId);
}