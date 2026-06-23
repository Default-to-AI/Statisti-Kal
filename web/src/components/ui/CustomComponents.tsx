/**
 * CustomComponents.tsx
 * -----------------------------------------------------------------------------
 * Project-specific composite components that consume DESIGN.md tokens directly
 * (via `var(--color-*)` in className). They are intentionally thin wrappers
 * composed from the patterns observed in the calculator files. They do NOT
 * replace the base UI primitives (Button, Card, Input, Modal) — those live
 * in sibling files in this directory.
 *
 * Conventions:
 *   - Hebrew text → container should be `dir="rtl"` (handled at consumer level)
 *   - Numeric/math content → wrap with `dir="ltr"` (handled at consumer level)
 *   - All colors come from CSS variables defined in `src/index.css`
 *   - No animations or motion here — composites are presentational; consumers
 *     wrap with `motion.div` if needed
 *   - Every prop has an explicit type; no implicit `any`
 * -----------------------------------------------------------------------------
 */

import React, { forwardRef, useId, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Info, ChevronDown, MessageCircle } from 'lucide-react';
// ============================================================================
// 1. InputGroup — Label + input + error + optional tooltip, in one block
// ============================================================================

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputGroupProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'value'> {
  /** Visible label (string or ReactNode for inline KaTeX/Math). */
  label: React.ReactNode;
  /** Controlled string value. The composite keeps it as a string so partial
   *  decimal input ("1.") and empty fields can be expressed. */
  value: string;
  /** Called with the new string value on every change. */
  onChange: (value: string) => void;
  /** Error message — when present, the input renders in error styling and the
   *  message appears below the field. */
  error?: string;
  /** Optional help text shown as a tooltip on hover. */
  tooltip?: React.ReactNode;
  /** Font scale variant. `md` matches the calculators' default (lg/xl). */
  size?: InputSize;
  /** When true, the label sits next to the input in a row (table-cell layout). */
  inline?: boolean;
  /** Override the wrapper className. */
  className?: string;
  /** Override only the input element className. */
  inputClassName?: string;
  /** Whether to mark the field as required (renders a small indicator). */
  required?: boolean;
  /** Text direction for the input element. Default 'ltr' for numeric input. */
  dir?: 'ltr' | 'rtl';
}

const INPUT_SIZE_CLASSES: Record<InputSize, string> = {
  sm: 'text-sm sm:text-base',
  md: 'text-lg sm:text-xl',
  lg: 'text-xl sm:text-2xl',
};

