import type { Quiz, CompletionRecord } from '../types/quiz';

interface QuizCardProps {
  quiz: Quiz;
  completion: CompletionRecord | null;
  isDeleting?: boolean;
  onStart: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export default function QuizCard({
  quiz,
  completion,
  isDeleting = false,
  onStart,
  onRename,
  onDelete,
}: QuizCardProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 flex flex-col gap-3 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-white text-base leading-snug truncate">
            {quiz.title}
          </h2>
          {quiz.description && (
            <p className="mt-0.5 text-sm text-slate-400 line-clamp-2">
              {quiz.description}
            </p>
          )}
        </div>
        {completion?.completed && (
          <span className="shrink-0 text-xs font-medium bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/40">
            Completed
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>{quiz.questionCount} question{quiz.questionCount !== 1 ? 's' : ''}</span>
        {completion && (
          <span className="text-emerald-400">
            {completion.score}/{completion.total} correct
          </span>
        )}
        {quiz.tags.map((tag) => (
          <span
            key={tag}
            className="bg-slate-700/70 text-slate-400 px-2 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-0.5">
        <button
          onClick={onStart}
          className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-1.5 transition-colors"
        >
          {completion?.completed ? 'Retake' : 'Start'}
        </button>
        <button
          onClick={onRename}
          className="rounded-lg border border-slate-600 hover:border-slate-500 text-slate-400 hover:text-white text-sm px-3 py-1.5 transition-colors"
        >
          Rename
        </button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="rounded-lg border border-slate-600 hover:border-red-600/70 text-slate-500 hover:text-red-400 text-sm px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isDeleting ? '…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
