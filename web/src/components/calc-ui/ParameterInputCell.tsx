import type React from 'react';
import { InputTooltip } from '../ui';
import { CellWatermark } from './CellWatermark';

interface ParameterInputCellProps {
  watermark: string;
  colorClass: string;
  label: React.ReactNode;
  tooltip: React.ReactNode;
  value: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  statusText?: string;
}

export function ParameterInputCell({
  watermark,
  colorClass,
  label,
  tooltip,
  value,
  onChange,
  error,
  disabled = false,
  readOnly = false,
  placeholder = '',
  statusText,
}: ParameterInputCellProps) {
  return (
    <td className={`relative overflow-hidden p-3 sm:p-4 align-middle bg-[var(--color-surface)] border-b border-l border-[var(--color-border)] last:border-l-0 ${disabled ? 'opacity-55' : ''}`}>
      <CellWatermark math={watermark} colorClass={colorClass} />
      <div className="relative z-10 flex w-full flex-row items-center justify-between gap-2 sm:gap-3">
        <InputTooltip content={tooltip}>
          <span className={`text-right text-sm sm:text-base font-bold cursor-help border-b border-dotted border-[var(--color-border)] flex-1 min-w-0 ${disabled ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-primary)]'}`}>
            {label}
          </span>
        </InputTooltip>
        <div className="relative w-24 shrink-0 sm:w-28 xl:w-32">
          <input
            type="text"
            value={value}
            onChange={onChange ? (event) => onChange(event.target.value) : undefined}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            className={`w-full bg-[var(--color-background)] border px-2 py-1 font-mono font-bold text-center text-lg sm:text-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 placeholder:font-medium placeholder:text-base outline-none transition-all rounded focus:border-[var(--color-accent-cobalt)] focus:ring-2 focus:ring-[var(--color-accent-cobalt)]/20 ${disabled ? 'cursor-not-allowed opacity-50 border-transparent bg-transparent' : ''} ${readOnly ? 'cursor-default' : ''} ${!disabled && error ? 'border-[var(--color-error)] ring-2 ring-[var(--color-error)]/20 text-[var(--color-error)]' : !disabled ? 'border-[var(--color-border)]' : ''}`}
            dir="ltr"
          />
          {error ? (
            <div className="absolute top-full left-1/2 z-50 mt-2 flex -translate-x-1/2 items-center justify-center whitespace-nowrap rounded bg-[var(--color-error)] px-2.5 py-1 text-xs font-bold text-white shadow-lg pointer-events-none">
              <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[var(--color-error)]" />
              <span className="relative z-10">{error}</span>
            </div>
          ) : null}
          {!error && statusText ? (
            <p className="mt-1 text-center text-caption font-bold text-[var(--color-text-secondary)]">{statusText}</p>
          ) : null}
        </div>
      </div>
    </td>
  );
}

