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
- At least 40% of questions should include code snippets
- Focus only on arrays, pointers, functions, and strings
- No questions about files
- Make snippets medium-length, not tiny
- Use only concepts explicitly present in the source material
- 25% of questions should be choose-all-that-apply questions

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
          <h1 className="font-display text-2xl font-bold text-blueslate-700" style={{ textShadow: '0 0 24px rgba(156,82,139,0.2), 0 0 8px rgba(71,81,90,0.15)' }}>Import Quiz</h1>
          <p className="mt-1 text-sm text-blueslate-600">
            Paste AI-generated quiz JSON, validate the structure, preview every question, then save.
          </p>
        </div>
        <button
          onClick={handleCopyPrompt}
          className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg border border-dust-400 bg-white hover:bg-dust-100 text-sm text-blueslate-600 hover:text-shadow transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L9 11.586l6.293-6.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-success-500">Copied!</span>
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
      <div
        className="relative border border-dust-400/60 rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(148deg, #fdfcfc 0%, #f0edec 55%, #e8e3e1 100%)',
          boxShadow: '0 4px 12px rgba(29,30,44,0.08), 0 1px 3px rgba(29,30,44,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        {/* Top-edge specular line */}
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none z-10" />
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-dust-300/70 bg-white/30">
          <span className="text-xs font-mono text-blueslate-500 select-none">quiz.json</span>
          {raw.trim() && (
            <button
              onClick={handleReset}
              className="text-xs text-blueslate-400 hover:text-shadow transition-colors"
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
          className="w-full font-mono text-sm bg-white px-4 py-3 text-shadow placeholder-blueslate-300 focus:outline-none resize-y min-h-[200px]"
        />
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-blueslate-500">
          {raw.trim() ? `${raw.length.toLocaleString()} chars` : 'Paste quiz JSON above'}
        </span>
        <button
          onClick={handleValidate}
          disabled={!canValidate}
          className="px-5 py-2 rounded-lg bg-grape-500 hover:bg-grape-600 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Validate
        </button>
      </div>

      {/* Parse error */}
      {stage.type === 'parse_error' && (
        <div className="mt-5 rounded-xl bg-danger-100 border border-danger-200 px-4 py-4">
          <p className="text-sm font-semibold text-danger-600 mb-1">JSON syntax error</p>
          <p className="text-sm text-danger-500">{stage.message}</p>
        </div>
      )}

      {/* Schema errors */}
      {stage.type === 'schema_errors' && (
        <div className="mt-5 rounded-xl bg-danger-100 border border-danger-200 px-4 py-4">
          <p className="text-sm font-semibold text-danger-600 mb-3">
            {stage.issues.length} validation error{stage.issues.length !== 1 ? 's' : ''}
          </p>
          <ul className="space-y-1.5">
            {stage.issues.map((issue, i) => (
              <li key={i} className="flex gap-2 text-xs">
                <code className="text-grape-600 font-mono shrink-0">{issue.path}</code>
                <span className="text-danger-500">{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Save error */}
      {stage.type === 'save_error' && (
        <div className="mt-5 rounded-xl bg-danger-100 border border-danger-200 px-4 py-4">
          <p className="text-sm font-semibold text-danger-600 mb-1">Save failed</p>
          <p className="text-sm text-danger-500">{stage.message}</p>
          {stage.issues && stage.issues.length > 0 && (
            <ul className="mt-2 space-y-1">
              {stage.issues.map((issue, i) => (
                <li key={i} className="text-xs text-danger-500 font-mono">
                  <span className="text-grape-600">{issue.path}</span>: {issue.message}
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => setStage({ type: 'idle' })}
            className="mt-3 text-xs text-danger-500 hover:text-danger-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Preview */}
      {previewData && (
        <div className="mt-6">

          {/* Preview header card */}
          <div className="rounded-xl border border-success-300 bg-success-100 px-5 py-4 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success-600 mb-2">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L9 11.586l6.293-6.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Valid — ready to save
                </span>
                <h2 className="font-display text-xl font-semibold text-blueslate-600 leading-snug">
                  {previewData.title}
                </h2>
                {previewData.description && (
                  <p className="mt-1 text-sm text-blueslate-600">{previewData.description}</p>
                )}
              </div>
              <div className="shrink-0 text-center">
                <div className="text-2xl font-bold text-shadow">{previewData.questions.length}</div>
                <div className="text-xs text-blueslate-600">
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
          <div className="mt-6 flex items-center justify-between rounded-xl border border-dust-500 bg-dust-400 px-5 py-4 shadow-card">
            <div>
              <p className="text-sm font-medium text-shadow">
                {previewData.questions.length} question{previewData.questions.length !== 1 ? 's' : ''} · looks good?
              </p>
              <p className="text-xs text-blueslate-600 mt-0.5">
                This quiz will be saved to your library.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={stage.type === 'saving'}
              className="px-6 py-2.5 rounded-lg bg-grape-500 hover:bg-grape-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    <div className="rounded-xl border border-dust-500 bg-dust-400 overflow-hidden shadow-card">
      {/* Question header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-dust-100 transition-colors"
      >
        <span className="shrink-0 mt-0.5 text-xs font-bold text-blueslate-400 w-6 text-right">
          {index + 1}.
        </span>
        <span className="flex-1 text-sm text-shadow line-clamp-2 leading-relaxed">
          {question.prompt}
        </span>
        <div className="shrink-0 flex items-center gap-2 ml-2">
          {isMulti ? (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded border border-grape-300 bg-grape-100 text-grape-600">
              multi
            </span>
          ) : (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded border border-dust-400 bg-dust-100 text-blueslate-600">
              single
            </span>
          )}
          {question.codeSnippet && (
            <span className="text-xs font-mono text-blueslate-600 bg-blueslate-100 px-1.5 py-0.5 rounded border border-blueslate-200">
              code
            </span>
          )}
          <svg
            className={`w-4 h-4 text-blueslate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-dust-300 px-4 pb-4 pt-3">

          {/* Question type hint */}
          {isMulti && (
            <p className="text-xs text-grape-500 mb-3">
              Choose all that apply — {question.correctOptions.length} correct options
            </p>
          )}

          {/* Full prompt */}
          <p className="text-sm text-shadow leading-relaxed">
            {question.prompt}
          </p>

          {/* Code snippet */}
          {question.codeSnippet && (
            <div className="mt-4 pt-3 border-t border-dust-300">
              <p className="text-[10px] font-mono uppercase tracking-widest text-blueslate-400 mb-2.5">
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
                      ? 'border-success-300 bg-success-100 text-success-700'
                      : 'border-dust-400 bg-dust-50 text-blueslate-700'
                  }`}
                >
                  <span
                    className={`shrink-0 font-bold text-xs mt-0.5 w-4 ${
                      isCorrect ? 'text-success-500' : 'text-blueslate-400'
                    }`}
                  >
                    {label}
                  </span>
                  <span className="leading-snug">{question.options[label]}</span>
                  {isCorrect && (
                    <svg className="shrink-0 w-3.5 h-3.5 text-success-500 ml-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L9 11.586l6.293-6.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>

          {/* Source tag */}
          {question.sourceTag && (
            <p className="mt-3 text-xs text-blueslate-400">
              Topic: <span className="text-blueslate-600">{question.sourceTag}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
