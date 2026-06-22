import { useEffect, useRef, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { MessageSquare } from 'lucide-react';
import { useReviewOverlay } from './ReviewOverlayProvider';

export function ReviewTarget({
  id,
  label,
  children,
  className = '',
  element = 'div',
  editScope = false,
}: {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
  element?: 'div' | 'span';
  editScope?: boolean;
}): ReactElement {
  const {
    activeMode,
    openCommentEditor,
    openTextEditor,
    openStyleEditor,
    hasComment,
    hasStyleEdit,
    getStyleValue,
    textEdits,
    styleEdits,
  } = useReviewOverlay();
  const commented = hasComment(id);
  const styled = hasStyleEdit(id);
  const Tag = element;
  const rootRef = useRef<HTMLElement | null>(null);
  const rootStyle = toInlineStyle(getStyleValue(id));

  useEffect(() => {
    if (!editScope) {
      return;
    }

    const root = rootRef.current;
    if (!root) {
      return;
    }

    const candidates = collectEditableCandidates(root);
    for (const candidate of candidates) {
      const autoId = buildAutoEditableId(id, root, candidate);
      const originalText = candidate.dataset.reviewOriginalText ?? readElementText(candidate);
      if (!candidate.dataset.reviewOriginalText) {
        candidate.dataset.reviewOriginalText = originalText;
      }
      candidate.dataset.reviewAutoId = autoId;
      candidate.dataset.reviewAutoLabel = deriveAutoLabel(label, candidate, originalText);
      if (activeMode === 'edit' || activeMode === 'style') {
        candidate.dataset.reviewAutoEditable = 'true';
        applyAutoEditableStyles(candidate);
      } else {
        delete candidate.dataset.reviewAutoEditable;
        restoreAutoEditableStyles(candidate);
      }

      const nextText = textEdits[autoId]?.value ?? originalText;
      if (readElementText(candidate) !== nextText) {
        candidate.textContent = nextText;
      }

      applyAutoStyle(candidate, styleEdits[autoId] ?? null);
    }
  }, [activeMode, editScope, id, label, styleEdits, textEdits]);

  return (
    <Tag
      ref={(node) => {
        rootRef.current = node as HTMLElement | null;
      }}
      className={`relative ${className} ${
        activeMode === 'comment'
          ? `cursor-pointer rounded-[22px] outline outline-1 outline-offset-4 ${
              commented
                ? 'outline-[var(--color-accent-teal)]'
                : 'outline-[var(--color-accent-cobalt-line)]/80'
            }`
          : (activeMode === 'edit' || activeMode === 'style') && editScope
            ? 'rounded-[22px] outline outline-1 outline-offset-4 outline-[var(--color-accent-brass)]/40'
          : ''
      }`}
      style={rootStyle}
      onClick={(event) => {
        if (activeMode === 'comment') {
          event.preventDefault();
          event.stopPropagation();
          openCommentEditor({ id, label });
          return;
        }

        if (activeMode === 'edit' && editScope) {
          const root = rootRef.current;
          if (!root) {
            return;
          }

          const candidate = resolveEditableCandidate(event.target, root);
          if (!candidate) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();

          const autoId = candidate.dataset.reviewAutoId ?? buildAutoEditableId(id, root, candidate);
          const originalText = candidate.dataset.reviewOriginalText ?? readElementText(candidate);
          const autoLabel =
            candidate.dataset.reviewAutoLabel ?? deriveAutoLabel(label, candidate, originalText);

          openTextEditor({
            id: autoId,
            label: autoLabel,
            initialValue: originalText,
          });
          return;
        }

        if (activeMode === 'style') {
          if (editScope) {
            const root = rootRef.current;
            if (!root) {
              return;
            }

            const candidate = resolveEditableCandidate(event.target, root);
            if (candidate) {
              event.preventDefault();
              event.stopPropagation();
              openStyleEditor({
                id: candidate.dataset.reviewAutoId ?? buildAutoEditableId(id, root, candidate),
                label:
                  candidate.dataset.reviewAutoLabel ??
                  deriveAutoLabel(label, candidate, candidate.dataset.reviewOriginalText ?? readElementText(candidate)),
                targetType: 'text',
              });
              return;
            }
          }

          event.preventDefault();
          event.stopPropagation();
          openStyleEditor({ id, label, targetType: 'block' });
        }
      }}
      data-review-id={id}
      data-review-label={label}
    >
      {activeMode === 'comment' ? (
        <div className="pointer-events-none absolute right-3 top-3 z-20 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[rgba(13,15,20,0.92)] px-3 py-1 text-[11px] font-black text-[var(--color-text-primary)] shadow-[0_12px_24px_rgba(0,0,0,0.24)]">
          <MessageSquare size={12} className={commented ? 'text-[var(--color-accent-teal)]' : 'text-[var(--color-accent-cobalt)]'} />
          <span>{label}</span>
        </div>
      ) : null}
      {activeMode === 'style' ? (
        <div className="pointer-events-none absolute left-3 top-3 z-20 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[rgba(13,15,20,0.92)] px-3 py-1 text-[11px] font-black text-[var(--color-text-primary)] shadow-[0_12px_24px_rgba(0,0,0,0.24)]">
          <span className={styled ? 'text-[var(--color-accent-teal)]' : 'text-[var(--color-accent-brass)]'}>Style</span>
          <span>{label}</span>
        </div>
      ) : null}
      {children}
    </Tag>
  );
}

const EDITABLE_TAGS = new Set([
  'P',
  'SPAN',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'BUTTON',
  'A',
  'LI',
  'DT',
  'DD',
  'LABEL',
  'SMALL',
  'STRONG',
  'EM',
  'DIV',
]);

function collectEditableCandidates(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('*')).filter((element) =>
    isEditableCandidate(element, root),
  );
}

