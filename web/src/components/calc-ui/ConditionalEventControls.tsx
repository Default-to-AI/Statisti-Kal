import type React from 'react';
import type { CondType } from './types';
import { InlineMathToken } from './InlineMathToken';

const CONDITIONAL_EVENT_OPTIONS: ReadonlyArray<{
  value: CondType;
  math: string;
  note: string;
}> = [
    { value: 'below', math: 'X \\le v_1', note: 'עד ערך נתון' },
    { value: 'above', math: 'X \\ge v_1', note: 'מעל ערך נתון' },
    { value: 'between', math: 'v_1 \\le X \\le v_2', note: 'בין שני ערכים' },
  ];

export function getConditionalEventMath(type: CondType, variablePrefix: 'a' | 'b'): string {
  if (type === 'below') return `X \\le ${variablePrefix}_1`;
  if (type === 'above') return `X \\ge ${variablePrefix}_1`;
  return `${variablePrefix}_1 \\le X \\le ${variablePrefix}_2`;
}

interface ConditionalEventPickerProps {
  value: CondType;
  onChange: (value: CondType) => void;
  disabled?: boolean;
  accentClass: string;
  accentColor: string;
  variablePrefix: 'a' | 'b';
}

export function ConditionalEventPicker({
  value,
  onChange,
  disabled = false,
  accentClass,
  accentColor,
  variablePrefix,
}: ConditionalEventPickerProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {CONDITIONAL_EVENT_OPTIONS.map((option) => {
        const isActive = value === option.value;
        const math = option.math.replaceAll('v', variablePrefix);

        return (
          <button
            key={`${variablePrefix}-${option.value}`}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`rounded-lg border px-2.5 py-2.5 text-center transition-all ${isActive
              ? `${accentClass} shadow-[0_0_0_1px_currentColor]`
              : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]'
              } ${disabled ? 'cursor-not-allowed opacity-60 grayscale-[0.15]' : ''}`}
          >
            <span className="block text-base font-black sm:text-lg">
              <InlineMathToken math={math} />
            </span>
            <span
              className="mt-0.5 block text-caption font-bold"
              style={{ color: isActive ? accentColor : 'var(--color-text-secondary)' }}
            >
              {option.note}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface ConditionalValueFieldProps {
  label: React.ReactNode;
  helper: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function ConditionalValueField({
  label,
  helper,
  value,
  onChange,
  error,
  disabled = false,
}: ConditionalValueFieldProps) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/88 p-2.5">
      <label className="mb-1 block text-heading-label font-black text-[var(--color-text-primary)]">
        {label}
      </label>
      <p className="mb-2 text-caption text-[var(--color-text-secondary)]">{helper}</p>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        dir="ltr"
        className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-center text-sm font-mono font-bold text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-accent-cobalt-line)] disabled:cursor-not-allowed disabled:opacity-60"
      />
      {error ? <p className="mt-1 text-caption text-[var(--color-error)]">{error}</p> : null}
    </div>
  );
}

interface ConditionalEventDefinitionCardProps {
  stepNumber: string;
  title: React.ReactNode;
  description: React.ReactNode;
  formula: string;
  value: CondType;
  onChange: (value: CondType) => void;
  disabled?: boolean;
  accentClass: string;
  accentColor: string;
  variablePrefix: 'a' | 'b';
  fields: React.ReactNode;
  expressionToneClass: string;
}

export function ConditionalEventDefinitionCard({
  stepNumber,
  title,
  description,
  formula,
  value,
  onChange,
  disabled = false,
  accentClass,
  accentColor,
  variablePrefix,
  fields,
  expressionToneClass,
}: ConditionalEventDefinitionCardProps) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/72 p-3.5">
      <div className="mb-3 flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div className="text-right">
          <p className="text-caption font-black tracking-[0.12em] text-[var(--color-text-secondary)]">
            {stepNumber}
          </p>
          <h4 className="mt-1 text-body-base font-black text-[var(--color-text-primary)]">{title}</h4>
          <p className="mt-1 text-caption leading-relaxed text-[var(--color-text-secondary)]">{description}</p>
        </div>
        <div className={`rounded-full border px-2.5 py-1 text-sm font-black ${expressionToneClass}`}>
          <InlineMathToken math={formula} />
        </div>
      </div>

      <ConditionalEventPicker
        value={value}
        onChange={onChange}
        disabled={disabled}
        accentClass={accentClass}
        accentColor={accentColor}
        variablePrefix={variablePrefix}
      />

      <div className={`mt-3 rounded-lg border px-3 py-2 text-right ${expressionToneClass}`}>
        <p className="text-caption font-bold text-[var(--color-text-secondary)]">ניסוח פורמלי</p>
        <p className="mt-1 text-body-sm font-black">
          <InlineMathToken math={`${variablePrefix === 'a' ? 'A' : 'B'} = \\left\\{${getConditionalEventMath(value, variablePrefix)}\\right\\}`} />
        </p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {fields}
      </div>
    </div>
  );
}

