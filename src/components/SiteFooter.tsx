import type { ReactElement } from 'react';
import { Github, GraduationCap, ArrowUpRight } from 'lucide-react';
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
  { label: 'טבלאות Z ו-T', page: 'table' },
  { label: 'דף נוסחאות', page: 'formula-sheet' },
];

const githubUrl = 'https://github.com/Default-to-AI/statistics';

export default function SiteFooter({ onNavigate }: SiteFooterProps): ReactElement {
  return (
    <footer className="border-t border-[var(--color-border)]" dir="rtl">
      <div className="mx-auto px-5 py-10 sm:px-6">
        {/* Main grid */}
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr]">

          {/* About column */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <GraduationCap
                className="h-5 w-5 text-[var(--color-accent-brass)]"
                strokeWidth={1.6}
              />
              <span className="text-heading-section font-black text-[var(--color-text-primary)]">
                אודות
              </span>
            </div>
            <p className="max-w-sm text-body-base font-medium leading-7 text-[var(--color-text-secondary)]">
              כלי אקדמי בעברית לחישובי התפלגות נורמלית, חישובי אחוזונים,
              בדיקות השערות, וטבלאות אינטראקטיביות. נבנה כדי להציג את הדרך
              הפורמלית והנכונה לחישובים סטטיסטיים, תוך שימוש בעזרים
              ויזואליים וטקסט קריא.
            </p>
            <p className="text-body-sm font-semibold text-[var(--color-text-tertiary)]">
              פרויקט לימודי עצמאי — אין להכניס נתונים אישיים או רגישים.
            </p>
          </section>

          {/* Quick nav column */}
          <nav aria-label="ניווט מהיר" className="space-y-4">
            <h2 className="text-heading-section font-black text-[var(--color-text-primary)]">
              ניווט
            </h2>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.page}>
                  <button
                    type="button"
                    onClick={() => onNavigate(link.page)}
                    className="group flex items-center gap-1.5 text-body-base font-semibold text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-cobalt)] focus-visible:ring-offset-2"
                  >
                    <span className="inline-block h-px w-3 bg-[var(--color-border)] transition-all duration-200 group-hover:w-4 group-hover:bg-[var(--color-accent-cobalt)]" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Source / links column */}
          <section className="space-y-4">
            <h2 className="text-heading-section font-black text-[var(--color-text-primary)]">
              קוד מקור
            </h2>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 text-body-base font-semibold text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-accent-brass)]"
            >
              <Github className="h-4 w-4 shrink-0" strokeWidth={1.6} />
              GitHub
              <ArrowUpRight
                className="h-3 w-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                strokeWidth={2}
              />
            </a>
            <p className="text-body-sm font-medium leading-6 text-[var(--color-text-tertiary)]">
              קוד פתוח. הרצת חישובים מתבצעת לחלוטין בדפדפן — ללא שרת, ללא
              איסוף נתונים.
            </p>
          </section>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex items-center justify-between border-t border-[var(--color-border)] pt-5 text-body-sm font-semibold text-[var(--color-text-tertiary)]">
          <span>כל הזכויות שמורות לרוברט טייגר | המכללה האקדמית תל אביב 2026</span>
        </div>
      </div>
    </footer>
  );
}
