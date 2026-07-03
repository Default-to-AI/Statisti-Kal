import { type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { BookOpen, BrainCircuit, Calculator, LineChart, Sigma, TableProperties } from 'lucide-react';
import { InlineMath } from 'react-katex';

export type LandingPreviewId =
  | 'hypothesis'
  | 'normal'
  | 'formula'
  | 'helper'
  | 'table';

type PreviewTone = 'cobalt' | 'teal' | 'brass';

interface LandingPreviewSpec {
  id: LandingPreviewId;
  title: string;
  alt: string;
  tone: PreviewTone;
}

export const landingPreviewSpecs: LandingPreviewSpec[] = [
  {
    id: 'hypothesis',
    title: 'בדיקת השערות',
    alt: 'תצוגת בדיקת השערות עם שדות קלט, ניסוח השערות ומסקנה',
    tone: 'cobalt',
  },
  {
    id: 'normal',
    title: 'התפלגות נורמלית',
    alt: 'עקומה נורמלית עם שטח מסומן וכרטיס תוצאה',
    tone: 'teal',
  },
  {
    id: 'formula',
    title: 'דף נוסחאות',
    alt: 'כרטיסי נוסחאות ומקטעי עזר סטטיסטיים',
    tone: 'brass',
  },
  {
    id: 'helper',
    title: 'עוזר סטטיסטי',
    alt: 'עוזר סטטיסטי עם שלבים ושפה מחקרית',
    tone: 'teal',
  },
  {
    id: 'table',
    title: 'טבלאות קריטיות',
    alt: 'טבלת ערכים קריטיים Z ו-T עם סימון עמודות',
    tone: 'brass',
  },
];

function toneStyles(tone: PreviewTone): {
  ring: string;
  bg: string;
  ink: string;
  glow: string;
} {
  if (tone === 'teal') {
    return {
      ring: 'border-[var(--chart-2)]/35',
      bg: 'bg-[rgba(78,205,196,0.12)]',
      ink: 'text-[var(--chart-2)]',
      glow: 'shadow-[0_0_0_1px_rgba(78,205,196,0.12),0_24px_64px_rgba(78,205,196,0.12)]',
    };
  }

  if (tone === 'brass') {
    return {
      ring: 'border-[var(--color-primary)]/30',
      bg: 'bg-[rgba(212,168,67,0.12)]',
      ink: 'text-[var(--color-primary)]',
      glow: 'shadow-[0_0_0_1px_rgba(212,168,67,0.12),0_24px_64px_rgba(212,168,67,0.12)]',
    };
  }

  return {
    ring: 'border-[var(--color-accent-cobalt-line)]',
    bg: 'bg-[var(--color-accent-cobalt-bg)]',
    ink: 'text-[var(--color-accent-cobalt)]',
    glow: 'shadow-[0_0_0_1px_rgba(212,168,67,0.12),0_24px_64px_rgba(212,168,67,0.12)]',
  };
}

function BrowserShell({
  title,
  tone,
  children,
  compact = false,
}: {
  title: string;
  tone: PreviewTone;
  children: ReactElement;
  compact?: boolean;
}): ReactElement {
  const toneClass = toneStyles(tone);

  return (
    <div
      className={`relative overflow-hidden rounded-[26px] border bg-[linear-gradient(180deg,rgba(24,27,33,0.98),rgba(12,14,18,0.98))] ${toneClass.ring} ${toneClass.glow}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.02),transparent_55%)]" />
      <div className="relative flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent-crimson)]/85" />
          <span className={`h-2.5 w-2.5 rounded-full ${toneClass.bg}`} />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--chart-2)]/70" />
        </div>
        <div className="text-[11px] font-semibold tracking-[0.18em] text-[var(--color-text-secondary)] uppercase">
          {title}
        </div>
      </div>
      <div className={`relative ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>{children}</div>
    </div>
  );
}

function Panel({
  className,
  children,
  style,
}: {
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
}): ReactElement {
  return (
    <div
      className={`rounded-[18px] border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] ${className ?? ''}`}
      style={style}
    >
      {children}
    </div>
  );
}

function LabelPill({ text, tone }: { text: string; tone: PreviewTone }): ReactElement {
  const toneClass = toneStyles(tone);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold tracking-[0.14em] ${toneClass.ring} ${toneClass.bg} ${toneClass.ink}`}
    >
      {text}
    </span>
  );
}

function StatLine({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-black/15 px-3 py-2">
      <span className="text-[11px] text-[var(--color-text-secondary)]">{label}</span>
      <span className="font-mono text-[12px] font-semibold text-[var(--color-text-primary)]">{value}</span>
    </div>
  );
}

function BellCurve({ tone }: { tone: PreviewTone }): ReactElement {
  const stroke = tone === 'teal' ? 'var(--chart-2)' : 'var(--color-primary)';
  const fill = tone === 'teal' ? 'rgba(78,205,196,0.22)' : 'rgba(212,168,67,0.18)';

  return (
    <svg viewBox="0 0 240 120" className="h-full w-full">
      <defs>
        <linearGradient id={`curve-fill-${tone}`} x1="0" x2="1">
          <stop offset="0%" stopColor={fill} />
          <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
        </linearGradient>
      </defs>
      <line x1="18" y1="96" x2="222" y2="96" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      <path
        d="M20 96 C58 96, 72 28, 120 28 C168 28, 182 96, 220 96"
        fill="none"
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M120 28 C155 28, 175 66, 192 96 L120 96 Z"
        fill={`url(#curve-fill-${tone})`}
        stroke="none"
      />
      <line x1="120" y1="20" x2="120" y2="96" stroke="rgba(255,255,255,0.18)" strokeDasharray="4 5" />
      <text x="112" y="16" fill="rgba(255,255,255,0.72)" fontSize="10">μ</text>
      <text x="184" y="108" fill="rgba(255,255,255,0.72)" fontSize="10">x₂</text>
    </svg>
  );
}

function HypothesisPreview(): ReactElement {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <LabelPill text="HYPOTHESIS" tone="cobalt" />
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <Calculator className="h-4 w-4" />
          <span className="text-[11px] font-semibold">מבחן חד-צדדי</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Panel className="p-3">
          <div className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-[var(--color-text-secondary)]">קלט</div>
          <div className="space-y-2">
            <StatLine label="x̄" value="73.4" />
            <StatLine label="σ" value="12" />
            <StatLine label="n" value="64" />
          </div>
        </Panel>
        <Panel className="p-3">
          <div className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-[var(--color-text-secondary)]">השערות</div>
          <div className="space-y-2 text-right text-sm text-[var(--color-text-primary)]">
            <div className="rounded-xl bg-black/15 px-3 py-2"><InlineMath math="H_0:\ \mu = 70" /></div>
            <div className="rounded-xl bg-[var(--color-accent-cobalt-bg)]/60 px-3 py-2"><InlineMath math="H_1:\ \mu > 70" /></div>
          </div>
        </Panel>
      </div>
      <Panel className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-[0.12em] text-[var(--color-text-secondary)]">תוצאה</span>
          <span className="rounded-full border border-[var(--chart-2)]/35 bg-[rgba(78,205,196,0.12)] px-3 py-1 text-[10px] font-bold text-[var(--chart-2)]">
            reject H₀
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <StatLine label="Z" value="2.27" />
          <StatLine label="p" value="0.012" />
          <StatLine label="α" value="0.05" />
        </div>
      </Panel>
    </div>
  );
}

function NormalPreview(): ReactElement {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <LabelPill text="NORMAL CURVE" tone="teal" />
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <LineChart className="h-4 w-4" />
          <span className="text-[11px] font-semibold">P(85 &lt; X &lt; 110)</span>
        </div>
      </div>
      <Panel className="h-40 p-3">
        <BellCurve tone="teal" />
      </Panel>
      <div className="grid grid-cols-3 gap-2">
        <StatLine label="μ" value="100" />
        <StatLine label="σ" value="15" />
        <StatLine label="P" value="0.6306" />
      </div>
    </div>
  );
}

