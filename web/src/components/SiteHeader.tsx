import { useState, type ReactElement } from 'react';
import {
  Activity,
  Award,
  BookOpen,
  Calculator,
  ChevronDown,
  ClipboardList,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  Menu as MenuIcon,
  Scale,
  Sliders,
  TableProperties,
  Target,
  TrendingUp,
  Wrench,
  X,
} from 'lucide-react';
import { Menu, MenuContent, MenuItem, MenuLink, MenuTrigger } from './ui/navbar-menu';

export type SitePage = 'landing' | 'hypothesis' | 'point-estimation' | 'exam-2023' | 'forward' | 'inverse' | 'table' | 'formula-sheet' | 'summary' | 'regression' | 'test-yourself';

interface SiteHeaderProps {
  activePage: SitePage;
  onNavigate: (page: SitePage) => void;
}

type NavGroupId = 'calculators' | 'inference' | 'resources' | 'practice';

interface NavItem {
  id: SitePage;
  label: string;
  description: string;
  icon: ReactElement;
}

interface NavGroup {
  id: NavGroupId;
  label: string;
  icon: ReactElement;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: 'calculators',
    label: 'מחשבונים',
    icon: <Calculator className="h-4 w-4" />,
    items: [
      { id: 'forward', label: 'הסתברויות', description: 'חישוב הסתברות בתחום נורמלי נתון.', icon: <TrendingUp className="h-4 w-4" /> },
      { id: 'inverse', label: 'אחוזונים', description: 'מציאת ערך לפי אחוזון בהתפלגות נורמלית.', icon: <Sliders className="h-4 w-4" /> },
    ],
  },
  {
    id: 'inference',
    label: 'הסקה סטטיסטית',
    icon: <Scale className="h-4 w-4" />,
    items: [
      { id: 'hypothesis', label: 'בדיקת השערות', description: 'כלי לבדיקת טענות על ממוצע האוכלוסייה.', icon: <Award className="h-4 w-4" /> },
      { id: 'point-estimation', label: 'אמידה נקודתית', description: 'אומדנים ורווחי סמך לפרמטרי אוכלוסייה.', icon: <Target className="h-4 w-4" /> },
      { id: 'regression', label: 'רגרסיה', description: 'ניתוח קשר ליניארי בין משתנים.', icon: <Activity className="h-4 w-4" /> },
    ],
  },
  {
    id: 'resources',
    label: 'כלי עזר',
    icon: <Wrench className="h-4 w-4" />,
    items: [
      { id: 'table', label: 'טבלאות התפלגות', description: 'ערכים קריטיים להתפלגויות Z ו-t.', icon: <TableProperties className="h-4 w-4" /> },
      { id: 'formula-sheet', label: 'דף נוסחאות', description: 'נוסחאות מרכזיות ללימוד ולתרגול.', icon: <FileText className="h-4 w-4" /> },
      { id: 'summary', label: 'סיכום', description: 'מפת מושגים מהירה לקראת מבחן.', icon: <BookOpen className="h-4 w-4" /> },
    ],
  },
  {
    id: 'practice',
    label: 'תרגול ובחינות',
    icon: <GraduationCap className="h-4 w-4" />,
    items: [
      { id: 'test-yourself', label: 'בחן את עצמך', description: 'שאלות תרגול עם משוב מיידי.', icon: <HelpCircle className="h-4 w-4" /> },
      { id: 'exam-2023', label: 'מבחן 2023', description: 'מבחן לדוגמה בתנאי תרגול.', icon: <ClipboardList className="h-4 w-4" /> },
    ],
  },
];

function getActiveGroup(activePage: SitePage): NavGroup | undefined {
  return navGroups.find((group) => group.items.some((item) => item.id === activePage));
}

