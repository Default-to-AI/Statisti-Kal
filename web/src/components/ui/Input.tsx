/**
 * Input.tsx
 * Primitive form components per DESIGN.md Component Usage Map
 * Input (number, text), Select, Label — 6 form variants
 * All tokens consume DESIGN.md via var(--color-*), var(--spacing-*), var(--rounded-*)
 */

import React, { forwardRef, InputHTMLAttributes, SelectHTMLAttributes, LabelHTMLAttributes } from 'react';

/* ============================================================================
 * 1. Label — form label per DESIGN.md: typography.heading-label
 * ========================================================================== */
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** When true, marks field as required (renders * indicator). */
  required?: boolean;
  /** Optional help text rendered as secondary text below label. */
  helpText?: React.ReactNode;
  /** Size variant matching Input/Select sizes. */
  size?: 'sm' | 'md' | 'lg';
  /** Direction for the label text. 'rtl' for Hebrew, 'ltr' for math/numeric. */
  dir?: 'rtl' | 'ltr';
}

const LABEL_SIZE_CLASSES: Record<NonNullable<LabelProps['size']>, string> = {
  sm: 'text-xs sm:text-sm',
  md: 'text-xs sm:text-sm', // heading-label scale but responsive
  lg: 'text-sm sm:text-base',
};

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  function Label(
    {
      required = false,
      helpText,
      size = 'md',
      dir = 'rtl',
      className = '',
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <label
        ref={ref}
        dir={dir}
        className={`
          block font-semibold text-[var(--color-text-primary)]
          ${LABEL_SIZE_CLASSES[size]}
          mb-1
          ${className}
        `}
        {...rest}
      >
        <span className="inline-flex items-center gap-1.5">
          {children}
          {required && (
            <span className="text-[var(--color-error)]" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {helpText && (
        <span className="block mt-0.5 text-xs text-[var(--color-text-secondary)] font-normal">
          {helpText}
        </span>
        )}
      </label>
    );
  },
);

Label.displayName = 'Label';

/* ============================================================================
 * 2. Input — numeric/text input per DESIGN.md: components.input-default
 * ========================================================================== */
export type InputType = 'number' | 'text' | 'email' | 'password';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'value'> {
  /** Controlled string value (allows partial decimals like "1." and empty). */
  value: string;
  /** Called with new string value on every change. */
  onChange: (value: string) => void;
  /** Error message — renders in error styling with message below. */
  error?: string;
  /** Optional help text shown as tooltip on hover (uses InputTooltip pattern). */
  tooltip?: React.ReactNode;
  /** Size variant. 'md' matches calculators' default (lg/xl). */
  size?: 'sm' | 'md' | 'lg';
  /** Text direction. Default 'ltr' for numeric input. */
  dir?: 'ltr' | 'rtl';
  /** When true, input takes full width. */
  fullWidth?: boolean;
  /** Custom class name for the input element. */
  inputClassName?: string;
}

const INPUT_SIZE_CLASSES: Record<NonNullable<InputProps['size']>, string> = {
  sm: 'text-sm sm:text-base',
  md: 'text-lg sm:text-xl',
  lg: 'text-xl sm:text-2xl',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      value,
      onChange,
      error,
      tooltip,
      size = 'md',
      dir = 'ltr',
      fullWidth = true,
      disabled,
      placeholder,
      className = '',
      inputClassName = '',
      id,
      name,
      type = 'text',
      ...rest
    },
    ref,
  ) {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div className={`w-full ${fullWidth ? '' : 'shrink-0'} ${className}`}>
        <div className={`relative ${fullWidth ? 'w-full' : 'w-16 sm:w-20 shrink-0'}`}>
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            dir={dir}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${inputId}-error` : tooltip ? `${inputId}-tooltip` : undefined}
            className={`
              w-full bg-transparent px-2 py-1 font-mono font-bold text-center
              ${INPUT_SIZE_CLASSES[size]}
              text-[var(--color-text-primary)]
              placeholder-[var(--color-text-secondary)]/60
              outline-none transition-all rounded-[var(--rounded-sm)]
              focus:bg-[var(--color-surface)]
              focus:border-[var(--color-accent-cobalt-line)]
              ${error ? 'text-[var(--color-error)] font-bold border-[var(--color-error)]' : 'border-[var(--color-border)]'}
              ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
              ${inputClassName}
            `}
            {...rest}
          />
          {error && (
            <div
              id={`${inputId}-error`}
              role="alert"
              className="absolute top-full right-0 text-xs text-[var(--color-error)] font-bold leading-tight mt-1 text-center w-full"
            >
              {error}
            </div>
          )}
          {tooltip && (
            <InputTooltip content={tooltip} id={`${inputId}-tooltip`} />
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = 'Input';

/* ============================================================================
 * InputTooltip — hover tooltip for Input labels/help
 * (Extracted from CustomComponents.tsx pattern)
 * ========================================================================== */
interface InputTooltipProps {
  content: React.ReactNode;
  id?: string;
  delay?: number;
}

const InputTooltip: React.FC<InputTooltipProps> = ({ content, id, delay = 100 }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(true);
  };

  const hideTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, delay);
  };

  return (
    <span
      className="inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      <InfoIcon
        className="ml-1 w-4 h-4 text-[var(--color-text-secondary)]/60 hover:text-[var(--color-text-secondary)] cursor-help flex-shrink-0"
        aria-hidden="true"
      />
      {isVisible && (
        <div
          id={id}
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs font-bold text-[var(--color-text-primary)] bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--rounded-md)] shadow-lg whitespace-nowrap opacity-0 animate-fade-in"
          style={{ animation: 'fade-in 150ms ease-out forwards' }}
        >
          {content}
        </div>
      )}
    </span>
  );
};

function InfoIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

/* ============================================================================
 * 3. Select — dropdown per DESIGN.md: components.select-default
 * ========================================================================== */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange' | 'value'> {
  /** Controlled string value. */
  value: string;
  /** Called with new string value on every change. */
  onChange: (value: string) => void;
  /** Options array: { value, label }. */
  options: ReadonlyArray<{ value: string; label: React.ReactNode }>;
  /** Placeholder shown when no value selected (renders as disabled option). */
  placeholder?: React.ReactNode;
  /** Error message. */
  error?: string;
  /** Size variant. */
  size?: 'sm' | 'md' | 'lg';
  /** Text direction. Default 'rtl' for Hebrew labels. */
  dir?: 'ltr' | 'rtl';
  /** When true, select takes full width. */
  fullWidth?: boolean;
}

const SELECT_SIZE_CLASSES: Record<NonNullable<SelectProps['size']>, string> = {
  sm: 'text-sm sm:text-base py-1.5 px-3',
  md: 'text-lg sm:text-xl py-2 px-4',
  lg: 'text-xl sm:text-2xl py-2.5 px-5',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      value,
      onChange,
      options,
      placeholder,
      error,
      size = 'md',
      dir = 'rtl',
      fullWidth = true,
      disabled,
      className = '',
      id,
      name,
      ...rest
    },
    ref,
  ) {
    return (
      <div className={`w-full ${fullWidth ? '' : 'shrink-0'} ${className}`}>
        <select
          ref={ref}
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          dir={dir}
          aria-invalid={error ? 'true' : undefined}
          className={`
            w-full appearance-none bg-[var(--color-surface)] px-4 pr-10 py-2
            font-mono font-bold text-center
            ${SELECT_SIZE_CLASSES[size]}
            text-[var(--color-text-primary)]
            border rounded-[var(--rounded-sm)]
            outline-none transition-all
            focus:border-[var(--color-accent-cobalt-line)]
            focus:ring-1 focus:ring-[var(--color-accent-cobalt-line)]
            ${error ? 'border-[var(--color-error)] text-[var(--color-error)]' : 'border-[var(--color-border)]'}
            ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
          `}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} dir="rtl">
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <div
            role="alert"
            className="absolute top-full right-0 text-xs text-[var(--color-error)] font-bold leading-tight mt-1 text-center w-full"
          >
            {error}
          </div>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

/* ============================================================================
 * 4. InputGroup — Label + Input/Select + error in one block
 * (Re-exports the composite from CustomComponents for backward compat)
 * ========================================================================== */
export { InputGroup } from './CustomComponents';
export type { InputGroupProps, InputSize } from './CustomComponents';
