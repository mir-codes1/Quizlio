import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'quizlio.db');

let _db: Database | null = null;

export async function openDb(): Promise<Database> {
  if (_db) return _db;

  const SQL = await initSqlJs();

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const fileBuffer = fs.existsSync(DB_PATH)
    ? fs.readFileSync(DB_PATH)
    : undefined;

  _db = new SQL.Database(fileBuffer);

  // Enable foreign key enforcement
  _db.run('PRAGMA foreign_keys = ON;');

  return _db;
}

/** Call after any write to persist in-memory DB to disk. */
export function saveDb(): void {
  if (!_db) return;
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export function getDb(): Database {
  if (!_db) throw new Error('Database not initialised — call openDb() first');
  return _db;
}
