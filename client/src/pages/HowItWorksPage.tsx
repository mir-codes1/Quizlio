import { Link } from 'react-router-dom';
import { ClipboardCopy, ClipboardCheck, Zap, Lightbulb } from 'lucide-react';

const linkClass = 'underline underline-offset-2 text-grape-500 hover:text-grape-600 transition-colors';

const STEPS = [
  {
    num: '01',
    Icon: ClipboardCopy,
    title: 'Copy the prompt',
    description: (
      <>
        On the <Link to="/import" className={linkClass}>Import page</Link>, hit "Copy Prompt" and drop it into any AI — ChatGPT, Claude, Gemini, whatever you use. Paste in your notes or slides, then send it.
      </>
    ),
  },
  {
    num: '02',
    Icon: ClipboardCheck,
    title: 'Paste and validate',
    description: (
      <>
        Copy the JSON the AI spits out, paste it into the <Link to="/import" className={linkClass}>Import page</Link>, and hit Validate. Quizlio checks the structure and shows you every question before you commit.
      </>
    ),
  },
  {
    num: '03',
    Icon: Zap,
    title: 'Start drilling',
    description: (
      <>
        Pick your quiz from the <Link to="/" className={linkClass}>Library</Link> and go. Submit answers question by question and get instant feedback with per-option explanations.
      </>
    ),
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-14">
        <h1
          className="font-display text-3xl font-bold text-blueslate-700"
          style={{ textShadow: '0 0 24px rgba(156,82,139,0.2), 0 0 8px rgba(71,81,90,0.15)' }}
        >
          How it works
        </h1>
        <p className="mt-2 text-sm text-blueslate-500 max-w-md">
          From study material to practice quiz in three steps.
        </p>
      </div>

      {/* Steps grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-0 items-start">
        {STEPS.map((step, i) => (
          <>
            {/* Card */}
            <div
              key={step.num}
              className="relative border border-dust-400/60 rounded-2xl p-6 overflow-hidden flex flex-col gap-4"
              style={{
                background: 'linear-gradient(148deg, #fdfcfc 0%, #f0edec 55%, #e8e3e1 100%)',
                boxShadow: '0 4px 12px rgba(29,30,44,0.08), 0 1px 3px rgba(29,30,44,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              {/* Specular line */}
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />

              {/* Decorative background number */}
              <span
                className="absolute bottom-2 right-3 font-display font-bold text-[88px] leading-none text-blueslate-600/[0.06] select-none pointer-events-none"
              >
                {step.num}
              </span>

              {/* Step label */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-grape-500/10 border border-grape-300/40 flex items-center justify-center shrink-0">
                  <step.Icon className="w-4 h-4 text-grape-500" strokeWidth={1.75} />
                </div>
                <span className="text-[11px] font-mono font-semibold tracking-widest text-blueslate-400 uppercase">
                  Step {step.num}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-display text-lg font-semibold text-blueslate-700 leading-snug -mt-1">
                {step.title}
              </h2>

              {/* Description */}
              <p className="text-sm text-blueslate-600 leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Arrow connector — only between cards, hidden on mobile */}
            {i < STEPS.length - 1 && (
              <div key={`arrow-${i}`} className="hidden md:flex items-center justify-center px-3 pt-10">
                <svg width="24" height="16" viewBox="0 0 24 16" fill="none" className="text-dust-500">
                  <path d="M0 8h20M16 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-10 flex items-start gap-3 px-4 py-3.5 rounded-xl border border-dust-300/60 bg-dust-100/60">
        <Lightbulb className="w-4 h-4 text-blueslate-400 shrink-0 mt-0.5" strokeWidth={1.75} />
        <p className="text-sm text-blueslate-600 leading-relaxed">
          <span className="font-semibold text-blueslate-700">Works with any AI.</span>{' '}
          The prompt is engineered to output strict, parseable JSON — Claude, ChatGPT, and Gemini all handle it well. If validation fails, just ask the AI to fix the errors and paste again.
        </p>
      </div>

    </div>
  );
}
