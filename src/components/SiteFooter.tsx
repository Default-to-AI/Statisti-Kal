import type { ReactElement } from 'react';
import { BookOpen, Calculator, Github, Mail, Sigma } from 'lucide-react';
import type { SitePage } from './SiteHeader';

interface SiteFooterProps {
  onNavigate: (page: SitePage) => void;
}

interface FooterLink {
  label: string;
  page: SitePage;
}

const quickLinks: FooterLink[] = [
  { label: 'בדיקת השערות', page: 'hypothesis' },
  { label: 'חישובי הסתברויות', page: 'forward' },
  { label: 'אחוזונים', page: 'inverse' },
  { label: 'טבלאות', page: 'table' },
  { label: 'נוסחאות', page: 'formula-sheet' },
];

const githubUrl = 'https://github.com/Default-to-AI/statistics';

export default function SiteFooter({ onNavigate }: SiteFooterProps): ReactElement {
  return (
    <div className="grid gap-8 rounded-lg bg-[var(--color-surface)] px-5 py-6 text-right sm:px-6 lg:grid-cols-[1.25fr_1fr_1fr]">
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="rounded-sm border border-[var(--color-accent-brass)]/45 bg-[var(--color-accent-brass)]/10 p-2 text-[var(--color-accent-brass)]">
            <Sigma className="h-5 w-5" />
          </div>
          <h2 className="text-heading-section font-black text-[var(--color-text-primary)]">אודות</h2>
        </div>
        <p className="max-w-xl text-body-sm font-semibold leading-7 text-[var(--color-text-secondary)]">
          כלי אקדמי בעברית לחישובי התפלגות נורמלית, בדיקת השערות, טבלאות ונוסחאות. נבנה כדי לקצר את הדרך בין נתוני התרגיל, החישוב, וההחלטה הסטטיסטית.
        </p>
      </section>

      <nav className="space-y-3" aria-label="לינקים מהירים">
        <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
          <BookOpen className="h-4 w-4 text-[var(--color-accent-cobalt)]" />
          <h2 className="text-heading-section font-black">לינקים מהירים</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {quickLinks.map((link) => (
            <button
              key={link.page}
              type="button"
              onClick={() => onNavigate(link.page)}
              className="rounded-sm border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-right text-body-xs font-black text-[var(--color-text-secondary)] transition hover:border-[var(--color-accent-cobalt-line)] hover:text-[var(--color-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cobalt)]"
            >
              {link.label}
            </button>
          ))}
        </div>
      </nav>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
          <Calculator className="h-4 w-4 text-[var(--color-accent-teal)]" />
          <h2 className="text-heading-section font-black">מקורות וקוד</h2>
        </div>
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-sm border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-body-sm font-black text-[var(--color-text-primary)] transition hover:border-[var(--color-accent-brass)] hover:text-[var(--color-accent-brass)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-brass)]"
        >
          <Github className="h-4 w-4" />
          GitHub
        </a>
        <p className="flex items-start gap-2 text-body-xs font-semibold leading-6 text-[var(--color-text-secondary)]">
          <Mail className="mt-1 h-4 w-4 shrink-0 text-[var(--color-text-tertiary)]" />
          פרויקט לימודי עצמאי. אין להכניס נתונים אישיים או רגישים לכלי ציבורי.
        </p>
      </section>

      <div className="border-t border-[var(--color-border)] pt-4 text-body-xs font-bold text-[var(--color-text-tertiary)] lg:col-span-3">
        כל הזכויות שמורות לרוברט טייגר | המכללה האקדמית תל אביב 2026.
      </div>
    </div>
  );
}
