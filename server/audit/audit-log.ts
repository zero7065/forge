import { getDatabase } from '../lib/database.js';
import { randomUUID } from 'crypto';

const db = getDatabase();

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  input?: any;
  output?: any;
  risk_score: number;
  approved_by?: string | null;
  executed_at?: string | null;
  created_at: string;
}

export async function auditLog(entry: {
  actor: string;
  action: string;
  input?: any;
  output?: any;
  risk_score?: number;
  approved_by?: string | null;
  executed_at?: string | null;
}): Promise<string> {
  const id = randomUUID();
  const stmt = db.prepare(`
    INSERT INTO audit_log (id, actor, action, input, output, risk_score, approved_by, executed_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  stmt.run(
    id,
    entry.actor,
    entry.action,
    JSON.stringify(entry.input || {}),
    JSON.stringify(entry.output || {}),
    entry.risk_score || 0,
    entry.approved_by || null,
    entry.executed_at || null
  );
  return id;
}

export async function getAuditLog(limit: number = 100, offset: number = 0, filter?: string): Promise<AuditEntry[]> {
  let query = 'SELECT * FROM audit_log';
  const params: any[] = [];

  if (filter) {
    query += ' WHERE action LIKE ? OR actor LIKE ?';
    params.push(`%${filter}%`, `%${filter}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return db.prepare(query).all(...params) as AuditEntry[];
}

export async function approveAction(auditId: string, approvedBy: string): Promise<void> {
  const entry = db.prepare('SELECT * FROM audit_log WHERE id = ?').get(auditId) as AuditEntry | undefined;
  if (!entry) throw new Error('Audit entry not found');

  db.prepare(`
    UPDATE audit_log 
    SET approved_by = ?, executed_at = datetime('now')
    WHERE id = ?
  `).run(approvedBy, auditId);

  await auditLog({
    actor: approvedBy,
    action: 'action_approved',
    input: { originalId: auditId },
    output: { message: 'Action approved and executed' },
    risk_score: 0
  });
}

export async function rejectAction(auditId: string, rejectedBy: string, reason: string): Promise<void> {
  db.prepare(`
    UPDATE audit_log 
    SET approved_by = ?, executed_at = datetime('now')
    WHERE id = ?
  `).run(rejectedBy, auditId);

  await auditLog({
    actor: rejectedBy,
    action: 'action_rejected',
    input: { originalId: auditId, reason },
    output: { message: 'Action rejected' },
    risk_score: 0
  });
}