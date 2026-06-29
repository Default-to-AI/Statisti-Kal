import type React from 'react';
import type { CalcType } from './types';
import { InlineMathToken } from './InlineMathToken';

interface VariantOption {
  value: CalcType;
  label: React.ReactNode;
  description: React.ReactNode;
}

export const FORWARD_VARIANT_OPTIONS: readonly VariantOption[] = [
  { value: 'below', label: 'שטח מצד שמאל', description: <InlineMathToken math="P(X \le x)" /> },
  { value: 'above', label: 'שטח מצד ימין', description: <InlineMathToken math="P(X \ge x)" /> },
  { value: 'between', label: 'בין שני ערכים', description: <InlineMathToken math="P(x_1 \le X \le x_2)" /> },
  { value: 'outside', label: 'מחוץ לתחום', description: <InlineMathToken math="P(X \le x_1 \;\cup\; X \ge x_2)" /> },
  { value: 'conditional', label: 'הסתברות מותנית', description: <InlineMathToken math="P(A \mid B)=\frac{P(A \cap B)}{P(B)}" /> },
];

export const INVERSE_VARIANT_OPTIONS: readonly VariantOption[] = [
  { value: 'below', label: 'אחוזון שמאלי', description: <InlineMathToken math="P(X \le x)=p" /> },
  { value: 'above', label: 'אחוזון ימני', description: <InlineMathToken math="P(X \ge x)=p" /> },
  { value: 'between', label: 'טווח מרכזי', description: <InlineMathToken math="P(x_1 \le X \le x_2)=p" /> },
  { value: 'outside', label: 'טווח זנבות', description: <InlineMathToken math="P(X \le x_1 \;\cup\; X \ge x_2)=p" /> },
];

interface CalculationVariantPickerProps {
  value: CalcType;
  onChange: (value: CalcType) => void;
  options: readonly VariantOption[];
}

export function CalculationVariantPicker({
  value,
  onChange,
  options,
}: CalculationVariantPickerProps) {
  return (
    <div className="w-full">
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`group rounded-lg border px-4 py-3 text-right transition-all ${isActive
                ? 'border-[var(--color-accent-cobalt)]/70 bg-[linear-gradient(135deg,rgba(92,92,255,0.16),rgba(92,92,255,0.06))] shadow-[0_0_0_1px_var(--color-accent-cobalt)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent-cobalt)]/35 hover:bg-[var(--color-accent-cobalt)]/5'
                }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={`block text-body-base font-black ${isActive ? 'text-[var(--color-accent-cobalt)]' : 'text-[var(--color-text-primary)]'}`}>
                    {option.label}
                  </span>
                  {option.description ? (
                    <p className="mt-2 text-body-sm leading-relaxed text-[var(--color-text-secondary)]">
                      {option.description}
                    </p>
                  ) : null}
                </div>
                <span className={`mt-1 h-2.5 w-2.5 rounded-full transition-colors ${isActive ? 'bg-[var(--color-accent-cobalt)]' : 'bg-[var(--color-border-strong)] group-hover:bg-[var(--color-accent-cobalt)]/60'}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