function FormulaPreview(): ReactElement {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <LabelPill text="FORMULA SHEET" tone="brass" />
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <BookOpen className="h-4 w-4" />
          <span className="text-[11px] font-semibold">דף עזר אקדמי</span>
        </div>
      </div>
      <div className="grid gap-3">
        <Panel className="p-3">
          <div className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-[var(--color-text-secondary)]">רווח סמך</div>
          <div className="overflow-hidden rounded-xl bg-black/20 px-3 py-3 text-center text-[var(--color-text-primary)]">
            <InlineMath math="\bar{x} \pm z_{\alpha/2}\frac{\sigma}{\sqrt{n}}" />
          </div>
        </Panel>
        <Panel className="p-3">
          <div className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-[var(--color-text-secondary)]">מבחן Z</div>
          <div className="overflow-hidden rounded-xl bg-black/20 px-3 py-3 text-center text-[var(--color-text-primary)]">
            <InlineMath math="z = \frac{\bar{x} - \mu_0}{\sigma / \sqrt{n}}" />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function HelperPreview(): ReactElement {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <LabelPill text="SEMANTIC GUIDE" tone="teal" />
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <BrainCircuit className="h-4 w-4" />
          <span className="text-[11px] font-semibold">שלב אחר שלב</span>
        </div>
      </div>
      <Panel className="p-3">
        <div className="space-y-2">
          {[
            '1. מזהים פרמטר אוכלוסייה',
            '2. בוחרים H₀ מול H₁',
            '3. מפרשים מובהקות בשפה מחקרית',
          ].map((step) => (
            <div key={step} className="rounded-xl border border-[var(--color-border)] bg-black/15 px-3 py-2 text-sm text-[var(--color-text-primary)]">
              {step}
            </div>
          ))}
        </div>
      </Panel>
      <Panel className="p-4">
        <div className="mb-2 text-[10px] font-semibold tracking-[0.12em] text-[var(--color-text-secondary)]">ניסוח מוכן</div>
        <div className="rounded-2xl border border-[var(--chart-2)]/28 bg-[rgba(78,205,196,0.08)] px-4 py-3 text-sm leading-relaxed text-[var(--color-text-primary)]">
          ברמת מובהקות 5%, יש די ראיות לכך שהתוחלת באוכלוסייה גבוהה מהערך הנטען.
        </div>
      </Panel>
    </div>
  );
}

