import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { createChildLogger } from './logger.js';
import { getDatabase as getCoreDB, migrate as runMigrations } from './migrations.ts';

const log = createChildLogger('database');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__dirname);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/primordex.db');

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
  }
  return db;
}