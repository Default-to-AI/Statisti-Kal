import { type ReactElement, useState, useEffect, useMemo } from 'react';
import { AreaChart, Calculator, BookOpen, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { InlineMath } from 'react-katex';
import SiteFooter from './SiteFooter';
import SiteHeader, { type SitePage } from './SiteHeader';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { PageLayout } from './ui/PageLayout';
import { FeatureShowcase } from './FeatureShowcase';

interface LandingPageProps {
  onNavigate: (page: SitePage) => void;
  onTryHypothesis: () => void;
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
        className="absolute bottom-0 right-0 left-0 border-b-2 border-[var(--color-accent-brass)]/50"
        aria-hidden="true"
      />
      <span className="font-['Times_New_Roman'] font-bold text-[var(--color-accent-brass)] drop-shadow-sm">
        {text}
      </span>
      <span className="animate-pulse text-[var(--color-accent-brass)]/70">|</span>
    </span>
  );
}

function ScatteredImages(): ReactElement {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setOffset((prev) => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const images = [
    { src: '/public_images/landing-showcase-2026-06-22/solution-steps.png', alt: 'שלבי פתרון' },
    { src: '/public_images/landing-showcase-2026-06-22/t-table.png', alt: 'טבלת T' },
    { src: '/public_images/landing-showcase-2026-06-22/z-table.png', alt: 'טבלת Z' },
    { src: '/public_images/landing-showcase-2026-06-22/formula-sheet.png', alt: 'דף נוסחאות' },
    { src: '/images/hero/hero-hypothesis-chart.png', alt: 'בדיקת השערות' },
  ];

  const positions = [
    // 0: Deepest background - spread far left
    { angle: -15, x: '-45%', y: '-15%', scale: 0.65, z: 10 },
    // 1: Background - top left
    { angle: 12, x: '-15%', y: '-35%', scale: 0.6, z: 15 },
    // 2: Background - spread far left and down
    { angle: -8, x: '-50%', y: '25%', scale: 0.7, z: 20 },
    // 3: Midground - bottom left/center
    { angle: 8, x: '-10%', y: '35%', scale: 0.65, z: 25 },
    // 4: Center (Main focus) - positioned slightly right (closer to text)
    { angle: -2, x: '15%', y: '5%', scale: 1.05, z: 40 },
  ];

  return (
    <div className="relative w-full aspect-square md:aspect-[16/10] flex items-center justify-center pointer-events-none mt-10 lg:mt-0">
      {images.map((img, i) => {
        const posIndex = (i + offset) % 5;
        const pos = positions[posIndex];
        const isCenter = posIndex === 4;

        return (
          <div
            key={img.src}
            onClick={() => setOffset((4 - i + 5) % 5)}
            className="absolute transition-all duration-1000 ease-out shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface)] pointer-events-auto cursor-pointer"
            style={{
              transform: `translate(${pos.x}, ${pos.y}) rotate(${pos.angle}deg) scale(${pos.scale})`,
              zIndex: pos.z,
              width: '75%',
              aspectRatio: '16/10'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-10" />
            
            <div className="h-6 bg-[var(--color-surface-raised)] border-b border-[var(--color-border)] flex items-center gap-1.5 px-3">
               <div className="w-2 h-2 rounded-full bg-[var(--color-accent-crimson)] opacity-80"></div>
               <div className="w-2 h-2 rounded-full bg-[var(--color-accent-brass)] opacity-80"></div>
               <div className="w-2 h-2 rounded-full bg-[var(--color-accent-teal)] opacity-80"></div>
            </div>
            
            <img 
               src={img.src} 
               alt={img.alt} 
               className={`w-full h-[calc(100%-1.5rem)] object-cover object-top transition-all duration-1000 ${isCenter ? 'brightness-100' : 'brightness-50 hover:brightness-75'}`}
               onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function LandingPage({ onNavigate, onTryHypothesis }: LandingPageProps): ReactElement {
  return (
    <PageLayout
      header={<SiteHeader activePage="landing" onNavigate={onNavigate} />}
      footer={<SiteFooter onNavigate={onNavigate} />}
      contentWidthClassName="max-w-none"
    >
      <main className="relative flex w-full flex-col overflow-hidden">
        {/* Hero Section */}
        <div className="relative isolate px-6 pt-8 lg:pt-14 pb-20 mb-12 overflow-hidden">
          <div className="absolute inset-0 -z-20 h-full w-full bg-[var(--color-background)] bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[var(--color-accent-cobalt)] to-[var(--color-accent-teal)] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>

          <div className="max-w-[90rem] mx-auto flex flex-col lg:flex-row items-center gap-8 relative z-10">
            {/* Text Content */}
            <div className="text-center lg:text-right lg:w-5/12 px-4 sm:px-6 relative z-20">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent-cobalt-bg)] text-[var(--color-accent-cobalt)] font-medium text-sm mb-8 border border-[var(--color-accent-cobalt-line)] shadow-sm animate-pulse backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                <span>גרסה 2.0 - פחות חישובים, יותר הבנה</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[var(--color-text-primary)] tracking-tight mb-8">
                <span className="block mb-2 font-display">סטטיסטי-קל</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-cobalt)] to-[var(--color-accent-teal)] pb-2 font-display">
                  הקץ לטכניקה.
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-[var(--color-text-secondary)] mb-12 leading-relaxed max-w-xl mx-auto lg:mx-0">
                המחשב עושה לכם את כל הטכניקה והחישובים. לכם נשאר רק להתמקד{' '}
                <TypewriterEffect words={['ברציונל', 'בסמנטיקה', 'בנשמה']} />{' '}
                של הסטטיסטיקה.
              </p>

              <div className="flex flex-row justify-center lg:justify-start gap-4 flex-wrap">
                <Button
                  size="lg"
                  onClick={onTryHypothesis}
                  className="group transform transition-all duration-300 hover:scale-105 shadow-xl shadow-[var(--color-accent-cobalt-bg)] h-14 px-8 text-lg whitespace-nowrap"
                  leftIcon={<Calculator className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" />}
                >
                  התחל בדיקת השערות
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => onNavigate('forward')}
                  className="group transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-[var(--color-surface-raised)] border-2 border-[var(--color-border)] h-14 px-8 text-lg bg-[var(--color-surface)]/50 backdrop-blur-sm whitespace-nowrap"
                  leftIcon={<AreaChart className="w-6 h-6 text-[var(--color-accent-cobalt)] transition-transform duration-300 group-hover:-translate-y-1" />}
                >
                  התפלגות נורמלית
                </Button>
              </div>
            </div>

            {/* Visual/Mockup Content */}
            <div className="lg:w-7/12 w-full max-w-4xl px-4 sm:px-6 relative z-10">
              <ScatteredImages />
            </div>
          </div>

          <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)] pointer-events-none" aria-hidden="true">
            <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[var(--color-accent-teal)] to-[var(--color-accent-cobalt)] opacity-15 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
          </div>
        </div>

        <FeatureShowcase />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-display-h2 text-center text-[var(--color-text-primary)] mb-12">הכלים שלנו</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent-cobalt-line)] hover:-translate-y-1">
              <div className="w-16 h-16 bg-[var(--color-accent-cobalt-bg)] text-[var(--color-accent-cobalt)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--color-accent-cobalt-line)]">
                <Calculator className="w-8 h-8" />
              </div>
              <h3 className="text-heading-section font-bold text-[var(--color-text-primary)] mb-3">בדיקת השערות</h3>
              <p className="text-body-sm text-[var(--color-text-secondary)] mb-6 flex-grow font-medium">
                מחשבון שלם לבדיקת השערות על תוחלת. לא צריך לזכור נוסחאות, רק להבין מה המסקנה. הפיצ'פקעס עלינו.
              </p>
              <Button variant="ghost" className="w-full justify-center group" onClick={onTryHypothesis}>
                למחשבון <ArrowRight className="ml-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Card>

            <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent-teal)]/40 hover:-translate-y-1">
              <div className="w-16 h-16 bg-[var(--color-accent-teal)]/10 text-[var(--color-accent-teal)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--color-accent-teal)]/30">
                <AreaChart className="w-8 h-8" />
              </div>
              <h3 className="text-heading-section font-bold text-[var(--color-text-primary)] mb-3">התפלגות נורמלית</h3>
              <p className="text-body-sm text-[var(--color-text-secondary)] mb-6 flex-grow font-medium">
                חישוב שטחים (הסתברויות) תחת העקומה הנורמלית. מהיר יותר מטבלת <InlineMath math="Z" />, ובלי לטעות בשורה.
              </p>
              <Button variant="ghost" className="w-full justify-center group" onClick={() => onNavigate('forward')}>
                למחשבון <ArrowRight className="ml-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Card>

            <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent-brass)]/40 hover:-translate-y-1">
              <div className="w-16 h-16 bg-[var(--color-accent-brass)]/10 text-[var(--color-accent-brass)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--color-accent-brass)]/30">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-heading-section font-bold text-[var(--color-text-primary)] mb-3">דף נוסחאות</h3>
              <p className="text-body-sm text-[var(--color-text-secondary)] mb-6 flex-grow font-medium">
                כל הנוסחאות מסודרות במקום אחד. כי בעידן המודרני אין סיבה לשנן בעל פה (טכניקה זה אויב).
              </p>
              <Button variant="ghost" className="w-full justify-center group" onClick={() => onNavigate('formula-sheet')}>
                לדף הנוסחאות <ArrowRight className="ml-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Card>
          </div>
        </div>

        <div className="bg-[var(--color-surface-raised)] border-y border-[var(--color-border)] py-20 mt-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-display-h2 font-display text-[var(--color-text-primary)] mb-10">למה סטטיסטי-קל?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
              <div className="flex gap-4 items-start bg-[var(--color-surface)] p-6 rounded-[24px] border border-[var(--color-border)] shadow-sm">
                <div className="shrink-0 mt-1 bg-[var(--color-accent-cobalt-bg)] p-3 rounded-xl border border-[var(--color-accent-cobalt-line)] text-[var(--color-accent-cobalt)] shadow-inner">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-[var(--color-text-primary)] mb-2">חישובים אוטומטיים</h4>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">הזן נתונים, קבל תוצאות. <InlineMath math="Z" />, <InlineMath math="T" />, <InlineMath math="P\text{-Value}" /> – הכל מחושב בשבריר שנייה. די עם הטכניקות.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start bg-[var(--color-surface)] p-6 rounded-[24px] border border-[var(--color-border)] shadow-sm">
                <div className="shrink-0 mt-1 bg-[var(--color-accent-teal)]/10 p-3 rounded-xl border border-[var(--color-accent-teal)]/30 text-[var(--color-accent-teal)] shadow-inner">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-[var(--color-text-primary)] mb-2">דיוק ואמינות</h4>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">מבוסס על נוסחאות סטטיסטיות מדויקות, מונע טעויות חישוב ידניות (כמו להעביר אגפים לא נכון).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
