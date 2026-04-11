# MOQ Exam Trainer — Project Specification

## 1. Project Overview

**MOQ Exam Trainer** is a lightweight web app for hosting and taking high-quality, AI-generated multiple-choice quizzes designed to mimic real exam questions.

The app is meant to solve a specific problem: most quiz generators produce weak, shallow questions, especially for programming-heavy courses. They often focus too much on terminology, very short snippets, or generic questions, while real exams frequently use longer code snippets, applied reasoning, and plausible distractors.

This project separates **quiz generation** from **quiz delivery**:

- **Quiz generation** happens outside the app using ChatGPT 5.4 Thinking with a strict JSON schema.
- **Quiz delivery** happens inside the app, where users can import quiz JSON, browse quizzes, take them interactively, view answer feedback, and track completion.

The app is not meant to be a full learning platform or AI chatbot. It is a practical study tool focused on rendering high-quality exam-style MCQs cleanly and efficiently.

---

## 2. Core Goal

The goal of the project is to create a simple but effective system where:

1. High-quality quiz data is generated externally in strict JSON.
2. That quiz data is pasted into the app and saved.
3. The app renders the quiz in a clean, interactive format.
4. Code snippets are displayed as real formatted code blocks, not stuffed into question text.
5. Users can attempt quizzes from a shared public pool.
6. Each user's completed quizzes are tracked individually in their own browser.

This keeps the app affordable, simple to build, and strong as a study tool.

---

## 3. Problem Being Solved

Existing tools often fail in one or more of these ways:

- They generate weak or generic questions.
- They rely too much on definitions and terminology.
- They do not produce realistic exam-style code questions.
- Their formatting is poor, especially for code.
- They do not allow convenient answer selection like a proper interactive quiz.
- Over long contexts, AI chat can drift or hallucinate.

This app addresses those problems by:

- separating generation from delivery,
- enforcing structured quiz JSON,
- presenting questions in a true quiz UI,
- supporting cleanly rendered code snippets,
- and storing reusable quizzes in a public pool.

---

## 4. Product Scope

### In Scope for MVP

- Public quiz library
- Quiz import through pasted JSON
- Backend validation and storage
- Interactive quiz taking
- Multiple-choice answer selection
- Immediate feedback after submission
- Correct answer explanation
- Wrong answer explanations
- Final summary screen
- Rename quiz
- Delete quiz
- Individual completion tracking per browser
- Clean rendering of code snippets with formatting

### Out of Scope for MVP

- AI generation inside the app
- User accounts
- Authentication or permissions
- File uploads for source notes
- Collaborative editing controls
- Timers or proctored mode
- Analytics dashboard
- Comments or ratings
- Advanced search system

---

## 5. High-Level User Flow

### Step 1: Generate quiz JSON externally
The user uses ChatGPT 5.4 Thinking and gives it a strict prompt plus strict JSON schema. The model returns a quiz dataset containing multiple exam-style questions.

### Step 2: Paste JSON into the app
The user opens an **Import Quiz** page, pastes the JSON, validates it, previews it, and saves it.

### Step 3: Quiz is stored
The backend stores the quiz and its questions in the database.

### Step 4: Quiz appears in public library
The new quiz becomes visible to everyone using the app.

### Step 5: User takes quiz interactively
Questions are displayed cleanly with separate sections for prompt, code snippet, answer options, and explanations.

### Step 6: Completion is tracked locally
When a user completes every question, their browser marks the quiz as completed using local storage.

---

## 6. Main Product Requirements

## 6.1 Quiz Generation Assumption
The app assumes quiz content is already generated before import.

The app does **not** generate questions itself in MVP.

The quality of the app depends on using a strong generation prompt and strict schema. This is intentional: it keeps the application simpler and prevents mixing expensive or unreliable live AI behavior into the quiz experience.

---

## 6.2 JSON Import Requirement
The app must allow the user to paste a full JSON quiz payload into a text area.

The app should then:

- parse the JSON,
- validate required fields,
- surface any schema errors,
- show a preview,
- and allow saving only if the data is valid.

