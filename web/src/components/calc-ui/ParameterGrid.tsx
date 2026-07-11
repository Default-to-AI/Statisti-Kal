import type React from 'react';

interface ParameterGridProps {
  children: React.ReactNode;
  className?: string;
  /** Number of columns on medium screens and up. Default 2. */
  columns?: 1 | 2 | 3 | 4;
}

const colsClass: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

/**
 * A responsive CSS-grid replacement for raw <table> parameter input layouts.
 * Children should be ParameterInputCell (and optionally ParameterGridHeader) components.
 */
export function ParameterGrid({ children, className = '', columns = 2 }: ParameterGridProps) {
  return (
    <div
      className={`grid grid-cols-1 ${colsClass[columns]} gap-0 divide-x divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-visible ${className}`}
      dir="rtl"
    >
      {children}
    </div>
  );
}

interface ParameterGridHeaderProps {
  children: React.ReactNode;
  className?: string;
  watermark?: React.ReactNode;
  watermarkColorClass?: string;
}

/**
 * Header cell for ParameterGrid. Mirrors the visual style of the old <th> headers.
 */
export function ParameterGridHeader({ children, className = '', watermark, watermarkColorClass = 'text-[var(--color-accent-cobalt)]' }: ParameterGridHeaderProps) {
  return (
    <div
      className={`relative overflow-hidden bg-[var(--color-surface)] p-3.5 text-center text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] ${className}`}
    >
      {watermark ? (
        <div className={`absolute right-2 top-1/2 -translate-y-1/2 -rotate-12 opacity-10 pointer-events-none select-none text-4xl sm:text-5xl font-mono ${watermarkColorClass}`}>
          {watermark}
        </div>
      ) : null}
      <div className="relative z-10 flex items-center justify-center gap-1.5">{children}</div>
    </div>
  );
}

interface ParameterGridCellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Generic content cell for ParameterGrid. Use for non-input content (e.g. action buttons).
 */
export function ParameterGridCell({ children, className = '' }: ParameterGridCellProps) {
  return (
    <div className={`relative overflow-hidden p-3 sm:p-4 bg-[var(--color-surface-raised)] ${className}`}>
      {children}
    </div>
  );
}
