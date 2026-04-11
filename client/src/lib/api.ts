import type { Quiz, QuizWithQuestions } from '../types/quiz';
import type { QuizImportSchema } from './quizSchema';

const BASE = `${import.meta.env.VITE_API_URL ?? ''}/api`;

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.error ?? 'Request failed', body?.issues);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public issues?: { path: string; message: string }[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  getQuizzes(): Promise<Quiz[]> {
    return request('/quizzes');
  },

  getQuiz(id: number): Promise<QuizWithQuestions> {
    return request(`/quizzes/${id}`);
  },

  createQuiz(payload: QuizImportSchema): Promise<Quiz> {
    return request('/quizzes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  renameQuiz(id: number, title: string): Promise<Quiz> {
    return request(`/quizzes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  },

  deleteQuiz(id: number): Promise<void> {
    return request(`/quizzes/${id}`, { method: 'DELETE' });
  },
};
