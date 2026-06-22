import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { ClipboardCopy, FileJson, FilePenLine, MessageSquare, Paintbrush, Trash2, X } from 'lucide-react';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import type {
  ReviewCommentEntry,
  ReviewMode,
  ReviewStorageShape,
  ReviewStyleEntry,
  ReviewStyleTargetType,
  ReviewTargetRecord,
} from './types';

type ActiveTextTarget = ReviewTargetRecord & {
  initialValue: string;
};

type ActiveStyleTarget = ReviewTargetRecord & {
  targetType: ReviewStyleTargetType;
};

type StyleDraft = {
  fontSize: string;
  fontWeight: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: string;
  borderRadius: string;
  padding: string;
};

type ReviewOverlayContextValue = {
  activeMode: ReviewMode;
  setActiveMode: (mode: ReviewMode) => void;
  openCommentEditor: (target: ReviewTargetRecord) => void;
  openTextEditor: (target: ActiveTextTarget) => void;
  openStyleEditor: (target: ActiveStyleTarget) => void;
  getComment: (id: string) => string;
  hasComment: (id: string) => boolean;
  getTextValue: (id: string, fallback: string) => string;
  hasTextEdit: (id: string) => boolean;
  getStyleValue: (id: string) => ReviewStyleEntry | null;
  hasStyleEdit: (id: string) => boolean;
  textEdits: ReviewStorageShape['textEdits'];
  styleEdits: ReviewStorageShape['styleEdits'];
};

const ReviewOverlayContext = createContext<ReviewOverlayContextValue | null>(null);

const DEFAULT_STORAGE_KEY = 'review_overlay_v1';

const EMPTY_STYLE_DRAFT: StyleDraft = {
  fontSize: '',
  fontWeight: '',
  color: '',
  backgroundColor: '',
  borderColor: '',
  borderWidth: '',
  borderRadius: '',
  padding: '',
};

