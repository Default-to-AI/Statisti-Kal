import type { CSSProperties, ElementType, ReactElement } from 'react';
import { FilePenLine } from 'lucide-react';
import { useReviewOverlay } from './ReviewOverlayProvider';

export function EditableText<T extends ElementType = 'span'>({
  id,
  label,
  text,
  as,
  className = '',
  dir,
}: {
  id: string;
  label: string;
  text: string;
  as?: T;
  className?: string;
  dir?: 'rtl' | 'ltr' | 'auto';
}): ReactElement {
  const {
    activeMode,
    getTextValue,
    getStyleValue,
    hasStyleEdit,
    hasTextEdit,
    openStyleEditor,
    openTextEditor,
  } = useReviewOverlay();
  const value = getTextValue(id, text);
  const edited = hasTextEdit(id);
  const styleEdited = hasStyleEdit(id);
  const Tag = (as ?? 'span') as ElementType;
  const inlineStyle = toInlineStyle(getStyleValue(id));

  return (
    <Tag
      dir={dir}
      style={inlineStyle}
      className={`relative ${className} ${
        activeMode === 'edit'
          ? `cursor-text rounded-[12px] outline outline-1 outline-offset-3 ${
              edited
                ? 'outline-[var(--color-accent-teal)]'
                : 'outline-[var(--color-accent-brass)]/80'
            }`
          : activeMode === 'style'
            ? `cursor-pointer rounded-[12px] outline outline-1 outline-offset-3 ${
                styleEdited
                  ? 'outline-[var(--color-accent-teal)]'
                  : 'outline-[var(--color-accent-cobalt-line)]/80'
              }`
          : ''
      }`}
      onClick={(event: React.MouseEvent) => {
        if (activeMode === 'edit') {
          event.preventDefault();
          event.stopPropagation();
          openTextEditor({ id, label, initialValue: text });
          return;
        }

        if (activeMode === 'style') {
          event.preventDefault();
          event.stopPropagation();
          openStyleEditor({ id, label, targetType: 'text' });
        }
      }}
      data-editable-id={id}
      data-editable-label={label}
    >
      {activeMode === 'edit' ? (
        <span className="pointer-events-none absolute -top-3 right-3 z-20 inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[rgba(13,15,20,0.94)] px-2.5 py-1 text-[10px] font-black text-[var(--color-text-primary)] shadow-[0_10px_20px_rgba(0,0,0,0.24)]">
          <FilePenLine size={10} className={edited ? 'text-[var(--color-accent-teal)]' : 'text-[var(--color-accent-brass)]'} />
          <span>{label}</span>
        </span>
      ) : null}
      {value}
    </Tag>
  );
}

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