export const InputGroup = forwardRef<HTMLInputElement, InputGroupProps>(function InputGroup(
  {
    label,
    value,
    onChange,
    error,
    tooltip,
    size = 'md',
    inline = false,
    className = '',
    inputClassName = '',
    required = false,
    dir = 'ltr',
    disabled,
    placeholder,
    name,
    id,
    type = 'text',
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const wrapperClass = inline
    ? 'flex items-center justify-between gap-2 w-full'
    : 'block w-full';

  const labelClass = inline
    ? `text-xs sm:text-sm text-[var(--color-text-secondary)] font-bold shrink-0 ${inline && tooltip ? 'cursor-help border-b border-dotted border-[var(--color-text-secondary)]' : ''}`
    : 'block text-xs font-black text-[var(--color-text-primary)] mb-1 font-sans';

  return (
    <div className={`${wrapperClass} ${className}`}>
      <label
        htmlFor={inputId}
        className={`${labelClass} ${disabled ? 'opacity-30' : ''}`}
      >
        <span className="inline-flex items-center gap-1.5">
          {label}
          {required && <span className="text-[var(--color-error)]" aria-hidden="true">*</span>}
        </span>
      </label>
      <div className={`relative ${inline ? 'w-16 sm:w-20 shrink-0' : 'w-full'}`}>
        <input
          {...rest}
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
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full bg-transparent px-2 py-1 font-mono font-bold text-center ${INPUT_SIZE_CLASSES[size]} text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/60 outline-none transition-all rounded focus:bg-[var(--color-surface)] ${
            error ? 'text-[var(--color-error)] font-bold' : ''
          } ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${inputClassName}`}
        />
        {error && (
          <div
            id={`${inputId}-error`}
            role="alert"
            className={`absolute top-full right-0 text-xs text-[var(--color-error)] font-bold leading-tight mt-1 text-center w-full`}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
});

// ============================================================================
// 2. ChartWrapper — Panel with legend, title, chart area, and empty state
// ============================================================================

export interface ChartWrapperProps {
  /** The chart body (typically a Recharts `<AreaChart>`, `<LineChart>`, etc.
   *  wrapped in `<ResponsiveContainer>`). The wrapper itself does not
   *  import Recharts to keep the composite tree-shakable. */
  children: React.ReactNode;
  /** Optional legend chips, rendered above the chart on the right side. */
  legend?: React.ReactNode;
  /** Optional title rendered on the left side of the header bar. */
  title?: React.ReactNode;
  /** Optional badge (e.g. live status pill) rendered next to the title. */
  badge?: React.ReactNode;
  /** When true, renders `emptyState` (or default empty message) instead of
   *  the chart body. */
  isEmpty?: boolean;
  /** Custom empty state content. Default: muted centered text. */
  emptyState?: React.ReactNode;
  /** Height of the chart area. Default `'305px'`. */
  height?: number | string;
  /** Direction for the chart area. Default `'ltr'` because Recharts axes are
   *  left-to-right. Override only for special cases. */
  childrenDir?: 'ltr' | 'rtl';
  /** Additional class for the outer panel. */
  className?: string;
}

const DEFAULT_EMPTY_MESSAGE = 'אין נתונים להצגה כרגע.';

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  children,
  legend,
  title,
  badge,
  isEmpty = false,
  emptyState,
  height = 305,
  childrenDir = 'ltr',
  className = '',
}) => {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;
  return (
    <div
      className={`rounded-lg p-4 md:p-5 border shadow-md transition-all bg-[var(--color-surface)] border-[var(--color-border)] w-full min-w-0 ${className}`}
    >
      {(title || legend || badge) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-3 mb-3">
          {title && (
            <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
              <span className="text-lg sm:text-xl font-black">{title}</span>
              {badge}
            </div>
          )}
          {legend && (
            <div className="flex flex-wrap gap-4 text-xs sm:text-sm">{legend}</div>
          )}
        </div>
      )}
      {isEmpty ? (
        <div className="py-24 text-center text-[var(--color-text-secondary)] font-bold text-base">
          {emptyState ?? DEFAULT_EMPTY_MESSAGE}
        </div>
      ) : (
        <div className="w-full mt-2" style={{ height: heightStyle }} dir={childrenDir}>
          {children}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. CalculatorSidebar — Panel wrapper for sidebar content
// ============================================================================

export interface CalculatorSidebarProps {
  children: React.ReactNode;
  className?: string;
  /** `panel` = surface bg with border (default). `card` = surface-raised bg,
   *  more emphasis. */
  variant?: 'panel' | 'card';
  /** Optional sticky behavior. Default `false`. */
  sticky?: boolean;
}

export const CalculatorSidebar: React.FC<CalculatorSidebarProps> = ({
  children,
  className = '',
  variant = 'panel',
  sticky = false,
}) => {
  const bgClass = variant === 'card' ? 'bg-[var(--color-surface-raised)]' : 'bg-[var(--color-surface)]';
  return (
    <aside
      className={`rounded-lg p-5 md:p-6 border shadow-md transition-colors ${bgClass} border-[var(--color-border)] ${
        sticky ? 'lg:sticky lg:top-6' : ''
      } ${className}`}
    >
      {children}
    </aside>
  );
};

// ============================================================================
// 4. StepList — Numbered steps with title + content
// ============================================================================

export interface StepListItem {
  /** Optional stable id for keys. */
  id?: string;
  /** Step number. Numeric by convention but string allows "1a", "Step 1" etc. */
  number: React.ReactNode;
  /** Step title (string or ReactNode for inline math). */
  title: React.ReactNode;
  /** Step body. */
  content: React.ReactNode;
  /** When true, dims the step (e.g. for disabled/future states). */
  muted?: boolean;
}

export interface StepListProps {
  steps: StepListItem[];
  className?: string;
  /** Add a divider line between steps. Default `true`. */
  divider?: boolean;
  /** Accent color for the number badge. Default `accent-cobalt` (indigo). */
  accentColor?: 'cobalt' | 'brass' | 'teal' | 'crimson';
}

const ACCENT_CLASSES: Record<NonNullable<StepListProps['accentColor']>, { badge: string; text: string }> = {
  cobalt: {
    badge: 'bg-[var(--color-accent-cobalt-bg)] border-[var(--color-accent-cobalt-line)]',
    text: 'text-[var(--color-accent-cobalt)]',
  },
  brass: {
    badge: 'bg-[var(--color-accent-brass)]/15 border-[var(--color-accent-brass)]',
    text: 'text-[var(--color-accent-brass)]',
  },
  teal: {
    badge: 'bg-[var(--color-accent-teal)]/15 border-[var(--color-accent-teal)]',
    text: 'text-[var(--color-accent-teal)]',
  },
  crimson: {
    badge: 'bg-[var(--color-accent-crimson)]/15 border-[var(--color-accent-crimson)]',
    text: 'text-[var(--color-accent-crimson)]',
  },
};

export const StepList: React.FC<StepListProps> = ({
  steps,
  className = '',
  divider = true,
  accentColor = 'cobalt',
}) => {
  const accent = ACCENT_CLASSES[accentColor];
  return (
    <div className={`${divider ? 'divide-y divide-[var(--color-border)]' : ''} ${className}`}>
      {steps.map((step, idx) => (
        <div
          key={step.id ?? idx}
          className={`space-y-3 py-8 ${step.muted ? 'opacity-50' : ''}`}
        >
          <div className={`flex items-center gap-3 font-extrabold ${accent.text}`}>
            <span
              className={`w-9 h-9 rounded-full text-base font-black flex items-center justify-center border ${accent.badge}`}
            >
              {step.number}
            </span>
            <span className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">
              {step.title}
            </span>
          </div>
          <div className="pr-5 py-1 space-y-4">{step.content}</div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// 5. ModeTabs — Tab button group with active state
// ============================================================================

export interface ModeTab<T extends string = string> {
  id: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  description?: string;
}

export interface ModeTabsProps<T extends string = string> {
  tabs: ReadonlyArray<ModeTab<T>>;
  activeTab: T;
  onChange: (id: T) => void;
  /** Visual orientation. Default `'vertical'` matches the test-type sidebar
   *  pattern in the calculators. Use `'horizontal'` for top mode switchers. */
  orientation?: 'vertical' | 'horizontal';
  /** Size of the tab buttons. Default `'md'`. */
  size?: 'sm' | 'md' | 'lg';
  /** When true, tabs take full width (horizontal) or full height (vertical). */
  fill?: boolean;
  /** Accessible label for the tab group. */
  ariaLabel?: string;
  className?: string;
}

const TAB_SIZE_CLASSES: Record<NonNullable<ModeTabsProps['size']>, string> = {
  sm: 'py-2 px-3 text-xs',
  md: 'py-3 px-4 text-xs sm:text-sm',
  lg: 'py-4 px-5 text-sm sm:text-base',
};

export function ModeTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  orientation = 'vertical',
  size = 'md',
  fill = true,
  ariaLabel,
  className = '',
}: ModeTabsProps<T>) {
  const containerOrientation =
    orientation === 'vertical' ? 'flex flex-col gap-2' : 'flex flex-row gap-1';
  const fillClass = fill
    ? orientation === 'vertical'
      ? 'w-full'
      : 'flex-1'
    : '';
  const activeClass =
    'bg-[var(--color-accent-cobalt-strong)] text-white border-[var(--color-accent-cobalt-dark)] shadow-md scale-[1.02]';
  const inactiveClass =
    'bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:bg-[var(--color-surface)]';

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`${containerOrientation} ${fill ? 'w-full' : ''} ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`${TAB_SIZE_CLASSES[size]} ${fillClass} rounded-sm font-black transition-all text-center border cursor-pointer select-none flex items-center ${
              orientation === 'vertical' ? 'justify-center' : 'justify-center gap-1.5'
            } ${isActive ? activeClass : inactiveClass}`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// 6. EmptyState — Centered placeholder for empty/uninitialized views
// ============================================================================

export type EmptyStateTone = 'neutral' | 'warning' | 'error' | 'info' | 'muted';

export interface EmptyStateProps {
  /** Body content. If `message` is also provided, `message` is used and
   *  `children` is appended below it. */
  children?: React.ReactNode;
  /** Optional icon element. */
  icon?: React.ReactNode;
  /** Short title (e.g. "אין נתונים"). */
  title?: React.ReactNode;
  /** Main message (e.g. "נא להזין ערכי קלט תקינים..."). */
  message?: React.ReactNode;
  /** Color tone. Default `'muted'` for non-critical empty states. */
  tone?: EmptyStateTone;
  /** Vertical padding. Default `'py-16'`. */
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TONE_CLASSES: Record<EmptyStateTone, string> = {
  neutral: 'text-[var(--color-text-primary)]',
  warning: 'text-[var(--color-warning)]',
  error: 'text-[var(--color-error)]',
  info: 'text-[var(--color-info)]',
  muted: 'text-[var(--color-text-secondary)]',
};

const PADDING_CLASSES: Record<NonNullable<EmptyStateProps['padding']>, string> = {
  sm: 'py-8',
  md: 'py-16',
  lg: 'py-24',
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  children,
  icon,
  title,
  message,
  tone = 'muted',
  padding = 'md',
  className = '',
}) => {
  return (
    <div className={`${PADDING_CLASSES[padding]} text-center ${TONE_CLASSES[tone]} ${className}`}>
      <div className="flex flex-col items-center justify-center gap-2">
        {icon && <div className="opacity-60 mb-1">{icon}</div>}
        {title && <div className="text-base font-black">{title}</div>}
        {message && <div className="text-sm font-bold opacity-90">{message}</div>}
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// Bonus helper: InputTooltip — re-exported as a utility for InputGroup labels
// ----------------------------------------------------------------------------
// This is the same tooltip pattern used in the calculators, factored out so
// InputGroup consumers can pass it via the `tooltip` prop, OR it can be used
// standalone around any inline element.
// ============================================================================

export interface InputTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Hover delay in ms. Default `100`. */
  delay?: number;
}

export const InputTooltip: React.FC<InputTooltipProps> = ({
  content,
  children,
  className = '',
  delay = 100,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
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
    <div
      className={`relative inline-flex items-center gap-1.5 ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <Info
        size={13}
        className="text-[var(--color-accent-cobalt)] cursor-help shrink-0"
        aria-hidden="true"
      />
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="tooltip"
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 text-xs rounded-sm shadow-sm pointer-events-none text-center leading-normal font-medium bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-sans"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// Bonus helper: Disclosure — light wrapper around <details>/<summary> with
// consistent styling matching the calculators' accordion pattern.
// ============================================================================

export interface AnimatedDetailsProps {
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
  id?: string;
  forceState?: { state: 'open' | 'closed'; timestamp: number };
  tocId?: string;
}

export const AnimatedDetails: React.FC<AnimatedDetailsProps> = ({
  children,
  className = '',
  defaultOpen = false,
  id,
  forceState,
  tocId,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (forceState) {
      setIsOpen(forceState.state === 'open');
    }
  }, [forceState]);

  useEffect(() => {
    const handleToggleAll = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.state) {
        setIsOpen(customEvent.detail.state === 'open');
      }
    };
    window.addEventListener('toggle-all-accordions', handleToggleAll);
    return () => window.removeEventListener('toggle-all-accordions', handleToggleAll);
  }, []);

  useEffect(() => {
    if (!tocId) {
      return;
    }

    const handleOpenPath = (e: Event) => {
      const customEvent = e as CustomEvent<{ ids?: string[] }>;
      if (customEvent.detail?.ids?.includes(tocId)) {
        setIsOpen(true);
      }
    };

    window.addEventListener('toc-open-path', handleOpenPath);
    return () => window.removeEventListener('toc-open-path', handleOpenPath);
  }, [tocId]);

  // separate children into summary and the rest
  const childrenArray = React.Children.toArray(children);
  const summary = childrenArray.find((child) => React.isValidElement(child) && (child as React.ReactElement).type === 'summary');
  const content = childrenArray.filter((child) => child !== summary);

  return (
    <div id={id} className={`group ${isOpen ? 'is-open' : ''} ${className}`}>
      {summary && React.cloneElement(summary as React.ReactElement<any>, {
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        },
        role: "button",
        "aria-expanded": isOpen,
      })}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export interface DisclosureProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  /** Accent color for the open-state border. */
  accentOnOpen?: 'cobalt' | 'brass' | 'teal' | 'crimson';
  className?: string;
}

const DISCLOSURE_ACCENT: Record<NonNullable<DisclosureProps['accentOnOpen']>, string> = {
  cobalt: 'group-[.is-open]:border-[var(--color-accent-cobalt)]',
  brass: 'group-[.is-open]:border-[var(--color-accent-brass)]',
  teal: 'group-[.is-open]:border-[var(--color-accent-teal)]',
  crimson: 'group-[.is-open]:border-[var(--color-accent-crimson)]',
};

export const Disclosure: React.FC<DisclosureProps> = ({
  title,
  icon,
  children,
  defaultOpen = false,
  accentOnOpen = 'cobalt',
  className = '',
}) => {
  return (
    <AnimatedDetails
      defaultOpen={defaultOpen}
      className={`border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]/50 ${DISCLOSURE_ACCENT[accentOnOpen]} ${className}`}
    >
      <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-5 text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-3">
          {icon}
          <span>{title}</span>
        </div>
        <span className="text-[var(--color-text-secondary)] transition-transform group-[.is-open]:rotate-180">
          <ChevronDown size={20} />
        </span>
      </summary>
      <div className="px-5 pb-5 pt-1">{children}</div>
    </AnimatedDetails>
  );
};

// ============================================================================
// 7. FormulaTranslation — Display a word translation under mathematical formulas
// ============================================================================

export interface FormulaTranslationProps {
  /** The name of the formula (e.g., "שגיאת התקן") */
  formulaName: string;
  /** The translation of the formula (e.g., "סטיית תקן חלקי שורש ריבועי של גודל המדגם") */
  translation: string;
  className?: string;
}

export const FormulaTranslation: React.FC<FormulaTranslationProps> = ({
  formulaName,
  translation,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        const portalEl = document.getElementById('formula-tooltip-portal');
        if (portalEl && portalEl.contains(event.target as Node)) {
            return;
        }
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    if (!isOpen && tooltipRef.current) {
        const rect = tooltipRef.current.getBoundingClientRect();
        setCoords({
            top: rect.bottom + window.scrollY + 10,
            left: rect.left + window.scrollX + rect.width / 2
        });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} ref={tooltipRef}>
      <button 
        onClick={toggleOpen}
        className="relative flex items-center justify-center p-1.5 rounded-full text-[var(--color-accent-brass)] hover:bg-[var(--color-accent-brass)]/10 transition-colors shadow-sm bg-[var(--color-surface)] border border-[var(--color-accent-brass)]/50 hover:scale-105 active:scale-95"
        title="קריאת הנוסחה במילים"
      >
        <Info size={24} strokeWidth={2} />
      </button>

      {isOpen && createPortal(
        <div id="formula-tooltip-portal" className="absolute z-[9999]" style={{ top: coords.top, left: coords.left }}>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-0 -translate-x-1/2 w-[280px] sm:w-[320px] p-4 rounded-xl bg-[var(--color-surface-raised)] border border-[var(--color-accent-brass)] shadow-xl"
              dir="rtl"
            >
              {/* Arrow pointing up */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[var(--color-surface-raised)] border-t border-l border-[var(--color-accent-brass)] rotate-45"></div>
              
              <div className="relative z-10 text-center space-y-2">
                <div className="text-sm font-black text-[var(--color-accent-brass)] mb-1">{formulaName}</div>
                <div className="text-sm sm:text-base font-medium leading-relaxed text-[var(--color-text-primary)]">
                  {translation}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>,
        document.body
      )}
    </div>
  );
};