function resolveEditableCandidate(target: EventTarget | null, root: HTMLElement): HTMLElement | null {
  let current = target instanceof HTMLElement ? target : null;

  while (current && current !== root) {
    if (isEditableCandidate(current, root)) {
      return current;
    }
    current = current.parentElement;
  }

  return isEditableCandidate(root, root) ? root : null;
}

function isEditableCandidate(element: HTMLElement, root: HTMLElement): boolean {
  if (!root.contains(element)) {
    return false;
  }

  if (!EDITABLE_TAGS.has(element.tagName)) {
    return false;
  }

  if (element.dataset.editableId || element.dataset.reviewAutoEditable === 'ignore') {
    return false;
  }

  if (element.closest('[data-editable-id]') && !element.dataset.editableId) {
    return false;
  }

  const text = readElementText(element);
  if (!text) {
    return false;
  }

  const childElements = Array.from(element.children) as HTMLElement[];
  if (childElements.length > 0 && !childElements.every((child) => child.tagName === 'BR')) {
    return false;
  }

  return true;
}

function readElementText(element: HTMLElement): string {
  return (element.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function buildAutoEditableId(scopeId: string, root: HTMLElement, element: HTMLElement): string {
  const path: number[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== root) {
    const parent = current.parentElement;
    if (!parent) {
      break;
    }
    const index = Array.from(parent.children).indexOf(current);
    path.unshift(index);
    current = parent;
  }

  return `${scopeId}::${path.join('.')}`;
}

function deriveAutoLabel(scopeLabel: string, element: HTMLElement, text: string): string {
  const explicit = element.getAttribute('aria-label') ?? element.dataset.reviewLabel;
  if (explicit) {
    return explicit;
  }

  const snippet = text.length > 28 ? `${text.slice(0, 28)}...` : text;
  return `${scopeLabel} · ${snippet}`;
}

function applyAutoEditableStyles(element: HTMLElement): void {
  if (!element.dataset.reviewPrevOutline) {
    element.dataset.reviewPrevOutline = element.style.outline || '__empty__';
    element.dataset.reviewPrevOutlineOffset = element.style.outlineOffset || '__empty__';
    element.dataset.reviewPrevCursor = element.style.cursor || '__empty__';
  }

  element.style.outline = '1px dashed rgba(212, 168, 67, 0.7)';
  element.style.outlineOffset = '3px';
  element.style.cursor = 'text';
}

function restoreAutoEditableStyles(element: HTMLElement): void {
  element.style.outline = element.dataset.reviewPrevOutline === '__empty__' ? '' : (element.dataset.reviewPrevOutline ?? '');
  element.style.outlineOffset =
    element.dataset.reviewPrevOutlineOffset === '__empty__' ? '' : (element.dataset.reviewPrevOutlineOffset ?? '');
  element.style.cursor = element.dataset.reviewPrevCursor === '__empty__' ? '' : (element.dataset.reviewPrevCursor ?? '');
}

function applyAutoStyle(element: HTMLElement, entry: { [key: string]: string | undefined } | null): void {
  storeInitialStyleValue(element, 'fontSize');
  storeInitialStyleValue(element, 'fontWeight');
  storeInitialStyleValue(element, 'color');
  storeInitialStyleValue(element, 'backgroundColor');
  storeInitialStyleValue(element, 'borderColor');
  storeInitialStyleValue(element, 'borderWidth');
  storeInitialStyleValue(element, 'borderRadius');
  storeInitialStyleValue(element, 'padding');

  element.style.fontSize = entry?.fontSize ?? readStoredStyleValue(element, 'fontSize');
  element.style.fontWeight = entry?.fontWeight ?? readStoredStyleValue(element, 'fontWeight');
  element.style.color = entry?.color ?? readStoredStyleValue(element, 'color');
  element.style.backgroundColor = entry?.backgroundColor ?? readStoredStyleValue(element, 'backgroundColor');
  element.style.borderColor = entry?.borderColor ?? readStoredStyleValue(element, 'borderColor');
  element.style.borderWidth = entry?.borderWidth ?? readStoredStyleValue(element, 'borderWidth');
  element.style.borderRadius = entry?.borderRadius ?? readStoredStyleValue(element, 'borderRadius');
  element.style.padding = entry?.padding ?? readStoredStyleValue(element, 'padding');
}

function storeInitialStyleValue(element: HTMLElement, key: StylePropKey): void {
  const datasetKey = styleDatasetKey(key);
  if (element.dataset[datasetKey] !== undefined) {
    return;
  }
  const currentValue = element.style[key];
  element.dataset[datasetKey] = currentValue || '__empty__';
}

function readStoredStyleValue(element: HTMLElement, key: StylePropKey): string {
  const value = element.dataset[styleDatasetKey(key)];
  return value === '__empty__' || value === undefined ? '' : value;
}

function styleDatasetKey(key: StylePropKey): string {
  return `reviewOrig${key.charAt(0).toUpperCase()}${key.slice(1)}` as const;
}

type StylePropKey =
  | 'fontSize'
  | 'fontWeight'
  | 'color'
  | 'backgroundColor'
  | 'borderColor'
  | 'borderWidth'
  | 'borderRadius'
  | 'padding';

function toInlineStyle(entry: {
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  padding?: string;
} | null): CSSProperties | undefined {
  if (!entry) {
    return undefined;
  }

  return {
    fontSize: entry.fontSize,
    fontWeight: entry.fontWeight,
    color: entry.color,
    backgroundColor: entry.backgroundColor,
    borderColor: entry.borderColor,
    borderWidth: entry.borderWidth,
    borderRadius: entry.borderRadius,
    padding: entry.padding,
  };
}
