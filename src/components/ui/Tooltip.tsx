/**
 * Tooltip.tsx
 * Primitive tooltip component per DESIGN.md Component Usage Map
 * Variant: default (components.tooltip-default)
 * For input help, chart hover — uses DESIGN.md tokens via var(--color-*)
 */

import React, { forwardRef, useState, useRef, useEffect, HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TooltipSize = 'sm' | 'md' | 'lg';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  /** Tooltip content. */
  content: React.ReactNode;
  /** Child element to attach tooltip to. */
  children: React.ReactNode;
  /** Placement relative to child. Default 'top'. */
  placement?: TooltipPlacement;
  /** Size variant. Default 'md'. */
  size?: TooltipSize;
  /** Hover delay in ms. Default 100. */
  delay?: number;
  /** When true, shows tooltip on focus as well as hover. Default true. */
  showOnFocus?: boolean;
  /** Offset from child in pixels. Default 8. */
  offset?: number;
  /** Custom className for tooltip content. */
  contentClassName?: string;
}

const PLACEMENT_CLASSES: Record<TooltipPlacement, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const ARROW_PLACEMENT_CLASSES: Record<TooltipPlacement, string> = {
  top: 'absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-[var(--color-border)]',
  bottom: 'absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-b-[var(--color-border)]',
  left: 'absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-4 border-transparent border-l-[var(--color-border)]',
  right: 'absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-4 border-transparent border-r-[var(--color-border)]',
};

const SIZE_CLASSES: Record<TooltipSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-2 text-xs sm:text-sm',
  lg: 'px-4 py-2.5 text-sm sm:text-base',
};

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(
    {
      content,
      children,
      placement = 'top',
      size = 'md',
      delay = 100,
      showOnFocus = true,
      offset = 8,
      contentClassName = '',
      className = '',
      ...rest
    },
    ref,
  ) {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const childRef = useRef<HTMLElement>(null);

    useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, []);

    const showTooltip = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
    };

    const hideTooltip = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsVisible(false), 50);
    };

    const childWithProps = React.Children.only(children) as React.ReactElement<any>;
    const childProps = childWithProps.props;

    const mergedChildProps = {
      ...childProps,
      ref: (el: HTMLElement) => {
        childRef.current = el;
        if (typeof childProps.ref === 'function') childProps.ref(el);
        else if (childProps.ref && typeof childProps.ref === 'object') (childProps.ref as React.RefObject<HTMLElement>).current = el;
      },
      onMouseEnter: (e: React.MouseEvent) => {
        showTooltip();
        childProps.onMouseEnter?.(e);
      },
      onMouseLeave: (e: React.MouseEvent) => {
        hideTooltip();
        childProps.onMouseLeave?.(e);
      },
      ...(showOnFocus
        ? {
            onFocus: (e: React.FocusEvent) => {
              showTooltip();
              childProps.onFocus?.(e);
            },
            onBlur: (e: React.FocusEvent) => {
              hideTooltip();
              childProps.onBlur?.(e);
            },
          }
        : {}),
    };

    const tooltipContent = (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: placement === 'top' ? 4 : placement === 'bottom' ? -4 : 0, x: placement === 'left' ? 4 : placement === 'right' ? -4 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: placement === 'top' ? 4 : placement === 'bottom' ? -4 : 0, x: placement === 'left' ? 4 : placement === 'right' ? -4 : 0 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className={`
              ${PLACEMENT_CLASSES[placement]}
              ${SIZE_CLASSES[size]}
              font-bold text-[var(--color-text-primary)]
              bg-[var(--color-surface-raised)]
              border border-[var(--color-border)]
              rounded-lg shadow-lg whitespace-nowrap z-50
              ${contentClassName}
            `}
            role="tooltip"
            style={{ margin: offset }}
          >
            {content}
            <div className={ARROW_PLACEMENT_CLASSES[placement]} />
          </motion.div>
        )}
      </AnimatePresence>
    );

    return (
      <div ref={ref} className={`relative inline-block ${className}`} {...rest}>
        {React.cloneElement(childWithProps, mergedChildProps)}
        {createPortal(tooltipContent, document.body)}
      </div>
    );
  },
);

Tooltip.displayName = 'Tooltip';

// ============================================================================
// ChartTooltip — Specialized tooltip for chart hover (Recharts custom tooltip)
// ============================================================================

export interface ChartTooltipPayload {
  name: string;
  value: number | string;
  color: string;
  payload: any;
}

export interface ChartTooltipProps {
  /** Active tooltip payload from Recharts. */
  active?: boolean;
  /** Payload array from Recharts. */
  payload?: ChartTooltipPayload[];
  /** Label (x-axis value). */
  label?: string | number;
  /** Custom formatter for values. */
  formatter?: (value: number | string, name: string) => React.ReactNode;
  /** Custom label formatter. */
  labelFormatter?: (label: string | number) => React.ReactNode;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}) => {
  if (!active || !payload || !payload.length) return null;

  const labelContent = labelFormatter ? labelFormatter(label) : (
    <div className="text-xs font-black text-[var(--color-text-secondary)] mb-2 pb-2 border-b border-[var(--color-border)]" dir="ltr">
      {label}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 4 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-lg p-3 min-w-[180px] z-50"
      role="tooltip"
    >
      {labelContent}
      <div className="space-y-1.5">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-bold text-[var(--color-text-secondary)]">
              {entry.name}:
            </span>
            <span className="text-xs font-mono font-bold text-[var(--color-text-primary)]" dir="ltr">
              {formatter ? formatter(entry.value, entry.name) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================================================
// InputHelpTooltip — Convenience wrapper for input help (matches InputGroup pattern)
// ============================================================================

export interface InputHelpTooltipProps {
  /** Help content. */
  content: React.ReactNode;
  /** Trigger element (typically an Info icon). */
  trigger: React.ReactNode;
  /** Placement. Default 'top'. */
  placement?: TooltipPlacement;
  /** Size. Default 'sm'. */
  size?: TooltipSize;
}

export const InputHelpTooltip: React.FC<InputHelpTooltipProps> = ({
  content,
  trigger,
  placement = 'top',
  size = 'sm',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowTooltip(true), 100);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowTooltip(false), 150);
  };

  const tooltipContent = (
    <AnimatePresence>
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 4 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className={`
            absolute bottom-full left-1/2 -translate-x-1/2 mb-2
            ${SIZE_CLASSES[size]}
            font-bold text-[var(--color-text-primary)]
            bg-[var(--color-surface-raised)]
            border border-[var(--color-border)]
            rounded-lg shadow-lg whitespace-nowrap z-10
          `}
          role="tooltip"
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-[var(--color-border)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <span className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {trigger}
      {createPortal(tooltipContent, document.body)}
    </span>
  );
};