import { useState, type ReactElement, type SVGProps } from 'react';
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
      <section className="grid min-h-[calc(100vh-140px)] grid-cols-1 items-center gap-8 py-6 lg:grid-cols-[0.95fr_1.05fr] lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="space-y-7"
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
          className="curve-glow rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-6"
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

const CAROUSEL_ITEMS = [
  {
    id: 1,
    title: 'קליטת נתונים מהירה ונוחה',
    description: (
      <>
        לדוגמה: התפלגות ממוצע IQ בעולם מתוך מדגם: 1,212,714 שנלקח לשנת 2025<br />
        <span className="text-sm opacity-80 mt-1 inline-block">
          מקור: <a href="https://international-iq-test.com/he/test/IQ_by_country" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-accent-cobalt)]">International IQ Test</a>
        </span>
      </>
    ),
    image: '/images/carousel-inputs.png',
  },
  {
    id: 2,
    title: 'גרף אינטראקטיבי והחלטה חזותית',
    image: '/images/carousel-graph.png',
  },
  {
    id: 3,
    title: 'מטריצת החלטה 2X2',
    image: '/images/carousel-matrix.png',
  },
  {
    id: 4,
    title: 'פירוט 6 שלבי הפתרון הסטטיסטי',
    image: '/images/carousel-steps.png',
  }
];

function FeatureCarousel(): ReactElement {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]" dir="rtl">
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-[var(--color-surface-raised)] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={CAROUSEL_ITEMS[currentIndex].image}
            alt={CAROUSEL_ITEMS[currentIndex].title}
            className="w-full h-full object-contain"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 800 500"><rect width="800" height="500" fill="%231e1e24"/><text x="50%" y="45%" font-family="sans-serif" font-size="28" fill="%23888" text-anchor="middle">תמונה חסרה</text><text x="50%" y="55%" font-family="sans-serif" font-size="16" fill="%23666" text-anchor="middle">נא להעלות לתיקייה: ' + CAROUSEL_ITEMS[currentIndex].image + '</text></svg>';
            }}
          />
        </AnimatePresence>

        <button 
          onClick={nextSlide} 
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-surface)]/80 p-1.5 sm:p-2 text-[var(--color-text-primary)] shadow-md hover:bg-[var(--color-surface)] backdrop-blur-sm transition-colors border border-[var(--color-border)] z-10"
          aria-label="הבא"
        >
          <ChevronRight size={24} />
        </button>
        <button 
          onClick={prevSlide} 
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-surface)]/80 p-1.5 sm:p-2 text-[var(--color-text-primary)] shadow-md hover:bg-[var(--color-surface)] backdrop-blur-sm transition-colors border border-[var(--color-border)] z-10"
          aria-label="הקודם"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {CAROUSEL_ITEMS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 w-2.5 rounded-full transition-colors shadow-sm ${idx === currentIndex ? 'bg-[var(--color-accent-cobalt)] scale-110' : 'bg-[var(--color-border)]/80 hover:bg-[var(--color-text-secondary)]'}`}
              aria-label={`עבור לשקופית ${idx + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="p-4 sm:p-5 text-center border-t border-[var(--color-border)] bg-[var(--color-surface)] min-h-[100px] flex flex-col justify-center items-center">
        <h3 className="font-black text-[var(--color-text-primary)] text-lg sm:text-xl">
          {CAROUSEL_ITEMS[currentIndex].title}
        </h3>
        {CAROUSEL_ITEMS[currentIndex].description && (
          <p className="mt-2 text-[var(--color-text-secondary)] font-semibold text-sm sm:text-base leading-relaxed">
            {CAROUSEL_ITEMS[currentIndex].description}
          </p>
        )}
      </div>
    </div>
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

  return (
    <svg className={className} viewBox={viewBox} role="img" aria-label="עקומת בדיקת השערות עם אזור דחייה">
      <defs>
        <linearGradient id="curveFill" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="var(--color-accent-cobalt)" stopOpacity="0.05" />
          <stop offset="70%" stopColor="var(--color-accent-teal)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--color-accent-crimson)" stopOpacity="0.28" />
        </linearGradient>
      </defs>
      <rect width="720" height={height} rx="16" fill="var(--color-background)" opacity="0.7" />
      <path
        d={`M40 ${height - 38} C120 ${height - 36}, 155 ${height - 118}, 225 ${height - 120} C285 ${height - 122}, 300 36, 365 36 C430 36, 445 ${height - 122}, 505 ${height - 120} C575 ${height - 118}, 600 ${height - 36}, 680 ${height - 38} L680 ${height - 28} L40 ${height - 28} Z`}
        fill="url(#curveFill)"
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
