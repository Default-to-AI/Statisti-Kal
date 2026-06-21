import { useLocalStorageState } from '../hooks/useLocalStorageState';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Joyride, Step } from 'react-joyride';
import { AnimatedDetails, FormulaTranslation } from './ui/CustomComponents';
import HypothesisTestDisplay from './HypothesisTestDisplay';
import { unifiedDecision } from '../lib/statistics/hypothesis';
import { InlineMath, BlockMath } from 'react-katex';
import {
    Info,
    Calculator,
    RefreshCw,
    TrendingUp,
    Sliders,
    Award,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    HelpCircle,
    CheckCircle,
    XCircle,
    BarChart2,
    Check,
    X,
    PenTool,
    Activity,
    Target,
    Map,
    Percent,
    BookOpen,
    Globe2,
    ExternalLink
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    ReferenceLine,
    CartesianGrid,
    Legend
} from 'recharts';

const JoyrideComponent = Joyride as any;

// --- Probability Math Helpers ---

/**
 * Standard Normal Cumulative Distribution Function (CDF)
 */
function normalCDF(x: number, mean: number, stdDev: number): number {
    if (stdDev <= 0) return 0.5;
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
 * Inverse Standard Normal Cumulative Distribution Function Z-score converter
 */
function inverseNormalCDF(p: number): number {
    if (p <= 0) return -4.5;
    if (p >= 1) return 4.5;

    const c = [2.515517, 0.802853, 0.010328];
    const d = [1.432788, 0.189269, 0.001308];

    const t = p < 0.5 ? Math.sqrt(-2.0 * Math.log(p)) : Math.sqrt(-2.0 * Math.log(1.0 - p));
    const z = t - ((c[2] * t + c[1]) * t + c[0]) / (((d[2] * t + d[1]) * t + d[0]) * t + 1.0);

    return p < 0.5 ? -z : z;
}

/**
 * Lanczos approximation for the natural logarithm of the Gamma function ln(Γ(x))
 */
function lnGamma(x: number): number {
    if (x < 0.5) {
        return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * x)) - lnGamma(1 - x);
    }
    const cof = [
        76.18009172947146, -86.50532032941677, 24.01409824083091,
        -1.231739572450155, 0.001208650973866179, -0.000005395239384953
    ];
    let y = x;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j <= 5; j++) {
        y += 1;
        ser += cof[j] / y;
    }
    return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/**
 * Student's t-distribution Probability Density Function (PDF)
 */
function studentTPDF(t: number, df: number): number {
    if (df > 250) {
        return normalPDF(t, 0, 1);
    }
    const logC = lnGamma((df + 1) / 2) - 0.5 * Math.log(df * Math.PI) - lnGamma(df / 2);
    const C = Math.exp(logC);
    return C * Math.pow(1 + (t * t) / df, -(df + 1) / 2);
}

/**
 * Student's t-distribution Cumulative Distribution Function (CDF)
 * Accurate closed form/trigonometric series representation for integer df
 */
function studentTCDF(t: number, df: number): number {
    if (df > 200) {
        return normalCDF(t, 0, 1);
    }

    const theta = Math.atan(t / Math.sqrt(df));
    const sin = Math.sin(theta);
    const cos = Math.cos(theta);

    if (df % 2 === 0) {
        // df is even
        let sum = 0;
        let term = 1;
        for (let r = 1; r <= df / 2 - 1; r++) {
            term = term * (2 * r - 1) / (2 * r) * cos * cos;
            sum += term;
        }
        return 0.5 + 0.5 * sin * (1 + sum);
    } else {
        // df is odd
        let sum = 0;
        let term = 1;
        for (let r = 1; r <= (df - 3) / 2; r++) {
            term = term * (2 * r) / (2 * r + 1) * cos * cos;
            sum += term;
        }
        const multiplier = df === 1 ? 0 : sin * cos * (1 + sum);
        return 0.5 + theta / Math.PI + multiplier / Math.PI;
    }
}

/**
 * Initial guess of Inverse Student's t CDF using Cornish-Fisher expansion
 */
function studentTPPFInitial(p: number, df: number): number {
    const z = inverseNormalCDF(p);
    if (df > 500) return z;

    const z2 = z * z;
    const z3 = z2 * z;
    const z5 = z3 * z2;
    const z7 = z5 * z2;

    const term1 = z;
    const term2 = (z3 + z) / (4 * df);
    const term3 = (5 * z5 + 16 * z3 + 3 * z) / (96 * df * df);
    const term4 = (3 * z7 + 19 * z5 + 17 * z3 - 15 * z) / (384 * df * df * df);

    return term1 + term2 + term3 + term4;
}

/**
 * Student's t Percentage Point Function (Inverse CDF)
 * Uses high precision Cornish-Fisher guess refined with Newton-Raphson
 */
function studentTPPF(p: number, df: number): number {
    if (p <= 0.00001) return -10.0;
    if (p >= 0.99999) return 10.0;

    // 1. Initial guess using Cornish-Fisher expansion
    let t = studentTPPFInitial(p, df);

    // 2. Newton-Raphson refinement (3 steps is extremely stable and converges to ~14 decimal places)
    for (let i = 0; i < 3; i++) {
        const error = studentTCDF(t, df) - p;
        const derivative = studentTPDF(t, df);
        if (derivative === 0) break;
        t = t - error / derivative;
    }
    return t;
}

// --- Types ---
type TestType = 'single' | 'mean' | 'sum';
type TailType = 'right' | 'left' | 'two-tailed';

const DEFAULT_BODY_TEMPERATURE_STUDY = {
    varianceKnown: true,
    calculatePower: true,
    mu0: 37,
    mu0Input: '37',
    mu1: 36.82,
    mu1Input: '36.82',
    muH1: 36.82,
    muH1Input: '36.82',
    sigma: 0.41,
    sigmaInput: '0.41',
    n: 148,
    nInput: '148',
    alpha: 0.05,
    alphaInput: '0.05',
    testType: 'mean' as TestType,
    tailType: 'left' as TailType,
    ciTailType: 'two-tailed' as TailType,
    ciAlpha: 0.05,
};

// No props needed - dark-only theme

// FormulaBlock: Raw/general formula with symbolic variables
function FormulaBlock({ 
    children, 
    className = '',
    formulaName,
    translation
}: { 
    children: React.ReactNode; 
    className?: string;
    formulaName?: string;
    translation?: string;
}) {
    return (
        <div className={`flex flex-row items-center w-[95%] md:w-[85%] mx-auto gap-4 sm:gap-6 py-3 my-2 ${className}`} dir="ltr">
            <div className="flex-1 overflow-x-auto scrollbar-thin rounded-lg shadow-sm relative group">
                <div className="relative border border-[var(--color-border)] border-l-4 border-dashed border-l-[var(--color-accent-brass)]/70 rounded-lg bg-[var(--color-accent-brass)]/5 px-6 py-4 text-lg sm:text-xl md:text-2xl text-center flex flex-col items-center justify-center min-h-[84px] h-auto w-full min-w-max [&_.katex-display]:!overflow-visible [&_.katex-display]:w-full [&_.katex-display]:!m-0 [&_.katex-display]:flex [&_.katex-display]:justify-center font-sans text-[var(--color-text-primary)]">
                    {formulaName && translation && (
                        <div className="absolute top-2.5 left-2.5 z-10 transition-opacity opacity-60 hover:opacity-100">
                            <FormulaTranslation formulaName={formulaName} translation={translation} />
                        </div>
                    )}
                    {children}
                </div>
            </div>
            <div className="shrink-0 w-10 sm:w-12 flex justify-center text-[var(--color-accent-brass)]/60">
                <BookOpen size={36} strokeWidth={1.2} />
            </div>
        </div>
    );
}

// CalcBlock: Calculation with actual substituted values
function CalcBlock({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`flex flex-row items-center w-[95%] md:w-[85%] mx-auto gap-4 sm:gap-6 py-3 my-2 ${className}`} dir="ltr">
            <div className="flex-1 overflow-x-auto scrollbar-thin rounded-lg shadow-sm">
                <div className="relative border border-[var(--color-border)] border-l-4 border-solid border-l-[var(--color-accent-cobalt)] rounded-lg bg-[var(--color-accent-cobalt)]/5 px-6 py-4 text-lg sm:text-xl md:text-2xl text-center flex flex-col items-center justify-center min-h-[84px] h-auto w-full min-w-max [&_.katex-display]:!overflow-visible [&_.katex-display]:w-full [&_.katex-display]:!m-0 [&_.katex-display]:flex [&_.katex-display]:justify-center font-sans text-[var(--color-text-primary)]">
                    {children}
                </div>
            </div>
            <div className="shrink-0 w-10 sm:w-12 flex justify-center text-[var(--color-accent-cobalt)]/60">
                <Calculator size={36} strokeWidth={1.2} />
            </div>
        </div>
    );
}

// --- Decision Matrix Helper Component ---
interface DecisionMatrixProps {
    isValid: boolean;
    stats: any;
    alpha: number;
    calculatePower: boolean;
}


function DecisionMatrix({ isValid, stats, alpha, calculatePower }: DecisionMatrixProps) {
    if (!isValid || !stats) {
        return (
            <div className="py-16 text-center text-[var(--color-text-secondary)] font-bold text-base">
                נא להזין ערכי קלט תקינים להצגת מטריצת החלטה...
            </div>
        );
    }

    return (
        <table className="w-full text-base text-right border-collapse table-layout-fixed bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm rounded-sm overflow-hidden">
            <thead>
                <tr className="bg-[var(--color-surface-raised)] text-xs text-[var(--color-text-primary)] font-bold border-b border-[var(--color-border)]">
                    <th className="p-4 text-center w-[20%] border-l border-[var(--color-border)]">
                        החלטת המבחן
                    </th>
                    <th className="p-4 text-center w-[40%] border-l border-[var(--color-border)]">
                        <span className="font-sans"><InlineMath math="H_0" /> נכונה במציאות</span>
                    </th>
                    <th className={`p-4 text-center w-[40%] transition-opacity ${!calculatePower ? 'opacity-30' : ''}`}>
                        <span className="font-sans"><InlineMath math="H_1" /> נכונה במציאות</span>
                    </th>
                </tr>
            </thead>
            <tbody className="text-[var(--color-text-primary)]">
                {/* Row 1: Fail to reject H0 */}
                <tr className="border-b border-[var(--color-border)]">
                    <td className="p-4 font-bold border-l border-[var(--color-border)] bg-[var(--color-error)]/10">
                        <span className="text-sm block text-[var(--color-text-primary)]">
                            אי-דחייה של <InlineMath math="H_0" />
                        </span>
                        <span className="block text-mono-xs font-mono text-[var(--color-text-secondary)] mt-1" dir="ltr">
                            <InlineMath math="\text{Fail to Reject } H_0" />
                        </span>
                    </td>

                    {/* Cell 1-1: Correct decision (1 - Alpha) */}
                    <td className="p-4 border-l border-[var(--color-border)] bg-[var(--color-success)]/10 transition-colors hover:bg-[var(--color-success)]/20">
                        <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2 mb-2">
                            <span className="font-bold text-[var(--color-success)] flex items-center gap-1.5 text-xs">
                                <CheckCircle size={14} className="shrink-0" />
                                החלטה נכונה
                            </span>
                            <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)]" dir="ltr">
                                <InlineMath math="1 - \alpha" />
                            </span>
                        </div>
                        <div className="my-2 flex items-baseline gap-x-2 flex-wrap">
                            <span className="text-xl sm:text-2xl font-sans font-bold tracking-tight text-[var(--color-text-primary)]">
                                {((1 - alpha) * 100).toFixed(1)}%
                            </span>
                            <span className="text-xs font-bold text-[var(--color-text-secondary)]">רמת סמך</span>
                        </div>
                        <div className="text-body-sm text-[var(--color-text-secondary)] leading-snug mt-2 border-t border-[var(--color-border)] pt-2 border-dashed">
                            <div className="mb-1 font-mono text-mono-xs" dir="ltr">
                                <InlineMath math="P(\text{Fail to Reject } H_0 \mid H_0 \text{ is true})" />
                            </div>
                            ההסתברות לא לדחות את השערת האפס כאשר היא אכן נכונה.
                        </div>
                    </td>

                    {/* Cell 1-2: Type II Error (Beta) */}
                    <td className={`p-4 transition-colors ${!calculatePower ? 'bg-[var(--color-surface)] opacity-40 select-none' : 'bg-[var(--color-error)]/10 hover:bg-[var(--color-error)]/20'}`}>
                        {calculatePower ? (
                            <>
                                <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2 mb-2">
                                    <span className="font-bold text-[var(--color-error)] flex items-center gap-1.5 text-xs">
                                        <XCircle size={14} className="shrink-0" />
                                        טעות מסוג II
                                    </span>
                                    <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)]" dir="ltr">
                                        <InlineMath math="\beta" />
                                    </span>
                                </div>
                                <div className="my-2 flex items-baseline gap-x-2 flex-wrap">
                                    <span className="text-xl sm:text-2xl font-sans font-bold tracking-tight text-[var(--color-text-primary)]">
                                        {(stats.beta * 100).toFixed(2)}%
                                    </span>
                                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">החמצה</span>
                                </div>
                                <div className="text-body-sm text-[var(--color-text-secondary)] leading-snug mt-2 border-t border-[var(--color-border)] pt-2 border-dashed">
                                    <div className="mb-1 font-mono text-mono-xs" dir="ltr">
                                        <InlineMath math="P(\text{Fail to Reject } H_0 \mid H_1 \text{ is true})" />
                                    </div>
                                    הסיכוי לא לדחות את השערת האפס למרות שהיא שקרית וקיים אפקט אמיתי.
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 text-center text-[var(--color-text-secondary)] h-full">
                                <Info size={14} className="mb-1.5 opacity-50" />
                                <span className="text-caption font-bold uppercase tracking-wider">לא פעיל</span>
                            </div>
                        )}
                    </td>
                </tr>

                {/* Row 2: Reject H0 */}
                <tr>
                    <td className="p-4 font-bold border-l border-[var(--color-border)] bg-[var(--color-success)]/10">
                        <span className="text-sm block text-[var(--color-text-primary)]">
                            דחיית <InlineMath math="H_0" />
                        </span>
                        <span className="block text-mono-xs font-mono text-[var(--color-text-secondary)] mt-1" dir="ltr">
                            <InlineMath math="\text{Reject } H_0" />
                        </span>
                    </td>

                    {/* Cell 2-1: Type I Error (Alpha) */}
                    <td className="p-4 border-l border-[var(--color-border)] bg-[var(--color-error)]/20 transition-colors hover:bg-[var(--color-error)]/30">
                        <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2 mb-2">
                            <span className="font-bold text-[var(--color-error)] flex items-center gap-1.5 text-xs">
                                <XCircle size={14} className="shrink-0" />
                                טעות מסוג I
                            </span>
                            <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)]" dir="ltr">
                                <InlineMath math="\alpha " />
                            </span>
                        </div>
                        <div className="my-2 flex items-baseline gap-x-2 flex-wrap">
                            <span className="text-xl sm:text-2xl font-sans font-bold tracking-tight text-[var(--color-text-primary)]">
                                {(alpha * 100).toFixed(1)}%
                            </span>
                            <span className="text-xs font-bold text-[var(--color-text-secondary)]">רמת מובהקות</span>
                        </div>
                        <div className="text-body-sm text-[var(--color-text-secondary)] leading-snug mt-2 border-t border-[var(--color-border)] pt-2 border-dashed">
                            <div className="mb-1 font-mono text-mono-xs" dir="ltr">
                                <InlineMath math="P(\text{Reject } H_0 \mid H_0 \text{ is true})" />
                            </div>
                            הסיכוי לדחות בטעות את השערת האפס כשהיא נכונה במציאות (גילוי שווא).
                        </div>
                    </td>

                    {/* Cell 2-2: Correct decision (1 - Beta) */}
                    <td className={`p-4 transition-colors ${!calculatePower ? 'bg-[var(--color-surface)] opacity-40 select-none' : 'bg-[var(--color-success)]/20 hover:bg-[var(--color-success)]/30'}`}>
                        {calculatePower ? (
                            <>
                                <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2 mb-2">
                                    <span className="font-bold text-[var(--color-success)] flex items-center gap-1.5 text-xs">
                                        <CheckCircle size={14} className="shrink-0" />
                                        החלטה נכונה
                                    </span>
                                    <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)]" dir="ltr">
                                        <InlineMath math="1 - \beta" />
                                    </span>
                                </div>
                                <div className="my-2 flex items-baseline gap-x-2 flex-wrap">
                                    <span className="text-xl sm:text-2xl font-sans font-bold tracking-tight text-[var(--color-text-primary)]">
                                        {(stats.power * 100).toFixed(2)}%
                                    </span>
                                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">עוצמת המבחן</span>
                                </div>
                                <div className="text-body-sm text-[var(--color-text-secondary)] leading-snug mt-2 border-t border-[var(--color-border)] pt-2 border-dashed">
                                    <div className="mb-1 font-mono text-mono-xs" dir="ltr">
                                        <InlineMath math="P(\text{Reject } H_0 \mid H_1 \text{ is true})" />
                                    </div>
                                    ההסתברות לזהות ולדחות השערת אפס שקרית בצדק (גילוי אפקט אמיתי).
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 text-center text-[var(--color-text-secondary)] h-full">
                                <Info size={14} className="mb-1.5 opacity-50" />
                                <span className="text-caption font-bold uppercase tracking-wider">לא פעיל</span>
                            </div>
                        )}
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

// --- Tooltip helper for Input Labels ---
interface InputTooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    tooltipClassName?: string;
}

