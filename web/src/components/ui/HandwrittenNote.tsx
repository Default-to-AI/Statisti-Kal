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

export const HandwrittenNote: React.FC<HandwrittenNoteProps> = ({
  children,
  className = '',
  align = 'center',
}) => (
  <p
    className={`flex w-full text-xl leading-relaxed font-normal text-[var(--color-text-primary)] sm:text-2xl font-handwriting ${ALIGN_CLASSES[align]} ${className}`}
  >
    <span className="flex max-w-full flex-wrap items-baseline gap-x-2 gap-y-1">
      <PenTool size={22} className="mt-0.5 shrink-0 opacity-60 text-[var(--color-accent-cobalt)]" />
      <span>{children}</span>
    </span>
  </p>
);
