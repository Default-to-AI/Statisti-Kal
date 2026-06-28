/**
 * FormulaBlock.tsx
 * Primitive formula container per DESIGN.md Component Usage Map
 * Variants:
 *  - `formula` — raw/general formula with symbolic variables
 *  - `calculation` — substituted values / concrete result
 *
 * Design intent:
 *  - Provide consistent math-presentation semantics for FormulaSheet and
 *    Hypothesis Testing steps.
 *  - Keep KaTeX usage at the consumer level (`InlineMath` / `BlockMath`);
 *    this primitive provides layout, labels, and copy affordances only.
 */

import React, { forwardRef, HTMLAttributes } from 'react';
import { Award } from 'lucide-react';

export type FormulaBlockVariant = 'formula' | 'calculation';

export interface FormulaBlockProps extends HTMLAttributes<HTMLDivElement> {
  /** Semantic variant. */
  variant?: FormulaBlockVariant;
  /** Optional human-readable label shown above the math. */
  label?: React.ReactNode;
  /** Optional caption below the math (e.g. "Step 3 of 6"). */
  caption?: React.ReactNode;
  /** When true, surface a copy affordance on hover. Consumers must provide
   *  content; this primitive only exposes intent. */
  copyable?: boolean;
  /** When provided, replaces the optional KaTeX wrapper. This primitive does
   *  not import `react-katex` directly. */
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<FormulaBlockVariant, string> = {
  formula:
    'border-[var(--color-border)] bg-[var(--color-surface-raised)]/40 rounded-[var(--rounded-lg)]',
  calculation:
    'border-[var(--color-accent-cobalt-line)] bg-[var(--color-accent-cobalt-bg)]/25 rounded-[var(--rounded-md)]',
};

export const FormulaBlock = forwardRef<HTMLDivElement, FormulaBlockProps>(
  function FormulaBlock(
    {
      variant = 'formula',
      label,
      caption,
      copyable = false,
      className = '',
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={`
          w-full border p-4 sm:p-5 transition-colors
          ${VARIANT_CLASSES[variant]}
          ${copyable ? 'group relative' : ''}
          ${className}
        `}
        {...rest}
      >
        {(label || copyable) && (
          <div className="flex items-center justify-between gap-3 mb-2">
            {label ? (
              <span className="text-xs sm:text-xs font-black uppercase tracking-wider text-[var(--color-text-secondary)]">
                {label}
              </span>
            ) : (
              <span aria-hidden="true" />
            )}
            {copyable ? (
              <span className="text-xs sm:text-xs font-black uppercase tracking-wider text-[var(--color-text-secondary)] opacity-0 transition-opacity group-hover:opacity-100">
                Copy
              </span>
            ) : null}
          </div>
        )}
        <div className="text-center">{children}</div>
        {caption ? (
          <div className="mt-2 text-xs sm:text-xs font-bold text-[var(--color-text-secondary)]">{caption}</div>
        ) : null}
      </div>
    );
  },
);

FormulaBlock.displayName = 'FormulaBlock';

/**
 * CalcBlock — shorthand for block math calculations.
 * Example:
 *   <CalcBlock label="Substituted values">
 *     <InlineMath math="Z = \\frac{115-100}{15}" />
 *   </CalcBlock>
 */
export interface CalcBlockProps extends Omit<FormulaBlockProps, 'variant' | 'label'> {
  label?: React.ReactNode;
}

export const CalcBlock: React.FC<CalcBlockProps> = ({ label = 'Calculation', children, ...rest }) => (
  <FormulaBlock variant="calculation" label={label} {...rest}>
    {children}
  </FormulaBlock>
);

/**
 * ResultBlock — presentation for final results
 */
export interface ResultBlockProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ResultBlock: React.FC<ResultBlockProps> = ({ children, className = '', ...rest }) => (
  <div className={`overflow-hidden rounded-[var(--rounded-lg)] border shadow-sm border-[var(--color-accent-brass)]/45 bg-[var(--color-accent-brass)]/10 my-4 ${className}`} {...rest}>
    <div className="flex items-stretch h-full">
      <div className="w-1 shrink-0 bg-[var(--color-accent-brass)]" aria-hidden="true" />
      <div className="flex w-full items-center gap-4 p-4 sm:p-5">
        <div className="hidden shrink-0 sm:flex text-[var(--color-accent-brass)]/65">
          <Award size={30} strokeWidth={1.4} />
        </div>
        <div className="min-w-0 flex-1 space-y-3 text-[var(--color-accent-brass)] font-bold text-sm md:text-base leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  </div>
);

