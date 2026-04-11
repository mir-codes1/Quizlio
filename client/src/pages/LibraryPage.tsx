import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useCompletion } from '../hooks/useCompletion';
import QuizCard from '../components/QuizCard';
import type { Quiz } from '../types/quiz';

export default function LibraryPage() {
  const navigate = useNavigate();
  const { getRecord, clearRecord } = useCompletion();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rename state
  const [renaming, setRenaming] = useState<Quiz | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    api
      .getQuizzes()
      .then(setQuizzes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this quiz? This cannot be undone.')) return;
    try {
      setDeletingId(id);
      await api.deleteQuiz(id);
      clearRecord(id);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRenameSubmit() {
    if (!renaming || !renameValue.trim()) return;
    try {
      setRenameLoading(true);
      const updated = await api.renameQuiz(renaming.id, renameValue.trim());
      setQuizzes((prev) =>
        prev.map((q) => (q.id === updated.id ? { ...q, title: updated.title } : q))
      );
      setRenaming(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Rename failed');
    } finally {
      setRenameLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-blueslate-500">
        <svg className="animate-spin w-5 h-5 text-grape-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span className="text-sm">Loading quizzes…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-24 text-center">
        <p className="text-danger-500 font-medium">Failed to load quizzes</p>
        <p className="text-sm text-blueslate-600">{error}</p>
        <button
          onClick={load}
          className="mt-3 text-sm text-grape-500 hover:text-grape-600 underline underline-offset-2 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => navigate('/import')}
          className="text-sm bg-grape-500 hover:bg-grape-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Import
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-24 text-center">
          <div className="w-12 h-12 rounded-full bg-dust-200 border border-dust-400 flex items-center justify-center mb-1">
            <svg className="w-5 h-5 text-blueslate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-display text-shadow font-medium">No quizzes yet</p>
          <p className="text-sm text-blueslate-600">Import your first quiz to get started.</p>
          <button
            onClick={() => navigate('/import')}
            className="mt-4 px-5 py-2.5 rounded-lg bg-grape-500 hover:bg-grape-600 text-white text-sm font-medium transition-colors"
          >
            Import a Quiz
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              completion={getRecord(quiz.id)}
              isDeleting={deletingId === quiz.id}
              onStart={() => navigate(`/quiz/${quiz.id}`)}
              onRename={() => {
                setRenaming(quiz);
                setRenameValue(quiz.title);
              }}
              onDelete={() => {
                if (deletingId !== quiz.id) handleDelete(quiz.id);
              }}
            />
          ))}
        </div>
      )}

      {/* Rename modal */}
      {renaming && (
        <div className="fixed inset-0 bg-shadow/30 flex items-center justify-center z-50 p-4">
          <div className="bg-elevated border border-dust-400 rounded-xl p-6 w-full max-w-md shadow-card-lg">
            <h2 className="font-display text-base font-semibold text-blueslate-600 mb-4">Rename Quiz</h2>
            <input
              autoFocus
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit();
                if (e.key === 'Escape') setRenaming(null);
              }}
              className="w-full bg-white border border-dust-400 rounded-lg px-3 py-2.5 text-shadow text-sm focus:outline-none focus:border-grape-500 placeholder-blueslate-400 transition-colors"
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => setRenaming(null)}
                className="text-sm px-4 py-2 rounded-lg border border-dust-400 text-blueslate-600 hover:text-shadow hover:border-blueslate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameSubmit}
                disabled={renameLoading || !renameValue.trim()}
                className="text-sm px-4 py-2 rounded-lg bg-grape-500 hover:bg-grape-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {renameLoading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
