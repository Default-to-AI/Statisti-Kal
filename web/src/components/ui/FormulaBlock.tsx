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
import { Calculator, Award, AlertTriangle } from 'lucide-react';

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
 * AlertBlock — presentation for important notes and warnings
 */
export interface AlertBlockProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const AlertBlock: React.FC<AlertBlockProps> = ({ children, className = '', ...rest }) => (
  <div className={`flex flex-row items-center w-full max-w-[65rem] mx-auto gap-4 sm:gap-6 py-1 my-0 ${className}`} dir="ltr" {...rest}>
      <div className="flex-1 overflow-x-auto scrollbar-thin rounded-[var(--rounded-lg)] shadow-sm">
          <div className="relative border border-[var(--color-warning)]/40 border-l-4 border-solid border-l-[var(--color-warning)] rounded-[var(--rounded-md)] bg-[var(--color-warning)]/5 px-4 py-3 flex flex-col items-center justify-center">
              <div dir="rtl" className="w-full text-center text-[var(--color-text-primary)] text-sm leading-relaxed">
                {children}
              </div>
          </div>
      </div>
      <div className="shrink-0 w-10 sm:w-12 flex justify-center text-[var(--color-warning)]/60">
          <AlertTriangle size={36} strokeWidth={1.2} />
      </div>
  </div>
);

