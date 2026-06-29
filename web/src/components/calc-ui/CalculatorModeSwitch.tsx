import type { CalculatorMode } from './types';
import { InlineMathToken } from './InlineMathToken';

interface CalculatorModeSwitchProps {
  value: CalculatorMode;
  onChange: (value: CalculatorMode) => void;
}

export function CalculatorModeSwitch({ value, onChange }: CalculatorModeSwitchProps) {
  const isInverse = value === 'inverse';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isInverse}
      aria-label={`מצב מחשבון: ${isInverse ? 'אחוזונים' : 'הסתברות'}`}
      title={isInverse ? 'עכשיו: אחוזונים. לחיצה תעביר להסתברות.' : 'עכשיו: הסתברות. לחיצה תעביר לאחוזונים.'}
      onClick={() => onChange(isInverse ? 'forward' : 'inverse')}
      className="grid w-full cursor-pointer grid-cols-2 gap-2 rounded-lg border border-[rgba(36,209,199,0.38)] bg-[var(--color-surface-raised)] p-1 transition-all hover:border-[rgba(36,209,199,0.62)]"
    >
      <span
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-black transition-all ${!isInverse
          ? 'bg-[linear-gradient(135deg,#24D1C7,#1C9EDE)] text-[#08131A] shadow-[0_0_0_1px_rgba(36,209,199,0.72)]'
          : 'bg-transparent text-[var(--color-text-secondary)]'
          }`}
      >
        <InlineMathToken math="P" className="text-base" />
        <span>הסתברות</span>
      </span>
      <span
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-black transition-all ${isInverse
          ? 'bg-[linear-gradient(135deg,#F6D04D,#E9A91A)] text-[#18140A] shadow-[0_0_0_1px_rgba(246,208,77,0.72)]'
          : 'bg-transparent text-[var(--color-text-secondary)]'
          }`}
      >
        <span dir="ltr" className="text-sm font-black">%</span>
        <span>אחוזונים</span>
      </span>
    </button>
  );
}

