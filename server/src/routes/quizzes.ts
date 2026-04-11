import { Router, Request, Response } from 'express';
import { queryAll, queryOne, runRaw, transaction, lastInsertId } from '../db/query';
import { QuizImportSchema, RenameSchema } from '../validation/quizSchema';

const router = Router();

// GET /api/quizzes — list all quizzes with question count
router.get('/', (_req: Request, res: Response) => {
  const quizzes = queryAll<{
    id: number; title: string; description: string | null;
    tags: string | null; createdAt: string; updatedAt: string;
    questionCount: number;
  }>(
    `SELECT q.id, q.title, q.description, q.tags, q.createdAt, q.updatedAt,
            COUNT(qu.id) AS questionCount
     FROM quizzes q
     LEFT JOIN questions qu ON qu.quizId = q.id
     GROUP BY q.id
     ORDER BY q.createdAt DESC`
  );

  res.json(
    quizzes.map((q) => ({ ...q, tags: q.tags ? JSON.parse(q.tags) : [] }))
  );
});

// GET /api/quizzes/:id — full quiz with all questions
router.get('/:id', (req: Request, res: Response) => {
  const quiz = queryOne<{
    id: number; title: string; description: string | null;
    tags: string | null; createdAt: string; updatedAt: string;
  }>('SELECT * FROM quizzes WHERE id = ?', [Number(req.params.id)]);

  if (!quiz) {
    res.status(404).json({ error: 'Quiz not found' });
    return;
  }

  const rawQuestions = queryAll<Record<string, unknown>>(
    'SELECT * FROM questions WHERE quizId = ? ORDER BY orderIndex ASC',
    [Number(req.params.id)]
  );

  // Parse correctOptions from stored JSON string back to array
  const questions = rawQuestions.map((q) => ({
    ...q,
    correctOptions:
      typeof q.correctOptions === 'string'
        ? JSON.parse(q.correctOptions)
        : q.correctOptions,
  }));

  res.json({ ...quiz, tags: quiz.tags ? JSON.parse(quiz.tags) : [], questions });
});

// POST /api/quizzes — validate + create
router.post('/', (req: Request, res: Response) => {
  const result = QuizImportSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: 'Validation failed',
      issues: result.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  const data = result.data;
  const now = new Date().toISOString();
  let quizId = 0;

  transaction(() => {
    runRaw(
      `INSERT INTO quizzes (title, description, tags, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.title,
        data.description ?? null,
        null,
        now,
        now,
      ]
    );

    quizId = lastInsertId();

    data.questions.forEach((q, i) => {
      runRaw(
        `INSERT INTO questions
           (quizId, orderIndex, prompt, questionType, codeSnippet,
            optionA, optionB, optionC, optionD, optionE, optionF,
            correctOptions, correctExplanation,
            explanationA, explanationB, explanationC, explanationD, explanationE, explanationF,
            sourceTag)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quizId,
          i,
          q.prompt,
          q.questionType,
          q.codeSnippet || null,
          q.options.A,
          q.options.B,
          q.options.C,
          q.options.D,
          q.options.E,
          q.options.F,
          JSON.stringify(q.correctOptions),
          q.correctExplanation,
          q.optionExplanations.A,
          q.optionExplanations.B,
          q.optionExplanations.C,
          q.optionExplanations.D,
          q.optionExplanations.E,
          q.optionExplanations.F,
          q.sourceTag ?? null,
        ]
      );
    });
  });

  const created = queryOne<{
    id: number; title: string; description: string | null;
    tags: string | null; createdAt: string; updatedAt: string;
  }>('SELECT * FROM quizzes WHERE id = ?', [quizId])!;

  res.status(201).json({
    ...created,
    tags: created.tags ? JSON.parse(created.tags) : [],
    questionCount: data.questions.length,
  });
});

// PATCH /api/quizzes/:id — rename
router.patch('/:id', (req: Request, res: Response) => {
  const existing = queryOne('SELECT id FROM quizzes WHERE id = ?', [Number(req.params.id)]);
  if (!existing) {
    res.status(404).json({ error: 'Quiz not found' });
    return;
  }

  const result = RenameSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', issues: result.error.errors });
    return;
  }

  const now = new Date().toISOString();
  transaction(() => {
    runRaw('UPDATE quizzes SET title = ?, updatedAt = ? WHERE id = ?', [
      result.data.title, now, Number(req.params.id),
    ]);
  });

  const updated = queryOne<{
    id: number; title: string; description: string | null;
    tags: string | null; createdAt: string; updatedAt: string;
    questionCount: number;
  }>(
    `SELECT q.id, q.title, q.description, q.tags, q.createdAt, q.updatedAt,
            COUNT(qu.id) AS questionCount
     FROM quizzes q
     LEFT JOIN questions qu ON qu.quizId = q.id
     WHERE q.id = ?
     GROUP BY q.id`,
    [Number(req.params.id)]
  )!;

  res.json({ ...updated, tags: updated.tags ? JSON.parse(updated.tags) : [] });
});

// DELETE /api/quizzes/:id
router.delete('/:id', (req: Request, res: Response) => {
  const existing = queryOne('SELECT id FROM quizzes WHERE id = ?', [Number(req.params.id)]);
  if (!existing) {
    res.status(404).json({ error: 'Quiz not found' });
    return;
  }

  transaction(() => {
    runRaw('DELETE FROM questions WHERE quizId = ?', [Number(req.params.id)]);
    runRaw('DELETE FROM quizzes WHERE id = ?', [Number(req.params.id)]);
  });

  res.status(204).send();
});

export default router;