export function ReviewOverlayProvider({
  children,
  storageKey = DEFAULT_STORAGE_KEY,
}: {
  children: ReactNode;
  storageKey?: string;
}): ReactElement {
  const [activeMode, setActiveMode] = useState<ReviewMode>(null);
  const [rawStorage, setStorage] = useLocalStorageState<ReviewStorageShape | Record<string, ReviewCommentEntry>>(
    storageKey,
    {
      comments: {},
      textEdits: {},
      styleEdits: {},
    },
  );
  const storage = useMemo(() => normalizeStorageShape(rawStorage), [rawStorage]);
  const [activeCommentTarget, setActiveCommentTarget] = useState<ReviewTargetRecord | null>(null);
  const [draftComment, setDraftComment] = useState('');
  const [activeTextTarget, setActiveTextTarget] = useState<ActiveTextTarget | null>(null);
  const [draftText, setDraftText] = useState('');
  const [activeStyleTarget, setActiveStyleTarget] = useState<ActiveStyleTarget | null>(null);
  const [styleDraft, setStyleDraft] = useState<StyleDraft>(EMPTY_STYLE_DRAFT);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const commentList = useSortedEntries(storage.comments);
  const textEditList = useSortedEntries(storage.textEdits);
  const styleEditList = useSortedEntries(storage.styleEdits);
  const exportPayload = useMemo(() => JSON.stringify(storage, null, 2), [storage]);

  const value = useMemo<ReviewOverlayContextValue>(
    () => ({
      activeMode,
      setActiveMode,
      openCommentEditor: (target) => {
        setActiveCommentTarget(target);
        setDraftComment(storage.comments[target.id]?.comment ?? '');
      },
      openTextEditor: (target) => {
        setActiveTextTarget(target);
        setDraftText(storage.textEdits[target.id]?.value ?? target.initialValue);
      },
      openStyleEditor: (target) => {
        setActiveStyleTarget(target);
        setStyleDraft(entryToDraft(storage.styleEdits[target.id] ?? null));
      },
      getComment: (id) => storage.comments[id]?.comment ?? '',
      hasComment: (id) => Boolean(storage.comments[id]?.comment.trim()),
      getTextValue: (id, fallback) => storage.textEdits[id]?.value ?? fallback,
      hasTextEdit: (id) => Boolean(storage.textEdits[id]?.value.trim()),
      getStyleValue: (id) => storage.styleEdits[id] ?? null,
      hasStyleEdit: (id) => Boolean(storage.styleEdits[id]),
      textEdits: storage.textEdits,
      styleEdits: storage.styleEdits,
    }),
    [activeMode, storage.comments, storage.styleEdits, storage.textEdits],
  );

  const clearComments = () => {
    setStorage((current) => ({
      ...normalizeStorageShape(current),
      comments: {},
    }));
    setActiveCommentTarget(null);
    setDraftComment('');
  };

  const clearTextEdits = () => {
    setStorage((current) => ({
      ...normalizeStorageShape(current),
      textEdits: {},
    }));
    setActiveTextTarget(null);
    setDraftText('');
  };

  const clearStyleEdits = () => {
    setStorage((current) => ({
      ...normalizeStorageShape(current),
      styleEdits: {},
    }));
    setActiveStyleTarget(null);
    setStyleDraft(EMPTY_STYLE_DRAFT);
  };

  const removeComment = (id: string) => {
    setStorage((current) => {
      const normalized = normalizeStorageShape(current);
      return {
        ...normalized,
        comments: omitEntry(normalized.comments, id),
      };
    });
  };

  const removeTextEdit = (id: string) => {
    setStorage((current) => {
      const normalized = normalizeStorageShape(current);
      return {
        ...normalized,
        textEdits: omitEntry(normalized.textEdits, id),
      };
    });
  };

  const removeStyleEdit = (id: string) => {
    setStorage((current) => {
      const normalized = normalizeStorageShape(current);
      return {
        ...normalized,
        styleEdits: omitEntry(normalized.styleEdits, id),
      };
    });
  };

  const saveComment = () => {
    if (!activeCommentTarget) {
      return;
    }

    const nextComment = draftComment.trim();

    setStorage((current) => {
      const normalized = normalizeStorageShape(current);
      return {
        ...normalized,
        comments: nextComment
          ? {
              ...normalized.comments,
              [activeCommentTarget.id]: {
                id: activeCommentTarget.id,
                label: activeCommentTarget.label,
                comment: nextComment,
                updatedAt: new Date().toISOString(),
              },
            }
          : omitEntry(normalized.comments, activeCommentTarget.id),
      };
    });

    setActiveCommentTarget(null);
    setDraftComment('');
  };

  const saveTextEdit = () => {
    if (!activeTextTarget) {
      return;
    }

    const nextValue = draftText.trim();

    setStorage((current) => {
      const normalized = normalizeStorageShape(current);
      return {
        ...normalized,
        textEdits: nextValue
          ? {
              ...normalized.textEdits,
              [activeTextTarget.id]: {
                id: activeTextTarget.id,
                label: activeTextTarget.label,
                value: nextValue,
                updatedAt: new Date().toISOString(),
              },
            }
          : omitEntry(normalized.textEdits, activeTextTarget.id),
      };
    });

    setActiveTextTarget(null);
    setDraftText('');
  };

  const saveStyleEdit = () => {
    if (!activeStyleTarget) {
      return;
    }

    const nextStyle = draftToStyleEntry(styleDraft, activeStyleTarget);

    setStorage((current) => {
      const normalized = normalizeStorageShape(current);
      return {
        ...normalized,
        styleEdits: nextStyle
          ? {
              ...normalized.styleEdits,
              [activeStyleTarget.id]: nextStyle,
            }
          : omitEntry(normalized.styleEdits, activeStyleTarget.id),
      };
    });

    setActiveStyleTarget(null);
    setStyleDraft(EMPTY_STYLE_DRAFT);
  };

  const modeCount = getModeCount(activeMode, commentList.length, textEditList.length, styleEditList.length);

  const handleCopyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportPayload);
    } catch {
      // Best effort only; modal keeps payload visible for manual copy.
    }
  };

  return (
    <ReviewOverlayContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed bottom-5 left-5 z-[60] flex max-w-[420px] flex-col items-start gap-3">
        <div className="pointer-events-auto flex flex-wrap items-center gap-3 rounded-[20px] border border-[var(--color-border)] bg-[rgba(13,15,20,0.92)] px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur">
          <ModeButton
            isActive={activeMode === 'comment'}
            icon={<MessageSquare size={16} />}
            label="מצב הערות"
            onClick={() => setActiveMode(activeMode === 'comment' ? null : 'comment')}
          />
          <ModeButton
            isActive={activeMode === 'edit'}
            icon={<FilePenLine size={16} />}
            label="מצב Edit"
            onClick={() => setActiveMode(activeMode === 'edit' ? null : 'edit')}
          />
          <ModeButton
            isActive={activeMode === 'style'}
            icon={<Paintbrush size={16} />}
            label="מצב Style"
            onClick={() => setActiveMode(activeMode === 'style' ? null : 'style')}
          />
          <Badge variant="neutral" size="sm">
            {modeCount} {getModeCountLabel(activeMode)}
          </Badge>
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-body-xs font-black text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-accent-cobalt-line)]"
          >
            <FileJson size={14} />
            ייצא JSON
          </button>
        </div>

        {activeMode ? (
          <div className="pointer-events-auto w-full rounded-[24px] border border-[var(--color-border)] bg-[rgba(20,23,31,0.96)] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-heading-section font-black text-[var(--color-text-primary)]">
                  {getPanelTitle(activeMode)}
                </div>
                <p className="mt-1 text-body-xs font-semibold text-[var(--color-text-secondary)]">
                  {getPanelDescription(activeMode)}
                </p>
              </div>
              {modeCount ? (
                <button
                  type="button"
                  onClick={getClearHandler(activeMode, clearComments, clearTextEdits, clearStyleEdits)}
                  className="rounded-full border border-[var(--color-border)] p-2 text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent-crimson)]"
                  aria-label={getClearLabel(activeMode)}
                >
                  <Trash2 size={15} />
                </button>
              ) : null}
            </div>

            <div className="mt-4 max-h-[280px] space-y-3 overflow-y-auto pr-1">
              {activeMode === 'comment' ? <CommentList entries={commentList} onRemove={removeComment} /> : null}
              {activeMode === 'edit' ? <TextEditList entries={textEditList} onRemove={removeTextEdit} /> : null}
              {activeMode === 'style' ? <StyleEditList entries={styleEditList} onRemove={removeStyleEdit} /> : null}
            </div>
          </div>
        ) : null}
      </div>

      <Modal
        isOpen={Boolean(activeCommentTarget)}
        onClose={() => {
          setActiveCommentTarget(null);
          setDraftComment('');
        }}
        title={activeCommentTarget ? `הערה עבור: ${activeCommentTarget.label}` : 'הערה'}
        description="כתוב מה לשנות, להסיר או לחדד. ההערה תישמר מקומית ותישאר קשורה לאלמנט שבחרת."
        size="md"
        footer={
          <EditorFooter
            hint="מחיקה של הטקסט תשאיר את האלמנט בלי הערה."
            onCancel={() => {
              setActiveCommentTarget(null);
              setDraftComment('');
            }}
            onSave={saveComment}
            saveLabel="שמור הערה"
          />
        }
      >
        <label className="block">
          <span className="mb-2 block text-body-sm font-black text-[var(--color-text-primary)]">התגובה שלך</span>
          <textarea
            data-autofocus="true"
            dir="rtl"
            value={draftComment}
            onChange={(event) => setDraftComment(event.target.value)}
            rows={7}
            className="w-full rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-body-sm font-semibold text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent-cobalt-line)]"
            placeholder="לדוגמה: למחוק את הכרטיס, לחזק את ההיררכיה, לשנות spacing, להחליף תמונה..."
          />
        </label>
      </Modal>

      <Modal
        isOpen={Boolean(activeTextTarget)}
        onClose={() => {
          setActiveTextTarget(null);
          setDraftText('');
        }}
        title={activeTextTarget ? `עריכת טקסט: ${activeTextTarget.label}` : 'עריכת טקסט'}
        description="MVP של Edit Mode: משנה טקסטים מקומית בלי לגעת עדיין במבנה, layout או תמונות."
        size="md"
        footer={
          <EditorFooter
            hint="ריק יחזיר את האלמנט לטקסט המקורי שלו."
            onCancel={() => {
              setActiveTextTarget(null);
              setDraftText('');
            }}
            onSave={saveTextEdit}
            saveLabel="שמור טקסט"
          />
        }
      >
        <label className="block">
          <span className="mb-2 block text-body-sm font-black text-[var(--color-text-primary)]">הטקסט החדש</span>
          <textarea
            data-autofocus="true"
            dir="rtl"
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            rows={6}
            className="w-full rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-body-sm font-semibold text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent-teal)]"
            placeholder="הכנס כאן את הנוסח החדש..."
          />
        </label>
      </Modal>

      <Modal
        isOpen={Boolean(activeStyleTarget)}
        onClose={() => {
          setActiveStyleTarget(null);
          setStyleDraft(EMPTY_STYLE_DRAFT);
        }}
        title={activeStyleTarget ? `עריכת סגנון: ${activeStyleTarget.label}` : 'עריכת סגנון'}
        description="Style Mode בסיסי: גודל, הדגשה, צבעים, גבולות ופדינג. הערכים נשמרים מקומית כחלק מה-review payload."
        size="md"
        footer={
          <EditorFooter
            hint="השאר שדה ריק כדי לא להחיל override על אותו מאפיין."
            onCancel={() => {
              setActiveStyleTarget(null);
              setStyleDraft(EMPTY_STYLE_DRAFT);
            }}
            onSave={saveStyleEdit}
            saveLabel="שמור סגנון"
          />
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <StyleInput
            label="גודל טקסט"
            value={styleDraft.fontSize}
            onChange={(value) => setStyleDraft((current) => ({ ...current, fontSize: value }))}
            placeholder="32px / 2.4rem"
          />
          <StyleSelect
            label="הדגשה"
            value={styleDraft.fontWeight}
            onChange={(value) => setStyleDraft((current) => ({ ...current, fontWeight: value }))}
            options={['', '400', '500', '600', '700', '800', '900']}
          />
          <StyleInput
            label="צבע טקסט"
            value={styleDraft.color}
            onChange={(value) => setStyleDraft((current) => ({ ...current, color: value }))}
            placeholder="#ffffff / var(--color-text-primary)"
          />
          <StyleInput
            label="צבע רקע"
            value={styleDraft.backgroundColor}
            onChange={(value) => setStyleDraft((current) => ({ ...current, backgroundColor: value }))}
            placeholder="#10131a / rgba(...)"
          />
          <StyleInput
            label="צבע גבול"
            value={styleDraft.borderColor}
            onChange={(value) => setStyleDraft((current) => ({ ...current, borderColor: value }))}
            placeholder="#d4a843"
          />
          <StyleInput
            label="עובי גבול"
            value={styleDraft.borderWidth}
            onChange={(value) => setStyleDraft((current) => ({ ...current, borderWidth: value }))}
            placeholder="1px / 2px"
          />
          <StyleInput
            label="עיגול פינות"
            value={styleDraft.borderRadius}
            onChange={(value) => setStyleDraft((current) => ({ ...current, borderRadius: value }))}
            placeholder="12px / 1rem"
          />
          <StyleInput
            label="Padding"
            value={styleDraft.padding}
            onChange={(value) => setStyleDraft((current) => ({ ...current, padding: value }))}
            placeholder="12px / 8px 16px"
          />
        </div>
      </Modal>

      <Modal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Review Payload"
        description="זה ה-JSON המלא של הערות, עריכות טקסט ועריכות סגנון. אפשר להעתיק ולהדביק לי כאן."
        size="lg"
        footer={
          <div className="flex items-center justify-between gap-3">
            <div className="text-body-xs font-semibold text-[var(--color-text-secondary)]">
              שמירה היא מקומית לדפדפן הזה עד שתחליט לייצא או למחוק.
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsExportOpen(false)}>
                סגור
              </Button>
              <Button type="button" onClick={handleCopyExport} rightIcon={<ClipboardCopy size={15} />}>
                העתק JSON
              </Button>
            </div>
          </div>
        }
      >
        <textarea
          data-autofocus="true"
          readOnly
          value={exportPayload}
          rows={18}
          className="w-full rounded-[18px] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 font-mono text-[13px] leading-6 text-[var(--color-text-primary)] outline-none"
        />
      </Modal>
    </ReviewOverlayContext.Provider>
  );
}