function TablePreview(): ReactElement {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <LabelPill text="CRITICAL TABLES" tone="brass" />
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <TableProperties className="h-4 w-4" />
          <span className="text-[11px] font-semibold">Z / T lookup</span>
        </div>
      </div>
      <Panel className="overflow-hidden p-0">
        <div className="grid grid-cols-[1.2fr_repeat(4,1fr)] border-b border-[var(--color-border)] bg-[rgba(255,255,255,0.04)] text-center text-[10px] font-semibold tracking-[0.12em] text-[var(--color-text-secondary)]">
          <div className="px-2 py-2">Z</div>
          <div className="px-2 py-2">0.00</div>
          <div className="px-2 py-2">0.01</div>
          <div className="px-2 py-2">0.02</div>
          <div className="px-2 py-2">0.03</div>
        </div>
        {[
          ['1.6', '.9452', '.9463', '.9474', '.9484'],
          ['1.7', '.9554', '.9564', '.9573', '.9582'],
          ['1.8', '.9641', '.9649', '.9656', '.9664'],
        ].map((row) => (
          <div key={row[0]} className="grid grid-cols-[1.2fr_repeat(4,1fr)] text-center text-[12px] text-[var(--color-text-primary)]">
            {row.map((cell, index) => (
              <div
                key={`${row[0]}-${cell}`}
                className={`px-2 py-2 ${index === 0 ? 'bg-[rgba(212,168,67,0.08)] font-semibold text-[var(--color-primary)]' : 'border-r border-[var(--color-border)]/70'} border-b border-[var(--color-border)]/70`}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </Panel>
    </div>
  );
}

function PreviewScene({ previewId }: { previewId: LandingPreviewId }): ReactElement {
  if (previewId === 'hypothesis') return <HypothesisPreview />;
  if (previewId === 'normal') return <NormalPreview />;
  if (previewId === 'formula') return <FormulaPreview />;
  if (previewId === 'helper') return <HelperPreview />;
  return <TablePreview />;
}

export function getLandingPreview(previewId: LandingPreviewId): LandingPreviewSpec {
  return landingPreviewSpecs.find((preview) => preview.id === previewId) ?? landingPreviewSpecs[0];
}

export function LandingFeatureArt({
  previewId,
  compact = false,
  className = '',
}: {
  previewId: LandingPreviewId;
  compact?: boolean;
  className?: string;
}): ReactElement {
  const preview = getLandingPreview(previewId);

  return (
    <div className={className} aria-label={preview.alt} role="img">
      <BrowserShell title={preview.title} tone={preview.tone} compact={compact}>
        <PreviewScene previewId={preview.id} />
      </BrowserShell>
    </div>
  );
}

export function LandingFeatureGlyph({ previewId }: { previewId: LandingPreviewId }): ReactElement {
  const preview = getLandingPreview(previewId);
  const toneClass = toneStyles(preview.tone);

  const Icon =
    previewId === 'hypothesis'
      ? Calculator
      : previewId === 'normal'
        ? LineChart
        : previewId === 'formula'
          ? Sigma
          : previewId === 'helper'
            ? BrainCircuit
            : TableProperties;

  return (
    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${toneClass.ring} ${toneClass.bg} ${toneClass.ink}`}>
      <Icon className="h-8 w-8" />
    </div>
  );
}
