import { getDatabase } from '../lib/database.js';

const db = getDatabase();

export async function receiveWebhook(source: string, eventType: string, payload: any) {
  const id = Date.now().toString();
  const summary = JSON.stringify(payload).slice(0, 500);
  
  db.prepare('INSERT INTO events (id, source, event_type, payload_summary) VALUES (?, ?, ?, ?)').run(id, source, eventType, summary);
  
  return { id, source, eventType, receivedAt: new Date().toISOString() };
}

export async function getEvents(limit: number = 100) {
  return db.prepare('SELECT * FROM events ORDER BY received_at DESC LIMIT ?').all(limit);
}