export default function SiteHeader({ activePage, onNavigate }: SiteHeaderProps): ReactElement {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeGroup = getActiveGroup(activePage);

  const navigate = (page: SitePage): void => {
    setActiveMenu(null);
    setMobileOpen(false);
    onNavigate(page);
  };

  return (
    <div className="w-full" dir="rtl">
      <div className="grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 md:min-h-16">
        <button
          type="button"
          onClick={() => navigate('landing')}
          className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-accent-brass)] ${activePage === 'landing' ? 'border-[var(--color-accent-brass)]/55 bg-[var(--color-accent-cobalt-bg)] text-[var(--color-accent-brass)]' : 'border-[var(--color-border)] bg-[var(--color-surface)]/65 text-[var(--color-text-secondary)] hover:border-[var(--color-accent-brass)]/45 hover:text-[var(--color-text-primary)]'}`}
          aria-label="חזרה לדף הבית"
          aria-current={activePage === 'landing' ? 'page' : undefined}
        >
          <Home className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="min-w-0 justify-self-center">
          <div className="hidden min-w-0 md:block">
            <Menu active={activeMenu} setActive={setActiveMenu} label="קטגוריות ראשיות">
              {navGroups.map((group) => {
                const isCurrentGroup = group.id === activeGroup?.id;

                return (
                  <MenuItem key={group.id} value={group.id}>
                    <MenuTrigger
                      current={isCurrentGroup}
                      className={isCurrentGroup ? 'bg-[var(--color-accent-cobalt-bg)] text-[var(--color-accent-brass)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]'}
                    >
                      {group.icon}
                      <span>{group.label}</span>
                      <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                      {isCurrentGroup ? <span className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-[var(--color-accent-brass)]" aria-hidden="true" /> : null}
                    </MenuTrigger>
                    <MenuContent>
                      <div className="grid grid-cols-2 gap-1" role="group" aria-label={group.label}>
                        {group.items.map((item) => (
                          <MenuLink
                            key={item.id}
                            href={`#${item.id}`}
                            onClick={() => navigate(item.id)}
                            current={activePage === item.id}
                            className={`tour-nav-${item.id}`}
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-accent-brass)] group-hover:border-[var(--color-accent-brass)]/45">
                              {item.icon}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-bold text-[var(--color-text-primary)]">{item.label}</span>
                              <span className="mt-0.5 block text-xs leading-5 text-[var(--color-text-secondary)]">{item.description}</span>
                            </span>
                          </MenuLink>
                        ))}
                      </div>
                    </MenuContent>
                  </MenuItem>
                );
              })}
            </Menu>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-bold text-[var(--color-text-primary)] outline-none transition hover:border-[var(--color-accent-brass)]/45 focus-visible:ring-2 focus-visible:ring-[var(--color-accent-brass)] md:hidden"
            aria-label="פתיחת תפריט ניווט"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <MenuIcon className="h-4 w-4" aria-hidden="true" />}
            <span>ניווט</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate('landing')}
          className="group flex cursor-pointer items-center gap-2.5 rounded-lg py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-brass)]"
          aria-label="סטטיסטי־קל"
        >
          <BrandMark />
          <span className="hidden leading-none sm:block">
            <span className="block font-display text-lg font-black tracking-tight text-[var(--color-text-primary)]">סטטיסטי<span className="text-[var(--color-accent-brass)]">־קל</span></span>
            <span className="mt-1 block text-[0.58rem] font-bold tracking-[0.16em] text-[var(--color-text-secondary)]">STATISTICS WORKBENCH</span>
          </span>
        </button>
      </div>

      {mobileOpen ? (
        <nav className="mt-3 grid gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--shadow-elevated)] md:hidden" aria-label="ניווט ראשי">
          {navGroups.map((group) => (
            <section key={group.id}>
              <div className="mb-2 flex items-center gap-2 text-xs font-extrabold tracking-wide text-[var(--color-accent-brass)]">
                {group.icon}
                <span>{group.label}</span>
              </div>
              <div className="grid gap-1">
                {group.items.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate(item.id);
                    }}
                    aria-current={activePage === item.id ? 'page' : undefined}
                    className={`tour-nav-${item.id} flex items-start gap-3 rounded-lg p-2.5 outline-none transition hover:bg-[var(--color-surface-elevated)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-brass)] ${activePage === item.id ? 'bg-[var(--color-accent-cobalt-bg)]' : ''}`}
                  >
                    <span className="mt-0.5 text-[var(--color-accent-brass)]">{item.icon}</span>
                    <span>
                      <span className="block text-sm font-bold text-[var(--color-text-primary)]">{item.label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-[var(--color-text-secondary)]">{item.description}</span>
                    </span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

function BrandMark(): ReactElement {
  return (
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-accent-brass)]/45 bg-[var(--color-surface)] text-[var(--color-accent-brass)] transition group-hover:border-[var(--color-accent-brass)] group-hover:bg-[var(--color-accent-cobalt-bg)]">
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" aria-hidden="true">
        <path d="M3 24h26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 24c2.8 0 4.1-12 11-12s8.2 12 11 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="12" r="2" fill="currentColor" />
      </svg>
    </span>
  );
}
