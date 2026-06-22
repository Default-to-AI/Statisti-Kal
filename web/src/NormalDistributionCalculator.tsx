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
  TrendingUp
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
import SiteFooter from './components/SiteFooter';
import SiteHeader, { type SitePage } from './components/SiteHeader';
import { PageLayout } from './components/ui';

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

// --- Components ---

const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible]);

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(true);
  };

  const hideTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {createPortal(
        <AnimatePresence>
          {isVisible && (
            <div
              className="pointer-events-none fixed z-[9999]"
              style={{ top: position.top, left: position.left, transform: 'translate(-50%, -100%)' }}
            >
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="w-52 p-2.5 text-xs rounded-sm shadow-sm text-center leading-normal font-medium bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)]"
              >
                {content}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[var(--color-surface)]" />
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

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
  probability: number;
  mode?: CalcMode;
}> = ({ mean, stdDev, type, x1, x2, condType, condTypeA, condX1, condX2, probability, mode }) => {

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
  const boundaryLineColor = 'var(--color-accent-crimson)';
  const mainGridColor = 'var(--chart-grid)';
  const axisLabelColor = 'var(--chart-axis-label)';
  const shadedColor = 'var(--color-accent-cobalt)';
  const bShadedColor = 'var(--color-accent-teal)';
  const intersectShadedColor = 'var(--color-accent-cobalt)';

  const minStandardX = Math.min(x1, x2);
  const maxStandardX = Math.max(x1, x2);

  // Customized tooltip
  const CustomTooltipInner = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPt = payload[0].payload;
      const zVal = (dataPt.x - mean) / stdDev;
      return (
        <div className="p-3 border rounded-sm shadow-sm text-xs font-sans text-right space-y-1 backdrop-blur-md bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)]">
          <p className="font-bold text-sm text-[var(--color-accent-brass)]">נקודה על העקומה</p>
          <p className="flex justify-between gap-4"><span>ערך X:</span> <span className="font-mono font-bold">{dataPt.x.toFixed(2)}</span></p>
          <p className="flex justify-between gap-4"><span>ציון תקן Z:</span> <span className="font-mono font-bold">{zVal.toFixed(2)}</span></p>
          <p className="flex justify-between gap-4"><span>צפיפות PDF:</span> <span className="font-mono font-bold">{dataPt.pdf.toFixed(4)}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full rounded-lg p-5 border transition-colors bg-[var(--color-surface)] border-[var(--color-border)] shadow-md curve-glow">
      <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-4 border-[var(--color-border)]">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-black" dir="ltr">
          <span className="flex items-center gap-1.5 text-[var(--color-accent-cobalt)] select-none">
            <span className="w-3 h-3 rounded-none bg-[var(--color-accent-cobalt)]/40 border border-[var(--color-accent-cobalt)] inline-block" />
            Z
          </span>
          <span className="flex items-center gap-1.5 text-[var(--color-accent-brass)] select-none">
            <span className="w-0.5 h-3 bg-[var(--color-accent-brass)] inline-block" />
            μ
          </span>
          {type === 'conditional' && (
            <span className="flex items-center gap-1.5 text-[var(--color-accent-teal)] select-none">
              <span className="w-3 h-3 rounded-none bg-[var(--color-accent-teal)]/30 border border-[var(--color-accent-teal)] inline-block" />
              B
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-[var(--color-text-primary)]">
          {type === 'conditional' ? 'גרף התפלגות מותנית P(A|B)' : 'עקומת פעמון ושטחים מחושבים'}
        </h3>
        <span className="px-3 py-1 rounded-full text-xs font-black tracking-wide shrink-0 bg-[var(--color-accent-brass)] text-[var(--color-background)]">
          {type === 'conditional' ? `P(A|B) = ${probability.toFixed(4)}` : `שטח מחושב: ${(probability * 100).toFixed(2)}%`}
        </span>
      </div>

      <div className="h-[350px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 25 }}>
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
              domain={[mean - 4.2 * stdDev, mean + 4.2 * stdDev]}
              tick={{ fill: axisLabelColor, fontSize: 15, fontWeight: 'bold' }}
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

            {/* Reference Line for Mean */}
            <ReferenceLine
              x={mean}
              stroke={curveColor}
              strokeWidth={1.5}
              strokeDasharray="10 4"
              label={{
                value: `μ: ${mean.toFixed(2)}`,
                position: 'top',
                fill: curveColor,
                fontSize: 14,
                fontWeight: 'bold'
              }}
            />

            {/* Reference Lines for Inputs */}
            {type === 'conditional' ? (
              <>
                {condX1 !== undefined && (condType === 'below' || condType === 'above' || condType === 'between') && (
                  <ReferenceLine
                    x={condX1}
                    stroke={secondaryCurveColor}
                    strokeWidth={1.5}
                    strokeDasharray="10 4"
                    label={{
                      value: condType === 'between' ? 'B: x1' : 'B',
                      position: 'top',
                      fill: secondaryCurveColor,
                      fontSize: 13,
                      fontWeight: 'bold'
                    }}
                  />
                )}
                {condX2 !== undefined && condType === 'between' && (
                  <ReferenceLine
                    x={condX2}
                    stroke={secondaryCurveColor}
                    strokeWidth={1.5}
                    strokeDasharray="10 4"
                    label={{
                      value: 'B: x2',
                      position: 'top',
                      fill: secondaryCurveColor,
                      fontSize: 13,
                      fontWeight: 'bold'
                    }}
                  />
                )}
                {(condTypeA === 'below' || condTypeA === 'above' || condTypeA === 'between') && (
                  <ReferenceLine
                    x={x1}
                    stroke={boundaryLineColor}
                    strokeWidth={2.5}
                    label={{
                      value: condTypeA === 'between' ? 'A: x1' : 'A',
                      position: 'top',
                      fill: boundaryLineColor,
                      fontSize: 13,
                      fontWeight: 'bold'
                    }}
                  />
                )}
                {condTypeA === 'between' && (
                  <ReferenceLine
                    x={x2}
                    stroke={boundaryLineColor}
                    strokeWidth={2.5}
                    label={{
                      value: 'A: x2',
                      position: 'top',
                      fill: boundaryLineColor,
                      fontSize: 13,
                      fontWeight: 'bold'
                    }}
                  />
                )}
              </>
            ) : mode === 'inverse' ? (
              <ReferenceLine
                x={x1}
                stroke={zLineColor}
                strokeWidth={2.5}
                label={{
                  value: `Zx: ${x1.toFixed(2)}`,
                  position: 'top',
                  fill: zLineColor,
                  fontSize: 14,
                  fontWeight: 'bold'
                }}
              />
            ) : (
              <>
                <ReferenceLine
                  x={x1}
                  stroke={zLineColor}
                  strokeWidth={2.5}
                  label={{
                    value: type === 'between' || type === 'outside' ? 'X₁' : 'X',
                    position: 'top',
                    fill: zLineColor,
                    fontSize: 14,
                    fontWeight: 'bold'
                  }}
                />
                {(type === 'between' || type === 'outside') && (
                  <ReferenceLine
                    x={x2}
                    stroke={secondaryCurveColor}
                    strokeWidth={2.5}
                    label={{
                      value: 'X₂',
                      position: 'top',
                      fill: secondaryCurveColor,
                      fontSize: 14,
                      fontWeight: 'bold'
                    }}
                  />
                )}
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const FormattedStep: React.FC<{ text: string }> = ({ text }) => {
  const isResult = text.startsWith('תוצאה סופית:');
  const parts = text.split(/\[MATH\](.*?)\[\/MATH\]/g);

  return (
    <div className={`text-sm md:text-base leading-relaxed w-full transition-all p-4 sm:p-5 rounded-lg border shadow-sm ${isResult
        ? 'font-bold text-[var(--color-accent-brass)] bg-[var(--color-surface)] border-[var(--color-accent-cobalt-line)]'
        : 'text-[var(--color-text-primary)] bg-[var(--color-surface-raised)] border-[var(--color-border)]'
      }`}>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const isOnlyMath = parts.length === 3 && parts[0] === "" && parts[2] === "";
          const hasFraction = part.includes('\\frac');
          const hasPercentage = part.includes('%') || part.includes('\\%');
          const hasEquals = part.includes('=');
          const shouldBeBlockPoint = (hasFraction || (isOnlyMath && hasEquals)) && !hasPercentage;

          if (shouldBeBlockPoint) {
            return (
              <div
                key={i}
                className="my-3 text-center py-3 px-2 rounded-lg border shadow-sm overflow-x-auto bg-[var(--color-surface-raised)] border-[var(--color-border)]"
                dir="ltr"
              >
                <BlockMath math={part} />
              </div>
            );
          }
          return <span key={i} dir="ltr" className="inline-block mx-1 font-bold whitespace-nowrap"><InlineMath math={part} /></span>;
        }
        if (!part && parts.length > 1) return null;
        return <span key={i} className="align-middle font-sans font-medium">{part}</span>;
      })}
    </div>
  );
};
const ZTable: React.FC<{ activeZ?: number | null; showSearch?: boolean }> = ({ activeZ = null, showSearch = false }) => {
  const [searchType, setSearchType] = useLocalStorageState<'z' | 'phi'>('ND_searchType', 'z');
  const [searchVal, setSearchVal] = useLocalStorageState<string>('ND_searchVal', activeZ?.toFixed(2) || '');
  const [phiSearchVal, setPhiSearchVal] = useLocalStorageState<string>('ND_phiSearchVal', '');
  const [isZGuideOpen, setIsZGuideOpen] = useState<boolean>(false);
  const [isTGuideOpen, setIsTGuideOpen] = useState<boolean>(false);

  // Accordion states
  const [isZTableOpen, setIsZTableOpen] = useState<boolean>(false);
  const [isPopularOpen, setIsPopularOpen] = useState<boolean>(false);
  const [isTTableOpen, setIsTTableOpen] = useState<boolean>(false);

  // Student's T-distribution states
  const [tDf, setTDf] = useLocalStorageState<number>('ND_tDf', 10);
  const [tAlpha, setTAlpha] = useLocalStorageState<number>('ND_tAlpha', 0.05);
  const [tSide, setTSide] = useLocalStorageState<'two' | 'one'>('ND_tSide', 'two');

  useEffect(() => {
    if (activeZ !== null) {
      setSearchVal(activeZ.toFixed(2));
      setSearchType('z');
    }
  }, [activeZ]);

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
    if (tDf <= 0 || isNaN(tDf)) return null;
    const targetP = tSide === 'two' ? 1 - (tAlpha / 2) : 1 - tAlpha;
    if (targetP <= 0 || targetP >= 1 || isNaN(targetP)) return null;
    return studentTInverseCDF(targetP, tDf);
  }, [tDf, tAlpha, tSide]);

  const renderTableSection = (tableRows: number[]) => (
    <div ref={containerRef} dir="ltr" className="overflow-auto rounded-lg border border-[var(--color-border)] max-h-[480px]">
      <table className="w-full text-xs sm:text-sm border-collapse">
        <thead className="sticky top-0 z-30 shadow-sm">
          <tr className="bg-[var(--color-surface)]">
            <th className="sticky left-0 p-2.5 border border-[var(--color-border)] text-[var(--color-accent-brass)] font-extrabold text-center text-sm w-14 bg-[var(--color-surface)] z-40">Z</th>
            {cols.map(c => {
              const isColActive = lookupZ !== null && Math.abs(c - colVal!) < 0.001;
              return (
                <th
                  key={c}
                  className={`p-2.5 border border-[var(--color-border)] transition-colors duration-300 font-extrabold text-center min-w-[58px] ${isColActive
                      ? 'bg-[var(--color-accent-cobalt-strong)] text-white'
                      : 'text-[var(--color-text-secondary)] bg-[var(--color-surface)]'
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
                    : 'text-[var(--color-text-primary)] bg-[var(--color-surface)]'
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
                      className={`p-2.5 border border-[var(--color-border)] text-center transition-all duration-300 tabular-nums ${isActive
                          ? 'bg-[var(--color-accent-cobalt-bg-hover)] text-white bg-[var(--color-accent-cobalt-bg)]0 font-extrabold scale-102 shadow-sm z-10 relative rounded-lg'
                          : isRowActive
                            ? 'bg-[var(--color-accent-cobalt-bg)]/40 text-[var(--color-accent-cobalt)] bg-[var(--color-accent-cobalt-strong)]/20 text-[var(--color-accent-brass)] font-semibold'
                            : isColActive
                              ? 'bg-[var(--color-accent-cobalt-bg)]/40 text-[var(--color-accent-cobalt)] bg-[var(--color-accent-cobalt-strong)]/20 text-[var(--color-accent-cobalt)] font-semibold'
                              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] font-medium'
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
          <tr className="bg-[var(--color-surface)] text-[var(--color-text-secondary)]">
            <th rowSpan={2} className="sticky right-0 p-3 border border-[var(--color-border)] text-[var(--color-accent-cobalt)] font-black text-center text-xs sm:text-sm w-16 bg-[var(--color-surface)] z-40">
              דרגות חופש <br /> (df)
            </th>
            <th colSpan={6} className="p-1.5 border-b border-[var(--color-border)] font-extrabold text-center text-xs bg-[var(--color-surface)]">
              רמת מובהקות עבור התפלגות T
            </th>
          </tr>
          <tr className="bg-[var(--color-surface)] text-[var(--color-text-secondary)]">
            {tCols.map((c, idx) => {
              const isActiveCol = (tSide === 'two' && Math.abs(tAlpha - c.twoTail) < 0.0001);
              return (
                <th
                  key={idx}
                  className={`p-2.5 border border-[var(--color-border)] font-bold text-center transition-colors min-w-[70px] ${isActiveCol
                      ? 'bg-[var(--color-accent-cobalt-strong)] text-white'
                      : 'bg-[var(--color-surface)]'
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
        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">טבלאות התפלגות סטטיסטיות</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-sans">איתור ערכים קריטיים וחיפוש מדויק בהתפלגות נורמלית ובהתפלגות t של Student</p>
      </div>

      {/* Z-Table Accordion */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <button 
          onClick={() => setIsZTableOpen(!isZTableOpen)}
          className="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] transition-colors border-b border-[var(--color-border)]"
        >
          <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <span className="text-[var(--color-accent-cobalt)]">1.</span>
            טבלת התפלגות נורמלית סטנדרטית (Z)
            <InlineMath math="\Phi(Z)" />
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
                  <p>● <strong>השורה הראשונה (Z):</strong> מציגה את ערך ה-Z בדיוק של ספרה אחת לאחר הנקודה (למשל: 1.2).</p>
                  <p>● <strong>העמודות (0.00 עד 0.09):</strong> מציגות את מאיות ציון התקן (למשל: עמודה 0.06 משלימה ל-1.26).</p>
                  <p>● <strong>התא שבמפגש:</strong> מייצג את ההסתברות המצטברת P(Z ≤ z), השטח המעוגל משמאל לנקודת הציון.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 bg-[var(--color-surface-raised)] p-4 rounded-lg border border-[var(--color-border)]">
              <div className="flex flex-col bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]/50 p-1 shadow-sm w-full md:w-auto shrink-0">
                <button
                  onClick={() => setSearchType('z')}
                  className={`px-4 py-2 rounded-sm text-xs font-bold transition-all flex items-center justify-center gap-1 ${searchType === 'z' ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                >
                  חיפוש לפי ציון תקן <InlineMath math="Z" />
                </button>
                <button
                  onClick={() => setSearchType('phi')}
                  className={`px-4 py-2 rounded-sm text-xs font-bold transition-all flex items-center justify-center gap-1 ${searchType === 'phi' ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                >
                  חיפוש לפי הסתברות <InlineMath math="\Phi" />
                </button>
              </div>

              <div className="w-full flex-1 max-w-[220px] flex flex-col items-center">
                <label className="block text-xs font-black text-[var(--color-text-primary)] mb-2 font-sans text-center flex items-center gap-1">
                  {searchType === 'z' ? <>ציון תקן <InlineMath math="Z" /> לאיתור:</> : <>הסתברות מצטברת <InlineMath math="\Phi(Z)" />:</>}
                </label>
                <input
                  type="text"
                  value={searchType === 'z' ? searchVal : phiSearchVal}
                  onChange={e => searchType === 'z' ? setSearchVal(e.target.value) : setPhiSearchVal(e.target.value)}
                  placeholder={searchType === 'z' ? 'לדוגמה: 1.96' : 'לדוגמה: 0.95'}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm px-3 py-3 text-sm text-[var(--color-text-primary)] font-mono focus:border-[var(--color-accent-cobalt-line)] focus:outline-none transition-colors text-center"
                  dir="ltr"
                />
              </div>

              <div className="w-full flex-1 flex items-center justify-center min-h-[50px]">
                {actualZ !== null ? (
                  <div className="w-full font-bold text-[var(--color-accent-cobalt)] text-center bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-sm shadow-sm flex items-center justify-center">
                    <span dir="ltr">
                      {searchType === 'z'
                        ? <InlineMath math={`\\Phi(${actualZ.toFixed(2)}) = \\int_{-\\infty}^{${actualZ.toFixed(2)}} f_Z dz = ${normalCDF(actualZ, 0, 1).toFixed(4)}`} />
                        : <InlineMath math={`Z = \\Phi^{-1}(${parseFloat(phiSearchVal).toFixed(4)}) \\approx ${actualZ.toFixed(2)}`} />
                      }
                    </span>
                  </div>
                ) : (
                  <div className="h-[46px]" />
                )}
              </div>
            </div>

            <div className="w-full flex flex-col items-center justify-center min-h-[40px]">
              {actualZ !== null && (
                <div className="text-center text-xs sm:text-sm text-[var(--color-text-primary)] leading-normal font-medium bg-[var(--color-surface-raised)] p-3 rounded-lg border border-[var(--color-border)]/50 w-full">
                  {searchType === 'z' ? (
                    <>
                      עבור ציון תקן <span dir="ltr"><InlineMath math={`Z = ${actualZ.toFixed(2)}`} /></span>:<br />
                      השטח המצטבר <span dir="ltr"><InlineMath math={`\\Phi(Z) = ${normalCDF(actualZ, 0, 1).toFixed(4)}`} /></span> (<span className="font-mono text-[var(--color-accent-cobalt)] font-bold"><InlineMath math={`${(normalCDF(actualZ, 0, 1) * 100).toFixed(2)}\\%`} /></span>).
                    </>
                  ) : (
                    <>
                      ההסתברות היא <span className="font-mono text-[var(--color-accent-cobalt)] font-bold"><InlineMath math={`${(parseFloat(phiSearchVal) * 100).toFixed(1)}\\%`} /></span>:<br />
                      ציון תקן <span dir="ltr"><InlineMath math={`Z \\approx ${actualZ.toFixed(2)}`} /></span>.
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {renderTableSection(rows)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Popular Z-Scores Accordion */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <button 
          onClick={() => setIsPopularOpen(!isPopularOpen)}
          className="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] transition-colors border-b border-[var(--color-border)]"
        >
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-[var(--color-accent-cobalt)]" />
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">ערכים וציוני תקן פופולריים למבחני השערות</h3>
          </div>
          {isPopularOpen ? <ChevronUp size={20} className="text-[var(--color-text-secondary)]" /> : <ChevronDown size={20} className="text-[var(--color-text-secondary)]" />}
        </button>

        <AnimatePresence>
          {isPopularOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-5 bg-[var(--color-surface)] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-body-xs text-[var(--color-text-secondary)]">מודגש אוטומטית בהתאם לקלט פעיל. לחצו למילוי מהיר:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {[
                { confidence: "90%", alpha: 0.10, tail: "one", phi: 0.9000, z: 1.282, label: "חד-צדדי (α=0.10)" },
                { confidence: "90%", alpha: 0.10, tail: "two", phi: 0.9500, z: 1.645, label: "דו-צדדי (α=0.10)" },
                { confidence: "95%", alpha: 0.05, tail: "one", phi: 0.9500, z: 1.645, label: "חד-צדדי (α=0.05)" },
                { confidence: "95%", alpha: 0.05, tail: "two", phi: 0.9750, z: 1.960, label: "דו-צדדי (α=0.05)" },
                { confidence: "99%", alpha: 0.01, tail: "one", phi: 0.9900, z: 2.326, label: "חד-צדדי (α=0.01)" },
                { confidence: "99%", alpha: 0.01, tail: "two", phi: 0.9950, z: 2.576, label: "דו-צדדי (α=0.01)" },
              ].map((item, idx) => {
                const isMatched = actualZ !== null && (
                  Math.abs(Math.abs(actualZ) - item.z) < 0.05 ||
                  (searchType === 'phi' && phiSearchVal && Math.abs(parseFloat(phiSearchVal) - item.phi) < 0.01)
                );

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchType('z');
                      setSearchVal(item.z.toFixed(3));
                    }}
                    className={`p-2.5 rounded-sm border text-center transition-all duration-300 relative overflow-hidden select-none cursor-pointer flex flex-col justify-between h-24 ${isMatched
                        ? 'bg-[var(--color-accent-cobalt-bg-hover)]/20 border-[var(--color-border)] shadow-[0_0_15px_rgba(99,102,241,0.25)] ring-1 ring-[var(--color-accent-cobalt-line)]0'
                        : 'bg-[var(--color-surface-raised)] border-[var(--color-border)] hover:bg-[var(--color-surface)]'
                      }`}
                  >
                    {isMatched && (
                      <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-l from-[var(--color-accent-cobalt)] to-[var(--color-accent-cobalt)]" />
                    )}
                    <div>
                      <div className="text-caption font-black text-[var(--color-accent-cobalt)]/90 leading-tight">{item.label}</div>
                      <div className="text-body-sm font-black text-[var(--color-text-primary)] mt-1">רמת ביטחון {item.confidence}</div>
                    </div>
                    <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-[var(--color-border)]">
                      <span className="text-caption text-[var(--color-text-secondary)] font-mono">Z_crit:</span>
                      <span className="text-xs font-black font-mono text-[var(--color-accent-cobalt)]">{item.z.toFixed(3)}</span>
                      <span className="text-caption text-[var(--color-text-secondary)] font-mono">Φ: {item.phi.toFixed(4)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* T-Table Accordion */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <button 
          onClick={() => setIsTTableOpen(!isTTableOpen)}
          className="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] transition-colors border-b border-[var(--color-border)]"
        >
          <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <span className="text-[var(--color-accent-cobalt)]">2.</span>
            טבלת התפלגות Student's T (ערכים קריטיים)
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
              {isTGuideOpen ? 'הסתר הסבר' : 'מדריך מקוצר להתפלגות t'}
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
                  <p>● ערכי התאים הם הערך הקריטי t_crit שעבורו השטח מימין (למבחן חד-צדדי) או משני הצדדים (לדו-צדדי) שווה לאלפא.</p>
                  <p>● עבור דרגת חופש אינסופית (∞), התפלגות t מתכנסת בדיוק להתפלגות נורמלית סטנדרטית Z.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-4 bg-[var(--color-surface-raised)] p-4 rounded-lg border border-[var(--color-border)]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-2 flex flex-col justify-end">
                <label className="block text-xs font-black text-[var(--color-text-primary)] mb-2 font-sans">דרגות חופש (df):</label>
                <input
                  type="number"
                  value={tDf}
                  onChange={e => setTDf(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm px-3 py-2 text-sm text-[var(--color-text-primary)] font-mono focus:border-[var(--color-accent-cobalt-line)] focus:outline-none transition-colors"
                />
              </div>
              <div className="md:col-span-4 lg:col-span-3 flex flex-col justify-end">
                <label className="block text-xs font-black text-[var(--color-text-primary)] mb-2 font-sans">סוג המבחן:</label>
                <div className="flex bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]/50 p-1 shadow-sm w-full">
                  <button
                    onClick={() => setTSide('two')}
                    className={`flex-1 py-1.5 rounded-sm text-xs font-bold transition-all ${tSide === 'two' ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                  >דו-צדדי</button>
                  <button
                    onClick={() => setTSide('one')}
                    className={`flex-1 py-1.5 rounded-sm text-xs font-bold transition-all ${tSide === 'one' ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                  >חד-צדדי</button>
                </div>
              </div>
              <div className="md:col-span-6 lg:col-span-7 flex flex-col justify-end">
                <label className="block text-xs font-black text-[var(--color-text-primary)] mb-2 font-sans">אלפא (מובהקות):</label>
                <div className="flex flex-wrap sm:flex-nowrap bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]/50 p-1 shadow-sm w-full gap-1">
                  {[0.20, 0.10, 0.05, 0.02, 0.01, 0.001].map(a => (
                    <button
                      key={a}
                      onClick={() => setTAlpha(a)}
                      className={`flex-1 min-w-[40px] py-1.5 rounded-sm text-xs font-bold font-mono transition-all ${tAlpha === a ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                    >
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
              ערך קריטי t_crit = <span className="text-[var(--color-accent-cobalt)] font-mono text-base ml-1">{computedTCritical.toFixed(4)}</span>
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
  const [mean, setMean] = useLocalStorageState<number>('ND_mean', 100);
  const [meanInput, setMeanInput] = useLocalStorageState<string>('ND_meanInput', '100');

  const [stdDev, setStdDev] = useLocalStorageState<number>('ND_stdDev', 15);
  const [stdDevInput, setStdDevInput] = useLocalStorageState<string>('ND_stdDevInput', '15');

  // Forward calculations values
  const [forwardType, setForwardType] = useLocalStorageState<CalcType>('ND_forwardType', 'below');
  const [x1, setX1] = useLocalStorageState<number>('ND_x1', 115);
  const [x1Input, setX1Input] = useLocalStorageState<string>('ND_x1Input', '115');
  const [x2, setX2] = useLocalStorageState<number>('ND_x2', 125);
  const [x2Input, setX2Input] = useLocalStorageState<string>('ND_x2Input', '125');

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
      steps.push(`שלב 1: זיהוי פרמטרי ההתפלגות. האוכלוסייה מתפלגת נורמלית עם תוחלת [MATH]\\mu = ${mean}[/MATH] וסטיית תקן [MATH]\\sigma = ${stdDev}[/MATH].`);

      if (forwardType === 'conditional') {
        // interval B elements
        let pB = 0;
        let bExpr = '';
        let bText = '';
        if (condType === 'below') {
          pB = normalCDF(condX1, mean, stdDev);
          bExpr = `X \\le ${condX1}`;
          bText = `P(X \\le ${condX1}) = \\Phi\\left(\\frac{${condX1} - ${mean}}{${stdDev}}\\right) = \\Phi(${((condX1 - mean) / stdDev).toFixed(2)}) = ${pB.toFixed(4)}`;
          steps.push(`שלב 2: חישוב הסתברות תנאי הרקע B: [MATH]P(${bExpr})[/MATH].`);
          steps.push(`[MATH]${bText}[/MATH]`);
        } else if (condType === 'above') {
          pB = 1 - normalCDF(condX1, mean, stdDev);
          bExpr = `X \\ge ${condX1}`;
          bText = `P(X \\ge ${condX1}) = 1 - \\Phi(${((condX1 - mean) / stdDev).toFixed(2)}) = ${pB.toFixed(4)}`;
          steps.push(`שלב 2: חישוב הסתברות תנאי הרקע B: [MATH]P(${bExpr})[/MATH].`);
          steps.push(`[MATH]${bText}[/MATH]`);
        } else {
          const bStart = Math.min(condX1, condX2);
          const bEnd = Math.max(condX1, condX2);
          pB = normalCDF(bEnd, mean, stdDev) - normalCDF(bStart, mean, stdDev);
          bExpr = `${bStart} \\le X \\le ${bEnd}`;
          bText = `P(${bExpr}) = \\Phi(${((bEnd - mean) / stdDev).toFixed(2)}) - \\Phi(${((bStart - mean) / stdDev).toFixed(2)}) = ${pB.toFixed(4)}`;
          steps.push(`שלב 2: חישוב הסתברות תנאי הרקע B: [MATH]P(${bExpr})[/MATH].`);
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
        steps.push(`שלב 3: הגדרת חיתוך המאורעות [MATH]A \\cap B[/MATH] כדי לחשב [MATH]P(A \\cap B)[/MATH].`);

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
        steps.push(`שלב 4: שימוש בנוסחת ההסתברות המותנית: [MATH]P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}[/MATH].`);
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

      steps.push(`שלב 2: תקינה והמרת ערכי הגבול לציוני תקן (Z-score). נוסחת ציון התקן היא [MATH]Z = \\frac{X - \\mu}{\\sigma}[/MATH].`);

      if (forwardType === 'below') {
        prob = normalCDF(x1, mean, stdDev);
        steps.push(`החלפת ערכים נותנת: [MATH]Z_1 = \\frac{${x1} - ${mean}}{${stdDev}} = ${z1.toFixed(4)}[/MATH].`);
        steps.push(`שלב 3: שימוש בפונקציית ההתפלגות המצטברת (CDF) לאיתור השטח שמשמאל ל-Z: [MATH]P(X \\le ${x1}) = P(Z \\le ${z1.toFixed(2)}) = \\Phi(${z1.toFixed(2)})[/MATH].`);
        steps.push(`תוצאה סופית: ההסבר הסטטיסטי מבוטא כשטח ההתפלגות [MATH]P(X \\le ${x1}) = ${prob.toFixed(4)}[/MATH] (או ${(prob * 100).toFixed(2)}% מהאוכלוסייה).`);
      } else if (forwardType === 'above') {
        prob = 1 - normalCDF(x1, mean, stdDev);
        steps.push(`החלפת ערכים נותנת: [MATH]Z_1 = \\frac{${x1} - ${mean}}{${stdDev}} = ${z1.toFixed(4)}[/MATH].`);
        steps.push(`שלב 3: השטח מימין ל-Z הוא המשלים לשלם: [MATH]P(X \\ge ${x1}) = P(Z \\ge ${z1.toFixed(2)}) = 1 - \\Phi(${z1.toFixed(2)})[/MATH].`);
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
        steps.push(`שלב 3: מציאת ההפרש בין השטח המצטבר של הגבול העליון לגבול התחתון: [MATH]P(${minX} \\le X \\le ${maxX}) = \\Phi(${zMax.toFixed(2)}) - \\Phi(${zMin.toFixed(2)})[/MATH].`);
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
        steps.push(`שלב 3: השטח שמחוץ לשני הגבולות (שני הזנבות במשותף) מחושב כמשלים של השטח שביניהם: [MATH]P(X \\le ${minX} \\cup X \\ge ${maxX}) = 1 - (\\Phi(${zMax.toFixed(2)}) - \\Phi(${zMin.toFixed(2)}))[/MATH].`);
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
      steps.push(`שלב 1: זיהוי פרמטרים והגדרת ההסתברות המבוקשת. ההתפלגות היא [MATH]\\mu = ${mean}, \\sigma = ${stdDev}[/MATH] והשטח המצטבר הנתון הוא [MATH]p = ${inverseProb}[/MATH] (כלומר ${(inverseProb * 100).toFixed(1)}%).`);

      let z = 0;
      let calculatedX = mean;
      steps.push(`שלב 2: מציאת ציון התקן (Z-score) התואם לשטח הנתון בהתפלגות הנורמלית הסטנדרטית באמצעות פונקציה הפוכה:`);

      if (inverseType === 'below') {
        z = inverseNormalCDF(inverseProb);
        calculatedX = mean + z * stdDev;
        steps.push(`עבור שטח מצטבר משמאל של [MATH]p = ${inverseProb}[/MATH], ציון התקן התואם הוא [MATH]Z = \\Phi^{-1}(${inverseProb}) = ${z.toFixed(4)}[/MATH].`);
        steps.push(`שלב 3: שחרור הציון היחסי חזרה לערך פיזי לא משומר ע"י הנוסחה: [MATH]X = \\mu + Z \\cdot \\sigma[/MATH].`);
        steps.push(`תוצאה סופית: ערך ה-X המתקבל הוא [MATH]X = ${mean} + (${z.toFixed(2)}) \\cdot ${stdDev} = ${calculatedX.toFixed(2)}[/MATH].`);
      } else if (inverseType === 'above') {
        z = inverseNormalCDF(1 - inverseProb);
        calculatedX = mean + z * stdDev;
        steps.push(`בגלל שמבוקש שטח מצטבר מימין (מעל) של [MATH]p = ${inverseProb}[/MATH], אנו מחפשים שטח משמאל של [MATH]1 - p = ${(1 - inverseProb).toFixed(4)}[/MATH].`);
        steps.push(`ערך ה-Z התואם הוא [MATH]Z = \\Phi^{-1}(${(1 - inverseProb).toFixed(4)}) = ${z.toFixed(4)}[/MATH].`);
        steps.push(`שלב 3: המרה חזרה לערכי X: [MATH]X = \\mu + Z \\cdot \\sigma[/MATH].`);
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
        steps.push(`שלב 3: המרה חזרה לשני ערכי ה-X המקוריים בקצוות:`);
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
        steps.push(`שלב 3: המרת ערכי ה-Z חזרה לערכי X:`);
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
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* Sidebar Inputs Form */}
              <div className="lg:col-span-4 bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-lg space-y-5 text-right relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-full h-1 bg-[var(--color-accent-cobalt-bg-hover)]" />

                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
                  <Sliders className="text-[var(--color-accent-cobalt)] w-5 h-5" />
                  הגדרות ופרמטרי ההתפלגות
                </h2>

                {/* Parameters block */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-[var(--color-text-primary)] mb-1">תוחלת המבוקשת (μ):</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={meanInput}
                        onChange={e => handleMeanChange(e.target.value)}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm px-3 py-2 text-sm text-[var(--color-text-primary)] font-mono focus:border-[var(--color-accent-cobalt-line)] focus:outline-none"
                      />
                      {errors.mean && <p className="text-[var(--color-error)] text-caption font-bold mt-1">{errors.mean}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[var(--color-text-primary)] mb-1">סטיית תקן (σ):</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={stdDevInput}
                        onChange={e => handleStdDevChange(e.target.value)}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm px-3 py-2 text-sm text-[var(--color-text-primary)] font-mono focus:border-[var(--color-accent-cobalt-line)] focus:outline-none"
                      />
                      {errors.stdDev && <p className="text-[var(--color-error)] text-caption font-bold mt-1">{errors.stdDev}</p>}
                    </div>
                  </div>
                </div>

                {/* Mode Options Block */}
                {mode === 'forward' ? (
                  <div className="space-y-4 pt-3 border-t border-[var(--color-border)]">
                    <div>
                      <label className="block text-xs font-black text-[var(--color-text-primary)] mb-1">סוג חישוב השטח:</label>
                      <select
                        value={forwardType}
                        onChange={e => setForwardType(e.target.value as any)}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm px-3 py-2 text-sm text-[var(--color-text-primary)] font-bold focus:border-[var(--color-accent-cobalt-line)] focus:outline-none"
                      >
                        <option value="below">מתחת לערך (הסתברות מצטברת משמאל)</option>
                        <option value="above">מעל לערך (הסתברות מצטברת מימין)</option>
                        <option value="between">בין שני ערכים כלואים</option>
                        <option value="outside">מחוץ לשני ערכים (בשני הזנבות)</option>
                        <option value="conditional">הסתברות מותנית P(A|B)</option>
                      </select>
                    </div>

                    {forwardType === 'conditional' ? (
                      <div className="space-y-4 bg-[var(--color-surface-raised)] p-3.5 rounded-lg border border-[var(--color-border)]">
                        <span className="text-body-sm font-black leading-relaxed block text-[var(--color-accent-cobalt)] border-b border-[var(--color-accent-cobalt-line)] pb-1.5">הגדרת מאורע B ברקע (התנאי):</span>
                        <div>
                          <label className="block text-heading-label text-[var(--color-text-secondary)] mb-1">סוג המאורע B:</label>
                          <select
                            value={condType}
                            onChange={e => setCondType(e.target.value as any)}
                            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm px-2.5 py-1.5 text-xs text-[var(--color-text-primary)]"
                          >
                            <option value="below">X ≤ b₁</option>
                            <option value="above">X ≥ b₁</option>
                            <option value="between">b₁ ≤ X ≤ b₂</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-heading-label text-[var(--color-text-secondary)] mb-1">ערך b₁:</label>
                            <input
                              type="text"
                              value={condX1Input}
                              onChange={e => handleCondX1Change(e.target.value)}
                              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] font-mono"
                            />
                            {errors.condX1 && <p className="text-[var(--color-error)] text-caption mt-0.5">{errors.condX1}</p>}
                          </div>
                          {condType === 'between' && (
                            <div>
                              <label className="block text-heading-label text-[var(--color-text-secondary)] mb-1">ערך b₂:</label>
                              <input
                                type="text"
                                value={condX2Input}
                                onChange={e => handleCondX2Change(e.target.value)}
                                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] font-mono"
                              />
                              {errors.condX2 && <p className="text-[var(--color-error)] text-caption mt-0.5">{errors.condX2}</p>}
                            </div>
                          )}
                        </div>

                        <span className="text-body-sm font-black leading-relaxed block text-[var(--color-accent-crimson)] border-b border-[var(--color-accent-cobalt-line)] pb-1.5 pt-1.5">הגדרת מאורע A (ההסתברות מתוך B):</span>
                        <div>
                          <label className="block text-heading-label text-[var(--color-text-secondary)] mb-1">סוג המאורע A:</label>
                          <select
                            value={condTypeA}
                            onChange={e => setCondTypeA(e.target.value as any)}
                            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm px-2.5 py-1.5 text-xs text-[var(--color-text-primary)]"
                          >
                            <option value="below">X ≤ a₁</option>
                            <option value="above">X ≥ a₁</option>
                            <option value="between">a₁ ≤ X ≤ a₂</option>
                          </select>
                        </div>
                      </div>
                    ) : null}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-black text-[var(--color-text-primary)] mb-1">
                          {forwardType === 'between' || forwardType === 'outside' ? 'גבול תחום תחתון (X₁):' : forwardType === 'conditional' ? 'ערך מאורע a₁:' : 'ערך נקודת החיתוך (X):'}
                        </label>
                        <input
                          type="text"
                          value={x1Input}
                          onChange={e => handleX1Change(e.target.value)}
                          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm px-3 py-2 text-sm text-[var(--color-text-primary)] font-mono focus:border-[var(--color-accent-cobalt-line)] focus:outline-none"
                        />
                        {errors.x1 && <p className="text-[var(--color-error)] text-caption font-bold mt-1">{errors.x1}</p>}
                      </div>

                      {(forwardType === 'between' || forwardType === 'outside' || (forwardType === 'conditional' && condTypeA === 'between')) && (
                        <div>
                          <label className="block text-xs font-black text-[var(--color-text-primary)] mb-1">
                            {forwardType === 'conditional' ? 'ערך מאורע a₂:' : 'גבול תחום עליון (X₂):'}
                          </label>
                          <input
                            type="text"
                            value={x2Input}
                            onChange={e => handleX2Change(e.target.value)}
                            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm px-3 py-2 text-sm text-[var(--color-text-primary)] font-mono focus:border-[var(--color-accent-cobalt-line)] focus:outline-none"
                          />
                          {errors.x2 && <p className="text-[var(--color-error)] text-caption font-bold mt-1">{errors.x2}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-3 border-t border-[var(--color-border)]">
                    <div>
                      <label className="block text-xs font-black text-[var(--color-text-primary)] mb-1">הסתברות מצטברת נתונה (p):</label>
                      <input
                        type="text"
                        value={inverseProbInput}
                        onChange={e => handleInverseProbChange(e.target.value)}
                        placeholder="לדוגמה: 0.95"
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm px-3 py-2 text-sm text-[var(--color-text-primary)] font-mono focus:border-[var(--color-accent-cobalt-line)] focus:outline-none"
                      />
                      {errors.inverseProb && <p className="text-[var(--color-error)] text-caption font-bold mt-1">{errors.inverseProb}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-black text-[var(--color-text-primary)] mb-1">סוג התאמת השטח:</label>
                      <select
                        value={inverseType}
                        onChange={e => setInverseType(e.target.value as any)}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm px-3 py-2 text-sm text-[var(--color-text-primary)] font-bold focus:border-[var(--color-accent-cobalt-line)] focus:outline-none"
                      >
                        <option value="below">שטח מצטבר משמאל (גבול עליון X)</option>
                        <option value="above">שטח מצטבר מימין (גבול תחתון X)</option>
                        <option value="between">שטח כלוא סימטרי במרכז</option>
                        <option value="outside">שטח מפוצל סימטרי בשני הזנבות</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Reset to standard preset */}
                <div className="pt-2">
                  <button
                    onClick={() => {
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
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-[var(--color-border)] rounded-sm text-xs font-black bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] hover:text-white transition select-none cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    אפס ערכים ל-IQ הסטנדרטי
                  </button>
                </div>
              </div>

              {/* Main Graph & Explanations Block */}
              <div className="lg:col-span-8 space-y-6">
                {/* Normal Curve Canvas Wrapper */}
                {isValid ? (
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
                    probability={chartProb}
                    mode={mode}
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-[var(--color-accent-crimson)] bg-[var(--color-surface)] text-[var(--color-error)] font-bold px-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8" />
                      <p className="font-extrabold text-sm sm:text-base">הזן פרמטרים תקינים כדי לצייר מחדש את עקומת הפעמון של גאוס.</p>
                    </div>
                  </div>
                )}

                {/* Step by Step calculations panel */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5 sm:p-6 text-right space-y-4">
                  <h3 className="text-sm sm:text-base font-black text-[var(--color-text-primary)] flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
                    <Info size={16} className="text-[var(--color-accent-brass)]" />
                    דרך נוסחתית ואופן פתרון הדרגתי (Academic Path)
                  </h3>

                  {isValid && calculation ? (
                    <div className="space-y-4">
                      {calculation.steps.map((st, sIdx) => (
                        <FormattedStep key={sIdx} text={st} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--color-text-primary)]0 text-sm font-bold">לא ניתן להציג דרך פתרון עקב שגיאות או ערכי קלט חסרים.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </>
  );
}
