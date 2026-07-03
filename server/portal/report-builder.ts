import { getDatabase } from '../lib/database.js';

const db = getDatabase();

export async function createReport(userId: string, data: { title: string; content: string; type: string }) {
  const id = Date.now().toString();
  db.prepare('INSERT INTO reports (id, user_id, title, content, type, created_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))').run(id, userId, data.title, data.content, data.type);
  return { id, ...data };
}

export async function getReports(userId: string) {
  return db.prepare('SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC').all(userId);
}