function normalizeStorageShape(
  input: ReviewStorageShape | Record<string, ReviewCommentEntry>,
): ReviewStorageShape {
  if (isReviewStorageShape(input)) {
    return {
      comments: input.comments ?? {},
      textEdits: input.textEdits ?? {},
      styleEdits: input.styleEdits ?? {},
    };
  }

  return {
    comments: input,
    textEdits: {},
    styleEdits: {},
  };
}

function isReviewStorageShape(
  input: ReviewStorageShape | Record<string, ReviewCommentEntry>,
): input is ReviewStorageShape {
  return 'comments' in input && 'textEdits' in input;
}

export function useReviewOverlay(): ReviewOverlayContextValue {
  const context = useContext(ReviewOverlayContext);
  if (!context) {
    throw new Error('useReviewOverlay must be used within ReviewOverlayProvider');
  }
  return context;
}

function entryToDraft(entry: ReviewStyleEntry | null): StyleDraft {
  return {
    fontSize: entry?.fontSize ?? '',
    fontWeight: entry?.fontWeight ?? '',
    color: entry?.color ?? '',
    backgroundColor: entry?.backgroundColor ?? '',
    borderColor: entry?.borderColor ?? '',
    borderWidth: entry?.borderWidth ?? '',
    borderRadius: entry?.borderRadius ?? '',
    padding: entry?.padding ?? '',
  };
}