This import flow is better than requiring the user to manually call backend endpoints because it makes the system practical and easy to use.

---

## 6.3 Interactive Quiz Requirement
Each quiz must be attemptable inside the frontend.

For each question, the user should be able to:

- read the prompt,
- inspect a cleanly formatted code snippet if present,
- choose one answer,
- submit that answer,
- see whether it was correct,
- read why the correct answer is correct,
- and read why each wrong option is wrong.

The goal is not just answer checking. The goal is guided learning.

---

## 6.4 Clean Code Snippet Rendering Requirement
This is a **core requirement**.

Many quiz systems fail badly here by embedding code directly into question headings or paragraph text. That makes programming questions hard to read and much less useful.

This app must support a dedicated code snippet display area.

### Code rendering requirements

When a question includes code:

- the code must be rendered in a distinct visual block,
- spacing and indentation must be preserved,
- monospaced font must be used,
- line breaks must be preserved,
- long lines should be handled cleanly,
- the code block should not be merged into the prompt text,
- the code should remain readable on desktop and smaller screens.

### Recommended frontend behavior

- Show question prompt in normal text.
- Show code snippet in a separate code container below the prompt.
- Use syntax highlighting if feasible.
- Support vertical scrolling inside the code block when needed.
- Preserve formatting exactly as stored.

### Why this matters

Real programming exams often test logic by presenting actual code. If the app cannot render code cleanly, then the app fails at one of its main purposes.

This requirement should be treated as fundamental, not optional.

---

## 6.5 Public Quiz Pool Requirement
All saved quizzes must be visible on a shared frontend library.

For MVP, quizzes are public and unprotected. Any visitor may:

- view quizzes,
- take quizzes,
- rename quizzes,
- delete quizzes.

This is acceptable for MVP because the project is intended as a practical utility rather than a secure production platform.

---

## 6.6 Individual Completion Tracking Requirement
Completion tracking should be personal to each user/browser.

A quiz counts as completed only when **all questions have been answered** and the final summary screen has been reached.

This should not require accounts for MVP.

### Recommended implementation
Use **localStorage** in the browser.

Store something like:

- quiz ID
- completed status
- score
- total questions
- optional completion timestamp

### Why localStorage is the right choice

- simpler than accounts,
- easier than cookies,
- survives refreshes,
- enough for a study tool,
- no extra backend logic required.

---

## 7. Suggested Features

## 7.1 Quiz Library Page
The main library page should show all available quizzes.

Each quiz card should show:

- title,
- optional description,
- question count,
- tags if present,
- completed badge if completed in current browser,
- score summary if completed,
- buttons for start, rename, and delete.

Optional extras:

- sort by newest,
- filter by tag,
- search by title.

---

## 7.2 Import Quiz Page
This page should contain:

- a large text area for pasted JSON,
- a validate button,
- a preview area,
- validation error output,
- a save button.

The preview should help catch poor AI output before it enters the database.

---

## 7.3 Quiz Attempt Page
This page should render the quiz itself.

Each question should show:

- question number,
- prompt,
- code snippet block if present,
- four answer choices,
- submit answer button.

After submission, the page should show:

- selected answer,
- whether it was correct,
- correct answer,
- correct answer explanation,
- wrong option explanations,
- navigation to next question.

---

## 7.4 Results Page
After the final question, the app should show:

- number correct,
- number wrong,
- percentage,
- completed status,
- option to review,
- option to retake.

---

## 8. Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express

### Database
- SQLite

### Recommended utilities
- Zod or AJV for JSON validation
- Prisma, Drizzle, or raw SQLite queries for persistence
- React Router for navigation
- A syntax highlighter library for code blocks if desired

---

## 9. Recommended Architecture

### Frontend responsibilities
The frontend should:

- display quiz library,
- handle quiz taking flow,
- manage local completion state,
- render code blocks cleanly,
- call backend CRUD endpoints,
- validate pasted JSON client-side if desired before submission.

### Backend responsibilities
The backend should:

- validate incoming quiz payloads,
- store quizzes and questions,
- return quizzes to frontend,
- support rename and delete,
- keep the data format consistent.

