import { useLocalStorageState } from './hooks/useLocalStorageState';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { InlineMath, BlockMath } from 'react-katex';
import {
  Info,
  Calculator,
  RefreshCw,
  HelpCircle,
  AlertCircle,
  BookOpen,
  Settings,
  ChevronDown,
  ChevronUp,
  Sliders,
  X,
  Award,
  Star,
  Percent,
  Sigma,
  Target,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  CartesianGrid
} from 'recharts';

import HypothesisTestingCalculator from './components/HypothesisTestingCalculator';
import FormulaSheet from './components/FormulaSheet';
import { type SitePage } from './components/SiteHeader';
import {
  CalculatorSidebar,
  ChartWrapper,
  EmptyState,
  Heading,
  InputTooltip,
  SectionHeader,
  Tooltip as UITooltip,
} from './components/ui';

// --- Math Utilities ---

/**
 * Standard Normal Cumulative Distribution Function (CDF)
 * Approximation using the error function (erf)
 */
function normalCDF(x: number, mean: number, stdDev: number): number {
  if (stdDev <= 0) return 0.5; // fallback
  const z = (x - mean) / stdDev;
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

/**
 * Error function approximation (A&S formula 7.1.26)
 */
function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return sign * y;
}

/**
 * Normal Probability Density Function (PDF)
 */
function normalPDF(x: number, mean: number, stdDev: number): number {
  if (stdDev <= 0) return 0;
  const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
}

/**
 * Inverse Standard Normal Cumulative Distribution Function
 * Rational approximation for Z-score from probability
 */
function inverseNormalCDF(p: number): number {
  if (p <= 0) return -5;
  if (p >= 1) return 5;

  const c = [2.515517, 0.802853, 0.010328];
  const d = [1.432788, 0.189269, 0.001308];

  const t = p < 0.5 ? Math.sqrt(-2.0 * Math.log(p)) : Math.sqrt(-2.0 * Math.log(1.0 - p));
  const z = t - ((c[2] * t + c[1]) * t + c[0]) / (((d[2] * t + d[1]) * t + d[0]) * t + 1.0);

  return p < 0.5 ? -z : z;
}

/**
 * Student's T Cumulative Distribution Function (CDF)
 * Accurate analytical trigonometric formula for any integer degrees of freedom
 */
function studentTCDF(t: number, df: number): number {
  if (df <= 0) return 0.5;

  if (df >= 500) {
    return normalCDF(t, 0, 1);
  }

  const theta = Math.atan(t / Math.sqrt(df));

  if (df === 1) {
    return 0.5 + theta / Math.PI;
  }

  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  let sum = 1;
  let term = 1;

  if (df % 2 === 0) {
    for (let i = 2; i <= df - 2; i += 2) {
      term *= (cosT * cosT * (i - 1)) / i;
      sum += term;
    }
    return 0.5 + 0.5 * sinT * sum;
  } else {
    for (let i = 3; i <= df - 2; i += 2) {
      term *= (cosT * cosT * (i - 1)) / i;
      sum += term;
    }
    return 0.5 + (theta + sinT * cosT * sum) / Math.PI;
  }
}

/**
 * Student's T Inverse CDF (Quantile/Critical Value Function)
 * Extremely fast, precise bisection solver using the exact CDF above
 */
function studentTInverseCDF(p: number, df: number): number {
  if (p <= 0) return -999;
  if (p >= 1) return 999;
  if (p === 0.5) return 0;

  if (df === 1) {
    return Math.tan(Math.PI * (p - 0.5));
  }

  if (df >= 500) {
    return inverseNormalCDF(p);
  }

  // Use a targeted, range-narrowed solver starting around Z margin
  const z = inverseNormalCDF(p);
  let low = z < 0 ? z * 10 - 2 : 0;
  let high = z < 0 ? 0 : z * 10 + 2;

  // Double-check extreme bounds
  if (studentTCDF(high, df) < p) {
    high *= 5;
  }
  if (studentTCDF(low, df) > p) {
    low *= 5;
  }

  for (let iter = 0; iter < 100; iter++) {
    const mid = (low + high) / 2;
    const val = studentTCDF(mid, df);
    if (Math.abs(val - p) < 1e-12) {
      return mid;
    }
    if (val < p) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return (low + high) / 2;
}

// --- Types ---

export type CalcMode = 'forward' | 'inverse' | 'table' | 'hypothesis' | 'formula-sheet';
type CalcType = 'below' | 'above' | 'between' | 'outside' | 'conditional';
type CondType = 'below' | 'above' | 'between';
type NavAccent = 'brass' | 'cobalt' | 'teal' | 'neutral';

interface CalculationResult {
  probability: number;
  z1: number;
  z2?: number;
  steps: string[];
  calculatedX?: number;
}

interface NavigationTab {
  id: CalcMode;
  label: string;
  icon: React.ReactNode;
  accent: NavAccent;
}

type CalculatorMode = Extract<CalcMode, 'forward' | 'inverse'>;

interface HeroStep {
  number: number;
  title: string;
  description: React.ReactNode;
}

function getCalculatorHeroCopy(mode: CalculatorMode): { title: string; steps: HeroStep[] } {
  if (mode === 'forward') {
    return {
      title: 'מחשבון הסתברות בהתפלגות נורמלית',
      steps: [
        { number: 1, title: 'הגדירו התפלגות', description: <>הזינו את פרמטרי תוחלת (<InlineMath math="\mu" />) וסטיית תקן (<InlineMath math="\sigma" />) של המדגם.</> },
        { number: 2, title: 'בחרו יעד חישוב', description: <>בחרו סוג שטח (מעל, מתחת, בין) והזינו ערכי מטרה (<InlineMath math="X" />).</> },
        { number: 3, title: 'קבלו תוצאות', description: <>צפו בגרף החישוב, ב-<InlineMath math="Z" />-score ובדרך הפתרון המלאה צעד-אחר-צעד.</> },
      ]
    };
  }

  return {
    title: 'מחשבון אחוזונים וערכים קריטיים',
    steps: [
      { number: 1, title: 'הגדירו התפלגות', description: <>הזינו את פרמטרי תוחלת (<InlineMath math="\mu" />) וסטיית תקן (<InlineMath math="\sigma" />) של המדגם.</> },
      { number: 2, title: 'בחרו אחוזון יעד', description: <>בחרו כיוון (למשל, אחוזון עליון) והזינו את ההסתברות (<InlineMath math="P" />).</> },
      { number: 3, title: 'קבלו תוצאות', description: <>גלו את הערך המדויק (<InlineMath math="X" />), ה-<InlineMath math="Z" />-score וצפו בגרף אינטראקטיבי.</> },
    ]
  };
}

interface CellWatermarkProps {
  math: string;
  colorClass: string;
}

const CellWatermark: React.FC<CellWatermarkProps> = ({ math, colorClass }) => (
  <div
    className={`absolute left-2 top-1/2 -translate-y-1/2 -rotate-12 opacity-10 pointer-events-none select-none text-4xl sm:text-5xl font-mono ${colorClass}`}
    dir="ltr"
    aria-hidden="true"
  >
    <InlineMath math={math} />
  </div>
);

const InlineMathToken: React.FC<{ math: string; className?: string }> = ({ math, className = '' }) => (
  <span
    dir="ltr"
    className={`inline-flex items-center whitespace-nowrap align-middle [unicode-bidi:isolate] ${className}`.trim()}
  >
    <InlineMath math={math} />
  </span>
);

const CONDITIONAL_EVENT_OPTIONS: ReadonlyArray<{
  value: CondType;
  math: string;
  note: string;
}> = [
  { value: 'below', math: 'X \\le v_1', note: 'עד ערך נתון' },
  { value: 'above', math: 'X \\ge v_1', note: 'מעל ערך נתון' },
  { value: 'between', math: 'v_1 \\le X \\le v_2', note: 'בין שני ערכים' },
];

function getConditionalEventMath(type: CondType, variablePrefix: 'a' | 'b'): string {
  if (type === 'below') return `X \\le ${variablePrefix}_1`;
  if (type === 'above') return `X \\ge ${variablePrefix}_1`;
  return `${variablePrefix}_1 \\le X \\le ${variablePrefix}_2`;
}

const ConditionalEventPicker: React.FC<{
  value: CondType;
  onChange: (value: CondType) => void;
  disabled?: boolean;
  accentClass: string;
  accentColor: string;
  variablePrefix: 'a' | 'b';
}> = ({
  value,
  onChange,
  disabled = false,
  accentClass,
  accentColor,
  variablePrefix,
}) => (
  <div className="grid gap-2 sm:grid-cols-3">
    {CONDITIONAL_EVENT_OPTIONS.map((option) => {
      const isActive = value === option.value;
      const math = option.math.replaceAll('v', variablePrefix);

      return (
        <button
          key={`${variablePrefix}-${option.value}`}
          type="button"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className={`rounded-lg border px-2.5 py-2.5 text-center transition-all ${
            isActive
              ? `${accentClass} shadow-[0_0_0_1px_currentColor]`
              : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]'
          } ${disabled ? 'cursor-not-allowed opacity-60 grayscale-[0.15]' : ''}`}
        >
          <span className="block text-base font-black sm:text-lg">
            <InlineMathToken math={math} />
          </span>
          <span
            className="mt-0.5 block text-caption font-bold"
            style={{ color: isActive ? accentColor : 'var(--color-text-secondary)' }}
          >
            {option.note}
          </span>
        </button>
      );
    })}
  </div>
);

interface ConditionalValueFieldProps {
  label: React.ReactNode;
  helper: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const ConditionalValueField: React.FC<ConditionalValueFieldProps> = ({
  label,
  helper,
  value,
  onChange,
  error,
  disabled = false,
}) => (
  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/88 p-2.5">
    <label className="mb-1 block text-heading-label font-black text-[var(--color-text-primary)]">
      {label}
    </label>
    <p className="mb-2 text-caption text-[var(--color-text-secondary)]">{helper}</p>
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      dir="ltr"
      className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-center text-sm font-mono font-bold text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-accent-cobalt-line)] disabled:cursor-not-allowed disabled:opacity-60"
    />
    {error ? <p className="mt-1 text-caption text-[var(--color-error)]">{error}</p> : null}
  </div>
);

interface ConditionalEventDefinitionCardProps {
  stepNumber: string;
  title: React.ReactNode;
  description: React.ReactNode;
  formula: string;
  value: CondType;
  onChange: (value: CondType) => void;
  disabled?: boolean;
  accentClass: string;
  accentColor: string;
  variablePrefix: 'a' | 'b';
  fields: React.ReactNode;
  expressionToneClass: string;
}

const ConditionalEventDefinitionCard: React.FC<ConditionalEventDefinitionCardProps> = ({
  stepNumber,
  title,
  description,
  formula,
  value,
  onChange,
  disabled = false,
  accentClass,
  accentColor,
  variablePrefix,
  fields,
  expressionToneClass,
}) => (
  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/72 p-3.5">
    <div className="mb-3 flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-3">
      <div className="text-right">
        <p className="text-caption font-black tracking-[0.12em] text-[var(--color-text-secondary)]">
          {stepNumber}
        </p>
        <h4 className="mt-1 text-body-base font-black text-[var(--color-text-primary)]">{title}</h4>
        <p className="mt-1 text-caption leading-relaxed text-[var(--color-text-secondary)]">{description}</p>
      </div>
      <div className={`rounded-full border px-2.5 py-1 text-sm font-black ${expressionToneClass}`}>
        <InlineMathToken math={formula} />
      </div>
    </div>

    <ConditionalEventPicker
      value={value}
      onChange={onChange}
      disabled={disabled}
      accentClass={accentClass}
      accentColor={accentColor}
      variablePrefix={variablePrefix}
    />

    <div className={`mt-3 rounded-lg border px-3 py-2 text-right ${expressionToneClass}`}>
      <p className="text-caption font-bold text-[var(--color-text-secondary)]">ניסוח פורמלי</p>
      <p className="mt-1 text-body-sm font-black">
        <InlineMathToken math={`${variablePrefix === 'a' ? 'A' : 'B'} = \\left\\{${getConditionalEventMath(value, variablePrefix)}\\right\\}`} />
      </p>
    </div>

    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {fields}
    </div>
  </div>
);

interface ParameterInputCellProps {
  watermark: string;
  colorClass: string;
  label: React.ReactNode;
  tooltip: React.ReactNode;
  value: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  statusText?: string;
}

