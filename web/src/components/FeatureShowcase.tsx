import { useEffect, useState, type ReactElement, type ReactNode } from 'react';
import {
  Calculator,
  LineChart,
  MessageSquareQuote,
  MousePointerClick,
  type LucideIcon,
} from 'lucide-react';
import { ScrollReveal } from './landing-template/TemplatePrimitives';

type FeatureTone = 'teal' | 'cobalt' | 'brass';

interface FeatureItem {
  id: number;
  title: string;
  description: ReactNode;
  icon: LucideIcon;
  images: string[];
  tone: FeatureTone;
  moodLabel: string;
  imageLabel: string;
  insight: string;
}

const features: FeatureItem[] = [
  {
    id: 0,
    title: 'הזנת נתונים',
    description: "מזינים את הנתונים היבשים, והאתר עושה את השאר. להבין את ה-'מה?' מבלי להתעכב על ה-'איך?'.",
    icon: MousePointerClick,
    images: ['/images/input-parameters.png'],
    tone: 'teal',
    moodLabel: 'קלט חכם',
    imageLabel: 'פרמטרים והשערות מחקר',
    insight: 'המסך צריך להדגיש מה כל שדה מייצג, לא רק להציג צילום מוקטן בתוך חלל ריק.',
  },
  {
    id: 1,
    title: 'תבינו את הנשמה מאחורי החישובים',
    description: <>היום הכול מחושב אוטומטית. לכן, חייבים לשלוט בשפה ולהבין את הרציונל.</>,
    icon: Calculator,
    images: ['/images/background.png'],
    tone: 'cobalt',
    moodLabel: 'הקשר מחקרי',
    imageLabel: 'רציונל והשערות מבחן',
    insight: 'הצילום צריך להרגיש כמו טקסט חי שמסביר את ההיגיון האקדמי, לא כמו מסמך פסיבי.',
  },
  {
    id: 2,
    title: 'לראות את המהות דרך הגרף',
    description: 'ברגע שתראו - תבינו. צריך להבין גם עם העיניים, לא רק עם הראש.',
    icon: LineChart,
    images: ['/images/visualization.png'],
    tone: 'brass',
    moodLabel: 'גרף שמכריע',
    imageLabel: 'התפלגויות ואזור קריטי',
    insight: 'הגרף הוא הגיבור. מה שצריך לבלוט הוא איפה ההכרעה נשברת, לא עוד container מסביב.',
  },
  {
    id: 3,
    title: 'ניסוחים מדוייקים נאמנים למקור',
    description: 'סטטיסטיקאים כנראה לא תהיו. אבל את הניסוחים הרשמיים שלהם, את השפה, המוטיבציה, חשוב להכיר.',
    icon: MessageSquareQuote,
    images: ['/images/definitions.png', '/images/terminology.png', '/images/terminology-3.png'],
    tone: 'cobalt',
    moodLabel: 'שפה פורמלית',
    imageLabel: 'הגדרות וניסוחים מוכנים',
    insight: 'כאן הכוח הוא ביכולת לחשוף ניסוחים מדויקים בשכבות, לא בלהעמיס שלושה widgets נפרדים.',
  },
];

function getToneClasses(tone: FeatureTone): {
  border: string;
  background: string;
  icon: string;
  text: string;
  glow: string;
  shadow: string;
} {
  if (tone === 'teal') {
    return {
      border: 'border-[var(--chart-2)]/35',
      background: 'bg-[rgba(46,196,182,0.12)]',
      icon: 'bg-[var(--chart-2)] text-[var(--color-background)]',
      text: 'text-[var(--chart-2)]',
      glow: 'bg-[var(--chart-2)]/18',
      shadow: 'shadow-[0_0_0_1px_rgba(46,196,182,0.18),0_24px_80px_rgba(46,196,182,0.12)]',
    };
  }

  if (tone === 'brass') {
    return {
      border: 'border-[var(--color-primary)]/35',
      background: 'bg-[rgba(212,168,67,0.12)]',
      icon: 'bg-[var(--color-primary)] text-[var(--color-background)]',
      text: 'text-[var(--color-primary)]',
      glow: 'bg-[var(--color-primary)]/18',
      shadow: 'shadow-[0_0_0_1px_rgba(212,168,67,0.18),0_24px_80px_rgba(212,168,67,0.12)]',
    };
  }

  return {
    border: 'border-[var(--color-accent-cobalt-line)]',
    background: 'bg-[var(--color-accent-cobalt-bg)]',
    icon: 'bg-[var(--color-accent-cobalt)] text-white',
    text: 'text-[var(--color-accent-cobalt)]',
    glow: 'bg-[var(--color-accent-cobalt)]/18',
    shadow: 'shadow-[0_0_0_1px_rgba(84,160,255,0.16),0_24px_80px_rgba(84,160,255,0.12)]',
  };
}

