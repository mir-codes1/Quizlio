/**
 * Thin helpers to give sql.js a friendlier interface.
 * sql.js uses column arrays, not objects; these helpers convert.
 */
import { getDb, saveDb } from './db';

type Row = Record<string, unknown>;
type Params = (string | number | null | Uint8Array)[];

/** Execute a SELECT and return all rows as plain objects. */
export function queryAll<T = Row>(sql: string, params: Params = []): T[] {
  const db = getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

/** Execute a SELECT and return the first row or null. */
export function queryOne<T = Row>(sql: string, params: Params = []): T | null {
  const rows = queryAll<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Run multiple write statements as a group and persist once at the end.
 * The callback receives raw execute-without-save variants.
 */
export function transaction(fn: () => void): void {
  const db = getDb();
  db.run('BEGIN');
  try {
    fn();
    db.run('COMMIT');
    saveDb();
  } catch (err) {
    db.run('ROLLBACK');
    throw err;
  }
}

/** Write without saving — use inside transaction(). */
export function runRaw(sql: string, params: Params = []): void {
  getDb().run(sql, params);
}

/** Returns last_insert_rowid() — only call inside transaction(). */
export function lastInsertId(): number {
  return queryOne<{ id: number }>('SELECT last_insert_rowid() AS id')?.id ?? 0;
}
