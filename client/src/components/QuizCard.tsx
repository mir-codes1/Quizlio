import { useRef } from 'react';
import type { Quiz, CompletionRecord } from '../types/quiz';
import { ButtonColorful } from './ui/button-colorful';

interface QuizCardProps {
  quiz: Quiz;
  completion: CompletionRecord | null;
  isDeleting?: boolean;
  onStart: () => void;
  onRename: () => void;
  onDelete: () => void;
}

const TILT = 7; // max rotation degrees

export default function QuizCard({
  quiz,
  completion,
  isDeleting = false,
  onStart,
  onRename,
  onDelete,
}: QuizCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    const gl = glowRef.current;
    if (!el || !gl) return;

    const { left, top, width, height } = el.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const rx = ((y - height / 2) / (height / 2)) * -TILT;
    const ry = ((x - width / 2) / (width / 2)) * TILT;

    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
    // Shadow shifts opposite to tilt — makes it feel physically grounded
    el.style.boxShadow = `
      ${-ry * 1.5}px ${rx * 1.5}px 32px rgba(29,30,44,0.13),
      0 4px 10px rgba(29,30,44,0.07),
      inset 0 1px 0 rgba(255,255,255,0.95)
    `;

    gl.style.opacity = '1';
    gl.style.background = `radial-gradient(220px circle at ${x}px ${y}px, rgba(156,82,139,0.11), transparent 70%)`;
  }

  function handleMouseLeave() {
    const el = cardRef.current;
    const gl = glowRef.current;
    if (!el || !gl) return;

    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    el.style.boxShadow = `
      0 4px 12px rgba(29,30,44,0.08),
      0 1px 3px rgba(29,30,44,0.05),
      inset 0 1px 0 rgba(255,255,255,0.9)
    `;
    gl.style.opacity = '0';
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        willChange: 'transform',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        background: 'linear-gradient(148deg, #fdfcfc 0%, #f0edec 55%, #e8e3e1 100%)',
        boxShadow: `
          0 4px 12px rgba(29,30,44,0.08),
          0 1px 3px rgba(29,30,44,0.05),
          inset 0 1px 0 rgba(255,255,255,0.9)
        `,
      }}
      className="relative rounded-xl border border-dust-400/60 p-5 flex flex-col gap-3 overflow-hidden"
    >
      {/* Mouse-follow grape glow */}
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{ opacity: 0, transition: 'opacity 0.25s ease' }}
      />

      {/* Top-edge specular line */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-semibold text-blueslate-600 text-base leading-snug truncate">
            {quiz.title}
          </h2>
          {quiz.description && (
            <p className="mt-0.5 text-sm text-blueslate-600 line-clamp-2">
              {quiz.description}
            </p>
          )}
        </div>
        {completion?.completed && (
          <span className="shrink-0 text-xs font-medium bg-grape-100 text-grape-500 px-2 py-0.5 rounded-full border border-grape-200">
            Completed
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-blueslate-500">
        <span>{quiz.questionCount} question{quiz.questionCount !== 1 ? 's' : ''}</span>
        {completion && (
          <span className="text-grape-500 font-medium">
            {completion.score}/{completion.total} correct
          </span>
        )}
        {quiz.tags.map((tag) => (
          <span
            key={tag}
            className="bg-dust-200 text-blueslate-600 px-2 py-0.5 rounded-full border border-dust-300"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-0.5">
        <ButtonColorful
          onClick={onStart}
          label={completion?.completed ? 'Retake' : 'Start'}
          className="flex-1 rounded-lg"
        />
        <button
          onClick={onRename}
          className="rounded-lg border border-dust-400 hover:border-blueslate-600 text-blueslate-600 hover:text-shadow text-sm px-3 py-1.5 transition-colors"
        >
          Rename
        </button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="rounded-lg border border-dust-400 hover:border-danger-400/60 text-blueslate-500 hover:text-danger-500 text-sm px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isDeleting ? '…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
