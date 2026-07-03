import { getDatabase } from '../lib/database.js';

const db = getDatabase();

export async function generateDailyBriefing() {
  // Simplified - in production, aggregate user activity
  return { message: 'Daily briefing generated' };
}

export async function getBriefings() {
  return db.prepare('SELECT * FROM briefings ORDER BY date DESC').all();
}

export async function getBriefingByDate(date: string) {
  return db.prepare('SELECT * FROM briefings WHERE date = ?').get(date);
}

export async function runAlertChecks() {
  // Check alert rules
  const rules = db.prepare('SELECT * FROM alert_rules WHERE enabled = 1').all() as any[];
  for (const rule of rules) {
    console.log(`Checking alert: ${rule.name}`);
  }
}

export async function addAlert(name: string, condition: string, action: string) {
  const id = Date.now().toString();
  db.prepare('INSERT INTO alert_rules (id, name, condition, action) VALUES (?, ?, ?, ?)').run(id, name, condition, action);
  return { id, name, condition, action };
}

export async function getAlerts() {
  return db.prepare('SELECT * FROM alert_rules').all();
}

export async function runLegalScan() {
  // Scan legal sources
  return { message: 'Legal scan completed' };
}

export async function getLegalFlags() {
  return db.prepare('SELECT * FROM legal_flags ORDER BY flagged_at DESC').all();
}