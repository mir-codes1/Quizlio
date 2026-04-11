import { useCallback } from 'react';
import type { CompletionRecord } from '../types/quiz';

const key = (quizId: number) => `quiz_${quizId}`;

/** Returns true only if the parsed value looks like a valid CompletionRecord. */
function isValidRecord(val: unknown): val is CompletionRecord {
  if (!val || typeof val !== 'object') return false;
  const r = val as Record<string, unknown>;
  return (
    typeof r.completed === 'boolean' &&
    typeof r.score === 'number' &&
    typeof r.total === 'number' &&
    typeof r.completedAt === 'string'
  );
}

export function useCompletion() {
  const getRecord = useCallback(
    (quizId: number): CompletionRecord | null => {
      const raw = localStorage.getItem(key(quizId));
      if (!raw) return null;
      try {
        const parsed: unknown = JSON.parse(raw);
        return isValidRecord(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
    []
  );

  const setRecord = useCallback(
    (quizId: number, record: CompletionRecord) => {
      localStorage.setItem(key(quizId), JSON.stringify(record));
    },
    []
  );

  const clearRecord = useCallback((quizId: number) => {
    localStorage.removeItem(key(quizId));
  }, []);

  return { getRecord, setRecord, clearRecord };
}