function TheaterStage({
  features,
  activeFeature,
}: {
  features: FeatureItem[];
  activeFeature: number;
}): ReactElement {
  const feature = features[activeFeature];
  const tone = getToneClasses(feature.tone);

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border bg-[linear-gradient(180deg,rgba(15,18,25,0.98),rgba(10,12,18,0.98))] p-4 xl:h-[466px] xl:w-[1000px] xl:max-w-[1000px] ${tone.border} ${tone.shadow}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.08),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.02),transparent_55%)]" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent-crimson)]/85" />
          <span className={`h-2.5 w-2.5 rounded-full ${tone.background}`} />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--chart-2)]/70" />
        </div>
        <div className="text-xs font-semibold tracking-[0.18em] text-[var(--color-text-secondary)]">
          {feature.imageLabel}
        </div>
      </div>

      <div className="relative mt-2 h-[21rem] rounded-[24px] border border-white/8 bg-[rgba(255,255,255,0.03)] p-3 md:h-[24rem] xl:h-[410px]">
        <div className="relative h-full w-full overflow-hidden rounded-[20px]">
          {features.map((item, index) => {
            const isActive = index === activeFeature;

            return (
              <div
                key={item.id}
                className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActive ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-6 scale-[0.992] opacity-0'
                }`}
              >
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="h-full w-full object-contain"
                  loading={isActive ? 'eager' : 'lazy'}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function FeatureShowcase(): ReactElement {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveFeature((previous) => (previous + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const feature = features[activeFeature];

  return (
    <section className="w-full space-y-8">
      <ScrollReveal>
        <div className="mb-8 text-center">
          <h2
            data-toc
            id="landing-focus"
            className="flex items-center justify-center gap-4 text-display-h2 text-[var(--color-text-primary)]"
          >
            <span
              className="hidden h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(212,168,67,0.55),transparent)] sm:block"
              aria-hidden="true"
            />
            <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span>בלי כל</span>
              <span className="font-handwriting text-[1.18em] text-[var(--color-primary)] -rotate-2">
                הטכניקה
              </span>
              <span>השחורה</span>
            </span>
            <span
              className="hidden h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(46,196,182,0.45),transparent)] sm:block"
              aria-hidden="true"
            />
          </h2>
        </div>
      </ScrollReveal>

      <div className="grid gap-6 xl:min-h-[470px] xl:grid-cols-[1000px_minmax(24rem,1fr)] xl:items-start">
        <TheaterStage features={features} activeFeature={activeFeature} />

        <div className="space-y-4 xl:-mr-2">
          {features.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeFeature === index;
            const tone = getToneClasses(item.tone);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveFeature(index);
                  setIsAutoPlaying(false);
                }}
                className={`w-full rounded-[24px] border p-5 text-right transition-all duration-300 ${
                  isActive
                    ? `${tone.border} ${tone.background} scale-[1.01] shadow-[0_18px_40px_rgba(0,0,0,0.18)]`
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-secondary)]/45 hover:bg-[var(--color-surface-raised)]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] ${isActive ? tone.icon : 'bg-[var(--color-background)] text-[var(--color-text-secondary)]'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-lg font-bold ${isActive ? tone.text : 'text-[var(--color-text-primary)]'}`}>{item.title}</div>
                    <div className={`mt-2 text-sm leading-relaxed ${isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                      {item.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
