import { useId, useState, type ReactElement, type SVGProps } from 'react';
import { Calculator, CheckCircle2, FlaskConical, LineChart, Play, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InlineMath } from 'react-katex';
import SiteFooter from './SiteFooter';
import SiteHeader, { type SitePage } from './SiteHeader';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { PageLayout } from './ui/PageLayout';

interface LandingPageProps {
  onNavigate: (page: SitePage) => void;
  onTryHypothesis: () => void;
}

interface FeatureCard {
  title: string;
  description: string;
  badge: ReactElement | string;
  accent: 'brass' | 'teal' | 'crimson' | 'cobalt';
  visual: ReactElement;
}

interface WorkflowStep {
  number: string;
  title: string;
  body: string;
  math: string;
}

interface CarouselItem {
  id: number;
  eyebrow: string;
  title: string;
  description?: ReactElement | string;
  visual: ReactElement;
}

const featureCards: FeatureCard[] = [
  {
    title: 'הגדרת השערות בלי בלבול',
    description: 'המשתמש מזין השערות, סוג מבחן, רמת מובהקות ונתוני מדגם. המסך מתרגם את זה למבנה בדיקה ברור.',
    badge: <InlineMath math="H_0 / H_1" />,
    accent: 'brass',
    visual: <HypothesisSetupMockup />,
  },
  {
    title: 'אזורים קריטיים על העקומה',
    description: 'קו השערת האפס, אזור דחייה וסטטיסטי המבחן מוצגים יחד. החלטה סטטיסטית נהיית תמונה, לא רק מספר.',
    badge: <InlineMath math={String.raw`\alpha = 0.05`} />,
    accent: 'crimson',
    visual: <DecisionCurveMockup />,
  },
  {
    title: 'תוצאה עם החלטה ופירוש',
    description: 'המערכת מחזירה p-value, החלטת דחייה, וניסוח קצר בעברית שאפשר להבין תוך שניות.',
    badge: <InlineMath math={String.raw`p\text{-value}`} />,
    accent: 'teal',
    visual: <ResultCardMockup />,
  },
];

const workflowSteps: WorkflowStep[] = [
  {
    number: '01',
    title: 'מזינים נתונים',
    body: 'מכניסים תוחלת תחת השערת האפס, גודל מדגם, סטיית תקן ונתון מדגם.',
    math: String.raw`\mu_0 = 100,\ \bar{x}=104.2,\ \sigma=12,\ n=36`,
  },
  {
    number: '02',
    title: 'קובעים כיוון מחקר',
    body: 'בוחרים אם המחקר בודק גדול מ, קטן מ, או שונה מ.',
    math: String.raw`H_0:\mu=100,\ H_1:\mu>100`,
  },
  {
    number: '03',
    title: 'קובעים מובהקות',
    body: 'מגדירים את רמת הסיכון לטעות מסוג ראשון לפני קבלת החלטה.',
    math: String.raw`\alpha = 0.05`,
  },
  {
    number: '04',
    title: 'מסיקים מסקנות',
    body: 'הכלי מחשב סטטיסטי מבחן, מציג p-value, מסמן אזור דחייה ומנסח החלטה.',
    math: String.raw`z = 2.10 \Rightarrow p = 0.018`,
  },
  {
    number: '05',
    title: 'ממשיכים לניתוח מתקדם',
    body: 'אחרי ההחלטה אפשר לפתוח רווח סמך לתוחלת או עוצמת מבחן.',
    math: String.raw`CI_{\mu}\ \text{or}\ 1-\beta`,
  },
];

const accentClass: Record<FeatureCard['accent'], string> = {
  brass: 'border-[var(--color-accent-brass)]/50',
  teal: 'border-[var(--color-accent-teal)]/50',
  crimson: 'border-[var(--color-accent-crimson)]/50',
  cobalt: 'border-[var(--color-accent-cobalt-line)]',
};

