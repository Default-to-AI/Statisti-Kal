/**
 * Button.tsx
 * Primitive button component per DESIGN.md Component Usage Map
 * 5 variants: primary, secondary, ghost, danger, success
 * All colors consume DESIGN.md tokens via var(--color-*)
 */

import React, { forwardRef, ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant. Default 'primary' for main actions. */
  variant?: ButtonVariant;
  /** Size variant. Default 'md'. */
  size?: ButtonSize;
  /** When true, button takes full width of container. */
  fullWidth?: boolean;
  /** Loading state — shows spinner, disables interaction. */
  loading?: boolean;
  /** Optional left icon. */
  leftIcon?: React.ReactNode;
  /** Optional right icon. */
  rightIcon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-accent-cobalt-strong)] text-white border-[var(--color-accent-cobalt-dark)] hover:bg-[var(--color-accent-cobalt-dark)] active:bg-[var(--color-accent-cobalt-strong)]/80 shadow-md shadow-[var(--color-accent-cobalt-line)]/15',
  secondary:
    'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:bg-[var(--color-surface)] active:bg-[var(--color-background)]',
  ghost:
    'bg-transparent text-[var(--color-text-primary)] border-transparent hover:bg-[var(--color-surface-raised)] active:bg-[var(--color-surface)]',
  danger:
    'bg-[var(--color-error)] text-white border-[var(--color-error)] hover:bg-[var(--color-error)]/90 active:bg-[var(--color-error)] shadow-md shadow-[var(--color-error)]/20',
  success:
    'bg-[var(--color-success)] text-white border-[var(--color-success)] hover:bg-[var(--color-success)]/90 active:bg-[var(--color-success)] shadow-md shadow-[var(--color-success)]/20',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs sm:text-sm gap-1.5',
  md: 'px-4 py-2 text-sm sm:text-base gap-2',
  lg: 'px-5 py-2.5 text-base sm:text-lg gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      children,
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center font-semibold rounded-md border transition-all duration-200
          select-none cursor-pointer
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none
          ${VARIANT_CLASSES[variant]}
          ${SIZE_CLASSES[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...rest}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>טוען...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0" aria-hidden="true">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0" aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

/**
 * SegmentedButton — for toggle-like button groups (e.g. Test Parameter Selector)
 * Uses the same variant system but with 'selected' state for active segment.
 */
export interface SegmentedButtonProps extends Omit<ButtonProps, 'variant'> {
  /** When true, renders as active segment. */
  selected?: boolean;
  /** Variant base for the segment. Default 'ghost' (borderless, background on select). */
  baseVariant?: 'ghost' | 'secondary';
}

const SEGMENTED_BASE: Record<NonNullable<SegmentedButtonProps['baseVariant']>, string> = {
  ghost: 'bg-transparent border-transparent',
  secondary: 'bg-[var(--color-surface-raised)] border-[var(--color-border)]',
};

const SEGMENTED_ACTIVE: Record<NonNullable<SegmentedButtonProps['baseVariant']>, string> = {
  ghost: 'bg-[var(--color-accent-cobalt-bg)] border-[var(--color-accent-cobalt-line)] text-[var(--color-accent-cobalt)]',
  secondary: 'bg-[var(--color-accent-cobalt-strong)] border-[var(--color-accent-cobalt-dark)] text-white',
};

export const SegmentedButton = forwardRef<HTMLButtonElement, SegmentedButtonProps>(
  function SegmentedButton(
    {
      selected = false,
      baseVariant = 'ghost',
      size = 'md',
      className = '',
      children,
      disabled,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`
          inline-flex items-center justify-center font-semibold rounded-md border transition-all duration-200
          select-none cursor-pointer
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none
          ${SIZE_CLASSES[size]}
          ${selected ? SEGMENTED_ACTIVE[baseVariant] : SEGMENTED_BASE[baseVariant]}
          ${className}
        `}
        aria-pressed={selected}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

SegmentedButton.displayName = 'SegmentedButton';
