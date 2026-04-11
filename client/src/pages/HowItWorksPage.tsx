import { Link } from 'react-router-dom';

const linkClass = 'underline underline-offset-2 text-slate-300 hover:text-white transition-colors';

const STEPS = [
  {
    number: 1,
    title: 'Copy the prompt',
    description: (
      <>
        On the <Link to="/import" className={linkClass}>Import page</Link>, click "Copy Prompt" and paste it into any AI. Add your topic and study material, then send it.
      </>
    ),
  },
  {
    number: 2,
    title: 'Paste and save',
    description: (
      <>
        Copy the AI's output, paste it into the <Link to="/import" className={linkClass}>Import page</Link>, and click Validate. Review the questions, then save.
      </>
    ),
  },
  {
    number: 3,
    title: 'Take the quiz',
    description: (
      <>
        Find your quiz in the <Link to="/" className={linkClass}>Library</Link> and start it.
      </>
    ),
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-2xl mx-auto">

      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white">How it works</h1>
        <p className="mt-1 text-sm text-slate-400">
          Three steps from study material to a full practice quiz.
        </p>
      </div>

      <ol className="relative space-y-0">
        {STEPS.map((step, i) => {
          const isLast = i === STEPS.length - 1;
          return (
            <li key={step.number} className="flex gap-5">

              {/* Connector column */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 text-white text-sm font-bold shrink-0 z-10">
                  {step.number}
                </div>
                {!isLast && (
                  <div className="w-px flex-1 bg-slate-700 my-2" />
                )}
              </div>

              {/* Content */}
              <div className="pb-10 min-w-0">
                <h2 className="text-base font-semibold text-white leading-snug mt-1.5">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