const InputTooltip: React.FC<InputTooltipProps> = ({ content, children, className = "", tooltipClassName = "w-52" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const triggerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

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
            className={`relative inline-flex items-center gap-1.5 ${className}`}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}
            <Info size={13} className="text-[var(--color-accent-cobalt)] hover:text-[var(--color-accent-cobalt)] cursor-help shrink-0" />
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
                                className={`p-2.5 text-xs rounded-sm shadow-sm text-center leading-normal font-medium bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-sans ${tooltipClassName}`}
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

interface CellWatermarkProps {
    math: string;
    colorClass: string;
}

const CellWatermark: React.FC<CellWatermarkProps> = ({ math, colorClass }) => {
    return (
        <div
            className={`absolute left-2 top-1/2 -translate-y-1/2 -rotate-12 opacity-10 pointer-events-none select-none text-4xl sm:text-5xl font-mono ${colorClass}`}
            data-cell-watermark={math}
            dir="ltr"
            aria-hidden="true"
        >
            <InlineMath math={math} />
        </div>
    );
};

export default function HypothesisTestingCalculator() {
    // Tour state
    const [runTour, setRunTour] = useState(false);
    const tourSteps: Step[] = useMemo(() => [
        {
            target: '.tour-step-intro',
            content: 'ברוכים הבאים למחשבון בדיקת ההשערות! כאן תוכלו לבחון נתונים ולחשב עוצמה בקלות.',
            disableBeacon: true,
            placement: 'center',
        },
        {
            target: '.tour-step-inputs',
            content: 'כאן מזינים את הפרמטרים של אוכלוסיית הבסיס (השערת האפס) ושל המדגם שלכם.',
            placement: 'right',
        },
        {
            target: '.tour-step-test-type',
            content: 'בחרו את סוג המבחן והכיוון שלו (חד-צדדי או דו-צדדי).',
            placement: 'bottom',
        },
        {
            target: '.tour-step-graph',
            content: 'הגרף יתעדכן בזמן אמת ויציג לכם את התפלגות הדגימה, אזורי הדחייה והעוצמה (1-Beta).',
            placement: 'left',
        },
        {
            target: '.tour-step-decision',
            content: 'מטריצת ההחלטה מציגה בצורה ברורה את המסקנה הסטטיסטית של המבחן.',
            placement: 'top',
        },
        {
            target: '.tour-step-accordion-ht',
            content: 'בחלק זה מוצגים 6 שלבי הפתרון. בשלב 1 (ניסוח השערות) נקבע צד המבחן וידיעת השונות. בשלב 3 נקבעת רמת המובהקות. שלבים 4, 5 ו-6 מתבצעים אוטומטית עד לקבלת מסקנה.',
            placement: 'top',
        },
        {
            target: '.tour-step-accordion-ci',
            content: 'במידת הצורך, כאן תוכלו למצוא גם חישוב מפורט של רווח סמך לתוחלת, ומיד מתחתיו חישוב לעוצמת המבחן (Power).',
            placement: 'top',
        }
    ], []);

    // Input states
    const [varianceKnown, setVarianceKnown] = useLocalStorageState<boolean>('HT_varianceKnown', DEFAULT_BODY_TEMPERATURE_STUDY.varianceKnown);
    const [calculatePower, setCalculatePower] = useLocalStorageState<boolean>('HT_calculatePower', DEFAULT_BODY_TEMPERATURE_STUDY.calculatePower);

    const [mu0, setMu0] = useLocalStorageState<number>('HT_mu0', DEFAULT_BODY_TEMPERATURE_STUDY.mu0);
    const [mu0Input, setMu0Input] = useLocalStorageState<string>('HT_mu0Input', DEFAULT_BODY_TEMPERATURE_STUDY.mu0Input);

    const [mu1, setMu1] = useLocalStorageState<number>('HT_mu1', DEFAULT_BODY_TEMPERATURE_STUDY.mu1);
    const [mu1Input, setMu1Input] = useLocalStorageState<string>('HT_mu1Input', DEFAULT_BODY_TEMPERATURE_STUDY.mu1Input);

    const [muH1, setMuH1] = useLocalStorageState<number>('HT_muH1', DEFAULT_BODY_TEMPERATURE_STUDY.muH1);
    const [muH1Input, setMuH1Input] = useLocalStorageState<string>('HT_muH1Input', DEFAULT_BODY_TEMPERATURE_STUDY.muH1Input);

    const [sigma, setSigma] = useLocalStorageState<number>('HT_sigma', DEFAULT_BODY_TEMPERATURE_STUDY.sigma);
    const [sigmaInput, setSigmaInput] = useLocalStorageState<string>('HT_sigmaInput', DEFAULT_BODY_TEMPERATURE_STUDY.sigmaInput);

    const [n, setN] = useLocalStorageState<number>('HT_n', DEFAULT_BODY_TEMPERATURE_STUDY.n);
    const [nInput, setNInput] = useLocalStorageState<string>('HT_nInput', DEFAULT_BODY_TEMPERATURE_STUDY.nInput);

    const [alpha, setAlpha] = useLocalStorageState<number>('HT_alpha', DEFAULT_BODY_TEMPERATURE_STUDY.alpha);
    const [alphaInput, setAlphaInput] = useLocalStorageState<string>('HT_alphaInput', DEFAULT_BODY_TEMPERATURE_STUDY.alphaInput);

    const [testType, setTestType] = useLocalStorageState<TestType>('HT_testType', DEFAULT_BODY_TEMPERATURE_STUDY.testType);
    const [tailType, setTailType] = useLocalStorageState<TailType>('HT_tailType', DEFAULT_BODY_TEMPERATURE_STUDY.tailType);

    const [ciTailType, setCiTailType] = useLocalStorageState<TailType>('HT_ciTailType', DEFAULT_BODY_TEMPERATURE_STUDY.ciTailType);
    const [ciAlpha, setCiAlpha] = useLocalStorageState<number>('HT_ciAlpha', DEFAULT_BODY_TEMPERATURE_STUDY.ciAlpha);

    const applyCiAlphaPreset = (preset: number) => {
        setCiAlpha(preset);
    };

    const statSymbol = testType === 'single' ? 'X' : testType === 'sum' ? '\\sum X' : '\\bar{X}';
    const statName = testType === 'single' ? 'הערך הבודד' : testType === 'sum' ? 'סכום המדגם' : 'ממוצע המדגם';
    const statNamePlural = testType === 'single' ? 'ערכים בודדים' : testType === 'sum' ? 'סכומי מדגם' : 'ממוצעי מדגם';
    const sampleStatisticLabel = testType === 'single' ? 'ערך בודד' : testType === 'sum' ? 'סכום מדגם' : 'ממוצע מדגם';
    const sampleStatisticTooltip = testType === 'single'
        ? 'הערך הבודד בפועל שנבדק מול השערת האפס'
        : testType === 'sum'
            ? 'סכום המדגם בפועל שנבדק מול השערת האפס'
            : 'ממוצע המדגם בפועל שנבדק מול השערת האפס';



    // Accordion state
    const [showHypothesisTesting, setShowHypothesisTesting] = useState<boolean>(false);
    const [showCI, setShowCI] = useState<boolean>(false);
    const [showPower, setShowPower] = useState<boolean>(false);

    // Error validations
    const errors = useMemo(() => {
        const errList: { [key: string]: string } = {};

        const parsedMu0 = parseFloat(mu0Input);
        if (mu0Input.trim() === '') errList.mu0 = 'שדה חובה';
        else if (isNaN(parsedMu0)) errList.mu0 = 'הזן מספר תקין';

        const parsedMu1 = parseFloat(mu1Input);
        if (mu1Input.trim() === '') errList.mu1 = 'שדה חובה';
        else if (isNaN(parsedMu1)) errList.mu1 = 'הזן מספר תקין';

        const parsedMuH1 = parseFloat(muH1Input);
        if (calculatePower) {
            if (muH1Input.trim() === '') errList.muH1 = 'שדה חובה';
            else if (isNaN(parsedMuH1)) errList.muH1 = 'הזן מספר תקין';
        }

        const parsedSigma = parseFloat(sigmaInput);
        if (sigmaInput.trim() === '') errList.sigma = 'שדה חובה';
        else if (isNaN(parsedSigma)) errList.sigma = 'הזן מספר תקין';
        else if (parsedSigma <= 0) errList.sigma = 'סטיית תקן חייבת להיות גדולה מ-0';

        const parsedN = parseInt(nInput, 10);
        if (nInput.trim() === '') errList.n = 'שדה חובה';
        else if (isNaN(parsedN)) errList.n = 'הזן מספר שלם';
        else if (parsedN <= 0) errList.n = 'גודל מדגם חייב להיות לפחות 1';

        const parsedAlpha = parseFloat(alphaInput);
        if (alphaInput.trim() === '') errList.alpha = 'שדה חובה';
        else if (isNaN(parsedAlpha)) errList.alpha = 'הזן הסתברות';
        else if (parsedAlpha <= 0 || parsedAlpha >= 1) errList.alpha = 'רמת מובהקות חייבת להיות בין 0 ל-1 בלבד';

        return errList;
    }, [mu0Input, mu1Input, sigmaInput, nInput, alphaInput, calculatePower, muH1Input]);

    const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

    // Handle input changes
    const handleMu0Change = (val: string) => {
        setMu0Input(val);
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) setMu0(parsed);
    };

    const handleMu1Change = (val: string) => {
        setMu1Input(val);
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) setMu1(parsed);
    };

    const handleMuH1Change = (val: string) => {
        setMuH1Input(val);
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) setMuH1(parsed);
    };

    const handleSigmaChange = (val: string) => {
        setSigmaInput(val);
        const parsed = parseFloat(val);
        if (!isNaN(parsed) && parsed > 0) setSigma(parsed);
    };

    const handleNChange = (val: string) => {
        setNInput(val);
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed) && parsed > 0) setN(parsed);
    };

    const handleAlphaChange = (val: string) => {
        setAlphaInput(val);
        const parsed = parseFloat(val);
        if (!isNaN(parsed) && parsed > 0 && parsed < 1) setAlpha(parsed);
    };

    // Safe preset setters
    const applyAlphaPreset = (preset: number) => {
        setAlpha(preset);
        setAlphaInput(preset.toString());
    };

    // Reset calculator to the Mackowiak body-temperature study defaults.
    const handleReset = () => {
        setVarianceKnown(DEFAULT_BODY_TEMPERATURE_STUDY.varianceKnown);
        setCalculatePower(DEFAULT_BODY_TEMPERATURE_STUDY.calculatePower);
        setMu0(DEFAULT_BODY_TEMPERATURE_STUDY.mu0);
        setMu0Input(DEFAULT_BODY_TEMPERATURE_STUDY.mu0Input);
        setMu1(DEFAULT_BODY_TEMPERATURE_STUDY.mu1);
        setMu1Input(DEFAULT_BODY_TEMPERATURE_STUDY.mu1Input);
        setMuH1(DEFAULT_BODY_TEMPERATURE_STUDY.muH1);
        setMuH1Input(DEFAULT_BODY_TEMPERATURE_STUDY.muH1Input);
        setSigma(DEFAULT_BODY_TEMPERATURE_STUDY.sigma);
        setSigmaInput(DEFAULT_BODY_TEMPERATURE_STUDY.sigmaInput);
        setN(DEFAULT_BODY_TEMPERATURE_STUDY.n);
        setNInput(DEFAULT_BODY_TEMPERATURE_STUDY.nInput);
        setAlpha(DEFAULT_BODY_TEMPERATURE_STUDY.alpha);
        setAlphaInput(DEFAULT_BODY_TEMPERATURE_STUDY.alphaInput);
        setTestType(DEFAULT_BODY_TEMPERATURE_STUDY.testType);
        setTailType(DEFAULT_BODY_TEMPERATURE_STUDY.tailType);
        setCiTailType(DEFAULT_BODY_TEMPERATURE_STUDY.ciTailType);
        setCiAlpha(DEFAULT_BODY_TEMPERATURE_STUDY.ciAlpha);
    };

    // --- Core Calculations Engine ---
    const stats = useMemo(() => {
        if (!isValid) return null;

        // 1. Calculate Standard Error (SE) based on Test Type and CLT
        let se = sigma;
        let effectH0Mean = mu0;
        let effectH1Mean = muH1;

        if (testType === 'mean') {
            se = sigma / Math.sqrt(n);
            effectH0Mean = mu0;
            effectH1Mean = muH1;
        } else if (testType === 'sum') {
            se = sigma * Math.sqrt(n);
            effectH0Mean = mu0 * n;
            effectH1Mean = muH1 * n;
        } else {
            // Single item
            se = sigma;
            effectH0Mean = mu0;
            effectH1Mean = muH1;
        }

        const df = testType === 'single' ? 1 : Math.max(1, n - 1);

        // Non-Centrality Parameter calculation
        const ncp = (effectH1Mean - effectH0Mean) / se;

        // 2. Critical Score Sourcing & Distribution Mapping
        let zCrit: number = 0;
        let zCritLower: number = 0; // for two-tailed

        if (varianceKnown) {
            if (tailType === 'right') {
                zCrit = inverseNormalCDF(1 - alpha);
            } else if (tailType === 'left') {
                zCrit = inverseNormalCDF(alpha); // This will be negative
            } else { // two-tailed
                zCrit = inverseNormalCDF(1 - alpha / 2);
                zCritLower = -zCrit;
            }
        } else {
            if (tailType === 'right') {
                zCrit = studentTPPF(1 - alpha, df);
            } else if (tailType === 'left') {
                zCrit = studentTPPF(alpha, df);
            } else { // two-tailed
                zCrit = studentTPPF(1 - alpha / 2, df);
                zCritLower = -zCrit;
            }
        }

        // Single Boundary Calculation Engine
        let c2: number = effectH0Mean + zCrit * se;
        let c1: number = tailType === 'two-tailed' ? effectH0Mean + zCritLower * se : 0;

        const C_bar_value = tailType === 'two-tailed' ? c2 : c2; // primary boundary
        const C_bar_value_1 = c1;
        const C_bar_value_2 = c2;

        // 3. Non-Central Risk & Power Evaluation
        let beta = 0;
        let power = 0;

        if (varianceKnown) {
            if (tailType === 'right') {
                beta = normalCDF(c2, effectH1Mean, se);
                power = 1 - beta;
            } else if (tailType === 'left') {
                beta = 1 - normalCDF(c2, effectH1Mean, se);
                power = 1 - beta;
            } else { // two-tailed
                beta = normalCDF(c2, effectH1Mean, se) - normalCDF(c1, effectH1Mean, se);
                power = 1 - beta;
            }
        } else {
            if (tailType === 'right') {
                beta = studentTCDF(zCrit - ncp, df);
                power = 1 - beta;
            } else if (tailType === 'left') {
                beta = 1 - studentTCDF(zCrit - ncp, df); // Using exact area map
                power = 1 - beta;
            } else { // two-tailed
                beta = studentTCDF(zCrit - ncp, df) - studentTCDF(zCritLower - ncp, df);
                power = 1 - beta;
            }
        }

        // Keep it safe
        beta = Math.max(0, Math.min(1, beta));
        power = Math.max(0, Math.min(1, power));

        return {
            se,
            effectH0Mean,
            effectH1Mean,
            c1,
            c2,
            C_bar_value,
            C_bar_value_1,
            C_bar_value_2,
            zCrit,
            zCritLower,
            beta,
            power,
            df,
            ncp,
            varianceKnown
        };
    }, [mu0, mu1, muH1, sigma, n, alpha, testType, tailType, isValid, varianceKnown, calculatePower]);

    // --- Dynamic Decision Data Logic ---
    const decisionData = useMemo(() => {
        if (!stats || !isValid) return null;

        // We decouple xBar from mu1, by defining xBar variable which will eventually be bound to a separate state.
        // For now we use the existing mu1 state as the xBar fallback until we add the xBar state, but the calculation is completely isolated.
        const xBarValue = mu1;

        let isReject = false;
        let ruleText = '';
        let decisionHeading = '';
        let belongingExplanationText = '';

        // Formal Structural Set Compilation using purely C and \bar{C}
        let zoneRejectionTeX = '';
        let zoneAcceptanceTeX = '';

        const formattedXBar = xBarValue.toFixed(xBarValue % 1 === 0 ? 0 : 3);

        if (tailType === 'right') {
            isReject = xBarValue >= stats.C_bar_value;
            zoneRejectionTeX = `C = \\{ \\bar{X} \\mid \\bar{X} \\ge ${stats.C_bar_value.toFixed(4)} \\}`;
            zoneAcceptanceTeX = `\\bar{C} = \\{ \\bar{X} \\mid \\bar{X} < ${stats.C_bar_value.toFixed(4)} \\}`;
        } else if (tailType === 'left') {
            isReject = xBarValue <= stats.C_bar_value;
            zoneRejectionTeX = `C = \\{ \\bar{X} \\mid \\bar{X} \\le ${stats.C_bar_value.toFixed(4)} \\}`;
            zoneAcceptanceTeX = `\\bar{C} = \\{ \\bar{X} \\mid \\bar{X} > ${stats.C_bar_value.toFixed(4)} \\}`;
        } else { // two-tailed
            isReject = xBarValue <= stats.C_bar_value_1 || xBarValue >= stats.C_bar_value_2;
            zoneRejectionTeX = `C = \\{ \\bar{X} \\mid \\bar{X} \\le ${stats.C_bar_value_1.toFixed(4)} \\lor \\bar{X} \\ge ${stats.C_bar_value_2.toFixed(4)} \\}`;
            zoneAcceptanceTeX = `\\bar{C} = \\{ \\bar{X} \\mid ${stats.C_bar_value_1.toFixed(4)} < \\bar{X} < ${stats.C_bar_value_2.toFixed(4)} \\}`;
        }

        if (isReject) {
            decisionHeading = '\\text{Reject } H_0';
            belongingExplanationText = `מכיוון שממוצע המדגם בפועל הוא X̄ = ${formattedXBar}, הוא שייך לקבוצה C.`;
        } else {
            decisionHeading = '\\text{Do Not Reject } H_0';
            belongingExplanationText = `מכיוון שממוצע המדגם בפועל הוא X̄ = ${formattedXBar}, הוא שייך לקבוצה \\bar{C}.`;
        }

        let verbalConclusion = '';
        const comparisonText = tailType === 'right' ? `גדולה מ-${mu0}` : tailType === 'left' ? `קטנה מ-${mu0}` : `שונה מ-${mu0}`;

        if (isReject) {
            verbalConclusion = `ברמת מובהקות של ${alpha}, קיימות ראיות סטטיסטיות מספקות המבוססות על המדגם (P-value < α) כדי לדחות את השערת האפס. לפיכך, ניתן לקבוע כי תוחלת האוכלוסייה ${comparisonText}.`;
        } else {
            verbalConclusion = `ברמת מובהקות של ${alpha}, אין עדות סטטיסטית מספקת לדחות את השערת האפס (P-value ≥ α). לפיכך, אין לקבוע כי תוחלת האוכלוסייה ${comparisonText}.`;
        }

        // Calculate Exact P-Value
        let statObs = 0;
        let pValue = 0;

        statObs = (xBarValue - stats.effectH0Mean) / stats.se;

        if (stats.varianceKnown) {
            if (tailType === 'right') {
                pValue = 1 - normalCDF(statObs, 0, 1);
            } else if (tailType === 'left') {
                pValue = normalCDF(statObs, 0, 1);
            } else {
                pValue = 2 * Math.min(normalCDF(statObs, 0, 1), 1 - normalCDF(statObs, 0, 1));
            }
        } else {
            if (tailType === 'right') {
                pValue = 1 - studentTCDF(statObs, stats.df);
            } else if (tailType === 'left') {
                pValue = studentTCDF(statObs, stats.df);
            } else {
                pValue = 2 * Math.min(studentTCDF(statObs, stats.df), 1 - studentTCDF(statObs, stats.df));
            }
        }

        return {
            xBar: xBarValue,
            isReject,
            decisionHeading,
            verbalConclusion,
            zoneRejectionTeX,
            zoneAcceptanceTeX,
            belongingExplanationText,
            formattedXBar,
            pValue,
            statObs
        };
    }, [stats, isValid, mu0, mu1, alpha, tailType]);

    const unifiedDecisionResult = useMemo(() => {
        if (!stats || !decisionData || !isValid) return null;

        const decisionSampleSize = testType === 'single' ? 1 : n;

        return unifiedDecision({
            sample: decisionData.xBar,
            nullMean: stats.effectH0Mean,
            stdDev: stats.se * Math.sqrt(decisionSampleSize),
            n: decisionSampleSize,
            alpha,
            tail: tailType,
            varianceKnown: stats.varianceKnown,
            alternativeMean: stats.effectH1Mean,
        });
    }, [stats, decisionData, isValid, testType, n, alpha, tailType]);

    // --- Chart Limits for X-axis & Gradient Calculations ---
    const chartLimits = useMemo(() => {
        if (!stats || !isValid) return { xMin: 0, xMax: 100 };
        const { effectH0Mean, effectH1Mean, se } = stats;
        const minCenter = calculatePower ? Math.min(effectH0Mean, effectH1Mean) : effectH0Mean;
        const maxCenter = calculatePower ? Math.max(effectH0Mean, effectH1Mean) : effectH0Mean;
        return {
            xMin: minCenter - 4.2 * se,
            xMax: maxCenter + 4.2 * se,
        };
    }, [stats, isValid, calculatePower]);

    // --- Custom Ticks for X-Axis representing means and standard deviations ---
    const xAxisTicks = useMemo(() => {
        if (!stats || !isValid) return [];
        const { effectH0Mean, effectH1Mean, se } = stats;

        const ticksSet = new Set<string>();

        const addVal = (val: number) => {
            ticksSet.add(val.toFixed(2));
        };

        addVal(effectH0Mean);
        addVal(effectH0Mean - se);
        addVal(effectH0Mean + se);
        addVal(effectH0Mean - 2 * se);
        addVal(effectH0Mean + 2 * se);
        addVal(effectH0Mean - 3 * se);
        addVal(effectH0Mean + 3 * se);

        if (calculatePower) {
            addVal(effectH1Mean);
            addVal(effectH1Mean - se);
            addVal(effectH1Mean + se);
            addVal(effectH1Mean - 2 * se);
            addVal(effectH1Mean + 2 * se);
            addVal(effectH1Mean - 3 * se);
            addVal(effectH1Mean + 3 * se);
        }

        const rawTicks = Array.from(ticksSet).map(Number).sort((a, b) => a - b);
        const finalTicks: number[] = [];
        const minSpacing = se * 0.45;

        for (const t of rawTicks) {
            if (finalTicks.length === 0) {
                finalTicks.push(t);
            } else {
                const prev = finalTicks[finalTicks.length - 1];
                if (t - prev >= minSpacing) {
                    finalTicks.push(t);
                } else {
                    const diffPrevToMean = Math.abs(prev - effectH0Mean);
                    const diffCurrToMean = Math.abs(t - effectH0Mean);
                    const diffPrevToMeanH1 = calculatePower ? Math.abs(prev - effectH1Mean) : Infinity;
                    const diffCurrToMeanH1 = calculatePower ? Math.abs(t - effectH1Mean) : Infinity;

                    const prevIsMean = diffPrevToMean < 0.01 || diffPrevToMeanH1 < 0.01;
                    const currIsMean = diffCurrToMean < 0.01 || diffCurrToMeanH1 < 0.01;

                    if (currIsMean && !prevIsMean) {
                        finalTicks[finalTicks.length - 1] = t;
                    }
                }
            }
        }
        return finalTicks;
    }, [stats, isValid, calculatePower]);

    // --- Dynamic Graph Data Generation ---
    const chartData = useMemo(() => {
        if (!stats || !isValid) return [];

        const pts = [];
        const numPoints = 180;
        const { effectH0Mean, effectH1Mean, se, c1, c2 } = stats;
        const { xMin, xMax } = chartLimits;
        const step = (xMax - xMin) / (numPoints - 1);

        for (let i = 0; i < numPoints; i++) {
            const x = xMin + i * step;
            const { df, varianceKnown } = stats;
            const pdfH0 = varianceKnown
                ? normalPDF(x, effectH0Mean, se)
                : studentTPDF((x - effectH0Mean) / se, df) / se;
            const pdfH1 = calculatePower ? (varianceKnown
                ? normalPDF(x, effectH1Mean, se)
                : studentTPDF((x - effectH1Mean) / se, df) / se) : 0;

            // Determine rejection regions to shade Alpha and Power
            let isRejected = false;
            if (tailType === 'right') {
                isRejected = x >= c2;
            } else if (tailType === 'left') {
                isRejected = x <= c2;
            } else { // two-tailed
                isRejected = x <= c1 || x >= c2;
            }

            // Rejection area under H0 is Alpha (Type I Error)
            const alphaShade = isRejected ? pdfH0 : 0;

            // Rejection area under H1 is Power (1-Beta)
            const powerShade = calculatePower && isRejected ? pdfH1 : 0;

            pts.push({
                x: Number(x.toFixed(4)),
                pdfH0,
                pdfH1,
                alphaShade,
                powerShade,
            });
        }

        return pts;
    }, [stats, isValid, tailType, calculatePower, chartLimits]);


    const ciChartData = useMemo(() => {
        if (!stats || !isValid) return [];

        const pts = [];
        const numPoints = 200;
        const { se, df, varianceKnown } = stats;

        const alphaNum = parseFloat(alphaInput) || 0.05;

        // Limits for the CI chart: +/- 4 SE from both mu0 and mu1 to ensure both distributions are visible
        const minMean = Math.min(mu0, mu1);
        const maxMean = Math.max(mu0, mu1);
        const xMin = minMean - 4 * se;
        const xMax = maxMean + 4 * se;
        const step = (xMax - xMin) / (numPoints - 1);

        const ciCrit2Side = varianceKnown ? inverseNormalCDF(1 - alphaNum / 2) : studentTPPF(1 - alphaNum / 2, df);
        const ciCrit1Side = varianceKnown ? inverseNormalCDF(1 - alphaNum) : studentTPPF(1 - alphaNum, df);
        const MoE2Side = ciCrit2Side * se;
        const MoE1Side = ciCrit1Side * se;

        const lower2Side = mu1 - MoE2Side;
        const upper2Side = mu1 + MoE2Side;
        const lower1Side = mu1 - MoE1Side;
        const upper1Side = mu1 + MoE1Side;

        for (let i = 0; i < numPoints; i++) {
            const x = xMin + i * step;
            const pdfPop = varianceKnown
                ? normalPDF(x, mu0, se)
                : studentTPDF((x - mu0) / se, df) / se;
            const pdfSample = varianceKnown
                ? normalPDF(x, mu1, se)
                : studentTPDF((x - mu1) / se, df) / se;

            // CI fill interval depending on tailType
            let inCI = false;
            if (tailType === 'two-tailed') {
                inCI = x >= lower2Side && x <= upper2Side;
            } else if (tailType === 'right') { // test is right-tailed -> want lower bound -> CI is [lower, +inf)
                inCI = x >= lower1Side;
            } else if (tailType === 'left') { // test is left-tailed -> want upper bound -> CI is (-inf, upper]
                inCI = x <= upper1Side;
            }

            pts.push({
                x: parseFloat(x.toFixed(4)),
                pdfPop,
                pdfSample,
                pdfSampleCI: inCI ? pdfSample : 0,
            });
        }
        return pts;
    }, [stats, isValid, mu0, mu1, tailType, alphaInput]);

    // Custom tooltips for graphs


    const ciChartTicks = useMemo(() => {
        if (!stats || !isValid) return [];
        const { se, df, varianceKnown } = stats;
        const alphaNum = parseFloat(alphaInput) || 0.05;
        const ciCrit2Side = varianceKnown ? inverseNormalCDF(1 - alphaNum / 2) : studentTPPF(1 - alphaNum / 2, df);
        const ciCrit1Side = varianceKnown ? inverseNormalCDF(1 - alphaNum) : studentTPPF(1 - alphaNum, df);
        const MoE2Side = ciCrit2Side * se;
        const MoE1Side = ciCrit1Side * se;

        const lower2Side = mu1 - MoE2Side;
        const upper2Side = mu1 + MoE2Side;
        const lower1Side = mu1 - MoE1Side;
        const upper1Side = mu1 + MoE1Side;

        const ticksSet = new Set<string>();
        const addVal = (val) => { ticksSet.add(val.toFixed(2)); };

        addVal(mu0);
        addVal(mu1);
        addVal(mu1 - se);
        addVal(mu1 + se);
        addVal(mu1 - 2 * se);
        addVal(mu1 + 2 * se);
        addVal(mu0 - se);
        addVal(mu0 + se);
        addVal(mu0 - 2 * se);
        addVal(mu0 + 2 * se);

        if (tailType === 'two-tailed') {
            addVal(lower2Side);
            addVal(upper2Side);
        } else if (tailType === 'right') {
            addVal(lower1Side);
        } else if (tailType === 'left') {
            addVal(upper1Side);
        }

        const rawTicks = Array.from(ticksSet).map(Number).sort((a, b) => a - b);
        const finalTicks = [];
        const minSpacing = se * 0.45;

        for (const t of rawTicks) {
            if (finalTicks.length === 0) {
                finalTicks.push(t);
            } else {
                const prev = finalTicks[finalTicks.length - 1];
                if (t - prev >= minSpacing) {
                    finalTicks.push(t);
                } else {
                    const isImportant = (v) => {
                        const sv = v.toFixed(2);
                        return sv === mu0.toFixed(2) || sv === mu1.toFixed(2) ||
                            (tailType === 'two-tailed' && (sv === lower2Side.toFixed(2) || sv === upper2Side.toFixed(2))) ||
                            (tailType === 'right' && sv === lower1Side.toFixed(2)) ||
                            (tailType === 'left' && sv === upper1Side.toFixed(2));
                    };
                    const prevImportant = isImportant(prev);
                    const currImportant = isImportant(t);

                    if (currImportant && !prevImportant) {
                        finalTicks[finalTicks.length - 1] = t;
                    }
                }
            }
        }
        return finalTicks;
    }, [stats, isValid, mu0, mu1, tailType, alphaInput]);

    const CustomCIChartTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const dataPt = payload[0].payload;
            return (
                <div className="p-3 border rounded-sm shadow-sm text-sm font-sans space-y-2 backdrop-blur-md bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] min-w-[160px]" dir="rtl">
                    <div className="flex justify-between gap-6 border-b border-[var(--color-border)] pb-2 mb-2">
                        <span className="font-bold text-[var(--color-accent-cobalt)]">תצפית X:</span>
                        <span className="font-mono font-bold text-[var(--color-accent-cobalt)]" dir="ltr">{dataPt.x.toFixed(2)}</span>
                    </div>
                    <div className="text-xs font-bold text-[var(--color-text-secondary)] mb-1">צפיפות הסתברות:</div>
                    <div className="flex justify-between gap-6" style={{ color: 'var(--color-accent-brass)' }}>
                        <span className="font-semibold">אוכלוסיה:</span>
                        <span className="font-mono font-bold" dir="ltr">{dataPt.pdfPop.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-6" style={{ color: 'var(--chart-4)' }}>
                        <span className="font-semibold">מדגם:</span>
                        <span className="font-mono font-bold" dir="ltr">{dataPt.pdfSample.toFixed(2)}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomChartTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const dataPt = payload[0].payload;
            return (
                <div className="p-3 border rounded-sm shadow-sm text-sm font-sans space-y-2 backdrop-blur-md bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] min-w-[160px]" dir="rtl">
                    <div className="flex justify-between gap-6 border-b border-[var(--color-border)] pb-2 mb-2">
                        <span className="font-bold text-[var(--color-accent-cobalt)]">תצפית X:</span>
                        <span className="font-mono font-bold text-[var(--color-accent-cobalt)]" dir="ltr">{dataPt.x.toFixed(2)}</span>
                    </div>
                    <div className="text-xs font-bold text-[var(--color-text-secondary)] mb-1">צפיפות הסתברות:</div>
                    <div className="flex justify-between gap-6 text-[var(--color-accent-brass)]">
                        <span className="font-semibold">אוכלוסיה (<InlineMath math="H_0" />):</span>
                        <span className="font-mono font-bold" dir="ltr">{dataPt.pdfH0.toFixed(2)}</span>
                    </div>
                    {dataPt.pdfH1 !== undefined && (
                        <div className="flex justify-between gap-6 text-[var(--color-accent-teal)]">
                            <span className="font-semibold">מדגם (<InlineMath math="H_1" />):</span>
                            <span className="font-mono font-bold" dir="ltr">{dataPt.pdfH1.toFixed(2)}</span>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="tour-step-intro space-y-8 bg-[var(--color-background)] min-h-screen text-[var(--color-text-primary)] p-4 sm:p-6 md:p-8" dir="rtl">
            <JoyrideComponent
                steps={tourSteps}
                run={runTour}
                continuous
                showSkipButton
                disableOverlayClose
                styles={({
                    options: {
                        zIndex: 10000,
                        primaryColor: '#d4a843',
                        backgroundColor: '#1e1e24',
                        textColor: '#e0e0e0',
                        arrowColor: '#1e1e24',
                        overlayColor: 'rgba(0, 0, 0, 0.65)'
                    },
                    tooltip: {
                        direction: 'rtl',
                        fontFamily: 'Assistant, sans-serif',
                        textAlign: 'right',
                        borderRadius: '8px',
                        border: '1px solid #3f3f46'
                    },
                    buttonNext: { backgroundColor: '#34529e', color: '#fff', borderRadius: '4px', fontWeight: 'bold' },
                    buttonBack: { color: '#a1a1aa', fontWeight: 'bold' },
                    buttonSkip: { color: '#ef4444', fontWeight: 'bold' }
                }) as any}
                callback={(data) => {
                    if (data.status === 'finished' || data.status === 'skipped') {
                        setRunTour(false);
                    }
                }}
                locale={{ back: 'חזור', close: 'סגור', last: 'סיום', next: 'הבא', skip: 'דלג' }}
            />

            {/* Default Study Accordion */}
            <AnimatedDetails defaultOpen className="group relative bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg mb-8 shadow-sm border-r-4 border-r-[var(--color-accent-cobalt)] overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="relative z-10 cursor-pointer select-none p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center gap-4 border-b border-[var(--color-border)]/70 overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <span className="absolute top-2 left-[18%] -rotate-6 text-2xl sm:text-4xl font-mono font-black text-[var(--color-accent-cobalt)]/10" dir="ltr"><InlineMath math="\bar{X} = 36.82^\circ C" /></span>
                        <span className="absolute top-7 left-[42%] rotate-3 text-xl sm:text-3xl font-mono font-black text-[var(--color-accent-brass)]/10" dir="ltr"><InlineMath math="n = 148" /></span>
                        <span className="absolute bottom-1 right-[34%] -rotate-2 text-xl sm:text-3xl font-mono font-black text-[var(--color-success)]/10" dir="ltr"><InlineMath math="H_1: \mu < 37" /></span>
                        <span className="absolute bottom-2 left-[6%] rotate-6 text-xl sm:text-3xl font-mono font-black text-[var(--color-accent-crimson)]/10" dir="ltr"><InlineMath math="\alpha = 5\%" /></span>
                    </div>
                    <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-[var(--color-accent-cobalt-bg)]/20 p-2 rounded-lg text-[var(--color-accent-cobalt)] shrink-0">
                            <Globe2 size={20} />
                        </div>
                        <h2 className="font-black text-[var(--color-text-primary)] text-base sm:text-lg">
                            דוגמה מהמציאות: בדיקת השערות על טמפרטורת גוף (צלזיוס)
                        </h2>
                    </div>
                    <div className="relative z-10 flex flex-wrap items-center gap-3 xl:justify-end">
                        <button
                            type="button"
                            onClick={(event) => {
                                event.preventDefault();
                                handleReset();
                            }}
                            className="px-4 py-1.5 bg-[var(--color-accent-brass)]/10 text-[var(--color-accent-brass)] border border-[var(--color-accent-brass)]/50 rounded-md text-sm font-bold shadow-sm hover:bg-[var(--color-accent-brass)]/20 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={16} />
                            <span>טען נתוני ברירת מחדל</span>
                        </button>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.preventDefault();
                                setRunTour(true);
                            }}
                            className="px-4 py-1.5 bg-[var(--color-accent-cobalt-bg)] text-[var(--color-accent-cobalt)] border border-[var(--color-accent-cobalt-line)]/50 rounded-md text-sm font-bold shadow-sm hover:bg-[var(--color-accent-cobalt-bg-hover)] hover:text-white transition-colors flex items-center gap-2"
                        >
                            <span>הפעל סיור מודרך</span>
                        </button>
                        <ChevronDown size={22} className="text-[var(--color-text-secondary)] transition-transform duration-300 group-[.is-open]:rotate-180" />
                    </div>
                </summary>

                <div className="relative z-10 p-4 sm:p-6 space-y-5">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <span className="absolute top-4 left-8 -rotate-12 text-5xl sm:text-6xl font-mono font-black text-[var(--color-accent-cobalt)]/10" dir="ltr"><InlineMath math="\bar{X} = 36.82^\circ C" /></span>
                        <span className="absolute top-24 right-10 rotate-6 text-4xl sm:text-5xl font-mono font-black text-[var(--color-accent-brass)]/10" dir="ltr"><InlineMath math="n = 148" /></span>
                        <span className="absolute bottom-16 left-12 rotate-3 text-4xl sm:text-6xl font-mono font-black text-[var(--color-success)]/10" dir="ltr"><InlineMath math="\text{Reject } H_0" /></span>
                        <span className="absolute bottom-3 right-20 -rotate-6 text-4xl sm:text-5xl font-mono font-black text-[var(--color-accent-crimson)]/10" dir="ltr"><InlineMath math="\alpha = 5\%" /></span>
                    </div>

                    <div className="relative grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5 text-sm leading-relaxed">
                        <section className="bg-[var(--color-surface)]/80 border border-[var(--color-border)] rounded-lg p-4 sm:p-5">
                            <h3 className="font-black text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                                <Target size={18} className="text-[var(--color-accent-cobalt)]" />
                                <span>רקע והשערות מבחן</span>
                            </h3>
                            <p className="text-[var(--color-text-secondary)]">
                                <span className="text-[var(--color-text-primary)] font-bold">Wunderlich</span> קבע ב-1868 ש-<span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="37.0^\circ C" /></span> היא נקודת הייחוס לחום גוף תקין. Mackowiak בדק מחדש אם ממוצע חום הגוף באוכלוסייה נמוך מהקונצנזוס הזה.
                            </p>
                            <p className="mt-3 text-[var(--color-text-secondary)]">
                                המדגם כלל <span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="n = 148" /></span> נבדקים בריאים; ממוצע המדגם <span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="\bar{X} = 36.82^\circ C" /></span> הושווה ל-<span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="\mu_0 = 37.0^\circ C" /></span> באמצעות מבחן Z לתוחלת.
                            </p>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)]/40 p-3">
                                    <div className="text-[var(--color-text-secondary)] mb-1">השערת אפס</div>
                                    <div className="text-[var(--color-text-primary)] font-black" dir="ltr"><InlineMath math="H_0: \mu = 37.0" /></div>
                                </div>
                                <div className="rounded-md border border-[var(--color-accent-cobalt-line)]/40 bg-[var(--color-accent-cobalt-bg)]/10 p-3">
                                    <div className="text-[var(--color-text-secondary)] mb-1">השערת מחקר</div>
                                    <div className="text-[var(--color-text-primary)] font-black" dir="ltr"><InlineMath math="H_1: \mu < 37.0" /></div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-[var(--color-surface)]/80 border border-[var(--color-border)] rounded-lg p-4 sm:p-5">
                            <h3 className="font-black text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                                <Calculator size={18} className="text-[var(--color-accent-brass)]" />
                                <span>נתונים יבשים</span>
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    ['תוחלת של השערת האפס', '\\mu_0 = 37.0^\\circ C'],
                                    ['ממוצע מדגם', '\\bar{X} = 36.82^\\circ C'],
                                    ['סטיית תקן', '\\sigma = 0.41'],
                                    ['גודל מדגם', 'n = 148'],
                                ].map(([label, math]) => (
                                    <div key={label} className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)]/40 p-3">
                                        <div className="text-[var(--color-text-secondary)] text-xs">{label}</div>
                                        <div className="text-[var(--color-text-primary)] font-black font-mono" dir="ltr"><InlineMath math={math} /></div>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-3 text-[var(--color-text-secondary)]">
                                <span className="text-[var(--color-text-primary)] font-bold">מבחן שמאלי</span>, רמת מובהקות <span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="\alpha = 5\%" /></span>.
                            </p>
                        </section>
                    </div>

                    <div className="relative grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-5 text-sm leading-relaxed">
                        <section className="bg-[var(--color-surface)]/80 border border-[var(--color-border)] rounded-lg p-4 sm:p-5">
                            <h3 className="font-black text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                                <Percent size={18} className="text-[var(--color-accent-brass)]" />
                                <span>מובהקות</span>
                            </h3>
                            <p className="text-[var(--color-text-secondary)]">
                                ברירת המחדל היא <span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="\alpha = 5\%" /></span>, אבל התוצאה רחוקה מספיק מ-<span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="37.0^\circ C" /></span> כך שגם רמות מובהקות מחמירות יותר עדיין מובילות לדחיית <span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="H_0" /></span>.
                            </p>
                        </section>

                        <section className="bg-[var(--color-surface)]/80 border border-[var(--color-success)]/30 rounded-lg p-4 sm:p-5">
                            <h3 className="font-black text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                                <CheckCircle size={18} className="text-[var(--color-success)]" />
                                <span>מסקנה</span>
                            </h3>
                            <p className="text-[var(--color-text-secondary)]">
                                <span className="text-[var(--color-text-primary)] font-bold">התוצאה מובהקת מאוד</span>: המדגם תומך ב-<span className="text-[var(--color-text-primary)] font-bold">דחיית השערת האפס</span> ובהערכה שחום הגוף הממוצע קרוב ל-<span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="36.8^\circ C" /></span>. גם רמות מובהקות מחמירות מ-<span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="5\%" /></span> עדיין יובילו לדחייה במקרה הזה.
                            </p>
                        </section>
                    </div>

                    <div className="relative bg-[var(--color-surface)]/80 border border-[var(--color-accent-cobalt-line)]/40 rounded-lg p-4 text-sm text-[var(--color-text-secondary)]">
                        <span className="font-black text-[var(--color-text-primary)] inline-flex items-center gap-2">
                            <BookOpen size={17} className="text-[var(--color-accent-cobalt)]" />
                            קישור למקור:
                        </span>{' '}
                        <a
                            href="https://jamanetwork.com/journals/jama/fullarticle/400116"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[var(--color-accent-cobalt)] hover:text-[var(--color-accent-cobalt)]/80 underline decoration-dotted underline-offset-4"
                        >
                            Philip A. Mackowiak, Steven S. Wasserman, Myron M. Levine; JAMA, 1992; DOI: 10.1001/jama.1992.03490120092034
                            <ExternalLink size={14} />
                        </a>
                    </div>
                </div>
            </AnimatedDetails>

            {/* Parameters Input Card */}
            <div className="tour-step-inputs rounded-lg p-5 md:p-6 border shadow-md transition-colors bg-[var(--color-surface)] border-[var(--color-border)]">
                <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-4 mb-5">
                    <div className="bg-[var(--color-accent-cobalt-bg)]/20 p-2 rounded-lg text-[var(--color-accent-cobalt)]"><Sliders size={20} /></div>
                    <h3 className="text-lg sm:text-xl font-black text-[var(--color-text-primary)]">
                        פרמטרים והשערות מחקר
                    </h3>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="w-full">
                        {/* Custom Parameters Table Layout */}
                        <div className="overflow-visible rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition-all" dir="rtl">
                            <table className="w-full border-collapse border-spacing-0">
                                <thead>
                                    <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                                        <th className="relative overflow-hidden p-3.5 font-black text-xs sm:text-sm text-[var(--color-text-primary)] w-1/3 border-l border-[var(--color-border)]">
                                            {/* Watermark */}
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-12 opacity-10 pointer-events-none select-none text-4xl sm:text-5xl font-mono text-[var(--color-accent-cobalt)]">
                                                <InlineMath math="H_0" />
                                            </div>
                                            <div className="relative z-10 flex flex-col xl:flex-row items-center justify-center gap-2">
                                                <div className="flex items-center gap-1.5 justify-center">
                                                    <span>השערת האפס</span>
                                                </div>
                                                {/* varianceKnown toggle removed from here */}
                                            </div>
                                        </th>
                                        <th className="p-3.5 text-center font-black text-xs sm:text-sm text-[var(--color-text-primary)] w-1/3 border-l border-[var(--color-border)]">
                                            מדגם
                                        </th>
                                        <th className="relative overflow-hidden p-3.5 text-center font-black text-xs sm:text-sm text-[var(--color-text-primary)] w-1/3">
                                            {/* Watermark */}
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-12 opacity-10 pointer-events-none select-none text-4xl sm:text-5xl font-mono text-[var(--color-accent-teal)]">
                                                <InlineMath math="H_1" />
                                            </div>
                                            <InputTooltip content="תחת הנחת סטיית תקן זהה, אם ידועה">
                                                <div className="relative z-10 flex items-center gap-1.5 justify-center cursor-help">
                                                    <span>השערת המחקר</span>
                                                </div>
                                            </InputTooltip>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Row 1: mu0, sample statistic, and H1 value */}
                                    <tr className="border-b border-[var(--color-border)]">
                                        <td className="relative overflow-hidden p-3 align-middle border-l border-[var(--color-border)] bg-[var(--color-surface-raised)]">
                                            <CellWatermark math="\mu_0" colorClass="text-[var(--color-accent-cobalt)]" />
                                            <div className="relative z-10 flex items-center justify-center gap-3 ctrl-cell-wrapper w-full">
                                                <InputTooltip content={<span>תוחלת אוכלוסיית הבסיס (השערת האפס <InlineMath math="H_0" />)</span>}>
                                                    <span className="w-28 sm:w-32 text-left text-sm sm:text-base text-[var(--color-text-primary)]/90 font-bold shrink-0 cursor-help border-b border-dotted border-[var(--color-border)] flex items-center justify-end gap-1">
                                                        <span>תוחלת (</span><InlineMath math="\mu_0" /><span>):</span>
                                                    </span>
                                                </InputTooltip>
                                                <div className="w-16 sm:w-20 shrink-0 relative">
                                                    <input
                                                        type="text"
                                                        value={mu0Input}
                                                        onChange={(e) => handleMu0Change(e.target.value)}
                                                        className={`w-full bg-[var(--color-surface)] border px-2 py-1 font-mono font-bold text-center text-lg sm:text-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 placeholder:font-medium placeholder:text-base outline-none transition-all rounded shadow-inner focus:border-[var(--color-accent-cobalt)] focus:ring-2 focus:ring-[var(--color-accent-cobalt)]/20 ${(!mu0Input || errors.mu0) ? 'border-[var(--color-error)] ring-2 ring-[var(--color-error)]/20 text-[var(--color-error)]' : 'border-[var(--color-border)]'
                                                            }`}
                                                        placeholder=""
                                                        dir="ltr"
                                                    />
                                                    <AnimatePresence>
                                                        {errors.mu0 && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -5 }}
                                                                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[var(--color-error)] text-white text-xs font-bold rounded shadow-lg flex items-center justify-center whitespace-nowrap z-50 pointer-events-none"
                                                            >
                                                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--color-error)] rotate-45"></div>
                                                                <span className="relative z-10">{errors.mu0}</span>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="relative overflow-hidden p-3 align-middle border-l border-[var(--color-border)] bg-[var(--color-surface-raised)]">
                                            <CellWatermark math={statSymbol} colorClass="text-[var(--color-accent-brass)]" />
                                            <div className="relative z-10 flex items-center justify-center gap-3 ctrl-cell-wrapper w-full">
                                                <InputTooltip content={sampleStatisticTooltip}>
                                                    <span className="w-28 sm:w-32 text-left text-sm sm:text-base text-[var(--color-text-primary)]/90 font-bold shrink-0 cursor-help border-b border-dotted border-[var(--color-border)] flex items-center justify-end gap-1">
                                                        <span>{sampleStatisticLabel} (</span><InlineMath math={statSymbol} /><span>):</span>
                                                    </span>
                                                </InputTooltip>
                                                <div className="w-16 sm:w-20 shrink-0 relative">
                                                    <input
                                                        type="text"
                                                        value={mu1Input}
                                                        onChange={(e) => handleMu1Change(e.target.value)}
                                                        className={`w-full bg-[var(--color-surface)] border px-2 py-1 font-mono font-bold text-center text-lg sm:text-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 placeholder:font-medium placeholder:text-base outline-none transition-all rounded shadow-inner focus:border-[var(--color-accent-cobalt)] focus:ring-2 focus:ring-[var(--color-accent-cobalt)]/20 ${(!mu1Input || errors.mu1) ? 'border-[var(--color-error)] ring-2 ring-[var(--color-error)]/20 text-[var(--color-error)]' : 'border-[var(--color-border)]'
                                                            }`}
                                                        placeholder=""
                                                        dir="ltr"
                                                    />
                                                    <AnimatePresence>
                                                        {errors.mu1 && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -5 }}
                                                                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[var(--color-error)] text-white text-xs font-bold rounded shadow-lg flex items-center justify-center whitespace-nowrap z-50 pointer-events-none"
                                                            >
                                                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--color-error)] rotate-45"></div>
                                                                <span className="relative z-10">{errors.mu1}</span>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`relative overflow-hidden p-3 align-middle bg-[var(--color-surface-raised)] transition-all ${!calculatePower ? 'opacity-30' : ''}`}>
                                            <CellWatermark math="\mu_1" colorClass="text-[var(--color-accent-teal)]" />
                                            <div className="relative z-10 flex items-center justify-center gap-3 ctrl-cell-wrapper w-full">
                                                <InputTooltip content={<span>התוחלת המשוערת תחת השערת המחקר האלטרנטיבית (<InlineMath math="H_1" />)</span>}>
                                                    <span className={`w-28 sm:w-32 text-left text-sm sm:text-base font-bold shrink-0 cursor-help border-b border-dotted border-[var(--color-border)] flex items-center justify-end gap-1 ${!calculatePower ? 'text-[var(--color-text-primary)] opacity-50' : 'text-[var(--color-text-primary)]/90'}`}>
                                                        <span>ממוצע (</span><InlineMath math="\mu_1" /><span>):</span>
                                                    </span>
                                                </InputTooltip>
                                                <div className="w-16 sm:w-20 shrink-0 relative">
                                                    <input
                                                        type="text"
                                                        value={muH1Input}
                                                        disabled={!calculatePower}
                                                        onChange={(e) => handleMuH1Change(e.target.value)}
                                                        className={`w-full bg-[var(--color-surface)] border px-2 py-1 font-mono font-bold text-center text-lg sm:text-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 placeholder:font-medium placeholder:text-base outline-none transition-all rounded shadow-inner focus:border-[var(--color-accent-cobalt)] focus:ring-2 focus:ring-[var(--color-accent-cobalt)]/20 ${!calculatePower ? 'opacity-40 cursor-not-allowed border-transparent' : ''
                                                            } ${calculatePower && (!muH1Input || errors.muH1) ? 'border-[var(--color-error)] ring-2 ring-[var(--color-error)]/20 text-[var(--color-error)]' : calculatePower ? 'border-[var(--color-border)]' : ''}`}
                                                        placeholder=""
                                                        dir="ltr" />
                                                    <AnimatePresence>
                                                        {calculatePower && errors.muH1 && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -5 }}
                                                                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[var(--color-error)] text-white text-xs font-bold rounded shadow-lg flex items-center justify-center whitespace-nowrap z-50 pointer-events-none"
                                                            >
                                                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--color-error)] rotate-45"></div>
                                                                <span className="relative z-10">{errors.muH1}</span>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Row 2: sigma, n, and power toggle */}
                                    <tr>
                                        <td className="relative overflow-hidden p-3 align-middle border-l border-[var(--color-border)] bg-[var(--color-surface-raised)] transition-all">
                                            <CellWatermark math="\sigma" colorClass="text-[var(--color-accent-cobalt)]" />
                                            <div className="relative z-10 flex items-center justify-center gap-3 ctrl-cell-wrapper w-full">
                                                <InputTooltip content="סטיית התקן של אוכלוסיית הבסיס (אם ידועה)">
                                                    <span className="w-28 sm:w-32 text-left text-sm sm:text-base text-[var(--color-text-primary)]/90 font-bold shrink-0 cursor-help border-b border-dotted border-[var(--color-border)] flex items-center justify-end gap-1">
                                                        <span>סטיית תקן (</span><InlineMath math="\sigma" /><span>):</span>
                                                    </span>
                                                </InputTooltip>
                                                <div className="w-16 sm:w-20 shrink-0 relative">
                                                    <input
                                                        data-testid="parameter-sigma-input"
                                                        type="text"
                                                        value={sigmaInput}
                                                        onChange={(e) => handleSigmaChange(e.target.value)}
                                                        className={`w-full bg-[var(--color-surface)] border px-2 py-1 font-mono font-bold text-center text-lg sm:text-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 placeholder:font-medium placeholder:text-base outline-none transition-all rounded shadow-inner focus:border-[var(--color-accent-cobalt)] focus:ring-2 focus:ring-[var(--color-accent-cobalt)]/20 ${(!sigmaInput || errors.sigma) ? 'border-[var(--color-error)] ring-2 ring-[var(--color-error)]/20 text-[var(--color-error)]' : 'border-[var(--color-border)]'
                                                            }`}
                                                        placeholder=""
                                                        dir="ltr"
                                                    />
                                                    <AnimatePresence>
                                                        {errors.sigma && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -5 }}
                                                                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[var(--color-error)] text-white text-xs font-bold rounded shadow-lg flex items-center justify-center whitespace-nowrap z-50 pointer-events-none"
                                                            >
                                                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--color-error)] rotate-45"></div>
                                                                <span className="relative z-10">{errors.sigma}</span>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="relative overflow-hidden p-3 align-middle border-l border-[var(--color-border)] bg-[var(--color-surface-raised)]">
                                            <CellWatermark math="n" colorClass="text-[var(--color-accent-brass)]" />
                                            <div className="relative z-10 flex items-center justify-center gap-3 ctrl-cell-wrapper w-full">
                                                <InputTooltip content={<span>מספר התצפיות במדגם (<InlineMath math="n" />)</span>}>
                                                    <span className={`w-28 sm:w-32 text-left text-sm sm:text-base text-[var(--color-text-primary)]/90 font-bold shrink-0 cursor-help border-b border-dotted border-[var(--color-border)] flex items-center justify-end gap-1 ${testType === 'single' ? 'opacity-30' : ''}`}>
                                                        <span>גודל מדגם (</span><InlineMath math="n" /><span>):</span>
                                                    </span>
                                                </InputTooltip>
                                                <div className="w-16 sm:w-20 shrink-0 relative">
                                                    <input
                                                        type="text"
                                                        value={testType === 'single' ? '1' : nInput}
                                                        disabled={testType === 'single'}
                                                        onChange={(e) => handleNChange(e.target.value)}
                                                        className={`w-full bg-[var(--color-surface)] border px-2 py-1 font-mono font-bold text-center text-lg sm:text-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 placeholder:font-medium placeholder:text-base outline-none transition-all rounded shadow-inner focus:border-[var(--color-accent-cobalt)] focus:ring-2 focus:ring-[var(--color-accent-cobalt)]/20 ${testType === 'single' ? 'opacity-40 cursor-not-allowed bg-[var(--color-surface-raised)]/5 border-transparent' : ''
                                                            } ${testType !== 'single' && (!nInput || errors.n) ? 'border-[var(--color-error)] ring-2 ring-[var(--color-error)]/20 text-[var(--color-error)]' : testType !== 'single' ? 'border-[var(--color-border)]' : ''}`}
                                                        placeholder=""
                                                        dir="ltr"
                                                    />
                                                    <AnimatePresence>
                                                        {errors.n && testType !== 'single' && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -5 }}
                                                                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[var(--color-error)] text-white text-xs font-bold rounded shadow-lg flex items-center justify-center whitespace-nowrap z-50 pointer-events-none"
                                                            >
                                                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--color-error)] rotate-45"></div>
                                                                <span className="relative z-10">{errors.n}</span>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="relative overflow-hidden p-3 align-middle bg-[var(--color-surface-raised)]">
                                            <CellWatermark math="1-\beta" colorClass="text-[var(--color-accent-teal)]" />
                                            <div className="relative z-10 flex items-center justify-center gap-3 ctrl-cell-wrapper w-full">
                                                <span className="w-36 sm:w-44 text-left text-sm sm:text-base text-[var(--color-text-primary)]/90 font-bold shrink-0 flex items-center justify-end gap-1 whitespace-nowrap">
                                                    <span>חישוב עוצמה (</span><InlineMath math="1-\beta" /><span>)</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setCalculatePower(!calculatePower)}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${calculatePower ? 'bg-[var(--color-accent-cobalt-bg-hover)]' : 'bg-[var(--color-surface-raised)]/80'
                                                        }`}
                                                >
                                                    <span
                                                        className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${calculatePower ? '-translate-x-5' : 'translate-x-0'
                                                            }`}
                                                    >
                                                        {calculatePower ? (
                                                            <div className="w-[2px] h-[10px] bg-[var(--color-accent-cobalt-bg-hover)] rounded-full" />
                                                        ) : (
                                                            <div className="w-2.5 h-2.5 rounded-full border-2 border-[var(--color-border)]" />
                                                        )}
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>


                    </div>
                    {/* Main Test Parameter Selector */}
                    <div className="tour-step-test-type flex flex-col sm:flex-row items-center gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-lg">
                        <span className="text-sm font-black text-[var(--color-text-primary)] text-right shrink-0">הפרמטר:</span>
                        <div className="grid grid-cols-3 gap-3 w-full">
                            {[
                                { id: 'single', label: <span>תצפית <InlineMath math="X" /></span> },
                                { id: 'mean', label: <span>ממוצע <InlineMath math="\bar{X}" /></span> },
                                { id: 'sum', label: <span>סכום <InlineMath math="\Sigma X" /></span> }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setTestType(item.id as TestType)}
                                    className={`py-3 px-4 rounded-sm text-xs sm:text-sm font-black transition-all text-center border ${testType === item.id
                                        ? 'bg-[var(--color-accent-cobalt-bg-hover)] text-white border-[var(--color-accent-cobalt-line)] shadow-md scale-[1.02]'
                                        : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:bg-[var(--color-surface)]'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* RIGHT Column - Dashboard & Visual Analytics */}
                <div className="contents">

                    {/* Overlapping Curves Chart */}
                    <div className="tour-step-graph rounded-lg p-4 md:p-5 border shadow-md transition-all bg-[var(--color-surface)] border-[var(--color-border)] w-full min-w-0 order-1 lg:order-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 border-b border-[var(--color-border)] pb-3 mb-3">
                            <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
                                <span className="flex items-center gap-1.5 font-black text-[var(--color-accent-brass)] select-none">
                                    <span className="w-3 h-3 rounded-none bg-[var(--color-accent-brass)] inline-block" />
                                    <InlineMath math="H_0" />
                                </span>
                                <span className={`flex items-center gap-1.5 font-black transition-all cursor-pointer select-none ${calculatePower ? 'text-[var(--color-accent-teal)]' : 'text-[var(--color-text-primary)] opacity-60 hover:opacity-100'}`} onClick={() => setCalculatePower(!calculatePower)}>
                                    <span className={`w-3 h-3 rounded-none inline-block ${calculatePower ? 'bg-[var(--color-accent-teal)]' : 'bg-[var(--color-surface-raised)]/80'}`} />
                                    <InlineMath math="H_1" />
                                </span>
                                <span className="flex items-center gap-1.5 font-black text-[var(--color-accent-crimson)] select-none">
                                    <span className="w-3 h-3 rounded-none bg-[var(--color-accent-crimson)]/60 border border-[var(--color-accent-crimson)] inline-block" />
                                    <InlineMath math="\alpha" />
                                </span>
                                <span className="flex items-center gap-1.5 font-black text-[var(--color-accent-crimson)] select-none">
                                    <span className="w-0.5 h-3 bg-[var(--color-accent-crimson)] inline-block" />
                                    <InlineMath math="C" /> קריטי
                                </span>
                                <span className={`flex items-center gap-1.5 font-black transition-all select-none ${calculatePower ? 'text-[var(--color-accent-teal)]' : 'hidden opacity-0'}`}>
                                    <span className="w-3 h-3 rounded-none bg-[var(--color-accent-teal)]/30 border border-[var(--color-accent-teal)] inline-block" />
                                    <InlineMath math="1-\beta" />
                                </span>
                            </div>
                        </div>

                        {isValid && stats ? (
                            <div className="h-[305px] w-full mt-2" dir="ltr">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 25 }}>
                                        <defs>
                                            <linearGradient id="h0Color" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={'var(--color-accent-brass)'} stopOpacity={0.1} />
                                                <stop offset="95%" stopColor={'var(--color-accent-brass)'} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="h1Color" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-accent-teal)" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="var(--color-accent-teal)" stopOpacity={0} />
                                            </linearGradient>
                                            {(() => {
                                                if (!stats || !isValid || !chartLimits) return null;
                                                const { c1, c2 } = stats;
                                                const { xMin, xMax } = chartLimits;

                                                const pct = (x: number) => {
                                                    const p = ((x - xMin) / (xMax - xMin)) * 100;
                                                    return Math.max(0, Math.min(100, p));
                                                };

                                                if (tailType === 'right') {
                                                    const c2Pct = pct(c2);
                                                    return (
                                                        <linearGradient id="rejectionGradient" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="var(--color-accent-crimson)" stopOpacity={0} />
                                                            <stop offset={c2Pct + "%"} stopColor="var(--color-accent-crimson)" stopOpacity={0} />
                                                            <stop offset={(c2Pct + 0.001) + "%"} stopColor="var(--color-accent-crimson)" stopOpacity={0.95} />
                                                            <stop offset="100%" stopColor="var(--color-accent-crimson)" stopOpacity={0.95} />
                                                        </linearGradient>
                                                    );
                                                } else if (tailType === 'left') {
                                                    const c2Pct = pct(c2);
                                                    return (
                                                        <linearGradient id="rejectionGradient" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="var(--color-accent-crimson)" stopOpacity={0.95} />
                                                            <stop offset={c2Pct + "%"} stopColor="var(--color-accent-crimson)" stopOpacity={0.95} />
                                                            <stop offset={(c2Pct + 0.001) + "%"} stopColor="var(--color-accent-crimson)" stopOpacity={0} />
                                                            <stop offset="100%" stopColor="var(--color-accent-crimson)" stopOpacity={0} />
                                                        </linearGradient>
                                                    );
                                                } else { // two-tailed
                                                    const c1Pct = pct(c1);
                                                    const c2Pct = pct(c2);
                                                    return (
                                                        <linearGradient id="rejectionGradient" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="var(--color-accent-crimson)" stopOpacity={0.95} />
                                                            <stop offset={c1Pct + "%"} stopColor="var(--color-accent-crimson)" stopOpacity={0.95} />
                                                            <stop offset={(c1Pct + 0.001) + "%"} stopColor="var(--color-accent-crimson)" stopOpacity={0} />
                                                            <stop offset={c2Pct + "%"} stopColor="var(--color-accent-crimson)" stopOpacity={0} />
                                                            <stop offset={(c2Pct + 0.001) + "%"} stopColor="var(--color-accent-crimson)" stopOpacity={0.95} />
                                                            <stop offset="100%" stopColor="var(--color-accent-crimson)" stopOpacity={0.95} />
                                                        </linearGradient>
                                                    );
                                                }
                                            })()}
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={'var(--chart-grid)'} />

                                        <XAxis
                                            dataKey="x"
                                            type="number"
                                            domain={[chartLimits.xMin, chartLimits.xMax]}
                                            ticks={xAxisTicks}
                                            tick={(props: any) => {
                                                const { x, y, payload } = props;
                                                const val = payload.value;
                                                let fill = 'var(--chart-axis-label)';
                                                
                                                if (Math.abs(val - stats.effectH0Mean) < 1e-4) {
                                                    fill = 'var(--color-accent-brass)';
                                                } else if (calculatePower && Math.abs(val - stats.effectH1Mean) < 1e-4) {
                                                    fill = 'var(--color-accent-teal)';
                                                }
                                                
                                                return (
                                                    <g transform={`translate(${x},${y})`}>
                                                        <text x={0} y={0} dy={16} textAnchor="middle" fill={fill} fontSize={15} fontWeight="bold">
                                                            {val.toFixed(2)}
                                                        </text>
                                                    </g>
                                                );
                                            }}
                                            axisLine={{ stroke: 'var(--chart-grid)' }}
                                            tickLine={true}
                                            tickFormatter={(val) => val.toFixed(2)}
                                        />
                                        <YAxis
                                            tickFormatter={(val) => val.toFixed(2)}
                                            tick={{ fill: 'var(--chart-axis-label)', fontSize: 12, fontWeight: 'bold' }}
                                            axisLine={{ stroke: 'var(--chart-grid)' }}
                                            tickLine={true}
                                            width={45}
                                        />
                                        <RechartsTooltip content={<CustomChartTooltip />} />

                                        {/* H0 Curve Base Area */}
                                        <Area
                                            type="monotone"
                                            dataKey="pdfH0"
                                            stroke={'var(--color-accent-brass)'}
                                            strokeWidth={2}
                                            fill="url(#h0Color)"
                                            dot={false}
                                            isAnimationActive={true}
                                        />

                                        {/* H1 Curve Base Area */}
                                        {calculatePower && (
                                            <Area
                                                type="monotone"
                                                dataKey="pdfH1"
                                                stroke="var(--color-accent-teal)"
                                                strokeWidth={2}
                                                fill="url(#h1Color)"
                                                dot={false}
                                                isAnimationActive={true}
                                            />
                                        )}

                                        {/* Shaded Emerald Layer for Power Area */}
                                        {calculatePower && (
                                            <Area
                                                type="monotone"
                                                dataKey="powerShade"
                                                stroke="none"
                                                fill={'var(--color-accent-teal)'}
                                                fillOpacity={0.35}
                                                dot={false}
                                                isAnimationActive={false}
                                            />
                                        )}

                                        {/* Shaded Red Layer for Alpha Area (Type I) */}
                                        <Area
                                            type="monotone"
                                            dataKey="alphaShade"
                                            stroke="none"
                                            fill="url(#rejectionGradient)"
                                            dot={false}
                                            isAnimationActive={false}
                                        />



                                        {/* Vertical Reference Line at Mean of H0 */}
                                        <ReferenceLine
                                            x={stats.effectH0Mean}
                                            stroke="var(--color-accent-brass)"
                                            strokeWidth={1.5}
                                            strokeDasharray="10 4"
                                            label={({ viewBox }: any) => (
                                                <foreignObject x={viewBox.x - 20} y={viewBox.y + viewBox.height + 25} width={40} height={30} style={{ overflow: 'visible' }}>
                                                    <div style={{ color: "var(--color-accent-brass)", fontSize: 15, fontWeight: "bold", textAlign: "center", direction: "ltr" }}>
                                                        <InlineMath math="\mu_0" />
                                                    </div>
                                                </foreignObject>
                                            )}
                                        />

                                        {/* Vertical Reference Line at Mean of H1 */}
                                        <ReferenceLine
                                            x={stats.effectH1Mean}
                                            stroke="var(--color-accent-teal)"
                                            strokeWidth={1.5}
                                            strokeDasharray="10 4"
                                            label={calculatePower ? ({ viewBox }: any) => (
                                                <foreignObject x={viewBox.x - 20} y={viewBox.y + viewBox.height + 25} width={40} height={30} style={{ overflow: 'visible' }}>
                                                    <div style={{ color: "var(--color-accent-teal)", fontSize: 15, fontWeight: "bold", textAlign: "center", direction: "ltr" }}>
                                                        <InlineMath math="\mu_1" />
                                                    </div>
                                                </foreignObject>
                                            ) : undefined}
                                        />

                                        {/* Vertical LINE for SELECTOR: Critical Values */}
                                        {tailType === 'two-tailed' ? (
                                            <>
                                                <ReferenceLine
                                                    x={stats.c1}
                                                    stroke="var(--color-accent-crimson)"
                                                    strokeWidth={2.5}
                                                    label={({ viewBox }: any) => (
                                                        <foreignObject x={viewBox.x - 40} y={viewBox.y - 25} width={80} height={30} style={{ overflow: 'visible' }}>
                                                            <div style={{ color: "var(--color-accent-crimson)", fontSize: 13, fontWeight: "bold", textAlign: "center", direction: "ltr" }}>
                                                                <InlineMath math={`C_1: ${stats.c1.toFixed(2)}`} />
                                                            </div>
                                                        </foreignObject>
                                                    )}
                                                />
                                                <ReferenceLine
                                                    x={stats.c2}
                                                    stroke="var(--color-accent-crimson)"
                                                    strokeWidth={2.5}
                                                    label={({ viewBox }: any) => (
                                                        <foreignObject x={viewBox.x - 40} y={viewBox.y - 25} width={80} height={30} style={{ overflow: 'visible' }}>
                                                            <div style={{ color: "var(--color-accent-crimson)", fontSize: 13, fontWeight: "bold", textAlign: "center", direction: "ltr" }}>
                                                                <InlineMath math={`C_2: ${stats.c2.toFixed(2)}`} />
                                                            </div>
                                                        </foreignObject>
                                                    )}
                                                />
                                            </>
                                        ) : (
                                            <ReferenceLine
                                                x={stats.c2}
                                                stroke="var(--color-accent-crimson)"
                                                strokeWidth={3}
                                                label={({ viewBox }: any) => (
                                                    <foreignObject x={viewBox.x - 40} y={viewBox.y - 25} width={80} height={30} style={{ overflow: 'visible' }}>
                                                        <div style={{ color: "var(--color-accent-crimson)", fontSize: 14, fontWeight: "bold", textAlign: "center", direction: "ltr" }}>
                                                            <InlineMath math={`C: ${stats.c2.toFixed(2)}`} />
                                                        </div>
                                                    </foreignObject>
                                                )}
                                            />
                                        )}

                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="py-24 text-center text-[var(--color-accent-crimson)] text-[var(--color-error)] font-black text-lg md:text-xl">
                                נא לתקן את שגיאות הקלטים בצד ימין על מנת להציג את הגרף.
                            </div>
                        )}
                    </div>

                    {/* Solutions Steps Accordion / Panel */}
                    
                    <div className="tour-step-accordion-ht rounded-lg border shadow-md transition-all overflow-hidden bg-[var(--color-surface)] border-[var(--color-border)] w-full min-w-0 lg:col-span-2 order-3 lg:order-3">
                        
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setShowHypothesisTesting(!showHypothesisTesting)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    setShowHypothesisTesting(!showHypothesisTesting);
                                }
                            }}
                            className="relative overflow-hidden w-full px-8 py-5.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-black text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors border-b border-[var(--color-border)]"
                        > 
                                        <div className="flex justify-end gap-3 lg:col-span-2 order-2 lg:order-2 mb-2">
                        <button 
                            onClick={(event) => {
                                event.stopPropagation();
                                setShowHypothesisTesting(true);
                                setShowCI(true);
                                setShowPower(true);
                            }}
                            className="px-4 py-2 text-sm font-bold bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-md hover:bg-[var(--color-surface)] transition-colors shadow-sm flex items-center gap-2"
                        >
                            <ChevronDown size={16} />
                            הרחב הכל
                        </button>
                        <button 
                            onClick={(event) => {
                                event.stopPropagation();
                                setShowHypothesisTesting(false);
                                setShowCI(false);
                                setShowPower(false);
                            }}
                            className="px-4 py-2 text-sm font-bold bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-md hover:bg-[var(--color-surface)] transition-colors shadow-sm flex items-center gap-2"
                        >
                            <ChevronUp size={16} />
                            צמצם הכל
                        </button>
                          <div className="relative z-10 flex items-center self-end sm:self-auto gap-4">
                                <div className="text-[var(--color-text-secondary)]">
                                    {showHypothesisTesting ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                </div>
                            </div>
                    </div>
                            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" dir="ltr">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-12 opacity-10 text-4xl sm:text-5xl font-mono text-[var(--color-accent-crimson)]">
                                    <InlineMath math="H_0" />
                                </div>
                                <div className="absolute left-1/4 top-1/2 -translate-y-1/2 rotate-6 opacity-10 text-4xl sm:text-5xl font-mono text-[var(--color-accent-cobalt)]">
                                    <InlineMath math="H_1" />
                                </div>
                                <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -rotate-6 opacity-10 text-4xl sm:text-5xl font-mono text-[var(--color-accent-teal)]">
                                    <InlineMath math="\\bar{X}" />
                                </div>
                                <div className="absolute right-1/4 top-1/2 -translate-y-1/2 rotate-12 opacity-10 text-5xl sm:text-6xl font-mono text-[var(--color-accent-violet)]">
                                    <InlineMath math="P" />
                                </div>
                            </div>
                            
                            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 text-right">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[var(--color-accent-cobalt-bg)]/20 p-2 rounded-lg text-[var(--color-accent-cobalt)]"><Calculator size={24} /></div>
                                    <span className="text-xl sm:text-2xl font-black flex items-center flex-wrap gap-2">
                                        בדיקת השערות
                                        <span className="text-base sm:text-lg font-serif text-[var(--color-text-secondary)] opacity-80" dir="ltr">
                                            <InlineMath math={String.raw`\text{Hypothesis Testing}`} />
                                        </span>
                                    </span>
                                </div>
                                {isValid && decisionData && (
                                    <div className="mr-0 sm:mr-3 flex items-center shrink-0 z-20">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!showHypothesisTesting) {
                                                    setShowHypothesisTesting(true);
                                                    setTimeout(() => {
                                                        document.getElementById('step-6')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    }, 350);
                                                } else {
                                                    document.getElementById('step-6')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                }
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm sm:text-base font-black bg-[var(--color-surface)] hover:bg-[var(--color-accent-cobalt-bg)] text-[var(--color-text-primary)] hover:text-[var(--color-accent-cobalt)] border border-[var(--color-border)] shadow-md transition-all duration-300 leading-none group"
                                        >
                                            <span>קפיצה למסקנה</span>
                                            <Target size={18} className="shrink-0 text-[var(--color-accent-cobalt)] group-hover:scale-110 transition-transform" />
                                        
                                        </button>
                                    </div>
                                )}
                            </div>
                          
                            
                        </div>
                        

                        <AnimatePresence initial={false}>
                            {showHypothesisTesting && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-8 py-6.5 text-base flex flex-col gap-4">

                                        {/* Step 1: Hypothesis Formulation */}
                                        <AnimatedDetails className="group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm [&_summary::-webkit-details-marker]:hidden">

                                            <summary className="p-4 sm:p-5 flex items-center justify-between cursor-pointer list-none hover:bg-[var(--color-surface)]/50 transition-colors rounded-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                                                <div className="flex items-center gap-3 font-extrabold text-[var(--color-accent-brass)]">
                                                    <span className="w-9 h-9 rounded-full bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-accent-brass)]/20 text-[var(--color-accent-brass)] text-base font-black flex items-center justify-center border border-[var(--color-accent-brass)]/50 shrink-0">1</span>
                                                    <span className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">ניסוח השערות המחקר</span>
                                                </div>
                                                <div className="text-[var(--color-text-secondary)] group-[.is-open]:rotate-180 transition-transform duration-300">
                                                    <ChevronDown size={24} />
                                                </div>
                                            </summary>
                                            <div className="p-5 sm:p-6 space-y-4">


                                                <div className="pr-5 py-1 space-y-4">
                                                    <p className="text-base sm:text-lg text-[var(--color-text-primary)] leading-relaxed font-semibold">
                                                        יהי <InlineMath math="X" /> משתנה מקרי המייצג את התצפית באוכלוסייה. אנו בוחנים מדגם מקרי בגודל <InlineMath math="n" />.
                                                        נגדיר את השערת האפס (<InlineMath math="H_0" />) המניחה <span className="font-bold underline">היעדר שינוי</span>, מול השערת המחקר (<InlineMath math="H_1" />) המייצגת את טענת החוקר.
                                                    </p>


                                                    {/* Interactive Hypothesis Builder */}
                                                    <div className="flex flex-col items-center justify-center gap-4 py-4 w-full">
                                                        <p className="text-sm text-[var(--color-text-secondary)] font-medium">
                                                            לחץ על הסימן הלוגי ( <InlineMath math="<, >, \neq" /> ) במשוואה כדי לשנות את כיוון המבחן.
                                                        </p>
                                                        {(() => {
                                                            let parameterSymbol = '\\mu';
                                                            let h0Val = mu0Input;
                                                            let nullValueSymbol = '\\mu_0';

                                                            if (testType === 'sum') {
                                                                parameterSymbol = 'E(\\sum X)';
                                                                nullValueSymbol = 'n \\cdot \\mu_0';
                                                                const parsedMu0 = parseFloat(mu0Input);
                                                                const parsedN = parseInt(nInput, 10);
                                                                if (!isNaN(parsedMu0) && !isNaN(parsedN)) {
                                                                    h0Val = (parsedN * parsedMu0).toString();
                                                                } else {
                                                                    h0Val = 'n \\cdot \\mu_0';
                                                                }
                                                            }

                                                            let h0Symbol = '=';
                                                            let h1Symbol = '\\neq';

                                                            if (tailType === 'right') {
                                                                h0Symbol = '\\le';
                                                                h1Symbol = '>';
                                                            } else if (tailType === 'left') {
                                                                h0Symbol = '\\ge';
                                                                h1Symbol = '<';
                                                            }

                                                            return (
                                                                <div className="flex flex-col items-center justify-center p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg min-w-[280px] sm:min-w-[400px] text-center shadow-md relative group">
                                                                    <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--color-text-primary)] font-mono tracking-wide flex items-center justify-center w-full z-10" dir="ltr">
                                                                        <InlineMath math={`H_0: ${parameterSymbol} ${h0Symbol} ${h0Val} \\quad \\text{Vs.} \\quad H_1: ${parameterSymbol}`} />
                                                                        <button
                                                                            onClick={() => setTailType(tailType === 'two-tailed' ? 'right' : tailType === 'right' ? 'left' : 'two-tailed')}
                                                                            className="mx-2 px-3 py-1 rounded-lg bg-[var(--color-accent-cobalt-bg)]/10 hover:bg-[var(--color-accent-cobalt-bg)]/30 border border-[var(--color-accent-cobalt-line)]/30 text-[var(--color-accent-cobalt)] hover:text-[var(--color-accent-cobalt)] transition-all cursor-pointer transform hover:scale-110 active:scale-95 flex items-center justify-center min-w-[45px] shadow-sm"
                                                                            title="לחץ לשינוי כיוון המבחן (שמאלי / דו-צדדי / ימני)"
                                                                        >
                                                                            <InlineMath math={h1Symbol} />
                                                                        </button>
                                                                        <InlineMath math={h0Val} />
                                                                    </div>

                                                                    <div className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-mono mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-center w-full z-10" dir="ltr">
                                                                        <InlineMath math={`H_0: ${parameterSymbol} ${h0Symbol} ${nullValueSymbol} \\quad \\text{Vs.} \\quad H_1: ${parameterSymbol}`} />
                                                                        <button
                                                                            onClick={() => setTailType(tailType === 'two-tailed' ? 'right' : tailType === 'right' ? 'left' : 'two-tailed')}
                                                                            className="mx-1 px-1.5 py-0.5 rounded-sm hover:bg-[var(--color-accent-cobalt-bg)]/20 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-cobalt)] transition-colors cursor-pointer flex items-center justify-center shadow-sm"
                                                                            title="לחץ לשינוי כיוון המבחן"
                                                                        >
                                                                            <InlineMath math={h1Symbol} />
                                                                        </button>
                                                                        <InlineMath math={nullValueSymbol} />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}

                                                    </div>


                                                    {/* Researcher's note */}
                                                    <p className="text-xl sm:text-2xl font-handwriting font-normal text-[var(--color-text-primary)] leading-relaxed mt-4 text-center">
                                                        <PenTool size={22} className="inline-block ml-2 opacity-60 text-[var(--color-accent-cobalt)]" />{' '}
                                                        {tailType === 'right' ? (
                                                            <span>מכיוון שהשערת המחקר <InlineMath math="H_1" /> מציינת הבדל <span className="font-bold underline">בכיוון אחד בלבד</span> (גדול מערך השערת האפס), אנו אומרים שזהו <span className="font-bold">מבחן חד-צדדי (ימני)</span>.</span>
                                                        ) : tailType === 'left' ? (
                                                            <span>מכיוון שהשערת המחקר <InlineMath math="H_1" /> מציינת הבדל <span className="font-bold underline">בכיוון אחד בלבד</span> (קטן מערך השערת האפס), אנו אומרים שזהו <span className="font-bold">מבחן חד-צדדי (שמאלי)</span>.</span>
                                                        ) : (
                                                            <span>מכיוון שהשערת המחקר <InlineMath math="H_1" /> מציינת הבדל <span className="font-bold underline">בשני הכיוונים</span> (שונה מערך השערת האפס), אנו אומרים שזהו <span className="font-bold">מבחן דו-צדדי</span>.</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div></AnimatedDetails>


                                        {/* Step 2: Select an appropriate test */}
                                        <AnimatedDetails id="step-2" className="group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm [&_summary::-webkit-details-marker]:hidden">

                                            <summary className="p-4 sm:p-5 flex items-center justify-between cursor-pointer list-none hover:bg-[var(--color-surface)]/50 transition-colors rounded-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                                                <div className="flex items-center gap-3 font-extrabold text-[var(--color-accent-brass)]">
                                                    <span className="w-9 h-9 rounded-full bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-accent-brass)]/20 text-[var(--color-accent-brass)] text-base font-black flex items-center justify-center border border-[var(--color-accent-brass)]/50 shrink-0">2</span>
                                                    <span className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">בחירת מבחן סטטיסטי מתאים</span>
                                                </div>
                                                <div className="text-[var(--color-text-secondary)] group-[.is-open]:rotate-180 transition-transform duration-300">
                                                    <ChevronDown size={24} />
                                                </div>
                                            </summary>
                                            <div className="p-5 sm:p-6 space-y-4">

                                                <div className="flex flex-col items-center w-full py-6 overflow-x-auto overflow-y-hidden mb-6 mt-4">
                                                    <div className="flex flex-col items-center" dir="rtl">
                                                        {/* Q1 */}
                                                        <div className={`px-5 py-2.5 rounded-sm border-2 font-bold shadow-sm z-10 transition-all ${varianceKnown === true || varianceKnown === false ? 'bg-[var(--color-accent-cobalt-strong)]/40 border-[var(--color-border)] text-[var(--color-text-primary)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
                                                            האם סטיית התקן (<InlineMath math="\sigma" />) ידועה?
                                                        </div>

                                                        <div className="flex w-[440px] justify-between relative mt-0">
                                                            {/* Horizontal Line connecting YES and NO */}
                                                            <div className="absolute top-[20px] left-[60px] right-[60px] h-[2px] bg-[var(--color-border)]"></div>

                                                            {/* YES Branch (Right side in RTL) */}
                                                            <div className="flex flex-col items-center relative z-10 w-[120px]">
                                                                <div className="w-[2px] h-[20px] bg-[var(--color-border)]"></div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setVarianceKnown(true)}
                                                                    className={`text-sm font-black mb-1 px-6 py-2 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 border-2 shadow-md ${varianceKnown ? 'bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/50' : 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-success)]/50 hover:bg-[var(--color-surface)] hover:text-[var(--color-success)]'}`}>
                                                                    כן
                                                                </button>
                                                                <div className="w-[2px] h-[15px] bg-[var(--color-border)]"></div>
                                                                <div className={`w-full text-center px-2 py-2.5 rounded-sm border-2 font-bold z-10 transition-all ${varianceKnown ? 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-success)] shadow-[0_0_15px_rgba(59,169,141,0.3)] ring-1 ring-[var(--color-success)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
                                                                    מבחן <InlineMath math="Z" />
                                                                </div>

                                                                {/* YES path Standard Deviation Input */}
                                                                <AnimatePresence>
                                                                    {varianceKnown && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, height: 0 }}
                                                                            animate={{ opacity: 1, height: 'auto' }}
                                                                            exit={{ opacity: 0, height: 0 }}
                                                                            className="mt-6 w-[240px]"
                                                                        >
                                                                            <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-success)]/30 shadow-md">
                                                                                <div className="flex justify-center mb-4 mt-1">
                                                                                    <InputTooltip
                                                                                        tooltipClassName="w-[260px] p-3 shadow-lg"
                                                                                        content={
                                                                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                                                                <div className="text-sm font-medium text-[var(--color-text-primary)]">
                                                                                                    <InlineMath math="\sigma = \sqrt{\frac{\sum (x_i - \mu)^2}{N}}" />
                                                                                                </div>
                                                                                                <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed text-center font-normal border-t border-[var(--color-border)] pt-2 w-full">
                                                                                                    <span className="font-bold text-[var(--color-text-primary)] block mb-1">במילים פשוטות:</span>
                                                                                                    השורש הריבועי של סכום ריבועי הסטיות של כל תצפית (<InlineMath math="x_i" />) מתוחלת האוכלוסייה (<InlineMath math="\mu" />), מחולק בגודל האוכלוסייה הכולל (<InlineMath math="N" />).
                                                                                                </div>
                                                                                            </div>
                                                                                        }
                                                                                    >
                                                                                        <span className="text-xs font-bold text-[var(--color-text-secondary)] cursor-help border-b border-dotted border-[var(--color-border)] hover:text-[var(--color-text-primary)] transition-colors">
                                                                                            מהי סטיית התקן (<InlineMath math="\sigma" />)?
                                                                                        </span>
                                                                                    </InputTooltip>
                                                                                </div>
                                                                                <div className="relative">
                                                                                    <input
                                                                                        type="text"
                                                                                        value={sigmaInput}
                                                                                        onChange={(e) => handleSigmaChange(e.target.value)}
                                                                                        className={`w-full bg-[var(--color-surface)] border px-3 py-2 rounded-lg font-mono font-bold text-center text-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 placeholder:font-medium placeholder:text-base outline-none transition-all shadow-inner focus:border-[var(--color-success)] focus:ring-2 focus:ring-[var(--color-success)]/20 ${(!sigmaInput || errors.sigma) ? 'text-[var(--color-error)] border-[var(--color-error)] ring-2 ring-[var(--color-error)]/20' : 'border-[var(--color-border)]'}`}
                                                                                        placeholder="σ > 0"
                                                                                        dir="ltr"
                                                                                    />
                                                                                    <AnimatePresence>
                                                                                        {errors.sigma && (
                                                                                            <motion.div
                                                                                                initial={{ opacity: 0, y: -5 }}
                                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                                exit={{ opacity: 0, y: -5 }}
                                                                                                className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 px-3 py-1.5 bg-[var(--color-error)] text-white text-xs font-bold rounded shadow-lg flex items-center justify-center whitespace-nowrap z-50 pointer-events-none"
                                                                                            >
                                                                                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--color-error)] rotate-45"></div>
                                                                                                <span className="relative z-10">{errors.sigma}</span>
                                                                                            </motion.div>
                                                                                        )}
                                                                                    </AnimatePresence>
                                                                                </div>
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>

                                                            {/* NO Branch (Left side in RTL) */}
                                                            <div className="flex flex-col items-center relative z-10 w-[120px]">
                                                                <div className="w-[2px] h-[20px] bg-[var(--color-border)]"></div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setVarianceKnown(false)}
                                                                    className={`text-sm font-black mb-1 px-6 py-2 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 border-2 shadow-md ${!varianceKnown ? 'bg-[var(--color-error)]/15 text-[var(--color-error)] border-[var(--color-error)]/50' : 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-error)]/50 hover:bg-[var(--color-surface)] hover:text-[var(--color-error)]'}`}>
                                                                    לא
                                                                </button>
                                                                <div className="w-[2px] h-[15px] bg-[var(--color-border)]"></div>
                                                                <div className={`w-full text-center px-2 py-2 rounded-sm border-2 font-bold z-10 text-sm transition-all ${!varianceKnown ? 'bg-[var(--color-error)]/15 border-[var(--color-border)] text-[var(--color-text-primary)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
                                                                    האם המדגם <InlineMath math="n \ge 30" />?
                                                                </div>

                                                                {/* Child branches for Q2 */}
                                                                <div className="flex w-[180px] justify-between relative mt-0">
                                                                    <div className="absolute top-[15px] left-[35px] right-[35px] h-[2px] bg-[var(--color-border)]"></div>

                                                                    {/* YES for Q2 (Right in RTL) */}
                                                                    <div className="flex flex-col items-center relative z-10 w-[70px]">
                                                                        <div className="w-[2px] h-[15px] bg-[var(--color-border)]"></div>
                                                                        <span className={`text-xs font-bold mb-1 px-1 rounded-lg transition-all ${!varianceKnown && n >= 30 ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`}>כן</span>
                                                                        <div className="w-[2px] h-[10px] bg-[var(--color-border)]"></div>
                                                                        <div className={`w-full text-center px-1 py-1.5 rounded-sm border-2 font-bold z-10 transition-all ${!varianceKnown && n >= 30 ? 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-success)] shadow-[0_0_15px_rgba(59,169,141,0.3)] ring-1 ring-[var(--color-success)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
                                                                            מבחן <InlineMath math="Z" />
                                                                        </div>
                                                                    </div>

                                                                    {/* NO for Q2 (Left in RTL) */}
                                                                    <div className="flex flex-col items-center relative z-10 w-[70px]">
                                                                        <div className="w-[2px] h-[15px] bg-[var(--color-border)]"></div>
                                                                        <span className={`text-xs font-bold mb-1 px-1 rounded-lg transition-all ${!varianceKnown && n < 30 ? 'bg-[var(--color-error)]/15 text-[var(--color-error)]' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`}>לא</span>
                                                                        <div className="w-[2px] h-[10px] bg-[var(--color-border)]"></div>
                                                                        <div className={`w-full text-center px-1 py-1.5 rounded-sm border-2 font-bold z-10 transition-all ${!varianceKnown && n < 30 ? 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-error)] shadow-[0_0_15px_rgba(217,91,91,0.3)] ring-1 ring-[var(--color-error)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
                                                                            מבחן <InlineMath math="t" />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* NO path Standard Deviation Input */}
                                                                <AnimatePresence>
                                                                    {!varianceKnown && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, height: 0 }}
                                                                            animate={{ opacity: 1, height: 'auto' }}
                                                                            exit={{ opacity: 0, height: 0 }}
                                                                            className="mt-6 w-[240px]"
                                                                        >
                                                                            <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-error)]/30 shadow-md">
                                                                                <div className="flex justify-center mb-4 mt-1">
                                                                                    <InputTooltip
                                                                                        tooltipClassName="w-[260px] p-3 shadow-lg"
                                                                                        content={
                                                                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                                                                <div className="text-sm font-medium text-[var(--color-text-primary)]">
                                                                                                    <InlineMath math="S = \sqrt{\frac{\sum (x_i - \bar{x})^2}{n - 1}}" />
                                                                                                </div>
                                                                                                <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed text-center font-normal border-t border-[var(--color-border)] pt-2 w-full">
                                                                                                    <span className="font-bold text-[var(--color-text-primary)] block mb-1">במילים פשוטות:</span>
                                                                                                    השורש הריבועי של סכום ריבועי הסטיות של כל תצפית (<InlineMath math="x_i" />) מממוצע המדגם (<InlineMath math="\bar{x}" />), מחולק בגודל המדגם פחות אחד (<InlineMath math="n - 1" />).
                                                                                                </div>
                                                                                            </div>
                                                                                        }
                                                                                    >
                                                                                        <span className="text-xs font-bold text-[var(--color-text-secondary)] cursor-help border-b border-dotted border-[var(--color-border)] hover:text-[var(--color-text-primary)] transition-colors">
                                                                                            מהי סטיית התקן המדגמית (<InlineMath math="S" />)?
                                                                                        </span>
                                                                                    </InputTooltip>
                                                                                </div>

                                                                                <div className="relative">
                                                                                    <input
                                                                                        type="text"
                                                                                        value={sigmaInput}
                                                                                        onChange={(e) => handleSigmaChange(e.target.value)}
                                                                                        className={`w-full bg-[var(--color-surface)] border px-3 py-2 rounded-lg font-mono font-bold text-center text-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 placeholder:font-medium placeholder:text-base outline-none transition-all shadow-inner focus:border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error)]/20 ${(!sigmaInput || errors.sigma) ? 'text-[var(--color-error)] border-[var(--color-error)] ring-2 ring-[var(--color-error)]/20' : 'border-[var(--color-border)]'}`}
                                                                                        placeholder="S > 0"
                                                                                        dir="ltr"
                                                                                    />
                                                                                    <AnimatePresence>
                                                                                        {errors.sigma && (
                                                                                            <motion.div
                                                                                                initial={{ opacity: 0, y: -5 }}
                                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                                exit={{ opacity: 0, y: -5 }}
                                                                                                className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 px-3 py-1.5 bg-[var(--color-error)] text-white text-xs font-bold rounded shadow-lg flex items-center justify-center whitespace-nowrap z-50 pointer-events-none"
                                                                                            >
                                                                                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--color-error)] rotate-45"></div>
                                                                                                <span className="relative z-10">{errors.sigma}</span>
                                                                                            </motion.div>
                                                                                        )}
                                                                                    </AnimatePresence>
                                                                                </div>
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Researcher's note */}
                                                <p className="text-xl sm:text-2xl font-handwriting font-normal text-[var(--color-text-primary)] leading-relaxed mt-6 text-center">
                                                    <PenTool size={22} className="inline-block ml-2 opacity-60 text-[var(--color-accent-cobalt)]" />{' '}
                                                    {varianceKnown ? (
                                                        <span>מכיוון שסטיית התקן (<InlineMath math="\sigma" />) <span className="font-bold underline">ידועה</span>, המבחן הסטטיסטי המתאים הוא <span className="font-bold">מבחן <InlineMath math="Z" /></span>.</span>
                                                    ) : !varianceKnown && n >= 30 ? (
                                                        <span>מכיוון שסטיית התקן (<InlineMath math="\sigma" />) <span className="font-bold underline">אינה ידועה</span> אך גודל המדגם הוא <InlineMath math="n \ge 30" />, ניתן להשתמש בקירוב באמצעות <span className="font-bold">מבחן <InlineMath math="Z" /></span>.</span>
                                                    ) : (
                                                        <span>מכיוון שסטיית התקן (<InlineMath math="\sigma" />) <span className="font-bold underline">אינה ידועה</span> וגודל המדגם קטן מ-30 (<InlineMath math="n < 30" />), נשתמש ב<span className="font-bold">מבחן <InlineMath math="t" /></span>.</span>
                                                    )}
                                                </p>
                                            </div></AnimatedDetails>

                                        {/* Step 3: Specify the level of significance */}
                                        <AnimatedDetails className="group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm [&_summary::-webkit-details-marker]:hidden">

                                            <summary className="p-4 sm:p-5 flex items-center justify-between cursor-pointer list-none hover:bg-[var(--color-surface)]/50 transition-colors rounded-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                                                <div className="flex items-center gap-3 font-extrabold text-[var(--color-accent-brass)]">
                                                    <span className="w-9 h-9 rounded-full bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-accent-brass)]/20 text-[var(--color-accent-brass)] text-base font-black flex items-center justify-center border border-[var(--color-accent-brass)]/50 shrink-0">3</span>
                                                    <span className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">קביעת רמת המובהקות (<InlineMath math="\alpha" />)</span>
                                                </div>
                                                <div className="text-[var(--color-text-secondary)] group-[.is-open]:rotate-180 transition-transform duration-300">
                                                    <ChevronDown size={24} />
                                                </div>
                                            </summary>
                                            <div className="p-5 sm:p-6 space-y-4">


                                                <p className="text-base sm:text-lg text-[var(--color-text-primary)] leading-relaxed pr-9 font-semibold">
                                                    רמת המובהקות (<InlineMath math="\alpha" />) מייצגת את ההסתברות המקסימלית שנסכים לקבל עבור שגיאה מסוג I, דחיית השערת האפס כשהיא למעשה נכונה <span className="text-[var(--color-error)] font-bold" dir="ltr"><InlineMath math="P(\text{Reject } H_0 \mid H_0 \text{ is True})" /></span>:
                                                </p>
                                                {/* Alpha Selection Row with type manually option */}
                                                <div className="flex flex-col sm:flex-row items-center justify-start gap-4 mt-6 pr-9" dir="rtl">
                                                    <span className="text-xs sm:text-sm font-black text-[var(--color-text-secondary)]">
                                                        בחר רמת מובהקות (<InlineMath math="\alpha" />):
                                                    </span>

                                                    <div className="flex gap-1.5 bg-[var(--color-surface-raised)] p-1.5 rounded-lg border border-[var(--color-border)]">
                                                        {[0.10, 0.05, 0.01].map((pVal) => (
                                                            <button
                                                                key={pVal}
                                                                type="button"
                                                                onClick={() => applyAlphaPreset(pVal)}
                                                                className={`px-3 py-1.5 text-xs sm:text-sm font-black rounded-lg transition-all ${alpha === pVal
                                                                    ? 'bg-[var(--color-accent-cobalt-bg-hover)] text-white shadow-sm'
                                                                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                                                    }`}
                                                            >
                                                                {pVal * 100}%
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="text"
                                                            value={alphaInput}
                                                            onChange={(e) => handleAlphaChange(e.target.value)}
                                                            className={`w-24 px-2.5 py-1.5 bg-[var(--color-surface)] border rounded-md text-center font-mono font-bold text-sm text-[var(--color-accent-cobalt)] placeholder:text-[var(--color-text-secondary)]/50 placeholder:font-medium outline-none transition-all shadow-inner focus:border-[var(--color-accent-cobalt)] focus:ring-2 focus:ring-[var(--color-accent-cobalt)]/20 ${(!alphaInput || errors.alpha) ? 'border-[var(--color-error)] ring-2 ring-[var(--color-error)]/20 text-[var(--color-error)]' : 'border-[var(--color-border)]'
                                                                }`}
                                                            placeholder="0 < α < 1"
                                                            dir="ltr"
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <AnimatePresence>
                                                            {errors.alpha && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -5 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -5 }}
                                                                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-3 py-1.5 bg-[var(--color-error)] text-white text-xs font-bold rounded shadow-lg flex items-center justify-center whitespace-nowrap z-50 pointer-events-none"
                                                                >
                                                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--color-error)] rotate-45"></div>
                                                                    <span className="relative z-10">{errors.alpha}</span>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>

                                                <div className="pr-9 py-3 space-y-4 text-xl md:text-2xl">
                                                    <FormulaBlock
                                                        formulaName="רמת מובהקות (α)"
                                                        translation="1 פחות רמת הביטחון. מייצג את הסיכוי המקסימלי לטעות מסוג ראשון (דחיית השערת האפס כשהיא נכונה)."
                                                    >
                                                        <BlockMath math={`\\alpha = 1 - \\text{Confidence Level}`} />
                                                    </FormulaBlock>
                                                    <CalcBlock>
                                                        <BlockMath math={`\\alpha = 1 - ${(1 - alpha).toFixed(2)} = ${alpha}`} />
                                                    </CalcBlock>
                                                </div>



                                                {/* Researcher's note */}
                                                <p className="text-xl sm:text-2xl font-handwriting font-normal text-[var(--color-text-primary)] leading-relaxed mt-6 text-center">
                                                    <PenTool size={22} className="inline-block ml-2 opacity-60 text-[var(--color-accent-cobalt)]" />{' '}
                                                    קבענו שרמת המובהקות של המבחן תהיה <InlineMath math={`\\alpha = ${alpha}`} />, הנגזרת מרמת ביטחון של <InlineMath math={`${((1 - alpha) * 100).toFixed(0)}\\%`} />.
                                                </p>
                                            </div></AnimatedDetails>


                                        {isValid && stats && decisionData ? (
                                            <>
                                                {/* Step 4: Critical Value derivation & SE */}
                                                <AnimatedDetails className="group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm [&_summary::-webkit-details-marker]:hidden">

                                                    <summary className="p-4 sm:p-5 flex items-center justify-between cursor-pointer list-none hover:bg-[var(--color-surface)]/50 transition-colors rounded-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                                                        <div className="flex items-center gap-3 font-extrabold text-[var(--color-accent-brass)]">
                                                            <span className="w-9 h-9 rounded-full bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-accent-brass)]/20 text-[var(--color-accent-brass)] text-base font-black flex items-center justify-center border border-[var(--color-accent-brass)]/50 shrink-0">4</span>
                                                            <span className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">קביעת הערכים הקריטיים והגדרת כלל ההחלטה</span>
                                                        </div>
                                                        <div className="text-[var(--color-text-secondary)] group-[.is-open]:rotate-180 transition-transform duration-300">
                                                            <ChevronDown size={24} />
                                                        </div>
                                                    </summary>
                                                    <div className="p-5 sm:p-6 space-y-4">


                                                        <div className="pr-9 space-y-4">
                                                            <p className="text-base sm:text-lg text-[var(--color-text-primary)] leading-relaxed font-semibold mb-6">
                                                                {tailType === 'two-tailed' ? (
                                                                    <span>
                                                                        מכיוון שזהו <span className="font-bold underline">מבחן דו-צדדי</span>, רמת המובהקות מתחלקת שווה בשווה בין שני זנבות ההתפלגות: <InlineMath math={`\\alpha / 2 = ${alpha / 2}`} /> לכל זנב.
                                                                    </span>
                                                                ) : tailType === 'left' ? (
                                                                    <span>
                                                                        מכיוון שזהו <span className="font-bold underline">מבחן חד-צדדי שמאלי</span>, נקצה את רמת המובהקות (<InlineMath math="\alpha" />) לזנב השמאלי של ההתפלגות.
                                                                    </span>
                                                                ) : (
                                                                    <span>
                                                                        מכיוון שזהו <span className="font-bold underline">מבחן חד-צדדי ימני</span>, נקצה את רמת המובהקות (<InlineMath math="\alpha" />) לזנב הימני של ההתפלגות.
                                                                    </span>
                                                                )}
                                                            </p>

                                                            {/* Mini alpha chart */}
                                                            {stats && (
                                                                <div className="relative w-full max-w-lg mx-auto mb-8 mt-2 pt-6 pb-2 px-2 sm:px-5 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-inner" dir="ltr">
                                                                    {/* Compact Legend */}
                                                                    <div className="absolute top-4 right-6 flex items-center gap-1.5 text-xs text-[var(--color-text-primary)] font-bold bg-[var(--color-surface)] py-1.5 px-3 rounded-lg border border-[var(--color-border)]/50 z-10" dir="rtl">
                                                                        <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span> <InlineMath math="\alpha" />
                                                                    </div>

                                                                    <div className="h-[200px] w-full">
                                                                        <ResponsiveContainer width="100%" height="100%">
                                                                            <AreaChart data={Array.from({ length: 141 }, (_, i) => {
                                                                                const x = -3.5 + (i * 0.05);
                                                                                const y = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
                                                                                let isRejection = false;
                                                                                const zRight = Math.abs(stats.zCrit);
                                                                                if (tailType === 'right' && x >= zRight) isRejection = true;
                                                                                if (tailType === 'left' && x <= -zRight) isRejection = true;
                                                                                if (tailType === 'two-tailed' && Math.abs(x) >= zRight) isRejection = true;
                                                                                return { x, y, alphaShade: isRejection ? y : 0 };
                                                                            })}>
                                                                                <defs>
                                                                                    <linearGradient id="miniH0Color" x1="0" y1="0" x2="0" y2="1">
                                                                                        <stop offset="5%" stopColor={'#818cf8'} stopOpacity={0.3} />
                                                                                        <stop offset="95%" stopColor={'#818cf8'} stopOpacity={0} />
                                                                                    </linearGradient>
                                                                                </defs>
                                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={'#334155'} opacity={0.5} />
                                                                                <XAxis dataKey="x" type="number" domain={[-3.5, 3.5]} tickFormatter={(val) => val.toFixed(2)} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                                                                                <YAxis
                                                                                    tickFormatter={(val) => val.toFixed(2)}
                                                                                    tick={{ fill: 'var(--chart-axis-label)', fontSize: 12, fontWeight: 'bold' }}
                                                                                    axisLine={{ stroke: 'var(--chart-grid)' }}
                                                                                    tickLine={true}
                                                                                    width={45}
                                                                                />
                                                                                <Area type="monotone" dataKey="y" stroke="#818cf8" strokeWidth={2.5} fill="url(#miniH0Color)" isAnimationActive={false} />
                                                                                <Area type="monotone" dataKey="alphaShade" stroke="none" fill="#ef4444" fillOpacity={0.5} isAnimationActive={false} />

                                                                                {tailType === 'two-tailed' ? (
                                                                                    <>
                                                                                        <ReferenceLine x={-Math.abs(stats.zCrit)} stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" label={{ value: `-${Math.abs(stats.zCrit).toFixed(2)}`, position: 'insideTopLeft', fill: '#ef4444', fontSize: 13, fontWeight: 'bold', offset: 10 }} />
                                                                                        <ReferenceLine x={Math.abs(stats.zCrit)} stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" label={{ value: `+${Math.abs(stats.zCrit).toFixed(2)}`, position: 'insideTopRight', fill: '#ef4444', fontSize: 13, fontWeight: 'bold', offset: 10 }} />
                                                                                    </>
                                                                                ) : tailType === 'right' ? (
                                                                                    <ReferenceLine x={Math.abs(stats.zCrit)} stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" label={{ value: `+${Math.abs(stats.zCrit).toFixed(2)}`, position: 'insideTopRight', fill: '#ef4444', fontSize: 13, fontWeight: 'bold', offset: 10 }} />
                                                                                ) : (
                                                                                    <ReferenceLine x={-Math.abs(stats.zCrit)} stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" label={{ value: `-${Math.abs(stats.zCrit).toFixed(2)}`, position: 'insideTopLeft', fill: '#ef4444', fontSize: 13, fontWeight: 'bold', offset: 10 }} />
                                                                                )}
                                                                            </AreaChart>
                                                                        </ResponsiveContainer>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <p className="text-base sm:text-lg text-[var(--color-text-primary)] leading-relaxed font-semibold text-center mt-4">
                                                                {tailType === 'right' ? (
                                                                    <span>אנו מחפשים ערך <InlineMath math={varianceKnown ? 'z' : 't'} /> בו ההסתברות המצטברת מימין (<InlineMath math="\alpha" />) שווה ל-{alpha}</span>
                                                                ) : tailType === 'left' ? (
                                                                    <span>אנו מחפשים ערך <InlineMath math={`-${varianceKnown ? 'z' : 't'}`} /> בו ההסתברות המצטברת משמאל (<InlineMath math="\alpha" />) שווה ל-{alpha}</span>
                                                                ) : (
                                                                    <span>אנו מחפשים ערכי <InlineMath math={`\\pm ${varianceKnown ? 'z' : 't'}`} /> בהם ההסתברות המצטברת בכל זנב (<InlineMath math="\alpha/2" />) שווה ל-{alpha / 2}</span>
                                                                )}
                                                            </p>

                                                            {/* Theoretical Explanation Accordion */}
                                                            {(() => {
                                                                const getDisplayCriticalValue = () => {
                                                                    if (!varianceKnown) return Math.abs(stats?.zCrit || 0).toFixed(4);
                                                                    const a = Number(alpha);
                                                                    if (tailType === 'right' || tailType === 'left') {
                                                                        if (a === 0.05) return '1.645';
                                                                        if (a === 0.01) return '2.326';
                                                                        if (a === 0.10) return '1.282';
                                                                    } else {
                                                                        if (a === 0.05) return '1.960';
                                                                        if (a === 0.01) return '2.576';
                                                                        if (a === 0.10) return '1.645';
                                                                    }
                                                                    return Math.abs(stats?.zCrit || 0).toFixed(4);
                                                                };
                                                                const displayCrit = getDisplayCriticalValue();

                                                                return (
                                                                    <>
                                                                        <div className="py-3 text-xl md:text-2xl space-y-4">
                                                                            <FormulaBlock
                                                                                formulaName="הערך הקריטי בטבלה"
                                                                                translation="הערך שמקבלים מפונקציית ההתפלגות ההופכית (Inverse CDF) עבור השטח המבוקש. מסמן את גבול אזור הדחייה."
                                                                            >
                                                                                {tailType === 'right' ? (
                                                                                    <>
                                                                                        <BlockMath math={`p = 1 - \\alpha`} />
                                                                                        <BlockMath math={`${varianceKnown ? 'z' : 't'}_{\\alpha} = ${varianceKnown ? 'Z' : 't'}_{1-\\alpha} = ${varianceKnown ? '\\Phi^{-1}' : 'F_t^{-1}'}(p) = ${displayCrit}`} />
                                                                                    </>
                                                                                ) : tailType === 'left' ? (
                                                                                    <>
                                                                                        <BlockMath math={`p = \\alpha`} />
                                                                                        <BlockMath math={`-${varianceKnown ? 'z' : 't'}_{\\alpha} = -${varianceKnown ? 'Z' : 't'}_{1-\\alpha} = ${varianceKnown ? '\\Phi^{-1}' : 'F_t^{-1}'}(p) = -${displayCrit}`} />
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <BlockMath math={`p = 1 - \\alpha / 2`} />
                                                                                        <BlockMath math={`\\pm ${varianceKnown ? 'z' : 't'}_{\\alpha/2} = \\pm ${varianceKnown ? 'Z' : 't'}_{1-\\alpha/2} = \\pm ${varianceKnown ? '\\Phi^{-1}' : 'F_t^{-1}'}(p) = \\pm ${displayCrit}`} />
                                                                                    </>
                                                                                )}
                                                                            </FormulaBlock>
                                                                        </div>

                                                                        {/* Theoretical Explanation Accordion */}
                                                                        <AnimatedDetails className="group mt-4 mb-6 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
                                                                            <summary className="flex items-center gap-2 p-4 cursor-pointer text-[var(--color-warning)] font-bold outline-none select-none">
                                                                                <div className="flex-1 flex items-center gap-2">
                                                                                    <Info size={16} />
                                                                                    <span>משמעות האינדקס התחתון <InlineMath math="( _\alpha )" />ומציאת הערך הקריטי</span>
                                                                                </div>
                                                                                <ChevronDown size={18} className="transition-transform duration-300 group-[.is-open]:rotate-180 text-[var(--color-warning)]/70" />
                                                                            </summary>
                                                                            <div className="p-4 pt-0 text-sm sm:text-base text-[var(--color-text-primary)] border-t border-[var(--color-border)] mt-2">
                                                                                <ul className="list-disc pr-5 space-y-3 leading-relaxed marker:text-[var(--color-warning)]">
                                                                                    <li>
                                                                                        <strong>המוסכמה הרווחת:</strong> האינדקס התחתון בסימון <InlineMath math={`${varianceKnown ? 'Z' : 't'}_\\alpha`} /> מגדיר את
                                                                                        השטח <strong>מימין לערך</strong> על גבי גרף ההתפלגות: <span dir="ltr" className="font-mono text-xs text-[var(--color-accent-brass)] px-1 py-0.5 rounded"><InlineMath math={`P(${varianceKnown ? 'Z' : 'T'} > ${varianceKnown ? 'z' : 't'}) = \\alpha`} /></span>.
                                                                                        לכן, עבור <InlineMath math="\alpha = 0.05" />, הסימון יהיה <InlineMath math={`${varianceKnown ? 'Z' : 't'}_{0.05}`} />.
                                                                                    </li>
                                                                                    <li>
                                                                                        פונקציית התפלגות מצטברת <strong>רגילה</strong> <span dir="ltr" className="font-mono text-xs text-[var(--color-accent-brass)] px-1 py-0.5 rounded"><InlineMath math={`P(${varianceKnown ? 'Z' : 'T'} < ${varianceKnown ? 'z' : 't'}) = ${varianceKnown ? '\\Phi' : 'F_t'}(${varianceKnown ? 'z' : 't'})`} /></span> מקבלת ערכי <InlineMath math={`${varianceKnown ? 'Z' : 'T'}`} /> ומחזירה הסתברות מצטברת משמאל לערך (<InlineMath math={`${varianceKnown ? 'Z' : 'T'} \\rightarrow \\text{Probability}`} />).
                                                                                        כדי למצוא ערך <InlineMath math={`${varianceKnown ? 'Z' : 'T'}`} /> לפי הסתברות נשתמש בפונקציה <strong>ההופכית</strong> <span dir="ltr" className="font-mono text-xs text-[var(--color-accent-brass)] px-1 py-0.5 rounded"><InlineMath math={`${varianceKnown ? 'z' : 't'} = ${varianceKnown ? '\\Phi^{-1}' : 'F_t^{-1}'}(P(${varianceKnown ? 'Z' : 'T'} < ${varianceKnown ? 'z' : 't'}))`} /></span> המקבלת הסתברויות ומחזירה ערך <InlineMath math={`${varianceKnown ? 'Z' : 'T'}`} /> (<InlineMath math={`\\text{Probability} \\rightarrow ${varianceKnown ? 'Z' : 'T'}`} />).
                                                                                    </li>
                                                                                </ul>
                                                                                <div className="mt-4 pt-3 border-t border-[var(--color-border)] text-center font-semibold text-[var(--color-warning)] text-sm sm:text-base">
                                                                                    פונקציית התפלגות מצטברת הופכית = מציאת ערך ה-{varianceKnown ? 'Z' : 't'} (הערכים בשוליים) בטבלה לפי ההסתברות (הערכים הפנימיים).
                                                                                </div>
                                                                            </div>
                                                                        </AnimatedDetails>

                                                                        <div className="text-xl md:text-2xl space-y-4">
                                                                            <div className="text-right text-lg text-[var(--color-text-primary)] font-bold mb-4">החישוב בפועל</div>
                                                                            {tailType === 'right' ? (
                                                                                <>
                                                                                    <p className="text-right text-base sm:text-lg text-[var(--color-text-primary)] mb-2">לפני שניגשים לנוסחה, אנו חייבים לתרגם לה את הנתון באמצעות המשלים ל-1:</p>
                                                                                    <CalcBlock>
                                                                                        <BlockMath math={`P(${varianceKnown ? 'Z' : 'T'} \\le z) = 1 - P(${varianceKnown ? 'Z' : 'T'} > z)`} />
                                                                                        <BlockMath math={`P(${varianceKnown ? 'Z' : 'T'} \\le z) = 1 - ${alpha} = ${(1 - alpha).toFixed(4)}`} />
                                                                                    </CalcBlock>
                                                                                    <p className="text-right text-base sm:text-lg text-[var(--color-text-primary)] mb-2 mt-4">ורק עכשיו, כשיש לנו את הנתון בפורמט שהנוסחה "מבקשת" (<InlineMath math={`p = ${(1 - alpha).toFixed(4)}`} />), אנחנו יכולים להציב אותו לתוכה (מקביל לחיפוש ערך ה-{varianceKnown ? 'Z' : 't'} ע"י הצלבת ההסתברות <InlineMath math={varianceKnown ? '\\Phi(z)' : 'F_t(t)'} /> שלו מתוך הטבלה):</p>
                                                                                    <CalcBlock>
                                                                                        <BlockMath math={`${varianceKnown ? 'z' : 't'} = ${varianceKnown ? '\\Phi^{-1}' : 'F^{-1}'}(${(1 - alpha).toFixed(4)}) = ${displayCrit}`} />
                                                                                    </CalcBlock>
                                                                                </>
                                                                            ) : tailType === 'left' ? (
                                                                                <>
                                                                                    <p className="text-right text-base sm:text-lg text-[var(--color-text-primary)] mb-2">במבחן שמאלי, הנתון כבר מתאים לדרישת הנוסחה (שטח משמאל), ולכן אין צורך במשלים ל-1:</p>
                                                                                    <CalcBlock>
                                                                                        <BlockMath math={`P(${varianceKnown ? 'Z' : 'T'} \\le z) = ${alpha}`} />
                                                                                    </CalcBlock>
                                                                                    <p className="text-right text-base sm:text-lg text-[var(--color-text-primary)] mb-2 mt-4">מכיוון שהנתון כבר בפורמט שהנוסחה "מבקשת" (<InlineMath math={`p = ${alpha}`} />), אנחנו יכולים להציב אותו ישירות לתוכה (מקביל לחיפוש ערך ה-{varianceKnown ? 'Z' : 't'} ע"י הצלבת ההסתברות <InlineMath math={varianceKnown ? '\\Phi(z)' : 'F_t(t)'} /> שלו מתוך הטבלה):</p>
                                                                                    <CalcBlock>
                                                                                        <BlockMath math={`${varianceKnown ? 'z' : 't'} = ${varianceKnown ? '\\Phi^{-1}' : 'F^{-1}'}(${alpha}) = -${displayCrit}`} />
                                                                                    </CalcBlock>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <p className="text-right text-base sm:text-lg text-[var(--color-text-primary)] mb-2">במבחן דו-צדדי, אנו מחפשים את הערך העליון שמשאיר חצי מרמת המובהקות מימינו. נתרגם זאת לשטח משמאל:</p>
                                                                                    <CalcBlock>
                                                                                        <BlockMath math={`P(${varianceKnown ? 'Z' : 'T'} \\le z) = 1 - P(${varianceKnown ? 'Z' : 'T'} > z) = 1 - \\alpha/2`} />
                                                                                        <BlockMath math={`P(${varianceKnown ? 'Z' : 'T'} \\le z) = 1 - ${alpha / 2} = ${(1 - alpha / 2).toFixed(4)}`} />
                                                                                    </CalcBlock>
                                                                                    <p className="text-right text-base sm:text-lg text-[var(--color-text-primary)] mb-2 mt-4">ורק עכשיו, כשיש לנו את הנתון בפורמט שהנוסחה "מבקשת" (<InlineMath math={`p = ${(1 - alpha / 2).toFixed(4)}`} />), אנחנו יכולים להציב אותו לתוכה (מקביל לחיפוש ערך ה-{varianceKnown ? 'Z' : 't'} ע"י הצלבת ההסתברות <InlineMath math={varianceKnown ? '\\Phi(z)' : 'F_t(t)'} /> שלו מתוך הטבלה):</p>
                                                                                    <CalcBlock>
                                                                                        <BlockMath math={`${varianceKnown ? 'z' : 't'} = \\pm ${varianceKnown ? '\\Phi^{-1}' : 'F^{-1}'}(${(1 - alpha / 2).toFixed(4)}) = \\pm ${displayCrit}`} />
                                                                                    </CalcBlock>
                                                                                </>
                                                                            )}
                                                                        </div>

                                                                        {/* Researcher's note */}
                                                                        <p className="text-xl sm:text-2xl font-handwriting font-normal text-[var(--color-text-primary)] leading-relaxed mt-10 mb-2 text-center">
                                                                            <PenTool size={22} className="inline-block ml-2 opacity-60 text-[var(--color-accent-cobalt)]" />{' '}
                                                                            ערך ה-{varianceKnown ? 'Z' : 't'} הקריטי יהווה את הרף שעל פיו נגדיר את אזור הדחייה של המבחן: <InlineMath math={`${varianceKnown ? 'Z' : 't'}_{\\text{crit}} = ${tailType === 'two-tailed' ? '\\pm ' : tailType === 'left' ? '-' : ''}${displayCrit}`} />.
                                                                        </p>
                                                                    </>
                                                                );
                                                            })()}

                                                            {/* Subheading for Decision Rules */}
                                                            <div className="mt-12 mb-6 pt-8 border-t border-[var(--color-border)]/60">
                                                                <h4 className="text-2xl font-black text-[var(--color-accent-cobalt)] flex items-center gap-3">
                                                                    <div className="bg-[var(--color-accent-cobalt-bg)]/20 p-2 rounded-lg text-[var(--color-accent-cobalt)]">
                                                                        <Target size={24} />
                                                                    </div>
                                                                    הגדרת כללי ההחלטה
                                                                </h4>
                                                            </div>

                                                            <p className="text-base sm:text-lg text-[var(--color-text-primary)] leading-relaxed mt-6">
                                                                כל שלוש הגישות (סטטיסטי המבחן, אזור הדחייה וה-P-Value) הן שקולות לחלוטין מבחינה מתמטית ומהוות התמרות אלגבריות שונות של אותו אי-שוויון. מאחר שכולן נשענות על אותם נתוני מדגם ואותה התפלגות של המשתנה המקרי, הן יובילו תמיד ובאופן מוחלט לאותה החלטה בדיוק בנוגע לדחייה או אי-דחייה של השערת האפס (<InlineMath math="H_0" />).
                                                                <br /><br />
                                                                הבחירה באיזו גישה להציג נובעת מההקשר היישומי, סוג התוצר או קהל היעד, ולא מהבדל בתוקף הסטטיסטי.
                                                            </p>

                                                            <div className="space-y-4 mt-8">
                                                                {/* Approach 1 */}
                                                                <AnimatedDetails className="group rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
                                                                    <summary className="flex items-center gap-3 p-4 sm:p-5 cursor-pointer text-[var(--color-accent-cobalt)] font-bold outline-none select-none hover:bg-[var(--color-surface-raised)] rounded-t-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                                                                        <div className="flex-1 flex items-center gap-3">
                                                                            <Target size={20} />
                                                                            <span className="text-lg sm:text-xl">כלל סטטיסטי המבחן</span>
                                                                        </div>
                                                                        <ChevronDown size={22} className="transition-transform duration-300 group-[.is-open]:rotate-180 text-[var(--color-text-secondary)]" />
                                                                    </summary>
                                                                    <div className="p-4 sm:p-6 bg-[var(--color-surface-raised)]/50 rounded-b-lg">
                                                                        <div className="py-2 space-y-4 text-xl md:text-2xl">
                                                                            <FormulaBlock
                                                                                formulaName="ערך קריטי (Critical Value)"
                                                                                translation="הערך שמפריד בין אזור אי-הדחייה לאזור הדחייה. מתקבל על ידי מציאת הערך בהתפלגות (Z או t) שמשאיר שטח של אלפא (α) בזנב/זנבות הדחייה."
                                                                            >
                                                                                {tailType === 'right' && (
                                                                                    varianceKnown ?
                                                                                        <BlockMath math={`P(Z \\ge Z_{crit}) = \\alpha \\implies \\Phi(Z_{crit}) = 1 - \\alpha \\implies Z_{crit} = z_{\\alpha}`} /> :
                                                                                        <BlockMath math={`P(t_{(n-1)} \\ge t_{crit}) = \\alpha \\implies t_{crit} = t_{\\alpha}`} />
                                                                                )}
                                                                                {tailType === 'left' && (
                                                                                    varianceKnown ?
                                                                                        <BlockMath math={`P(Z \\le Z_{crit}) = \\alpha \\implies \\Phi(Z_{crit}) = \\alpha \\implies Z_{crit} = -z_{\\alpha}`} /> :
                                                                                        <BlockMath math={`P(t_{(n-1)} \\le t_{crit}) = \\alpha \\implies t_{crit} = -t_{\\alpha}`} />
                                                                                )}
                                                                                {tailType === 'two-tailed' && (
                                                                                    varianceKnown ?
                                                                                        <BlockMath math={`P(|Z| \\ge Z_{crit}) = \\alpha \\implies \\Phi(Z_{crit}) = 1 - \\frac{\\alpha}{2} \\implies Z_{crit_{1,2}} = \\pm z_{\\alpha/2}`} /> :
                                                                                        <BlockMath math={`P(|t_{(n-1)}| \\ge t_{crit}) = \\alpha \\implies t_{crit_{1,2}} = \\pm t_{\\alpha/2}`} />
                                                                                )}
                                                                            </FormulaBlock>
                                                                            <CalcBlock>
                                                                                <div className="pt-2">
                                                                                    {tailType === 'right' ? (
                                                                                        <>
                                                                                            <div className="text-[var(--color-success)] font-bold">
                                                                                                <BlockMath math={`\\text{If: } ${varianceKnown ? 'Z' : 't'} \\ge ${varianceKnown ? 'z' : 't'}_{\\alpha} \\text{ , Reject } H_0`} />
                                                                                            </div>
                                                                                            <div className="text-[var(--color-error)] font-bold mt-4">
                                                                                                <BlockMath math={`\\text{If: } ${varianceKnown ? 'Z' : 't'} < ${varianceKnown ? 'z' : 't'}_{\\alpha} \\text{ , Fail to Reject } H_0`} />
                                                                                            </div>
                                                                                        </>
                                                                                    ) : tailType === 'left' ? (
                                                                                        <>
                                                                                            <div className="text-[var(--color-success)] font-bold">
                                                                                                <BlockMath math={`\\text{If: } ${varianceKnown ? 'Z' : 't'} \\le -${varianceKnown ? 'z' : 't'}_{\\alpha} \\text{ , Reject } H_0`} />
                                                                                            </div>
                                                                                            <div className="text-[var(--color-error)] font-bold mt-4">
                                                                                                <BlockMath math={`\\text{If: } ${varianceKnown ? 'Z' : 't'} > -${varianceKnown ? 'z' : 't'}_{\\alpha} \\text{ , Fail to Reject } H_0`} />
                                                                                            </div>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <div className="text-[var(--color-success)] font-bold">
                                                                                                <BlockMath math={`\\text{If: } |${varianceKnown ? 'Z' : 't'}| \\ge ${varianceKnown ? 'z' : 't'}_{\\alpha/2} \\text{ , Reject } H_0`} />
                                                                                            </div>
                                                                                            <div className="text-[var(--color-error)] font-bold mt-4">
                                                                                                <BlockMath math={`\\text{If: } |${varianceKnown ? 'Z' : 't'}| < ${varianceKnown ? 'z' : 't'}_{\\alpha/2} \\text{ , Fail to Reject } H_0`} />
                                                                                            </div>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </CalcBlock>
                                                                        </div>
                                                                        <p className="text-xl sm:text-2xl font-handwriting font-normal text-[var(--color-text-primary)] leading-relaxed text-center mt-6 mb-2">
                                                                            <PenTool size={22} className="inline-block ml-2 opacity-60 text-[var(--color-accent-cobalt)]" />{' '}
                                                                            בכלל סטטיסטי המבחן נדחה את <strong className="text-white">השערת האפס</strong> (<InlineMath math="H_0" />) אם סטטיסטי המבחן המחושב נופל באזור הדחייה, מעבר לערך הסף הקריטי.
                                                                        </p>
                                                                    </div>
                                                                </AnimatedDetails>

                                                                {/* Approach 2 */}
                                                                {(() => {
                                                                    if (!stats) return null;
                                                                    const paramSymbol = testType === 'sum' ? '\\sum X' : testType === 'single' ? 'X' : '\\bar{X}';
                                                                    const muSymbol = testType === 'sum' ? 'E(\\sum X)' : '\\mu_0';
                                                                    return (
                                                                        <AnimatedDetails className="group rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm transition-all duration-300 [&_summary::-webkit-details-marker]:hidden" defaultOpen={false}>
                                                                            <summary className="flex items-center gap-3 p-4 sm:p-5 cursor-pointer text-[var(--color-accent-cobalt)] font-bold outline-none select-none hover:bg-[var(--color-surface-raised)] rounded-t-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                                                                                <div className="flex-1 flex items-center gap-3">
                                                                                    <Map size={20} />
                                                                                    <span className="text-lg sm:text-xl">כלל אזור הדחייה</span>
                                                                                </div>
                                                                                <ChevronDown size={22} className="transition-transform duration-300 group-[.is-open]:rotate-180 text-[var(--color-text-secondary)]" />
                                                                            </summary>
                                                                            <div className="p-4 sm:p-6 bg-[var(--color-surface-raised)]/50 rounded-b-lg">
                                                                                <div className="py-2 space-y-4 text-xl md:text-2xl">
                                                                                    <FormulaBlock
                                                                                formulaName="אזור הדחייה (Rejection Region)"
                                                                                translation="הערך הקריטי בסולם המקורי של המשתנה. מחושב על ידי הוספת מרווח הטעות (הערך הקריטי כפול שגיאת התקן) לתוחלת המשוערת."
                                                                            >
                                                                                        {tailType === 'right' && <BlockMath math={`${paramSymbol}_{crit} = ${muSymbol} + ${varianceKnown ? 'z' : 't'}_{\\alpha} \\cdot SE`} />}
                                                                                        {tailType === 'left' && <BlockMath math={`${paramSymbol}_{crit} = ${muSymbol} - ${varianceKnown ? 'z' : 't'}_{\\alpha} \\cdot SE`} />}
                                                                                        {tailType === 'two-tailed' && <BlockMath math={`${paramSymbol}_{crit_{1,2}} = ${muSymbol} \\pm ${varianceKnown ? 'z' : 't'}_{\\alpha/2} \\cdot SE`} />}
                                                                                    </FormulaBlock>
                                                                                    <CalcBlock>
                                                                                        <div className="pt-2">
                                                                                            <div className="text-[var(--color-success)] font-bold">
                                                                                                {tailType === 'right' && <BlockMath math={`C = \\{ ${paramSymbol} \\mid ${paramSymbol} \\ge ${paramSymbol}_{crit} \\}`} />}
                                                                                                {tailType === 'left' && <BlockMath math={`C = \\{ ${paramSymbol} \\mid ${paramSymbol} \\le ${paramSymbol}_{crit} \\}`} />}
                                                                                                {tailType === 'two-tailed' && <BlockMath math={`C = \\{ ${paramSymbol} \\mid ${paramSymbol} \\le ${paramSymbol}_{crit_1} \\text{ or } ${paramSymbol} \\ge ${paramSymbol}_{crit_2} \\}`} />}
                                                                                                <BlockMath math={`\\text{If: } ${paramSymbol} \\in C \\text{ , Reject } H_0`} />
                                                                                            </div>
                                                                                            <div className="text-[var(--color-error)] font-bold mt-4">
                                                                                                {tailType === 'right' && <BlockMath math={`\\bar{C} = \\{ ${paramSymbol} \\mid ${paramSymbol} < ${paramSymbol}_{crit} \\}`} />}
                                                                                                {tailType === 'left' && <BlockMath math={`\\bar{C} = \\{ ${paramSymbol} \\mid ${paramSymbol} > ${paramSymbol}_{crit} \\}`} />}
                                                                                                {tailType === 'two-tailed' && <BlockMath math={`\\bar{C} = \\{ ${paramSymbol} \\mid ${paramSymbol}_{crit_1} < ${paramSymbol} < ${paramSymbol}_{crit_2} \\}`} />}
                                                                                                <BlockMath math={`\\text{If: } ${paramSymbol} \\in \\bar{C} \\text{ , Fail to Reject } H_0`} />
                                                                                            </div>
                                                                                        </div>
                                                                                    </CalcBlock>
                                                                                </div>
                                                                                <p className="text-xl sm:text-2xl font-handwriting font-normal text-[var(--color-text-primary)] leading-relaxed text-center mt-6 mb-2">
                                                                                    <PenTool size={22} className="inline-block ml-2 opacity-60 text-[var(--color-accent-cobalt)]" />{' '}
                                                                                    בכלל אזור הדחייה (הערך המקורי) נדחה את <strong className="text-white">השערת האפס</strong> (<InlineMath math="H_0" />) אם הערך המקורי של המדגם שייך לקבוצת הדחייה (<InlineMath math="C" />).
                                                                                </p>
                                                                            </div>
                                                                        </AnimatedDetails>
                                                                    );
                                                                })()}

                                                                {/* Approach 3 */}
                                                                <AnimatedDetails className="group rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm transition-all duration-300 [&_summary::-webkit-details-marker]:hidden" defaultOpen={false}>
                                                                    <summary className="flex items-center gap-3 p-4 sm:p-5 cursor-pointer text-[var(--color-accent-cobalt)] font-bold outline-none select-none hover:bg-[var(--color-surface-raised)] rounded-t-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                                                                        <div className="flex-1 flex items-center gap-3">
                                                                            <Percent size={20} />
                                                                            <span className="text-lg sm:text-xl">כלל מובהקות התוצאה (P-Value)</span>
                                                                        </div>
                                                                        <ChevronDown size={22} className="transition-transform duration-300 group-[.is-open]:rotate-180 text-[var(--color-text-secondary)]" />
                                                                    </summary>
                                                                    <div className="p-4 sm:p-6 bg-[var(--color-surface-raised)]/50 rounded-b-lg">
                                                                        <div className="py-2 space-y-4 text-xl md:text-2xl">
                                                                            <FormulaBlock
                                                                                formulaName="ערך ה-P (P-Value)"
                                                                                translation="ההסתברות לקבל תוצאה קיצונית לפחות כמו במדגם שלנו, בהנחה שהשערת האפס נכונה. מחושב כשטח מתחת לעקומה מעבר לסטטיסטי המבחן."
                                                                            >
                                                                                {tailType === 'right' && (
                                                                                    varianceKnown ?
                                                                                        <BlockMath math={`P\\text{-Value} = P(Z \\ge Z_{\\text{stat}}) = 1 - \\Phi(Z_{\\text{stat}})`} /> :
                                                                                        <BlockMath math={`P\\text{-Value} = P(t_{(n-1)} \\ge t_{\\text{stat}})`} />
                                                                                )}
                                                                                {tailType === 'left' && (
                                                                                    varianceKnown ?
                                                                                        <BlockMath math={`P\\text{-Value} = P(Z \\le Z_{\\text{stat}}) = \\Phi(Z_{\\text{stat}})`} /> :
                                                                                        <BlockMath math={`P\\text{-Value} = P(t_{(n-1)} \\le t_{\\text{stat}})`} />
                                                                                )}
                                                                                {tailType === 'two-tailed' && (
                                                                                    varianceKnown ?
                                                                                        <BlockMath math={`P\\text{-Value} = 2 \\cdot P(Z \\ge |Z_{\\text{stat}}|) = 2 \\cdot (1 - \\Phi(|Z_{\\text{stat}}|))`} /> :
                                                                                        <BlockMath math={`P\\text{-Value} = 2 \\cdot P(|t_{(n-1)}| \\ge |t_{\\text{stat}}|)`} />
                                                                                )}
                                                                            </FormulaBlock>
                                                                            <CalcBlock>
                                                                                <div className="pt-2">
                                                                                    <div className="text-[var(--color-success)] font-bold">
                                                                                        <BlockMath math={`\\text{If: P-Value } \\le \\alpha \\text{ , Reject } H_0`} />
                                                                                    </div>
                                                                                    <div className="text-[var(--color-error)] font-bold mt-4">
                                                                                        <BlockMath math={`\\text{If: P-Value } > \\alpha \\text{ , Fail to Reject } H_0`} />
                                                                                    </div>
                                                                                </div>
                                                                            </CalcBlock>
                                                                        </div>
                                                                        <p className="text-xl sm:text-2xl font-handwriting font-normal text-[var(--color-text-primary)] leading-relaxed text-center mt-6 mb-2">
                                                                            <PenTool size={22} className="inline-block ml-2 opacity-60 text-[var(--color-accent-cobalt)]" />{' '}
                                                                            בכלל מובהקות התוצאה נדחה את <strong className="text-white">השערת האפס</strong> (<InlineMath math="H_0" />) אם ההסתברות לקבל תוצאת מדגם כזו או קיצונית ממנה קטנה או שווה לרמת המובהקות (<InlineMath math="\alpha" />).
                                                                        </p>
                                                                    </div>
                                                                </AnimatedDetails>
                                                            </div>
                                                        </div>
                                                    </div></AnimatedDetails>


                                                {/* Step 5: P-Value Calculation */}
                                                <AnimatedDetails className="group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm text-right [&_summary::-webkit-details-marker]:hidden">

                                                    <summary className="p-4 sm:p-5 flex items-center justify-between cursor-pointer list-none hover:bg-[var(--color-surface)]/50 transition-colors rounded-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                                                        <div className="flex items-center gap-3 font-extrabold text-[var(--color-accent-brass)]">
                                                            <span className="w-9 h-9 rounded-full bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-accent-brass)]/20 text-[var(--color-accent-brass)] text-base font-black flex items-center justify-center border border-[var(--color-accent-brass)]/50 shrink-0 shrink-0">5</span>
                                                            <span className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">חישוב סטטיסטי המבחן</span>
                                                        </div>
                                                        <div className="text-[var(--color-text-secondary)] group-[.is-open]:rotate-180 transition-transform duration-300">
                                                            <ChevronDown size={24} />
                                                        </div>
                                                    </summary>
                                                    <div className="p-5 sm:p-6 space-y-4">


                                                        <div className="pr-5 py-1 space-y-5">
                                                            <p className="text-base sm:text-lg text-[var(--color-text-primary)] leading-relaxed font-semibold">
                                                                נחשב את שגיאת התקן (SE) של ההתפלגות שלנו ע"י{' '}
                                                                {testType === 'single' ? (
                                                                    <span dir="ltr"><InlineMath math={varianceKnown ? '\\sigma' : 'S'} /></span>
                                                                ) : testType === 'mean' ? (
                                                                    <span dir="ltr"><InlineMath math={`\\frac{${varianceKnown ? '\\sigma' : 'S'}}{\\sqrt{n}}`} /></span>
                                                                ) : (
                                                                    <span dir="ltr"><InlineMath math={`\\sqrt{n} \\cdot ${varianceKnown ? '\\sigma' : 'S'}`} /></span>
                                                                )}
                                                                :
                                                            </p>
                                                            <div className="py-3 space-y-4 text-xl md:text-2xl">


                                                                <CalcBlock>
                                                                    {testType === 'single' ? (
                                                                        <BlockMath math={`SMoE = ${varianceKnown ? '\\sigma' : 'S'} = ${sigmaInput}`} />
                                                                    ) : testType === 'mean' ? (
                                                                        <BlockMath math={`SE = \\frac{${sigmaInput}}{\\sqrt{${nInput}}} = \\frac{${sigmaInput}}{${Math.sqrt(n).toFixed(4)}} = ${stats.se.toFixed(4)}`} />
                                                                    ) : (
                                                                        <BlockMath math={`SE = \\sqrt{${nInput}} \\cdot ${sigmaInput} = ${Math.sqrt(n).toFixed(4)} \\cdot ${sigmaInput} = ${stats.se.toFixed(4)}`} />
                                                                    )}
                                                                </CalcBlock>

                                                                {testType === 'sum' && (
                                                                    <div className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] mt-2 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                                                                        ממוצעי ההתפלגות החדשים הופכים ל-
                                                                        <InlineMath math={`n \\cdot \\mu`} />:
                                                                        <br />
                                                                        תחת H₀: <InlineMath math={`E(\\sum X) = ${nInput} \\cdot ${mu0Input} = ${stats.effectH0Mean}`} />
                                                                        <br />
                                                                        תחת H₁: <InlineMath math={`E(\\sum X) = ${nInput} \\cdot ${mu1Input} = ${stats.effectH1Mean}`} />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <p className="text-base sm:text-lg text-[var(--color-text-primary)] leading-relaxed font-semibold">
                                                                נחשב את סטטיסטי המבחן (מרחק התוצאה מ-<InlineMath math="\mu_0" /> במונחי שגיאות תקן):
                                                            </p>

                                                            {/* Raw formula template */}
                                                            <FormulaBlock
                                                                formulaName="סטטיסטי המבחן - מודד כמה סטיות תקן המדגם שלנו רחוק מהתוחלת המשוערת תחת השערת האפס."
                                                                translation="הסטטיסטי שווה לממוצע המדגם פחות התוחלת המשוערת, לחלק לשגיאת התקן."
                                                            >
                                                                {varianceKnown ? (
                                                                    <BlockMath math={`Z_{\\text{stat}} = \\frac{\\bar{X} - \\mu_0}{SE}`} />
                                                                ) : (
                                                                    <BlockMath math={`t_{\\text{stat}} = \\frac{\\bar{X} - \\mu_0}{SE}`} />
                                                                )}
                                                            </FormulaBlock>

                                                            {/* Calculation with actual values */}
                                                            <CalcBlock>
                                                                {varianceKnown ? (
                                                                    <BlockMath math={`Z_{\\text{stat}} = \\frac{${mu1} - ${mu0}}{${stats.se.toFixed(4)}} = ${decisionData.statObs.toFixed(4)}`} />
                                                                ) : (
                                                                    <BlockMath math={`t_{\\text{stat}} = \\frac{${mu1} - ${mu0}}{${stats.se.toFixed(4)}} = ${decisionData.statObs.toFixed(4)}`} />
                                                                )}
                                                            </CalcBlock>

                                                            {/* Researcher's note */}
                                                            <p className="text-xl sm:text-2xl font-handwriting font-normal text-[var(--color-text-primary)] leading-relaxed mt-6 text-center">
                                                                <PenTool size={22} className="inline-block ml-2 opacity-60 text-[var(--color-accent-cobalt)]" /> מצאנו כי סטטיסטי המבחן (מרחק התוצאה מתוחלת <InlineMath math="H_0" />) הוא <span dir="ltr"><InlineMath math={`${varianceKnown ? 'Z' : 't'} = ${decisionData.statObs.toFixed(4)}`} /></span>.
                                                            </p>
                                                        </div>
                                                    </div></AnimatedDetails>

                                                {/* Step 6: P-Value Calculation and Final Decision */}
                                                <AnimatedDetails id="step-6" className="group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm text-right [&_summary::-webkit-details-marker]:hidden">

                                                    <summary className="p-4 sm:p-5 flex items-center justify-between cursor-pointer list-none hover:bg-[var(--color-surface)]/50 transition-colors rounded-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                                                        <div className="flex items-center gap-3 font-extrabold text-[var(--color-accent-brass)]">
                                                            <span className="w-9 h-9 rounded-full bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-accent-brass)]/20 text-[var(--color-accent-brass)] text-base font-black flex items-center justify-center border border-[var(--color-accent-brass)]/50 shrink-0 shrink-0">6</span>
                                                            <span className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)]">קבלת החלטה / הסקת מסקנות</span>
                                                            <span className="text-xs font-bold text-[var(--color-text-primary)]0 mr-auto font-mono">
                                                                <InlineMath math="\alpha" /> = {alpha} | <InlineMath math="n" /> = {n}
                                                            </span>
                                                        </div>
                                                        <div className="text-[var(--color-text-secondary)] group-[.is-open]:rotate-180 transition-transform duration-300">
                                                            <ChevronDown size={24} />
                                                        </div>
                                                    </summary>
                                                    <div className="p-5 sm:p-6 space-y-4">


                                                        <div className="pr-5 py-1 space-y-5">
                                                            <p className="text-base sm:text-lg text-[var(--color-text-primary)] leading-relaxed font-semibold">
                                                                ניתן להכריע בדבר דחיית השערת האפס (<InlineMath math="H_0" />) בשלוש דרכים שקולות. בכל הגישות, ההחלטה תהיה זהה.
                                                            </p>

                                                            <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] mt-6 mb-8">
                                                                <table className="w-full text-center text-sm sm:text-base">
                                                                    <thead className="bg-[var(--color-surface)] text-[var(--color-accent-cobalt)]">
                                                                        <tr>
                                                                            <th className="p-4 font-bold border-b border-[var(--color-border)]/50 text-center">גישה</th>
                                                                            <th className="p-4 font-bold border-b border-[var(--color-border)]/50 text-center">מדד ההשוואה</th>
                                                                            <th className="p-4 font-bold border-b border-[var(--color-border)]/50 text-center">כלל ההחלטה (מבחן {tailType === 'right' ? 'ימני' : tailType === 'left' ? 'שמאלי' : 'דו-צדדי'})</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]">
                                                                        <tr className="border-b border-[var(--color-border)]">
                                                                            <td className="p-4 font-bold text-center">סטטיסטי המבחן</td>
                                                                            <td className="p-4 text-center" dir="ltr"><InlineMath math={`${varianceKnown ? 'Z' : 't'}_{stat} \\text{ Vs. } ${varianceKnown ? 'z' : 't'}_{${tailType === 'two-tailed' ? '\\alpha/2' : '\\alpha'}}`} /></td>
                                                                            <td className="p-4 text-center">אם <span dir="ltr"><InlineMath math={`${tailType === 'two-tailed' ? '|' : ''}${varianceKnown ? 'Z' : 't'}_{stat}${tailType === 'two-tailed' ? '|' : ''} ${tailType === 'left' ? '\\le' : '\\ge'} ${tailType === 'left' ? '-' : ''}${varianceKnown ? 'z' : 't'}_{${tailType === 'two-tailed' ? '\\alpha/2' : '\\alpha'}}`} /></span> &larr; דחיית <InlineMath math="H_0" /></td>
                                                                        </tr>
                                                                        <tr className="border-b border-[var(--color-border)]">
                                                                            <td className="p-4 font-bold text-center">אזור הדחייה</td>
                                                                            <td className="p-4 text-center" dir="ltr"><InlineMath math="\bar{X} \in \{C \mid \bar{C}\}" /></td>
                                                                            <td className="p-4 text-center">אם <span dir="ltr"><InlineMath math="\bar{X} \in C" /></span> &larr; דחיית <InlineMath math="H_0" /></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td className="p-4 font-bold text-center">הסתברות מובהקות</td>
                                                                            <td className="p-4 text-center" dir="ltr"><InlineMath math="\text{P-Value} \text{ Vs. } \alpha" /></td>
                                                                            <td className="p-4 text-center">אם <span dir="ltr"><InlineMath math="\text{P-Value} \le \alpha" /></span> &larr; דחיית <InlineMath math="H_0" /></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>

                                                            {(() => {
                                                                const Z_stat = decisionData.statObs;
                                                                const Z_crit = Math.abs(stats.zCrit);
                                                                const C_crit = stats.C_bar_value;
                                                                const C_crit_1 = stats.C_bar_value_1 || 0;
                                                                const C_crit_2 = stats.C_bar_value_2 || 0;
                                                                const X_bar = decisionData.xBar;
                                                                const pVal = decisionData.pValue;
                                                                const isReject = decisionData.isReject;

                                                                const statSymbol = varianceKnown ? 'Z' : 't';
                                                                const critSymbol = varianceKnown ? 'z' : 't';
                                                                const alphaSymbol = tailType === 'two-tailed' ? '\\alpha/2' : '\\alpha';

                                                                return (
                                                                    <div className="space-y-4">
                                                                        {/* Accordion 1 */}
                                                                        <AnimatedDetails className="group border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] overflow-hidden">
                                                                            <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-5 text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors [&::-webkit-details-marker]:hidden">
                                                                                <div className="flex items-center gap-3">
                                                                                    <span className="w-8 h-8 rounded-full bg-[var(--color-accent-cobalt-bg)]/20 text-[var(--color-accent-cobalt)] flex items-center justify-center font-mono">1</span>
                                                                                    <span>סטטיסטי המבחן <span className="text-sm font-normal text-[var(--color-text-secondary)] hidden sm:inline-block mr-1">(Standardized Scale)</span></span>
                                                                                </div>
                                                                                <span className="transition group-[.is-open]:rotate-180">
                                                                                    <ChevronDown size={20} className="text-[var(--color-text-primary)]0" />
                                                                                </span>
                                                                            </summary>
                                                                            <div className="p-5 border-t border-[var(--color-border)]/50 text-[var(--color-text-primary)] space-y-4">
                                                                                <div className="mb-4 text-[var(--color-text-primary)] leading-relaxed text-sm sm:text-base">
                                                                                    <p className="mb-2">גישה זו מנרמלת את המדגם לציון תקן, המציין כמה סטיות תקן הוא מרוחק מתוחלת האפס.</p>
                                                                                    <strong className="text-[var(--color-text-primary)]">דרך החישוב:</strong>
                                                                                    <div className="bg-[var(--color-surface-raised)] p-3 rounded-lg border border-[var(--color-border)]/50 mt-2 mb-3 overflow-x-auto">
                                                                                        <BlockMath math={`${statSymbol}_{stat} = \\frac{\\bar{X} - \\mu_0}{SE} = \\frac{${X_bar.toFixed(3)} - ${mu0}}{${stats.se.toFixed(3)}} = ${Z_stat.toFixed(3)}`} />
                                                                                    </div>
                                                                                    <div className="flex gap-3 items-start bg-[var(--color-surface)] border border-[var(--color-accent-cobalt-line)]/30 p-4 rounded-lg mt-4 ml-4">
                                                                                        <Info size={20} className="text-[var(--color-accent-brass)] mt-0.5 shrink-0" />
                                                                                        <p className="text-[var(--color-text-primary)] text-sm leading-relaxed">בודקים האם התוצאה המנורמלת נמצאת מעבר לסף המובהקות (<InlineMath math={`${critSymbol}_{${alphaSymbol}}`} />) שקבענו מהטבלה.</p>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                    <div className={`bg-[var(--color-surface)] border p-4 rounded-lg text-center transition-all duration-700 ${isReject ? 'border-[var(--color-accent-teal)]/60 shadow-[0_0_15px_rgba(52,211,153,0.4)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-[var(--color-border)]'}`}>
                                                                                        <div className="text-[var(--color-success)] font-bold mb-2">אזור הדחייה (Reject <InlineMath math="H_0" />)</div>
                                                                                        <BlockMath math={
                                                                                            tailType === 'right' ? `${statSymbol} \\ge ${Z_crit.toFixed(3)}` :
                                                                                                tailType === 'left' ? `${statSymbol} \\le -${Z_crit.toFixed(3)}` :
                                                                                                    `|${statSymbol}| \\ge ${Z_crit.toFixed(3)}`
                                                                                        } />
                                                                                    </div>
                                                                                    <div className={`bg-[var(--color-surface)] border p-4 rounded-lg text-center transition-all duration-700 ${!isReject ? 'border-[var(--color-accent-crimson)]/60 shadow-[0_0_15px_rgba(248,113,113,0.4)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-[var(--color-border)]'}`}>
                                                                                        <div className="text-[var(--color-error)] font-bold mb-2">אזור אי-הדחייה (Fail to Reject <InlineMath math="H_0" />)</div>
                                                                                        <BlockMath math={
                                                                                            tailType === 'right' ? `${statSymbol} < ${Z_crit.toFixed(3)}` :
                                                                                                tailType === 'left' ? `${statSymbol} > -${Z_crit.toFixed(3)}` :
                                                                                                    `|${statSymbol}| < ${Z_crit.toFixed(3)}`
                                                                                        } />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="bg-[var(--color-surface)] p-4 rounded-lg text-center font-mono">
                                                                                    <BlockMath math={`${statSymbol}_{stat} = ${Z_stat.toFixed(3)}`} />
                                                                                </div>
                                                                                <p className="text-xl font-handwriting font-normal text-center mt-4 leading-relaxed">
                                                                                    <span className={isReject ? 'text-[var(--color-success)] font-bold' : 'text-[var(--color-error)] font-bold'}>
                                                                                        {isReject ? `דחיית השערת האפס (Reject H0)` : `אי-דחיית השערת האפס (Fail to reject H0)`}
                                                                                    </span>
                                                                                    <span className="text-white">
                                                                                        {' '}מכיוון שציון התקן (<InlineMath math={statSymbol} />) שחושב עבור ממוצע המדגם <strong dir="ltr" className="inline-block px-1"><InlineMath math={`\\bar{X} = ${X_bar.toFixed(3)}`} /></strong> הינו <strong dir="ltr" className="inline-block px-1"><InlineMath math={`${Z_stat.toFixed(3)}`} /></strong>, אשר נופל ב{isReject ? 'אזור הדחייה' : 'אזור אי-הדחייה'}.
                                                                                    </span>
                                                                                </p>
                                                                            </div>
                                                                        </AnimatedDetails>

                                                                        {/* Accordion 2 */}
                                                                        <AnimatedDetails className="group border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] overflow-hidden">
                                                                            <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-5 text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors [&::-webkit-details-marker]:hidden">
                                                                                <div className="flex items-center gap-3">
                                                                                    <span className="w-8 h-8 rounded-full bg-[var(--color-accent-cobalt-bg)]/20 text-[var(--color-accent-cobalt)] flex items-center justify-center font-mono">2</span>
                                                                                    <span>אזורי דחייה/אי-דחייה ע"פ ממוצע המדגם <span dir="ltr" className="inline-block px-1">(<InlineMath math="\bar{X}" />)</span> <span className="text-sm font-normal text-[var(--color-text-secondary)] hidden sm:inline-block mr-1">(Original Scale)</span></span>
                                                                                </div>
                                                                                <span className="transition group-[.is-open]:rotate-180">
                                                                                    <ChevronDown size={20} className="text-[var(--color-text-primary)]0" />
                                                                                </span>
                                                                            </summary>
                                                                            <div className="p-5 border-t border-[var(--color-border)]/50 text-[var(--color-text-primary)] space-y-4">
                                                                                <div className="mb-4 text-[var(--color-text-primary)] leading-relaxed text-sm sm:text-base">
                                                                                    <p className="mb-2">גישה זו מציגה את הסף ביחידות המקוריות של הבעיה, המאפשרת השוואה ישירה לממוצע המדגם.</p>
                                                                                    <strong className="text-[var(--color-text-primary)]">דרך החישוב:</strong>
                                                                                    <div className="bg-[var(--color-surface-raised)] p-3 rounded-lg border border-[var(--color-border)]/50 mt-2 mb-3 overflow-x-auto">
                                                                                        <BlockMath math={`C = \\mu_0 ${tailType === 'left' ? '-' : tailType === 'right' ? '+' : '\\pm'} ${critSymbol}_{${alphaSymbol}} \\cdot SE`} />
                                                                                        <BlockMath math={`C = ${mu0} ${tailType === 'left' ? '-' : tailType === 'right' ? '+' : '\\pm'} ${Z_crit.toFixed(3)} \\cdot ${stats.se.toFixed(3)} ${tailType === 'two-tailed' ? `\\Rightarrow [${C_crit_1.toFixed(3)}, ${C_crit_2.toFixed(3)}]` : `= ${C_crit.toFixed(3)}`}`} />
                                                                                    </div>
                                                                                    <div className="flex gap-3 items-start bg-[var(--color-surface)] border border-[var(--color-accent-cobalt-line)]/30 p-4 rounded-lg mt-4 ml-4">
                                                                                        <Info size={20} className="text-[var(--color-accent-brass)] mt-0.5 shrink-0" />
                                                                                        <p className="text-[var(--color-text-primary)] text-sm leading-relaxed">כל תוצאה השייכת לקבוצת הדחייה <span dir="ltr" className="inline-block px-1"><InlineMath math={`C = \\{ \\bar{X} \\mid ${tailType === 'left' ? '\\bar{X} \\le C' : tailType === 'right' ? '\\bar{X} \\ge C' : `\\bar{X} \\le C_1 \\text{ or } \\bar{X} \\ge C_2`} \\}`} /></span> מעידה על כך שהמדגם אינו עולה בקנה אחד עם השערת האפס.</p>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                    <div className={`bg-[var(--color-surface)] border p-4 rounded-lg text-center transition-all duration-700 ${isReject ? 'border-[var(--color-accent-teal)]/60 shadow-[0_0_15px_rgba(52,211,153,0.4)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-[var(--color-border)]'}`}>
                                                                                        <div className="text-[var(--color-success)] font-bold mb-2">אזור הדחייה (<InlineMath math="C" />)</div>
                                                                                        <BlockMath math={
                                                                                            tailType === 'right' ? `\\bar{X} \\ge ${C_crit.toFixed(3)}` :
                                                                                                tailType === 'left' ? `\\bar{X} \\le ${C_crit.toFixed(3)}` :
                                                                                                    `\\bar{X} \\le ${C_crit_1.toFixed(3)} \\text{ or } \\bar{X} \\ge ${C_crit_2.toFixed(3)}`
                                                                                        } />
                                                                                    </div>
                                                                                    <div className={`bg-[var(--color-surface)] border p-4 rounded-lg text-center transition-all duration-700 ${!isReject ? 'border-[var(--color-accent-crimson)]/60 shadow-[0_0_15px_rgba(248,113,113,0.4)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-[var(--color-border)]'}`}>
                                                                                        <div className="text-[var(--color-error)] font-bold mb-2">אזור אי-הדחייה (<InlineMath math="\\bar{C}" />)</div>
                                                                                        <BlockMath math={
                                                                                            tailType === 'right' ? `\\bar{X} < ${C_crit.toFixed(3)}` :
                                                                                                tailType === 'left' ? `\\bar{X} > ${C_crit.toFixed(3)}` :
                                                                                                    `${C_crit_1.toFixed(3)} < \\bar{X} < ${C_crit_2.toFixed(3)}`
                                                                                        } />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="bg-[var(--color-surface)] p-4 rounded-lg text-center font-mono">
                                                                                    <BlockMath math={`\\bar{X} = ${X_bar.toFixed(3)}`} />
                                                                                </div>
                                                                                <p className="text-xl font-handwriting font-normal text-center mt-4 leading-relaxed">
                                                                                    <span className={isReject ? 'text-[var(--color-success)] font-bold' : 'text-[var(--color-error)] font-bold'}>
                                                                                        {isReject ? `דחיית השערת האפס (Reject H0)` : `אי-דחיית השערת האפס (Fail to reject H0)`}
                                                                                    </span>
                                                                                    <span className="text-white">
                                                                                        {' '}מכיוון שממוצע המדגם שהתקבל, <strong dir="ltr" className="inline-block px-1"><InlineMath math={`\\bar{X} = ${X_bar.toFixed(3)}`} /></strong>, ממוקם ב{isReject ? 'אזור הדחייה' : 'אזור אי-הדחייה'} (<strong dir="ltr" className="inline-block px-1"><InlineMath math={isReject ? 'C' : '\\bar{C}'} /></strong>).
                                                                                    </span>
                                                                                </p>
                                                                            </div>
                                                                        </AnimatedDetails>

                                                                        {/* Accordion 3 */}
                                                                        <AnimatedDetails className="group border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] overflow-hidden">
                                                                            <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-5 text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors [&::-webkit-details-marker]:hidden">
                                                                                <div className="flex items-center gap-3">
                                                                                    <span className="w-8 h-8 rounded-full bg-[var(--color-accent-cobalt-bg)]/20 text-[var(--color-accent-cobalt)] flex items-center justify-center font-mono">3</span>
                                                                                    <span>מובהקות התוצאה (P-Value) <span className="text-sm font-normal text-[var(--color-text-secondary)] hidden sm:inline-block mr-1">(Probability)</span></span>
                                                                                </div>
                                                                                <span className="transition group-[.is-open]:rotate-180">
                                                                                    <ChevronDown size={20} className="text-[var(--color-text-primary)]0" />
                                                                                </span>
                                                                            </summary>
                                                                            <div className="p-5 border-t border-[var(--color-border)]/50 text-[var(--color-text-primary)] space-y-4">
                                                                                <div className="mb-4 text-[var(--color-text-primary)] leading-relaxed text-sm sm:text-base">
                                                                                    <p className="mb-2">גישה זו מודדת את הסבירות לקבלת התוצאה שנצפתה מהמדגם המקרי תחת התפלגות <InlineMath math="H_0" />, אל מול רמת המובהקות שנקבעה (<InlineMath math="\alpha" />).</p>
                                                                                    <strong className="text-[var(--color-text-primary)]">דרך החישוב:</strong>
                                                                                    <div className="bg-[var(--color-surface-raised)] p-3 rounded-lg border border-[var(--color-border)]/50 mt-2 mb-3 overflow-x-auto">
                                                                                        <BlockMath math={tailType === 'right' ? `P\\text{-value} = P(${statSymbol} > ${statSymbol}_{stat})` : tailType === 'left' ? `P\\text{-value} = P(${statSymbol} < ${statSymbol}_{stat})` : `P\\text{-value} = 2 \\cdot P(${statSymbol} > |${statSymbol}_{stat}|)`} />
                                                                                        <BlockMath math={tailType === 'right' ? `P\\text{-value} = P(${statSymbol} > ${Z_stat.toFixed(3)}) = ${pVal.toFixed(4)}` : tailType === 'left' ? `P\\text{-value} = P(${statSymbol} < ${Z_stat.toFixed(3)}) = ${pVal.toFixed(4)}` : `P\\text{-value} = 2 \\cdot P(${statSymbol} > ${Math.abs(Z_stat).toFixed(3)}) = ${pVal.toFixed(4)}`} />
                                                                                    </div>
                                                                                    <div className="flex gap-3 items-start bg-[var(--color-surface)] border border-[var(--color-accent-cobalt-line)]/30 p-4 rounded-lg mt-4 ml-4">
                                                                                        <Info size={20} className="text-[var(--color-accent-brass)] mt-0.5 shrink-0" />
                                                                                        <p className="text-[var(--color-text-primary)] text-sm leading-relaxed">ה-P-value מוגדר כהסתברות המצטברת {tailType === 'right' ? 'מימין' : tailType === 'left' ? 'משמאל' : 'בשני הקצוות מעבר'} לערך סטטיסטי המבחן. אם הסתברות זו קטנה או שווה ל-<InlineMath math="\\alpha" />, התוצאה נחשבת לנדירה מכדי להיות מקרית, מה שמצדיק את דחיית השערת האפס.</p>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                    <div className={`bg-[var(--color-surface)] border p-4 rounded-lg text-center transition-all duration-700 ${isReject ? 'border-[var(--color-accent-teal)]/60 shadow-[0_0_15px_rgba(52,211,153,0.4)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-[var(--color-border)]'}`}>
                                                                                        <div className="text-[var(--color-success)] font-bold mb-2">אזור הדחייה (Reject <InlineMath math="H_0" />)</div>
                                                                                        <BlockMath math={`\\text{P-Value} \\le ${alpha}`} />
                                                                                    </div>
                                                                                    <div className={`bg-[var(--color-surface)] border p-4 rounded-lg text-center transition-all duration-700 ${!isReject ? 'border-[var(--color-accent-crimson)]/60 shadow-[0_0_15px_rgba(248,113,113,0.4)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-[var(--color-border)]'}`}>
                                                                                        <div className="text-[var(--color-error)] font-bold mb-2">אזור אי-הדחייה (Fail to Reject <InlineMath math="H_0" />)</div>
                                                                                        <BlockMath math={`\\text{P-Value} > ${alpha}`} />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="bg-[var(--color-surface)] p-4 rounded-lg text-center font-mono">
                                                                                    <BlockMath math={`\\text{P-Value} = ${pVal.toFixed(4)}`} />
                                                                                </div>
                                                                                <p className="text-xl font-handwriting font-normal text-center mt-4 leading-relaxed">
                                                                                    <span className={isReject ? 'text-[var(--color-success)] font-bold' : 'text-[var(--color-error)] font-bold'}>
                                                                                        {isReject ? `דחיית השערת האפס (Reject H0)` : `אי-דחיית השערת האפס (Fail to reject H0)`}
                                                                                    </span>
                                                                                    <span className="text-white">
                                                                                        {' '}מכיוון שהסתברות המובהקות (P-Value) שחושבה הינה <strong dir="ltr" className="inline-block px-1"><InlineMath math={`${pVal.toFixed(4)}`} /></strong>, ערך אשר {isReject ? 'קטן או שווה ל' : 'גדול מ'}-<strong dir="ltr" className="inline-block px-1"><InlineMath math={`\\alpha = ${alpha}`} /></strong>.
                                                                                    </span>
                                                                                </p>
                                                                            </div>
                                                                        </AnimatedDetails>
                                                                    </div>
                                                                );
                                                            })()}

                                                            {unifiedDecisionResult && (
                                                                <div className="mt-10 space-y-4">
                                                                    <HypothesisTestDisplay
                                                                        result={unifiedDecisionResult}
                                                                        alpha={alpha}
                                                                        sample={decisionData.xBar}
                                                                        nullMean={stats.effectH0Mean}
                                                                        tail={tailType}
                                                                        varianceKnown={stats.varianceKnown}
                                                                        statisticSymbol={varianceKnown ? 'Z' : 't'}
                                                                        parameterSymbol={statSymbol}
                                                                    />

                                                                    <div className="bg-[var(--color-surface)] border border-[var(--color-accent-brass)]/30 p-4 rounded-lg flex gap-3 items-start">
                                                                        <AlertTriangle size={20} className="text-[var(--color-warning)] mt-0.5 shrink-0" />
                                                                        <div className="text-[var(--color-accent-brass)]/80 text-sm">
                                                                            <strong className="text-[var(--color-warning)]">הערה חשובה: </strong>
                                                                            {unifiedDecisionResult.reject ? (
                                                                                <span>
                                                                                    דחיית השערת האפס <strong>לא מוכיחה</strong> בוודאות שתוחלת האוכלוסייה (<InlineMath math="\mu" />) {tailType === 'right' ? 'גדולה יותר' : tailType === 'left' ? 'קטנה יותר' : 'שונה'}. תמיד קיים סיכוי של <strong>{alpha * 100}%</strong> (טעות מסוג I) שההחלטה שגויה, ושהתוצאה החריגה שהתקבלה במדגם הינה מקרית בלבד.
                                                                                </span>
                                                                            ) : (
                                                                                <span>
                                                                                    אי-דחיית השערת האפס <strong>לא מוכיחה</strong> שהיא נכונה. משמעות הדבר היא שפשוט אין מספיק ראיות במדגם הנוכחי כדי <strong>להצדיק</strong> את דחייתה, תחת רמת המובהקות והביטחון שנבחרו.
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div></AnimatedDetails>
                                            </>
                                        ) : (
                                            <div className="py-12 text-center font-bold text-lg md:text-xl text-[var(--color-error)] opacity-80 flex flex-col items-center gap-4 border border-[var(--color-error)]/30 bg-[var(--color-surface)] rounded-lg mt-4">
                                                <XCircle size={48} className="opacity-50" />
                                                יש לתקן את השגיאות בשלבים הקודמים כדי להמשיך בפתרון
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Confidence Interval Section */}
                    {isValid && stats && (
                        <div className="tour-step-accordion-ci rounded-lg border shadow-md transition-all overflow-hidden bg-[var(--color-surface)] border-[var(--color-border)] w-full min-w-0 lg:col-span-2 order-4 lg:order-4 text-right mt-6">
                            <button
                                onClick={() => setShowCI(!showCI)}
                                className="relative overflow-hidden w-full px-8 py-5.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-black text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors border-b border-[var(--color-border)]"
                            >
                                <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" dir="ltr">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-12 opacity-10 text-4xl sm:text-5xl font-mono text-[var(--color-accent-teal)]">
                                        <InlineMath math="1-\alpha" />
                                    </div>
                                    <div className="absolute left-1/4 top-1/2 -translate-y-1/2 rotate-6 opacity-10 text-4xl sm:text-5xl font-mono text-[var(--color-accent-crimson)]">
                                        <InlineMath math="1-\beta" />
                                    </div>
                                    <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -rotate-6 opacity-10 text-4xl sm:text-5xl font-mono text-[var(--color-accent-cobalt)]">
                                        <InlineMath math="\text{CI}" />
                                    </div>
                                    <div className="absolute right-1/4 top-1/2 -translate-y-1/2 rotate-12 opacity-10 text-5xl sm:text-6xl font-mono text-[var(--color-accent-violet)]">
                                        <InlineMath math="\beta" />
                                    </div>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 -rotate-12 opacity-10 text-4xl sm:text-5xl font-mono text-[var(--color-accent-sage)]">
                                        <InlineMath math="\text{Power}" />
                                    </div>
                                </div>
                                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 text-right">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-[var(--color-accent-cobalt-bg)]/20 p-2 rounded-lg text-[var(--color-accent-cobalt)]"><Target size={24} /></div>
                                        <span className="text-xl sm:text-2xl font-black flex items-center flex-wrap gap-2">
                                            רווח סמך לתוחלת
                                            <span className="text-base sm:text-lg font-serif text-[var(--color-text-secondary)] opacity-80" dir="ltr">
                                                <InlineMath math="\text{Confidence Interval}" />
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                <div className="relative z-10 flex items-center self-end sm:self-auto gap-4">
                                    <div className="text-[var(--color-text-secondary)]">
                                        {showCI ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                    </div>
                                </div>
                            </button>

                            <AnimatePresence>
                                {showCI && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="p-5 sm:p-8 space-y-8 bg-[var(--color-surface)] text-right">
                                    <div className="text-base sm:text-lg text-[var(--color-text-primary)] leading-relaxed">
                                        <h3 className="font-bold underline mb-2 text-xl">רווח סמך</h3>
                                        <p>
                                            זוהי אמידה מרווחית (באינטרוול) של פרמטר באוכלוסייה, ע"י שימוש בתוצאות מדגם. רווח הסמך נבנה כך שההסתברות שהפרמטר יהיה בתוך הקטע נקבעת מראש ושווה <InlineMath math="1-\alpha" />. הסתברות זו נקראת <strong>"רמת סמך"</strong> או <strong>"רמת בטחון"</strong>.
                                        </p>
                                        <p className="mt-2">
                                            <InlineMath math="\alpha" /> נקראת <strong>"רמת מובהקות"</strong> (היא השגיאה המותרת באומדן) <InlineMath math="0 \le \alpha \le 1" />.
                                        </p>
                                    </div>

                                    {/* --- CI CONTROLS --- */}
                                    <div className="flex flex-col md:flex-row gap-6 p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm mb-6">
                                        <div className="flex-1 space-y-3">
                                            <span className="text-sm font-bold text-[var(--color-text-secondary)]">סוג רווח הסמך:</span>
                                            <div className="flex gap-2">
                                                {[
                                                    { id: 'left', label: 'חסם עליון' },
                                                    { id: 'two-tailed', label: 'דו-צדדי' },
                                                    { id: 'right', label: 'חסם תחתון' }
                                                ].map(t => (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => setCiTailType(t.id as TailType)}
                                                        className={`flex-1 py-2 px-2 text-sm font-bold rounded-md border transition-all ${ciTailType === t.id ? 'bg-[var(--color-accent-cobalt-bg)] border-[var(--color-accent-cobalt)] text-[var(--color-accent-cobalt)] shadow-sm' : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)]'}`}
                                                    >
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <span className="text-sm font-bold text-[var(--color-text-secondary)]">רמת סמך (<InlineMath math="1-\alpha" />):</span>
                                            <div className="flex gap-2">
                                                {[0.01, 0.05, 0.10].map((pVal) => (
                                                    <button
                                                        key={pVal}
                                                        onClick={() => applyCiAlphaPreset(pVal)}
                                                        className={`flex-1 py-2 px-2 text-sm font-bold rounded-md border transition-all ${ciAlpha === pVal ? 'bg-[var(--color-accent-cobalt-bg)] border-[var(--color-accent-cobalt)] text-[var(--color-accent-cobalt)] shadow-sm' : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)]'}`}
                                                    >
                                                        {((1 - pVal) * 100).toFixed(0)}%
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Known Variance */}
                                    <div className={`p-6 rounded-lg border transition-all ${varianceKnown ? 'bg-[var(--color-surface)] border-[var(--color-accent-cobalt-line)]/50 shadow-sm' : 'bg-[var(--color-surface-raised)] border-[var(--color-border)] opacity-70'}`}>
                                        <h3 className="font-bold text-lg mb-4 underline">רווח סמך עבור תוחלת האוכלוסייה, כאשר שונותה ידועה</h3>
                                        <FormulaBlock
                                            formulaName="רווח בר סמך לתוחלת (Z)"
                                            translation="טווח הערכים שבו אנו מעריכים שהתוחלת האמיתית של האוכלוסייה תימצא ברמת ביטחון מסוימת. מבוסס על התפלגות Z כיוון שסטיית התקן של האוכלוסייה נתונה."
                                        >
                                            {ciTailType === 'two-tailed' ? (
                                                <BlockMath math={`\\text{רו"ס ברמת סמך } 1-\\alpha \\text{ עבור } \\mu : \\quad \\bar{X} \\pm z_{1-\\alpha/2} \\frac{\\sigma}{\\sqrt{n}}`} />
                                            ) : ciTailType === 'left' ? (
                                                <BlockMath math={`\\text{חסם עליון ברמת סמך } 1-\\alpha \\text{ עבור } \\mu : \\quad (-\\infty, \\bar{X} + z_{1-\\alpha} \\frac{\\sigma}{\\sqrt{n}}]`} />
                                            ) : (
                                                <BlockMath math={`\\text{חסם תחתון ברמת סמך } 1-\\alpha \\text{ עבור } \\mu : \\quad [\\bar{X} - z_{1-\\alpha} \\frac{\\sigma}{\\sqrt{n}}, \\infty)`} />
                                            )}
                                        </FormulaBlock>

                                        {varianceKnown && stats && decisionData && (
                                            <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                                                <CalcBlock>
                                                    {ciTailType === 'two-tailed' ? (
                                                        <>
                                                            <BlockMath math={`\\bar{X} \\pm z_{${1 - ciAlpha / 2}} \\frac{${sigmaInput}}{\\sqrt{${nInput}}} = ${decisionData.xBar} \\pm ${Math.abs(inverseNormalCDF(ciAlpha / 2)).toFixed(3)} \\cdot ${stats.se.toFixed(4)}`} />
                                                            <BlockMath math={`[${(decisionData.xBar - Math.abs(inverseNormalCDF(ciAlpha / 2)) * stats.se).toFixed(4)}, ${(decisionData.xBar + Math.abs(inverseNormalCDF(ciAlpha / 2)) * stats.se).toFixed(4)}]`} />
                                                        </>
                                                    ) : ciTailType === 'left' ? (
                                                        <>
                                                            <BlockMath math={`\\bar{X} + z_{${1 - ciAlpha}} \\frac{${sigmaInput}}{\\sqrt{${nInput}}} = ${decisionData.xBar} + ${Math.abs(inverseNormalCDF(ciAlpha)).toFixed(3)} \\cdot ${stats.se.toFixed(4)}`} />
                                                            <BlockMath math={`(-\\infty, ${(decisionData.xBar + Math.abs(inverseNormalCDF(ciAlpha)) * stats.se).toFixed(4)}]`} />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <BlockMath math={`\\bar{X} - z_{${1 - ciAlpha}} \\frac{${sigmaInput}}{\\sqrt{${nInput}}} = ${decisionData.xBar} - ${Math.abs(inverseNormalCDF(ciAlpha)).toFixed(3)} \\cdot ${stats.se.toFixed(4)}`} />
                                                            <BlockMath math={`[${(decisionData.xBar - Math.abs(inverseNormalCDF(ciAlpha)) * stats.se).toFixed(4)}, \\infty)`} />
                                                        </>
                                                    )}
                                                </CalcBlock>
                                            </div>
                                        )}
                                    </div>

                                    {/* Unknown Variance */}
                                    <div className={`p-6 rounded-lg border transition-all ${!varianceKnown ? 'bg-[var(--color-surface)] border-[var(--color-accent-teal)]/50 shadow-sm' : 'bg-[var(--color-surface-raised)] border-[var(--color-border)] opacity-70'}`}>
                                        <h3 className="font-bold text-lg mb-4 underline">רווח סמך עבור תוחלת האוכלוסייה, כאשר שונותה איננה ידועה</h3>
                                        <div className="text-base sm:text-lg mb-4 text-[var(--color-text-primary)]">
                                            נסמן את סטיית התקן המדגמית:
                                            <BlockMath math={`S = \\sqrt{\\frac{\\sum(x_i - \\bar{x})^2}{n-1}} = \\sqrt{\\frac{\\sum x_i^2 - n\\bar{x}^2}{n-1}}`} />
                                        </div>
                                        <FormulaBlock
                                            formulaName="רווח בר סמך לתוחלת (T)"
                                            translation="מחשב את טווח הערכים שבו התוחלת עשויה להיות ברמת ביטחון נתונה. משתמש בסטיית התקן של המדגם, ולכן מסתמך על התפלגות T של סטודנט."
                                        >
                                            {ciTailType === 'two-tailed' ? (
                                                <BlockMath math={`\\text{רו"ס ברמת סמך } 1-\\alpha \\text{ עבור } \\mu : \\quad \\bar{X} \\pm t_{(n-1, 1-\\alpha/2)} \\frac{S}{\\sqrt{n}}`} />
                                            ) : ciTailType === 'left' ? (
                                                <BlockMath math={`\\text{חסם עליון ברמת סמך } 1-\\alpha \\text{ עבור } \\mu : \\quad (-\\infty, \\bar{X} + t_{(n-1, 1-\\alpha)} \\frac{S}{\\sqrt{n}}]`} />
                                            ) : (
                                                <BlockMath math={`\\text{חסם תחתון ברמת סמך } 1-\\alpha \\text{ עבור } \\mu : \\quad [\\bar{X} - t_{(n-1, 1-\\alpha)} \\frac{S}{\\sqrt{n}}, \\infty)`} />
                                            )}
                                        </FormulaBlock>

                                        {!varianceKnown && stats && decisionData && (
                                            <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                                                <CalcBlock>
                                                    {ciTailType === 'two-tailed' ? (
                                                        <>
                                                            <BlockMath math={`\\bar{X} \\pm t_{(${stats.df}, ${1 - ciAlpha / 2})} \\frac{${sigmaInput}}{\\sqrt{${nInput}}} = ${decisionData.xBar} \\pm ${Math.abs(studentTPPF(ciAlpha / 2, stats.df)).toFixed(3)} \\cdot ${stats.se.toFixed(4)}`} />
                                                            <BlockMath math={`[${(decisionData.xBar - Math.abs(studentTPPF(ciAlpha / 2, stats.df)) * stats.se).toFixed(4)}, ${(decisionData.xBar + Math.abs(studentTPPF(ciAlpha / 2, stats.df)) * stats.se).toFixed(4)}]`} />
                                                        </>
                                                    ) : ciTailType === 'left' ? (
                                                        <>
                                                            <BlockMath math={`\\bar{X} + t_{(${stats.df}, ${1 - ciAlpha})} \\frac{${sigmaInput}}{\\sqrt{${nInput}}} = ${decisionData.xBar} + ${Math.abs(studentTPPF(ciAlpha, stats.df)).toFixed(3)} \\cdot ${stats.se.toFixed(4)}`} />
                                                            <BlockMath math={`(-\\infty, ${(decisionData.xBar + Math.abs(studentTPPF(ciAlpha, stats.df)) * stats.se).toFixed(4)}]`} />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <BlockMath math={`\\bar{X} - t_{(${stats.df}, ${1 - ciAlpha})} \\frac{${sigmaInput}}{\\sqrt{${nInput}}} = ${decisionData.xBar} - ${Math.abs(studentTPPF(ciAlpha, stats.df)).toFixed(3)} \\cdot ${stats.se.toFixed(4)}`} />
                                                            <BlockMath math={`[${(decisionData.xBar - Math.abs(studentTPPF(ciAlpha, stats.df)) * stats.se).toFixed(4)}, \\infty)`} />
                                                        </>
                                                    )}
                                                </CalcBlock>
                                            </div>
                                        )}
                                    </div>

                                </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Power Section */}
                    {isValid && stats && (
                        <div className="rounded-lg border shadow-md transition-all overflow-hidden bg-[var(--color-surface)] border-[var(--color-border)] w-full min-w-0 lg:col-span-2 order-5 lg:order-5 text-right mt-6">
                            <button
                                onClick={() => setShowPower(!showPower)}
                                className="relative overflow-hidden w-full px-8 py-5.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-black text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors border-b border-[var(--color-border)]"
                            >
                                <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" dir="ltr">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-12 opacity-10 text-4xl sm:text-5xl font-mono text-[var(--color-accent-teal)]">
                                        <InlineMath math="1-\alpha" />
                                    </div>
                                    <div className="absolute left-1/4 top-1/2 -translate-y-1/2 rotate-6 opacity-10 text-4xl sm:text-5xl font-mono text-[var(--color-accent-crimson)]">
                                        <InlineMath math="1-\beta" />
                                    </div>
                                    <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -rotate-6 opacity-10 text-4xl sm:text-5xl font-mono text-[var(--color-accent-cobalt)]">
                                        <InlineMath math="\text{CI}" />
                                    </div>
                                    <div className="absolute right-1/4 top-1/2 -translate-y-1/2 rotate-12 opacity-10 text-5xl sm:text-6xl font-mono text-[var(--color-accent-violet)]">
                                        <InlineMath math="\beta" />
                                    </div>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 -rotate-12 opacity-10 text-4xl sm:text-5xl font-mono text-[var(--color-accent-sage)]">
                                        <InlineMath math="\text{Power}" />
                                    </div>
                                </div>
                                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 text-right">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-[var(--color-accent-cobalt-bg)]/20 p-2 rounded-lg text-[var(--color-accent-cobalt)]"><Activity size={24} /></div>
                                        <span className="text-xl sm:text-2xl font-black flex items-center flex-wrap gap-2">
                                            עוצמת מבחן
                                            <span className="text-base sm:text-lg font-serif text-[var(--color-text-secondary)] opacity-80" dir="ltr">
                                                <InlineMath math="\text{Statistical Power}" />
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                <div className="relative z-10 flex items-center self-end sm:self-auto gap-4">
                                    <div className="text-[var(--color-text-secondary)]">
                                        {showPower ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                    </div>
                                </div>
                            </button>

                            <AnimatePresence>
                                {showPower && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="p-5 sm:p-8 space-y-8 bg-[var(--color-surface)] text-right">
                                    <p className="text-base sm:text-lg text-[var(--color-text-primary)] leading-relaxed font-semibold">
                                        טעות מסוג שני (<InlineMath math="\beta" />) היא ההסתברות לקבל החלטה שגויה של אי-דחיית השערת האפס, למרות שהיא שקרית במציאות. עוצמת המבחן (<InlineMath math="1-\beta" />) היא ההסתברות לדחות בצדק את השערת האפס (לזהות אפקט אמיתי). לצורך החישוב, יש להגדיר תוחלת ספציפית חלופית <InlineMath math="\mu_1" /> תחת <InlineMath math="H_1" />.
                                    </p>

                                    {calculatePower ? (
                                        <div className="space-y-6">
                                            <p className="text-base sm:text-lg text-[var(--color-text-primary)] leading-relaxed font-semibold">
                                                נמצא את ההסתברות לאי-דחיית <InlineMath math="H_0" /> (שהמדגם ייפול באזור <InlineMath math="\bar{C}" />), תחת ההנחה כי התוחלת האמיתית היא <InlineMath math="\mu_1" /> (התפלגות <InlineMath math="H_1" />).
                                            </p>

                                            {/* General formula template */}
                                            <FormulaBlock
                                                formulaName="חישוב עוצמת מבחן (Power)"
                                                translation="מחשב את עוצמת המבחן וההסתברות לטעות מסוג שני (β). הערך Z_{H_1} משקף את מיקום הערך הקריטי תחת ההתפלגות האלטרנטיבית."
                                            >
                                                {varianceKnown ? (
                                                    tailType === 'right' ? (
                                                        <>
                                                            <BlockMath math={`Z_{H_1} = \\frac{C - \\mu_1}{SE}`} />
                                                            <BlockMath math={`\\beta = P(\\text{Fail to Reject } H_0 \\mid H_1) = \\Phi(Z_{H_1})`} />
                                                            <BlockMath math={`\\text{Power} = 1 - \\beta`} />
                                                        </>
                                                    ) : tailType === 'left' ? (
                                                        <>
                                                            <BlockMath math={`Z_{H_1} = \\frac{C - \\mu_1}{SE}`} />
                                                            <BlockMath math={`\\beta = P(\\text{Fail to Reject } H_0 \\mid H_1) = 1 - \\Phi(Z_{H_1})`} />
                                                            <BlockMath math={`\\text{Power} = 1 - \\beta`} />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <BlockMath math={`Z_{H_1,1} = \\frac{C_1 - \\mu_1}{SE} \\quad,\\quad Z_{H_1,2} = \\frac{C_2 - \\mu_1}{SE}`} />
                                                            <BlockMath math={`\\beta = P(\\text{Fail to Reject } H_0 \\mid H_1) = \\Phi(Z_{H_1,2}) - \\Phi(Z_{H_1,1})`} />
                                                            <BlockMath math={`\\text{Power} = 1 - \\beta`} />
                                                        </>
                                                    )
                                                ) : (
                                                    <>
                                                        <BlockMath math={`NCP = \\frac{\\mu_1 - \\mu_0}{SE}`} />
                                                        {tailType === 'right' ? (
                                                            <>
                                                                <BlockMath math={`t_{\\beta} = t_{crit} - NCP`} />
                                                                <BlockMath math={`\\beta = P(t_{df} < t_{\\beta})`} />
                                                                <BlockMath math={`\\text{Power} = 1 - \\beta`} />
                                                            </>
                                                        ) : tailType === 'left' ? (
                                                            <>
                                                                <BlockMath math={`t_{\\beta} = t_{crit} - NCP`} />
                                                                <BlockMath math={`\\beta = 1 - P(t_{df} < t_{\\beta})`} />
                                                                <BlockMath math={`\\text{Power} = 1 - \\beta`} />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <BlockMath math={`t_{\\beta, 1} = -t_{crit} - NCP \\quad,\\quad t_{\\beta, 2} = t_{crit} - NCP`} />
                                                                <BlockMath math={`\\beta = P(t_{df} < t_{\\beta, 2}) - P(t_{df} < t_{\\beta, 1})`} />
                                                                <BlockMath math={`\\text{Power} = 1 - \\beta`} />
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </FormulaBlock>

                                            {/* Calculation with actual values */}
                                            <CalcBlock>
                                                {varianceKnown ? (
                                                    tailType === 'right' ? (
                                                        <>
                                                            <BlockMath math={`Z_{H_1} = \\frac{${stats.c2.toFixed(3)} - ${stats.effectH1Mean}}{${stats.se.toFixed(4)}} = ${((stats.c2 - stats.effectH1Mean) / stats.se).toFixed(4)}`} />
                                                            <BlockMath math={`\\beta = \\Phi(${((stats.c2 - stats.effectH1Mean) / stats.se).toFixed(4)}) = ${stats.beta.toFixed(4)}`} />
                                                            <BlockMath math={`\\text{Power} = 1 - ${stats.beta.toFixed(4)} = ${(stats.power).toFixed(4)}`} />
                                                        </>
                                                    ) : tailType === 'left' ? (
                                                        <>
                                                            <BlockMath math={`Z_{H_1} = \\frac{${stats.c2.toFixed(3)} - ${stats.effectH1Mean}}{${stats.se.toFixed(4)}} = ${((stats.c2 - stats.effectH1Mean) / stats.se).toFixed(4)}`} />
                                                            <BlockMath math={`\\beta = 1 - \\Phi(${((stats.c2 - stats.effectH1Mean) / stats.se).toFixed(4)}) = ${stats.beta.toFixed(4)}`} />
                                                            <BlockMath math={`\\text{Power} = 1 - ${stats.beta.toFixed(4)} = ${(stats.power).toFixed(4)}`} />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <BlockMath math={`Z_{H_1,1} = \\frac{${stats.c1.toFixed(3)} - ${stats.effectH1Mean}}{${stats.se.toFixed(4)}} = ${((stats.c1 - stats.effectH1Mean) / stats.se).toFixed(4)}`} />
                                                            <BlockMath math={`Z_{H_1,2} = \\frac{${stats.c2.toFixed(3)} - ${stats.effectH1Mean}}{${stats.se.toFixed(4)}} = ${((stats.c2 - stats.effectH1Mean) / stats.se).toFixed(4)}`} />
                                                            <BlockMath math={`\\beta = \\Phi(${((stats.c2 - stats.effectH1Mean) / stats.se).toFixed(3)}) - \\Phi(${((stats.c1 - stats.effectH1Mean) / stats.se).toFixed(3)}) = ${stats.beta.toFixed(4)}`} />
                                                            <BlockMath math={`\\text{Power} = 1 - ${stats.beta.toFixed(4)} = ${(stats.power).toFixed(4)}`} />
                                                        </>
                                                    )
                                                ) : (
                                                    <>
                                                        <BlockMath math={`NCP = \\frac{${stats.effectH1Mean} - ${stats.effectH0Mean}}{${stats.se.toFixed(4)}} = ${stats.ncp.toFixed(4)}`} />
                                                        {tailType === 'right' ? (
                                                            <>
                                                                <BlockMath math={`t_{\\beta} = ${stats.zCrit.toFixed(4)} - ${stats.ncp.toFixed(4)} = ${(stats.zCrit - stats.ncp).toFixed(4)}`} />
                                                                <BlockMath math={`\\beta = P(t_{${stats.df}} < ${(stats.zCrit - stats.ncp).toFixed(4)}) = ${stats.beta.toFixed(4)}`} />
                                                            </>
                                                        ) : tailType === 'left' ? (
                                                            <>
                                                                <BlockMath math={`t_{\\beta} = ${stats.zCrit.toFixed(4)} - ${stats.ncp.toFixed(4)} = ${(stats.zCrit - stats.ncp).toFixed(4)}`} />
                                                                <BlockMath math={`\\beta = 1 - P(t_{${stats.df}} < ${(stats.zCrit - stats.ncp).toFixed(4)}) = ${stats.beta.toFixed(4)}`} />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <BlockMath math={`t_{\\beta, 1} = ${(-stats.zCrit).toFixed(4)} - ${stats.ncp.toFixed(4)} = ${(-stats.zCrit - stats.ncp).toFixed(4)}`} />
                                                                <BlockMath math={`t_{\\beta, 2} = ${stats.zCrit.toFixed(4)} - ${stats.ncp.toFixed(4)} = ${(stats.zCrit - stats.ncp).toFixed(4)}`} />
                                                                <BlockMath math={`\\beta = P(t_{${stats.df}} < ${(stats.zCrit - stats.ncp).toFixed(4)}) - P(t_{${stats.df}} < ${(-stats.zCrit - stats.ncp).toFixed(4)}) = ${stats.beta.toFixed(4)}`} />
                                                            </>
                                                        )}
                                                        <BlockMath math={`\\text{Power} = 1 - ${stats.beta.toFixed(4)} = ${(stats.power).toFixed(4)}`} />
                                                    </>
                                                )}
                                            </CalcBlock>
                                        </div>
                                    ) : (
                                        <div className="bg-[var(--color-surface)] p-5 rounded-lg border border-[var(--color-border)] text-center text-[var(--color-text-secondary)] space-y-2 max-w-xl mx-auto mt-4">
                                            <Info size={20} className="mx-auto text-[var(--color-accent-cobalt)]" />
                                            <h5 className="font-extrabold text-[var(--color-text-primary)] text-sm sm:text-base">חישוב עוצמת מבחן כבוי</h5>
                                            <p className="text-xs sm:text-sm font-medium leading-relaxed">
                                                על מנת להציג את שלבי החישוב המלאים של טעות מסוג שני (<InlineMath math="\beta" />) ועוצמת המבחן (<InlineMath math="1-\beta" />), הפעל את אפשרות "חישוב עוצמה" בתוך כרטיסיית הפרמטרים למעלה.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* LEFT Column - Info & Explanations Panel */}
                    <div className="contents">

                        {/* Decision Matrix Hero (Moved to side panel) */}
                        <div className="tour-step-decision text-right w-full min-w-0 order-2 lg:order-2">
                            <DecisionMatrix isValid={isValid} stats={stats} alpha={alpha} calculatePower={calculatePower} />
                        </div>

                    </div>

                </div>



            </div>
        </div>
    );
}
