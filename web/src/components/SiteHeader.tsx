import type { ReactElement, ReactNode } from 'react';
import { Award, BookOpen, Home, Sliders, TrendingUp } from 'lucide-react';

export type SitePage = 'landing' | 'hypothesis' | 'forward' | 'inverse' | 'table' | 'formula-sheet';

interface SiteHeaderProps {
  activePage: SitePage;
  onNavigate: (page: SitePage) => void;
}

interface NavigationItem {
  id: SitePage;
  label: string;
  icon: ReactNode;
  accent: 'brass' | 'cobalt' | 'teal' | 'neutral';
}

const navigationItems: NavigationItem[] = [
  { id: 'hypothesis', label: 'בדיקת השערות', icon: <Award className="h-4 w-4" />, accent: 'brass' },
  { id: 'forward', label: 'חישובי הסתברויות (Z)', icon: <TrendingUp className="h-4 w-4" />, accent: 'cobalt' },
  { id: 'inverse', label: 'חישוב אחוזונים (Quantile)', icon: <Sliders className="h-4 w-4" />, accent: 'cobalt' },
  { id: 'table', label: 'טבלאות התפלגות', icon: <BookOpen className="h-4 w-4" />, accent: 'teal' },
  { id: 'formula-sheet', label: 'נוסחאות', icon: <TrendingUp className="h-4 w-4" />, accent: 'neutral' },
];

export default function SiteHeader({ activePage, onNavigate }: SiteHeaderProps): ReactElement {
  return (
    <>
      <nav className="flex w-full flex-wrap justify-center gap-1.5 md:w-auto md:justify-start" aria-label="ניווט ראשי">
        {navigationItems.map((item) => {
          const isActive = item.id === activePage;
          const activeClass = getActiveClass(item.accent);
          const inactiveClass = getInactiveClass(item.accent);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex cursor-pointer select-none items-center gap-1.5 rounded-sm border px-3.5 py-2.5 text-xs font-black tracking-wide transition sm:py-2 ${isActive ? activeClass : inactiveClass
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="w-full text-right sm:w-auto">
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-4 text-right"
          aria-label="חזרה לדף הבית"
        >
          <div>
            <h1 className="select-none text-xl font-black tracking-tight text-[var(--color-text-primary)] sm:text-2xl">
              סטטיטי-קל
            </h1>
            <p className="mt-0.5 text-xs font-medium text-[var(--color-text-secondary)] sm:text-sm">
              סטטיסטיקה בדרך מובנת, פשוטה וברורה
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="flex cursor-pointer select-none items-center gap-1.5 rounded-sm border-2 border-[rgb(240,241,245)] px-[15px] py-[17px] transition bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]"
            aria-label="דף הבית"
            title="דף הבית"
          >
            <Home className="h-8 w-8 text-[#e2e2f0] rounded-sm sm:h-8 sm:w-8" style={{ borderRadius: '4px' }} />
          </button>
        </button>
      </div>
    </>
  );
}

function getActiveClass(accent: NavigationItem['accent']): string {
  if (accent === 'brass') {
    return 'bg-[var(--color-accent-brass)] text-[var(--color-background)] border-[var(--color-accent-brass)] shadow-md shadow-[var(--color-accent-brass)]/20';
  }

  if (accent === 'teal') {
    return 'bg-[var(--color-accent-teal)] text-[var(--color-background)] border-[var(--color-accent-teal)] shadow-md shadow-[var(--color-accent-teal)]/15';
  }

  if (accent === 'neutral') {
    return 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] border-[var(--color-text-secondary)]';
  }

  return 'bg-[var(--color-accent-cobalt)] text-white border-[var(--color-accent-cobalt)] shadow-md shadow-[var(--color-accent-cobalt-line)]/10';
}

function getInactiveClass(accent: NavigationItem['accent']): string {
  if (accent === 'brass') {
    return 'bg-[var(--color-surface)] border-[var(--color-accent-brass)]/45 text-[var(--color-accent-brass)] hover:bg-[var(--color-accent-brass)]/10';
  }

  if (accent === 'neutral') {
    return 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)]';
  }

  return 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]';
}
