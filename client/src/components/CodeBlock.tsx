import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string | null | undefined;
}

function detectLanguage(code: string): string {
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/im.test(code)) return 'sql';
  if (/^#!(\/usr)?\/bin\/(bash|sh|zsh)/m.test(code) || /\$\s*\w+|echo\s+|fi\b|then\b|elif\b/.test(code)) return 'bash';
  if (/\bdef\s+\w+\s*\(|^\s*import\s+\w+|^\s*from\s+\w+\s+import|print\s*\(/m.test(code)) return 'python';
  if (/\bpublic\s+class\b|\bSystem\.out\b|\bpublic\s+static\s+void\s+main\b/.test(code)) return 'java';
  if (/#include\s*<(iostream|string|vector|map|algorithm)>|\bstd::|\bcout\b|\bcin\b/.test(code)) return 'cpp';
  if (/#include\s*<(stdio|stdlib|string|math)\.h>|\bprintf\s*\(|\bscanf\s*\(|\bint\s+main\s*\(/.test(code)) return 'c';
  if (/\b(interface|type\s+\w+\s*=|:\s*(string|number|boolean|void|any)\b)/.test(code)) return 'typescript';
  if (/\b(const|let|var)\s+\w+\s*=|\bfunction\s+\w+\s*\(|=>\s*\{|console\.log\s*\(/.test(code)) return 'javascript';
  return 'text';
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const lang = language ?? detectLanguage(code);

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
