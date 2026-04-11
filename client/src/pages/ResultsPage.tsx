import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCompletion } from '../hooks/useCompletion';
import type { QuizWithQuestions, Question } from '../types/quiz';

interface AnswerState {
  selected: string[];
  submitted: boolean;
  correct: boolean;
}

interface LocationState {
  quiz: QuizWithQuestions;
  answers: Record<number, AnswerState>;
  score: number;
}

type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

function buildOptionText(q: Question): Record<OptionKey, string> {
  return {
    A: q.optionA, B: q.optionB, C: q.optionC,
    D: q.optionD, E: q.optionE, F: q.optionF,
  };
}

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { setRecord } = useCompletion();

  const state = location.state as LocationState | null;

  useEffect(() => {
    if (!state || !id) return;
    const { quiz, score } = state;
    setRecord(Number(id), {
      completed: true,
      score,
      total: quiz.questions.length,
      completedAt: new Date().toISOString(),
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!state) {
    navigate('/');
    return null;
  }

  const { quiz, answers, score } = state;
  const total = quiz.questions.length;
  const wrong = total - score;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  const grade =
    pct >= 90 ? 'Excellent' :
    pct >= 75 ? 'Good' :
    pct >= 60 ? 'Fair' :
    'Keep practising';

  const gradeColor =
    pct >= 90 ? 'text-success-600' :
    pct >= 75 ? 'text-success-500' :
    pct >= 60 ? 'text-grape-500' :
    'text-danger-500';

  const ringStroke =
    pct >= 90 ? '#2d7d5e' :
    pct >= 75 ? '#4a9e80' :
    pct >= 60 ? '#9c528b' :
    '#9b3050';

  const RADIUS = 40;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const targetOffset = CIRCUMFERENCE * (1 - pct / 100);

  const [dashOffset, setDashOffset] = useState(CIRCUMFERENCE);

  useEffect(() => {
    const id = requestAnimationFrame(() => setDashOffset(targetOffset));
    return () => cancelAnimationFrame(id);
  }, [targetOffset]);

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-widest text-blueslate-400 mb-1">Quiz Complete</p>
        <h1 className="font-display text-xl font-bold text-shadow">{quiz.title}</h1>
      </div>

      {/* Score summary */}
      <div className="bg-dust-400 border border-dust-500 rounded-2xl p-6 mb-6 shadow-card">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 justify-center">
          <div className="relative w-28 h-28 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Track ring */}
              <circle
                cx="50" cy="50" r={RADIUS}
                fill="none"
                stroke="#e5e0de"
                strokeWidth="9"
              />
              {/* Progress arc */}
              <circle
                cx="50" cy="50" r={RADIUS}
                fill="none"
                stroke={ringStroke}
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-shadow leading-none">{pct}%</span>
              <span className="text-[10px] text-blueslate-400 mt-1">{score}/{total}</span>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start gap-2.5">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-success-500 shrink-0" />
              <span className="text-shadow text-sm">
                <span className="font-bold">{score}</span> correct
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-danger-500 shrink-0" />
              <span className="text-shadow text-sm">
                <span className="font-bold">{wrong}</span> incorrect
              </span>
            </div>
            <p className={`text-sm font-semibold pt-0.5 ${gradeColor}`}>{grade}</p>
          </div>
        </div>
      </div>

      {/* Per-question breakdown */}
      <h2 className="text-[10px] font-mono uppercase tracking-widest text-blueslate-400 mb-3">
        Question Review
      </h2>
      <div className="space-y-2.5">
        {quiz.questions.map((q, idx) => {
          const ans = answers[q.id];
          const correct = ans?.correct ?? false;
          const selected = ans?.selected ?? [];
          const isMulti = q.questionType === 'multi';
          const optionText = buildOptionText(q);

          return (
            <div
              key={q.id}
              className={`rounded-xl border p-4 ${
                correct
                  ? 'border-success-300 bg-success-100'
                  : 'border-danger-200 bg-danger-100'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <span className="shrink-0 text-xs font-mono text-blueslate-400 mt-0.5">
                    Q{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-shadow leading-relaxed">{q.prompt}</p>
                    {isMulti && (
                      <span className="inline-block mt-0.5 text-[10px] text-grape-500">
                        choose all that apply
                      </span>
                    )}
                  </div>
                </div>
                <span className={`shrink-0 text-xs font-bold ${correct ? 'text-success-600' : 'text-danger-600'}`}>
                  {correct ? '✓' : '✗'}
                </span>
              </div>

              {/* Answer lines */}
              <div className="ml-6 space-y-1">
                {!correct && selected.length > 0 && (
                  <div>
                    <p className="text-xs text-danger-500">
                      Your {selected.length > 1 ? 'selections' : 'answer'}:{' '}
                      <span className="font-mono font-semibold">{selected.join(', ')}</span>
                    </p>
                    {selected.map((key) => (
                      <p key={key} className="text-xs text-danger-400 ml-2">
                        {key} — {optionText[key as OptionKey]}
                      </p>
                    ))}
                  </div>
                )}
                <div>
                  <p className="text-xs text-success-600">
                    Correct:{' '}
                    <span className="font-mono font-semibold">{q.correctOptions.join(', ')}</span>
                  </p>
                  {q.correctOptions.map((key) => (
                    <p key={key} className="text-xs text-success-500 ml-2">
                      {key} — {optionText[key as OptionKey]}
                    </p>
                  ))}
                </div>
                {!correct && q.correctExplanation && (
                  <p className="text-xs text-blueslate-600 leading-relaxed pt-1">
                    {q.correctExplanation}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center mt-8">
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl border border-dust-400 hover:border-blueslate-600 text-blueslate-600 hover:text-shadow text-sm font-medium transition-colors"
        >
          Back to Library
        </button>
        <button
          onClick={() => navigate(`/quiz/${id}`, { replace: true })}
          className="px-5 py-2.5 rounded-xl bg-grape-500 hover:bg-grape-600 text-white text-sm font-medium transition-colors"
        >
          Retake Quiz
        </button>
      </div>
    </div>
  );
}