const ParameterInputCell: React.FC<ParameterInputCellProps> = ({
  watermark,
  colorClass,
  label,
  tooltip,
  value,
  onChange,
  error,
  disabled = false,
  readOnly = false,
  placeholder = '',
  statusText,
}) => (
  <td className={`relative overflow-hidden p-3 align-middle bg-[var(--color-surface-raised)] ${disabled ? 'opacity-55' : ''}`}>
    <CellWatermark math={watermark} colorClass={colorClass} />
    <div className="relative z-10 flex w-full flex-col items-center justify-center gap-2 xl:flex-row xl:gap-3">
      <InputTooltip content={tooltip}>
        <span className={`text-center text-sm sm:text-base font-bold cursor-help border-b border-dotted border-[var(--color-border)] flex items-center justify-center gap-1 ${disabled ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-primary)]/90'} xl:min-w-0 xl:flex-1 xl:justify-end xl:text-right`}>
          {label}
        </span>
      </InputTooltip>
      <div className="relative w-full max-w-[10rem] shrink-0 xl:w-24 xl:max-w-none">
        <input
          type="text"
          value={value}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full bg-[var(--color-surface)] border px-2 py-1 font-mono font-bold text-center text-lg sm:text-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 placeholder:font-medium placeholder:text-base outline-none transition-all rounded shadow-inner focus:border-[var(--color-accent-cobalt)] focus:ring-2 focus:ring-[var(--color-accent-cobalt)]/20 ${disabled ? 'cursor-not-allowed opacity-50 border-transparent bg-[var(--color-surface-raised)]/5' : ''} ${readOnly ? 'cursor-default' : ''} ${!disabled && error ? 'border-[var(--color-error)] ring-2 ring-[var(--color-error)]/20 text-[var(--color-error)]' : !disabled ? 'border-[var(--color-border)]' : ''}`}
          dir="ltr"
        />
        {error ? (
          <div className="absolute top-full left-1/2 z-50 mt-2 flex -translate-x-1/2 items-center justify-center whitespace-nowrap rounded bg-[var(--color-error)] px-2.5 py-1 text-xs font-bold text-white shadow-lg pointer-events-none">
            <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[var(--color-error)]" />
            <span className="relative z-10">{error}</span>
          </div>
        ) : null}
        {!error && statusText ? (
          <p className="mt-1 text-center text-caption font-bold text-[var(--color-text-secondary)]">{statusText}</p>
        ) : null}
      </div>
    </div>
  </td>
);

interface VariantOption {
  value: CalcType;
  label: React.ReactNode;
  description: React.ReactNode;
}

const FORWARD_VARIANT_OPTIONS: readonly VariantOption[] = [
  { value: 'below', label: 'שטח מצד שמאל', description: <InlineMathToken math="P(X \le x)" /> },
  { value: 'above', label: 'שטח מצד ימין', description: <InlineMathToken math="P(X \ge x)" /> },
  { value: 'between', label: 'בין שני ערכים', description: <InlineMathToken math="P(x_1 \le X \le x_2)" /> },
  { value: 'outside', label: 'מחוץ לתחום', description: <InlineMathToken math="P(X \le x_1 \;\cup\; X \ge x_2)" /> },
  { value: 'conditional', label: 'הסתברות מותנית', description: <InlineMathToken math="P(A \mid B)=\frac{P(A \cap B)}{P(B)}" /> },
];

const INVERSE_VARIANT_OPTIONS: readonly VariantOption[] = [
  { value: 'below', label: 'אחוזון שמאלי', description: <InlineMathToken math="P(X \le x)=p" /> },
  { value: 'above', label: 'אחוזון ימני', description: <InlineMathToken math="P(X \ge x)=p" /> },
  { value: 'between', label: 'טווח מרכזי', description: <InlineMathToken math="P(x_1 \le X \le x_2)=p" /> },
  { value: 'outside', label: 'טווח זנבות', description: <InlineMathToken math="P(X \le x_1 \;\cup\; X \ge x_2)=p" /> },
];

interface CalculationVariantPickerProps {
  value: CalcType;
  onChange: (value: CalcType) => void;
  options: readonly VariantOption[];
}

const CalculationVariantPicker: React.FC<CalculationVariantPickerProps> = ({
  value,
  onChange,
  options,
}) => (
  <div className="w-full">
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`group rounded-lg border px-4 py-3 text-right transition-all ${
              isActive
                ? 'border-[var(--color-accent-cobalt)]/70 bg-[linear-gradient(135deg,rgba(92,92,255,0.16),rgba(92,92,255,0.06))] shadow-[0_0_0_1px_var(--color-accent-cobalt)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent-cobalt)]/35 hover:bg-[var(--color-accent-cobalt)]/5'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`block text-body-base font-black ${isActive ? 'text-[var(--color-accent-cobalt)]' : 'text-[var(--color-text-primary)]'}`}>
                  {option.label}
                </span>
                {option.description ? (
                  <p className="mt-2 text-body-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {option.description}
                  </p>
                ) : null}
              </div>
              <span className={`mt-1 h-2.5 w-2.5 rounded-full transition-colors ${isActive ? 'bg-[var(--color-accent-cobalt)]' : 'bg-[var(--color-border-strong)] group-hover:bg-[var(--color-accent-cobalt)]/60'}`} />
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

const CalculatorModeSwitch: React.FC<{
  value: CalculatorMode;
  onChange: (value: CalculatorMode) => void;
}> = ({ value, onChange }) => {
  const isInverse = value === 'inverse';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isInverse}
      aria-label={`מצב מחשבון: ${isInverse ? 'אחוזונים' : 'הסתברות'}`}
      title={isInverse ? 'עכשיו: אחוזונים. לחיצה תעביר להסתברות.' : 'עכשיו: הסתברות. לחיצה תעביר לאחוזונים.'}
      onClick={() => onChange(isInverse ? 'forward' : 'inverse')}
      className="grid w-full cursor-pointer grid-cols-2 gap-2 rounded-lg border border-[rgba(36,209,199,0.38)] bg-[var(--color-surface-raised)] p-1 transition-all hover:border-[rgba(36,209,199,0.62)]"
    >
      <span
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-black transition-all ${
          !isInverse
            ? 'bg-[linear-gradient(135deg,#24D1C7,#1C9EDE)] text-[#08131A] shadow-[0_0_0_1px_rgba(36,209,199,0.72)]'
            : 'bg-transparent text-[var(--color-text-secondary)]'
        }`}
      >
        <InlineMathToken math="P" className="text-base" />
        <span>הסתברות</span>
      </span>
      <span
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-black transition-all ${
          isInverse
            ? 'bg-[linear-gradient(135deg,#F6D04D,#E9A91A)] text-[#18140A] shadow-[0_0_0_1px_rgba(246,208,77,0.72)]'
            : 'bg-transparent text-[var(--color-text-secondary)]'
        }`}
      >
        <span dir="ltr" className="text-sm font-black">%</span>
        <span>אחוזונים</span>
      </span>
    </button>
  );
};

// --- Components ---