const accentTextClass: Record<FeatureCard['accent'], string> = {
  brass: 'text-[var(--color-accent-brass)]',
  teal: 'text-[var(--color-accent-teal)]',
  crimson: 'text-[var(--color-accent-crimson)]',
  cobalt: 'text-[var(--color-accent-cobalt)]',
};

export default function LandingPage({ onNavigate, onTryHypothesis }: LandingPageProps): ReactElement {
  return (
    <PageLayout
      header={<SiteHeader activePage="landing" onNavigate={onNavigate} />}
      footer={<SiteFooter onNavigate={onNavigate} />}
    >
      <section className="grid min-h-[calc(100vh-140px)] grid-cols-1 gap-8 py-6 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="max-w-4xl space-y-7"
        >
          <div className="accent-bar" />
          <div className="space-y-5">
            <Badge variant="brass" size="lg">בדיקת השערות, בלי רעש</Badge>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-[var(--color-text-primary)] sm:text-5xl lg:text-6xl">
              מההשערה ועד המסקנה בפחות מדקה.
            </h1>
            <p className="max-w-2xl text-body-lg font-semibold text-[var(--color-text-secondary)]">
              מחשבון בדיקת השערות בעברית שמחבר קלט אקדמי, עקומת החלטה, <span dir="ltr"><InlineMath math={String.raw`p\text{-value}`} /></span> ופירוש קצר לתהליך אחד ברור ומדויק.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={onTryHypothesis} rightIcon={<Play size={18} />}>
              נסה את בדיקת ההשערות
            </Button>
            <a
              href="#hypothesis-example"
              className="inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-5 py-2.5 text-base font-black text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface)]"
            >
              ראה דוגמה קצרה
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.08 }}
          className="curve-glow rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:p-5"
        >
          <FeatureCarousel />
        </motion.div>
      </section>

      <section className="space-y-6 py-8">
        <SectionHeader
          eyebrow="תכונות מרכזיות"
          title="כל שלב בבדיקה מקבל ייצוג חזותי"
          body="העמוד מדגיש את מה שהמוצר עושה טוב: הופך בדיקת השערות לתהליך קריא, ממופה ומגובה במספרים."
        />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {featureCards.map((feature) => (
            <Card key={feature.title} className={`space-y-5 ${accentClass[feature.accent]}`}>
              <div className="flex items-center justify-between gap-3">
                <Badge variant={feature.accent}>{feature.badge}</Badge>
                <LineChart className={accentTextClass[feature.accent]} size={22} />
              </div>
              <div className="min-h-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]/55 p-4">
                {feature.visual}
              </div>
              <div className="space-y-2">
                <h3 className="text-heading-section font-black text-[var(--color-text-primary)]">{feature.title}</h3>
                <p className="text-body-sm font-semibold text-[var(--color-text-secondary)]">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section id="hypothesis-example" className="grid grid-cols-1 gap-6 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card variant="raised" className="space-y-5">
          <SectionHeader
            eyebrow="דוגמה מהירה"
            title="איך משתמשים בזה?"
            body="במקום לעבור בין נוסחה, טבלה ומחשבון חיצוני, המשתמש מכניס את נתוני התרגיל ומקבל החלטה מנומקת."
          />
          <div className="rounded-lg border border-[var(--color-accent-brass)]/40 bg-[var(--color-accent-brass)]/10 p-5">
            <div className="mb-2 flex items-center gap-2 text-[var(--color-accent-brass)]">
              <FlaskConical size={20} />
              <span className="text-heading-label font-black">תרגיל לדוגמה</span>
            </div>
            <p className="text-body-base font-bold text-[var(--color-text-primary)]">
              האם ממוצע ציוני הכיתה גבוה מ־<span dir="ltr"><InlineMath math="100" /></span> ברמת מובהקות <span dir="ltr"><InlineMath math={String.raw`5\%`} /></span>?
            </p>
          </div>
        </Card>

        <div className="stagger-in grid grid-cols-1 gap-4">
          {workflowSteps.map((step) => (
            <article
              key={step.number}
              className="grid grid-cols-[auto_1fr] gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-accent-cobalt-line)] bg-[var(--color-accent-cobalt-bg)] font-mono text-mono-sm font-black text-[var(--color-accent-cobalt)]">
                {step.number}
              </div>
              <div className="space-y-2">
                <h3 className="text-heading-section font-black text-[var(--color-text-primary)]">{step.title}</h3>
                <p className="text-body-sm font-semibold text-[var(--color-text-secondary)]">{step.body}</p>
                <div dir="ltr" className="inline-flex rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1.5 text-mono-sm text-[var(--color-text-primary)]">
                  <InlineMath math={step.math} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="py-10">
        <Card className="overflow-hidden border-[var(--color-accent-teal)]/40 bg-[var(--color-surface-raised)]">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_auto]">
            <div className="space-y-3">
              <Badge variant="teal" size="lg">מוכן לבדיקה ראשונה</Badge>
              <h2 className="text-3xl font-black text-[var(--color-text-primary)] sm:text-4xl">הכנס נתונים. קבל החלטה. הבן למה.</h2>
              <p className="max-w-2xl text-body-base font-semibold text-[var(--color-text-secondary)]">
                CTA זמני לדראפט: מעבר ישיר למסך בדיקת ההשערות הקיים כדי לחבר בין ההבטחה בעמוד לבין הכלי עצמו.
              </p>
            </div>
            <Button size="lg" variant="success" onClick={onTryHypothesis} rightIcon={<Calculator size={20} />}>
              פתח מחשבון
            </Button>
          </div>
        </Card>
      </section>
    </PageLayout>
  );
}

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}): ReactElement {
  return (
    <div className="max-w-3xl space-y-3">
      <div className="flex items-center gap-3">
        <div className="accent-bar" />
        <span className="text-heading-label font-black text-[var(--color-accent-brass)]">{eyebrow}</span>
      </div>
      <h2 className="text-3xl font-black text-[var(--color-text-primary)] sm:text-4xl">{title}</h2>
      <p className="text-body-base font-semibold text-[var(--color-text-secondary)]">{body}</p>
    </div>
  );
}

const CAROUSEL_ITEMS: CarouselItem[] = [
  {
    id: 1,
    eyebrow: '01 · פרמטרים והשערות',
    title: 'הזנת נתונים ומבנה השערות',
    description: (
      <>
        טבלת שלוש-עמודות: השערת האפס, נתוני המדגם, השערת המחקר — עם הפרמטרים <span dir="ltr"><InlineMath math="\\mu_0, \\bar{X}, \\sigma, n" /></span> בזמן אמת.
      </>
    ),
    visual: <ParametersSlide />,
  },
  {
    id: 2,
    eyebrow: '02 · גרף שתי עקומות',
    title: 'ויזואליזציה של ההתפלגויות',
    description: (
      <>
        שתי עקומות רגילות: <span dir="ltr"><InlineMath math="H_0" /></span> בזהב ו-<span dir="ltr"><InlineMath math="H_1" /></span> בטורקיז, עם ערך קריטי ואזור דחייה אדום.
      </>
    ),
    visual: <ChartSlide />,
  },
  {
    id: 3,
    eyebrow: '03 · שלבי הפתרון',
    title: 'ניסוח השערות ובחירת מבחן',
    description: 'שישה שלבי פתרון מפורטים: עץ החלטה לבחירת Z/t, נוסחאות עם ערכים, ופירוש בשפה אנושית.',
    visual: <StepsSlide />,
  },
  {
    id: 4,
    eyebrow: '04 · מסקנה',
    title: 'החלטה סטטיסטית ו-p-value',
    description: 'שלב 6: השוואה בשלוש גישות — סטטיסטי מבחן, אזור דחייה, והסתברות. מסקנה ברורה בעברית.',
    visual: <ConclusionSlide />,
  },
];

function FeatureCarousel(): ReactElement {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length);
  const currentItem = CAROUSEL_ITEMS[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]" dir="rtl">
      <div className="grid min-h-[620px] grid-cols-1 overflow-hidden bg-[var(--color-surface-raised)] lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative min-h-[460px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="absolute inset-0"
            initial={{ opacity: 0, x: 44, scale: 0.99 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -44, scale: 0.99 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {currentItem.visual}
          </motion.div>
        </AnimatePresence>

        <button 
          onClick={nextSlide} 
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/80 p-2 text-[var(--color-text-primary)] shadow-md backdrop-blur-sm transition-colors hover:bg-[var(--color-surface)] sm:right-4"
          aria-label="הבא"
        >
          <ChevronRight size={24} />
        </button>
        <button 
          onClick={prevSlide} 
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/80 p-2 text-[var(--color-text-primary)] shadow-md backdrop-blur-sm transition-colors hover:bg-[var(--color-surface)] sm:left-4"
          aria-label="הקודם"
        >
          <ChevronLeft size={24} />
        </button>
        </div>

        <aside className="flex flex-col justify-between gap-5 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:border-r lg:border-t-0">
          <div className="space-y-4">
            <Badge variant="brass">{currentItem.eyebrow}</Badge>
            <div className="space-y-3">
              <h3 className="text-display-h3 font-black text-[var(--color-text-primary)]">{currentItem.title}</h3>
              {currentItem.description && (
                <p className="text-body-base font-semibold text-[var(--color-text-secondary)]">
                  {currentItem.description}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-3">
            {CAROUSEL_ITEMS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-full rounded-lg border p-3 text-right transition-colors ${idx === currentIndex ? 'border-[var(--color-accent-cobalt-line)] bg-[var(--color-accent-cobalt-bg)] text-[var(--color-text-primary)]' : 'border-[var(--color-border)] bg-[var(--color-background)]/55 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)]'}`}
                aria-current={idx === currentIndex ? 'step' : undefined}
              >
                <span className="block text-caption font-black text-[var(--color-accent-brass)]">{item.eyebrow}</span>
                <span className="mt-1 block text-body-sm font-black">{item.title}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/90 px-3 py-2 shadow-lg backdrop-blur-sm">
        {CAROUSEL_ITEMS.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setCurrentIndex(idx)}
            className={`pointer-events-auto h-2.5 rounded-full transition-all ${idx === currentIndex ? 'w-8 bg-[var(--color-accent-brass)]' : 'w-2.5 bg-[var(--color-border)] hover:bg-[var(--color-text-secondary)]'}`}
            aria-label={`עבור לשקופית ${idx + 1} מתוך ${CAROUSEL_ITEMS.length}`}
          />
        ))}
      </div>
    </div>
  );
}

function SlideStage({ children }: { children: ReactElement | ReactElement[] }): ReactElement {
  return (
    <div className="relative h-full min-h-[460px] overflow-hidden bg-[radial-gradient(circle_at_22%_16%,rgba(250,204,21,0.16),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(46,196,182,0.13),transparent_32%),var(--color-background)] p-5 sm:p-8">
      <div className="absolute inset-x-10 top-10 h-px bg-[var(--color-border)]" />
      <div className="absolute inset-y-10 right-10 w-px bg-[var(--color-border)]" />
      {children}
    </div>
  );
}

function DraftPanel({
  children,
  className = '',
  tone = 'neutral',
}: {
  children: ReactElement | ReactElement[] | string;
  className?: string;
  tone?: FeatureCard['accent'] | 'neutral';
}): ReactElement {
  const toneClass = tone === 'neutral' ? 'border-[var(--color-border)]' : accentClass[tone];

  return (
    <div className={`absolute rounded-xl border ${toneClass} bg-[var(--color-surface)]/95 p-4 shadow-2xl backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

function PanelLabel({ children, tone = 'brass' }: { children: string; tone?: FeatureCard['accent'] }): ReactElement {
  return <div className={`text-heading-label font-black ${accentTextClass[tone]}`}>{children}</div>;
}

function MiniField({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)]/70 p-3">
      <div className="text-body-xs font-black text-[var(--color-text-secondary)]">{label}</div>
      <div dir="ltr" className="mt-1 text-mono-sm font-black text-[var(--color-text-primary)]">
        <InlineMath math={value} />
      </div>
    </div>
  );
}

function RealScreenshotCard({
  src,
  alt,
  className = '',
  imageClassName = '',
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
}): ReactElement {
  return (
    <div className={`absolute overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-2xl ${className}`}>
      <img src={src} alt={alt} className={`h-full w-full object-cover ${imageClassName}`} />
    </div>
  );
}

function ParametersSlide(): ReactElement {
  return (
    <SlideStage>
      <RealScreenshotCard
        src="/images/carousel/ht-parameters.png"
        alt="מסך הזנת הפרמטרים: טבלת השערת אפס, מדגם, השערת המחקר עם הערכים האמיתיים"
        className="inset-[4%] z-10"
        imageClassName="object-top"
      />
    </SlideStage>
  );
}

function ChartSlide(): ReactElement {
  return (
    <SlideStage>
      <RealScreenshotCard
        src="/images/carousel/ht-chart.png"
        alt="גרף שתי עקומות נורמליות: H0 בזהב, H1 בטורקיז, עם ערך קריטי ואזור דחייה"
        className="inset-[4%] z-10 border-[var(--color-accent-brass)]/40"
        imageClassName="object-center"
      />
    </SlideStage>
  );
}

function StepsSlide(): ReactElement {
  return (
    <SlideStage>
      <RealScreenshotCard
        src="/images/carousel/ht-steps.png"
        alt="שלבי הפתרון המפורטים: עץ החלטה לבחירת מבחן Z, ניסוח השערות אינטראקטיבי"
        className="inset-[4%] z-10 border-[var(--color-accent-cobalt-line)]"
        imageClassName="object-top"
      />
    </SlideStage>
  );
}

function ConclusionSlide(): ReactElement {
  return (
    <SlideStage>
      <RealScreenshotCard
        src="/images/carousel/ht-conclusion.png"
        alt="שלב המסקנה: p-value, סטטיסטי מבחן, ערך קריטי, ורווח סמך"
        className="inset-[4%] z-10 border-[var(--color-accent-teal)]/40"
        imageClassName="object-top"
      />
    </SlideStage>
  );
}

function HeroInstrumentMockup(): ReactElement {
  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div>
          <div className="text-heading-section font-black text-[var(--color-text-primary)]">בדיקת השערה לתוחלת</div>
          <div className="text-body-xs font-bold text-[var(--color-text-secondary)]">
            <span dir="ltr"><InlineMath math="Z" /></span>-test · חד צדדי ימני · <span dir="ltr"><InlineMath math={String.raw`\alpha = 0.05`} /></span>
          </div>
        </div>
        <Badge variant="crimson">אזור דחייה פעיל</Badge>
      </div>

      <DecisionCurveSvg className="h-64 w-full" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricTile label="סטטיסטי מבחן" math="z = 2.10" tone="cobalt" />
        <MetricTile label="ערך קריטי" math="z_{\alpha}=1.645" tone="brass" />
        <MetricTile label="p-value" math="p=0.018" tone="teal" />
      </div>
    </div>
  );
}

function MetricTile({ label, math, tone }: { label: string; math: string; tone: FeatureCard['accent'] }): ReactElement {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]/55 p-4">
      <div className={`text-heading-label font-black ${accentTextClass[tone]}`}>{label}</div>
      <div dir="ltr" className="mt-1 text-mono-lg font-black text-[var(--color-text-primary)]">
        <InlineMath math={math} />
      </div>
    </div>
  );
}

function HypothesisSetupMockup(): ReactElement {
  return (
    <div className="space-y-4">
      {[
        ['השערת אפס', String.raw`H_0:\mu = 100`],
        ['השערה חלופית', String.raw`H_1:\mu > 100`],
        ['רמת מובהקות', String.raw`\alpha = 0.05`],
      ].map(([label, math]) => (
        <div key={label} className="flex items-center justify-between gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <span className="text-body-xs font-black text-[var(--color-text-secondary)]">{label}</span>
          <span dir="ltr" className="text-mono-sm text-[var(--color-text-primary)]">
            <InlineMath math={math} />
          </span>
        </div>
      ))}
    </div>
  );
}

function DecisionCurveMockup(): ReactElement {
  return <DecisionCurveSvg className="h-40 w-full" compact />;
}

function ResultCardMockup(): ReactElement {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[var(--color-accent-teal)]">
        <CheckCircle2 size={22} />
        <span className="text-heading-section font-black">דוחים את <span dir="ltr"><InlineMath math="H_0" /></span></span>
      </div>
      <div className="rounded-lg border border-[var(--color-accent-teal)]/40 bg-[var(--color-accent-teal)]/10 p-4">
        <div dir="ltr" className="text-mono-lg font-black text-[var(--color-text-primary)]">
          <InlineMath math="p = 0.018 < 0.05" />
        </div>
        <p className="mt-2 text-body-sm font-semibold text-[var(--color-text-secondary)]">
          יש עדות סטטיסטית לכך שהממוצע גבוה מ-100.
        </p>
      </div>
    </div>
  );
}

