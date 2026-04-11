import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizImportSchema } from '../lib/quizSchema';
import { api, ApiError } from '../lib/api';
import CodeBlock from '../components/CodeBlock';
import type { QuizImportSchema } from '../lib/quizSchema';

const AI_PROMPT = `You are generating a quiz in STRICT JSON FORMAT ONLY.

Your task is to create a high-quality, exam-style multiple choice quiz based on the user's provided study material and instructions.

Follow every rule exactly.

==================================================
OUTPUT FORMAT RULES
==================================================

1. Output exactly ONE fenced code block labeled json.
2. Do not write any text before the code block.
3. Do not write any text after the code block.
4. Inside that code block, output exactly ONE valid JSON object.
5. Do not include markdown headings, commentary, notes, or explanations outside the JSON.
6. The JSON must parse successfully with a strict JSON parser.
7. The JSON must be directly pasteable into a quiz app after copying only the contents of the json code block.

The final answer must look like this shape and nothing else:

\`\`\`json
{
  "title": "...",
  "description": "...",
  "questions": [...]
}
\`\`\`

==================================================
CRITICAL JSON VALIDITY RULES
==================================================

Everything inside the code block must be valid JSON.

That means:

- Every key must use double quotes.
- Every string value must use double quotes.
- Every double quote INSIDE any string value must be escaped as \\"
- Every backslash must be escaped when needed
- Every newline inside a string must be written as \\n
- Never place raw multi-line code directly inside a JSON string
- Never place unescaped code quotes inside codeSnippet
- Never leave trailing commas
- Never use comments
- Never use markdown inside the JSON
- Never use ellipses like ... unless they are inside a valid JSON string

Examples of required escaping inside JSON strings:
- printf(\\"%d\\\\n\\", x);
- char s[20] = \\"hello\\";
- Line 1\\nLine 2\\nLine 3

If a code snippet contains quotes, all of those quotes must still be escaped for JSON.

==================================================
FINAL SELF-CHECK RULES
==================================================

Before producing the final answer, internally perform this checklist:

1. Verify the response contains exactly one json code block.
2. Verify there is no text outside the code block.
3. Verify the content inside the code block is a single valid JSON object.
4. Verify every codeSnippet is a valid JSON string.
5. Verify all inner quotes inside prompt, codeSnippet, correctExplanation, and optionExplanations are escaped.
6. Verify all newlines inside codeSnippet are encoded as \\n.
7. Verify every question has exactly 6 options: A, B, C, D, E, F.
8. Verify correctOptions matches questionType.
9. Verify optionExplanations includes A through F.
10. Verify the final JSON would successfully parse with JSON.parse(...).

If any part would fail JSON.parse(...), fix it before outputting.

==================================================
PURPOSE
==================================================

The goal is to generate a realistic, challenging, exam-style quiz.

This quiz must NOT feel like a shallow terminology quiz.
It should feel like a real professor-written exam.

Prioritize:
- realistic code snippet questions
- reasoning questions
- output tracing
- bug identification
- concept application
- subtle but fair distractors
- detailed, relevant explanations

Avoid:
- trivial definitions
- obvious answers
- one-line filler questions
- generic flashcard-style wording
- repetitive distractors

==================================================
QUESTION TYPE RULES
==================================================

You may generate two kinds of questions:

1. "single"
- Exactly one option is correct.

2. "multi"
- More than one option may be correct.
- Use this for choose-all-that-apply questions.

If questionType is "multi", the prompt must clearly say that multiple answers may be correct.

==================================================
ANSWER DISTRIBUTION RULES
==================================================

To avoid predictable answer patterns, distribute correct answers across option letters in a balanced, varied way.

For "single" questions:
- Do NOT repeatedly place the correct answer in A or B.
- Randomize the correct option position across A, B, C, D, E, and F.
- Across the full quiz, aim for a balanced spread of correct single-answer positions.
- Avoid obvious patterns such as:
  - many consecutive answers with the same letter
  - mostly A/B answers
  - alphabetical runs like A, B, C, D
  - repeated cycles

For "multi" questions:
- Randomize which letters are correct.
- Do not make the correct sets cluster mostly around early letters.
- Use a varied mix such as:
  - two-correct-answer sets
  - three-correct-answer sets
  - occasional four-correct-answer sets if appropriate
- Keep correctOptions sorted alphabetically, but choose the correct set itself in a varied way.

Before finalizing:
- Review the entire quiz's answer distribution.
- If the answer pattern looks biased toward A or B, rebalance it.
- Make the final answer placement feel naturally mixed and non-patterned.

==================================================
QUESTION MIX RULES
==================================================

Unless the user explicitly says otherwise, aim for a diverse mix of:
- output prediction
- bug/error identification
- concept application
- which explanation is best
- which change fixes the issue
- code tracing
- edge-case reasoning
- choose all that apply
- select all true statements

If the material is programming-heavy, at least 50% of the questions should involve code snippets.

==================================================
JSON SCHEMA
==================================================

Return JSON with this exact structure:

{
  "title": "string",
  "description": "string",
  "questions": [
    {
      "prompt": "string",
      "questionType": "single or multi",
      "codeSnippet": "string or empty string",
      "options": {
        "A": "string",
        "B": "string",
        "C": "string",
        "D": "string",
        "E": "string",
        "F": "string"
      },
      "correctOptions": ["A"],
      "correctExplanation": "string",
      "optionExplanations": {
        "A": "string",
        "B": "string",
        "C": "string",
        "D": "string",
        "E": "string",
        "F": "string"
      },
      "sourceTag": "string"
    }
  ]
}

==================================================
FIELD RULES
==================================================

"title"
- A concise, appropriate quiz title.

"description"
- One short sentence summarizing the quiz focus.

For each question:

"prompt"
- Clear, exam-style wording.
- If questionType is "multi", explicitly indicate choose all that apply.

"questionType"
- Must be exactly "single" or "multi".

"codeSnippet"
- Put the full code here if the question uses code.
- Preserve line breaks using \\n only.
- If no code is needed, use "".
- Do not place code in the prompt if it belongs in codeSnippet.

"options"
- Must contain exactly 6 options: A, B, C, D, E, F.

"correctOptions"
- Must always be an array.
- For "single", include exactly 1 option.
- For "multi", include 2 or more options in alphabetical order.

"correctExplanation"
- Explain why the correct answer or full correct set is correct.
- Be specific to the question.

"optionExplanations"
- Must contain A through F.
- Every option must have a useful explanation.
- Do not use lazy wording like "just incorrect".

"sourceTag"
- A short topic label such as:
  "Pointers", "Recursion", "Arrays", "Shell Scripting", "Lecture 4"

==================================================
CONSISTENCY RULES
==================================================

You must ensure:
- Every question has exactly 6 options
- Every question has at least 1 correct option
- If questionType = "single", correctOptions has exactly 1 item
- If questionType = "multi", correctOptions has at least 2 items
- Every correct option exists in options
- optionExplanations includes all 6 keys
- Explanations agree with correctOptions
- No contradictions
- No malformed JSON

==================================================
QUALITY RULES
==================================================

Before finalizing:
- Match the requested topic and scope closely
- Match the requested number of questions exactly
- Match the requested difficulty
- Match the requested programming language or subject
- Use codeSnippet properly
- Make multi questions genuinely multi-answer
- Make explanations concrete and useful
- Make the quiz feel like a real exam
- Check that answer placement is balanced across the quiz

==================================================
USER INPUT SECTION
==================================================

Generate a quiz using the following requirements:

QUIZ TITLE OR TOPIC:
[PASTE HERE]

QUIZ DESCRIPTION / WHAT IT SHOULD COVER:
[PASTE HERE]

SOURCE MATERIAL / CONTENT TO DRAW FROM:
[PASTE HERE]

PROGRAMMING LANGUAGE OR SUBJECT AREA:
[PASTE HERE]

NUMBER OF QUESTIONS:
[PASTE HERE]

DIFFICULTY:
[PASTE HERE]

EXAM STYLE NOTES:
[PASTE HERE]
Examples:
- My exam uses many code tracing questions
- My professor likes subtle distractors
- Focus on bugs, outputs, and pointer behavior
- Avoid simple definition questions
- Make it feel like a real multiple choice exam
- Include some choose-all-that-apply questions

ADDITIONAL CONSTRAINTS:
[PASTE HERE]
Examples:
- At least 12 of 20 questions should include code snippets
- Focus only on arrays, pointers, functions, and strings
- No questions about files
- Make snippets medium-length, not tiny
- Use only concepts explicitly present in the source material
- Include 4 choose-all-that-apply questions

==================================================
FINAL INSTRUCTION
==================================================

Return exactly one json code block and nothing else.

Inside it, output exactly one valid JSON object that would successfully parse with JSON.parse(...) with no edits.

Do not include commentary outside the code block.
Do not include markdown except the single json code fence.
Do not output invalid escaping.
Do not output raw multi-line strings.`;

