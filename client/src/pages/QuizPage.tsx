import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import CodeBlock from '../components/CodeBlock';
import type { QuizWithQuestions, Question } from '../types/quiz';

type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

const OPTIONS: OptionKey[] = ['A', 'B', 'C', 'D', 'E', 'F'];

interface AnswerState {
  selected: string[];
  submitted: boolean;
  correct: boolean;
}

function setsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const feedbackRef = useRef<HTMLDivElement>(null);

  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});

  useEffect(() => {
    if (!id) return;
    api
      .getQuiz(Number(id))
      .then(setQuiz)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-slate-400">Loading quiz…</div>;
  if (error) return <div className="text-center py-20 text-red-400">Error: {error}</div>;
  if (!quiz) return null;

  const questions = quiz.questions;
  const q: Question = questions[currentIndex];
  const currentAnswer = answers[q.id];
  const isSubmitted = currentAnswer?.submitted ?? false;
  const isLastQuestion = currentIndex === questions.length - 1;
  const isMulti = q.questionType === 'multi';

  const optionText: Record<OptionKey, string> = {
    A: q.optionA, B: q.optionB, C: q.optionC,
    D: q.optionD, E: q.optionE, F: q.optionF,
  };
  const optionExplanation: Record<OptionKey, string> = {
    A: q.explanationA, B: q.explanationB, C: q.explanationC,
    D: q.explanationD, E: q.explanationE, F: q.explanationF,
  };

  function selectOption(key: OptionKey) {
    if (isSubmitted) return;
    setAnswers((prev) => {
      const prevSelected = prev[q.id]?.selected ?? [];
      let newSelected: string[];
      if (isMulti) {
        // Toggle the clicked option
        newSelected = prevSelected.includes(key)
          ? prevSelected.filter((k) => k !== key)
          : [...prevSelected, key];
      } else {
        // Single: replace selection
        newSelected = [key];
      }
      return {
        ...prev,
        [q.id]: { selected: newSelected, submitted: false, correct: false },
      };
    });
  }

  function submitAnswer() {
    if (!currentAnswer || currentAnswer.selected.length === 0 || isSubmitted) return;
    const correct = setsEqual(currentAnswer.selected, q.correctOptions);
    setAnswers((prev) => ({
      ...prev,
      [q.id]: { ...prev[q.id], submitted: true, correct },
    }));
    setTimeout(() => {
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
  }

  function handleNext() {
    if (isLastQuestion) {
      const score = questions.filter((question) => {
        const ans = answers[question.id];
        return ans?.submitted && ans.correct;
      }).length;
      navigate(`/quiz/${quiz!.id}/results`, {
        state: { quiz, answers, score },
      });
    } else {
      setCurrentIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function optionStyle(key: OptionKey): string {
    const base =
      'w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors flex items-start gap-3 ';

    if (!isSubmitted) {
      return (
        base +
        (currentAnswer?.selected.includes(key)
          ? 'border-indigo-500 bg-indigo-950/60 text-white ring-1 ring-indigo-500/40'
          : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-400 hover:text-white cursor-pointer')
      );
    }

    const isCorrect = q.correctOptions.includes(key);
    const isSelected = currentAnswer?.selected.includes(key) ?? false;

    if (isCorrect && isSelected) {
      return base + 'border-emerald-500 bg-emerald-950/50 text-emerald-200';
    }
    if (isCorrect && !isSelected) {
      // Missed correct option — muted emerald to indicate what was needed
      return base + 'border-emerald-600/40 bg-emerald-950/20 text-emerald-300/60';
    }
    if (!isCorrect && isSelected) {
      return base + 'border-red-500 bg-red-950/50 text-red-300';
    }
    return base + 'border-slate-700 bg-slate-800/60 text-slate-500';
  }

  function keyBadgeStyle(key: OptionKey): string {
    const base = 'shrink-0 mt-0.5 w-6 h-6 rounded-md text-xs font-bold font-mono flex items-center justify-center ';
    if (!isSubmitted) {
      return base + (currentAnswer?.selected.includes(key)
        ? 'bg-indigo-600 text-white'
        : 'bg-slate-700 text-slate-400');
    }
    const isCorrect = q.correctOptions.includes(key);
    const isSelected = currentAnswer?.selected.includes(key) ?? false;
    if (isCorrect) return base + 'bg-emerald-700 text-emerald-100';
    if (isSelected) return base + 'bg-red-700 text-red-100';
    return base + 'bg-slate-700 text-slate-400';
  }

  function optionIcon(key: OptionKey): string | null {
    if (!isSubmitted) return null;
    if (q.correctOptions.includes(key)) return '✓';
    if (currentAnswer?.selected.includes(key)) return '✗';
    return null;
  }

  function explanationColor(key: OptionKey): string {
    if (q.correctOptions.includes(key)) return 'text-emerald-400/80';
    if (currentAnswer?.selected.includes(key)) return 'text-red-400/70';
    return 'text-slate-500';
  }

  const answeredCount = Object.values(answers).filter((a) => a.submitted).length;
  const canSubmit = (currentAnswer?.selected.length ?? 0) > 0 && !isSubmitted;

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* Progress header */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <span className="font-medium text-slate-400">
          Question <span className="text-white">{currentIndex + 1}</span> of {questions.length}
        </span>
        <span className="truncate max-w-[40%] text-right">{quiz.title}</span>
      </div>
      <div className="w-full bg-slate-700/50 rounded-full h-1 mb-1">
        <div
          className="bg-indigo-500 h-1 rounded-full transition-all duration-300"
          style={{ width: `${(answeredCount / questions.length) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-600 mb-7">
        <span>{answeredCount} answered</span>
        <span>{questions.length - answeredCount} remaining</span>
      </div>

      {/* Question card */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-4">
        {/* Header row: question number + type badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono font-bold bg-slate-700 text-slate-400 px-2 py-0.5 rounded">
            Q{currentIndex + 1}
          </span>
          {isMulti ? (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-900/50 text-violet-300 border border-violet-700/40">
              Choose all that apply
            </span>
          ) : (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600/40">
              Single answer
            </span>
          )}
        </div>

        {/* Prompt */}
        <p className="text-slate-100 text-base leading-relaxed">
          {q.prompt}
        </p>

        {/* Code snippet */}
        {q.codeSnippet && (
          <div className="mt-5 pt-4 border-t border-slate-700/60">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2.5">
              Code
            </p>
            <CodeBlock code={q.codeSnippet} />
          </div>
        )}
      </div>

      {/* Answer options */}
      <div className="space-y-3">
        {OPTIONS.map((key) => {
          const icon = optionIcon(key);
          return (
            <div key={key}>
              <button
                className={optionStyle(key)}
                onClick={() => selectOption(key)}
                disabled={isSubmitted}
              >
                <span className={keyBadgeStyle(key)}>
                  {icon ?? key}
                </span>
                <span className="flex-1 leading-relaxed">{optionText[key]}</span>
              </button>

              {/* Per-option explanation — only shown after submission */}
              {isSubmitted && optionExplanation[key] && (
                <p className={`text-xs mt-1.5 ml-9 leading-relaxed ${explanationColor(key)}`}>
                  {optionExplanation[key]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Feedback panel */}
      {isSubmitted && (
        <div
          ref={feedbackRef}
          className={`mt-5 rounded-xl border ${
            currentAnswer?.correct
              ? 'border-emerald-600/40 bg-emerald-950/30'
              : 'border-red-600/40 bg-red-950/20'
          }`}
        >
          {/* Verdict header */}
          <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${
            currentAnswer?.correct ? 'border-emerald-700/30' : 'border-red-700/30'
          }`}>
            <span className={`text-sm font-bold tracking-wide ${
              currentAnswer?.correct ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {currentAnswer?.correct ? '✓ Correct' : '✗ Incorrect'}
            </span>
            {!currentAnswer?.correct && (
              <span className="text-xs text-slate-400">
                Correct{isMulti ? ' (all required)' : ''}:{' '}
                <span className="font-mono font-semibold text-emerald-400">
                  {q.correctOptions.join(', ')}
                </span>
              </span>
            )}
          </div>

          {/* For multi: show what the user selected vs what was correct */}
          {!currentAnswer?.correct && isMulti && (
            <div className="px-4 pt-3 pb-0">
              <p className="text-xs text-slate-500">
                Your selection:{' '}
                <span className="font-mono text-slate-400">
                  {currentAnswer?.selected.length
                    ? currentAnswer.selected.join(', ')
                    : 'none'}
                </span>
              </p>
            </div>
          )}

          {/* Explanation */}
          {q.correctExplanation && (
            <div className="px-4 py-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">
                Explanation
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {q.correctExplanation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between mt-6">
        <span className="text-xs text-slate-500">
          {!isSubmitted && (currentAnswer?.selected.length ?? 0) === 0
            ? isMulti
              ? 'Select all correct options, then submit'
              : 'Select an answer to continue'
            : !isSubmitted
            ? isMulti
              ? `${currentAnswer!.selected.length} selected — ready to submit`
              : 'Ready to submit'
            : ''}
        </span>

        {!isSubmitted ? (
          <button
            onClick={submitAnswer}
            disabled={!canSubmit}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
          >
            {isLastQuestion ? 'See Results →' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
}