function DecisionCurveSvg({ className, compact = false }: SVGProps<SVGSVGElement> & { compact?: boolean }): ReactElement {
  const height = compact ? 160 : 260;
  const viewBox = `0 0 720 ${height}`;
  const gradientId = useId().replace(/:/g, '');

  return (
    <svg className={className} viewBox={viewBox} role="img" aria-label="עקומת בדיקת השערות עם אזור דחייה">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="var(--color-accent-cobalt)" stopOpacity="0.05" />
          <stop offset="70%" stopColor="var(--color-accent-teal)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--color-accent-crimson)" stopOpacity="0.28" />
        </linearGradient>
      </defs>
      <rect width="720" height={height} rx="16" fill="var(--color-background)" opacity="0.7" />
      <path
        d={`M40 ${height - 38} C120 ${height - 36}, 155 ${height - 118}, 225 ${height - 120} C285 ${height - 122}, 300 36, 365 36 C430 36, 445 ${height - 122}, 505 ${height - 120} C575 ${height - 118}, 600 ${height - 36}, 680 ${height - 38} L680 ${height - 28} L40 ${height - 28} Z`}
        fill={`url(#${gradientId})`}
      />
      <path
        d={`M40 ${height - 38} C120 ${height - 36}, 155 ${height - 118}, 225 ${height - 120} C285 ${height - 122}, 300 36, 365 36 C430 36, 445 ${height - 122}, 505 ${height - 120} C575 ${height - 118}, 600 ${height - 36}, 680 ${height - 38}`}
        fill="none"
        stroke="var(--color-accent-cobalt)"
        strokeWidth="4"
      />
      <line x1="360" x2="360" y1="42" y2={height - 28} stroke="var(--color-accent-brass)" strokeWidth="3" strokeDasharray="8 8" />
      <line x1="555" x2="555" y1="70" y2={height - 28} stroke="var(--color-accent-crimson)" strokeWidth="3" />
      <line x1="610" x2="610" y1="105" y2={height - 28} stroke="var(--color-accent-teal)" strokeWidth="3" />
      <text x="360" y={height - 10} textAnchor="middle" fill="var(--color-accent-brass)" fontSize="18" fontWeight="700">H0</text>
      <text x="555" y={height - 10} textAnchor="middle" fill="var(--color-accent-crimson)" fontSize="18" fontWeight="700">zα</text>
      <text x="610" y={height - 10} textAnchor="middle" fill="var(--color-accent-teal)" fontSize="18" fontWeight="700">z</text>
    </svg>
  );
}
