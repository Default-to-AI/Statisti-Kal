import React from 'react';
import { PenTool } from 'lucide-react';

export interface HandwrittenNoteProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

const ALIGN_CLASSES: Record<NonNullable<HandwrittenNoteProps['align']>, string> = {
  start: 'text-start justify-start',
  center: 'text-center justify-center',
  end: 'text-end justify-end',
};

const INNER_ALIGN_CLASSES: Record<NonNullable<HandwrittenNoteProps['align']>, string> = {
  start: 'justify-start text-start',
  center: 'justify-center text-center',
  end: 'justify-end text-end',
};

export const HandwrittenNote: React.FC<HandwrittenNoteProps> = ({
  children,
  className = '',
  align = 'center',
}) => (
  <p
    className={`flex w-full text-xl leading-relaxed font-normal text-[var(--color-text-primary)] sm:text-2xl font-handwriting ${ALIGN_CLASSES[align]} ${className}`}
  >
    <span className={`inline-flex max-w-full items-start gap-x-2 ${INNER_ALIGN_CLASSES[align]}`}>
      <PenTool size={22} className="shrink-0 mt-1 opacity-60 text-[var(--color-accent-cobalt)]" />
      <span className="min-w-0">{children}</span>
    </span>
  </p>
);
