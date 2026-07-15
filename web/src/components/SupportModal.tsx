import type { ReactElement } from 'react';
import { Modal } from './ui/Modal';
import { Heart, ExternalLink } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Override the Buy Me a Coffee username for this modal instance.
   * Defaults to `import.meta.env.VITE_BMC_USERNAME`, then to the
   * `DEFAULT_BMC_USERNAME` placeholder. Edit the placeholder (or set
   * the env var) before deploying.
   */
  username?: string;
}

const DEFAULT_BMC_USERNAME = 'statistikal';

export default function SupportModal({ isOpen, onClose, username }: SupportModalProps): ReactElement {
  const handle = username ?? import.meta.env.VITE_BMC_USERNAME ?? DEFAULT_BMC_USERNAME;
  // Widget URL — BMC's stripped-down donation card. More uniform height than the
  // full profile page, so the modal feels less likely to scroll internally.
  const widgetUrl = `https://www.buymeacoffee.com/widget.page?id=${encodeURIComponent(handle)}`;
  // Profile URL — used as the fallback for users who cannot render the iframe
  // (ad-blockers, corporate firewalls).
  const profileUrl = `https://www.buymeacoffee.com/${encodeURIComponent(handle)}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="תמיכה בפרויקט"
      description="Statisti-Kal נשאר חינמי לסטודנטים בזכות תרומות סמליות של הקהילה"
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-body-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-cobalt)] focus-visible:ring-offset-2"
          >
            <span>פתיחה ב-tab חדש</span>
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-body-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-cobalt)] focus-visible:ring-offset-2"
          >
            סגירה
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-body-base font-medium leading-7 text-[var(--color-text-primary)]">
          Statisti-Kal הוא מוצר{` `}
          <strong className="font-bold text-[var(--color-accent-brass)]">חינמי לגמרי</strong>
          {` `}— בלי פרסומות, בלי מנויים, ובלי מעקב שיווקי. אם הוא עזר לך לפתור
          תרגיל, להכין מבחן, או להבין שלב בדרך — אפשר להזמין כוס קפה למי שמתחזק
          את הכלי. כל סכום, גם קטן, עוזר להמשיך להוסיף שאלות מבחן בעברית
          ולהרחיב את התמיכה במחשבונים הנוספים.
        </p>

        {/*
          BMC iframe inside a dir=ltr wrapper is intentional: BMC's hosted page is
          English/LTR, and an iframe is already an isolated browsing context per
          HTML5, so we just make the isolation explicit at the wrapper.
        */}
        <div
          dir="ltr"
          className="overflow-hidden rounded-[var(--rounded-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)]"
        >
          <iframe
            title="Buy Me a Coffee — תמיכה ב-Statisti-Kal"
            src={widgetUrl}
            className="min-h-[600px] w-full"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            style={{ border: '0' }}
          />
        </div>

        <p className="flex items-center gap-2 text-body-sm font-semibold text-[var(--color-text-secondary)]">
          <Heart
            className="h-4 w-4 shrink-0 text-[var(--color-accent-brass)]"
            strokeWidth={1.8}
            aria-hidden="true"
          />
          תודה רבה על כל תרומה — וגם אם לא מצאת סכום מתאים: שיתוף הפרויקט
          בקבוצה של חברים לסטודנטים הוא תרומה משמעותית בפני עצמה.
        </p>

        <p className="border-t border-[var(--color-border)] pt-3 text-caption font-semibold tracking-wide text-[var(--color-text-tertiary)]">
          אם ה-iframe לא נטען (חוסם-פרסומות / חומת חברה / רשת אוניברסיטאית
          שמסננת), ניתן{` `}
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="underline underline-offset-2 hover:text-[var(--color-accent-cobalt)]"
          >
            לפתוח את דף התרומה של Buy Me a Coffee ישירות
          </a>
          .
        </p>
      </div>
    </Modal>
  );
}
