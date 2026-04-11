import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizImportSchema } from '../lib/quizSchema';
import { api, ApiError } from '../lib/api';
import CodeBlock from '../components/CodeBlock';
import type { QuizImportSchema } from '../lib/quizSchema';

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Import Quiz</h1>
        <p className="mt-1 text-sm text-slate-400">
          Paste AI-generated quiz JSON, validate the structure, preview every question, then save.
        </p>
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
