# Quizlio — Exam Trainer

A lightweight web app for hosting and taking AI-generated exam-style MCQ quizzes.
Quizzes are generated externally (e.g. ChatGPT) as JSON and imported into the app.

## Running locally

Open **two terminals**.

### Terminal 1 — Backend

```bash
cd server
npm install
npm run dev
```

Server starts at **http://localhost:3001**

### Terminal 2 — Frontend

```bash
cd client
npm install
npm run dev
```

App opens at **http://localhost:5173**

The client proxies all `/api` requests to the server automatically.

---

## Tech stack

| Layer    | Tech                                  |
|----------|---------------------------------------|
| Frontend | React 18 + TypeScript + Tailwind CSS  |
| Backend  | Node.js + Express                     |
| Database | SQLite (via sql.js, file-persisted)   |
| Validation | Zod (both client and server)        |
| Routing  | React Router v6                       |
| Code highlighting | react-syntax-highlighter   |

## Project structure

```
Quizlio/
├── client/          # Vite + React + TypeScript + Tailwind
│   └── src/
│       ├── components/   # Layout, QuizCard, CodeBlock
│       ├── pages/        # LibraryPage, ImportPage, QuizPage, ResultsPage
│       ├── hooks/        # useCompletion (localStorage)
│       ├── lib/          # api.ts, quizSchema.ts (Zod)
│       └── types/        # quiz.ts (shared interfaces)
│
└── server/          # Express + SQLite
    └── src/
        ├── db/           # db.ts (connection), init.ts (schema)
        ├── routes/       # quizzes.ts (all 5 endpoints)
        └── validation/   # quizSchema.ts (Zod)
```
