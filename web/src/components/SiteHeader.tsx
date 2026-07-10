import type { ReactElement, ReactNode } from 'react';
import {
  Activity,
  Award,
  BookOpen,
  Calculator,
  ClipboardList,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  Sliders,
  Scale,
  TableProperties,
  Target,
  TrendingUp,
  Wrench,
} from 'lucide-react';

export type SitePage = 'landing' | 'hypothesis' | 'point-estimation' | 'exam-2023' | 'forward' | 'inverse' | 'table' | 'formula-sheet' | 'summary' | 'regression' | 'test-yourself';

interface SiteHeaderProps {
  activePage: SitePage;
  onNavigate: (page: SitePage) => void;
}

type NavGroupId = 'calculators' | 'inference' | 'resources' | 'practice';

interface NavItem {
  id: SitePage;
  label: string;
  icon: ReactNode;
}

interface NavGroup {
  id: NavGroupId;
  label: string;
  icon: ReactNode;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: 'calculators',
    label: 'מחשבונים',
    icon: <Calculator className="h-4 w-4" />,
    items: [
      { id: 'forward', label: 'הסתברויות', icon: <TrendingUp className="h-4 w-4" /> },
      { id: 'inverse', label: 'אחוזונים', icon: <Sliders className="h-4 w-4" /> },
    ],
  },
  {
    id: 'inference',
    label: 'הסקה סטטיסטית',
    icon: <Scale className="h-4 w-4" />,
    items: [
      { id: 'hypothesis', label: 'בדיקת השערות', icon: <Award className="h-4 w-4" /> },
      { id: 'point-estimation', label: 'אמידה נקודתית', icon: <Target className="h-4 w-4" /> },
      { id: 'regression', label: 'רגרסיה', icon: <Activity className="h-4 w-4" /> },
    ],
  },
  {
    id: 'resources',
    label: 'כלי עזר',
    icon: <Wrench className="h-4 w-4" />,
    items: [
      { id: 'table', label: 'טבלאות התפלגות', icon: <TableProperties className="h-4 w-4" /> },
      { id: 'formula-sheet', label: 'דף נוסחאות', icon: <FileText className="h-4 w-4" /> },
      { id: 'summary', label: 'סיכום', icon: <BookOpen className="h-4 w-4" /> },
    ],
  },
  {
    id: 'practice',
    label: 'תרגול ובחינות',
    icon: <GraduationCap className="h-4 w-4" />,
    items: [
      { id: 'test-yourself', label: 'בחן את עצמך', icon: <HelpCircle className="h-4 w-4" /> },
      { id: 'exam-2023', label: 'מבחן 2023', icon: <ClipboardList className="h-4 w-4" /> },
    ],
  },
];

function getActiveGroup(activePage: SitePage): NavGroup | undefined {
  return navGroups.find((group) => group.items.some((item) => item.id === activePage));
}

export default function SiteHeader({ activePage, onNavigate }: SiteHeaderProps): ReactElement {
  const activeGroup = getActiveGroup(activePage);

  return (
    <div className="w-full pb-10" dir="rtl">
      <div className="flex min-h-11 items-center gap-3">
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="group flex shrink-0 cursor-pointer items-center gap-2.5 rounded-md py-1 text-right outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-brass)]"
          aria-label="חזרה לדף הבית"
        >
          <BrandMark />
          <span className="hidden sm:block leading-none">
            <span className="block font-display text-lg font-black tracking-tight text-[var(--color-text-primary)]">
              סטטיסטי<span className="text-[var(--color-accent-brass)]">־קל</span>
            </span>
            <span className="mt-1 block text-[0.58rem] font-bold tracking-[0.16em] text-[var(--color-text-secondary)]">
              STATISTICS WORKBENCH
            </span>
          </span>
        </button>

        <span className="hidden h-7 w-px bg-[var(--color-border)] md:block" aria-hidden="true" />

        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className={`hidden cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-2 text-sm font-semibold transition md:flex ${
            activePage === 'landing'
              ? 'border-[var(--color-accent-brass)]/50 bg-[var(--color-accent-cobalt-bg)] text-[var(--color-accent-brass)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface)]/65 text-[var(--color-text-secondary)] hover:border-[var(--color-accent-brass)]/45 hover:text-[var(--color-text-primary)]'
          }`}
          aria-current={activePage === 'landing' ? 'page' : undefined}
        >
          <Home className="h-4 w-4" />
          בית
        </button>

        <nav className="flex min-w-0 flex-1 items-center gap-1.5 overflow-visible max-lg:overflow-x-auto" aria-label="קטגוריות ראשיות">
          {navGroups.map((group) => {
            const isActive = group.id === activeGroup?.id;

            return (
              <div key={group.id} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate(group.items[0]!.id)}
                  className={`relative flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-brass)] ${
                    isActive
                      ? 'border-[var(--color-accent-brass)]/55 bg-[var(--color-accent-cobalt-bg)] text-[var(--color-accent-brass)]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)]/65 text-[var(--color-text-secondary)] hover:border-[var(--color-accent-brass)]/45 hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {group.icon}
                  <span>{group.label}</span>
                  {isActive && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[var(--color-accent-brass)]" />}
                </button>

                {isActive && (
                  <nav
                    className="absolute left-1/2 top-[calc(100%+0.25rem)] z-50 flex w-max -translate-x-1/2 items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]/95 p-1 shadow-[var(--shadow-elevated)] backdrop-blur-lg"
                    aria-label={activeGroup.label}
                  >
                    <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-[var(--color-border)] bg-[var(--color-background)]" aria-hidden="true" />
                    {activeGroup.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onNavigate(item.id)}
                        className={`tour-nav-${item.id} flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-brass)] ${
                          activePage === item.id
                            ? 'border-[var(--color-accent-brass)] bg-[var(--color-accent-brass)] text-[var(--color-background)] shadow-[var(--shadow-soft)]'
                            : 'border-[var(--color-border)] bg-[var(--color-surface)]/55 text-[var(--color-text-secondary)] hover:border-[var(--color-accent-brass)]/45 hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)]'
                        }`}
                        aria-current={activePage === item.id ? 'page' : undefined}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </nav>
                )}
              </div>
            );
          })}
        </nav>

      </div>

    </div>
  );
}

function BrandMark(): ReactElement {
  return (
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--color-accent-brass)]/45 bg-[var(--color-surface)] text-[var(--color-accent-brass)] transition group-hover:border-[var(--color-accent-brass)] group-hover:bg-[var(--color-accent-cobalt-bg)]">
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" aria-hidden="true">
        <path d="M3 24h26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 24c2.8 0 4.1-12 11-12s8.2 12 11 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="12" r="2" fill="currentColor" />
      </svg>
    </span>
  );
}
