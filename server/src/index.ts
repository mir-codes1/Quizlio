import express from 'express';
import cors from 'cors';
import { openDb } from './db/db';
import { initSchema } from './db/init';
import quizzesRouter from './routes/quizzes';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

app.use('/api/quizzes', quizzesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Open DB, init schema, then start listening
openDb().then(() => {
  initSchema();
  app.listen(PORT, () => {
    console.log(`Quizlio server running at http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialise database:', err);
  process.exit(1);
});
