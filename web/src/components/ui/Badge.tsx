/**
 * Badge.tsx
 * Primitive badge component per DESIGN.md Component Usage Map
 * 5 semantic variants: brass, teal, crimson, cobalt, neutral
 * All colors consume DESIGN.md tokens via var(--color-*)
 */

import React, { forwardRef, HTMLAttributes } from 'react';

export type BadgeVariant = 'brass' | 'teal' | 'crimson' | 'cobalt' | 'neutral' | 'success';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Semantic variant. Maps to specific accent from DESIGN.md.
   *  - brass: H₀ reference, critical values
   *  - teal: Power, acceptance regions (1-β)
   *  - crimson: Type I error (α), rejection regions
   *  - cobalt: Z-scores, standard normal, primary interactive elements
   *  - neutral: Generic/muted status
   */
  variant?: BadgeVariant;
  /** Size variant. Default 'md'. */
  size?: BadgeSize;
  /** When true, renders as a dot indicator (e.g. for status lists). */
  dot?: boolean;
  /** Optional label for dot variant (accessible text). */
  dotLabel?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  brass: {
    bg: 'bg-[var(--color-primary)]/15',
    text: 'text-[var(--color-primary)]',
    border: 'border-[var(--color-primary)]',
  },
  teal: {
    bg: 'bg-[var(--chart-2)]/15',
    text: 'text-[var(--chart-2)]',
    border: 'border-[var(--chart-2)]',
  },
  crimson: {
    bg: 'bg-[var(--color-accent-crimson)]/15',
    text: 'text-[var(--color-accent-crimson)]',
    border: 'border-[var(--color-accent-crimson)]',
  },
  cobalt: {
    bg: 'bg-[var(--color-accent-cobalt-bg)]',
    text: 'text-[var(--color-accent-cobalt)]',
    border: 'border-[var(--color-accent-cobalt-line)]',
  },
  neutral: {
    bg: 'bg-[var(--color-surface-raised)]',
    text: 'text-[var(--color-text-secondary)]',
    border: 'border-[var(--color-border)]',
  },
  success: {
    bg: 'bg-[var(--color-success)]/15',
    text: 'text-[var(--color-success)]',
    border: 'border-[var(--color-success)]',
  },
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs sm:text-sm gap-1',
  md: 'px-2.5 py-1 text-xs sm:text-sm gap-1.5',
  lg: 'px-3 py-1.5 text-sm sm:text-base gap-2',
};

const DOT_SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge(
    {
      variant = 'neutral',
      size = 'md',
      dot = false,
      dotLabel,
      className = '',
      children,
      ...rest
    },
    ref,
  ) {
    const v = VARIANT_CLASSES[variant];

    if (dot) {
      const label = dotLabel ?? children ?? 'status';
      return (
        <span
          ref={ref}
          className={`
            inline-flex items-center gap-1.5 font-semibold
            ${SIZE_CLASSES[size]}
            ${className}
          `}
          {...rest}
        >
          <span
            className={`
              shrink-0 rounded-full
              ${DOT_SIZE_CLASSES[size]}
              bg-current
              ${v.text.replace('text-', '')}
            `}
            aria-hidden="true"
          />
          <span className="sr-only">{label}</span>
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center font-semibold rounded-full border
          whitespace-nowrap
          ${v.bg}
          ${v.text}
          ${v.border}
          ${SIZE_CLASSES[size]}
          ${className}
        `}
        {...rest}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';

/**
 * Compound badge for status displays (e.g. P(A|B), Power, α)
 * Combines a semantic badge with a value and optional label.
 */
export interface StatusBadgeProps extends Omit<BadgeProps, 'children' | 'dot'> {
  /** Main value to display (e.g. '0.05', '85%', '1.96'). */
  value: React.ReactNode;
  /** Optional label below/beside value (e.g. 'α', 'Power', 'Z'). */
  label?: React.ReactNode;
  /** Layout: 'inline' (horizontal) or 'stacked' (vertical). Default 'inline'. */
  layout?: 'inline' | 'stacked';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  value,
  label,
  layout = 'inline',
  className = '',
  ...rest
}) => {
  const v = VARIANT_CLASSES[variant];
  const isStacked = layout === 'stacked';

  return (
    <span
      className={`
        inline-flex ${isStacked ? 'flex-col items-start' : 'items-center'} gap-1
        ${v.bg}
        ${v.border}
        rounded-full
        px-2.5 py-1.5
        ${className}
      `}
      {...rest}
    >
      <span
        className={`
          font-semibold ${isStacked ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}
          ${v.text}
        `}
      >
        {value}
      </span>
      {label && (
        <span
          className={`
            font-bold text-xs uppercase tracking-wider
            ${v.text}
          `}
        >
          {label}
        </span>
      )}
    </span>
  );
};

/**
 * BadgeGroup — renders multiple badges with consistent spacing.
 * Useful for displaying multiple semantic statuses together.
 */
export interface BadgeGroupProps {
  badges: Array<
    BadgeProps & {
      key: string;
    }
  >;
  className?: string;
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({ badges, className = '' }) => (
  <div className={`inline-flex flex-wrap gap-2 ${className}`}>
    {badges.map((badge) => (
      <Badge key={badge.key} {...badge} />
    ))}
  </div>
);
