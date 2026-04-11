import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string | null | undefined;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const lang = language ?? 'text';

  return (
    <div className="rounded-lg overflow-hidden border border-slate-600/70 shadow-md">
      {/* Editor-style title bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#21252b] border-b border-slate-700/60">
        {/* Decorative dots — visual cue this is a code editor window */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600/70" />
        </div>
        {language && (
          <span className="text-[11px] font-mono tracking-wide text-slate-400 uppercase">
            {language}
          </span>
        )}
      </div>

      {/* Syntax-highlighted body */}
      <SyntaxHighlighter
        language={lang}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: '0.8125rem',  // 13px — tight enough to show context, legible
          lineHeight: '1.7',
          padding: '1rem 1.25rem',
          maxHeight: '300px',
          overflowY: 'auto',
          overflowX: 'auto',
        }}
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