function draftToStyleEntry(
  draft: StyleDraft,
  target: ActiveStyleTarget,
): ReviewStyleEntry | null {
  const hasValue = Object.values(draft).some((value) => value.trim());
  if (!hasValue) {
    return null;
  }

  return {
    id: target.id,
    label: target.label,
    targetType: target.targetType,
    fontSize: emptyToUndefined(draft.fontSize),
    fontWeight: emptyToUndefined(draft.fontWeight),
    color: emptyToUndefined(draft.color),
    backgroundColor: emptyToUndefined(draft.backgroundColor),
    borderColor: emptyToUndefined(draft.borderColor),
    borderWidth: emptyToUndefined(draft.borderWidth),
    borderRadius: emptyToUndefined(draft.borderRadius),
    padding: emptyToUndefined(draft.padding),
    updatedAt: new Date().toISOString(),
  };
}

function emptyToUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function getModeCount(
  activeMode: ReviewMode,
  commentCount: number,
  textCount: number,
  styleCount: number,
): number {
  if (activeMode === 'comment') return commentCount;
  if (activeMode === 'edit') return textCount;
  if (activeMode === 'style') return styleCount;
  return commentCount + textCount + styleCount;
}

function getModeCountLabel(activeMode: ReviewMode): string {
  if (activeMode === 'comment') return 'הערות';
  if (activeMode === 'edit') return 'שינויי טקסט';
  if (activeMode === 'style') return 'שינויי סגנון';
  return 'פריטים';
}