type ValidationIssue = { path: string; message: string };

type Stage =
  | { type: 'idle' }
  | { type: 'parse_error'; message: string }
  | { type: 'schema_errors'; issues: ValidationIssue[] }
  | { type: 'preview'; data: QuizImportSchema }
  | { type: 'saving' }
  | { type: 'save_error'; message: string; issues?: ValidationIssue[] };

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

export default function ImportPage() {
  const navigate = useNavigate();
  const [raw, setRaw] = useState('');
  const [stage, setStage] = useState<Stage>({ type: 'idle' });
  const [copied, setCopied] = useState(false);

  async function handleCopyPrompt() {
    await navigator.clipboard.writeText(AI_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleChange(value: string) {
    setRaw(value);
    if (stage.type === 'parse_error' || stage.type === 'schema_errors') {
      setStage({ type: 'idle' });
    }
  }

  function handleValidate() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setStage({
        type: 'parse_error',
        message:
          'Not valid JSON. Check for missing commas, unclosed brackets or quotes, and trailing commas.',
      });
      return;
    }

    const result = quizImportSchema.safeParse(parsed);
    if (!result.success) {
      setStage({
        type: 'schema_errors',
        issues: result.error.errors.map((e) => ({
          path: e.path.join('.') || 'root',
          message: e.message,
        })),
      });
      return;
    }

    setStage({ type: 'preview', data: result.data });
  }

  async function handleSave() {
    if (stage.type !== 'preview') return;
    const data = stage.data;
    setStage({ type: 'saving' });
    try {
      const created = await api.createQuiz(data);
      navigate('/', { state: { imported: created.id } });
    } catch (err) {
      if (err instanceof ApiError && err.issues) {
        setStage({ type: 'save_error', message: err.message, issues: err.issues });
      } else {
        setStage({
          type: 'save_error',
          message: err instanceof Error ? err.message : 'Save failed — unknown error.',
        });
      }
    }
  }

  function handleReset() {
    setRaw('');
    setStage({ type: 'idle' });
  }

  const canValidate = raw.trim().length > 0 && stage.type !== 'saving';
  const previewData = stage.type === 'preview' ? stage.data : null;

  return (
    <div className="max-w-3xl mx-auto">

      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Import Quiz</h1>
          <p className="mt-1 text-sm text-slate-400">
            Paste AI-generated quiz JSON, validate the structure, preview every question, then save.
          </p>
        </div>
        <button
          onClick={handleCopyPrompt}
          className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-slate-500 text-sm text-slate-300 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L9 11.586l6.293-6.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy Prompt
            </>
          )}
        </button>
      </div>

      {/* Input area */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700 bg-slate-800/80">
          <span className="text-xs font-mono text-slate-400 select-none">quiz.json</span>
          {raw.trim() && (
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <textarea
          value={raw}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={'{\n  "title": "My Quiz",\n  "questions": [...]\n}'}
          rows={18}
          spellCheck={false}
          className="w-full font-mono text-sm bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none resize-y min-h-[200px]"
        />
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-slate-500">
          {raw.trim() ? `${raw.length.toLocaleString()} chars` : 'Paste quiz JSON above'}
        </span>
        <button
          onClick={handleValidate}
          disabled={!canValidate}
          className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Validate
        </button>
      </div>

      {/* Parse error */}
      {stage.type === 'parse_error' && (
        <div className="mt-5 rounded-xl bg-red-950/60 border border-red-800 px-4 py-4">
          <p className="text-sm font-semibold text-red-400 mb-1">JSON syntax error</p>
          <p className="text-sm text-red-300">{stage.message}</p>
        </div>
      )}

      {/* Schema errors */}
      {stage.type === 'schema_errors' && (
        <div className="mt-5 rounded-xl bg-red-950/60 border border-red-800 px-4 py-4">
          <p className="text-sm font-semibold text-red-400 mb-3">
            {stage.issues.length} validation error{stage.issues.length !== 1 ? 's' : ''}
          </p>
          <ul className="space-y-1.5">
            {stage.issues.map((issue, i) => (
              <li key={i} className="flex gap-2 text-xs">
                <code className="text-red-300 font-mono shrink-0">{issue.path}</code>
                <span className="text-red-400">{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Save error */}
      {stage.type === 'save_error' && (
        <div className="mt-5 rounded-xl bg-red-950/60 border border-red-800 px-4 py-4">
          <p className="text-sm font-semibold text-red-400 mb-1">Save failed</p>
          <p className="text-sm text-red-300">{stage.message}</p>
          {stage.issues && stage.issues.length > 0 && (
            <ul className="mt-2 space-y-1">
              {stage.issues.map((issue, i) => (
                <li key={i} className="text-xs text-red-400 font-mono">
                  <span className="text-red-300">{issue.path}</span>: {issue.message}
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => setStage({ type: 'idle' })}
            className="mt-3 text-xs text-red-400 hover:text-red-200 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Preview */}
      {previewData && (
        <div className="mt-6">

          {/* Preview header card */}
          <div className="rounded-xl border border-emerald-700/60 bg-slate-800 px-5 py-4 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 mb-2">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L9 11.586l6.293-6.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Valid — ready to save
                </span>
                <h2 className="text-xl font-semibold text-white leading-snug">
                  {previewData.title}
                </h2>
                {previewData.description && (
                  <p className="mt-1 text-sm text-slate-400">{previewData.description}</p>
                )}
              </div>
              <div className="shrink-0 text-center">
                <div className="text-2xl font-bold text-white">{previewData.questions.length}</div>
                <div className="text-xs text-slate-400">
                  question{previewData.questions.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Question list */}
          <div className="space-y-3">
            {previewData.questions.map((q, i) => (
              <QuestionPreview key={i} index={i} question={q} />
            ))}
          </div>

          {/* Save action */}
          <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 px-5 py-4">
            <div>
              <p className="text-sm font-medium text-white">
                {previewData.questions.length} question{previewData.questions.length !== 1 ? 's' : ''} · looks good?
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                This quiz will be saved to your library.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={stage.type === 'saving'}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {stage.type === 'saving' ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving…
                </span>
              ) : (
                'Save Quiz'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- sub-component ----------

interface QuestionPreviewProps {
  index: number;
  question: QuizImportSchema['questions'][number];
}

function QuestionPreview({ index, question }: QuestionPreviewProps) {
  const [expanded, setExpanded] = useState(index < 3);
  const isMulti = question.questionType === 'multi';

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 overflow-hidden">
      {/* Question header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-700/40 transition-colors"
      >
        <span className="shrink-0 mt-0.5 text-xs font-bold text-slate-500 w-6 text-right">
          {index + 1}.
        </span>
        <span className="flex-1 text-sm text-slate-200 line-clamp-2 leading-relaxed">
          {question.prompt}
        </span>
        <div className="shrink-0 flex items-center gap-2 ml-2">
          {isMulti ? (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded border border-violet-700/50 bg-violet-900/30 text-violet-300">
              multi
            </span>
          ) : (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded border border-slate-600/50 bg-slate-700/30 text-slate-400">
              single
            </span>
          )}
          {question.codeSnippet && (
            <span className="text-xs font-mono text-indigo-400 bg-indigo-900/30 px-1.5 py-0.5 rounded border border-indigo-800/50">
              code
            </span>
          )}
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-slate-700 px-4 pb-4 pt-3">

          {/* Question type hint */}
          {isMulti && (
            <p className="text-xs text-violet-400 mb-3">
              Choose all that apply — {question.correctOptions.length} correct options
            </p>
          )}

          {/* Full prompt */}
          <p className="text-sm text-slate-200 leading-relaxed">
            {question.prompt}
          </p>

          {/* Code snippet */}
          {question.codeSnippet && (
            <div className="mt-4 pt-3 border-t border-slate-700/60">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2.5">
                Code
              </p>
              <CodeBlock code={question.codeSnippet} />
            </div>
          )}

          {/* Options grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            {OPTION_LABELS.map((label) => {
              const isCorrect = question.correctOptions.includes(label);
              return (
                <div
                  key={label}
                  className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${
                    isCorrect
                      ? 'border-emerald-700/60 bg-emerald-950/40 text-emerald-300'
                      : 'border-slate-700 bg-slate-800 text-slate-300'
                  }`}
                >
                  <span
                    className={`shrink-0 font-bold text-xs mt-0.5 w-4 ${
                      isCorrect ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {label}
                  </span>
                  <span className="leading-snug">{question.options[label]}</span>
                  {isCorrect && (
                    <svg className="shrink-0 w-3.5 h-3.5 text-emerald-400 ml-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L9 11.586l6.293-6.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>

          {/* Source tag */}
          {question.sourceTag && (
            <p className="mt-3 text-xs text-slate-500">
              Topic: <span className="text-slate-400">{question.sourceTag}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
