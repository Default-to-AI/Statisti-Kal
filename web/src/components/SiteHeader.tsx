import type { ReactElement, ReactNode } from 'react';
import { Award, BookOpen, Home, ScrollText, Sliders, TrendingUp } from 'lucide-react';

export type SitePage = 'landing' | 'hypothesis' | 'forward' | 'inverse' | 'table' | 'formula-sheet';

interface SiteHeaderProps {
  activePage: SitePage;
  onNavigate: (page: SitePage) => void;
}

interface NavItem {
  id: SitePage;
  label: string;
  icon: ReactNode;
  group: 'hypothesis' | 'calculator' | 'reference';
}

// Visual groups:
// hypothesis  → brass, bold CTA
// calculators → cobalt, interactive feel
// reference   → teal/muted, informational feel

const inverseItem: NavItem = { id: 'inverse', label: 'חישוב אחוזונים', icon: <Sliders className="h-4 w-4 shrink-0" />, group: 'calculator' };
const forwardItem: NavItem = { id: 'forward', label: 'חישובי הסתברויות', icon: <TrendingUp className="h-4 w-4 shrink-0" />, group: 'calculator' };
const hypothesisItem: NavItem = { id: 'hypothesis', label: 'בדיקת השערות', icon: <Award className="h-4 w-4 shrink-0" />, group: 'hypothesis' };
const tableItem: NavItem = { id: 'table', label: 'טבלאות התפלגות', icon: <BookOpen className="h-4 w-4 shrink-0" />, group: 'reference' };
const formulaItem: NavItem = { id: 'formula-sheet', label: 'נוסחאות', icon: <ScrollText className="h-4 w-4 shrink-0" />, group: 'reference' };

export default function SiteHeader({ activePage, onNavigate }: SiteHeaderProps): ReactElement {
  return (
    <>
      {/* 1. Logo (Because parent dir="rtl", this is on the far right) */}
      <div className="w-full text-right sm:w-auto lg:flex-1 flex md:justify-start">
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-4 text-right"
          aria-label="חזרה לדף הבית"
        >
          <div
            className="flex select-none items-center gap-4 rounded-sm border border-2 border-[rgb(240,241,245)] px-3 py-2 transition bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]"
            aria-hidden="true"
          >
            <Home className="h-6 w-6 text-[#e2e2f0]" />
          </div>
          <div>
            <h1 className="select-none text-xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-2xl">
              סטטיטי-קל
            </h1>
            <p className="mt-0.5 text-xs font-medium text-[var(--color-text-secondary)] sm:text-sm">
              סטטיסטיקה בדרך מובנת, פשוטה וברורה
            </p>
          </div>
        </button>
      </div>

      {/* 2. Navigation items (Flows right-to-left) */}
      <nav
        className="flex w-full flex-wrap lg:flex-nowrap justify-center items-center gap-1 lg:gap-2 md:w-auto lg:flex-none lg:justify-center"
        aria-label="ניווט ראשי"
      >
        <NavButton item={inverseItem} isActive={activePage === 'inverse'} onNavigate={onNavigate} />
        <NavButton item={forwardItem} isActive={activePage === 'forward'} onNavigate={onNavigate} />
        
        <Separator />
        
        <NavButton item={hypothesisItem} isActive={activePage === 'hypothesis'} onNavigate={onNavigate} />
        
        <Separator />
        
        <NavButton item={tableItem} isActive={activePage === 'table'} onNavigate={onNavigate} />
        <NavButton item={formulaItem} isActive={activePage === 'formula-sheet'} onNavigate={onNavigate} />
      </nav>

      {/* 3. Empty spacer for balanced flex layout (sits on the far left) */}
      <div className="hidden lg:block lg:flex-1" />
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Separator(): ReactElement {
  return <div className="hidden sm:block h-6 w-px bg-[var(--color-border)] mx-1" />;
}

function NavButton({
  item,
  isActive,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  onNavigate: (page: SitePage) => void;
}): ReactElement {
  return (
    <button
      key={item.id}
      type="button"
      onClick={() => onNavigate(item.id)}
      className={`flex cursor-pointer select-none items-center gap-1.5 rounded-sm border px-3 py-2 text-sm font-medium tracking-wide transition whitespace-nowrap ${getButtonClass(item.group, isActive)}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Icon first (RTL: appears on right) */}
      {item.icon}
      <span>{item.label}</span>
    </button>
  );
}

// ── Style logic per group ──────────────────────────────────────────────────────

function getButtonClass(group: NavItem['group'], isActive: boolean): string {
  if (group === 'hypothesis') {
    return isActive
      ? 'bg-[var(--color-primary)] text-[var(--color-background)] border-[var(--color-primary)] shadow-md shadow-[var(--color-primary)]/20 font-semibold'
      : 'bg-[var(--color-surface)] border-[var(--color-primary)]/45 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 font-semibold';
  }

  if (group === 'calculator') {
    return isActive
      ? 'bg-[var(--color-accent-cobalt)] text-white border-[var(--color-accent-cobalt)] shadow-md shadow-[var(--color-accent-cobalt-line)]/15'
      : 'bg-[var(--color-surface)] border-[var(--color-accent-cobalt-line)]/60 text-[var(--color-text-secondary)] hover:border-[var(--color-accent-cobalt-line)] hover:text-[var(--color-accent-cobalt)] hover:bg-[var(--color-accent-cobalt-bg)]';
  }

  return isActive
    ? 'bg-[var(--chart-2)]/15 text-[var(--chart-2)] border-[var(--chart-2)]/50 shadow-sm'
    : 'bg-transparent border-[var(--color-border)]/60 text-[var(--color-text-secondary)]/80 hover:bg-[var(--color-surface)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border)]';
}