function getPanelTitle(activeMode: ReviewMode): string {
  if (activeMode === 'comment') return 'הערות על אלמנטים';
  if (activeMode === 'edit') return 'עריכות טקסט';
  return 'עריכות סגנון';
}

function getPanelDescription(activeMode: ReviewMode): string {
  if (activeMode === 'comment') {
    return 'לחץ על בלוק ממוסגר כדי להוסיף הערה. הכל נשמר מקומית בדפדפן הזה.';
  }

  if (activeMode === 'edit') {
    return 'לחץ על טקסט ממוסגר כדי לערוך אותו מקומית. מתאים לכותרות, פסקאות, כפתורים וטקסטים פנימיים.';
  }

  return 'לחץ על רכיב או טקסט כדי לשנות גודל, הדגשה, גבולות, padding וצבעים. זה MVP בסיסי לרכיבים.';
}

function getClearHandler(
  activeMode: ReviewMode,
  clearComments: () => void,
  clearTextEdits: () => void,
  clearStyleEdits: () => void,
): () => void {
  if (activeMode === 'comment') return clearComments;
  if (activeMode === 'edit') return clearTextEdits;
  return clearStyleEdits;
}

function getClearLabel(activeMode: ReviewMode): string {
  if (activeMode === 'comment') return 'מחק את כל ההערות';
  if (activeMode === 'edit') return 'אפס את כל עריכות הטקסט';
  return 'אפס את כל עריכות הסגנון';
}

function useSortedEntries<T extends { updatedAt: string }>(entries: Record<string, T>): T[] {
  return useMemo(
    () =>
      Object.values(entries).sort(
        (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      ),
    [entries],
  );
}

function omitEntry<T>(record: Record<string, T>, keyToOmit: string): Record<string, T> {
  const { [keyToOmit]: _removed, ...rest } = record;
  return rest;
}

function ModeButton({
  isActive,
  icon,
  label,
  onClick,
}: {
  isActive: boolean;
  icon: ReactElement;
  label: string;
  onClick: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-body-sm font-black transition-colors ${
        isActive
          ? 'border-[var(--color-accent-teal)] bg-[rgba(46,196,182,0.14)] text-[var(--color-accent-teal)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function EditorFooter({
  hint,
  onCancel,
  onSave,
  saveLabel,
}: {
  hint: string;
  onCancel: () => void;
  onSave: () => void;
  saveLabel: string;
}): ReactElement {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="text-body-xs font-semibold text-[var(--color-text-secondary)]">{hint}</div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          ביטול
        </Button>
        <Button type="button" onClick={onSave}>
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}

function StyleInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}): ReactElement {
  return (
    <label className="block">
      <span className="mb-2 block text-body-xs font-black text-[var(--color-text-primary)]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[14px] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-body-sm font-semibold text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent-brass)]"
        placeholder={placeholder}
      />
    </label>
  );
}

function StyleSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}): ReactElement {
  return (
    <label className="block">
      <span className="mb-2 block text-body-xs font-black text-[var(--color-text-primary)]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[14px] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-body-sm font-semibold text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-accent-brass)]"
      >
        {options.map((option) => (
          <option key={option || 'empty'} value={option}>
            {option || 'ללא override'}
          </option>
        ))}
      </select>
    </label>
  );
}

function CommentList({
  entries,
  onRemove,
}: {
  entries: ReviewCommentEntry[];
  onRemove: (id: string) => void;
}): ReactElement {
  if (!entries.length) {
    return <EmptyPanelText text="עדיין אין הערות. תדליק מצב הערות ותלחץ על רכיב רלוונטי." />;
  }

  return (
    <>
      {entries.map((entry) => (
        <PanelListItem
          key={entry.id}
          title={entry.label}
          body={entry.comment}
          onRemove={() => onRemove(entry.id)}
          removeLabel={`מחק הערה עבור ${entry.label}`}
        />
      ))}
    </>
  );
}

function TextEditList({
  entries,
  onRemove,
}: {
  entries: Array<{ id: string; label: string; value: string }>;
  onRemove: (id: string) => void;
}): ReactElement {
  if (!entries.length) {
    return <EmptyPanelText text="עדיין אין עריכות. תדליק מצב Edit ותלחץ על טקסט ממוסגר." />;
  }

  return (
    <>
      {entries.map((entry) => (
        <PanelListItem
          key={entry.id}
          title={entry.label}
          body={entry.value}
          onRemove={() => onRemove(entry.id)}
          removeLabel={`מחק עריכה עבור ${entry.label}`}
        />
      ))}
    </>
  );
}

function StyleEditList({
  entries,
  onRemove,
}: {
  entries: ReviewStyleEntry[];
  onRemove: (id: string) => void;
}): ReactElement {
  if (!entries.length) {
    return <EmptyPanelText text="עדיין אין עריכות סגנון. תדליק מצב Style ותלחץ על טקסט או רכיב." />;
  }

  return (
    <>
      {entries.map((entry) => (
        <PanelListItem
          key={entry.id}
          title={`${entry.label} · ${entry.targetType === 'text' ? 'טקסט' : 'רכיב'}`}
          body={summarizeStyleEntry(entry)}
          onRemove={() => onRemove(entry.id)}
          removeLabel={`מחק סגנון עבור ${entry.label}`}
        />
      ))}
    </>
  );
}

function summarizeStyleEntry(entry: ReviewStyleEntry): string {
  const parts = [
    entry.fontSize ? `font-size: ${entry.fontSize}` : null,
    entry.fontWeight ? `font-weight: ${entry.fontWeight}` : null,
    entry.color ? `color: ${entry.color}` : null,
    entry.backgroundColor ? `background: ${entry.backgroundColor}` : null,
    entry.borderColor ? `border-color: ${entry.borderColor}` : null,
    entry.borderWidth ? `border-width: ${entry.borderWidth}` : null,
    entry.borderRadius ? `radius: ${entry.borderRadius}` : null,
    entry.padding ? `padding: ${entry.padding}` : null,
  ].filter(Boolean);

  return parts.join(' | ');
}

function PanelListItem({
  title,
  body,
  onRemove,
  removeLabel,
}: {
  title: string;
  body: string;
  onRemove: () => void;
  removeLabel: string;
}): ReactElement {
  return (
    <div className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-body-sm font-black text-[var(--color-text-primary)]">{title}</div>
          <div className="mt-1 whitespace-pre-wrap text-body-xs font-semibold text-[var(--color-text-secondary)]">
            {body}
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full border border-[var(--color-border)] p-1.5 text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent-crimson)]"
          aria-label={removeLabel}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function EmptyPanelText({ text }: { text: string }): ReactElement {
  return (
    <div className="rounded-[18px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/55 p-4 text-body-sm font-semibold text-[var(--color-text-secondary)]">
      {text}
    </div>
  );
}
