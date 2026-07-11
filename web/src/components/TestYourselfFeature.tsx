import type { ReactElement } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleGauge,
  Lightbulb,
  ListChecks,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react';
import { ScrollReveal } from './landing-template/TemplatePrimitives';
import { Button } from './ui/Button';

interface TestYourselfFeatureProps {
  onStart: () => void;
}

const featureSteps = [
  {
    icon: CircleGauge,
    title: 'רמה שמתאימה לכם',
    description: 'קל, בינוני, קשה או סימולציית מבחן מלאה.',
    tone: 'text-[var(--color-primary)] bg-[var(--color-primary)]/12 border-[var(--color-primary)]/25',
  },
  {
    icon: ListChecks,
    title: 'בדיקה וציון אוטומטיים',
    description: 'מסיימים, שולחים ומקבלים ציון מפורט במקום.',
    tone: 'text-[var(--chart-2)] bg-[var(--chart-2)]/10 border-[var(--chart-2)]/25',
  },
  {
    icon: Target,
    title: 'ניווט ישיר בין טעויות',
    description: 'עוברים מטעות לטעות בלי לחפש לאורך המבחן.',
    tone: 'text-[var(--color-accent-crimson)] bg-[var(--color-accent-crimson)]/10 border-[var(--color-accent-crimson)]/25',
  },
  {
    icon: Lightbulb,
    title: 'מבינים אחרי ההגשה',
    description: 'כל תשובה מקבלת הסבר — למה היא נכונה או איפה הטעות.',
    tone: 'text-[var(--color-accent-cobalt)] bg-[var(--color-accent-cobalt-bg)] border-[var(--color-accent-cobalt-line)]',
  },
] as const;

function ExamPreview(): ReactElement {
  return (
    <div className="relative mx-auto w-full max-w-[38rem]" aria-hidden="true">
      <div className="absolute -inset-10 -z-10 rounded-full bg-[var(--color-primary)]/7 blur-3xl" />
      <div className="relative overflow-hidden rounded-[28px] border border-[var(--color-border)]/70 bg-[var(--color-background)]/72 shadow-[0_24px_70px_rgba(0,0,0,0.14)] backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4">
          <div>
            <div className="text-xs font-bold text-[var(--color-text-secondary)]">מבחן רמה בינונית</div>
            <div className="mt-1 text-lg font-bold text-[var(--color-text-primary)]">בדיקת השערות</div>
          </div>
          <div className="rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-3 py-1 font-mono text-sm font-bold text-[var(--color-primary)]">
            08 / 10
          </div>
        </div>

        <div className="space-y-3 p-5">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-bold text-[var(--color-text-primary)]">שאלה 7</span>
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">2 נקודות</span>
            </div>
            <div className="h-2.5 w-4/5 rounded-full bg-[var(--color-text-secondary)]/18" />
            <div className="mt-2 h-2.5 w-3/5 rounded-full bg-[var(--color-text-secondary)]/12" />
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-xl border border-[var(--color-success)]/35 bg-[var(--color-success)]/10 px-3 py-2 text-sm font-semibold text-[var(--color-success)]">
                <CheckCircle2 className="h-4 w-4" /> התשובה הנכונה
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[var(--color-error)]/35 bg-[var(--color-error)]/10 px-3 py-2 text-sm font-semibold text-[var(--color-error)]">
                <XCircle className="h-4 w-4" /> התשובה שסומנה
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-accent-cobalt-line)] bg-[var(--color-accent-cobalt-bg)] p-4">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-accent-cobalt)]" />
            <div>
              <div className="text-sm font-bold text-[var(--color-text-primary)]">הסבר לתשובה</div>
              <div className="mt-2 h-2 w-11/12 rounded-full bg-[var(--color-accent-cobalt)]/18" />
              <div className="mt-2 h-2 w-4/6 rounded-full bg-[var(--color-accent-cobalt)]/12" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3">
          <ChevronUp className="h-5 w-5 text-[var(--color-text-secondary)]" />
          <span className="text-sm font-bold text-[var(--color-error)]">טעות 1 מתוך 2</span>
          <ChevronDown className="h-5 w-5 text-[var(--color-text-secondary)]" />
        </div>
      </div>

      <div className="absolute -left-3 top-20 flex animate-[bounce_3s_infinite] items-center gap-2 rounded-full border border-[var(--color-success)]/30 bg-[var(--color-background)] px-3 py-2 text-xs font-bold text-[var(--color-success)] shadow-lg motion-reduce:animate-none sm:-left-8">
        <CheckCircle2 className="h-4 w-4" /> נבדק אוטומטית
      </div>
      <div className="absolute -bottom-5 -right-2 flex animate-[pulse_2.8s_infinite] items-center gap-2 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-background)] px-4 py-2 font-mono text-sm font-bold text-[var(--color-primary)] shadow-lg motion-reduce:animate-none sm:-right-7">
        <Sparkles className="h-4 w-4" /> 80 / 100
      </div>
    </div>
  );
}

export function TestYourselfFeature({ onStart }: TestYourselfFeatureProps): ReactElement {
  return (
    <section className="relative isolate overflow-hidden py-20 sm:py-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_48%,var(--color-accent-cobalt-bg),transparent_31%),radial-gradient(circle_at_82%_52%,color-mix(in_srgb,var(--color-accent-brass)_7%,transparent),transparent_28%)] opacity-70" />
      <div className="mx-auto grid max-w-[90rem] items-center gap-14 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20 lg:px-8">
        <ScrollReveal distance={24} duration={0.5}>
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10 px-3 py-1.5 text-sm font-bold text-[var(--color-primary)]">
              <Sparkles className="h-4 w-4" /> בחן את עצמך
            </div>
            <h2 className="text-display-h2 leading-tight text-[var(--color-text-primary)]">
              לא רק לפתור. לדעת בדיוק
              <span className="block font-handwriting text-[1.12em] text-[var(--color-primary)] -rotate-1">מה עדיין לא יושב.</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
              בחרו רמה, פתרו בקצב שלכם וקבלו משוב שבאמת עוזר להתקדם — ציון מיידי, מעבר חכם בין טעויות והסבר מלא אחרי ההגשה.
            </p>

            <div className="mt-8 grid gap-x-8 sm:grid-cols-2">
              {featureSteps.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group flex items-start gap-3 border-b border-[var(--color-border)]/65 py-4 transition duration-300 hover:border-[var(--color-primary)]/35 motion-reduce:transform-none"
                    style={{ transitionDelay: `${index * 35}ms` }}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${feature.tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-[var(--color-text-primary)]">{feature.title}</div>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              size="lg"
              variant="primary"
              onClick={onStart}
              className="group mt-8 min-w-56 font-bold"
              rightIcon={<ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1 motion-reduce:transform-none" />}
            >
              התחילו מבחן
            </Button>
          </div>
        </ScrollReveal>

        <ScrollReveal distance={30} duration={0.6}>
          <ExamPreview />
        </ScrollReveal>
      </div>
    </section>
  );
}
