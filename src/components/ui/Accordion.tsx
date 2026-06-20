/**
 * Accordion.tsx
 * Primitive accordion component per DESIGN.md Component Usage Map
 * Variant: default (components.accordion-default)
 * For FormulaSheet chapters, power calc — uses DESIGN.md tokens via var(--color-*)
 */

import React, { forwardRef, useState, useRef, useEffect, HTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type AccordionSize = 'sm' | 'md' | 'lg';
export type AccordionVariant = 'default' | 'bordered' | 'card';

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Accordion items. */
  items: Array<AccordionItem>;
  /** Allow multiple items open at once. Default false. */
  allowMultiple?: boolean;
  /** Variant. Default 'default'. */
  variant?: AccordionVariant;
  /** Size variant. Default 'md'. */
  size?: AccordionSize;
  /** When true, first item opens on mount. Default false. */
  defaultOpenFirst?: boolean;
  /** Callback when item expansion changes. */
  onChange?: (openKeys: string[]) => void;
}

export interface AccordionItem {
  /** Unique key for the item. */
  key: string;
  /** Trigger content (shown when closed). */
  trigger: React.ReactNode;
  /** Content content (shown when open). */
  content: React.ReactNode;
  /** Optional icon for trigger. */
  icon?: React.ReactNode;
  /** When true, item is disabled. */
  disabled?: boolean;
  /** Custom className for the item container. */
  className?: string;
}

const VARIANT_CLASSES: Record<AccordionVariant, string> = {
  default: 'border border-[var(--color-border)] rounded-lg overflow-hidden',
  bordered: 'border border-[var(--color-border)] rounded-lg overflow-hidden divide-y divide-[var(--color-border)]',
  card: 'bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm overflow-hidden',
};

const SIZE_CLASSES: Record<AccordionSize, { trigger: string; content: string }> = {
  sm: { trigger: 'px-3 py-2 text-xs', content: 'px-3 pb-2 pt-1 text-xs' },
  md: { trigger: 'px-4 py-3 sm:py-3.5 text-xs sm:text-sm', content: 'px-4 py-3 pt-1 text-xs sm:text-sm' },
  lg: { trigger: 'px-5 py-4 text-sm sm:text-base', content: 'px-5 py-4 pt-2 text-sm sm:text-base' },
};

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(
    {
      items,
      allowMultiple = false,
      variant = 'default',
      size = 'md',
      defaultOpenFirst = false,
      onChange,
      className = '',
      children,
      ...rest
    },
    ref,
  ) {
    const [openKeys, setOpenKeys] = useState<Set<string>>(() => {
      if (defaultOpenFirst && items.length > 0) {
        return new Set([items[0].key]);
      }
      return new Set();
    });

    useEffect(() => {
      onChange?.(Array.from(openKeys));
    }, [openKeys, onChange]);

    const toggleItem = (key: string) => {
      setOpenKeys((prev) => {
        const next = new Set(prev);
        if (allowMultiple) {
          if (next.has(key)) next.delete(key);
          else next.add(key);
        } else {
          next.clear();
          if (!prev.has(key)) next.add(key);
        }
        return next;
      });
    };

    const sizes = SIZE_CLASSES[size];

    return (
      <div
        ref={ref}
        className={`${VARIANT_CLASSES[variant]} ${className}`}
        {...rest}
      >
        {items.map((item) => {
          const isOpen = openKeys.has(item.key);
          return (
            <AccordionItemComponent
              key={item.key}
              item={item}
              isOpen={isOpen}
              onToggle={() => toggleItem(item.key)}
              size={size}
              triggerClass={sizes.trigger}
              contentClass={sizes.content}
            />
          );
        })}
      </div>
    );
  },
);

Accordion.displayName = 'Accordion';

// Internal component for each accordion item
interface AccordionItemComponentProps {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
  size: AccordionSize;
  triggerClass: string;
  contentClass: string;
}

