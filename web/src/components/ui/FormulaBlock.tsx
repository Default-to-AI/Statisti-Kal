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
import { Calculator, Award, AlertTriangle, BookOpen, Lightbulb } from 'lucide-react';
import { FormulaTranslation } from './CustomComponents';

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
    'border-[var(--color-border)] bg-[var(--color-primary)]/5 rounded-[var(--rounded-lg)] text-lg',
  calculation:
    'border-[var(--color-accent-cobalt-line)] bg-[var(--color-accent-cobalt-bg)] rounded-[var(--rounded-md)] text-lg',
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
 *     <InlineMath math={String.raw`Z = \frac{115-100}{15}`} />
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

export interface ReadingFormulaBlockProps extends Omit<FormulaBlockProps, 'variant' | 'label' | 'caption' | 'copyable'> {
  formulaName?: string;
  translation?: string;
  wrapperClassName?: string;
  contentWidthClassName?: string;
}

const DEFAULT_READING_CONTENT_WIDTH_CLASS = 'w-full max-w-[65rem] mx-auto';

export const ReadingFormulaBlock: React.FC<ReadingFormulaBlockProps> = ({
  children,
  className = '',
  formulaName,
  translation,
  wrapperClassName = '',
  contentWidthClassName = DEFAULT_READING_CONTENT_WIDTH_CLASS,
  ...rest
}) => (
  <div className={`flex flex-row items-center ${contentWidthClassName} gap-4 py-3 sm:gap-6 ${wrapperClassName}`} dir="ltr">
    <div className="relative flex-1 overflow-x-auto rounded-lg shadow-sm">
      <FormulaBlock
        className={`relative min-h-[84px] min-w-max border-l-4 border-dashed border-l-[var(--color-primary)]/70 bg-[var(--color-primary)]/5 px-6 py-4 text-lg font-sans text-[var(--color-text-primary)] [&_.katex-display]:!m-0 [&_.katex-display]:flex [&_.katex-display]:justify-center [&_.katex-display]:!overflow-visible [&_.katex-display]:w-full sm:text-xl md:text-2xl ${className}`}
        {...rest}
      >
        {formulaName && translation ? (
          <div className="absolute left-2.5 top-2.5 z-10 opacity-70 transition-opacity hover:opacity-100">
            <FormulaTranslation formulaName={formulaName} translation={translation} />
          </div>
        ) : null}
        {children}
      </FormulaBlock>
    </div>
    <div className="flex w-10 shrink-0 justify-center text-[var(--color-primary)]/60 sm:w-12">
      <BookOpen size={36} strokeWidth={1.2} />
    </div>
  </div>
);

export interface ReadingCalcBlockProps extends Omit<CalcBlockProps, 'label'> {
  wrapperClassName?: string;
  contentWidthClassName?: string;
}

export const ReadingCalcBlock: React.FC<ReadingCalcBlockProps> = ({
  children,
  className = '',
  wrapperClassName = '',
  contentWidthClassName = DEFAULT_READING_CONTENT_WIDTH_CLASS,
  ...rest
}) => (
  <div className={`flex flex-row items-center ${contentWidthClassName} gap-4 py-3 sm:gap-6 ${wrapperClassName}`} dir="ltr">
    <div className="flex-1 overflow-x-auto rounded-lg shadow-sm">
      <CalcBlock
        label={null}
        className={`min-h-[84px] min-w-max border-l-4 border-l-[var(--color-accent-cobalt)] bg-[var(--color-accent-cobalt)]/5 px-6 py-4 text-lg font-sans text-[var(--color-text-primary)] [&_.katex-display]:!m-0 [&_.katex-display]:flex [&_.katex-display]:justify-center [&_.katex-display]:!overflow-visible [&_.katex-display]:w-full sm:text-xl md:text-2xl ${className}`}
        {...rest}
      >
        {children}
      </CalcBlock>
    </div>
    <div className="flex w-10 shrink-0 justify-center text-[var(--color-accent-cobalt)]/60 sm:w-12">
      <Calculator size={36} strokeWidth={1.2} />
    </div>
  </div>
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

/**
 * InsightBlock — presentation for side explanations and tips
 */
export interface InsightBlockProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const InsightBlock: React.FC<InsightBlockProps> = ({ children, className = '', ...rest }) => (
  <div className={`flex flex-row items-center w-full max-w-[65rem] mx-auto gap-4 sm:gap-6 py-1 my-0 ${className}`} dir="ltr" {...rest}>
      <div className="flex-1 overflow-x-auto scrollbar-thin rounded-[var(--rounded-lg)] shadow-sm">
          <div className="relative border border-[var(--color-warning)]/40 border-l-4 border-solid border-l-[var(--color-warning)] rounded-[var(--rounded-md)] bg-[var(--color-warning)]/5 px-4 py-4 flex flex-col items-center justify-center">
              <div dir="rtl" className="w-full text-right text-[var(--color-text-primary)] text-sm md:text-base leading-relaxed space-y-2">
                {children}
              </div>
          </div>
      </div>
      <div className="shrink-0 w-10 sm:w-12 flex justify-center text-[var(--color-warning)]/80">
          <Lightbulb size={36} strokeWidth={1.2} />
      </div>
  </div>
);

