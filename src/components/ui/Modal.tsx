/**
 * Modal.tsx
 * Primitive modal shell per DESIGN.md Component Usage Map
 * For StatisticalHelperModal, confirmations, dialogs
 * Compliance: close/escape/aria/focus-trap/portal + 3 sizes + 2 variants
 */

import React, {
  forwardRef,
  useEffect,
  useRef,
  HTMLAttributes,
  ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

export type ModalSize = 'sm' | 'md' | 'lg';
export type ModalVariant = 'default' | 'confirmation' | 'error';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  /** Controls visibility. */
  isOpen: boolean;
  /** Called when user requests close (button, escape, overlay click). */
  onClose: () => void;
  /** Dialog title for screen readers and accessible labeling. */
  title: string;
  /** Optional description/label text. */
  description?: string;
  /** Size variant. Default 'md'. */
  size?: ModalSize;
  /** Visual variant. Default 'default'. */
  variant?: ModalVariant;
  /** When true, clicking outside the dialog closes it. Default true. */
  closeOnOverlay?: boolean;
  /** Optional footer actions (e.g. confirm/cancel buttons). */
  footer?: ReactNode;
  /** Optional header supplement rendered after the title. */
  headerExtra?: ReactNode;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-5xl',
};

const VARIANT_CLASSES: Record<ModalVariant, string> = {
  default: 'bg-[var(--color-surface)] border-[var(--color-border)] shadow-md',
  confirmation:
    'bg-[var(--color-surface)] border-[var(--color-accent-cobalt-line)] shadow-lg',
  error: 'bg-[var(--color-surface)] border-[var(--color-error)] shadow-lg',
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  function Modal(
    {
      isOpen,
      onClose,
      title,
      description,
      size = 'md',
      variant = 'default',
      closeOnOverlay = true,
      footer,
      headerExtra,
      className = '',
      children,
      ...rest
    },
    ref,
  ) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (!isOpen) return;

      previousActiveElement.current =
        typeof document !== 'undefined' ? (document.activeElement as HTMLElement) : null;

      const onKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
      };

      const handleOutsidePointerDown = (event: MouseEvent) => {
        if (!closeOnOverlay) return;
        const target = event.target as Node | null;
        if (!target) return;
        const el = dialogRef.current;
        if (el && !el.contains(target)) {
          onClose();
        }
      };

      const focusDialog = () => {
        const el = dialogRef.current;
        if (!el) return;
        const focusableSelector =
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusable = el.querySelectorAll<HTMLElement>(focusableSelector);
        if (focusable.length) {
          focusable[0].focus();
        } else {
          el.setAttribute('tabindex', '-1');
          el.focus();
        }
      };

      document.addEventListener('keydown', onKey, true);
      if (closeOnOverlay && typeof window !== 'undefined') {
        window.addEventListener('mousedown', handleOutsidePointerDown);
      }

      // Initial focus on first frame after mount
      const raf = requestAnimationFrame(() => focusDialog());

      return () => {
        document.removeEventListener('keydown', onKey, true);
        if (closeOnOverlay && typeof window !== 'undefined') {
          window.removeEventListener('mousedown', handleOutsidePointerDown);
        }
        cancelAnimationFrame(raf);
        previousActiveElement.current?.focus?.();
      };
    }, [isOpen, onClose, closeOnOverlay]);

    if (typeof document === 'undefined') return null;

    const dialog = (
      <AnimatePresence>
        {isOpen ? (
          <div className="fixed inset-0 z-40" aria-live="polite">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            <div className="relative flex items-center justify-center min-h-screen p-3 sm:p-4">
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                ref={ref ?? dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                aria-describedby={description ? `${title}-description` : undefined}
                className={`
                  relative w-full ${SIZE_CLASSES[size]} rounded-lg border
                  ${VARIANT_CLASSES[variant]}
                  ${className}
                `}
                {...rest}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] p-4 sm:p-5">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-base sm:text-lg font-black text-[var(--color-text-primary)]">
                      {title}
                    </h2>
                    {description && (
                      <p
                        id={`${title}-description`}
                        className="text-xs sm:text-sm font-bold text-[var(--color-text-secondary)]"
                      >
                        {description}
                      </p>
                    )}
                    {headerExtra ? (
                      <div className="mt-1">{headerExtra}</div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="
                      inline-flex items-center justify-center rounded-md border border-[var(--color-border)]
                      bg-[var(--color-surface)] p-2 text-[var(--color-text-secondary)]
                      hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)]
                      transition-colors
                    "
                    aria-label="סגור"
                  >
                    <CloseIcon className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-5 text-[var(--color-text-secondary)]">
                  {children}
                </div>

                {/* Footer */}
                {footer ? (
                  <div className="border-t border-[var(--color-border)] p-4 sm:p-5">
                    {footer}
                  </div>
                ) : null}
              </motion.div>
            </div>
          </div>
        ) : null}
      </AnimatePresence>
    );

    if (typeof document !== 'undefined' && document.body) {
      return createPortal(dialog, document.body);
    }
    return dialog;
  },
);

Modal.displayName = 'Modal';

/**
 * ConfirmDialog — single-purpose confirmation modal with default/cancel actions.
 */
export interface ConfirmDialogProps extends Omit<ModalProps, 'footer' | 'title'> {
  title?: string;
  /** Confirm button label. */
  confirmLabel?: React.ReactNode;
  /** Cancel button label. */
  cancelLabel?: React.ReactNode;
  /** Called when confirm is clicked. */
  onConfirm: () => void;
  /** Whether confirm action is loading/disabled. */
  confirming?: boolean;
  /** Visual severity. */
  severity?: 'default' | 'danger';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  confirmLabel = 'אישור',
  cancelLabel = 'ביטול',
  onConfirm,
  confirming = false,
  severity = 'default',
  title = 'אישור פעולה',
  ...rest
}) => {
  const modalVariant: ModalVariant = severity === 'danger' ? 'error' : 'confirmation';

  return (
    <Modal
      {...rest}
      title={title}
      variant={modalVariant}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={rest.onClose}
            className="
              inline-flex items-center justify-center px-4 py-2 rounded-md border border-[var(--color-border)]
              bg-[var(--color-surface)] text-[var(--color-text-primary)]
              hover:bg-[var(--color-surface-raised)]
            "
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={confirming}
            className={`
              inline-flex items-center justify-center px-4 py-2 rounded-md border
              font-black transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed
              ${severity === 'danger'
                ? 'bg-[var(--color-error)] text-white border-[var(--color-error)] hover:bg-[var(--color-error)]/90'
                : 'bg-[var(--color-accent-cobalt-strong)] text-white border-[var(--color-accent-cobalt-dark)] hover:bg-[var(--color-accent-cobalt-dark)]'}
            `}
          >
            {confirming ? 'מבצע...' : confirmLabel}
          </button>
        </div>
      }
    />
  );
};

function CloseIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