const AccordionItemComponent = React.memo(function AccordionItemComponent({
  item,
  isOpen,
  onToggle,
  triggerClass,
  contentClass,
}: AccordionItemComponentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`${item.className || ''} ${item.disabled ? 'opacity-50' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        disabled={item.disabled}
        className={`
          w-full text-right flex items-center justify-between gap-3
          ${triggerClass}
          font-black transition-all
          ${isOpen ? 'text-[var(--color-accent-cobalt)]' : 'text-[var(--color-text-primary)]'}
          ${item.disabled ? 'cursor-not-allowed' : 'hover:bg-[var(--color-surface-raised)]/50'}
        `}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${item.key}`}
      >
        <span className="text-[var(--color-text-primary)] flex-1 text-right">
          {item.trigger}
        </span>
        {item.icon && <span className="shrink-0 text-[var(--color-text-secondary)]">{item.icon}</span>}
        <span className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-[var(--color-text-secondary)]`}>
          <ChevronDown size={16} />
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`accordion-content-${item.key}`}
            ref={contentRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 1, 1] }}
            className="overflow-hidden"
          >
            <div className={`border-t border-[var(--color-border)] ${contentClass} text-[var(--color-text-secondary)]`}>
              {item.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

AccordionItemComponent.displayName = 'AccordionItemComponent';

// Need ChevronDown for the component
import { ChevronDown } from 'lucide-react';

// ============================================================================
// AccordionSection — Wrapper for grouped accordions with title (FormulaSheet pattern)
// ============================================================================

export interface AccordionSectionProps {
  /** Section title. */
  title: React.ReactNode;
  /** Section icon. */
  icon?: React.ReactNode;
  /** Accordion items. */
  items: Array<AccordionItem>;
  /** Allow multiple items open. Default false. */
  allowMultiple?: boolean;
  /** Search filter (optional). */
  searchQuery?: string;
  /** Filter function for items. */
  filterFn?: (item: AccordionItem, query: string) => boolean;
  /** Size variant. Default 'md'. */
  size?: AccordionSize;
  /** ClassName for section container. */
  className?: string;
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  icon,
  items,
  allowMultiple = false,
  searchQuery = '',
  filterFn,
  size = 'md',
  className = '',
}) => {
  const filteredItems = searchQuery && filterFn
    ? items.filter((item) => filterFn(item, searchQuery))
    : items;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-[var(--color-accent-cobalt)]">{icon}</span>}
        <h3 className="font-extrabold text-xs sm:text-sm text-[var(--color-text-primary)]">{title}</h3>
      </div>
      <Accordion
        items={filteredItems}
        allowMultiple={allowMultiple}
        variant="default"
        size={size}
      />
    </div>
  );
};

// ============================================================================
// SimpleAccordion — Minimal accordion (single item, no animation lib)
// ============================================================================

export interface SimpleAccordionProps {
  /** Trigger label. */
  trigger: React.ReactNode;
  /** Content. */
  children: React.ReactNode;
  /** Default open state. Default false. */
  defaultOpen?: boolean;
  /** Icon. Default ChevronDown. */
  icon?: React.ReactNode;
  /** Size variant. Default 'md'. */
  size?: AccordionSize;
  /** ClassName. */
  className?: string;
}

export const SimpleAccordion: React.FC<SimpleAccordionProps> = ({
  trigger,
  children,
  defaultOpen = false,
  icon,
  size = 'md',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  const sizes = SIZE_CLASSES[size];

  return (
    <div className={`${className} border border-[var(--color-border)] rounded-lg overflow-hidden`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full text-right flex items-center justify-between gap-3
          ${sizes.trigger}
          font-black transition-all
          ${isOpen ? 'text-[var(--color-accent-cobalt)]' : 'text-[var(--color-text-primary)]'}
          hover:bg-[var(--color-surface-raised)]/50
        `}
        aria-expanded={isOpen}
      >
        <span className="text-[var(--color-text-primary)]">{trigger}</span>
        {icon && <span className="shrink-0 text-[var(--color-text-secondary)]">{icon}</span>}
        <span className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-[var(--color-text-secondary)]`}>
          <ChevronDown size={16} />
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={contentRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 1, 1] }}
            className="overflow-hidden"
          >
            <div className={`border-t border-[var(--color-border)] ${sizes.content} text-[var(--color-text-secondary)]`}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};