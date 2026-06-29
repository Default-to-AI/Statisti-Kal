import { InlineMath } from 'react-katex';

interface InlineMathTokenProps {
  math: string;
  className?: string;
}

export function InlineMathToken({ math, className = '' }: InlineMathTokenProps) {
  return (
    <span
      dir="ltr"
      className={`inline-flex items-center whitespace-nowrap align-middle [unicode-bidi:isolate] ${className}`.trim()}
    >
      <InlineMath math={math} />
    </span>
  );
}

