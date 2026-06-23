import { useState, useEffect, type ReactElement } from 'react';
import { MousePointerClick, Calculator, LineChart, MessageSquareQuote } from 'lucide-react';
import { InlineMath } from 'react-katex';
import { ScrollReveal } from './landing-template/TemplatePrimitives';

const features = [
  {
    id: 0,
    title: "הזנת נתונים נטולת פיצ'פקעס",
    description: "תזינו את הנתונים היבשים של המדגם. אין צורך להעביר אגפים או לשנן הצבות – הטכניקה היא אויב. המחשב עושה את השאר.",
    icon: MousePointerClick,
    image: "/images/carousel-inputs.png",
    tone: "teal" as const
  },
  {
    id: 1,
    title: "חישובים שמשאירים מקום לנשמה",
    description: <><InlineMath math="P\text{-Value}" />, ערכים קריטיים וטבלאות <InlineMath math="Z" /> או <InlineMath math="T" />? הכל מחושב אוטומטית. לכם רק נשאר לשלוט בשפה ולהבין את הרציונל.</>,
    icon: Calculator,
    image: "/images/carousel-matrix.png",
    tone: "cobalt" as const
  },
  {
    id: 2,
    title: "תצוגה גרפית של המהות",
    description: "לראות את אזורי הדחייה והקבלה בעיניים. כדי שתבינו את הרעיון והמוטיבציה, ולא סתם תהיו רובוטים של טכניקה.",
    icon: LineChart,
    image: "/images/carousel-graph.png",
    tone: "brass" as const
  },
  {
    id: 3,
    title: "מסקנה אופרטיבית לגופו של עניין",
    description: "התוצאה מובהקת? המערכת מפיקה מסקנה מחקרית על האוכלוסייה בסמנטיקה הנכונה, שלא תגידו לי 'לא ידעתי איך לנסח'.",
    icon: MessageSquareQuote,
    image: "/images/carousel-steps.png",
    tone: "cobalt" as const
  }
];

export function FeatureShowcase(): ReactElement {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play interval
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <section className="w-full space-y-8">
      <ScrollReveal>
        <div className="space-y-4 text-center mb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="accent-bar" />
            <span className="text-heading-label font-black text-[var(--color-accent-brass)]">פחות טכניקה שחורה</span>
          </div>
          <h2 className="block text-display-h2 text-[var(--color-text-primary)]">
            איך המערכת עוזרת לכם להתמקד בעיקר?
          </h2>
          <p className="mx-auto block max-w-3xl text-body-lg font-semibold text-[var(--color-text-secondary)]">
            יותר הבנה של הרציונל הסטטיסטי מאחורי המספרים
          </p>
        </div>
      </ScrollReveal>
      
      <div className="flex flex-col lg:flex-row gap-10 items-center">
        {/* Right Column: Clickable Tabs */}
        <div className="w-full lg:w-1/2 space-y-4 flex flex-col justify-center">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isActive = activeFeature === index;
            
            // Tone mapping for active states
            let activeBgClass = 'bg-[var(--color-accent-cobalt-bg)]';
            let activeBorderClass = 'border-[var(--color-accent-cobalt-line)]';
            let iconBgClass = 'bg-[var(--color-accent-cobalt)] text-white shadow-md shadow-[var(--color-accent-cobalt)]/20';
            let titleClass = 'text-[var(--color-accent-cobalt)]';
            
            if (feature.tone === 'teal') {
              activeBgClass = 'bg-[rgba(46,196,182,0.12)]';
              activeBorderClass = 'border-[var(--color-accent-teal)]/40';
              iconBgClass = 'bg-[var(--color-accent-teal)] text-[var(--color-background)] shadow-md shadow-[var(--color-accent-teal)]/20';
              titleClass = 'text-[var(--color-accent-teal)]';
            } else if (feature.tone === 'brass') {
              activeBgClass = 'bg-[rgba(212,168,67,0.12)]';
              activeBorderClass = 'border-[var(--color-accent-brass)]/40';
              iconBgClass = 'bg-[var(--color-accent-brass)] text-[var(--color-background)] shadow-md shadow-[var(--color-accent-brass)]/20';
              titleClass = 'text-[var(--color-accent-brass)]';
            }

            return (
              <button
                key={feature.id}
                onClick={() => {
                  setActiveFeature(index);
                  setIsAutoPlaying(false);
                }}
                className={`w-full text-right p-5 rounded-[24px] transition-all duration-300 border ${
                  isActive 
                    ? `${activeBgClass} ${activeBorderClass} scale-[1.02] shadow-[0_8px_32px_rgba(0,0,0,0.12)]` 
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-text-secondary)]/50 hover:bg-[var(--color-surface-raised)]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-[16px] shrink-0 transition-colors duration-300 ${
                    isActive ? iconBgClass : 'bg-[var(--color-background)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
                  }`}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <div>
                    <h3 className={`text-heading-section font-bold mb-1 transition-colors duration-300 ${
                      isActive ? titleClass : 'text-[var(--color-text-primary)]'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`leading-relaxed text-body-sm font-medium transition-colors duration-300 ${
                      isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Left Column: Image Display container */}
        <div className="w-full lg:w-1/2 h-[400px] sm:h-[550px] relative rounded-[32px] overflow-hidden border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(26,29,36,0.96),rgba(13,15,20,0.98))] flex items-center justify-center p-6 shadow-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,204,21,0.02),transparent_22%,transparent_72%,rgba(46,196,182,0.03))]" />
          
          {features.map((feature, index) => (
            <div
              key={`img-${feature.id}`}
              className={`absolute inset-0 transition-all duration-700 ease-out flex items-center justify-center p-8 ${
                activeFeature === index 
                  ? 'opacity-100 z-10 translate-y-0 scale-100' 
                  : 'opacity-0 z-0 translate-y-8 scale-95 pointer-events-none'
              }`}
            >
              <img
                src={feature.image}
                alt={feature.title}
                className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-[16px]"
              />
            </div>
          ))}
          
          {/* Decorative background glow that matches active feature */}
          <div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[80px] pointer-events-none transition-colors duration-700 opacity-20 ${
              features[activeFeature].tone === 'brass' ? 'bg-[var(--color-accent-brass)]' :
              features[activeFeature].tone === 'teal' ? 'bg-[var(--color-accent-teal)]' :
              'bg-[var(--color-accent-cobalt)]'
            }`} 
          />
        </div>
      </div>
    </section>
  );
}