### Database responsibilities
The database should:

- persist quizzes,
- persist questions,
- preserve answer metadata,
- keep code snippets separate from plain question text.

---

## 10. Data Model

## 10.1 Quiz Table
Suggested fields:

- `id`
- `title`
- `description` nullable
- `tags` nullable or stored separately
- `createdAt`
- `updatedAt`

## 10.2 Question Table
Suggested fields:

- `id`
- `quizId`
- `orderIndex`
- `prompt`
- `codeSnippet` nullable
- `language` nullable
- `optionA`
- `optionB`
- `optionC`
- `optionD`
- `correctOption`
- `correctExplanation`
- `explanationA`
- `explanationB`
- `explanationC`
- `explanationD`
- `sourceTag` nullable
- `difficulty` nullable

This keeps code separate from the main question text, which is important for clean rendering.

---

## 11. JSON Schema Design

The JSON format should be strict and frontend-friendly.

Example structure:

```json
{
  "title": "Pointers and Arrays Quiz",
  "description": "Exam-style MCQs on pointers, arrays, and string handling in C.",
  "tags": ["C", "Pointers", "Arrays"],
  "questions": [
    {
      "prompt": "What is the output of the following code?",
      "codeSnippet": "char arr[] = \"cat\";\nchar *p = arr;\nprintf(\"%c %c\", *p, *(p + 2));",
      "language": "c",
      "options": {
        "A": "c t",
        "B": "a t",
        "C": "c a",
        "D": "t c"
      },
      "correctOption": "A",
      "correctExplanation": "p points to the first character of arr, so *p is 'c' and *(p + 2) is 't'.",
      "optionExplanations": {
        "A": "Correct because the pointer accesses the first and third characters.",
        "B": "Incorrect because *p is not 'a'; it points to the first character.",
        "C": "Incorrect because *(p + 2) is 't', not 'a'.",
        "D": "Incorrect because the order is first character then third character."
      },
      "sourceTag": "Pointers in C",
      "difficulty": "medium"
    }
  ]
}
```

---

## 12. Validation Rules

To preserve quality, the backend should validate that:

- title exists,
- questions array exists,
- each question has exactly 4 options,
- each question has exactly 1 correct option,
- correct option is one of A/B/C/D,
- every option has an explanation,
- prompt is non-empty,
- codeSnippet is optional,
- if language exists, it is a reasonable string,
- there is at least 1 question,
- there are no malformed fields.

### Optional quality rules
You may also choose to validate soft standards like:

- quiz should contain at least 10 questions,
- at least some questions include code snippets,
- explanation text should not be empty,
- answer options should be distinct.

---

## 13. Backend API Design

## 13.1 Create Quiz
`POST /api/quizzes`

Creates a quiz from JSON payload.

Behavior:
- validate schema,
- save quiz,
- save all questions,
- return created quiz metadata.

## 13.2 Get All Quizzes
`GET /api/quizzes`

Returns quiz list for library page.

## 13.3 Get Quiz By ID
`GET /api/quizzes/:id`

Returns full quiz data including all questions.

## 13.4 Rename Quiz
`PATCH /api/quizzes/:id`

Allows title update.

## 13.5 Delete Quiz
`DELETE /api/quizzes/:id`

Deletes a quiz and its questions.

---

## 14. Frontend Behavior Details

## 14.1 Library Behavior
The library page should fetch all quizzes and show them as cards or rows.

Recommended visible fields:
- title
- number of questions
- tags
- completed badge
- last score if local data exists

Actions:
- start
- rename
- delete

---

## 14.2 Quiz-Taking Behavior
Recommended flow:

1. Load quiz by ID.
2. Render current question.
3. User selects one option.
4. User submits answer.
5. Answer locks.
6. Feedback panel appears.
7. User proceeds to next question.
8. After last question, show results page.
9. Mark quiz completed in localStorage.

### Important UX note
Do not immediately reveal correctness on option click. Require explicit submission. That better simulates an exam and avoids accidental reveals.

---

