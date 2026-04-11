import { getDb, saveDb } from './db';

export function initSchema(): void {
  const db = getDb();

  db.run(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT,
      tags        TEXT,
      createdAt   TEXT    NOT NULL,
      updatedAt   TEXT    NOT NULL
    );
  `);

  // Detect old schema (pre-upgrade) and migrate if needed.
  // Old schema had 'correctOption' (single); new schema has 'correctOptions' (JSON array)
  // and 'questionType'. We drop and recreate since old questions are incompatible.
  const tableInfo = db.exec('PRAGMA table_info(questions)');
  const existingColumns: string[] =
    tableInfo.length > 0 && tableInfo[0].values.length > 0
      ? tableInfo[0].values.map((row) => row[1] as string)
      : [];

  const isOldSchema =
    existingColumns.length > 0 && !existingColumns.includes('questionType');

  if (isOldSchema) {
    console.log(
      'Old question schema detected — migrating. Existing quizzes will need to be re-imported.'
    );
    db.run('DROP TABLE IF EXISTS questions');
    db.run('DELETE FROM quizzes');
    saveDb();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      quizId             INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      orderIndex         INTEGER NOT NULL,
      prompt             TEXT    NOT NULL,
      questionType       TEXT    NOT NULL CHECK(questionType IN ('single','multi')),
      codeSnippet        TEXT,
      optionA            TEXT    NOT NULL,
      optionB            TEXT    NOT NULL,
      optionC            TEXT    NOT NULL,
      optionD            TEXT    NOT NULL,
      optionE            TEXT    NOT NULL,
      optionF            TEXT    NOT NULL,
      correctOptions     TEXT    NOT NULL,
      correctExplanation TEXT    NOT NULL,
      explanationA       TEXT    NOT NULL,
      explanationB       TEXT    NOT NULL,
      explanationC       TEXT    NOT NULL,
      explanationD       TEXT    NOT NULL,
      explanationE       TEXT    NOT NULL,
      explanationF       TEXT    NOT NULL,
      sourceTag          TEXT
    );
  `);

  saveDb();
  console.log('Database schema ready.');
}
