import Database from 'better-sqlite3';
import path from 'path';
import { readdirSync, readFileSync } from 'fs';

const DB_PATH = process.env.DB_PATH || path.join(path.dirname(''), 'data', 'primordex.db');

// Migration tracker table
const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at TEXT DEFAULT (datetime('now'))
  );
`);

interface Migration {
  name: string;
  up: (db: Database.Database) => void;
  down?: (db: Database.Database) => void;
}

const migrations: Migration[] = [];

export function registerMigration(migration: Migration) {
  migrations.push(migration);
  migrations.sort((a, b) => a.name.localeCompare(b.name));
}

export function getAppliedMigrations(): string[] {
  return db.prepare('SELECT name FROM _migrations').all() as { name: string }[];
}

export function migrate(): void {
  const applied = getAppliedMigrations();
  const pending = migrations.filter(m => !applied.some(a => a === m.name));

  for (const migration of pending) {
    try {
      migration.up(db);
      db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migration.name);
      console.log(`Migration applied: ${migration.name}`);
    } catch (err) {
      console.error(`Migration failed: ${migration.name}`, err);
      throw err;
    }
  }
}

// Migration directory relative to project root
const migrationDir = path.resolve('.' , 'infra', 'migrations');

const migrationFiles = readdirSync(migrationDir).filter(f => f.endsWith('.sql'));

for (const file of migrationFiles) {
  const migrationName = file.replace('.sql', '');
  const upSql = readFileSync(path.join(migrationDir, file), 'utf-8');

  registerMigration({
    name: migrationName,
    up: (db: Database.Database) => {
      db.exec(upSql);
    },
    down: (db: Database.Database) => {
      // Users should provide explicit down migrations
      console.warn(`No down migration for ${migrationName}`);
    },
  });
}

// Auto-run migrations on module import
migrate();