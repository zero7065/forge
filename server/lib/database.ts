import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/primordex.db');

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  const schema = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      created_at TEXT DEFAULT (datetime('now')),
      last_login TEXT,
      is_active INTEGER DEFAULT 1,
      invited_by TEXT,
      risk_score REAL DEFAULT 0,
      last_login_ip TEXT,
      last_login_country TEXT,
      login_avg_sec_of_day INTEGER DEFAULT 43200,
      two_factor_enabled INTEGER DEFAULT 0,
      two_factor_secret TEXT
    );

    -- Sessions
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Clients (for portal)
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      company TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      name TEXT,
      portal_slug TEXT UNIQUE NOT NULL,
      is_active INTEGER DEFAULT 1,
      plan_id TEXT DEFAULT 'starter',
      plan_status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Client shares
    CREATE TABLE IF NOT EXISTS client_shares (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      share_type TEXT NOT NULL,
      share_ref TEXT NOT NULL,
      label TEXT,
      is_active INTEGER DEFAULT 1,
      expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );

    -- Projects
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      tech_stack TEXT, -- JSON array
      github_url TEXT,
      preview_url TEXT,
      code_visibility TEXT DEFAULT 'private', -- public, private, restricted
      cultivation_level INTEGER DEFAULT 1,
      cultivation_realm TEXT DEFAULT 'Foundation',
      status TEXT DEFAULT 'active', -- active, stalled, needs_help, completed, archived
      health_score INTEGER DEFAULT 100,
      progress INTEGER DEFAULT 0,
      last_commit TEXT,
      collaborators TEXT, -- JSON array of user IDs
      next_milestone TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Hire specs
    CREATE TABLE IF NOT EXISTS hire_specs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      role TEXT NOT NULL,
      required_skills TEXT, -- JSON array
      responsibilities TEXT, -- JSON array
      nice_to_have TEXT, -- JSON array
      rate_range TEXT,
      interview_questions TEXT, -- JSON array
      about_project TEXT,
      status TEXT DEFAULT 'draft', -- draft, posted, reviewing, filled, closed
      applicants INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    -- Audit log
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      input TEXT,
      output TEXT,
      risk_score REAL DEFAULT 0,
      approved_by TEXT,
      executed_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Approval gates
    CREATE TABLE IF NOT EXISTS approval_gates (
      id TEXT PRIMARY KEY,
      query_id TEXT,
      sql TEXT,
      requires_approval INTEGER DEFAULT 1,
      explanation TEXT,
      status TEXT DEFAULT 'pending', -- pending, approved, rejected
      actor TEXT,
      approved_by TEXT,
      executed_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Usage tracking
    CREATE TABLE IF NOT EXISTS usage_tracking (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      metric TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      period TEXT NOT NULL,
      last_updated TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, metric, period)
    );

    -- Events (webhook ingestion)
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload_summary TEXT NOT NULL,
      received_at TEXT DEFAULT (datetime('now'))
    );

    -- Alert rules
    CREATE TABLE IF NOT EXISTS alert_rules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      condition TEXT NOT NULL,
      action TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      last_triggered TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Briefings
    CREATE TABLE IF NOT EXISTS briefings (
      id TEXT PRIMARY KEY,
      date TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      generated_at TEXT DEFAULT (datetime('now'))
    );

    -- Legal flags
    CREATE TABLE IF NOT EXISTS legal_flags (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      flagged_at TEXT DEFAULT (datetime('now'))
    );

    -- Prime patterns (consciousness)
    CREATE TABLE IF NOT EXISTS prime_patterns (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      frequency INTEGER DEFAULT 1,
      intensity REAL DEFAULT 0.5,
      context TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Prime insights
    CREATE TABLE IF NOT EXISTS prime_insights (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      summary TEXT,
      topic_clusters TEXT, -- JSON
      emotional_arc TEXT, -- JSON
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Core memory
    CREATE TABLE IF NOT EXISTS core_memory (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      exchange TEXT,
      resonance REAL DEFAULT 0,
      whisper TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Ultimate form
    CREATE TABLE IF NOT EXISTS ultimate_form (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      essence TEXT,
      repeating_pattern TEXT,
      next_breakthrough TEXT,
      ten_year_wisdom TEXT,
      raw_truth TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Knowledge base
    CREATE TABLE IF NOT EXISTS knowledge_entries (
      id TEXT PRIMARY KEY,
      topic TEXT NOT NULL,
      subtopic TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT, -- JSON array
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Learning states
    CREATE TABLE IF NOT EXISTS learning_states (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      state_id TEXT NOT NULL,
      confidence REAL,
      message TEXT,
      timestamp TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Subscriptions (billing)
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      payment_reference TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Reports (portal)
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT,
      content TEXT,
      type TEXT DEFAULT 'general',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- GitHub tokens
    CREATE TABLE IF NOT EXISTS github_tokens (
      user_id TEXT PRIMARY KEY,
      access_token TEXT NOT NULL,
      username TEXT NOT NULL,
      avatar_url TEXT,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Project collaborators
    CREATE TABLE IF NOT EXISTS project_collaborators (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      permission TEXT DEFAULT 'viewer',
      invited_by TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (invited_by) REFERENCES users(id)
    );
  `;

  db.exec(schema);
  console.log('Database schema initialized');
}

export function closeDatabase() {
  if (db) {
    db.close();
  }
}