// --- Recharts-based Interactive Normal Chart ---
const NormalChart: React.FC<{
  mean: number;
  stdDev: number;
  type: CalcType;
  x1: number;
  x2: number;
  condType?: CondType;
  condTypeA?: CondType;
  condX1?: number;
  condX2?: number;
  mode?: CalcMode;
}> = ({ mean, stdDev, type, x1, x2, condType, condTypeA, condX1, condX2, mode }) => {

  const chartData = useMemo(() => {
    if (stdDev <= 0) return [];

    const pts = [];
    const numPoints = 140;
    const xMin = mean - 4 * stdDev;
    const xMax = mean + 4 * stdDev;
    const step = (xMax - xMin) / (numPoints - 1);

    const getRangeRange = (t: string | undefined, v1: number | undefined, v2: number | undefined): [number, number] => {
      const val1 = v1 ?? 0;
      const val2 = v2 ?? 0;
      if (t === 'below') return [-Infinity, val1];
      if (t === 'above') return [val1, Infinity];
      if (t === 'between') return [Math.min(val1, val2), Math.max(val1, val2)];
      return [-Infinity, Infinity];
    };

    const isXInside = (val: number, range: [number, number]) => val >= range[0] && val <= range[1];

    const minStandardX = Math.min(x1, x2);
    const maxStandardX = Math.max(x1, x2);

    for (let i = 0; i < numPoints; i++) {
      const x = xMin + i * step;
      const y = normalPDF(x, mean, stdDev);

      let shadedY: number | null = null;
      let shadedYBelow: number | null = null;
      let shadedYAbove: number | null = null;
      let condBShadedY: number | null = null;
      let intersectShadedY: number | null = null;

      if (type === 'conditional') {
        const rA = getRangeRange(condTypeA || 'below', x1, x2);
        const rB = getRangeRange(condType, condX1, condX2);

        if (isXInside(x, rB)) {
          condBShadedY = y;
        }
        if (isXInside(x, rA) && isXInside(x, rB)) {
          intersectShadedY = y;
        }
      } else {
        switch (type) {
          case 'below':
            if (x <= x1) shadedY = y;
            break;
          case 'above':
            if (x >= x1) shadedY = y;
            break;
          case 'between':
            if (x >= minStandardX && x <= maxStandardX) shadedY = y;
            break;
          case 'outside':
            if (x <= minStandardX) shadedYBelow = y;
            if (x >= maxStandardX) shadedYAbove = y;
            break;
        }
      }

      pts.push({
        x: Number(x.toFixed(4)),
        pdf: y,
        shadedY,
        shadedYBelow,
        shadedYAbove,
        condBShadedY,
        intersectShadedY,
      });
    }
    return pts;
  }, [mean, stdDev, type, x1, x2, condType, condTypeA, condX1, condX2]);

  if (stdDev <= 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-[var(--color-surface)] text-[var(--color-error)] font-bold border border-[var(--color-accent-crimson)]/30">
        נא להזין סטיית תקן גדולה מ-0 להצגת גרף.
      </div>
    );
  }

  const curveColor = 'var(--color-accent-brass)';
  const secondaryCurveColor = 'var(--color-accent-teal)';
  const zLineColor = 'var(--color-accent-cobalt)';
  const mainGridColor = 'var(--chart-grid)';
  const axisLabelColor = 'var(--chart-axis-label)';
  const shadedColor = 'var(--color-accent-cobalt)';
  const bShadedColor = 'var(--color-accent-teal)';
  const intersectShadedColor = 'var(--color-accent-cobalt)';

  const minStandardX = Math.min(x1, x2);
  const maxStandardX = Math.max(x1, x2);

  const xDomain = [mean - 4.2 * stdDev, mean + 4.2 * stdDev] as const;
  const xMarkers = useMemo(() => {
    const markers: Array<{ value: number; math: string; color: string }> = [
      { value: mean, math: '\mu', color: 'var(--color-accent-brass)' },
    ];

    if (type === 'conditional' && mode === 'forward') {
      markers.push({ value: x1, math: 'a_1', color: 'var(--color-accent-cobalt)' });
      if (condTypeA === 'between') {
        markers.push({ value: x2, math: 'a_2', color: 'var(--color-accent-cobalt)' });
      }
      if (typeof condX1 === 'number') {
        markers.push({ value: condX1, math: 'b_1', color: 'var(--color-accent-teal)' });
      }
      if (condType === 'between' && typeof condX2 === 'number') {
        markers.push({ value: condX2, math: 'b_2', color: 'var(--color-accent-teal)' });
      }
    } else if (mode === 'inverse') {
      markers.push({ value: x1, math: 'X', color: 'var(--color-accent-cobalt)' });
      if (type === 'between' || type === 'outside') {
        markers.push({ value: x2, math: 'X_2', color: 'var(--color-accent-teal)' });
      }
    } else if (type === 'between' || type === 'outside') {
      markers.push({ value: x1, math: 'X_1', color: 'var(--color-accent-cobalt)' });
      markers.push({ value: x2, math: 'X_2', color: 'var(--color-accent-teal)' });
    } else {
      markers.push({ value: x1, math: 'X', color: 'var(--color-accent-cobalt)' });
    }

    return markers;
  }, [mean, mode, type, x1, x2, condType, condTypeA, condX1, condX2]);

  const xAxisTicks = useMemo(() => {
    const baseTicks = [
      xDomain[0],
      mean - 2 * stdDev,
      mean,
      mean + 2 * stdDev,
      xDomain[1],
      ...xMarkers.map((marker) => marker.value),
    ];

    const uniqueTicks = Array.from(new Set(baseTicks.map((tick) => Number(tick.toFixed(2))))).sort((a, b) => a - b);
    const finalTicks: number[] = [];
    const minSpacing = stdDev * 0.35;

    for (const tick of uniqueTicks) {
      if (finalTicks.length === 0 || tick - finalTicks[finalTicks.length - 1] >= minSpacing) {
        finalTicks.push(tick);
      }
    }

    return finalTicks;
  }, [mean, stdDev, xDomain, xMarkers]);

  const legendChips = useMemo(() => {
    const chips: Array<{ math: string; color: string; style: 'line' | 'area' }> = [
      { math: '\mu', color: curveColor, style: 'line' },
    ];

    if (type === 'conditional' && mode === 'forward') {
      chips.push({ math: 'A / a_1, a_2', color: zLineColor, style: 'line' });
      chips.push({ math: 'B / b_1, b_2', color: secondaryCurveColor, style: 'area' });
    } else {
      chips.push({ math: type === 'between' || type === 'outside' ? 'X_1' : 'X', color: zLineColor, style: 'line' });
      if (mode === 'inverse' && (type === 'between' || type === 'outside')) {
        chips.push({ math: 'X_2', color: secondaryCurveColor, style: 'line' });
      } else if (type === 'between' || type === 'outside') {
        chips.push({ math: 'X_2', color: secondaryCurveColor, style: 'line' });
      }
    }

    return chips;
  }, [curveColor, mode, secondaryCurveColor, type, zLineColor]);

  // Customized tooltip
  const CustomTooltipInner = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPt = payload[0].payload;
      const zVal = (dataPt.x - mean) / stdDev;
      return (
        <div className="p-3 border rounded-sm shadow-sm text-xs font-sans text-right space-y-1 backdrop-blur-md bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)]">
          <p className="font-bold text-sm text-[var(--color-accent-brass)]">נקודה על העקומה</p>
          <p className="flex justify-between gap-4"><span>ערך <InlineMath math="X" />:</span> <span className="font-mono font-bold">{dataPt.x.toFixed(2)}</span></p>
          <p className="flex justify-between gap-4"><span>ציון תקן <InlineMath math="Z" />:</span> <span className="font-mono font-bold">{zVal.toFixed(2)}</span></p>
          <p className="flex justify-between gap-4"><span>צפיפות PDF:</span> <span className="font-mono font-bold">{dataPt.pdf.toFixed(4)}</span></p>
        </div>
      );
    }
    return null;
  };

  const renderXAxisTick = (props: { x?: number | string; y?: number | string; payload?: { value?: number | string } }) => {
    const x = typeof props.x === 'number' ? props.x : Number(props.x ?? 0);
    const y = typeof props.y === 'number' ? props.y : Number(props.y ?? 0);
    const tickValue = typeof props.payload?.value === 'number' ? props.payload.value : Number(props.payload?.value ?? 0);
    const marker = xMarkers.find((item) => Math.abs(item.value - tickValue) < 0.01);
    if (!marker) {
      return (
        <g transform={`translate(${x},${y})`}>
          <text x={0} y={12} textAnchor="middle" fill={axisLabelColor} fontSize={15} fontWeight="bold">
            {tickValue.toFixed(0)}
          </text>
        </g>
      );
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <foreignObject x={-36} y={2} width={72} height={44} style={{ overflow: 'visible' }}>
          <div
            className="flex flex-col items-center justify-start leading-none"
            style={{ color: marker.color }}
          >
            <span className="text-[1.125rem] font-black">
              <InlineMath math={tickValue.toFixed(2)} />
            </span>
            <span className="mt-1 text-[1rem] font-black">
              <InlineMath math={marker.math} />
            </span>
          </div>
        </foreignObject>
      </g>
    );
  };

  return (
    <div className="h-[400px] w-full" dir="ltr">
      <div className="mb-3 flex flex-wrap items-center gap-4 border-b border-[var(--color-border)] pb-3">
        {legendChips.map((chip) => (
          <div key={chip.math} className="flex items-center gap-1.5 font-black text-sm select-none" style={{ color: chip.color }}>
            {chip.style === 'line' ? (
              <span className="inline-block h-3 w-0.5" style={{ backgroundColor: chip.color }} />
            ) : (
              <span className="inline-block h-3 w-3 border" style={{ backgroundColor: `${chip.color}33`, borderColor: chip.color }} />
            )}
            <span dir="ltr"><InlineMath math={chip.math} /></span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 10, left: -25, bottom: 76 }}>
            <defs>
              <linearGradient id="mainColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={curveColor} stopOpacity={0.1} />
                <stop offset="95%" stopColor={curveColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={mainGridColor} />

            <XAxis
              dataKey="x"
              type="number"
              domain={xDomain}
              ticks={xAxisTicks}
              tick={renderXAxisTick}
              axisLine={{ stroke: mainGridColor }}
              tickLine={true}
            />
            <YAxis
              tickFormatter={(val) => val.toFixed(2)}
              tick={{ fill: axisLabelColor, fontSize: 12, fontWeight: 'bold' }}
              axisLine={{ stroke: mainGridColor }}
              tickLine={true}
              width={45}
            />
            <RechartsTooltip content={<CustomTooltipInner />} />

            {/* Always render standard curve path */}
            <Area
              type="monotone"
              dataKey="pdf"
              stroke={curveColor}
              strokeWidth={2.5}
              fill="url(#mainColor)"
              dot={false}
              isAnimationActive={false}
            />

            {/* Shaded area layers depending on normal / conditional type */}
            {type === 'conditional' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="condBShadedY"
                  stroke="none"
                  fill={bShadedColor}
                  fillOpacity={0.22}
                  dot={false}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="intersectShadedY"
                  stroke="none"
                  fill={intersectShadedColor}
                  fillOpacity={0.48}
                  dot={false}
                  isAnimationActive={false}
                />
              </>
            ) : type === 'outside' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="shadedYBelow"
                  stroke="none"
                  fill={shadedColor}
                  fillOpacity={0.35}
                  dot={false}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="shadedYAbove"
                  stroke="none"
                  fill={shadedColor}
                  fillOpacity={0.35}
                  dot={false}
                  isAnimationActive={false}
                />
              </>
            ) : (
              <Area
                type="monotone"
                dataKey="shadedY"
                stroke="none"
                fill={shadedColor}
                fillOpacity={0.35}
                dot={false}
                isAnimationActive={false}
              />
            )}

            <ReferenceLine
              x={mean}
              stroke={curveColor}
              strokeWidth={1.5}
              strokeDasharray="10 4"
            />

            {type === 'conditional' ? (
              <>
                {condX1 !== undefined && (condType === 'below' || condType === 'above' || condType === 'between') && (
                  <ReferenceLine
                    x={condX1}
                    stroke={secondaryCurveColor}
                    strokeWidth={1.5}
                    strokeDasharray="10 4"
                  />
                )}
                {condX2 !== undefined && condType === 'between' && (
                  <ReferenceLine
                    x={condX2}
                    stroke={secondaryCurveColor}
                    strokeWidth={1.5}
                    strokeDasharray="10 4"
                  />
                )}
                {(condTypeA === 'below' || condTypeA === 'above' || condTypeA === 'between') && (
                  <ReferenceLine
                    x={x1}
                    stroke={zLineColor}
                    strokeWidth={2.5}
                  />
                )}
                {condTypeA === 'between' && (
                  <ReferenceLine
                    x={x2}
                    stroke={zLineColor}
                    strokeWidth={2.5}
                  />
                )}
              </>
            ) : mode === 'inverse' ? (
              <ReferenceLine
                x={x1}
                stroke={zLineColor}
                strokeWidth={2.5}
              />
            ) : (
              <>
                <ReferenceLine
                  x={x1}
                  stroke={zLineColor}
                  strokeWidth={2.5}
                />
                {(type === 'between' || type === 'outside') && (
                  <ReferenceLine
                    x={x2}
                    stroke={secondaryCurveColor}
                    strokeWidth={2.5}
                  />
                )}
              </>
            )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const FormattedStep: React.FC<{ text: string }> = ({ text }) => {
  const isResult = text.startsWith('תוצאה סופית:');
  const stepMatch = text.match(/^שלב\s+(\d+)\s*\|\s*(.*?)\s*\|\s*(.*)$/);
  const fallbackMatch = !stepMatch ? text.match(/^שלב\s+(\d+):\s*(.*)$/) : null;
  
  const isStepTitle = Boolean(stepMatch || fallbackMatch);
  const stepNumber = stepMatch?.[1] ?? fallbackMatch?.[1] ?? null;
  const stepTitle = stepMatch?.[2] ?? null;
  const normalizedText = stepMatch?.[3] ?? fallbackMatch?.[2] ?? text;
  
  const isPureMath = /^\[MATH\].*\[\/MATH\]$/.test(normalizedText.trim());
  const parts = normalizedText.split(/\[MATH\](.*?)\[\/MATH\]/g);
  const blockTone = isResult
    ? 'result'
    : isPureMath
      ? 'calculation'
      : isStepTitle
        ? 'formula'
        : 'note';
  const shellClass = blockTone === 'result'
    ? 'border-[var(--color-accent-brass)]/45 bg-[var(--color-accent-brass)]/10'
    : blockTone === 'calculation'
      ? 'border-[var(--color-accent-cobalt)]/35 bg-[var(--color-accent-cobalt)]/8'
      : blockTone === 'formula'
        ? 'border-[var(--color-accent-brass)]/35 bg-[var(--color-surface)]'
        : 'border-[var(--color-border)] bg-[var(--color-surface-raised)]';
  const railClass = blockTone === 'result'
    ? 'bg-[var(--color-accent-brass)]'
    : blockTone === 'calculation'
      ? 'bg-[var(--color-accent-cobalt)]'
      : blockTone === 'formula'
        ? 'bg-[var(--color-accent-teal)]'
        : 'bg-[var(--color-border)]';
  const iconColorClass = blockTone === 'result'
    ? 'text-[var(--color-accent-brass)]/65'
    : blockTone === 'calculation'
      ? 'text-[var(--color-accent-cobalt)]/65'
      : blockTone === 'formula'
        ? 'text-[var(--color-accent-teal)]/65'
        : 'text-[var(--color-text-secondary)]/65';

  return (
    <div className={`overflow-hidden rounded-lg border shadow-sm ${shellClass}`}>
      <div className="flex items-stretch">
        <div className={`w-1 shrink-0 ${railClass}`} aria-hidden="true" />
        <div className="flex w-full items-start gap-4 p-4 sm:p-5">
          <div className={`hidden shrink-0 pt-1 sm:flex ${iconColorClass}`}>
            {blockTone === 'result' ? (
              <Award size={30} strokeWidth={1.4} />
            ) : blockTone === 'calculation' ? (
              <Calculator size={30} strokeWidth={1.4} />
            ) : (
              <BookOpen size={30} strokeWidth={1.4} />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-3 text-[var(--color-text-primary)]">
            {isStepTitle ? (
              <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)]/80 pb-2">
                <span className="inline-flex min-w-8 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] px-2 py-1 text-caption font-black text-[var(--color-accent-cobalt)] shadow-[var(--shadow-soft)]">
                  {stepNumber}
                </span>
                <span className="text-body-base font-black text-[var(--color-text-primary)]">
                  {stepTitle ? stepTitle.trim() : `שלב ${stepNumber}`}
                </span>
              </div>
            ) : null}

            <div className={`space-y-3 text-sm md:text-base leading-relaxed ${isResult ? 'font-bold text-[var(--color-accent-brass)]' : 'text-[var(--color-text-primary)]'}`}>
              {parts.map((part, i) => {
                if (i % 2 === 1) {
                  const isOnlyMath = parts.length === 3 && parts[0] === '' && parts[2] === '';
                  const hasFraction = part.includes('\\frac');
                  const hasPercentage = part.includes('%') || part.includes('\\%');
                  const hasEquals = part.includes('=');
                  const shouldBeBlockPoint = (hasFraction || (isOnlyMath && hasEquals)) && !hasPercentage;

                  if (shouldBeBlockPoint) {
                    return (
                      <div
                        key={i}
                        className={`my-2 overflow-x-auto rounded-lg border px-4 py-4 text-center shadow-sm ${blockTone === 'result'
                          ? 'border-[var(--color-accent-brass)]/35 bg-[var(--color-accent-brass)]/8'
                          : 'border-[var(--color-accent-cobalt)]/30 bg-[var(--color-accent-cobalt)]/6'
                        }`}
                        dir="ltr"
                      >
                        <BlockMath math={part} />
                      </div>
                    );
                  }

                  return (
                    <span key={i} dir="ltr" className="mx-1 inline-block whitespace-nowrap font-bold">
                      <InlineMath math={part} />
                    </span>
                  );
                }

                const cleanPart = part.trim();
                if (!cleanPart && parts.length > 1) return null;
                if (/^[.,:\s]+$/.test(part)) return null;

                return (
                  <span key={i} className={`align-middle font-sans ${isResult ? 'font-bold' : 'font-medium'}`}>
                    {part}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PopularZCardProps {
  item: { confidence: string; alpha: number; tail: string; phi: number; z: number; label: string };
  isMatched: boolean;
  onClick: () => void;
}

const PopularZCard: React.FC<PopularZCardProps> = ({ item, isMatched, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative pt-3 pb-4 px-3 rounded-md border transition-colors flex flex-col justify-start items-center cursor-pointer ${
        isMatched
          ? 'bg-[var(--color-accent-cobalt-bg)] border-[var(--color-accent-cobalt-line)]'
          : 'bg-transparent border-[var(--color-border)] hover:bg-[var(--color-surface-raised)] hover:border-[var(--color-text-secondary)]'
      }`}
    >
      {/* Header section (Research direction & Confidence) */}
      <div className="flex justify-center items-baseline gap-1.5 w-full mb-3 border-b border-[var(--color-border)] pb-2" dir="rtl">
        <span className="text-body-base font-bold text-[var(--color-text-primary)]">{item.label}</span>
        <span className="text-caption text-[var(--color-text-secondary)] font-medium">({item.confidence})</span>
      </div>

      {/* Alpha (Primary Emphasis) */}
      <div className={`text-xl ${isMatched ? 'text-[var(--color-accent-cobalt)]' : 'text-[var(--color-accent-crimson)]'}`}>
        <InlineMath math={`\\alpha = ${item.alpha.toFixed(2)}\\ (${(item.alpha * 100).toFixed(0)}\\%)`} />
      </div>

      {/* Z and Phi */}
      <div className="flex items-center justify-center gap-3 mt-3 text-body-xs text-[var(--color-text-primary)]" dir="ltr">
        <InlineMath math={`Z = ${item.z.toFixed(3)}`} />
        <span className="text-[var(--color-border)]">|</span>
        <InlineMath math={`\\Phi = ${item.phi.toFixed(4)}`} />
      </div>
    </button>
  );
};

const ZTable: React.FC<{ activeZ?: number | null; showSearch?: boolean }> = ({ activeZ = null, showSearch = false }) => {
  const [searchType, setSearchType] = useLocalStorageState<'z' | 'phi'>('ND_searchType', 'z');
  const [searchVal, setSearchVal] = useState<string>('');
  const [phiSearchVal, setPhiSearchVal] = useState<string>('');
  const [isZGuideOpen, setIsZGuideOpen] = useState<boolean>(false);
  const [isTGuideOpen, setIsTGuideOpen] = useState<boolean>(false);

  // Accordion states
  const [isZTableOpen, setIsZTableOpen] = useState<boolean>(false);
  const [isPopularOpen, setIsPopularOpen] = useState<boolean>(false);
  const [isTTableOpen, setIsTTableOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleOpenPath = (event: Event) => {
      const customEvent = event as CustomEvent<{ ids?: string[] }>;
      const openIds = customEvent.detail?.ids ?? [];

      if (openIds.includes('normal-z-table')) {
        setIsZTableOpen(true);
      }

      if (openIds.includes('normal-popular-z')) {
        setIsPopularOpen(true);
      }

      if (openIds.includes('normal-t-table')) {
        setIsTTableOpen(true);
      }
    };

    window.addEventListener('toc-open-path', handleOpenPath);
    return () => window.removeEventListener('toc-open-path', handleOpenPath);
  }, []);

  // Student's T-distribution states
  const [tDf, setTDf] = useLocalStorageState<number | ''>('ND_tDf', '');
  const [tAlpha, setTAlpha] = useLocalStorageState<number>('ND_tAlpha', 0.05);
  const [tSide, setTSide] = useLocalStorageState<'two' | 'one'>('ND_tSide', 'two');

  const rows = useMemo(() => Array.from({ length: 40 }, (_, i) => i / 10), []);
  const cols = useMemo(() => Array.from({ length: 10 }, (_, i) => i / 100), []);

  const dfList = useMemo(() => [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    40, 50, 60, 80, 100, 120, 500
  ], []);

  const tCols = useMemo(() => [
    { oneTail: 0.10, twoTail: 0.20 },
    { oneTail: 0.05, twoTail: 0.10 },
    { oneTail: 0.025, twoTail: 0.05 },
    { oneTail: 0.01, twoTail: 0.02 },
    { oneTail: 0.005, twoTail: 0.01 },
    { oneTail: 0.0005, twoTail: 0.001 }
  ], []);

  const findZByPhiVal = (targetPhi: number) => {
    let closestZ = 0;
    let minDiff = Infinity;

    for (const r of rows) {
      for (const c of cols) {
        const z = r + c;
        const phi = normalCDF(z, 0, 1);
        const diff = Math.abs(phi - targetPhi);
        if (diff < minDiff) {
          minDiff = diff;
          closestZ = z;
        }
      }
    }
    return closestZ;
  };

  if (activeZ === null && !showSearch) return null;

  const actualZ = useMemo(() => {
    if (searchType === 'phi') {
      const parsedPhi = parseFloat(phiSearchVal);
      if (isNaN(parsedPhi) || parsedPhi < 0 || parsedPhi > 1) return null;
      return findZByPhiVal(parsedPhi);
    }
    const parsed = parseFloat(searchVal);
    return isNaN(parsed) ? null : parsed;
  }, [searchVal, phiSearchVal, searchType, rows, cols]);

  const isZNegative = actualZ !== null && actualZ < 0;
  const lookupZ = actualZ !== null ? Math.abs(actualZ) : null;

  const rowVal = lookupZ !== null ? Math.floor(lookupZ * 10) / 10 : null;
  const colVal = lookupZ !== null ? Math.round((lookupZ - rowVal!) * 100) / 100 : null;

  const activeCellRef = useRef<HTMLTableCellElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeCellRef.current && containerRef.current) {
      const cell = activeCellRef.current;
      const container = containerRef.current;

      const cellRect = cell.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const scrollTop = container.scrollTop + (cellRect.top - containerRect.top) - (containerRect.height / 2) + (cellRect.height / 2);
      const scrollLeft = container.scrollLeft + (cellRect.left - containerRect.left) - (containerRect.width / 2) + (cellRect.width / 2);

      container.scrollTo({
        top: scrollTop,
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [rowVal, colVal]);

  const computedTCritical = useMemo(() => {
    if (typeof tDf === 'string' || tDf <= 0 || isNaN(tDf)) return null;
    const targetP = tSide === 'two' ? 1 - (tAlpha / 2) : 1 - tAlpha;
    if (targetP <= 0 || targetP >= 1 || isNaN(targetP)) return null;
    return studentTInverseCDF(targetP, tDf);
  }, [tDf, tAlpha, tSide]);

  const renderTableSection = (tableRows: number[]) => (
    <div ref={containerRef} dir="ltr" className="overflow-auto rounded-lg border border-[var(--color-border)] max-h-[480px]">
      <table className="w-full text-xs sm:text-sm border-collapse">
        <thead className="sticky top-0 z-30 shadow-sm">
          <tr className="bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]">
            <th className="sticky left-0 p-2.5 border border-[var(--color-border)] text-[var(--color-accent-brass)] font-extrabold text-center text-sm w-14 bg-[var(--color-surface-raised)] z-40">Z</th>
            {cols.map(c => {
              const isColActive = lookupZ !== null && Math.abs(c - colVal!) < 0.001;
              return (
                <th
                  key={c}
                  className={`p-2.5 border border-[var(--color-border)] transition-colors duration-300 font-extrabold text-center min-w-[58px] ${isColActive
                      ? 'bg-[var(--color-accent-cobalt-strong)] text-white'
                      : 'text-[var(--color-text-primary)] bg-[var(--color-surface-raised)]'
                    }`}
                >
                  {c.toFixed(2).slice(2)}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {tableRows.map(r => {
            const isRowActive = lookupZ !== null && Math.abs(r - rowVal!) < 0.01;
            return (
              <tr key={r} className={`transition-colors duration-200 ${isRowActive
                  ? 'bg-[var(--color-surface-raised)]'
                  : 'hover:bg-[var(--color-surface)]'
                }`}>
                <td className={`sticky left-0 p-2.5 border border-[var(--color-border)] font-black text-center text-sm transition-colors duration-300 z-20 ${isRowActive
                    ? 'bg-[var(--color-accent-cobalt-strong)] text-white'
                    : 'text-[var(--color-text-primary)] bg-[var(--color-surface-raised)]'
                  }`}>
                  {r.toFixed(1)}
                </td>
                {cols.map(c => {
                  const z = r + c;
                  const val = normalCDF(z, 0, 1);
                  const isColActive = lookupZ !== null && Math.abs(c - colVal!) < 0.001;
                  const isActive = isRowActive && isColActive;

                  return (
                    <td
                      key={c}
                      ref={isActive ? activeCellRef : undefined}
                      className={`p-2.5 border border-[var(--color-border)] text-center transition-all duration-300 tabular-nums text-mono-sm sm:text-mono-base ${isActive
                          ? 'bg-[var(--color-accent-cobalt-bg-hover)] text-white font-extrabold scale-102 shadow-sm z-10 relative rounded-lg'
                          : isRowActive
                            ? 'bg-[var(--color-accent-cobalt-strong)]/20 text-[var(--color-accent-brass)] font-semibold'
                            : isColActive
                              ? 'bg-[var(--color-accent-cobalt-strong)]/20 text-[var(--color-accent-cobalt)] font-semibold'
                              : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] font-medium'
                        }`}
                    >
                      {val.toFixed(4)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderTTableSection = () => (
    <div className="overflow-auto rounded-lg border border-[var(--color-border)] max-h-[480px]">
      <table className="w-full text-xs sm:text-sm border-collapse">
        <thead className="sticky top-0 z-30 shadow-sm">
          <tr className="bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]">
            <th rowSpan={2} className="sticky right-0 p-3 border border-[var(--color-border)] text-[var(--color-accent-cobalt)] font-black text-center text-xs sm:text-sm w-16 bg-[var(--color-surface-raised)] z-40">
              דרגות חופש <br /> (df)
            </th>
            <th colSpan={6} className="p-1.5 border-b border-[var(--color-border)] font-extrabold text-center text-xs bg-[var(--color-surface-raised)]">
              רמת מובהקות עבור התפלגות T
            </th>
          </tr>
          <tr className="bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]">
            {tCols.map((c, idx) => {
              const isActiveCol = (tSide === 'two' && Math.abs(tAlpha - c.twoTail) < 0.0001) || (tSide === 'one' && Math.abs(tAlpha - c.oneTail) < 0.0001);
              return (
                <th
                  key={idx}
                  className={`p-2.5 border border-[var(--color-border)] font-bold text-center transition-colors min-w-[70px] ${isActiveCol
                      ? 'bg-[var(--color-accent-cobalt-strong)] text-white'
                      : 'bg-[var(--color-surface-raised)]'
                    }`}
                >
                  <div className="text-caption opacity-75">חד-צדדי: {c.oneTail}</div>
                  <div className="text-xs">דו-צדדי: {c.twoTail}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {dfList.map(df => {
            const isRowActive = df === tDf;
            return (
              <tr key={df} className={`transition-colors duration-200 ${isRowActive
                  ? 'bg-[var(--color-surface-raised)]'
                  : 'hover:bg-[var(--color-surface)]'
                }`}>
                <td className={`sticky right-0 p-2.5 border border-[var(--color-border)] font-black text-center text-xs sm:text-sm transition-colors duration-300 z-20 ${isRowActive
                    ? 'bg-[var(--color-accent-cobalt-strong)] text-white'
                    : 'text-[var(--color-text-primary)] bg-[var(--color-surface)]'
                  }`}>
                  {df === 500 ? '∞ (Z)' : df}
                </td>
                {tCols.map((c, colIdx) => {
                  const val = studentTInverseCDF(1 - c.oneTail, df);
                  const isActiveCol = (tSide === 'two' && Math.abs(tAlpha - c.twoTail) < 0.0001) || (tSide === 'one' && Math.abs(tAlpha - c.oneTail) < 0.0001);
                  const isActive = isRowActive && isActiveCol;
                  return (
                    <td
                      key={colIdx}
                      className={`p-2.5 border border-[var(--color-border)] text-center transition-all duration-300 tabular-nums text-mono-sm sm:text-mono-base ${isActive
                          ? 'bg-[var(--color-accent-cobalt-bg-hover)] text-white bg-[var(--color-accent-cobalt-bg)]0 font-extrabold scale-102 shadow-sm z-10 relative rounded-lg'
                          : isRowActive
                            ? 'bg-[var(--color-accent-cobalt-bg)]/40 text-[var(--color-accent-cobalt)] bg-[var(--color-accent-cobalt-strong)]/20 text-[var(--color-accent-cobalt)] font-bold'
                            : isActiveCol
                              ? 'bg-[var(--color-accent-cobalt-bg)]/40 text-[var(--color-accent-cobalt)] bg-[var(--color-accent-cobalt-strong)]/20 text-[var(--color-accent-cobalt)] font-bold'
                              : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] font-medium'
                        }`}
                    >
                      {val.toFixed(3)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h2 data-toc id="normal-distribution-tables" className="text-lg font-bold text-[var(--color-text-primary)]">טבלאות התפלגות סטטיסטיות</h2>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-sans">איתור ערכים קריטיים וחיפוש מדויק בהתפלגות נורמלית ובהתפלגות t של Student</p>
      </div>

      {/* Z-Table Accordion */}
      <div id="normal-z-table" className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <button 
          onClick={() => setIsZTableOpen(!isZTableOpen)}
          className="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] transition-colors border-b border-[var(--color-border)]"
        >
          <h3
            data-toc
            data-toc-label="התפלגות נורמלית סטנדרטית - טבלת ערכי Z"
            data-toc-target="normal-z-table"
            data-toc-open="normal-z-table"
            className="text-base font-bold text-[var(--color-text-primary)] flex flex-wrap items-center gap-x-2 gap-y-1"
          >
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] px-1.5 text-[var(--color-accent-cobalt)] shadow-[var(--shadow-soft)]">
              <InlineMath math="Z" />
            </span>
            <span>התפלגות נורמלית סטנדרטית - טבלת ערכי Z</span>
            <span dir="ltr" className="text-sm font-medium text-[var(--color-text-secondary)]">
              <InlineMath math="\text{Standard\ Normal\ Distribution\ -\ Z-Score\ Table}" />
            </span>
          </h3>
          {isZTableOpen ? <ChevronUp size={20} className="text-[var(--color-text-secondary)]" /> : <ChevronDown size={20} className="text-[var(--color-text-secondary)]" />}
        </button>

        <AnimatePresence>
          {isZTableOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-5 space-y-6">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
              <button
                onClick={() => setIsZGuideOpen(!isZGuideOpen)}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 font-sans cursor-pointer"
              >
                <HelpCircle size={14} />
                {isZGuideOpen ? 'הסתר הסבר' : 'כיצד לקרוא את הטבלה?'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isZGuideOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-primary)] leading-relaxed space-y-1 text-right">
                  <p>● <strong>השורה הראשונה (<InlineMath math="Z" />):</strong> מציגה את ערך ה-<InlineMath math="Z" /> בדיוק של ספרה אחת לאחר הנקודה (למשל: 1.2).</p>
                  <p>● <strong>העמודות (0.00 עד 0.09):</strong> מציגות את מאיות ציון התקן (למשל: עמודה 0.06 משלימה ל-1.26).</p>
                  <p>● <strong>התא שבמפגש:</strong> מייצג את ההסתברות המצטברת <InlineMath math="P(Z \le z)" />, השטח המעוגל משמאל לנקודת הציון.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border)]">
              <div className="relative flex flex-col sm:flex-row bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] p-1.5 shadow-inner shrink-0 w-full md:w-auto" dir="rtl">
                {[
                  { id: 'z', label: 'חיפוש לפי ציון תקן', math: 'Z' },
                  { id: 'phi', label: 'חיפוש לפי הסתברות', math: '\\Phi' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSearchType(tab.id as 'z' | 'phi')}
                    className={`relative px-5 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer flex-1 md:flex-none z-10 ${
                      searchType === tab.id ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {searchType === tab.id && (
                      <motion.div
                        layoutId="activeSearchType"
                        className="absolute inset-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded shadow-sm -z-10"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <span>{tab.label}</span>
                    <span className="font-mono" dir="ltr"><InlineMath math={tab.math} /></span>
                  </button>
                ))}
              </div>

              <div className="w-full md:max-w-[340px] flex flex-col justify-center relative">
                <input
                  type="text"
                  value={searchType === 'z' ? searchVal : phiSearchVal}
                  onChange={e => searchType === 'z' ? setSearchVal(e.target.value) : setPhiSearchVal(e.target.value)}
                  placeholder=""
                  className={`w-full h-full bg-transparent border rounded px-4 py-3 text-base sm:text-lg text-[var(--color-text-primary)] font-mono focus:outline-none transition-all text-center shadow-sm relative z-10 ${
                    (searchType === 'z' && !searchVal) || (searchType === 'phi' && !phiSearchVal)
                      ? 'border-[var(--color-error)]/60 focus:border-[var(--color-error)]/80 focus:ring-1 focus:ring-[var(--color-error)]/80'
                      : 'border-[var(--color-border)] focus:border-[var(--color-accent-cobalt-line)] focus:ring-1 focus:ring-[var(--color-accent-cobalt-line)]'
                  }`}
                  dir="ltr"
                />

                <AnimatePresence>
                  {(!searchVal && searchType === 'z') && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none text-[var(--color-text-secondary)] opacity-50 text-lg sm:text-xl z-10"
                      dir="ltr"
                    >
                      <InlineMath math="Z = ?" />
                    </motion.div>
                  )}
                  {(!phiSearchVal && searchType === 'phi') && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none text-[var(--color-text-secondary)] opacity-50 text-lg sm:text-xl z-10"
                      dir="ltr"
                    >
                      <InlineMath math="\Phi = ?" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {actualZ !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="w-full p-4 sm:p-5 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] flex flex-col items-center justify-center gap-2 text-center">
                    <span className="text-base sm:text-lg font-mono text-[var(--color-text-secondary)] opacity-90" dir="ltr">
                      {searchType === 'z'
                        ? <InlineMath math={`\\Phi(\\textcolor{#D4A843}{${actualZ.toFixed(2)}}) = \\int_{-\\infty}^{\\textcolor{#D4A843}{${actualZ.toFixed(2)}}} f_Z dz = ${normalCDF(actualZ, 0, 1).toFixed(4)}`} />
                        : <InlineMath math={`Z = \\Phi^{-1}(\\textcolor{#D4A843}{${parseFloat(phiSearchVal || "0").toFixed(4)}}) \\approx ${actualZ.toFixed(2)}`} />
                      }
                    </span>
                  </div>
                  <div className="w-full p-6 sm:p-8 text-center text-lg sm:text-xl text-[var(--color-text-primary)] leading-relaxed bg-[var(--color-surface)]">
                    {searchType === 'z' ? (
                      <>
                        עבור ציון תקן <span dir="ltr" className="font-bold"><InlineMath math={`Z = ${actualZ.toFixed(2)}`} /></span>,<br />
                        השטח המצטבר (ההסתברות) הוא <span dir="ltr" className="font-bold"><InlineMath math={`\\Phi(Z) = ${normalCDF(actualZ, 0, 1).toFixed(4)}`} /></span> 
                        <span className="text-[var(--color-accent-brass)] mx-2 text-xl font-bold">(<InlineMath math={`${(normalCDF(actualZ, 0, 1) * 100).toFixed(2)}\\%`} />)</span>.
                      </>
                    ) : (
                      <>
                        עבור הסתברות מצטברת של <span className="text-[var(--color-accent-brass)] mx-1 text-xl font-bold"><InlineMath math={`${(parseFloat(phiSearchVal || "0") * 100).toFixed(1)}\\%`} /></span>,<br />
                        ציון התקן המתאים הוא <span dir="ltr" className="font-bold"><InlineMath math={`Z \\approx ${actualZ.toFixed(2)}`} /></span>.
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {renderTableSection(rows)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Popular Z-Scores Static */}
      <div id="normal-popular-z" className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <div className="w-full flex items-center p-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-[var(--color-accent-cobalt)]" />
            <h3 data-toc data-toc-target="normal-popular-z" data-toc-open="normal-popular-z" className="text-base font-bold text-[var(--color-text-primary)]">ערכים וציוני תקן פופולריים למבחני השערות</h3>
          </div>
        </div>

        <div className="overflow-hidden">
              <div className="p-5 bg-[var(--color-surface)]">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { confidence: "90%", alpha: 0.10, tail: "one", phi: 0.9000, z: 1.282, label: "חד-צדדי" },
                { confidence: "90%", alpha: 0.10, tail: "two", phi: 0.9500, z: 1.645, label: "דו-צדדי" },
                { confidence: "95%", alpha: 0.05, tail: "one", phi: 0.9500, z: 1.645, label: "חד-צדדי" },
                { confidence: "95%", alpha: 0.05, tail: "two", phi: 0.9750, z: 1.960, label: "דו-צדדי" },
                { confidence: "99%", alpha: 0.01, tail: "one", phi: 0.9900, z: 2.326, label: "חד-צדדי" },
                { confidence: "99%", alpha: 0.01, tail: "two", phi: 0.9950, z: 2.576, label: "דו-צדדי" },
              ].map((item, idx) => {
                const isMatched = actualZ !== null && (
                  Math.abs(Math.abs(actualZ) - item.z) < 0.05 ||
                  (searchType === 'phi' && phiSearchVal && Math.abs(parseFloat(phiSearchVal) - item.phi) < 0.01)
                );

                return (
                  <PopularZCard
                    key={idx}
                    item={item}
                    isMatched={isMatched}
                    onClick={() => {
                      setSearchType('z');
                      setSearchVal(item.z.toFixed(3));
                    }}
                  />
                );
              })}
            </div>
              </div>
        </div>
      </div>

      {/* T-Table Accordion */}
      <div id="normal-t-table" className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <button 
          onClick={() => setIsTTableOpen(!isTTableOpen)}
          className="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] transition-colors border-b border-[var(--color-border)]"
        >
          <h3
            data-toc
            data-toc-label="ערכים קריטיים להתפלגות Student's"
            data-toc-target="normal-t-table"
            data-toc-open="normal-t-table"
            className="text-base font-bold text-[var(--color-text-primary)] flex flex-wrap items-center gap-x-2 gap-y-1"
          >
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] px-1.5 text-[var(--color-accent-cobalt)] shadow-[var(--shadow-soft)]">
              <InlineMath math="t" />
            </span>
            <span>ערכים קריטיים להתפלגות Student's t</span>
            <span dir="ltr" className="text-sm font-medium text-[var(--color-text-secondary)]">
              <InlineMath math="\text{Critical\ Values\ for\ Student's\ t-Distribution}" />
            </span>
          </h3>
          {isTTableOpen ? <ChevronUp size={20} className="text-[var(--color-text-secondary)]" /> : <ChevronDown size={20} className="text-[var(--color-text-secondary)]" />}
        </button>

        <AnimatePresence>
          {isTTableOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-5 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div></div>
            <button
              onClick={() => setIsTGuideOpen(!isTGuideOpen)}
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 font-sans cursor-pointer"
            >
              <HelpCircle size={14} />
              {isTGuideOpen ? 'הסתר הסבר' : <>מדריך מקוצר להתפלגות <InlineMath math="t" /></>}
            </button>
          </div>

          <AnimatePresence>
            {isTGuideOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-3"
              >
                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-primary)] leading-relaxed space-y-1 text-right">
                  <p>● הטבלה מציגה דרגות חופש (df) בשורות ורמות מובהקות (אלפא) בעמודות.</p>
                  <p>● ערכי התאים הם הערך הקריטי <InlineMath math="t_{crit}" /> שעבורו השטח מימין (למבחן חד-צדדי) או משני הצדדים (לדו-צדדי) שווה לאלפא.</p>
                  <p>● עבור דרגת חופש אינסופית (∞), התפלגות <InlineMath math="t" /> מתכנסת בדיוק להתפלגות נורמלית סטנדרטית <InlineMath math="Z" />.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-4 bg-[var(--color-surface-raised)] p-4 rounded-lg border border-[var(--color-border)]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-2 flex flex-col justify-end relative">
                <label className="block text-xs font-black text-[var(--color-text-primary)] mb-2 font-sans">דרגות חופש (<InlineMath math="df" />):</label>
                <div className="relative w-full">
                  <input
                    type="number"
                    value={tDf}
                    onChange={e => {
                      const val = e.target.value;
                      setTDf(val === '' ? '' : Math.max(1, parseInt(val) || 1));
                    }}
                    className={`w-full bg-transparent border rounded-sm px-3 py-2 text-sm text-[var(--color-text-primary)] font-mono focus:outline-none transition-colors relative z-10 ${
                      tDf === ''
                        ? 'border-[var(--color-error)]/60 focus:border-[var(--color-error)]/80 focus:ring-1 focus:ring-[var(--color-error)]/80'
                        : 'border-[var(--color-border)] focus:border-[var(--color-accent-cobalt-line)]'
                    }`}
                  />
                  <AnimatePresence>
                    {tDf === '' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center px-4 pointer-events-none text-[var(--color-text-secondary)] opacity-50 z-0"
                        dir="ltr"
                      >
                        <span className="w-full text-center"><InlineMath math="N - 1" /></span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="md:col-span-4 lg:col-span-3 flex flex-col justify-end">
                <label className="block text-xs font-black text-[var(--color-text-primary)] mb-2 font-sans">סוג המבחן:</label>
                <div className="flex bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]/50 p-1 shadow-sm w-full relative">
                  {['two', 'one'].map(side => (
                    <button
                      key={side}
                      onClick={() => setTSide(side as 'two' | 'one')}
                      className={`relative flex-1 py-1.5 rounded-sm text-xs font-bold transition-colors z-10 ${tSide === side ? 'text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                    >
                      {tSide === side && (
                        <motion.div
                          layoutId="tSidePill"
                          className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-sm shadow-sm -z-10"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      {side === 'two' ? 'דו-צדדי' : 'חד-צדדי'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-6 lg:col-span-7 flex flex-col justify-end">
                <label className="block text-xs font-black text-[var(--color-text-primary)] mb-2 font-sans">אלפא (מובהקות):</label>
                <div className="flex flex-wrap sm:flex-nowrap bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]/50 p-1 shadow-sm w-full gap-1 relative">
                  {[0.20, 0.10, 0.05, 0.02, 0.01, 0.001].map(a => (
                    <button
                      key={a}
                      onClick={() => setTAlpha(a)}
                      className={`relative flex-1 min-w-[40px] py-1.5 rounded-sm text-xs font-bold font-mono transition-colors z-10 ${tAlpha === a ? 'text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                    >
                      {tAlpha === a && (
                        <motion.div
                          layoutId="tAlphaPill"
                          className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-sm shadow-sm -z-10"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {computedTCritical !== null && (
            <div className="mb-4 text-sm font-black text-[var(--color-text-primary)]">
              עבור df = {tDf === 500 ? '∞ (Z)' : tDf}, אלפא = {tAlpha}, מבחן {tSide === 'two' ? 'דו-צדדי' : 'חד-צדדי'}:
              ערך קריטי <InlineMath math="t_{crit}" /> = <span className="text-[var(--color-accent-cobalt)] font-mono text-base ml-1">{computedTCritical.toFixed(4)}</span>
            </div>
          )}

          {renderTTableSection()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface NormalDistributionCalculatorProps {
  initialMode?: CalcMode;
  onNavigate?: (page: SitePage) => void;
}

export default function NormalDistributionCalculator({ initialMode, onNavigate }: NormalDistributionCalculatorProps = {}) {
  // Main persistent states
  const [mode, setMode] = useLocalStorageState<CalcMode>('ND_mode', 'hypothesis');

  useEffect(() => {
    if (initialMode && initialMode !== mode) {
      setMode(initialMode);
    }
  }, [initialMode, mode, setMode]);

  // Normal parameters
  const [mean, setMean] = useLocalStorageState<number>('ND_mean_v2', 100);
  const [meanInput, setMeanInput] = useLocalStorageState<string>('ND_meanInput_v2', '100');

  const [stdDev, setStdDev] = useLocalStorageState<number>('ND_stdDev_v2', 15);
  const [stdDevInput, setStdDevInput] = useLocalStorageState<string>('ND_stdDevInput_v2', '15');

  // Forward calculations values
  const [forwardType, setForwardType] = useLocalStorageState<CalcType>('ND_forwardType', 'below');
  const [x1, setX1] = useLocalStorageState<number>('ND_x1_v2', 115);
  const [x1Input, setX1Input] = useLocalStorageState<string>('ND_x1Input_v2', '115');
  const [x2, setX2] = useLocalStorageState<number>('ND_x2_v2', 125);
  const [x2Input, setX2Input] = useLocalStorageState<string>('ND_x2Input_v2', '125');

  // Inverse calculations values
  const [inverseProb, setInverseProb] = useLocalStorageState<number>('ND_inverseProb', 0.95);
  const [inverseProbInput, setInverseProbInput] = useLocalStorageState<string>('ND_inverseProbInput', '0.95');
  const [inverseType, setInverseType] = useLocalStorageState<CalcType>('ND_inverseType', 'below');

  // Conditional calculations values
  const [condType, setCondType] = useLocalStorageState<CondType>('ND_condType', 'above');
  const [condTypeA, setCondTypeA] = useLocalStorageState<CondType>('ND_condTypeA', 'below');
  const [condX1, setCondX1] = useLocalStorageState<number>('ND_condX1', 110);
  const [condX1Input, setCondX1Input] = useLocalStorageState<string>('ND_condX1Input', '110');
  const [condX2, setCondX2] = useLocalStorageState<number>('ND_condX2', 120);
  const [condX2Input, setCondX2Input] = useLocalStorageState<string>('ND_condX2Input', '120');

  // URL Routing for Direct Links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get('mode') || window.location.hash.replace('#', '');
    const validModes = ['forward', 'inverse'];
    if (urlMode && validModes.includes(urlMode)) {
      setMode(urlMode as CalcMode);
    }
    // Forward/Inverse type from URL
    const urlType = params.get('type');
    const validTypes = ['below', 'above', 'between', 'outside'];
    if (urlType && validTypes.includes(urlType)) {
      if (urlMode === 'forward' || urlMode === null) {
        setForwardType(urlType as CalcType);
      } else if (urlMode === 'inverse') {
        setInverseType(urlType as CalcType);
      }
    }
    // Parameters from URL
    const urlMu = params.get('mu');
    if (urlMu && !isNaN(parseFloat(urlMu))) {
      const val = parseFloat(urlMu);
      setMean(val);
      setMeanInput(urlMu);
    }
    const urlSigma = params.get('sd') || params.get('sigma');
    if (urlSigma && !isNaN(parseFloat(urlSigma))) {
      const val = parseFloat(urlSigma);
      setStdDev(val);
      setStdDevInput(urlSigma);
    }
    const urlX = params.get('x');
    if (urlX && !isNaN(parseFloat(urlX))) {
      const val = parseFloat(urlX);
      setX1(val);
      setX1Input(urlX);
    }
    const urlX2 = params.get('x2');
    if (urlX2 && !isNaN(parseFloat(urlX2))) {
      const val = parseFloat(urlX2);
      setX2(val);
      setX2Input(urlX2);
    }
    const urlP = params.get('p');
    if (urlP && !isNaN(parseFloat(urlP))) {
      const val = parseFloat(urlP);
      if (val > 0 && val < 1) {
        setInverseProb(val);
        setInverseProbInput(urlP);
      }
    }
  }, []);

  // Validations
  const errors = useMemo(() => {
    const errs: { [key: string]: string } = {};
    if (meanInput.trim() === '' || isNaN(parseFloat(meanInput))) errs.mean = 'נא להזין מספר תקין';
    const sdVal = parseFloat(stdDevInput);
    if (stdDevInput.trim() === '' || isNaN(sdVal)) errs.stdDev = 'נא להזין מספר תקין';
    else if (sdVal <= 0) errs.stdDev = 'סטיית תקן חייבת להיות גדולה מ-0';

    if (mode === 'forward') {
      if (x1Input.trim() === '' || isNaN(parseFloat(x1Input))) errs.x1 = 'נא להזין מספר תקין';
      if ((forwardType === 'between' || forwardType === 'outside') && (x2Input.trim() === '' || isNaN(parseFloat(x2Input)))) {
        errs.x2 = 'נא להזין מספר תקין';
      }
    } else if (mode === 'inverse') {
      const probVal = parseFloat(inverseProbInput);
      if (inverseProbInput.trim() === '' || isNaN(probVal)) errs.inverseProb = 'נא להזין מ-0 עד 1';
      else if (probVal <= 0 || probVal >= 1) errs.inverseProb = 'הסתברות חייבת להיות בטווח הפתוח (0, 1)';
    }

    return errs;
  }, [meanInput, stdDevInput, x1Input, x2Input, inverseProbInput, forwardType, mode]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  // Handlers for inputs
  const handleMeanChange = (val: string) => {
    setMeanInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) setMean(parsed);
  };

  const handleStdDevChange = (val: string) => {
    setStdDevInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) setStdDev(parsed);
  };

  const handleX1Change = (val: string) => {
    setX1Input(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) setX1(parsed);
  };

  const handleX2Change = (val: string) => {
    setX2Input(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) setX2(parsed);
  };

  const handleInverseProbChange = (val: string) => {
    setInverseProbInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0 && parsed < 1) setInverseProb(parsed);
  };

  const handleCondX1Change = (val: string) => {
    setCondX1Input(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) setCondX1(parsed);
  };

  const handleCondX2Change = (val: string) => {
    setCondX2Input(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) setCondX2(parsed);
  };

  // Core Calculations
  const calculation = useMemo<CalculationResult | null>(() => {
    if (!isValid) return null;

    if (mode === 'forward') {
      const steps: string[] = [];
      steps.push(`שלב 1 | זיהוי פרמטרי ההתפלגות | האוכלוסייה מתפלגת נורמלית עם תוחלת [MATH]\\mu = ${mean}[/MATH] וסטיית תקן [MATH]\\sigma = ${stdDev}[/MATH].`);

      if (forwardType === 'conditional') {
        // interval B elements
        let pB = 0;
        let bExpr = '';
        let bText = '';
        if (condType === 'below') {
          pB = normalCDF(condX1, mean, stdDev);
          bExpr = `X \\le ${condX1}`;
          bText = `P(X \\le ${condX1}) = \\Phi\\left(\\frac{${condX1} - ${mean}}{${stdDev}}\\right) = \\Phi(${((condX1 - mean) / stdDev).toFixed(2)}) = ${pB.toFixed(4)}`;
          steps.push(`שלב 2 | חישוב הסתברות תנאי הרקע B | [MATH]P(${bExpr})[/MATH].`);
          steps.push(`[MATH]${bText}[/MATH]`);
        } else if (condType === 'above') {
          pB = 1 - normalCDF(condX1, mean, stdDev);
          bExpr = `X \\ge ${condX1}`;
          bText = `P(X \\ge ${condX1}) = 1 - \\Phi(${((condX1 - mean) / stdDev).toFixed(2)}) = ${pB.toFixed(4)}`;
          steps.push(`שלב 2 | חישוב הסתברות תנאי הרקע B | [MATH]P(${bExpr})[/MATH].`);
          steps.push(`[MATH]${bText}[/MATH]`);
        } else {
          const bStart = Math.min(condX1, condX2);
          const bEnd = Math.max(condX1, condX2);
          pB = normalCDF(bEnd, mean, stdDev) - normalCDF(bStart, mean, stdDev);
          bExpr = `${bStart} \\le X \\le ${bEnd}`;
          bText = `P(${bExpr}) = \\Phi(${((bEnd - mean) / stdDev).toFixed(2)}) - \\Phi(${((bStart - mean) / stdDev).toFixed(2)}) = ${pB.toFixed(4)}`;
          steps.push(`שלב 2 | חישוב הסתברות תנאי הרקע B | [MATH]P(${bExpr})[/MATH].`);
          steps.push(`[MATH]${bText}[/MATH]`);
        }

        // Interval A elements
        let aExpr = '';
        if (condTypeA === 'below') aExpr = `X \\le ${x1}`;
        else if (condTypeA === 'above') aExpr = `X \\ge ${x1}`;
        else aExpr = `${Math.min(x1, x2)} \\le X \\le ${Math.max(x1, x2)}`;

        // Joint interval start and end (intersection)
        const getRange = (t: string, v1: number, v2: number): [number, number] => {
          if (t === 'below') return [-Infinity, v1];
          if (t === 'above') return [v1, Infinity];
          return [Math.min(v1, v2), Math.max(v1, v2)];
        };
        const rA = getRange(condTypeA, x1, x2);
        const rB = getRange(condType, condX1, condX2);

        const interS = Math.max(rA[0], rB[0]);
        const interE = Math.min(rA[1], rB[1]);

        let pJoint = 0;
        steps.push(`שלב 3 | הגדרת חיתוך המאורעות | המאורע [MATH]A \\cap B[/MATH] מוגדר כחיתוך שני התנאים כדי לחשב [MATH]P(A \\cap B)[/MATH].`);

        if (interS < interE) {
          const capStartSym = interS === -Infinity ? '-\\infty' : interS.toFixed(2);
          const capEndSym = interE === Infinity ? '\\infty' : interE.toFixed(2);
          pJoint = (interE === Infinity ? 1 : normalCDF(interE, mean, stdDev)) - (interS === -Infinity ? 0 : normalCDF(interS, mean, stdDev));
          steps.push(`טווח החיתוך הוא הטווח המשותף של שני התנאים: [MATH][${capStartSym}, ${capEndSym}][/MATH].`);
          steps.push(`ההסתברות המשותפת: [MATH]P(A \\cap B) = P(${interS === -Infinity ? '' : `${interS.toFixed(1)} \\le `}X \\le ${interE === Infinity ? '' : interE.toFixed(1)}) = ${pJoint.toFixed(4)}[/MATH]`);
        } else {
          steps.push(`טווח החיתוך ריק! לשני המאורעות אין חפיפה בדגימות.`);
          steps.push(`ההסתברות המשותפת במקרה זה: [MATH]P(A \\cap B) = 0[/MATH]`);
        }

        const finalProb = pB > 0 ? pJoint / pB : 0;
        steps.push(`שלב 4 | חישוב הסתברות מותנית | שימוש בנוסחת ההסתברות המותנית: [MATH]P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}[/MATH].`);
        steps.push(`תוצאה סופית: מהשלבים לעיל נקבל: [MATH]P(A \\mid B) = \\frac{${pJoint.toFixed(4)}}{${pB.toFixed(4)}} = ${finalProb.toFixed(4)}[/MATH]`);

        return {
          probability: finalProb,
          z1: (x1 - mean) / stdDev,
          z2: (x2 - mean) / stdDev,
          steps
        };
      }

      // Standard calculations
      const z1 = (x1 - mean) / stdDev;
      const z2 = (x2 - mean) / stdDev;
      let prob = 0;

      steps.push(`שלב 2 | תקינה והמרת ערכים לציון תקן (Z) | נוסחת ציון התקן היא [MATH]Z = \\frac{X - \\mu}{\\sigma}[/MATH].`);

      if (forwardType === 'below') {
        prob = normalCDF(x1, mean, stdDev);
        steps.push(`החלפת ערכים נותנת: [MATH]Z_1 = \\frac{${x1} - ${mean}}{${stdDev}} = ${z1.toFixed(4)}[/MATH].`);
        steps.push(`שלב 3 | איתור שטח משמאל | שימוש בפונקציית ההתפלגות המצטברת (CDF) לאיתור השטח שמשמאל ל-Z: [MATH]P(X \\le ${x1}) = P(Z \\le ${z1.toFixed(2)}) = \\Phi(${z1.toFixed(2)})[/MATH].`);
        steps.push(`תוצאה סופית: ההסבר הסטטיסטי מבוטא כשטח ההתפלגות [MATH]P(X \\le ${x1}) = ${prob.toFixed(4)}[/MATH] (או ${(prob * 100).toFixed(2)}% מהאוכלוסייה).`);
      } else if (forwardType === 'above') {
        prob = 1 - normalCDF(x1, mean, stdDev);
        steps.push(`החלפת ערכים נותנת: [MATH]Z_1 = \\frac{${x1} - ${mean}}{${stdDev}} = ${z1.toFixed(4)}[/MATH].`);
        steps.push(`שלב 3 | איתור שטח מימין | השטח מימין ל-Z הוא המשלים לשלם: [MATH]P(X \\ge ${x1}) = P(Z \\ge ${z1.toFixed(2)}) = 1 - \\Phi(${z1.toFixed(2)})[/MATH].`);
        steps.push(`תוצאה סופית: השטח המבוקש מימין הוא [MATH]P(X \\ge ${x1}) = 1 - ${normalCDF(x1, mean, stdDev).toFixed(4)} = ${prob.toFixed(4)}[/MATH] (או ${(prob * 100).toFixed(2)}%).`);
      } else if (forwardType === 'between') {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const zMin = (minX - mean) / stdDev;
        const zMax = (maxX - mean) / stdDev;
        prob = normalCDF(maxX, mean, stdDev) - normalCDF(minX, mean, stdDev);
        steps.push(`חישוב ציוני תקן לשני הגבולות:`);
        steps.push(`[MATH]Z_{Min} = \\frac{${minX} - ${mean}}{${stdDev}} = ${zMin.toFixed(2)}[/MATH]`);
        steps.push(`[MATH]Z_{Max} = \\frac{${maxX} - ${mean}}{${stdDev}} = ${zMax.toFixed(2)}[/MATH]`);
        steps.push(`שלב 3 | שטח בין שני גבולות | מציאת ההפרש בין השטח המצטבר של הגבול העליון לגבול התחתון: [MATH]P(${minX} \\le X \\le ${maxX}) = \\Phi(${zMax.toFixed(2)}) - \\Phi(${zMin.toFixed(2)})[/MATH].`);
        steps.push(`תוצאה סופית: השטח הכלוא בין שני הגבולות במדגם הוא [MATH]P(${minX} \\le X \\le ${maxX}) = ${normalCDF(maxX, mean, stdDev).toFixed(4)} - ${normalCDF(minX, mean, stdDev).toFixed(4)} = ${prob.toFixed(4)}[/MATH] (או ${(prob * 100).toFixed(2)}%).`);
      } else {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const zMin = (minX - mean) / stdDev;
        const zMax = (maxX - mean) / stdDev;
        prob = 1 - (normalCDF(maxX, mean, stdDev) - normalCDF(minX, mean, stdDev));
        steps.push(`חישוב ציוני תקן לשני הקצוות:`);
        steps.push(`[MATH]Z_{Min} = \\frac{${minX} - ${mean}}{${stdDev}} = ${zMin.toFixed(2)}[/MATH]`);
        steps.push(`[MATH]Z_{Max} = \\frac{${maxX} - ${mean}}{${stdDev}} = ${zMax.toFixed(2)}[/MATH]`);
        steps.push(`שלב 3 | השטח בזנבות | השטח שמחוץ לשני הגבולות (שני הזנבות במשותף) מחושב כמשלים של השטח שביניהם: [MATH]P(X \\le ${minX} \\cup X \\ge ${maxX}) = 1 - (\\Phi(${zMax.toFixed(2)}) - \\Phi(${zMin.toFixed(2)}))[/MATH].`);
        steps.push(`תוצאה סופית: השטח המשולב בקצוות התפלגות האוכלוסייה הוא [MATH]P(X \\le ${minX} \\cup X \\ge ${maxX}) = ${prob.toFixed(4)}[/MATH] (או ${(prob * 100).toFixed(2)}%).`);
      }

      return {
        probability: prob,
        z1,
        z2,
        steps
      };
    } else {
      // Inverse mode
      const steps: string[] = [];
      steps.push(`שלב 1 | זיהוי פרמטרים והסתברות | ההתפלגות היא [MATH]\\mu = ${mean}, \\sigma = ${stdDev}[/MATH] והשטח המצטבר הנתון הוא [MATH]p = ${inverseProb}[/MATH] (כלומר ${(inverseProb * 100).toFixed(1)}%).`);

      let z = 0;
      let calculatedX = mean;
      steps.push(`שלב 2 | מציאת ציון התקן התואם | מציאת ציון התקן (Z-score) התואם לשטח הנתון בהתפלגות הנורמלית הסטנדרטית באמצעות פונקציה הפוכה:`);

      if (inverseType === 'below') {
        z = inverseNormalCDF(inverseProb);
        calculatedX = mean + z * stdDev;
        steps.push(`עבור שטח מצטבר משמאל של [MATH]p = ${inverseProb}[/MATH], ציון התקן התואם הוא [MATH]Z = \\Phi^{-1}(${inverseProb}) = ${z.toFixed(4)}[/MATH].`);
        steps.push(`שלב 3 | חילוץ ערך פיזי (X) | שחרור הציון היחסי חזרה לערך פיזי לא מנורמל ע"י הנוסחה: [MATH]X = \\mu + Z \\cdot \\sigma[/MATH].`);
        steps.push(`תוצאה סופית: ערך ה-X המתקבל הוא [MATH]X = ${mean} + (${z.toFixed(2)}) \\cdot ${stdDev} = ${calculatedX.toFixed(2)}[/MATH].`);
      } else if (inverseType === 'above') {
        z = inverseNormalCDF(1 - inverseProb);
        calculatedX = mean + z * stdDev;
        steps.push(`בגלל שמבוקש שטח מצטבר מימין (מעל) של [MATH]p = ${inverseProb}[/MATH], אנו מחפשים שטח משמאל של [MATH]1 - p = ${(1 - inverseProb).toFixed(4)}[/MATH].`);
        steps.push(`ערך ה-Z התואם הוא [MATH]Z = \\Phi^{-1}(${(1 - inverseProb).toFixed(4)}) = ${z.toFixed(4)}[/MATH].`);
        steps.push(`שלב 3 | המרה חזרה לערכי X | נחלץ את ערך ה-X המקורי: [MATH]X = \\mu + Z \\cdot \\sigma[/MATH].`);
        steps.push(`תוצאה סופית: ערך ה-X המתקבל הוא [MATH]X = ${mean} + (${z.toFixed(2)}) \\cdot ${stdDev} = ${calculatedX.toFixed(2)}[/MATH].`);
      } else if (inverseType === 'between') {
        // Area strictly in the middle is inverseProb. Tails combined are (1 - inverseProb). Individual tail is (1-inverseProb)/2
        const tailArea = (1 - inverseProb) / 2;
        const lowerZ = inverseNormalCDF(tailArea);
        const upperZ = -lowerZ;
        const lowerX = mean + lowerZ * stdDev;
        const upperX = mean + upperZ * stdDev;
        steps.push(`מבוקש שטח מרכזי סימטרי של [MATH]p = ${inverseProb}[/MATH]. המשמעות היא שכל אחד משני הזנבות בקצוות מחזיק שטח של [MATH]\\frac{1 - ${inverseProb}}{2} = ${tailArea.toFixed(4)}[/MATH].`);
        steps.push(`ציון תקן לגבול התחתון: [MATH]Z_{Lower} = \\Phi^{-1}(${tailArea.toFixed(4)}) = ${lowerZ.toFixed(4)}[/MATH]`);
        steps.push(`ציון תקן לגבול העליון: [MATH]Z_{Upper} = ${upperZ.toFixed(4)}[/MATH]`);
        steps.push(`שלב 3 | המרה חזרה לשני ערכי ה-X | המרה חזרה לשני ערכי ה-X המקוריים בקצוות:`);
        steps.push(`[MATH]X_{Lower} = ${mean} + (${lowerZ.toFixed(2)}) \\cdot ${stdDev} = ${lowerX.toFixed(2)}[/MATH]`);
        steps.push(`[MATH]X_{Upper} = ${mean} + (${upperZ.toFixed(2)}) \\cdot ${stdDev} = ${upperX.toFixed(2)}[/MATH]`);
        steps.push(`תוצאה סופית: הטווח הכלוא המבוקש הינו בדיוק [MATH]X \\in [${lowerX.toFixed(2)}, ${upperX.toFixed(2)}][/MATH].`);

        return {
          probability: inverseProb,
          z1: lowerZ,
          z2: upperZ,
          calculatedX: lowerX, // reference point
          steps
        };
      } else {
        // Area outside is inverseProb. Middle is 1 - inverseProb. Individual tail is inverseProb/2
        const tailArea = inverseProb / 2;
        const lowerZ = inverseNormalCDF(tailArea);
        const upperZ = -lowerZ;
        const lowerX = mean + lowerZ * stdDev;
        const upperX = mean + upperZ * stdDev;
        steps.push(`מבוקש שחלקם המשותף של שני הזנבות החיצוניים יהיה [MATH]p = ${inverseProb}[/MATH], מה שאומר שכל זנב לבדו מחזיק שטח של [MATH]\\frac{${inverseProb}}{2} = ${tailArea.toFixed(4)}[/MATH].`);
        steps.push(`ציון תקן לגבול התחתון: [MATH]Z_{Lower} = \\Phi^{-1}(${tailArea.toFixed(4)}) = ${lowerZ.toFixed(4)}[/MATH]`);
        steps.push(`ציון תקן לגבול העליון: [MATH]Z_{Upper} = ${upperZ.toFixed(4)}[/MATH]`);
        steps.push(`שלב 3 | המרת ערכי ה-Z חזרה לערכי X | המרת ערכי ה-Z חזרה לערכי X:`);
        steps.push(`[MATH]X_{Lower} = ${mean} + (${lowerZ.toFixed(2)}) \\cdot ${stdDev} = ${lowerX.toFixed(2)}[/MATH]`);
        steps.push(`[MATH]X_{Upper} = ${mean} + (${upperZ.toFixed(2)}) \\cdot ${stdDev} = ${upperX.toFixed(2)}[/MATH]`);
        steps.push(`תוצאה סופית: הטווח החיצוני המבוקש הוא [MATH]X \\le ${lowerX.toFixed(2)}[/MATH] או [MATH]X \\ge ${upperX.toFixed(2)}[/MATH].`);

        return {
          probability: inverseProb,
          z1: lowerZ,
          z2: upperZ,
          calculatedX: lowerX,
          steps
        };
      }

      return {
        probability: inverseProb,
        z1: z,
        calculatedX,
        steps
      };
    }
  }, [mean, stdDev, x1, x2, condX1, condX2, condType, condTypeA, inverseProb, inverseType, forwardType, isValid, mode]);

  // Chart parameters helpers
  const chartX1 = useMemo(() => {
    if (mode === 'forward') return x1;
    if (!calculation || calculation.calculatedX === undefined) return mean;
    return calculation.calculatedX;
  }, [mode, x1, calculation, mean]);

  const chartX2 = useMemo(() => {
    if (mode === 'forward') return x2;
    // Symmetric inverse returns lower boundary in calculatedX, let's extrapolate upper
    if (inverseType === 'between' || inverseType === 'outside') {
      if (calculation && calculation.z2 !== undefined) {
        return mean + calculation.z2 * stdDev;
      }
    }
    return mean;
  }, [mode, x2, inverseType, calculation, mean, stdDev]);

  const chartProb = useMemo(() => {
    return calculation ? calculation.probability : 0;
  }, [calculation]);

  const calculatorMode = mode === 'inverse' ? 'inverse' : 'forward';
  const heroCopy = getCalculatorHeroCopy(calculatorMode);
  const hasSecondaryBoundInput =
    mode === 'forward'
      ? forwardType === 'between' || forwardType === 'outside' || (forwardType === 'conditional' && condTypeA === 'between')
      : inverseType === 'between' || inverseType === 'outside';
  const secondaryInputLabel =
    mode === 'forward'
      ? forwardType === 'conditional'
        ? 'ערך מאורע:'
        : 'גבול תחום עליון:'
      : inverseType === 'between'
        ? 'גבול עליון יעד:'
        : 'גבול זנב עליון:';
  const secondaryInputValue =
    mode === 'forward'
      ? x2Input
      : calculation && calculation.z2 !== undefined
        ? (mean + calculation.z2 * stdDev).toFixed(2)
        : '';

  const resetNormalCalculator = () => {
    setMean(100);
    setMeanInput('100');
    setStdDev(15);
    setStdDevInput('15');
    setX1(115);
    setX1Input('115');
    setX2(125);
    setX2Input('125');
    setInverseProb(0.95);
    setInverseProbInput('0.95');
    setForwardType('below');
    setInverseType('below');
    setCondType('above');
    setCondTypeA('below');
    setCondX1(110);
    setCondX1Input('110');
    setCondX2(120);
    setCondX2Input('120');
  };

  const handleCalculatorModeChange = (nextMode: CalculatorMode) => {
    if (onNavigate) {
      onNavigate(nextMode);
      return;
    }

    setMode(nextMode);
  };

  return (
    <>
      <AnimatePresence mode="wait">
          {mode === 'hypothesis' ? (
            <motion.div
              key="hypothesis"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <HypothesisTestingCalculator />
            </motion.div>
          ) : mode === 'formula-sheet' ? (
            <motion.div
              key="formula-sheet"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <FormulaSheet theme="dark" />
            </motion.div>
          ) : mode === 'table' ? (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <ZTable activeZ={calculation ? calculation.z1 : null} showSearch={true} />
            </motion.div>
          ) : (
            <motion.div
              key="calculators"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              <section className="relative overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-md">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <span className="absolute left-6 top-6 -rotate-6 text-4xl sm:text-5xl font-mono font-black text-[var(--color-accent-cobalt)]/10" dir="ltr">
                    <InlineMath math={mode === 'forward' ? '\\Phi(z)' : '\\Phi^{-1}(p)'} />
                  </span>
                  <span className="absolute left-1/3 top-14 rotate-6 text-3xl sm:text-4xl font-mono font-black text-[var(--color-accent-brass)]/10" dir="ltr">
                    <InlineMath math={`\\mu = ${mean}`} />
                  </span>
                  <span className="absolute bottom-8 right-[12%] -rotate-6 text-4xl sm:text-5xl font-mono font-black text-[var(--color-accent-teal)]/10" dir="ltr">
                    <InlineMath math={`\\sigma = ${stdDev}`} />
                  </span>
                </div>

                <div className="relative z-10 space-y-6 p-5 sm:p-6 md:p-8">
                  <div className="flex flex-col gap-6">
                    <div className="w-full space-y-6 text-right">
                      <div className="space-y-3 max-w-3xl">
                        <div className="accent-bar" />
                        <Heading
                          level="page"
                          align="start"
                          className="justify-start text-[var(--text-display-h2)] leading-[var(--text-display-h2--line-height)] tracking-[var(--text-display-h2--letter-spacing)]"
                        >
                          {heroCopy.title}
                        </Heading>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3 pt-2">
                        {heroCopy.steps.map((step) => (
                          <div key={step.number} className="relative rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/85 p-4 text-right flex flex-col gap-2 transition-colors hover:border-[var(--color-accent-cobalt)]/50">
                            <div className="flex items-center gap-2.5 mb-1">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-cobalt)]/10 text-sm font-black text-[var(--color-accent-cobalt)]">
                                {step.number}
                              </div>
                              <h3 className="text-body-base font-bold text-[var(--color-text-primary)]">{step.title}</h3>
                            </div>
                            <p className="text-body-sm leading-relaxed text-[var(--color-text-secondary)]">
                              {step.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </section>

              <div className="space-y-6">
                <CalculatorSidebar className="relative overflow-hidden space-y-5 text-right">
                  <div className="absolute top-0 right-0 h-1 w-full bg-[var(--color-accent-cobalt-bg-hover)]" />

                  <div className="relative z-10 space-y-5">
                    <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-4 sm:flex-row sm:items-center">
                      <div className="rounded-lg bg-[var(--color-accent-cobalt-bg)]/20 p-2 text-[var(--color-accent-cobalt)]">
                        <Sliders size={20} />
                      </div>
                      <div className="flex-1 text-right">
                        <h2 data-toc id="normal-distribution-controls" className="text-lg sm:text-xl font-black text-[var(--color-text-primary)]">
                          הגדרות ופרמטרי ההתפלגות
                        </h2>
                      </div>
                      <div className="flex w-full flex-col gap-3 sm:max-w-[28rem] sm:flex-row sm:items-center">
                        <button
                          type="button"
                          onClick={resetNormalCalculator}
                          aria-label="איפוס ערכים"
                          title="איפוס ערכים"
                          className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 text-sm font-black text-[var(--color-text-primary)] transition hover:border-[rgba(36,209,199,0.5)] hover:bg-[var(--color-surface)]"
                        >
                          <RefreshCw size={15} />
                          <span>איפוס ערכים</span>
                        </button>
                        <CalculatorModeSwitch
                          value={calculatorMode}
                          onChange={handleCalculatorModeChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-start">
                      <div className="flex flex-col gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                        <CalculationVariantPicker
                          value={mode === 'forward' ? forwardType : inverseType}
                          onChange={(nextValue) => mode === 'forward' ? setForwardType(nextValue) : setInverseType(nextValue)}
                          options={mode === 'forward' ? FORWARD_VARIANT_OPTIONS : INVERSE_VARIANT_OPTIONS}
                        />
                      </div>

                      <div className="overflow-visible rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition-all" dir="rtl">
                        <table className="w-full border-collapse border-spacing-0">
                          <thead>
                            <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                              <th className="relative overflow-hidden p-3.5 font-black text-xs sm:text-sm text-[var(--color-text-primary)] w-1/2 border-l border-[var(--color-border)]">
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-12 opacity-10 pointer-events-none select-none text-4xl sm:text-5xl font-mono text-[var(--color-accent-cobalt)]">
                                  <InlineMath math="N" />
                                </div>
                                <div className="relative z-10 flex items-center justify-center gap-1.5">
                                  <span>פרמטרי ההתפלגות</span>
                                </div>
                              </th>
                              <th className="relative overflow-hidden p-3.5 text-center font-black text-xs sm:text-sm text-[var(--color-text-primary)] w-1/2">
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-12 opacity-10 pointer-events-none select-none text-4xl sm:text-5xl font-mono text-[var(--color-accent-brass)]">
                                  <InlineMath math={mode === 'forward' ? 'X' : 'p'} />
                                </div>
                                <div className="relative z-10">
                                  {mode === 'forward' ? 'אירוע / תחום' : 'יעד אחוזון'}
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-[var(--color-border)]">
                              <ParameterInputCell
                                watermark="\mu"
                                colorClass="text-[var(--color-accent-cobalt)]"
                                label={<><span>תוחלת (</span><InlineMath math="\mu" /><span>):</span></>}
                                tooltip="תוחלת ההתפלגות הנורמלית שממנה מתחילים את כל החישובים"
                                value={meanInput}
                                onChange={handleMeanChange}
                                error={errors.mean}
                              />
                              <ParameterInputCell
                                watermark={mode === 'forward' ? 'X_1' : 'p'}
                                colorClass="text-[var(--color-accent-brass)]"
                                label={mode === 'forward'
                                  ? <><span>{forwardType === 'conditional' ? 'ערך מאורע a₁' : forwardType === 'between' || forwardType === 'outside' ? 'גבול תחתון' : 'ערך חיתוך'} (</span><InlineMath math="X_1" /><span>):</span></>
                                  : <><span>הסתברות יעד (</span><InlineMath math="p" /><span>):</span></>}
                                tooltip={mode === 'forward'
                                  ? 'הערך המרכזי שמגדיר את נקודת החיתוך או את תחילת התחום המבוקש'
                                  : 'השטח המצטבר המבוקש שעל פיו יימצא ערך X או טווח הערכים המתאים'}
                                value={mode === 'forward' ? x1Input : inverseProbInput}
                                onChange={mode === 'forward' ? handleX1Change : handleInverseProbChange}
                                error={mode === 'forward' ? errors.x1 : errors.inverseProb}
                                placeholder={mode === 'inverse' ? '0.95' : ''}
                              />
                            </tr>
                            <tr>
                              <ParameterInputCell
                                watermark="\sigma"
                                colorClass="text-[var(--color-accent-cobalt)]"
                                label={<><span>סטיית תקן (</span><InlineMath math="\sigma" /><span>):</span></>}
                                tooltip="סטיית התקן של ההתפלגות הנורמלית, שקובעת את רוחב עקומת הפעמון"
                                value={stdDevInput}
                                onChange={handleStdDevChange}
                                error={errors.stdDev}
                              />
                              <ParameterInputCell
                                watermark={hasSecondaryBoundInput ? 'X_2' : mode === 'forward' ? 'Z_1' : 'X'}
                                colorClass="text-[var(--color-accent-brass)]"
                                label={hasSecondaryBoundInput
                                  ? <><span>{secondaryInputLabel.replace(':', '')} (</span><InlineMath math="X_2" /><span>):</span></>
                                  : mode === 'forward'
                                    ? <><span>ציון תקן נגזר (</span><InlineMath math="Z_1" /><span>):</span></>
                                    : <><span>ערך יעד נוכחי (</span><InlineMath math="X" /><span>):</span></>}
                                tooltip={hasSecondaryBoundInput
                                  ? 'כאשר יש שני גבולות, כאן מזינים או מציגים את הגבול השני של התחום'
                                  : mode === 'forward'
                                    ? 'במצבים חד-גבוליים מוצג כאן ציון התקן הנגזר מהקלט הנוכחי'
                                    : 'במצבי אחוזון חד-גבוליים זהו ערך X המחושב עבור ההסתברות שנבחרה'}
                                value={hasSecondaryBoundInput ? secondaryInputValue : mode === 'forward' ? (isValid ? ((x1 - mean) / stdDev).toFixed(2) : '') : (calculation?.calculatedX?.toFixed(2) ?? '')}
                                onChange={hasSecondaryBoundInput && mode === 'forward' ? handleX2Change : undefined}
                                error={hasSecondaryBoundInput && mode === 'forward' ? errors.x2 : undefined}
                                readOnly={!(hasSecondaryBoundInput && mode === 'forward')}
                                statusText={hasSecondaryBoundInput && mode === 'inverse' ? 'מחושב אוטומטית' : !hasSecondaryBoundInput ? 'מחושב אוטומטית' : undefined}
                              />
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <AnimatePresence>
                      {mode === 'forward' && forwardType === 'conditional' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="rounded-lg border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] border-[var(--color-accent-cobalt)]/45 bg-[linear-gradient(140deg,rgba(92,92,255,0.14),rgba(92,92,255,0.05))] shadow-[0_0_0_1px_var(--color-accent-cobalt)]">
                        <div className="mb-4 flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-3">
                          <div className="text-right">
                            <h3 className="text-body-base font-black text-[var(--color-accent-cobalt)]">
                              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                                <span>הסתברות מותנית</span>
                                <InlineMathToken math="P(A \mid B)" />
                              </span>
                            </h3>
                            <p className="max-w-2xl text-body-sm leading-relaxed text-[var(--color-text-secondary)]">
                              פותרים בסדר קבוע: מגדירים קודם את עולם התנאי <InlineMathToken math="B" className="mx-1" />, אחר כך את המאורע המבוקש <InlineMathToken math="A" className="mx-1" />, ואז מחשבים <InlineMathToken math="P(A \cap B)" className="mx-1" /> ומחלקים ב־<InlineMathToken math="P(B)" className="mx-1" />.
                            </p>
                          </div>
                          <div className="h-3 w-3 rounded-full bg-[var(--color-accent-cobalt)]" />
                        </div>

                        <div className="mb-4 grid gap-2 lg:grid-cols-3">
                          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/78 p-3 text-right">
                            <p className="text-caption font-black tracking-[0.12em] text-[var(--color-accent-teal)]">STEP 1</p>
                            <p className="mt-1 text-body-sm font-black text-[var(--color-text-primary)]">מגדירים תנאי רקע</p>
                            <p className="mt-1 text-caption text-[var(--color-text-secondary)]">
                              בוחרים את <InlineMathToken math="B" className="mx-1" /> והערכים שמייצרים את עולם החישוב.
                            </p>
                          </div>
                          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/78 p-3 text-right">
                            <p className="text-caption font-black tracking-[0.12em] text-[var(--color-accent-amber)]">STEP 2</p>
                            <p className="mt-1 text-body-sm font-black text-[var(--color-text-primary)]">מגדירים את המאורע המבוקש</p>
                            <p className="mt-1 text-caption text-[var(--color-text-secondary)]">
                              בוחרים את <InlineMathToken math="A" className="mx-1" /> באותה שפה פורמלית של תחום או זנב.
                            </p>
                          </div>
                          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/78 p-3 text-right">
                            <p className="text-caption font-black tracking-[0.12em] text-[var(--color-accent-cobalt)]">STEP 3</p>
                            <p className="mt-1 text-body-sm font-black text-[var(--color-text-primary)]">מחשבים יחס</p>
                            <p className="mt-1 text-caption text-[var(--color-text-secondary)]">
                              <InlineMathToken math="P(A \mid B)=\frac{P(A\ \cap B)}{P(B)}" />
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 xl:grid-cols-2">
                          <ConditionalEventDefinitionCard
                            stepNumber="STEP 1"
                            title={<>תנאי הרקע <InlineMathToken math="B" className="mr-1 text-[var(--color-accent-teal)]" /></>}
                            description={<>בחר קודם את התחום שבתוכו עובדים. כל החישוב הסופי יתבצע רק בתוך <InlineMathToken math="B" className="mx-1 text-[var(--color-accent-teal)]" />.</>}
                            formula="B"
                            value={condType}
                            onChange={setCondType}
                            disabled={!(mode === 'forward' && forwardType === 'conditional')}
                            accentClass="border-[var(--color-accent-teal)]/60 bg-[linear-gradient(135deg,rgba(63,224,208,0.16),rgba(63,224,208,0.05))] text-[var(--color-accent-teal)]"
                            accentColor="var(--color-accent-teal)"
                            variablePrefix="b"
                            expressionToneClass="border-[var(--color-accent-teal)]/30 bg-[rgba(63,224,208,0.08)] text-[var(--color-accent-teal)]"
                            fields={
                              condType === 'between' ? (
                                <>
                                  <ConditionalValueField
                                    label={<>גבול תחתון <InlineMathToken math="b_1" className="mr-1" /></>}
                                    helper="תחילת תחום התנאי"
                                    value={condX1Input}
                                    onChange={handleCondX1Change}
                                    error={mode === 'forward' && forwardType === 'conditional' ? errors.condX1 : undefined}
                                    disabled={!(mode === 'forward' && forwardType === 'conditional')}
                                  />
                                  <ConditionalValueField
                                    label={<>גבול עליון <InlineMathToken math="b_2" className="mr-1" /></>}
                                    helper="סיום תחום התנאי"
                                    value={condX2Input}
                                    onChange={handleCondX2Change}
                                    error={mode === 'forward' && forwardType === 'conditional' ? errors.condX2 : undefined}
                                    disabled={!(mode === 'forward' && forwardType === 'conditional')}
                                  />
                                </>
                              ) : (
                                <div className="sm:col-span-2">
                                  <ConditionalValueField
                                    label={<>ערך סף <InlineMathToken math="b_1" className="mr-1" /></>}
                                    helper={condType === 'below' ? 'כל מה שמתחת לסף הזה ייחשב חלק מ־B' : 'כל מה שמעל הסף הזה ייחשב חלק מ־B'}
                                    value={condX1Input}
                                    onChange={handleCondX1Change}
                                    error={mode === 'forward' && forwardType === 'conditional' ? errors.condX1 : undefined}
                                    disabled={!(mode === 'forward' && forwardType === 'conditional')}
                                  />
                                </div>
                              )
                            }
                          />

                          <ConditionalEventDefinitionCard
                            stepNumber="STEP 2"
                            title={<>המאורע המבוקש <InlineMathToken math="A" className="mr-1 text-[var(--color-accent-amber)]" /></>}
                            description={<>הגדר את <InlineMathToken math="A" className="mx-1 text-[var(--color-accent-amber)]" /> בצורה פורמלית. אחר כך המערכת תמצא אוטומטית את החיתוך <InlineMathToken math="A \cap B" className="mx-1 text-[var(--color-accent-cobalt)]" />.</>}
                            formula="A"
                            value={condTypeA}
                            onChange={setCondTypeA}
                            disabled={!(mode === 'forward' && forwardType === 'conditional')}
                            accentClass="border-[var(--color-accent-amber)]/60 bg-[linear-gradient(135deg,rgba(255,191,0,0.16),rgba(255,191,0,0.05))] text-[var(--color-accent-amber)]"
                            accentColor="var(--color-accent-amber)"
                            variablePrefix="a"
                            expressionToneClass="border-[var(--color-accent-amber)]/30 bg-[rgba(255,191,0,0.08)] text-[var(--color-accent-amber)]"
                            fields={
                              condTypeA === 'between' ? (
                                <>
                                  <ConditionalValueField
                                    label={<>גבול תחתון <InlineMathToken math="a_1" className="mr-1" /></>}
                                    helper="תחילת המאורע המבוקש"
                                    value={x1Input}
                                    onChange={handleX1Change}
                                    error={mode === 'forward' && forwardType === 'conditional' ? errors.x1 : undefined}
                                    disabled={!(mode === 'forward' && forwardType === 'conditional')}
                                  />
                                  <ConditionalValueField
                                    label={<>גבול עליון <InlineMathToken math="a_2" className="mr-1" /></>}
                                    helper="סיום המאורע המבוקש"
                                    value={x2Input}
                                    onChange={handleX2Change}
                                    error={mode === 'forward' && forwardType === 'conditional' ? errors.x2 : undefined}
                                    disabled={!(mode === 'forward' && forwardType === 'conditional')}
                                  />
                                </>
                              ) : (
                                <div className="sm:col-span-2">
                                  <ConditionalValueField
                                    label={<>ערך סף <InlineMathToken math="a_1" className="mr-1" /></>}
                                    helper={condTypeA === 'below' ? 'A הוא כל מה שנמצא מתחת לסף הזה' : 'A הוא כל מה שנמצא מעל הסף הזה'}
                                    value={x1Input}
                                    onChange={handleX1Change}
                                    error={mode === 'forward' && forwardType === 'conditional' ? errors.x1 : undefined}
                                    disabled={!(mode === 'forward' && forwardType === 'conditional')}
                                  />
                                </div>
                              )
                            }
                          />
                        </div>

                        <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)]/55 p-3 text-right">
                          <div className="grid gap-2 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                            <div>
                              <p className="text-caption font-bold text-[var(--color-text-secondary)]">תנאי רקע</p>
                              <p className="mt-1 text-body-sm font-black text-[var(--color-accent-teal)]">
                                <InlineMathToken math={`B = \\left\\{${getConditionalEventMath(condType, 'b')}\\right\\}`} />
                              </p>
                            </div>
                            <div className="rounded-full border border-[var(--color-border)] px-3 py-1 text-sm font-black text-[var(--color-accent-cobalt)]">
                              <InlineMathToken math="A \cap B" />
                            </div>
                            <div>
                              <p className="text-caption font-bold text-[var(--color-text-secondary)]">מאורע מבוקש</p>
                              <p className="mt-1 text-body-sm font-black text-[var(--color-accent-amber)]">
                                <InlineMathToken math={`A = \\left\\{${getConditionalEventMath(condTypeA, 'a')}\\right\\}`} />
                              </p>
                            </div>
                          </div>
                          <p className="mt-3 text-caption leading-relaxed text-[var(--color-text-secondary)]">
                            הקריאה הרשמית היא: קודם <InlineMathToken math="P(B)" className="mx-1 text-[var(--color-accent-teal)]" />, אחר כך <InlineMathToken math="P(A \cap B)" className="mx-1 text-[var(--color-accent-cobalt)]" />, ולבסוף היחס ביניהן.
                          </p>
                        </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CalculatorSidebar>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:[direction:ltr]">
                  <div dir="rtl">
                    <ChartWrapper
                      className="curve-glow"
                      height={380}
                      isEmpty={!isValid}
                      emptyState={(
                        <EmptyState
                          icon={<AlertCircle className="h-8 w-8" />}
                          tone="error"
                          title="אין גרף להצגה"
                          message="הזן פרמטרים תקינים כדי לצייר מחדש את עקומת הפעמון של גאוס."
                        />
                      )}
                    >
                      <NormalChart
                        mean={mean}
                        stdDev={stdDev}
                        type={mode === 'forward' ? forwardType : inverseType}
                        x1={chartX1}
                        x2={chartX2}
                        condType={condType}
                        condTypeA={condTypeA}
                        condX1={condX1}
                        condX2={condX2}
                        mode={mode}
                      />
                    </ChartWrapper>
                  </div>

                  <div dir="rtl" className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6 text-right shadow-md">
                    <SectionHeader
                      title="דרך נוסחתית ואופן פתרון הדרגתי"
                      description="אותו מסלול הסבר אקדמי, עם דגש על סדר שלבים, נוסחאות ותוצאה סופית ברורה."
                      level="section"
                      accent="brass"
                      withAccentBar={false}
                      className="items-start mb-4 text-right"
                    />

                    <div className="border-t border-[var(--color-border)] pt-4">
                      {isValid && calculation ? (
                        <div className="space-y-4">
                          {calculation.steps.map((st, sIdx) => (
                            <FormattedStep key={sIdx} text={st} />
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          tone="muted"
                          icon={<Info className="h-6 w-6" />}
                          title="אין מסלול חישוב"
                          message="לא ניתן להציג דרך פתרון עקב שגיאות או ערכי קלט חסרים."
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </>
  );
}
