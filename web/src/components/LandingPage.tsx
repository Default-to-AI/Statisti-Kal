import { type ReactElement, useState, useEffect, useMemo } from 'react';
import { Activity, AreaChart, Award, BookOpen, Brain, Calculator, ChevronLeft, ChevronRight, ClipboardList, ExternalLink, Quote, ScrollText, ShieldCheck, Sliders, Target, TrendingUp, Zap } from 'lucide-react';
import { InlineMath } from 'react-katex';
import SiteFooter from './SiteFooter';
import SiteHeader, { type SitePage } from './SiteHeader';
import { ScrollReveal } from './landing-template/TemplatePrimitives';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { PageLayout } from './ui/PageLayout';
import { FeatureShowcase } from './FeatureShowcase';
import { TestYourselfFeature } from './TestYourselfFeature';

interface LandingPageProps {
  onNavigate: (page: SitePage) => void;
  onTryHypothesis: () => void;
  onTryPointEstimation: () => void;
  onStartHypothesisTour: () => void;
}

function TypewriterEffect({ words }: { words: string[] }): ReactElement {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const maxWord = useMemo(() => words.reduce((a, b) => (a.length > b.length ? a : b), ''), [words]);

  useEffect(() => {
    const word = words[index];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(word.substring(0, text.length + 1));
        if (text === word) {
          setTimeout(() => setIsDeleting(true), 2250);
        }
      } else {
        setText(word.substring(0, text.length - 1));
        if (text === '') {
          setIsDeleting(false);
          setIndex((index + 1) % words.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, index, words]);

  return (
    <span
      className="relative inline-flex items-baseline"
      style={{ minWidth: `${maxWord.length * 0.5 + 0.4}em` }}
    >
      <span
        className="absolute bottom-0 right-0 left-0 border-b-2 border-[var(--color-primary)]/50"
        aria-hidden="true"
      />
      <span className="font-['Times_New_Roman'] font-bold text-[var(--color-primary)] drop-shadow-sm">
        {text}
      </span>
      <span className="animate-pulse text-[var(--color-primary)]/70">|</span>
    </span>
  );
}

function ConstitutionQuote(): ReactElement {
  return (
    <div className="relative w-full flex flex-col items-center justify-center lg:mt-0 select-none px-4 py-16">
      <div className="mx-auto max-w-2xl flex flex-col items-center text-center gap-8 relative">
        
        {/* Top Opening Quotes (SVG) */}
        <div className="absolute -top-10 -right-6 sm:-right-10 text-[var(--color-text-secondary)] opacity-40 select-none pointer-events-none">
          <Quote className="w-16 h-16 sm:w-20 sm:h-20" fill="currentColor" />
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-[var(--color-text-primary)] leading-tight z-10">
          אנחנו לא בתיכון, <br className="hidden lg:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-l from-[var(--color-primary)] to-[var(--color-accent-brass)]">אנחנו באקדמיה.</span>
        </h2>
        
        <blockquote className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-medium leading-relaxed text-[var(--color-text-primary)]/90 z-10 relative">
          אני מלמד את הנשמה, את המהות, את השפה, ואת הרעיון
        </blockquote>

        {/* Bottom Closing Quotes (SVG) */}
        <div className="absolute -bottom-8 -left-4 sm:-left-10 text-[var(--color-text-secondary)] opacity-40 select-none pointer-events-none">
          <Quote className="w-16 h-16 sm:w-20 sm:h-20 transform rotate-180" fill="currentColor" />
        </div>

      </div>
    </div>
  );
}

function ToolCarousel({
  onNavigate,
  onTryHypothesis,
  onTryPointEstimation,
}: {
  onNavigate: (page: SitePage) => void;
  onTryHypothesis: () => void;
  onTryPointEstimation: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  type ToolCategory = 'calculators' | 'inference' | 'resources' | 'practice';

  const categories: { id: ToolCategory; label: string }[] = [
    { id: 'calculators', label: 'מחשבונים' },
    { id: 'inference', label: 'הסקה סטטיסטית' },
    { id: 'resources', label: 'כלי עזר' },
    { id: 'practice', label: 'תרגול ובחינות' },
  ];

  const tools = useMemo(() => [
    {
      id: 'hypothesis',
      category: 'inference' as ToolCategory,
      title: 'בדיקת השערות',
      description: <>מערכת אינטראקטיבית לבדיקת השערות על תוחלת. הזנת נתונים חכמה, סימולציה ויזואלית של אזורי הדחייה וקבלת מסקנות אוטומטית ומדויקת.</>,
      icon: Award,
      hoverBorderClass: 'hover:border-[var(--color-accent-cobalt)]/40',
      bgClass: 'bg-[var(--color-accent-cobalt)]/5',
      groupHoverBgClass: 'group-hover:bg-[var(--color-accent-cobalt)]/10',
      iconBgClass: 'bg-gradient-to-br from-[var(--color-accent-cobalt)]/20 to-transparent',
      iconColorClass: 'text-[var(--color-accent-cobalt)]',
      hoverBtnBgClass: 'hover:bg-[var(--color-accent-cobalt)]/5',
      buttonText: 'למערכת',
      onClick: onTryHypothesis
    },
    {
      id: 'point-estimation',
      category: 'inference' as ToolCategory,
      title: 'אמידה נקודתית',
      description: <>ריכוז מקצועי של נושאי אמידה: אומדים חסרי הטיה, תוחלת, שונות, אומדי <InlineMath math="MLE" /> מדורגים, וחישובי <InlineMath math="MSE" /> מפורטים שלב אחר שלב.</>,
      icon: Target,
      hoverBorderClass: 'hover:border-[var(--color-accent-teal)]/40',
      bgClass: 'bg-[var(--color-accent-teal)]/5',
      groupHoverBgClass: 'group-hover:bg-[var(--color-accent-teal)]/10',
      iconBgClass: 'bg-gradient-to-br from-[var(--color-accent-teal)]/20 to-transparent',
      iconColorClass: 'text-[var(--color-accent-teal)]',
      hoverBtnBgClass: 'hover:bg-[var(--color-accent-teal)]/5',
      buttonText: 'לדף הלמידה',
      onClick: onTryPointEstimation
    },
    {
      id: 'forward',
      category: 'calculators' as ToolCategory,
      title: 'חישובי הסתברויות',
      description: <>חישוב מהיר ומדויק של הסתברויות תחת עקומת ההתפלגות הנורמלית. תצוגה גרפית בזמן אמת של האזור המחושב ללא צורך בחיפוש ידני בטבלאות.</>,
      icon: TrendingUp,
      hoverBorderClass: 'hover:border-[var(--color-primary)]/40',
      bgClass: 'bg-[var(--color-primary)]/5',
      groupHoverBgClass: 'group-hover:bg-[var(--color-primary)]/10',
      iconBgClass: 'bg-gradient-to-br from-[var(--color-primary)]/15 to-transparent',
      iconColorClass: 'text-[var(--color-primary)]',
      hoverBtnBgClass: 'hover:bg-[var(--color-primary)]/5',
      buttonText: 'למחשבון',
      onClick: () => onNavigate('forward')
    },
    {
      id: 'inverse',
      category: 'calculators' as ToolCategory,
      title: 'חישוב אחוזונים',
      description: <>חילוץ אחוזונים, ציוני תקן וערכי סף מתוך הסתברויות נתונות, תוך שימוש בפונקציית ההתפלגות הנורמלית ההפוכה.</>,
      icon: Sliders,
      hoverBorderClass: 'hover:border-[var(--color-accent-cobalt)]/40',
      bgClass: 'bg-[var(--color-accent-cobalt)]/5',
      groupHoverBgClass: 'group-hover:bg-[var(--color-accent-cobalt)]/10',
      iconBgClass: 'bg-gradient-to-br from-[var(--color-accent-cobalt)]/20 to-transparent',
      iconColorClass: 'text-[var(--color-accent-cobalt)]',
      hoverBtnBgClass: 'hover:bg-[var(--color-accent-cobalt)]/5',
      buttonText: 'למחשבון',
      onClick: () => onNavigate('inverse')
    },
    {
      id: 'table',
      category: 'resources' as ToolCategory,
      title: 'טבלאות התפלגות',
      description: <>טבלאות התפלגות דינמיות: התפלגות נורמלית סטנדרטית (Z) והתפלגות Student's T, מעוצבות לקריאה אופטימלית וסימון חכם.</>,
      icon: BookOpen,
      hoverBorderClass: 'hover:border-[var(--color-accent-teal)]/40',
      bgClass: 'bg-[var(--color-accent-teal)]/5',
      groupHoverBgClass: 'group-hover:bg-[var(--color-accent-teal)]/10',
      iconBgClass: 'bg-gradient-to-br from-[var(--color-accent-teal)]/20 to-transparent',
      iconColorClass: 'text-[var(--color-accent-teal)]',
      hoverBtnBgClass: 'hover:bg-[var(--color-accent-teal)]/5',
      buttonText: 'למאגר',
      onClick: () => onNavigate('table')
    },
    {
      id: 'formula-sheet',
      category: 'resources' as ToolCategory,
      title: 'נוסחאות',
      description: <>דף נוסחאות מקיף וקריא הכולל את כל הזהויות והקשרים הסטטיסטיים הנפוצים בקורס, מותאם לשליפה מהירה של מידע תוך כדי פתרון תרגילים.</>,
      icon: ScrollText,
      hoverBorderClass: 'hover:border-[var(--color-primary)]/40',
      bgClass: 'bg-[var(--color-primary)]/5',
      groupHoverBgClass: 'group-hover:bg-[var(--color-primary)]/10',
      iconBgClass: 'bg-gradient-to-br from-[var(--color-primary)]/15 to-transparent',
      iconColorClass: 'text-[var(--color-primary)]',
      hoverBtnBgClass: 'hover:bg-[var(--color-primary)]/5',
      buttonText: 'לגיליון הנוסחאות',
      onClick: () => onNavigate('formula-sheet')
    },
    {
      id: 'summary',
      category: 'resources' as ToolCategory,
      title: 'סיכום הקורס',
      description: <>מפת מושגים מרוכזת שמחברת בין ההתפלגויות, האמידה, ההשערות והכלים הדרושים לפתרון שאלות בקורס.</>,
      icon: BookOpen,
      hoverBorderClass: 'hover:border-[var(--color-accent-teal)]/40',
      bgClass: 'bg-[var(--color-accent-teal)]/5',
      groupHoverBgClass: 'group-hover:bg-[var(--color-accent-teal)]/10',
      iconBgClass: 'bg-gradient-to-br from-[var(--color-accent-teal)]/20 to-transparent',
      iconColorClass: 'text-[var(--color-accent-teal)]',
      hoverBtnBgClass: 'hover:bg-[var(--color-accent-teal)]/5',
      buttonText: 'לסיכום',
      onClick: () => onNavigate('summary')
    },
    {
      id: 'regression',
      category: 'inference' as ToolCategory,
      title: 'רגרסיה ליניארית',
      description: <>חקירת הקשר בין משתנים, חישוב קו הרגרסיה ופירוש התוצאות בתוך תצוגה אינטראקטיבית וברורה.</>,
      icon: Activity,
      hoverBorderClass: 'hover:border-[var(--color-accent-cobalt)]/40',
      bgClass: 'bg-[var(--color-accent-cobalt)]/5',
      groupHoverBgClass: 'group-hover:bg-[var(--color-accent-cobalt)]/10',
      iconBgClass: 'bg-gradient-to-br from-[var(--color-accent-cobalt)]/20 to-transparent',
      iconColorClass: 'text-[var(--color-accent-cobalt)]',
      hoverBtnBgClass: 'hover:bg-[var(--color-accent-cobalt)]/5',
      buttonText: 'למחשבון',
      onClick: () => onNavigate('regression')
    },
    {
      id: 'test-yourself',
      category: 'practice' as ToolCategory,
      title: 'בחן את עצמך',
      description: <>סט שאלות מדורג — קל, בינוני, קשה ומבחן מסכם — כדי לבדוק הבנה, חישוב ושליטה במושגי הקורס.</>,
      icon: Brain,
      hoverBorderClass: 'hover:border-[var(--color-primary)]/40',
      bgClass: 'bg-[var(--color-primary)]/5',
      groupHoverBgClass: 'group-hover:bg-[var(--color-primary)]/10',
      iconBgClass: 'bg-gradient-to-br from-[var(--color-primary)]/15 to-transparent',
      iconColorClass: 'text-[var(--color-primary)]',
      hoverBtnBgClass: 'hover:bg-[var(--color-primary)]/5',
      buttonText: 'לבחינות',
      onClick: () => onNavigate('test-yourself')
    },
    {
      id: 'exam-2023',
      category: 'practice' as ToolCategory,
      title: 'מבחן 2023',
      description: <>פתרון מלא של מבחן עבר: בחירה רב־ברירתית, הכנות, דרך פתרון והסבר לכל צעד.</>,
      icon: ClipboardList,
      hoverBorderClass: 'hover:border-[var(--color-accent-brass)]/55',
      bgClass: 'bg-[var(--color-accent-brass)]/10',
      groupHoverBgClass: 'group-hover:bg-[var(--color-accent-brass)]/15',
      iconBgClass: 'bg-gradient-to-br from-[var(--color-accent-brass)]/20 to-transparent',
      iconColorClass: 'text-[var(--color-accent-brass)]',
      hoverBtnBgClass: 'hover:bg-[var(--color-accent-brass)]/10',
      buttonText: 'למבחן',
      onClick: () => onNavigate('exam-2023')
    }
  ], [onNavigate, onTryHypothesis, onTryPointEstimation]);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % tools.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + tools.length) % tools.length);
  const handleCategorySelect = (category: ToolCategory) => {
    const firstToolInCategory = tools.findIndex((tool) => tool.category === category);
    if (firstToolInCategory >= 0) setActiveIndex(firstToolInCategory);
  };
  const activeTool = tools[activeIndex]!;

  return (
    <div className="relative w-full max-w-[100vw] h-[520px] flex items-center justify-center overflow-hidden py-8">
      <nav className="absolute top-0 z-50 flex max-w-[calc(100%-2rem)] items-center justify-center gap-1.5 overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]/80 p-1 backdrop-blur-md" aria-label="מפת העמודים באתר">
        {categories.map((category) => {
          const isActive = activeTool.category === category.id;
          const pageCount = tools.filter((tool) => tool.category === category.id).length;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategorySelect(category.id)}
              className={`cursor-pointer whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-bold transition sm:px-3 ${
                isActive
                  ? 'bg-[var(--color-accent-cobalt-bg)] text-[var(--color-accent-brass)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)]'
              }`}
              aria-current={isActive ? 'true' : undefined}
            >
              {category.label}
              <span className="mr-1.5 text-[0.65rem] opacity-70">{pageCount}</span>
            </button>
          );
        })}
      </nav>

      {/* Navigation Arrows */}
      <button 
        onClick={handleNext}
        className="absolute left-4 md:left-12 z-40 cursor-pointer p-4 rounded-full bg-[var(--color-surface)]/90 border border-[var(--color-border)] hover:bg-[var(--color-surface-raised)] hover:scale-110 transition-all transform -translate-y-1/2 top-1/2 shadow-xl hover:shadow-2xl text-[var(--color-text-primary)] backdrop-blur-md"
        aria-label="הבא"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button 
        onClick={handlePrev}
        className="absolute right-4 md:right-12 z-40 cursor-pointer p-4 rounded-full bg-[var(--color-surface)]/90 border border-[var(--color-border)] hover:bg-[var(--color-surface-raised)] hover:scale-110 transition-all transform -translate-y-1/2 top-1/2 shadow-xl hover:shadow-2xl text-[var(--color-text-primary)] backdrop-blur-md"
        aria-label="הקודם"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      <div className="relative w-full h-full flex items-center justify-center perspective-[1200px]">
        {tools.map((tool, i) => {
          let diff = (i - activeIndex + tools.length) % tools.length;
          if (diff > Math.floor(tools.length / 2)) {
            diff -= tools.length;
          }

          const Icon = tool.icon;
          const isActive = diff === 0;
          const distance = Math.abs(diff);
          const direction = Math.sign(diff);
          const translateOffset = distance === 0 ? 0 : 105 + (distance - 1) * 90;
          const translateX = distance === 0 ? '0' : `${direction * -translateOffset}%`;
          const scale = distance === 0 ? '1' : `${Math.max(0.4, 1 - distance * 0.15)}`;
          const zIndex = Math.max(10, 30 - distance * 10);
          const opacity = distance === 0 ? '1' : `${Math.max(0, 0.9 - distance * 0.3)}`;

          return (
            <div
              key={tool.id}
              className="absolute w-[90%] max-w-[320px] sm:max-w-[380px] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
              aria-hidden={!isActive}
              style={{
                transform: `translateX(${translateX}) scale(${scale})`,
                zIndex,
                opacity,
              }}
            >
              <Card 
                className={`p-6 sm:p-8 flex flex-col items-start text-right bg-gradient-to-br from-[var(--color-surface-raised)] to-[var(--color-surface)] border border-[var(--color-border)]/50 h-[400px] w-full cursor-pointer relative overflow-hidden group transition-all duration-500
                ${isActive ? 'shadow-2xl shadow-black/60 ring-1 ring-white/10 scale-[1.02]' : 'shadow-lg hover:opacity-100 opacity-70 scale-[0.98]'} ${tool.hoverBorderClass}`}
                onClick={() => {
                  if (!isActive) setActiveIndex(i);
                }}
              >
                {/* Decorative background flare */}
                <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] -z-10 transition-opacity duration-700 ${isActive ? 'opacity-40' : 'opacity-10'} ${tool.bgClass}`}></div>
                
                <div className={`mb-6 p-4 rounded-2xl border border-white/5 shadow-inner transition-transform duration-500 group-hover:-translate-y-1 ${tool.iconBgClass} ${tool.iconColorClass}`}>
                  <Icon className="w-8 h-8 drop-shadow-md" strokeWidth={1.5} />
                </div>
                <span className={`mb-3 text-xs font-bold ${tool.iconColorClass}`}>{categories.find((category) => category.id === tool.category)?.label}</span>
                <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4 font-display tracking-tight drop-shadow-sm">{tool.title}</h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed text-sm flex-1">{tool.description}</p>
                <Button 
                  variant="ghost" 
                  className={`w-full group/btn text-lg border border-[var(--color-border)] whitespace-nowrap flex-nowrap ${tool.hoverBtnBgClass} ${isActive ? 'bg-[var(--color-surface-raised)]' : ''}`}
                  leftIcon={<ExternalLink className="w-5 h-5 group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 transition-transform duration-300" />}
                  tabIndex={isActive ? 0 : -1}
                  onClick={(e) => {
                    if (!isActive) {
                      e.stopPropagation();
                      setActiveIndex(i);
                    } else {
                      tool.onClick();
                    }
                  }}
                >
                  {tool.buttonText}
                </Button>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LandingPage({ onNavigate, onTryHypothesis, onTryPointEstimation, onStartHypothesisTour }: LandingPageProps): ReactElement {
  return (
    <PageLayout
      header={<SiteHeader activePage="landing" onNavigate={onNavigate} />}
      footer={<SiteFooter onNavigate={onNavigate} />}
      contentWidthClassName="max-w-none"
    >
      <div className="relative flex w-full flex-col overflow-hidden">
        {/* Hero Section */}
          <div className="max-w-[90rem] mx-auto flex flex-col lg:flex-row items-center gap-8 relative z-10">
            {/* Text Content */}
            <div className="relative z-20 flex min-h-[480px] flex-col justify-center px-4 text-center sm:px-6 lg:w-5/12 lg:text-right">


              <h1 className="mb-8 max-w-[600px] text-5xl font-extrabold tracking-tight sm:text-6xl lg:mr-0 lg:text-7xl">
                <span className="block bg-gradient-to-r from-[var(--color-accent-cobalt)] to-[var(--chart-2)] bg-clip-text pb-2 font-display text-transparent">
                  יותר סמנטיקה ודקויות, הטכניקה... פחות
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-[var(--color-text-secondary)] mb-12 leading-relaxed max-w-xl mx-auto lg:mx-0">
                המחשב עושה לכם את כל הטכניקה והחישובים. לכם נשאר רק להתמקד{' '}
                <TypewriterEffect words={['ברציונל', 'בסמנטיקה', 'בנשמה']} />{' '}
                של הסטטיסטיקה.
              </p>

              <div className="flex flex-row justify-center lg:justify-start gap-4 flex-wrap w-full sm:w-auto mt-6">
                <style>{`
                  @keyframes shimmer {
                    0% { transform: translateX(150%) skewX(-15deg); }
                    100% { transform: translateX(-150%) skewX(-15deg); }
                  }
                  .animate-shimmer {
                    animation: shimmer 2.5s infinite linear;
                  }
                `}</style>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={onStartHypothesisTour}
                  className="relative overflow-hidden group transform transition-all duration-300 hover:scale-105 shadow-2xl shadow-[var(--color-accent-brass)]/30 h-20 w-full sm:w-[480px] text-3xl sm:text-4xl font-black whitespace-nowrap border-0"
                  style={{ backgroundColor: 'var(--color-accent-brass)', color: 'var(--color-background)' }}
                  rightIcon={<ExternalLink className="w-10 h-10 transition-transform duration-300 group-hover:-translate-y-1 group-hover:-translate-x-1 relative z-10" />}
                >
                  <span className="relative z-10">פה מתחילים</span>
                  {/* Shimmer effect */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer pointer-events-none"></div>
                </Button>
              </div>
            </div>

            {/* Visual/Mockup Content */}
            <div className="lg:w-7/12 w-full px-4 sm:px-6 relative z-10">
              <ConstitutionQuote />
            </div>
          </div>

          <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)] pointer-events-none" aria-hidden="true">
            <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[var(--chart-2)] to-[var(--color-accent-cobalt)] opacity-15 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
          </div>
        <TestYourselfFeature onStart={() => onNavigate('test-yourself')} />

        <FeatureShowcase />

        <section className="w-full mx-auto py-20 overflow-hidden">
          <ScrollReveal distance={24} duration={0.45}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2
                data-toc
                id="landing-tools"
                className="flex items-center justify-center gap-4 text-display-h2 text-[var(--color-text-primary)] mb-8"
              >
                <span
                  className="hidden h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(212,168,67,0.55),transparent)] sm:block"
                  aria-hidden="true"
                />
                <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                  <span>מה אפשר</span>
                  <span className="font-handwriting text-[1.18em] text-[var(--color-primary)] -rotate-2">
                    למצוא
                  </span>
                  <span>פה?</span>
                </span>
                <span
                  className="hidden h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(212,168,67,0.55),transparent)] sm:block"
                  aria-hidden="true"
                />
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal distance={0} duration={0.35}>
            <ToolCarousel onNavigate={onNavigate} onTryHypothesis={onTryHypothesis} onTryPointEstimation={onTryPointEstimation} />
          </ScrollReveal>
        </section>

        {/* Philosophy Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <ScrollReveal distance={16} duration={0.45}>
            <div className="relative isolate overflow-hidden rounded-[32px] bg-[var(--color-surface)] border border-[var(--color-border)] px-6 py-12 sm:px-12 xl:py-16 shadow-xl hover:shadow-2xl transition-shadow duration-500 group">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,var(--color-primary)_0%,transparent_100%)] opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
              
              <div className="mx-auto max-w-2xl lg:max-w-4xl flex flex-col items-center text-center gap-6">

                <h2 className="text-3xl sm:text-4xl font-display font-bold text-[var(--color-text-primary)]">
                  אנחנו לא בתיכון, <span className="text-transparent bg-clip-text bg-gradient-to-l from-[var(--color-primary)] to-[var(--color-accent-cobalt)]">אנחנו באקדמיה.</span>
                </h2>
                
                <blockquote className="mt-2 text-xl sm:text-2xl font-medium leading-relaxed text-[var(--color-text-primary)]/90 relative">
                  <span className="text-5xl font-serif text-[var(--color-primary)]/30 absolute -top-6 -right-8">"</span>
                  סטודנטים שמתרכזים רק בשינון טכני – קורסים ברגע שהשאלה משתנה קצת. בעידן המודרני, הפיצ'פקעס של חישובים ידניים הם תפל.
                  <span className="text-5xl font-serif text-[var(--color-primary)]/30 absolute -bottom-8 -left-8">"</span>
                </blockquote>
                
                <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-3xl mt-4">
                  המחשב יעשה את העבודה השחורה והטכנית. התפקיד שלכם הוא אחד: <strong className="text-[var(--color-text-primary)]">להבין את הרעיון, לשלוט בשפה ולראות את התמונה המלאה.</strong> אתם איתי? תנו לAI לעשות את החישובים, זה לא שווה כלום אם אתם לא מבינים.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </section>


      </div>
    </PageLayout>
  );
}
