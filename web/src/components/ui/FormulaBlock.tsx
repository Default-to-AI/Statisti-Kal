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
    'border-[var(--color-border)] bg-[var(--color-surface)] rounded-[var(--rounded-lg)]',
  calculation:
    'border-[var(--color-accent-cobalt-line)] bg-[var(--color-surface-raised)] rounded-[var(--rounded-md)]',
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
              <span className="text-xs sm:text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                {label}
              </span>
            ) : (
              <span aria-hidden="true" />
            )}
            {copyable ? (
              <span className="text-xs sm:text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] opacity-0 transition-opacity group-hover:opacity-100">
                Copy
              </span>
            ) : null}
          </div>
        )}
        <div className="text-center text-[var(--color-text-primary)]">{children}</div>
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
  <div className={`flex flex-row items-center w-[95%] md:w-[85%] mx-auto gap-4 sm:gap-6 py-3 my-2 ${className}`} dir="ltr" {...rest}>
      <div className="flex-1 overflow-x-auto scrollbar-thin rounded-[var(--rounded-lg)] shadow-sm">
          <div className="relative border border-[var(--color-border)] border-l-4 border-solid border-l-[var(--color-primary)] rounded-[var(--rounded-lg)] bg-[var(--color-primary)]/10 px-6 py-4 text-center flex flex-col items-center justify-center min-h-[84px] h-auto w-full min-w-max [&_.katex-display]:!overflow-visible [&_.katex-display]:w-full [&_.katex-display]:!m-0 [&_.katex-display]:flex [&_.katex-display]:justify-center font-sans text-[var(--color-primary)]">
              <div dir="rtl" className="w-full flex flex-col items-center justify-center space-y-3 font-bold text-base md:text-lg leading-relaxed">
                {children}
              </div>
          </div>
      </div>
      <div className="shrink-0 w-10 sm:w-12 flex justify-center text-[var(--color-primary)]/60">
          <Award size={36} strokeWidth={1.2} />
      </div>
  </div>
);