## 14.3 Code Snippet UX Details
Code display should be polished.

Recommended UI behavior:

- prompt text first,
- then code block in a bordered or elevated container,
- monospaced font,
- syntax highlighting if available,
- copy button optional,
- preserve indentation,
- allow horizontal scroll only if truly necessary,
- avoid squeezing code into tiny width,
- use line wrapping carefully depending on language and readability.

For some languages, horizontal scroll may be better than ugly wrapping.

### Strong recommendation
Treat `codeSnippet` as a first-class field in the renderer. Do not concatenate it into the prompt string.

---

## 15. Local Completion Tracking Design

Use a localStorage object keyed by quiz ID.

Example:

```json
{
  "quiz_12": {
    "completed": true,
    "score": 17,
    "total": 20,
    "completedAt": "2026-04-10T18:20:00Z"
  }
}
```

This allows the frontend to:
- show completed badge,
- display prior score,
- warn on retake,
- allow review mode.

This data is intentionally local to each browser.

---

## 16. Suggested Prompting Standards for Quiz Generation

Because quiz generation happens outside the app, question quality depends heavily on the generation prompt.

The prompt used with ChatGPT should require:

- exactly 20 questions,
- diverse question types,
- realistic exam-style wording,
- plausible distractors,
- code-heavy distribution,
- moderate to detailed code snippets,
- course-relevant topics only,
- specific explanations,
- strict JSON compliance,
- no extra prose outside JSON.

### Strong recommendation
The prompt should explicitly say:

- avoid definition-only questions unless necessary,
- imitate professor-style exam questions,
- include tracing, debugging, output prediction, and applied reasoning,
- ensure some snippets are several lines long,
- produce subtle but fair answer choices.

This is essential because the whole reason for the app is to overcome weak generic quiz generation.

---

## 17. Security / Trust Assumptions

For MVP, the app may assume all users are trusted enough to rename or delete quizzes.

This means:
- there is no auth,
- data can be modified by anyone,
- this is acceptable only because the app is a small utility project.

If later expanded, a future version should add:
- admin-only editing,
- ownership,
- moderation,
- version history.

But those are intentionally excluded from MVP.

---

## 18. Deployment Considerations

Since the app itself does not make AI calls, hosting costs can remain low.

### Frontend hosting
- Vercel or Netlify

### Backend hosting
- simple Node host
- or a full-stack deployment platform

### Database note
SQLite is excellent for local development and small deployments, but deployment persistence depends on where the file lives.

For MVP and personal use, SQLite is a strong choice.

If the project grows, a managed database may eventually be better.

---

## 19. Suggested Future Enhancements

These are good later additions, but not necessary now:

- filter quizzes by tag
- difficulty labels
- source labels like lecture/chapter
- review mode after completion
- import history
- duplicate quiz button
- partial progress saving
- question randomization
- retake with reshuffled options
- admin edit controls
- quiz export back to JSON

---

## 20. Why This Project Is Strong

This project is strong because it is:

- solving a real study problem,
- realistic to build,
- technically clean,
- useful immediately,
- and easy to explain.

It is also stronger than a generic “AI quiz generator” because the actual value is in the workflow:

- structured external AI generation,
- strict validation,
- clean rendering,
- code-friendly display,
- interactive explanation-based quiz delivery.

That makes it both practical and portfolio-worthy.

---

## 21. Final MVP Summary

### The app should:
- accept pasted quiz JSON,
- validate it,
- save it,
- show quizzes in a public library,
- render multiple-choice quizzes interactively,
- display code snippets cleanly in dedicated formatted blocks,
- show per-option explanations,
- show final score summary,
- track completion per browser with localStorage,
- allow rename and delete.

### The app should not yet:
- generate quizzes itself,
- use live AI calls,
- require accounts,
- manage permissions,
- upload source documents,
- become a full LMS.

---

## 22. One-Sentence Product Definition

**MOQ Exam Trainer is a lightweight web app that imports AI-generated exam-style MCQ quizzes and turns them into clean, interactive, code-friendly practice exams with detailed answer feedback and personal completion tracking.**
