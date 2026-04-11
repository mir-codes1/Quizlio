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

  if (loading) return <div className="text-center py-20 text-blueslate-500">Loading quiz…</div>;
  if (error) return <div className="text-center py-20 text-danger-500">Error: {error}</div>;
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
        newSelected = prevSelected.includes(key)
          ? prevSelected.filter((k) => k !== key)
          : [...prevSelected, key];
      } else {
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
          ? 'border-grape-400 bg-grape-100 text-shadow ring-1 ring-grape-300'
          : 'border-dust-400 bg-white text-blueslate-700 hover:border-blueslate-600 hover:text-shadow cursor-pointer')
      );
    }

    const isCorrect = q.correctOptions.includes(key);
    const isSelected = currentAnswer?.selected.includes(key) ?? false;

    if (isCorrect && isSelected) {
      return base + 'border-success-400 bg-success-100 text-success-700';
    }
    if (isCorrect && !isSelected) {
      // Missed correct option
      return base + 'border-success-300 bg-success-100/60 text-success-600/70';
    }
    if (!isCorrect && isSelected) {
      return base + 'border-danger-400 bg-danger-100 text-danger-600';
    }
    return base + 'border-dust-300 bg-dust-50 text-blueslate-400';
  }

  function keyBadgeStyle(key: OptionKey): string {
    const base = 'shrink-0 mt-0.5 w-6 h-6 rounded-md text-xs font-bold font-mono flex items-center justify-center ';
    if (!isSubmitted) {
      return base + (currentAnswer?.selected.includes(key)
        ? 'bg-grape-500 text-white'
        : 'bg-dust-200 text-blueslate-500');
    }
    const isCorrect = q.correctOptions.includes(key);
    const isSelected = currentAnswer?.selected.includes(key) ?? false;
    if (isCorrect) return base + 'bg-success-500 text-white';
    if (isSelected) return base + 'bg-danger-500 text-white';
    return base + 'bg-dust-200 text-blueslate-400';
  }

  function optionIcon(key: OptionKey): string | null {
    if (!isSubmitted) return null;
    if (q.correctOptions.includes(key)) return '✓';
    if (currentAnswer?.selected.includes(key)) return '✗';
    return null;
  }

  function explanationColor(key: OptionKey): string {
    if (q.correctOptions.includes(key)) return 'text-success-600';
    if (currentAnswer?.selected.includes(key)) return 'text-danger-500';
    return 'text-blueslate-400';
  }

  const answeredCount = Object.values(answers).filter((a) => a.submitted).length;
  const canSubmit = (currentAnswer?.selected.length ?? 0) > 0 && !isSubmitted;

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* Progress header */}
      <div className="flex items-center justify-between text-xs text-blueslate-500 mb-2">
        <span className="font-medium text-blueslate-600">
          Question <span className="text-grape-500 font-semibold">{currentIndex + 1}</span> of {questions.length}
        </span>
        <span className="truncate max-w-[40%] text-right">{quiz.title}</span>
      </div>
      <div className="w-full bg-dust-300 rounded-full h-1.5 mb-1">
        <div
          className="bg-grape-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(answeredCount / questions.length) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-blueslate-400 mb-7">
        <span>{answeredCount} answered</span>
        <span>{questions.length - answeredCount} remaining</span>
      </div>

      {/* Question card */}
      <div
        className="relative rounded-2xl border border-dust-400/60 p-6 mb-4 overflow-hidden"
        style={{
          background: 'linear-gradient(148deg, #fdfcfc 0%, #f0edec 55%, #e8e3e1 100%)',
          boxShadow: '0 4px 12px rgba(29,30,44,0.08), 0 1px 3px rgba(29,30,44,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        {/* Top-edge specular line */}
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />
        {/* Header row: question number + type badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono font-bold bg-dust-200 text-blueslate-600 px-2 py-0.5 rounded">
            Q{currentIndex + 1}
          </span>
          {isMulti ? (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-grape-100 text-grape-600 border border-grape-200">
              Choose all that apply
            </span>
          ) : (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-dust-100 text-blueslate-500 border border-dust-300">
              Single answer
            </span>
          )}
        </div>

        {/* Prompt */}
        <p className="text-shadow text-base leading-relaxed">
          {q.prompt}
        </p>

        {/* Code snippet */}
        {q.codeSnippet && (
          <div className="mt-5 pt-4 border-t border-dust-300">
            <p className="text-[10px] font-mono uppercase tracking-widest text-blueslate-400 mb-2.5">
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
              ? 'border-success-300 bg-success-100'
              : 'border-danger-200 bg-danger-100'
          }`}
        >
          {/* Verdict header */}
          <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${
            currentAnswer?.correct ? 'border-success-200' : 'border-danger-200'
          }`}>
            <span className={`text-sm font-bold tracking-wide ${
              currentAnswer?.correct ? 'text-success-600' : 'text-danger-600'
            }`}>
              {currentAnswer?.correct ? '✓ Correct' : '✗ Incorrect'}
            </span>
            {!currentAnswer?.correct && (
              <span className="text-xs text-blueslate-500">
                Correct{isMulti ? ' (all required)' : ''}:{' '}
                <span className="font-mono font-semibold text-success-600">
                  {q.correctOptions.join(', ')}
                </span>
              </span>
            )}
          </div>

          {/* For multi: show what the user selected vs what was correct */}
          {!currentAnswer?.correct && isMulti && (
            <div className="px-4 pt-3 pb-0">
              <p className="text-xs text-blueslate-500">
                Your selection:{' '}
                <span className="font-mono text-blueslate-700">
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
              <p className="text-[10px] font-mono uppercase tracking-widest text-blueslate-400 mb-1.5">
                Explanation
              </p>
              <p className="text-sm text-shadow leading-relaxed">
                {q.correctExplanation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between mt-6">
        <span className="text-xs text-blueslate-400">
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
            className="px-6 py-2.5 rounded-xl bg-grape-500 hover:bg-grape-600 text-white text-sm font-semibold disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-grape-500 hover:bg-grape-600 text-white text-sm font-semibold transition-colors"
          >
            {isLastQuestion ? 'See Results →' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
}
