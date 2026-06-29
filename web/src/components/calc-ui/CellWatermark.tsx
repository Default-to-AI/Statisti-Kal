import { InlineMath } from 'react-katex';

interface CellWatermarkProps {
  math: string;
  colorClass: string;
}

export function CellWatermark({ math, colorClass }: CellWatermarkProps) {
  return (
    <div
      className={`absolute left-2 top-1/2 -translate-y-1/2 -rotate-12 opacity-10 pointer-events-none select-none text-4xl sm:text-5xl font-mono ${colorClass}`}
      dir="ltr"
      aria-hidden="true"
    >
      <InlineMath math={math} />
    </div>
  );
}

