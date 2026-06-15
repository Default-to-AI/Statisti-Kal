import { useLocalStorageState } from '../hooks/useLocalStorageState';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    Percent
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

// No props needed - dark-only theme

// --- Formula / Calculation Display Blocks ---
// FormulaBlock: Raw/general formula with symbolic variables (indigo theme)
function FormulaBlock({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`w-full overflow-x-auto py-2 scrollbar-thin ${className}`} dir="ltr">
            <div className="relative bg-indigo-950/20 p-4 sm:p-5 rounded-2xl border-2 border-indigo-500/30 space-y-3 text-lg sm:text-xl md:text-2xl text-center shadow-[0_0_12px_rgba(99,102,241,0.08)] font-extrabold w-full min-w-max [&_.katex-display]:!overflow-visible">
                <span className="absolute top-2 right-3 text-[10px] font-black text-indigo-400/60 tracking-wide uppercase select-none" dir="rtl">תבנית כללית</span>
                {children}
            </div>
        </div>
    );
}

// CalcBlock: Calculation with actual substituted values (amber theme)
function CalcBlock({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`w-full overflow-x-auto py-2 scrollbar-thin ${className}`} dir="ltr">
            <div className="relative bg-amber-950/15 p-4 sm:p-5 rounded-2xl border-2 border-amber-500/30 space-y-3 text-lg sm:text-xl md:text-2xl text-center shadow-[0_0_12px_rgba(245,158,11,0.08)] font-extrabold w-full min-w-max [&_.katex-display]:!overflow-visible">
                <span className="absolute top-2 right-3 text-[10px] font-black text-amber-400/60 tracking-wide uppercase select-none" dir="rtl">יישום</span>
                {children}
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
            <div className="py-16 text-center text-slate-500 font-bold text-base">
                נא להזין ערכי קלט תקינים להצגת מטריצת החלטה...
            </div>
        );
    }

    return (
        <table className="w-full text-base text-right border-collapse table-layout-fixed rounded-2xl overflow-hidden bg-slate-900 shadow-sm border border-slate-800">
            <thead>
                <tr className="bg-slate-800/70 text-xs text-slate-200 font-black border-none !border-transparent">
                    <th className="p-3 text-center font-black text-slate-100 bg-slate-800/25 w-[20%]">
                        החלטת המבחן
                    </th>
                    <th className="p-3 text-center font-black bg-blue-950/10 w-[40%]">
                        <span><InlineMath math="H_0" /> נכונה במציאות</span>
                    </th>
                    <th className={`p-3 text-center font-black bg-amber-900/10 transition-all w-[40%] ${!calculatePower ? 'opacity-30' : ''}`}>
                        <span><InlineMath math="H_1" /> נכונה במציאות</span>
                    </th>
                </tr>
            </thead>
            <tbody>
                {/* Row 1: Fail to reject H0 */}
                <tr className="font-semibold text-slate-50 border-b border-slate-800/60">
                    <td className="p-3 font-extrabold bg-red-950/20 text-red-100 border-r-4 border-r-red-500/80">
                        <span className="text-sm font-black block text-red-400">
                            אי-דחייה של <InlineMath math="H_0" />
                        </span>
                        <span className="block text-xs font-semibold text-slate-400 mt-0.5" dir="ltr">
                            <InlineMath math="\text{Fail to Reject } H_0" />
                        </span>
                    </td>

                    {/* Cell 1-1: Correct decision (1 - Alpha) */}
                    <td className="p-3 border-l border-slate-800/60 bg-emerald-950/10 hover:bg-emerald-950/20 transition-all">
                        <div className="flex items-center justify-between gap-2 border-b border-emerald-800/20 pb-1.5 mb-1.5">
                            <span className="font-black text-emerald-400/80 flex items-center gap-1.5 text-xs">
                                <CheckCircle size={14} className="text-emerald-500/80 shrink-0" />
                                החלטה נכונה
                            </span>
                            <span className="text-xs font-bold text-emerald-400/80 bg-emerald-950/30 px-1.5 py-0.5 rounded" dir="ltr">
                                <InlineMath math="1 - \alpha" />
                            </span>
                        </div>
                        <div className="my-1.5 flex items-baseline gap-x-2 flex-wrap">
                            <span className="text-xl sm:text-2xl font-black text-emerald-300/80 tracking-tight">
                                {((1 - alpha) * 100).toFixed(1)}%
                            </span>
                            <span className="text-xs font-black text-emerald-400/80">רמת סמך</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium leading-snug mt-1">
                            <div className="mb-0.5 text-slate-500 font-bold" dir="ltr">
                                <InlineMath math="P(\text{Fail to Reject } H_0 \mid H_0 \text{ is true})" />
                            </div>
                            ההסתברות לא לדחות את השערת האפס כאשר היא אכן נכונה.
                        </div>
                    </td>

                    {/* Cell 1-2: Type II Error (Beta) */}
                    <td className={`p-3 transition-all ${!calculatePower ? 'bg-slate-950/15 opacity-40 select-none' : 'bg-red-950/10 hover:bg-red-950/20'}`}>
                        {calculatePower ? (
                            <>
                                <div className="flex items-center justify-between gap-2 border-b border-red-900/30 pb-1.5 mb-1.5">
                                    <span className="font-black text-red-400/80 flex items-center gap-1.5 text-xs">
                                        <XCircle size={14} className="text-red-500/80 shrink-0" />
                                        טעות מסוג II
                                    </span>
                                    <span className="text-xs font-bold text-red-400/80 bg-red-950/40 px-1.5 py-0.5 rounded" dir="ltr">
                                        <InlineMath math="\beta" />
                                    </span>
                                </div>
                                <div className="my-1.5 flex items-baseline gap-x-2 flex-wrap">
                                    <span className="text-xl sm:text-2xl font-black text-red-300/80 tracking-tight">
                                        {(stats.beta * 100).toFixed(2)}%
                                    </span>
                                    <span className="text-xs font-black text-red-400/80">החמצה</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium leading-snug mt-1">
                                    <div className="mb-0.5 text-slate-500 font-bold" dir="ltr">
                                        <InlineMath math="P(\text{Fail to Reject } H_0 \mid H_1 \text{ is true})" />
                                    </div>
                                    הסיכוי לא לדחות את השערת האפס למרות שהיא שקרית וקיים אפקט אמיתי.
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 text-center text-slate-500 h-full">
                                <Info size={14} className="mb-1.5" />
                                <span className="text-[10px] font-bold">לא פעיל</span>
                            </div>
                        )}
                    </td>
                </tr>

                {/* Row 2: Reject H0 */}
                <tr className="font-semibold text-slate-50">
                    <td className="p-3 font-extrabold bg-emerald-950/20 text-emerald-100 border-r-4 border-r-emerald-500/80">
                        <span className="text-sm font-black block text-emerald-400">
                            דחיית <InlineMath math="H_0" />
                        </span>
                        <span className="block text-xs font-semibold text-slate-400 mt-0.5" dir="ltr">
                            <InlineMath math="\text{Reject } H_0" />
                        </span>
                    </td>

                    {/* Cell 2-1: Type I Error (Alpha) */}
                    <td className="p-3 border-l border-slate-800/60 bg-red-950/20 hover:bg-red-900/30 transition-all">
                        <div className="flex items-center justify-between gap-2 border-b border-red-500/30 pb-1.5 mb-1.5">
                            <span className="font-black text-red-400 flex items-center gap-1.5 text-xs">
                                <XCircle size={14} className="text-red-500 shrink-0" />
                                טעות מסוג I
                            </span>
                            <span className="text-xs font-bold text-red-200 bg-red-700/40 px-1.5 py-0.5 rounded" dir="ltr">
                                <InlineMath math="\alpha" />
                            </span>
                        </div>
                        <div className="my-1.5 flex items-baseline gap-x-2 flex-wrap">
                            <span className="text-xl sm:text-2xl font-black text-red-300 tracking-tight">
                                {(alpha * 100).toFixed(1)}%
                            </span>
                            <span className="text-xs font-black text-red-400">רמת מובהקות</span>
                        </div>
                        <div className="text-[10px] text-slate-300 font-medium leading-snug mt-1">
                            <div className="mb-0.5 text-red-500/80 font-bold" dir="ltr">
                                <InlineMath math="P(\text{Reject } H_0 \mid H_0 \text{ is true})" />
                            </div>
                            הסיכוי לדחות בטעות את השערת האפס כשהיא נכונה במציאות (גילוי שווא).
                        </div>
                    </td>

                    {/* Cell 2-2: Correct decision (1 - Beta) */}
                    <td className={`p-3 transition-all ${!calculatePower
                        ? 'bg-slate-950/15 opacity-40 select-none'
                        : 'bg-emerald-900/20 hover:bg-emerald-900/30'
                        }`}>
                        {calculatePower ? (
                            <>
                                <div className="flex items-center justify-between gap-2 border-b border-emerald-500/30 pb-1.5 mb-1.5">
                                    <span className="font-black text-emerald-400 flex items-center gap-1.5 text-xs">
                                        <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                                        החלטה נכונה
                                    </span>
                                    <span className="text-xs font-bold text-emerald-200 bg-emerald-700/40 px-1.5 py-0.5 rounded" dir="ltr">
                                        <InlineMath math="1 - \beta" />
                                    </span>
                                </div>
                                <div className="my-1.5 flex items-baseline gap-x-2 flex-wrap">
                                    <span className="text-xl sm:text-2xl font-black text-emerald-300 tracking-tight">
                                        {(stats.power * 100).toFixed(2)}%
                                    </span>
                                    <span className="text-xs font-black text-emerald-400">עוצמת המבחן</span>
                                </div>
                                <div className="text-[10px] text-slate-300 font-medium leading-snug mt-1">
                                    <div className="mb-0.5 text-emerald-500/80 font-bold" dir="ltr">
                                        <InlineMath math="P(\text{Reject } H_0 \mid H_1 \text{ is true})" />
                                    </div>
                                    ההסתברות לזהות ולדחות השערת אפס שקרית בצדק (גילוי אפקט אמיתי).
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 text-center text-slate-500 h-full">
                                <Info size={14} className="mb-1.5" />
                                <span className="text-[10px] font-bold">לא פעיל</span>
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
    content: string;
    children: React.ReactNode;
    className?: string;
}

const InputTooltip: React.FC<InputTooltipProps> = ({ content, children, className = "" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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
        <div className={`relative inline-flex items-center gap-1.5 ${className}`} onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
            {children}
            <Info size={13} className="text-indigo-400/80 hover:text-indigo-300 cursor-help shrink-0" />
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 text-xs rounded-xl shadow-xl pointer-events-none text-center leading-normal font-medium bg-slate-800 text-slate-100 border border-slate-700 font-sans"
                    >
                        {content}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function HypothesisTestingCalculator() {
    // Input states
    const [varianceKnown, setVarianceKnown] = useLocalStorageState<boolean>('HT_varianceKnown', true);
    const [calculatePower, setCalculatePower] = useLocalStorageState<boolean>('HT_calculatePower', true);

    const [mu0, setMu0] = useLocalStorageState<number>('HT_mu0', 100);
    const [mu0Input, setMu0Input] = useLocalStorageState<string>('HT_mu0Input', '100');

    const [mu1, setMu1] = useLocalStorageState<number>('HT_mu1', 108);
    const [mu1Input, setMu1Input] = useLocalStorageState<string>('HT_mu1Input', '108');

    const [muH1, setMuH1] = useLocalStorageState<number>('HT_muH1', 108);
    const [muH1Input, setMuH1Input] = useLocalStorageState<string>('HT_muH1Input', '108');

    const [sigma, setSigma] = useLocalStorageState<number>('HT_sigma', 15);
    const [sigmaInput, setSigmaInput] = useLocalStorageState<string>('HT_sigmaInput', '15');

    const [n, setN] = useLocalStorageState<number>('HT_n', 36);
    const [nInput, setNInput] = useLocalStorageState<string>('HT_nInput', '36');

    const [alpha, setAlpha] = useLocalStorageState<number>('HT_alpha', 0.05);
    const [alphaInput, setAlphaInput] = useLocalStorageState<string>('HT_alphaInput', '0.05');

    const [testType, setTestType] = useLocalStorageState<TestType>('HT_testType', 'mean');
    const [tailType, setTailType] = useLocalStorageState<TailType>('HT_tailType', 'right');

    const statSymbol = testType === 'single' ? 'X' : testType === 'sum' ? '\\sum X' : '\\bar{X}';
    const statName = testType === 'single' ? 'הערך הבודד' : testType === 'sum' ? 'סכום המדגם' : 'ממוצע המדגם';
    const statNamePlural = testType === 'single' ? 'ערכים בודדים' : testType === 'sum' ? 'סכומי מדגם' : 'ממוצעי מדגם';

    // Dynamic parameterized formal hypothesis
    const getFormalHypothesisMath = () => {
        let parameterSymbol = '\\mu';
        let h0Val = mu0Input;

        if (testType === 'sum') {
            parameterSymbol = 'E(\\sum X)';
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

        return `H_0: ${parameterSymbol} ${h0Symbol} ${h0Val} \\quad \\text{Vs.} \\quad H_1: ${parameterSymbol} ${h1Symbol} ${h0Val}`;
    };

    // Dynamic theoretical (general) formal hypothesis
    const getGeneralFormalHypothesisMath = () => {
        let parameterSymbol = '\\mu';
        if (testType === 'sum') {
            parameterSymbol = 'E(\\sum X)';
        }

        const nullValueSymbol = testType === 'sum' ? 'n \\cdot \\mu_0' : '\\mu_0';

        let h0Symbol = '=';
        let h1Symbol = '\\neq';

        if (tailType === 'right') {
            h0Symbol = '\\le';
            h1Symbol = '>';
        } else if (tailType === 'left') {
            h0Symbol = '\\ge';
            h1Symbol = '<';
        }

        return `H_0: ${parameterSymbol} ${h0Symbol} ${nullValueSymbol} \\quad \\text{Vs.} \\quad H_1: ${parameterSymbol} ${h1Symbol} ${nullValueSymbol}`;
    };

    // Accordion state
    const [showSteps, setShowSteps] = useState<boolean>(true);

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

    // Reset calculator to standard defaults
    const handleReset = () => {
        setVarianceKnown(true);
        setCalculatePower(true);
        setMu0(100);
        setMu0Input('100');
        setMu1(108);
        setMu1Input('108');
        setMuH1(108);
        setMuH1Input('108');
        setSigma(15);
        setSigmaInput('15');
        setN(36);
        setNInput('36');
        setAlpha(0.05);
        setAlphaInput('0.05');
        setTestType('mean');
        setTailType('right');
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
                <div className="p-3 border rounded-xl shadow-lg text-sm font-sans space-y-2 backdrop-blur-md bg-slate-900/90 border-slate-700 text-slate-100 min-w-[160px]" dir="rtl">
                    <div className="flex justify-between gap-6 border-b border-slate-700 pb-2 mb-2">
                        <span className="font-bold text-indigo-400">תצפית X:</span>
                        <span className="font-mono font-bold text-indigo-300" dir="ltr">{dataPt.x.toFixed(2)}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-400 mb-1">צפיפות הסתברות:</div>
                    <div className="flex justify-between gap-6" style={{ color: 'var(--color-accent)' }}>
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
                <div className="p-3 border rounded-xl shadow-lg text-sm font-sans space-y-2 backdrop-blur-md bg-slate-900/90 border-slate-700 text-slate-100 min-w-[160px]" dir="rtl">
                    <div className="flex justify-between gap-6 border-b border-slate-700 pb-2 mb-2">
                        <span className="font-bold text-indigo-400">תצפית X:</span>
                        <span className="font-mono font-bold text-indigo-300" dir="ltr">{dataPt.x.toFixed(2)}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-400 mb-1">צפיפות הסתברות:</div>
                    <div className="flex justify-between gap-6 text-slate-300">
                        <span className="font-semibold">אוכלוסיה (H₀):</span>
                        <span className="font-mono font-bold" dir="ltr">{dataPt.pdfH0.toFixed(2)}</span>
                    </div>
                    {dataPt.pdfH1 !== undefined && (
                        <div className="flex justify-between gap-6 text-indigo-300">
                            <span className="font-semibold">מדגם (H₁):</span>
                            <span className="font-mono font-bold" dir="ltr">{dataPt.pdfH1.toFixed(2)}</span>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 bg-slate-950 min-h-screen text-slate-100 p-4 sm:p-6 md:p-8" dir="rtl">
            {/* Parameters Input Card */}
            <div className="rounded-3xl p-5 md:p-6 border shadow-md transition-colors bg-slate-900 border-slate-800">
                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-4 mb-5">
                    <Sliders size={20} className="text-indigo-500" />
                    <h3 className="text-lg sm:text-xl font-black text-slate-100">
                        פרמטרים והשערות מחקר
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_225px] gap-6">
                    <div className="flex-1 min-w-0">
                        {/* Custom Parameters Table Layout */}
                        <div className="overflow-visible rounded-2xl border border-slate-800 bg-slate-950/10 transition-all mb-6" dir="rtl">
                            <table className="w-full border-collapse border-spacing-0">
                                <thead>
                                    <tr className="bg-slate-800/40 border-b border-slate-800">
                                        <th className="p-3.5 text-right font-black text-xs sm:text-sm text-slate-300 w-[28%] border-l border-slate-800">
                                            <div className="flex items-center gap-2.5 justify-start">
                                                <button
                                                    type="button"
                                                    onClick={() => setVarianceKnown(!varianceKnown)}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${varianceKnown ? 'bg-indigo-600' : 'bg-slate-700/80'
                                                        }`}
                                                >
                                                    {/* On State Checkmark */}
                                                    <span className={`absolute right-1 top-0 bottom-0 flex items-center justify-center text-white transition-opacity duration-200 ${varianceKnown ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                                                        <Check size={10} className="stroke-[3.5]" />
                                                    </span>

                                                    {/* Off State X */}
                                                    <span className={`absolute left-1 top-0 bottom-0 flex items-center justify-center text-slate-300 transition-opacity duration-200 ${!varianceKnown ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                                                        <X size={10} className="stroke-[3.5]" />
                                                    </span>

                                                    <span
                                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${varianceKnown ? '-translate-x-5' : 'translate-x-0'
                                                            }`}
                                                    />
                                                </button>
                                                <span>שונות ידועה:</span>
                                            </div>
                                        </th>
                                        <th className="p-3.5 text-center font-black text-xs sm:text-sm text-slate-300 w-[24%] border-l border-slate-800">
                                            <div className="flex items-center gap-1.5 justify-center">
                                                <span>אוכלוסייה</span>
                                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-none bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold shrink-0">H₀</span>
                                            </div>
                                        </th>
                                        <th className="p-3.5 text-center font-black text-xs sm:text-sm text-slate-300 w-[24%] border-l border-slate-800">
                                            מדגם
                                        </th>
                                        <th className="p-3.5 text-center font-black text-xs sm:text-sm text-slate-300 w-[24%]">
                                            <InputTooltip content="תחת הנחת סטיית תקן זהה, אם ידועה">
                                                <div className="flex items-center gap-1.5 justify-center cursor-help">
                                                    <span>השערת המחקר</span>
                                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-none bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold shrink-0">H₁</span>
                                                </div>
                                            </InputTooltip>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Row 1: mu0, n, and power toggle */}
                                    <tr className="border-b border-slate-800/80">
                                        <td className="p-4 text-right align-middle text-xs sm:text-sm font-semibold border-l border-slate-800 bg-slate-950/20">
                                            <div className="flex items-center gap-1.5 justify-start">
                                                <InputTooltip content="תוחלת אוכלוסיית הבסיס (השערת האפס H₀)" className="w-full justify-between">
                                                    <span className="cursor-help border-b border-dotted border-slate-500">
                                                        תוחלת (μ₀):
                                                    </span>
                                                </InputTooltip>
                                            </div>
                                        </td>
                                        <td className="p-3 align-middle border-l border-slate-800 bg-slate-900/40">
                                            <input
                                                type="text"
                                                value={mu0Input}
                                                onChange={(e) => handleMu0Change(e.target.value)}
                                                className={`w-full bg-transparent px-3 py-1 font-mono font-bold text-center text-lg sm:text-xl text-slate-100 placeholder-slate-400 outline-none transition-all rounded focus:bg-indigo-950/10 ${errors.mu0 ? 'text-red-400 font-bold' : ''
                                                    }`}
                                                placeholder="100"
                                                dir="ltr"
                                            />
                                            {errors.mu0 && (
                                                <div className="text-[11px] text-red-400 font-bold leading-tight mt-1 text-center">{errors.mu0}</div>
                                            )}
                                        </td>
                                        <td className="p-3 align-middle border-l border-slate-800 bg-slate-900/40">
                                            <div className="flex items-center justify-between gap-2 ctrl-cell-wrapper w-full">
                                                <InputTooltip content="מספר התצפיות במדגם (n)">
                                                    <span className={`text-xs sm:text-sm text-slate-400 font-bold shrink-0 cursor-help border-b border-dotted border-slate-500 ${testType === 'single' ? 'opacity-30' : ''}`}>
                                                        גודל מדגם (n):
                                                    </span>
                                                </InputTooltip>
                                                <div className="w-16 sm:w-20 shrink-0">
                                                    <input
                                                        type="text"
                                                        value={testType === 'single' ? '1' : nInput}
                                                        disabled={testType === 'single'}
                                                        onChange={(e) => handleNChange(e.target.value)}
                                                        className={`w-full bg-transparent px-2 py-1 font-mono font-bold text-center text-lg sm:text-xl text-slate-100 placeholder-slate-400 outline-none transition-all rounded focus:bg-indigo-950/10 ${testType === 'single' ? 'opacity-40 cursor-not-allowed bg-slate-100/5' : ''
                                                            } ${errors.n && testType !== 'single' ? 'text-red-400 font-bold' : ''}`}
                                                        placeholder="36"
                                                        dir="ltr"
                                                    />
                                                </div>
                                            </div>
                                            {errors.n && testType !== 'single' && (
                                                <div className="text-[11px] text-red-400 font-bold leading-tight mt-1 text-right">{errors.n}</div>
                                            )}
                                        </td>
                                        <td className="p-3 align-middle bg-slate-900/40">
                                            <div className="flex items-center gap-2 justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setCalculatePower(!calculatePower)}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${calculatePower ? 'bg-indigo-600' : 'bg-slate-700/80'
                                                        }`}
                                                >
                                                    <span
                                                        className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${calculatePower ? '-translate-x-5' : 'translate-x-0'
                                                            }`}
                                                    >
                                                        {calculatePower ? (
                                                            <div className="w-[2px] h-[10px] bg-indigo-600 rounded-full" />
                                                        ) : (
                                                            <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-400" />
                                                        )}
                                                    </span>
                                                </button>
                                                <span className="text-xs sm:text-sm font-bold text-slate-300">
                                                    חישוב עוצמה
                                                </span>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Row 2: sigma and mu1(Xbar) */}
                                    <tr>
                                        <td className="p-4 text-right align-middle text-xs sm:text-sm font-semibold border-l border-slate-800 bg-slate-950/20">
                                            <div className="flex items-center gap-1.5 justify-start">
                                                <InputTooltip content={varianceKnown ? "סטיית תקן של האוכלוסייה (σ)" : "סטיית תקן מדגמית (S) המשמשת כאומד לסטיית התקן"} className="w-full justify-between">
                                                    <span className="cursor-help border-b border-dotted border-slate-500">
                                                        {varianceKnown ? 'סטיית תקן (σ):' : 'סטיית תקן (S):'}
                                                    </span>
                                                </InputTooltip>
                                            </div>
                                        </td>
                                        <td className="p-3 align-middle border-l border-slate-800 bg-slate-900/40">
                                            <input
                                                type="text"
                                                value={sigmaInput}
                                                onChange={(e) => handleSigmaChange(e.target.value)}
                                                className={`w-full bg-transparent px-3 py-1 font-mono font-bold text-center text-lg sm:text-xl text-slate-100 placeholder-slate-400 outline-none transition-all rounded focus:bg-indigo-950/10 ${errors.sigma ? 'text-red-400 font-bold' : ''
                                                    }`}
                                                placeholder="15"
                                                dir="ltr"
                                            />
                                            {errors.sigma && (
                                                <div className="text-[11px] text-red-00 text-red-400 font-bold leading-tight mt-1 text-center">{errors.sigma}</div>
                                            )}
                                        </td>
                                        <td className="p-3 align-middle border-l border-slate-800 bg-slate-900/40">
                                            <div className="flex items-center justify-between gap-2 ctrl-cell-wrapper w-full">
                                                <InputTooltip content="ממוצע המדגם בפועל">
                                                    <span className="text-xs sm:text-sm text-slate-400 font-bold shrink-0 cursor-help border-b border-dotted border-slate-500">
                                                        ממוצע מדגם (X̄):
                                                    </span>
                                                </InputTooltip>
                                                <div className="w-16 sm:w-20 shrink-0">
                                                    <input
                                                        type="text"
                                                        value={mu1Input}
                                                        onChange={(e) => handleMu1Change(e.target.value)}
                                                        className={`w-full bg-transparent px-2 py-1 font-mono font-bold text-center text-lg sm:text-xl text-slate-100 placeholder-slate-400 outline-none transition-all rounded focus:bg-indigo-950/10 ${errors.mu1 ? 'text-red-400 font-bold' : ''
                                                            }`}
                                                        placeholder="108"
                                                        dir="ltr"
                                                    />
                                                </div>
                                            </div>
                                            {errors.mu1 && (
                                                <div className="text-[11px] text-red-400 font-bold leading-tight mt-1 text-right">{errors.mu1}</div>
                                            )}
                                        </td>
                                        <td className={`p-3 align-middle bg-slate-900/40 transition-all ${!calculatePower ? 'opacity-30' : ''}`}>
                                            <div className="flex items-center justify-between gap-2 ctrl-cell-wrapper w-full">
                                                <InputTooltip content="התוחלת המשוערת תחת השערת המחקר האלטרנטיבית (H₁)">
                                                    <span className={`text-xs sm:text-sm font-bold shrink-0 cursor-help border-b border-dotted border-slate-500 ${!calculatePower ? 'text-slate-500 opacity-50' : 'text-slate-400'}`}>
                                                        ממוצע (μ₁):
                                                    </span>
                                                </InputTooltip>
                                                <div className="w-16 sm:w-20 shrink-0">
                                                    <input
                                                        type="text"
                                                        value={muH1Input}
                                                        disabled={!calculatePower}
                                                        onChange={(e) => handleMuH1Change(e.target.value)}
                                                        className={`w-full bg-transparent px-2 py-1 font-mono font-bold text-center text-lg sm:text-xl text-slate-100 placeholder-slate-400 outline-none transition-all rounded focus:bg-indigo-950/10 ${!calculatePower ? 'opacity-40 cursor-not-allowed' : ''
                                                            } ${calculatePower && errors.muH1 ? 'text-red-400 font-bold' : ''}`}
                                                        placeholder="108"
                                                        dir="ltr"
                                                    />
                                                </div>
                                            </div>
                                            {calculatePower && errors.muH1 && (
                                                <div className="text-[11px] text-red-400 font-bold leading-tight mt-1 text-right">{errors.muH1}</div>
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Alpha Selection Row with type manually option */}
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-4" dir="rtl">
                            <span className="text-xs sm:text-sm font-black text-slate-400">
                                :(<InlineMath math="\alpha" />) מובהקות ורמת סמך
                            </span>

                            <div className="flex gap-1.5 bg-slate-950/40 p-1.5 rounded-xl border border-slate-800">
                                {[0.10, 0.05, 0.01].map((pVal) => (
                                    <button
                                        key={pVal}
                                        type="button"
                                        onClick={() => applyAlphaPreset(pVal)}
                                        className={`px-3 py-1.5 text-xs sm:text-sm font-black rounded-lg transition-all ${alpha === pVal
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-slate-200'
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
                                    className={`w-18 px-2.5 py-1.5 bg-slate-900 border rounded-xl text-center font-mono font-bold text-sm text-indigo-300 focus:bg-indigo-950/20 outline-none ${errors.alpha ? 'border-red-500 text-red-500 ring-4 ring-red-500/10' : 'border-slate-800 focus:ring-4 focus:ring-indigo-500/10'
                                        }`}
                                    placeholder="0.05"
                                    dir="ltr"
                                />
                            </div>
                            {errors.alpha && (
                                <p className="text-[11px] text-red-400 font-bold mt-1 text-right">{errors.alpha}</p>
                            )}
                        </div>
                    </div>

                    {/* Main Test Statistic Type Selector */}
                    <div className="flex flex-col gap-3 shrink-0 h-[229.583px] w-[201px] bg-slate-950/20 border border-slate-800/60 p-4 rounded-2xl">
                        <span className="text-xs sm:text-sm font-black text-slate-300 text-right w-full">סטטיסטי המבחן:</span>
                        <div className="flex flex-col gap-2 w-full">
                            {[
                                { id: 'single', label: 'תצפית X' },
                                { id: 'mean', label: 'ממוצע X̄' },
                                { id: 'sum', label: 'סכום ΣX' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setTestType(item.id as TestType)}
                                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all text-center border ${testType === item.id
                                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-[1.02]'
                                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Dynamic Formal Hypotheses Display Banner with H1 Buttons */}
            <div className="mb-6 p-4 rounded-2xl border border-indigo-900/40 bg-indigo-950/10 flex flex-col xl:flex-row items-center justify-between gap-6 transition-all" dir="rtl">

                {/* Right Section: Title */}
                <div className="flex-1 flex flex-col items-start min-w-0">
                    <h4 className="text-lg font-black text-indigo-200 flex items-center gap-1.5 mb-1">
                        <Award size={16} className="text-indigo-500 shrink-0" />
                        הגדרת השערות ובחירת כיווני המבחן:
                    </h4>
                    <span className="text-xs text-slate-400 block mt-1 leading-relaxed font-medium max-w-sm text-right">
                        בחירת כיוון השערת המחקר, למול השערת האפס המבטאת חוסר שינוי:
                    </span>
                </div>

                {/* Center Section: Formal Hypotheses Display */}
                <div className="shrink-0 flex flex-col items-center justify-center p-3 bg-slate-950/90 border border-slate-800 rounded-xl min-w-[180px] text-center shadow-sm">
                    <div className="text-lg sm:text-xl font-extrabold text-slate-100 font-mono tracking-wide flex justify-center w-full" dir="ltr">
                        <InlineMath math={getFormalHypothesisMath()} />
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1.5 border-t border-dotted border-slate-800 pt-1 flex justify-center w-full" dir="ltr">
                        <InlineMath math={getGeneralFormalHypothesisMath()} />
                    </div>
                </div>

                {/* Left Section: Squared Buttons for H1 */}
                <div className="flex-1 flex justify-end gap-2">
                    <button
                        onClick={() => setTailType('right')}
                        className={`flex flex-col items-center justify-center w-[100px] h-20 rounded-xl border transition-all ${tailType === 'right' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                    >
                        <span className="text-lg font-black">ימני</span>
                        <span className="text-[14px] font-mono mt-1 font-bold" dir="ltr">μ &gt; μ₀</span>
                    </button>
                    <button
                        onClick={() => setTailType('two-tailed')}
                        className={`flex flex-col items-center justify-center w-[100px] h-20 rounded-xl border transition-all ${tailType === 'two-tailed' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                    >
                        <span className="text-lg font-black">דו-צדדי</span>
                        <span className="text-[14px] font-mono mt-1 font-bold" dir="ltr">μ ≠ μ₀</span>
                    </button>
                    <button
                        onClick={() => setTailType('left')}
                        className={`flex flex-col items-center justify-center w-[100px] h-20 rounded-xl border transition-all ${tailType === 'left' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                    >
                        <span className="text-lg font-black">שמאלי</span>
                        <span className="text-[14px] font-mono mt-1 font-bold" dir="ltr">μ &lt; μ₀</span>
                    </button>
                </div>

            </div>

            {/* Popular Z & Phi Row for Hypothesis Testing */}
            <div className="mb-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-right space-y-3 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-slate-300">
                        <Sliders size={14} className="text-indigo-400" />
                        <span className="text-sm font-black font-sans text-indigo-200">
                            מבחנים סטטיסטיים נפוצים:
                        </span>
                    </div>
                    <span className="text-[14px] text-slate-400">עדכון מהיר של הפרמטרים:</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {[
                        { confidence: "99%", alpha: 0.01, tail: "two", phi: 0.9950, z: 2.576, label: "דו-צדדי (α=0.01)" },
                        { confidence: "99%", alpha: 0.01, tail: "one", phi: 0.9900, z: 2.326, label: "חד-צדדי (α=0.01)" },
                        { confidence: "95%", alpha: 0.05, tail: "two", phi: 0.9750, z: 1.960, label: "דו-צדדי (α=0.05)" },
                        { confidence: "95%", alpha: 0.05, tail: "one", phi: 0.9500, z: 1.645, label: "חד-צדדי (α=0.05)" },
                        { confidence: "90%", alpha: 0.10, tail: "two", phi: 0.9500, z: 1.645, label: "דו-צדדי (α=0.10)" },
                        { confidence: "90%", alpha: 0.10, tail: "one", phi: 0.9000, z: 1.282, label: "חד-צדדי (α=0.10)" },
                    ].map((item, idx) => {
                        const isMatched = Math.abs(alpha - item.alpha) < 0.001 && (
                            (tailType === 'two-tailed' && item.tail === 'two') ||
                            (tailType !== 'two-tailed' && item.tail === 'one')
                        );

                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                    applyAlphaPreset(item.alpha);
                                    if (item.tail === 'two') {
                                        setTailType('two-tailed');
                                    } else {
                                        if (tailType !== 'left' && tailType !== 'right') {
                                            setTailType('right');
                                        }
                                    }
                                }}
                                className={`p-2 rounded-xl border text-center transition-all duration-300 relative overflow-hidden select-none cursor-pointer flex flex-col justify-between h-20 ${isMatched
                                    ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500'
                                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/60 opacity-40 hover:opacity-100'
                                    }`}
                            >
                                {isMatched && (
                                    <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-l from-indigo-500 to-blue-500" />
                                )}
                                <div>
                                    <div className="text-[10px] font-black text-indigo-300/90 leading-tight">{item.label}</div>
                                    <div className="text-[12px] font-black text-slate-100 mt--0.5">רמת ביטחון: {item.confidence}</div>
                                </div>
                                <div className="flex items-center justify-between mt--0.5 pt-1 border-t border-slate-800 w-full" dir="ltr">
                                    <div className="text-[12px] font-black text-red-400">
                                        <InlineMath math={`Z_{crit}=${item.z.toFixed(3)}`} />
                                    </div>
                                    <div className="text-[12px] text-slate-400 opacity-70">
                                        <InlineMath math={`\\Phi=${item.phi.toFixed(3)}`} />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* RIGHT Column - Dashboard & Visual Analytics */}
                <div className="contents">

                    {/* Overlapping Curves Chart */}
                    <div className="rounded-3xl p-4 md:p-5 border shadow-md transition-all bg-slate-900 border-slate-800 w-full min-w-0 order-1 lg:order-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 border-b border-slate-800 pb-3 mb-3">
                            <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
                                <span className="flex items-center gap-1.5 font-black text-blue-400 select-none">
                                    <span className="w-3 h-3 rounded-none bg-blue-600 inline-block" />
                                    H₀
                                </span>
                                <span className={`flex items-center gap-1.5 font-black transition-all cursor-pointer select-none ${calculatePower ? 'text-amber-400' : 'text-slate-500 opacity-60 hover:opacity-100'}`} onClick={() => setCalculatePower(!calculatePower)}>
                                    <span className={`w-3 h-3 rounded-none inline-block ${calculatePower ? 'bg-amber-500' : 'bg-slate-700/80'}`} />
                                    H₁
                                </span>
                                <span className="flex items-center gap-1.5 font-black text-green-400 select-none">
                                    <span className="w-3 h-3 rounded-none bg-green-500/30 border border-green-500 inline-block" />
                                    C (אזור דחייה)
                                </span>
                                <span className={`flex items-center gap-1.5 font-black transition-all select-none ${calculatePower ? 'text-emerald-400' : 'hidden opacity-0'}`}>
                                    <span className="w-3 h-3 rounded-none bg-emerald-500/30 border border-emerald-500 inline-block" />
                                    1-β
                                </span>
                            </div>
                        </div>

                        {isValid && stats ? (
                            <div className="h-[305px] w-full mt-2" dir="ltr">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 25 }}>
                                        <defs>
                                            <linearGradient id="h0Color" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={'var(--color-accent)'} stopOpacity={0.1} />
                                                <stop offset="95%" stopColor={'var(--color-accent)'} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="h1Color" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--chart-4)" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0} />
                                            </linearGradient>
                                            {(() => {
                                                if (!stats || !isValid || !chartLimits) return null;
                                                const { c1, c2 } = stats;
                                                const { xMin, xMax } = chartLimits;

                                                const pct = (val) => {
                                                    const p = ((val - xMin) / (xMax - xMin)) * 100;
                                                    return Math.max(0, Math.min(100, p));
                                                };

                                                if (tailType === 'right') {
                                                    const c2Pct = pct(c2);
                                                    return (
                                                        <linearGradient id="rejectionGradient" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="#22c55e" stopOpacity={0} />
                                                            <stop offset={c2Pct + "%"} stopColor="#22c55e" stopOpacity={0} />
                                                            <stop offset={(c2Pct + 0.001) + "%"} stopColor="#22c55e" stopOpacity={0.1} />
                                                            <stop offset="100%" stopColor="#22c55e" stopOpacity={1.0} />
                                                        </linearGradient>
                                                    );
                                                } else if (tailType === 'left') {
                                                    const c2Pct = pct(c2);
                                                    return (
                                                        <linearGradient id="rejectionGradient" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="#22c55e" stopOpacity={1.0} />
                                                            <stop offset={c2Pct + "%"} stopColor="#22c55e" stopOpacity={0.1} />
                                                            <stop offset={(c2Pct + 0.001) + "%"} stopColor="#22c55e" stopOpacity={0} />
                                                            <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                                                        </linearGradient>
                                                    );
                                                } else { // two-tailed
                                                    const c1Pct = pct(c1);
                                                    const c2Pct = pct(c2);
                                                    return (
                                                        <linearGradient id="rejectionGradient" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="#22c55e" stopOpacity={1.0} />
                                                            <stop offset={c1Pct + "%"} stopColor="#22c55e" stopOpacity={0.1} />
                                                            <stop offset={(c1Pct + 0.001) + "%"} stopColor="#22c55e" stopOpacity={0} />
                                                            <stop offset={c2Pct + "%"} stopColor="#22c55e" stopOpacity={0} />
                                                            <stop offset={(c2Pct + 0.001) + "%"} stopColor="#22c55e" stopOpacity={0.1} />
                                                            <stop offset="100%" stopColor="#22c55e" stopOpacity={1.0} />
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
                                            tick={{ fill: 'var(--chart-axis-label)', fontSize: 15, fontWeight: 'bold' }}
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
                                            stroke={'var(--color-accent)'}
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
                                                stroke="var(--chart-4)"
                                                strokeWidth={2}
                                                fill="url(#h1Color)"
                                                dot={false}
                                                isAnimationActive={true}
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

                                        {/* Shaded Emerald Layer for Power Area */}
                                        {calculatePower && (
                                            <Area
                                                type="monotone"
                                                dataKey="powerShade"
                                                stroke="none"
                                                fill={'var(--chart-acceptance)'}
                                                dot={false}
                                                isAnimationActive={false}
                                            />
                                        )}



                                        {/* Vertical Reference Line at Mean of H0 */}
                                        <ReferenceLine
                                            x={stats.effectH0Mean}
                                            stroke="var(--color-accent)"
                                            strokeWidth={1.5}
                                            strokeDasharray="10 4"
                                            label={{
                                                value: "μ₀",
                                                position: "bottom",
                                                offset: 20,
                                                dy: 15,
                                                fill: "var(--color-accent)",
                                                fontWeight: "bold",
                                                fontSize: 15
                                            }}
                                        />

                                        {/* Vertical Reference Line at Mean of H1 */}
                                        <ReferenceLine
                                            x={stats.effectH1Mean}
                                            stroke="var(--chart-4)"
                                            strokeWidth={1.5}
                                            strokeDasharray="10 4"
                                            label={calculatePower ? {
                                                value: "μ₁",
                                                position: "bottom",
                                                offset: 20,
                                                dy: 15,
                                                fill: "var(--chart-4)",
                                                fontWeight: "bold",
                                                fontSize: 15
                                            } : undefined}
                                        />

                                        {/* Vertical LINE for SELECTOR: Critical Values */}
                                        {tailType === 'two-tailed' ? (
                                            <>
                                                <ReferenceLine
                                                    x={stats.c1}
                                                    stroke="var(--color-error)"
                                                    strokeWidth={2.5}
                                                    label={{
                                                        value: `C₁: ${stats.c1.toFixed(2)}`,
                                                        position: 'top',
                                                        fill: 'var(--color-error)',
                                                        fontSize: 13,
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                                <ReferenceLine
                                                    x={stats.c2}
                                                    stroke="var(--color-error)"
                                                    strokeWidth={2.5}
                                                    label={{
                                                        value: `C₂: ${stats.c2.toFixed(2)}`,
                                                        position: 'top',
                                                        fill: 'var(--color-error)',
                                                        fontSize: 13,
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </>
                                        ) : (
                                            <ReferenceLine
                                                x={stats.c2}
                                                stroke="var(--color-error)"
                                                strokeWidth={3}
                                                label={{
                                                    value: `C: ${stats.c2.toFixed(2)}`,
                                                    position: 'top',
                                                    fill: 'var(--color-error)',
                                                    fontSize: 14,
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        )}

                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="py-24 text-center text-red-650 text-red-400 font-black text-lg md:text-xl">
                                נא לתקן את שגיאות הקלטים בצד ימין על מנת להציג את הגרף.
                            </div>
                        )}
                    </div>

                    {/* Solutions Steps Accordion / Panel */}
                    <div className="rounded-3xl border shadow-md transition-all overflow-hidden bg-slate-900 border-slate-800 w-full min-w-0 lg:col-span-2 order-3 lg:order-3">
                        <button
                            onClick={() => setShowSteps(!showSteps)}
                            className="w-full px-8 py-5.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-black text-slate-50 hover:bg-slate-800/40 transition-colors border-b border-slate-800/50"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-right">
                                <div className="flex items-center gap-3">
                                    <Calculator className="text-indigo-600" size={24} />
                                    <span className="text-xl sm:text-2xl font-black">שלבי פתרון מתמטיים וגזירת הערכים</span>
                                </div>
                                {isValid && decisionData && (
                                    <div className="mr-0 sm:mr-3 flex items-center shrink-0">
                                        {decisionData.isReject ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-md font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)] leading-none">
                                                <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                                                <span>החלטה: דוחים את </span>
                                                <span dir="ltr" className="inline-block"><InlineMath math="H_0" /></span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-md font-black bg-red-500/15 text-red-400 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)] leading-none">
                                                <XCircle size={18} className="text-red-400 shrink-0" />
                                                <span>החלטה: אין לדחות את </span>
                                                <span dir="ltr" className="inline-block"><InlineMath math="H_0" /></span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center self-end sm:self-auto text-slate-400">
                                {showSteps ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                            </div>
                        </button>

                        <AnimatePresence>
                            {showSteps && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="px-8 py-6.5"
                                >
                                    {isValid && stats ? (
                                        <div className="text-base divide-y divide-slate-700/80">

                                            {/* Step 1: Hypothesis Formulation */}
                                            <div className="space-y-3 py-8">
                                                <div className="flex items-center gap-3 font-extrabold text-indigo-400">
                                                    <span className="w-9 h-9 rounded-full bg-indigo-900/50 text-base font-black flex items-center justify-center border border-indigo-300">1</span>
                                                    <span className="text-xl sm:text-2xl font-black">ניסוח השערות המחקר</span>
                                                </div>

                                                <div className="pr-5 py-1 space-y-4">
                                                    <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-semibold">
                                                        יהי <InlineMath math="X" /> משתנה מקרי המייצג את התצפית באוכלוסייה. אנו בוחנים מדגם מקרי בגודל <InlineMath math="n" />.
                                                        נגדיר את השערת האפס (<InlineMath math="H_0" />) המניחה <span className="font-bold underline">היעדר שינוי</span>, מול השערת המחקר (<InlineMath math="H_1" />) המייצגת את טענת החוקר.
                                                    </p>

                                                    {/* General formula template */}
                                                    <FormulaBlock>
                                                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 lg:gap-12 text-base sm:text-lg md:text-xl w-full px-2 md:px-8">
                                                            <div className="flex flex-col items-center justify-center gap-2 min-w-[300px]">
                                                                <span className={`px-3 py-1 rounded-lg text-sm font-black ${tailType === 'left' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-500'}`}>שמאלי</span>
                                                                <BlockMath math="H_0: \mu \ge \mu_0 \quad \text{Vs.} \quad H_1: \mu < \mu_0" />
                                                            </div>
                                                            <div className="flex flex-col items-center justify-center gap-2 min-w-[300px]">
                                                                <span className={`px-3 py-1 rounded-lg text-sm font-black ${tailType === 'two-tailed' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-500'}`}>דו-צדדי</span>
                                                                <BlockMath math="H_0: \mu = \mu_0 \quad \text{Vs.} \quad H_1: \mu \neq \mu_0" />
                                                            </div>
                                                            <div className="flex flex-col items-center justify-center gap-2 min-w-[300px]">
                                                                <span className={`px-3 py-1 rounded-lg text-sm font-black ${tailType === 'right' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-500'}`}>ימני</span>
                                                                <BlockMath math="H_0: \mu \le \mu_0 \quad \text{Vs.} \quad H_1: \mu > \mu_0" />
                                                            </div>
                                                        </div>
                                                    </FormulaBlock>

                                                    {/* Applied with actual values */}
                                                    <CalcBlock>
                                                        {tailType === 'right' ? (
                                                            <BlockMath math={`H_0: \\mu \\le ${mu0} \\quad \\text{Vs.} \\quad H_1: \\mu > ${mu0}`} />
                                                        ) : tailType === 'left' ? (
                                                            <BlockMath math={`H_0: \\mu \\ge ${mu0} \\quad \\text{Vs.} \\quad H_1: \\mu < ${mu0}`} />
                                                        ) : (
                                                            <BlockMath math={`H_0: \\mu = ${mu0} \\quad \\text{Vs.} \\quad H_1: \\mu \\neq ${mu0}`} />
                                                        )}
                                                    </CalcBlock>

                                                    {/* Researcher's note */}
                                                    <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 leading-relaxed mt-4 text-center">
                                                        <PenTool size={22} className="inline-block ml-2 opacity-60 text-indigo-400" />{' '}
                                                        {tailType === 'right' ? (
                                                            <span>מכיוון שהשערת המחקר <InlineMath math="H_1" /> מציינת הבדל <span className="font-bold underline">בכיוון אחד בלבד</span> (גדול מערך השערת האפס), אנו אומרים שזהו <span className="font-bold">מבחן חד-צדדי (ימני)</span>.</span>
                                                        ) : tailType === 'left' ? (
                                                            <span>מכיוון שהשערת המחקר <InlineMath math="H_1" /> מציינת הבדל <span className="font-bold underline">בכיוון אחד בלבד</span> (קטן מערך השערת האפס), אנו אומרים שזהו <span className="font-bold">מבחן חד-צדדי (שמאלי)</span>.</span>
                                                        ) : (
                                                            <span>מכיוון שהשערת המחקר <InlineMath math="H_1" /> מציינת הבדל <span className="font-bold underline">בשני הכיוונים</span> (שונה מערך השערת האפס), אנו אומרים שזהו <span className="font-bold">מבחן דו-צדדי</span>.</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>


                                            {/* Step 2: Select an appropriate test */}
                                            <div className="space-y-3 py-8">
                                                <div className="flex items-center gap-3 font-extrabold text-indigo-400">
                                                    <span className="w-9 h-9 rounded-full bg-indigo-900/50 text-base font-black flex items-center justify-center border border-indigo-300">2</span>
                                                    <span className="text-xl sm:text-2xl font-black">בחירת מבחן סטטיסטי מתאים</span>
                                                </div>
                                                <div className="flex flex-col items-center w-full py-6 overflow-x-auto bg-slate-900/30 rounded-2xl border border-slate-800/60 mb-6 mt-4">
                                                    <div className="flex flex-col items-center" dir="rtl">
                                                        {/* Q1 */}
                                                        <div className={`px-5 py-2.5 rounded-xl border-2 font-bold shadow-sm z-10 transition-all ${varianceKnown === true || varianceKnown === false ? 'bg-indigo-900/40 border-indigo-500 text-indigo-100' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
                                                            האם סטיית התקן (<InlineMath math="\sigma" />) ידועה?
                                                        </div>

                                                        <div className="flex w-[320px] justify-between relative mt-0">
                                                            {/* Horizontal Line connecting YES and NO */}
                                                            <div className="absolute top-[20px] left-[60px] right-[60px] h-[2px] bg-slate-600"></div>

                                                            {/* YES Branch (Right side in RTL) */}
                                                            <div className="flex flex-col items-center relative z-10 w-[120px]">
                                                                <div className="w-[2px] h-[20px] bg-slate-600"></div>
                                                                <span className={`text-xs font-bold mb-1 px-2 py-0.5 rounded-md transition-all ${varianceKnown ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>כן</span>
                                                                <div className="w-[2px] h-[15px] bg-slate-600"></div>
                                                                <div className={`w-full text-center px-2 py-2 rounded-xl border-2 font-bold z-10 text-sm transition-all ${varianceKnown ? 'bg-indigo-900/40 border-indigo-500 text-indigo-100' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
                                                                    האם המדגם <InlineMath math="n \ge 30" />?
                                                                </div>

                                                                {/* Child branches for Q2 */}
                                                                <div className="flex w-[180px] justify-between relative mt-0">
                                                                    <div className="absolute top-[15px] left-[35px] right-[35px] h-[2px] bg-slate-600"></div>

                                                                    {/* YES for Q2 (Right in RTL) */}
                                                                    <div className="flex flex-col items-center relative z-10 w-[70px]">
                                                                        <div className="w-[2px] h-[15px] bg-slate-600"></div>
                                                                        <span className={`text-xs font-bold mb-1 px-1 rounded-md transition-all ${varianceKnown && n >= 30 ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'}`}>כן</span>
                                                                        <div className="w-[2px] h-[10px] bg-slate-600"></div>
                                                                        <div className={`w-full text-center px-1 py-1.5 rounded-xl border-2 font-bold z-10 transition-all ${varianceKnown && n >= 30 ? 'bg-blue-900/40 border-blue-500 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-blue-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
                                                                            מבחן <InlineMath math="Z" />
                                                                        </div>
                                                                    </div>

                                                                    {/* NO for Q2 (Left in RTL) */}
                                                                    <div className="flex flex-col items-center relative z-10 w-[70px]">
                                                                        <div className="w-[2px] h-[15px] bg-slate-600"></div>
                                                                        <span className={`text-xs font-bold mb-1 px-1 rounded-md transition-all ${varianceKnown && n < 30 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>לא</span>
                                                                        <div className="w-[2px] h-[10px] bg-slate-600"></div>
                                                                        <div className={`w-full text-center px-1 py-1.5 rounded-xl border-2 font-bold z-10 transition-all ${varianceKnown && n < 30 ? 'bg-emerald-900/40 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
                                                                            מבחן <InlineMath math="t" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* NO Branch (Left side in RTL) */}
                                                            <div className="flex flex-col items-center relative z-10 w-[120px]">
                                                                <div className="w-[2px] h-[20px] bg-slate-600"></div>
                                                                <span className={`text-xs font-bold mb-1 px-2 py-0.5 rounded-md transition-all ${!varianceKnown ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>לא</span>
                                                                <div className="w-[2px] h-[15px] bg-slate-600"></div>
                                                                <div className={`w-full text-center px-2 py-2.5 rounded-xl border-2 font-bold z-10 transition-all ${!varianceKnown ? 'bg-emerald-900/40 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
                                                                    מבחן <InlineMath math="t" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Researcher's note */}
                                                <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 leading-relaxed mt-6 text-center">
                                                    <PenTool size={22} className="inline-block ml-2 opacity-60 text-indigo-400" />{' '}
                                                    {varianceKnown && n >= 30 ? (
                                                        <span>מכיוון שסטיית התקן (<InlineMath math="\sigma" />) <span className="font-bold underline">ידועה</span> וגודל המדגם <InlineMath math="n \ge 30" />, המבחן הסטטיסטי המתאים הוא <span className="font-bold">מבחן <InlineMath math="Z" /></span>.</span>
                                                    ) : varianceKnown && n < 30 ? (
                                                        <span>מכיוון שסטיית התקן (<InlineMath math="\sigma" />) <span className="font-bold underline">ידועה</span> אך גודל המדגם קטן מ-30 (<InlineMath math="n < 30" />), נשתמש ב<span className="font-bold">מבחן <InlineMath math="t" /></span>.</span>
                                                    ) : (
                                                        <span>מכיוון שסטיית התקן (<InlineMath math="\sigma" />) <span className="font-bold underline">אינה ידועה</span>, המבחן הסטטיסטי המתאים הוא <span className="font-bold">מבחן <InlineMath math="t" /></span>.</span>
                                                    )}
                                                </p>
                                            </div>

                                            {/* Step 3: Specify the level of significance */}
                                            <div className="space-y-3 py-8">
                                                <div className="flex items-center gap-3 font-extrabold text-indigo-400">
                                                    <span className="w-9 h-9 rounded-full bg-indigo-900/50 text-base font-black flex items-center justify-center border border-indigo-300">3</span>
                                                    <span className="text-xl sm:text-2xl font-black">קביעת רמת המובהקות (<InlineMath math="\alpha" />)</span>
                                                </div>

                                                <p className="text-base sm:text-lg text-slate-200 leading-relaxed pr-9 font-semibold">
                                                    רמת המובהקות (<InlineMath math="\alpha" />) מייצגת את ההסתברות המקסימלית שנסכים לקבל עבור שגיאה מסוג I, דחיית השערת האפס כשהיא למעשה נכונה <span className="text-red-400 font-bold" dir="ltr"><InlineMath math="P(\text{Reject } H_0 \mid H_0 \text{ is True})" /></span>. היא משלימה לרמת הביטחון שהגדרנו מראש:
                                                </p>

                                                <div className="pr-9 py-3 space-y-4 text-xl md:text-2xl">
                                                    <FormulaBlock>
                                                        <BlockMath math={`\\alpha = 1 - \\text{Confidence Level}`} />
                                                    </FormulaBlock>
                                                    <CalcBlock>
                                                        <BlockMath math={`\\alpha = 1 - ${(1 - alpha).toFixed(2)} = ${alpha}`} />
                                                    </CalcBlock>
                                                </div>



                                                {/* Researcher's note */}
                                                <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 leading-relaxed mt-6 text-center">
                                                    <PenTool size={22} className="inline-block ml-2 opacity-60 text-indigo-400" />{' '}
                                                    קבענו שרמת המובהקות של המבחן תהיה <InlineMath math={`\\alpha = ${alpha}`} />, הנגזרת מרמת ביטחון של <InlineMath math={`${((1 - alpha) * 100).toFixed(0)}\\%`} />.
                                                </p>
                                            </div>


                                            {/* Step 4: Critical Value derivation & SE */}
                                            <div className="space-y-3 py-8">
                                                <div className="flex items-center gap-3 font-extrabold text-indigo-400">
                                                    <span className="w-9 h-9 rounded-full bg-indigo-100 bg-indigo-900/50 text-base font-black flex items-center justify-center border border-indigo-300">4</span>
                                                    <span className="text-xl sm:text-2xl font-black">קביעת הערכים הקריטיים והגדרת כלל ההחלטה</span>
                                                </div>

                                                <div className="pr-9 space-y-4">
                                                    <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-semibold mb-6">
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
                                                        <div className="relative w-full max-w-lg mx-auto mb-8 mt-2 pt-6 pb-2 px-2 sm:px-5 bg-slate-950/60 rounded-3xl border border-slate-800/80 shadow-inner" dir="ltr">
                                                            {/* Compact Legend */}
                                                            <div className="absolute top-4 right-6 flex items-center gap-1.5 text-xs text-slate-300 font-bold bg-slate-900/80 py-1.5 px-3 rounded-lg border border-slate-700/50 z-10" dir="rtl">
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

                                                    <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-semibold text-center mt-4">
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
                                                                    <FormulaBlock>
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
                                                                <details className="group mt-4 mb-6 rounded-xl bg-amber-950/20 border border-amber-500/30 shadow-sm transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
                                                                    <summary className="flex items-center gap-2 p-4 cursor-pointer text-amber-400 font-bold outline-none select-none">
                                                                        <div className="flex-1 flex items-center gap-2">
                                                                            <Info size={16} />
                                                                            <span>משמעות האינדקס התחתון <InlineMath math="( _\alpha )" />ומציאת הערך הקריטי</span>
                                                                        </div>
                                                                        <ChevronDown size={18} className="transition-transform duration-300 group-open:rotate-180 text-amber-500/70" />
                                                                    </summary>
                                                                    <div className="p-4 pt-0 text-sm sm:text-base text-slate-300 border-t border-amber-500/10 mt-2">
                                                                        <ul className="list-disc pr-5 space-y-3 leading-relaxed marker:text-amber-500">
                                                                            <li>
                                                                                <strong>המוסכמה הרווחת:</strong> האינדקס התחתון בסימון <InlineMath math={`${varianceKnown ? 'Z' : 't'}_\\alpha`} /> מגדיר את
                                                                                השטח <strong>מימין לערך</strong> על גבי גרף ההתפלגות: <span dir="ltr" className="font-mono text-xs text-amber-300 px-1 py-0.5 rounded"><InlineMath math={`P(${varianceKnown ? 'Z' : 'T'} > ${varianceKnown ? 'z' : 't'}) = \\alpha`} /></span>.
                                                                                לכן, עבור <InlineMath math="\alpha = 0.05" />, הסימון יהיה <InlineMath math={`${varianceKnown ? 'Z' : 't'}_{0.05}`} />.
                                                                            </li>
                                                                            <li>
                                                                                פונקציית התפלגות מצטברת <strong>רגילה</strong> <span dir="ltr" className="font-mono text-xs text-amber-300 px-1 py-0.5 rounded"><InlineMath math={`P(${varianceKnown ? 'Z' : 'T'} < ${varianceKnown ? 'z' : 't'}) = ${varianceKnown ? '\\Phi' : 'F_t'}(${varianceKnown ? 'z' : 't'})`} /></span> מקבלת ערכי <InlineMath math={`${varianceKnown ? 'Z' : 'T'}`} /> ומחזירה הסתברות מצטברת משמאל לערך (<InlineMath math={`${varianceKnown ? 'Z' : 'T'} \\rightarrow \\text{Probability}`} />).
                                                                                כדי למצוא ערך <InlineMath math={`${varianceKnown ? 'Z' : 'T'}`} /> לפי הסתברות נשתמש בפונקציה <strong>ההופכית</strong> <span dir="ltr" className="font-mono text-xs text-amber-300 px-1 py-0.5 rounded"><InlineMath math={`${varianceKnown ? 'z' : 't'} = ${varianceKnown ? '\\Phi^{-1}' : 'F_t^{-1}'}(P(${varianceKnown ? 'Z' : 'T'} < ${varianceKnown ? 'z' : 't'}))`} /></span> המקבלת הסתברויות ומחזירה ערך <InlineMath math={`${varianceKnown ? 'Z' : 'T'}`} /> (<InlineMath math={`\\text{Probability} \\rightarrow ${varianceKnown ? 'Z' : 'T'}`} />).
                                                                            </li>
                                                                        </ul>
                                                                        <div className="mt-4 pt-3 border-t border-amber-500/10 text-center font-semibold text-amber-400 text-sm sm:text-base">
                                                                            פונקציית התפלגות מצטברת הופכית = מציאת ערך ה-{varianceKnown ? 'Z' : 't'} (הערכים בשוליים) בטבלה לפי ההסתברות (הערכים הפנימיים).
                                                                        </div>
                                                                    </div>
                                                                </details>

                                                                <div className="text-xl md:text-2xl space-y-4">
                                                                    <div className="text-right text-lg text-slate-200 font-bold mb-4">החישוב בפועל</div>
                                                                    {tailType === 'right' ? (
                                                                        <>
                                                                            <p className="text-right text-base sm:text-lg text-slate-300 mb-2">לפני שניגשים לנוסחה, אנו חייבים לתרגם לה את הנתון באמצעות המשלים ל-1:</p>
                                                                            <CalcBlock>
                                                                                <BlockMath math={`P(${varianceKnown ? 'Z' : 'T'} \\le z) = 1 - P(${varianceKnown ? 'Z' : 'T'} > z)`} />
                                                                                <BlockMath math={`P(${varianceKnown ? 'Z' : 'T'} \\le z) = 1 - ${alpha} = ${(1 - alpha).toFixed(4)}`} />
                                                                            </CalcBlock>
                                                                            <p className="text-right text-base sm:text-lg text-slate-300 mb-2 mt-4">ורק עכשיו, כשיש לנו את הנתון בפורמט שהנוסחה "מבקשת" (<InlineMath math={`p = ${(1 - alpha).toFixed(4)}`} />), אנחנו יכולים להציב אותו לתוכה (מקביל לחיפוש ערך ה-{varianceKnown ? 'Z' : 't'} ע"י הצלבת ההסתברות <InlineMath math={varianceKnown ? '\\Phi(z)' : 'F_t(t)'} /> שלו מתוך הטבלה):</p>
                                                                            <CalcBlock>
                                                                                <BlockMath math={`${varianceKnown ? 'z' : 't'} = ${varianceKnown ? '\\Phi^{-1}' : 'F^{-1}'}(${(1 - alpha).toFixed(4)}) = ${displayCrit}`} />
                                                                            </CalcBlock>
                                                                        </>
                                                                    ) : tailType === 'left' ? (
                                                                        <>
                                                                            <p className="text-right text-base sm:text-lg text-slate-300 mb-2">במבחן שמאלי, הנתון כבר מתאים לדרישת הנוסחה (שטח משמאל), ולכן אין צורך במשלים ל-1:</p>
                                                                            <CalcBlock>
                                                                                <BlockMath math={`P(${varianceKnown ? 'Z' : 'T'} \\le z) = ${alpha}`} />
                                                                            </CalcBlock>
                                                                            <p className="text-right text-base sm:text-lg text-slate-300 mb-2 mt-4">מכיוון שהנתון כבר בפורמט שהנוסחה "מבקשת" (<InlineMath math={`p = ${alpha}`} />), אנחנו יכולים להציב אותו ישירות לתוכה (מקביל לחיפוש ערך ה-{varianceKnown ? 'Z' : 't'} ע"י הצלבת ההסתברות <InlineMath math={varianceKnown ? '\\Phi(z)' : 'F_t(t)'} /> שלו מתוך הטבלה):</p>
                                                                            <CalcBlock>
                                                                                <BlockMath math={`${varianceKnown ? 'z' : 't'} = ${varianceKnown ? '\\Phi^{-1}' : 'F^{-1}'}(${alpha}) = -${displayCrit}`} />
                                                                            </CalcBlock>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <p className="text-right text-base sm:text-lg text-slate-300 mb-2">במבחן דו-צדדי, אנו מחפשים את הערך העליון שמשאיר חצי מרמת המובהקות מימינו. נתרגם זאת לשטח משמאל:</p>
                                                                            <CalcBlock>
                                                                                <BlockMath math={`P(${varianceKnown ? 'Z' : 'T'} \\le z) = 1 - P(${varianceKnown ? 'Z' : 'T'} > z) = 1 - \\alpha/2`} />
                                                                                <BlockMath math={`P(${varianceKnown ? 'Z' : 'T'} \\le z) = 1 - ${alpha / 2} = ${(1 - alpha / 2).toFixed(4)}`} />
                                                                            </CalcBlock>
                                                                            <p className="text-right text-base sm:text-lg text-slate-300 mb-2 mt-4">ורק עכשיו, כשיש לנו את הנתון בפורמט שהנוסחה "מבקשת" (<InlineMath math={`p = ${(1 - alpha / 2).toFixed(4)}`} />), אנחנו יכולים להציב אותו לתוכה (מקביל לחיפוש ערך ה-{varianceKnown ? 'Z' : 't'} ע"י הצלבת ההסתברות <InlineMath math={varianceKnown ? '\\Phi(z)' : 'F_t(t)'} /> שלו מתוך הטבלה):</p>
                                                                            <CalcBlock>
                                                                                <BlockMath math={`${varianceKnown ? 'z' : 't'} = \\pm ${varianceKnown ? '\\Phi^{-1}' : 'F^{-1}'}(${(1 - alpha / 2).toFixed(4)}) = \\pm ${displayCrit}`} />
                                                                            </CalcBlock>
                                                                        </>
                                                                    )}
                                                                </div>

                                                                {/* Researcher's note */}
                                                                <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 leading-relaxed mt-10 mb-2 text-center">
                                                                    <PenTool size={22} className="inline-block ml-2 opacity-60 text-indigo-400" />{' '}
                                                                    ערך ה-{varianceKnown ? 'Z' : 't'} הקריטי יהווה את הרף שעל פיו נגדיר את אזור הדחייה של המבחן: <InlineMath math={`${varianceKnown ? 'Z' : 't'}_{\\text{crit}} = ${tailType === 'two-tailed' ? '\\pm ' : tailType === 'left' ? '-' : ''}${displayCrit}`} />.
                                                                </p>
                                                            </>
                                                        );
                                                    })()}

                                                    {/* Subheading for Decision Rules */}
                                                    <div className="mt-12 mb-6 pt-8 border-t border-slate-700/60">
                                                        <h4 className="text-2xl font-black text-indigo-300 flex items-center gap-3">
                                                            <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400">
                                                                <Target size={24} />
                                                            </div>
                                                            הגדרת כללי ההחלטה
                                                        </h4>
                                                    </div>

                                                    <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-semibold mt-6">
                                                        כלל ההחלטה של המבחן הסטטיסטי הוא:
                                                    </p>

                                                    <div className="py-3 space-y-4 text-xl md:text-2xl">
                                                        <FormulaBlock>
                                                            <div className="text-slate-400 text-sm md:text-base font-bold mb-2">גישת סטטיסטי המבחן (תאוריה)</div>
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
                                                            <div className="mt-6 border-t border-slate-700/50 pt-4">
                                                                {tailType === 'right' ? (
                                                                    <>
                                                                        <div className="text-emerald-400 font-bold">
                                                                            <BlockMath math={`\\text{If: } ${varianceKnown ? 'Z' : 't'} \\ge ${varianceKnown ? 'z' : 't'}_{\\alpha} \\text{ , Reject } H_0`} />
                                                                        </div>
                                                                        <div className="text-red-400 font-bold mt-4">
                                                                            <BlockMath math={`\\text{If: } ${varianceKnown ? 'Z' : 't'} < ${varianceKnown ? 'z' : 't'}_{\\alpha} \\text{ , Fail to Reject } H_0`} />
                                                                        </div>
                                                                    </>
                                                                ) : tailType === 'left' ? (
                                                                    <>
                                                                        <div className="text-emerald-400 font-bold">
                                                                            <BlockMath math={`\\text{If: } ${varianceKnown ? 'Z' : 't'} \\le -${varianceKnown ? 'z' : 't'}_{\\alpha} \\text{ , Reject } H_0`} />
                                                                        </div>
                                                                        <div className="text-red-400 font-bold mt-4">
                                                                            <BlockMath math={`\\text{If: } ${varianceKnown ? 'Z' : 't'} > -${varianceKnown ? 'z' : 't'}_{\\alpha} \\text{ , Fail to Reject } H_0`} />
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="text-emerald-400 font-bold">
                                                                            <BlockMath math={`\\text{If: } |${varianceKnown ? 'Z' : 't'}| \\ge ${varianceKnown ? 'z' : 't'}_{\\alpha/2} \\text{ , Reject } H_0`} />
                                                                        </div>
                                                                        <div className="text-red-400 font-bold mt-4">
                                                                            <BlockMath math={`\\text{If: } |${varianceKnown ? 'Z' : 't'}| < ${varianceKnown ? 'z' : 't'}_{\\alpha/2} \\text{ , Fail to Reject } H_0`} />
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </FormulaBlock>
                                                    </div>
                                                    
                                                    <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 leading-relaxed text-center mt-6">
                                                        <PenTool size={22} className="inline-block ml-2 opacity-60 text-indigo-400" />{' '}
                                                        בגישת סטטיסטי המבחן נדחה את <strong className="text-white">השערת האפס</strong> (<InlineMath math="H_0" />) אם סטטיסטי המבחן המחושב נופל באזור הדחייה, מעבר לערך הסף הקריטי.
                                                    </p>

                                                    {(() => {
                                                        if (!stats) return null;
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
                                                        const paramSymbol = testType === 'sum' ? '\\sum X' : testType === 'single' ? 'X' : '\\bar{X}';
                                                        const muSymbol = testType === 'sum' ? 'E(\\sum X)' : '\\mu_0';
                                                        return (
                                                            <>
                                                                <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-semibold mt-4">
                                                                    לחלופין, נגדיר את אזור הדחייה (<InlineMath math="C" />) במונחי הערך המקורי ({testType === 'sum' ? 'סכום התצפיות' : testType === 'single' ? 'התצפית הבודדת' : 'ממוצע המדגם'}):
                                                                </p>

                                                                <div className="py-3 space-y-4 text-xl md:text-2xl">
                                                                    <FormulaBlock>
                                                                        <div className="text-slate-400 text-sm md:text-base font-bold mb-2">גישת אזור הדחייה (תאוריה)</div>
                                                                        {tailType === 'right' && <BlockMath math={`${paramSymbol}_{crit} = ${muSymbol} + ${varianceKnown ? 'z' : 't'}_{\\alpha} \\cdot SE`} />}
                                                                        {tailType === 'left' && <BlockMath math={`${paramSymbol}_{crit} = ${muSymbol} - ${varianceKnown ? 'z' : 't'}_{\\alpha} \\cdot SE`} />}
                                                                        {tailType === 'two-tailed' && <BlockMath math={`${paramSymbol}_{crit_{1,2}} = ${muSymbol} \\pm ${varianceKnown ? 'z' : 't'}_{\\alpha/2} \\cdot SE`} />}
                                                                        
                                                                        <div className="mt-6 border-t border-slate-700/50 pt-4">
                                                                            <div className="text-emerald-400 font-bold">
                                                                                {tailType === 'right' && <BlockMath math={`C = \\{ ${paramSymbol} \\mid ${paramSymbol} \\ge ${paramSymbol}_{crit} \\}`} />}
                                                                                {tailType === 'left' && <BlockMath math={`C = \\{ ${paramSymbol} \\mid ${paramSymbol} \\le ${paramSymbol}_{crit} \\}`} />}
                                                                                {tailType === 'two-tailed' && <BlockMath math={`C = \\{ ${paramSymbol} \\mid ${paramSymbol} \\le ${paramSymbol}_{crit_1} \\text{ or } ${paramSymbol} \\ge ${paramSymbol}_{crit_2} \\}`} />}
                                                                                <BlockMath math={`\\text{If: } ${paramSymbol} \\in C \\text{ , Reject } H_0`} />
                                                                            </div>
                                                                            <div className="text-red-400 font-bold mt-4">
                                                                                {tailType === 'right' && <BlockMath math={`\\bar{C} = \\{ ${paramSymbol} \\mid ${paramSymbol} < ${paramSymbol}_{crit} \\}`} />}
                                                                                {tailType === 'left' && <BlockMath math={`\\bar{C} = \\{ ${paramSymbol} \\mid ${paramSymbol} > ${paramSymbol}_{crit} \\}`} />}
                                                                                {tailType === 'two-tailed' && <BlockMath math={`\\bar{C} = \\{ ${paramSymbol} \\mid ${paramSymbol}_{crit_1} < ${paramSymbol} < ${paramSymbol}_{crit_2} \\}`} />}
                                                                                <BlockMath math={`\\text{If: } ${paramSymbol} \\in \\bar{C} \\text{ , Fail to Reject } H_0`} />
                                                                            </div>
                                                                        </div>
                                                                    </FormulaBlock>
                                                                </div>


                                                                
                                                                <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 leading-relaxed text-center mt-6">
                                                                    <PenTool size={22} className="inline-block ml-2 opacity-60 text-indigo-400" />{' '}
                                                                    בגישת אזור הדחייה (הערך המקורי) נדחה את <strong className="text-white">השערת האפס</strong> (<InlineMath math="H_0" />) אם הערך המקורי של המדגם שייך לקבוצת הדחייה (<InlineMath math="C" />).
                                                                </p>
                                                            </>
                                                        );
                                                    })()}


                                                    <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-semibold mt-4">
                                                        כלל ההחלטה (מבוסס גישת P-Value) הוא:
                                                    </p>

                                                    <div className="py-3 space-y-4 text-xl md:text-2xl">
                                                        <FormulaBlock>
                                                            <div className="text-slate-400 text-sm md:text-base font-bold mb-2">גישת מובהקות התוצאה (תאוריה)</div>
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
                                                            
                                                            <div className="mt-6 border-t border-slate-700/50 pt-4">
                                                                <div className="text-emerald-400 font-bold">
                                                                    <BlockMath math={`\\text{If: P-Value } \\le \\alpha \\text{ , Reject } H_0`} />
                                                                </div>
                                                                <div className="text-red-400 font-bold mt-4">
                                                                    <BlockMath math={`\\text{If: P-Value } > \\alpha \\text{ , Fail to Reject } H_0`} />
                                                                </div>
                                                            </div>
                                                        </FormulaBlock>
                                                    </div>

                                                    <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 leading-relaxed text-center mt-6">
                                                        <PenTool size={22} className="inline-block ml-2 opacity-60 text-indigo-400" />{' '}
                                                        בגישת מובהקות התוצאה נדחה את <strong className="text-white">השערת האפס</strong> (<InlineMath math="H_0" />) אם ההסתברות לקבל תוצאת מדגם כזו או קיצונית ממנה קטנה או שווה לרמת המובהקות (<InlineMath math="\alpha" />).
                                                    </p>
                                                </div>
                                            </div>


                                            {/* Step 5: P-Value Calculation */}
                                            <div className="space-y-3 py-8 text-right">
                                                <div className="flex items-center gap-3 font-extrabold text-indigo-400">
                                                    <span className="w-9 h-9 rounded-full bg-indigo-100 bg-indigo-900/50 text-base font-black flex items-center justify-center border border-indigo-300 shrink-0">5</span>
                                                    <span className="text-xl sm:text-2xl font-black">חישוב סטטיסטי המבחן</span>
                                                </div>

                                                <div className="pr-5 py-1 space-y-5">
                                                    <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-semibold">
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
                                                            <div className="text-sm sm:text-base font-bold text-slate-200 mt-2 p-4 bg-slate-800 border border-slate-700 rounded-xl">
                                                                ממוצעי ההתפלגות החדשים הופכים ל-
                                                                <InlineMath math={`n \\cdot \\mu`} />:
                                                                <br />
                                                                תחת H₀: <InlineMath math={`E(\\sum X) = ${nInput} \\cdot ${mu0Input} = ${stats.effectH0Mean}`} />
                                                                <br />
                                                                תחת H₁: <InlineMath math={`E(\\sum X) = ${nInput} \\cdot ${mu1Input} = ${stats.effectH1Mean}`} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-semibold">
                                                        נחשב את סטטיסטי המבחן (מרחק התוצאה מ-<InlineMath math="\mu_0" /> במונחי שגיאות תקן):
                                                    </p>

                                                    {/* Raw formula template */}
                                                    <FormulaBlock>
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
                                                    <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 leading-relaxed mt-6 text-center">
                                                        <PenTool size={22} className="inline-block ml-2 opacity-60 text-indigo-400" /> מצאנו כי סטטיסטי המבחן (מרחק התוצאה מתוחלת <InlineMath math="H_0" />) הוא <span dir="ltr"><InlineMath math={`${varianceKnown ? 'Z' : 't'} = ${decisionData.statObs.toFixed(4)}`} /></span>.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Step 6: P-Value Calculation and Final Decision */}
                                            <div className="space-y-3 py-8 text-right">
                                                <div className="flex items-center gap-3 font-extrabold text-indigo-400">
                                                    <span className="w-9 h-9 rounded-full bg-indigo-100 bg-indigo-900/50 text-base font-black flex items-center justify-center border border-indigo-300 shrink-0">6</span>
                                                    <span className="text-xl sm:text-2xl font-black">קבלת החלטה / הסקת מסקנות</span>
                                                    <span className="text-xs font-bold text-slate-500 mr-auto font-mono">
                                                        <InlineMath math="\alpha" /> = {alpha} | <InlineMath math="n" /> = {n}
                                                    </span>
                                                </div>

                                                <div className="pr-5 py-1 space-y-5">
                                                    <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-semibold">
                                                        ניתן להכריע בדבר דחיית השערת האפס (<InlineMath math="H_0" />) בשלוש דרכים שקולות. בכל הגישות, ההחלטה תהיה זהה.
                                                    </p>

                                                    <div className="overflow-x-auto rounded-xl border border-slate-700 mt-6 mb-8">
                                                        <table className="w-full text-center text-sm sm:text-base">
                                                            <thead className="bg-indigo-950/40 text-indigo-200">
                                                                <tr>
                                                                    <th className="p-4 font-bold border-b border-slate-700/50 text-center">גישה</th>
                                                                    <th className="p-4 font-bold border-b border-slate-700/50 text-center">מדד ההשוואה</th>
                                                                    <th className="p-4 font-bold border-b border-slate-700/50 text-center">כלל ההחלטה (מבחן ימני)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-slate-900/40 text-slate-300">
                                                                <tr className="border-b border-slate-800/50">
                                                                    <td className="p-4 font-bold text-center">סטטיסטי המבחן</td>
                                                                    <td className="p-4 text-center" dir="ltr"><InlineMath math="Z_{stat} \text{ Vs. } z_{\alpha}" /></td>
                                                                    <td className="p-4 text-center">אם <span dir="ltr"><InlineMath math="Z_{stat} \ge z_{\alpha}" /></span> &larr; דחיית <InlineMath math="H_0" /></td>
                                                                </tr>
                                                                <tr className="border-b border-slate-800/50">
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
                                                                <details className="group border border-slate-700 rounded-xl bg-slate-900/50 overflow-hidden" open>
                                                                    <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-5 text-slate-200 hover:bg-slate-800/50 transition-colors [&::-webkit-details-marker]:hidden">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono">1</span>
                                                                            <span>סטטיסטי המבחן <span className="text-sm font-normal text-slate-400 hidden sm:inline-block mr-1">(Standardized Scale)</span></span>
                                                                        </div>
                                                                        <span className="transition group-open:rotate-180">
                                                                            <ChevronDown size={20} className="text-slate-500" />
                                                                        </span>
                                                                    </summary>
                                                                    <div className="p-5 border-t border-slate-700/50 text-slate-300 space-y-4">
                                                                        <div className="mb-4 text-slate-300 leading-relaxed text-sm sm:text-base">
                                                                            <p className="mb-2">גישה זו מנרמלת את המדגם לציון תקן, המציין כמה סטיות תקן הוא מרוחק מתוחלת האפס.</p>
                                                                            <strong className="text-slate-100">דרך החישוב:</strong>
                                                                            <div className="bg-slate-950/30 p-3 rounded-lg border border-slate-700/50 mt-2 mb-3 overflow-x-auto">
                                                                                <BlockMath math={`${statSymbol}_{stat} = \\frac{\\bar{X} - \\mu_0}{SE} = \\frac{${X_bar.toFixed(3)} - ${mu0}}{${stats.se.toFixed(3)}} = ${Z_stat.toFixed(3)}`} />
                                                                            </div>
                                                                            <div className="flex gap-3 items-start bg-blue-950/20 border border-blue-900/30 p-4 rounded-xl mt-4 ml-4">
                                                                                <Info size={20} className="text-blue-400 mt-0.5 shrink-0" />
                                                                                <p className="text-slate-300 text-sm leading-relaxed">בודקים האם התוצאה המנורמלת נמצאת מעבר לסף המובהקות (<InlineMath math={`${critSymbol}_{${alphaSymbol}}`} />) שקבענו מהטבלה.</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            <div className={`bg-emerald-950/20 border p-4 rounded-xl text-center transition-all duration-700 ${isReject ? 'border-emerald-400/60 shadow-[0_0_15px_rgba(52,211,153,0.4)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-emerald-500/20'}`}>
                                                                                <div className="text-emerald-400 font-bold mb-2">אזור הדחייה (Reject <InlineMath math="H_0" />)</div>
                                                                                <BlockMath math={
                                                                                    tailType === 'right' ? `${statSymbol} \\ge ${Z_crit.toFixed(3)}` :
                                                                                    tailType === 'left' ? `${statSymbol} \\le -${Z_crit.toFixed(3)}` :
                                                                                    `|${statSymbol}| \\ge ${Z_crit.toFixed(3)}`
                                                                                } />
                                                                            </div>
                                                                            <div className={`bg-red-950/20 border p-4 rounded-xl text-center transition-all duration-700 ${!isReject ? 'border-red-400/60 shadow-[0_0_15px_rgba(248,113,113,0.4)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-red-500/20'}`}>
                                                                                <div className="text-red-400 font-bold mb-2">אזור אי-הדחייה (Fail to Reject <InlineMath math="H_0" />)</div>
                                                                                <BlockMath math={
                                                                                    tailType === 'right' ? `${statSymbol} < ${Z_crit.toFixed(3)}` :
                                                                                    tailType === 'left' ? `${statSymbol} > -${Z_crit.toFixed(3)}` :
                                                                                    `|${statSymbol}| < ${Z_crit.toFixed(3)}`
                                                                                } />
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-slate-800/50 p-4 rounded-xl text-center font-mono">
                                                                            <BlockMath math={`${statSymbol}_{stat} = ${Z_stat.toFixed(3)}`} />
                                                                        </div>
                                                                        <p className="text-xl font-handwriting font-normal text-center mt-4 leading-relaxed">
                                                                            <span className={isReject ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                                                                {isReject ? `דחיית השערת האפס (Reject H0)` : `אי-דחיית השערת האפס (Fail to reject H0)`}
                                                                            </span>
                                                                            <span className="text-white">
                                                                                {' '}מכיוון שציון התקן (<InlineMath math={statSymbol} />) שחושב עבור ממוצע המדגם <strong dir="ltr" className="inline-block px-1"><InlineMath math={`\\bar{X} = ${X_bar.toFixed(3)}`} /></strong> הינו <strong dir="ltr" className="inline-block px-1"><InlineMath math={`${Z_stat.toFixed(3)}`} /></strong>, אשר נופל ב{isReject ? 'אזור הדחייה' : 'אזור אי-הדחייה'}.
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                </details>

                                                                {/* Accordion 2 */}
                                                                <details className="group border border-slate-700 rounded-xl bg-slate-900/50 overflow-hidden">
                                                                    <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-5 text-slate-200 hover:bg-slate-800/50 transition-colors [&::-webkit-details-marker]:hidden">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono">2</span>
                                                                            <span>אזורי דחייה/אי-דחייה ע"פ ממוצע המדגם <span dir="ltr" className="inline-block px-1">(<InlineMath math="\bar{X}" />)</span> <span className="text-sm font-normal text-slate-400 hidden sm:inline-block mr-1">(Original Scale)</span></span>
                                                                        </div>
                                                                        <span className="transition group-open:rotate-180">
                                                                            <ChevronDown size={20} className="text-slate-500" />
                                                                        </span>
                                                                    </summary>
                                                                    <div className="p-5 border-t border-slate-700/50 text-slate-300 space-y-4">
                                                                        <div className="mb-4 text-slate-300 leading-relaxed text-sm sm:text-base">
                                                                            <p className="mb-2">גישה זו מציגה את הסף ביחידות המקוריות של הבעיה, המאפשרת השוואה ישירה לממוצע המדגם.</p>
                                                                            <strong className="text-slate-100">דרך החישוב:</strong>
                                                                            <div className="bg-slate-950/30 p-3 rounded-lg border border-slate-700/50 mt-2 mb-3 overflow-x-auto">
                                                                                <BlockMath math={`C = \\mu_0 ${tailType === 'left' ? '-' : tailType === 'right' ? '+' : '\\pm'} ${critSymbol}_{${alphaSymbol}} \\cdot SE`} />
                                                                                <BlockMath math={`C = ${mu0} ${tailType === 'left' ? '-' : tailType === 'right' ? '+' : '\\pm'} ${Z_crit.toFixed(3)} \\cdot ${stats.se.toFixed(3)} ${tailType === 'two-tailed' ? `\\Rightarrow [${C_crit_1.toFixed(3)}, ${C_crit_2.toFixed(3)}]` : `= ${C_crit.toFixed(3)}`}`} />
                                                                            </div>
                                                                            <div className="flex gap-3 items-start bg-blue-950/20 border border-blue-900/30 p-4 rounded-xl mt-4 ml-4">
                                                                                <Info size={20} className="text-blue-400 mt-0.5 shrink-0" />
                                                                                <p className="text-slate-300 text-sm leading-relaxed">כל תוצאה השייכת לקבוצת הדחייה <span dir="ltr" className="inline-block px-1"><InlineMath math={`C = \\{ \\bar{X} \\mid ${tailType === 'left' ? '\\bar{X} \\le C' : tailType === 'right' ? '\\bar{X} \\ge C' : `\\bar{X} \\le C_1 \\text{ or } \\bar{X} \\ge C_2`} \\}`} /></span> מעידה על כך שהמדגם אינו עולה בקנה אחד עם השערת האפס.</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            <div className={`bg-emerald-950/20 border p-4 rounded-xl text-center transition-all duration-700 ${isReject ? 'border-emerald-400/60 shadow-[0_0_15px_rgba(52,211,153,0.4)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-emerald-500/20'}`}>
                                                                                <div className="text-emerald-400 font-bold mb-2">אזור הדחייה (<InlineMath math="C" />)</div>
                                                                                <BlockMath math={
                                                                                    tailType === 'right' ? `\\bar{X} \\ge ${C_crit.toFixed(3)}` :
                                                                                    tailType === 'left' ? `\\bar{X} \\le ${C_crit.toFixed(3)}` :
                                                                                    `\\bar{X} \\le ${C_crit_1.toFixed(3)} \\text{ or } \\bar{X} \\ge ${C_crit_2.toFixed(3)}`
                                                                                } />
                                                                            </div>
                                                                            <div className={`bg-red-950/20 border p-4 rounded-xl text-center transition-all duration-700 ${!isReject ? 'border-red-400/60 shadow-[0_0_15px_rgba(248,113,113,0.4)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-red-500/20'}`}>
                                                                                <div className="text-red-400 font-bold mb-2">אזור אי-הדחייה (<InlineMath math="\\bar{C}" />)</div>
                                                                                <BlockMath math={
                                                                                    tailType === 'right' ? `\\bar{X} < ${C_crit.toFixed(3)}` :
                                                                                    tailType === 'left' ? `\\bar{X} > ${C_crit.toFixed(3)}` :
                                                                                    `${C_crit_1.toFixed(3)} < \\bar{X} < ${C_crit_2.toFixed(3)}`
                                                                                } />
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-slate-800/50 p-4 rounded-xl text-center font-mono">
                                                                            <BlockMath math={`\\bar{X} = ${X_bar.toFixed(3)}`} />
                                                                        </div>
                                                                        <p className="text-xl font-handwriting font-normal text-center mt-4 leading-relaxed">
                                                                            <span className={isReject ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                                                                {isReject ? `דחיית השערת האפס (Reject H0)` : `אי-דחיית השערת האפס (Fail to reject H0)`}
                                                                            </span>
                                                                            <span className="text-white">
                                                                                {' '}מכיוון שממוצע המדגם שהתקבל, <strong dir="ltr" className="inline-block px-1"><InlineMath math={`\\bar{X} = ${X_bar.toFixed(3)}`} /></strong>, ממוקם ב{isReject ? 'אזור הדחייה' : 'אזור אי-הדחייה'} (<strong dir="ltr" className="inline-block px-1"><InlineMath math={isReject ? 'C' : '\\bar{C}'} /></strong>).
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                </details>

                                                                {/* Accordion 3 */}
                                                                <details className="group border border-slate-700 rounded-xl bg-slate-900/50 overflow-hidden">
                                                                    <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-5 text-slate-200 hover:bg-slate-800/50 transition-colors [&::-webkit-details-marker]:hidden">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono">3</span>
                                                                            <span>מובהקות התוצאה (P-Value) <span className="text-sm font-normal text-slate-400 hidden sm:inline-block mr-1">(Probability)</span></span>
                                                                        </div>
                                                                        <span className="transition group-open:rotate-180">
                                                                            <ChevronDown size={20} className="text-slate-500" />
                                                                        </span>
                                                                    </summary>
                                                                    <div className="p-5 border-t border-slate-700/50 text-slate-300 space-y-4">
                                                                        <div className="mb-4 text-slate-300 leading-relaxed text-sm sm:text-base">
                                                                            <p className="mb-2">גישה זו מודדת את הסבירות לקבלת התוצאה שנצפתה מהמדגם המקרי תחת התפלגות <InlineMath math="H_0" />, אל מול רמת המובהקות שנקבעה (<InlineMath math="\alpha" />).</p>
                                                                            <strong className="text-slate-100">דרך החישוב:</strong>
                                                                            <div className="bg-slate-950/30 p-3 rounded-lg border border-slate-700/50 mt-2 mb-3 overflow-x-auto">
                                                                                <BlockMath math={tailType === 'right' ? `P\\text{-value} = P(${statSymbol} > ${statSymbol}_{stat})` : tailType === 'left' ? `P\\text{-value} = P(${statSymbol} < ${statSymbol}_{stat})` : `P\\text{-value} = 2 \\cdot P(${statSymbol} > |${statSymbol}_{stat}|)`} />
                                                                                <BlockMath math={tailType === 'right' ? `P\\text{-value} = P(${statSymbol} > ${Z_stat.toFixed(3)}) = ${pVal.toFixed(4)}` : tailType === 'left' ? `P\\text{-value} = P(${statSymbol} < ${Z_stat.toFixed(3)}) = ${pVal.toFixed(4)}` : `P\\text{-value} = 2 \\cdot P(${statSymbol} > ${Math.abs(Z_stat).toFixed(3)}) = ${pVal.toFixed(4)}`} />
                                                                            </div>
                                                                            <div className="flex gap-3 items-start bg-blue-950/20 border border-blue-900/30 p-4 rounded-xl mt-4 ml-4">
                                                                                <Info size={20} className="text-blue-400 mt-0.5 shrink-0" />
                                                                                <p className="text-slate-300 text-sm leading-relaxed">ה-P-value מוגדר כהסתברות המצטברת {tailType === 'right' ? 'מימין' : tailType === 'left' ? 'משמאל' : 'בשני הקצוות מעבר'} לערך סטטיסטי המבחן. אם הסתברות זו קטנה או שווה ל-<InlineMath math="\\alpha" />, התוצאה נחשבת לנדירה מכדי להיות מקרית, מה שמצדיק את דחיית השערת האפס.</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            <div className={`bg-emerald-950/20 border p-4 rounded-xl text-center transition-all duration-700 ${isReject ? 'border-emerald-400/60 shadow-[0_0_15px_rgba(52,211,153,0.4)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-emerald-500/20'}`}>
                                                                                <div className="text-emerald-400 font-bold mb-2">אזור הדחייה (Reject <InlineMath math="H_0" />)</div>
                                                                                <BlockMath math={`\\text{P-Value} \\le ${alpha}`} />
                                                                            </div>
                                                                            <div className={`bg-red-950/20 border p-4 rounded-xl text-center transition-all duration-700 ${!isReject ? 'border-red-400/60 shadow-[0_0_15px_rgba(248,113,113,0.4)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-red-500/20'}`}>
                                                                                <div className="text-red-400 font-bold mb-2">אזור אי-הדחייה (Fail to Reject <InlineMath math="H_0" />)</div>
                                                                                <BlockMath math={`\\text{P-Value} > ${alpha}`} />
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-slate-800/50 p-4 rounded-xl text-center font-mono">
                                                                            <BlockMath math={`\\text{P-Value} = ${pVal.toFixed(4)}`} />
                                                                        </div>
                                                                        <p className="text-xl font-handwriting font-normal text-center mt-4 leading-relaxed">
                                                                            <span className={isReject ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                                                                {isReject ? `דחיית השערת האפס (Reject H0)` : `אי-דחיית השערת האפס (Fail to reject H0)`}
                                                                            </span>
                                                                            <span className="text-white">
                                                                                {' '}מכיוון שהסתברות המובהקות (P-Value) שחושבה הינה <strong dir="ltr" className="inline-block px-1"><InlineMath math={`${pVal.toFixed(4)}`} /></strong>, ערך אשר {isReject ? 'קטן או שווה ל' : 'גדול מ'}-<strong dir="ltr" className="inline-block px-1"><InlineMath math={`\\alpha = ${alpha}`} /></strong>.
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                </details>
                                                            </div>
                                                        );
                                                    })()}

                                                    <div className="mt-8 bg-slate-900/60 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg">
                                                        <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700/80 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <PenTool size={22} className="text-indigo-400" />
                                                                <h4 className="text-xl font-bold text-slate-200 m-0">סיכום ומסקנה סופית</h4>
                                                            </div>
                                                            <div className="mr-3 shrink-0">
                                                                {decisionData.isReject ? (
                                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-md font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)] leading-none">
                                                                        <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                                                                        <span>דוחים את </span>
                                                                        <span dir="ltr" className="inline-block"><InlineMath math="H_0" /></span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-md font-black bg-red-500/15 text-red-400 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)] leading-none">
                                                                        <XCircle size={18} className="text-red-400 shrink-0" />
                                                                        <span>אין לדחות את </span>
                                                                        <span dir="ltr" className="inline-block"><InlineMath math="H_0" /></span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="p-6 space-y-5 text-slate-300 leading-relaxed text-sm sm:text-base">
                                                            <p>
                                                                <strong className="text-slate-100">מסקנה סטטיסטית:</strong> מכיוון שה-<span dir="ltr"><InlineMath math="P\text{-value}" /></span> שווה ל-<strong dir="ltr" className="inline-block px-1"><InlineMath math={`${decisionData.pValue.toFixed(4)}`} /></strong> והוא {decisionData.isReject ? 'קטן או שווה ל' : 'גדול מ'}-<strong dir="ltr" className="inline-block px-1"><InlineMath math={`\\alpha = ${alpha}`} /></strong>, אנו <strong className={decisionData.isReject ? 'text-emerald-400' : 'text-red-400'}>{decisionData.isReject ? 'דוחים את' : 'לא יכולים לדחות את'}</strong> השערת האפס (<InlineMath math="H_0" />).
                                                                {decisionData.isReject ? ` (כל הגישות לעיל מובילות בעקביות לאותה מסקנה, שכן גם סטטיסטי המבחן נופל באזור הדחייה).` : ` (כל הגישות לעיל מובילות בעקביות לאותה מסקנה, שכן סטטיסטי המבחן אינו מגיע לאזור הדחייה).`}
                                                            </p>

                                                            <p>
                                                                <strong className="text-slate-100">במילים אחרות:</strong> נתוני המדגם {decisionData.isReject ? 'מספקים ראיות חזקות לכך ש' : <span><strong>אינם</strong> מספקים עדות סטטיסטית מספקת לכך ש</span>}תוחלת האוכלוסייה (<InlineMath math="\mu" />) {tailType === 'right' ? 'גדולה מ' : tailType === 'left' ? 'קטנה מ' : 'שונה מ'}-<strong dir="ltr" className="inline-block px-1"><InlineMath math={`\\mu_0 = ${mu0}`} /></strong> ברמת מובהקות של <strong dir="ltr" className="inline-block px-1"><InlineMath math={`\\alpha = ${alpha}`} /></strong> (רמת ביטחון של <strong>{((1 - alpha) * 100).toFixed(0)}%</strong>).
                                                            </p>

                                                            <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded-xl mt-4 flex gap-3 items-start">
                                                                <AlertTriangle size={20} className="text-amber-500 mt-0.5 shrink-0" />
                                                                <div className="text-amber-200/80 text-sm">
                                                                    <strong className="text-amber-400">הערה חשובה: </strong>
                                                                    {decisionData.isReject ? (
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
                                                    </div>
                                                </div>
                                            </div>


                                        </div>
                                    ) : (
                                        <p className="text-xl text-red-700 font-extrabold text-center py-8">הנתונים אינם תקינים</p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                                            {/* Supplementary Calculations Section */}
                    {isValid && stats && (
                        <div className="w-full min-w-0 lg:col-span-2 order-4 space-y-6 text-right">

                                                <div className="text-center mb-8">
                                                    <span className="inline-block text-sm font-black text-indigo-400/80 tracking-widest uppercase bg-indigo-950/40 border border-indigo-500/30 px-6 py-2 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">חישובים משלימים (Supplementary)</span>
                                                </div>

                                                {/* Confidence Interval Accordion */}
                                                <details className="group border-2 border-indigo-500/20 rounded-2xl bg-slate-900/40 overflow-hidden shadow-lg" open>
                                                    <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-5 sm:p-6 text-slate-200 hover:bg-slate-800/60 transition-colors [&::-webkit-details-marker]:hidden border-b border-transparent group-open:border-indigo-500/20 group-open:bg-indigo-950/20">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                                                                <Sliders size={26} />
                                                            </div>
                                                            <span className="text-xl sm:text-2xl font-black">רווח סמך (Confidence Interval)</span>
                                                        </div>
                                                        <span className="transition-transform duration-300 group-open:rotate-180 bg-slate-800/50 p-2 rounded-full">
                                                            <ChevronDown size={22} className="text-slate-400" />
                                                        </span>
                                                    </summary>
                                                    <div className="p-5 sm:p-8 space-y-8 bg-slate-900/20">
                                                        <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-medium">
                                                            רווח סמך מספק לנו טווח של ערכים שבו אנו מעריכים שנמצא פרמטר האוכלוסייה (התוחלת <InlineMath math="\mu" />), לעומת מבחן השערות שמספק תשובה החלטית של "כן/לא". להלן שלבי החישוב מבוססים על נתוני המדגם.
                                                        </p>

                                                        <div className="space-y-6">
                                                            <div>
                                                                <div className="flex items-center gap-3 font-extrabold text-indigo-400 mb-4">
                                                                    <span className="w-8 h-8 rounded-full bg-indigo-100 bg-indigo-900/50 text-base font-black flex items-center justify-center border border-indigo-300 shrink-0">1</span>
                                                                    <span className="text-lg font-black">ממוצע המדגם וסטיית התקן (Sample Mean & Standard Deviation)</span>
                                                                </div>
                                                                <CalcBlock>
                                                                    <BlockMath math={`\\bar{X} = ${mu1}`} />
                                                                    {varianceKnown ? (
                                                                        <BlockMath math={`\\sigma = ${sigma} \\quad \\text{(Population SD known)}`} />
                                                                    ) : (
                                                                        <BlockMath math={`s = ${sigma} \\quad \\text{(Sample SD)}`} />
                                                                    )}
                                                                </CalcBlock>
                                                            </div>

                                                            <div>
                                                                <div className="flex items-center gap-3 font-extrabold text-indigo-400 mb-4">
                                                                    <span className="w-8 h-8 rounded-full bg-indigo-100 bg-indigo-900/50 text-base font-black flex items-center justify-center border border-indigo-300 shrink-0">2</span>
                                                                    <span className="text-lg font-black">טעות התקן (Standard Error)</span>
                                                                </div>
                                                                <FormulaBlock>
                                                                    <BlockMath math={`SE = \\frac{${varianceKnown ? '\\sigma' : 's'}}{\\sqrt{n}}`} />
                                                                </FormulaBlock>
                                                                <CalcBlock>
                                                                    <BlockMath math={`SE = \\frac{${sigma}}{\\sqrt{${n}}} = ${stats.se.toFixed(4)}`} />
                                                                </CalcBlock>
                                                            </div>

                                                            <div>
                                                                <div className="flex items-center gap-3 font-extrabold text-indigo-400 mb-4">
                                                                    <span className="w-8 h-8 rounded-full bg-indigo-100 bg-indigo-900/50 text-base font-black flex items-center justify-center border border-indigo-300 shrink-0">3</span>
                                                                    <span className="text-lg font-black">רמת ביטחון וערך קריטי (Confidence Level & Critical Value)</span>
                                                                </div>
                                                                <p className="text-slate-300 mb-3 text-sm">
                                                                    עבור רמת מובהקות של <InlineMath math={`\\alpha = ${alpha}`} />, רמת הביטחון היא <InlineMath math={`1-\\alpha = ${(1 - alpha).toFixed(2)}`} /> (<InlineMath math={`${((1 - alpha) * 100).toFixed(0)}\\%`} />).
                                                                </p>
                                                                
                                                                {(() => {
                                                                    const ciCrit2Side = varianceKnown ? inverseNormalCDF(1 - alpha / 2) : studentTPPF(1 - alpha / 2, stats.df);
                                                                    const ciCrit1Side = varianceKnown ? inverseNormalCDF(1 - alpha) : studentTPPF(1 - alpha, stats.df);
                                                                    const MoE2Side = ciCrit2Side * stats.se;
                                                                    const MoE1Side = ciCrit1Side * stats.se;

                                                                    return (
                                                                        <div className="w-full">
                                                                            {tailType === 'two-tailed' ? (
                                                                                <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl max-w-2xl mx-auto">
                                                                                    <div className="text-center font-bold text-slate-200 mb-3">דו-צדדי (Two-Sided)</div>
                                                                                    <FormulaBlock>
                                                                                        {varianceKnown ? (
                                                                                            <BlockMath math={`Z_{1-\\alpha/2} = Z_{${(1 - alpha / 2).toFixed(3)}}`} />
                                                                                        ) : (
                                                                                            <BlockMath math={`t_{n-1, 1-\\alpha/2} = t_{${stats.df}, ${(1 - alpha / 2).toFixed(3)}}`} />
                                                                                        )}
                                                                                    </FormulaBlock>
                                                                                    <CalcBlock>
                                                                                        <BlockMath math={`${varianceKnown ? 'Z' : 't'}_{crit} = ${ciCrit2Side.toFixed(4)}`} />
                                                                                    </CalcBlock>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl max-w-2xl mx-auto">
                                                                                    <div className="text-center font-bold text-slate-200 mb-3">חד-צדדי (One-Sided)</div>
                                                                                    <FormulaBlock>
                                                                                        {varianceKnown ? (
                                                                                            <BlockMath math={`Z_{1-\\alpha} = Z_{${(1 - alpha).toFixed(3)}}`} />
                                                                                        ) : (
                                                                                            <BlockMath math={`t_{n-1, 1-\\alpha} = t_{${stats.df}, ${(1 - alpha).toFixed(3)}}`} />
                                                                                        )}
                                                                                    </FormulaBlock>
                                                                                    <CalcBlock>
                                                                                        <BlockMath math={`${varianceKnown ? 'Z' : 't'}_{crit} = ${ciCrit1Side.toFixed(4)}`} />
                                                                                    </CalcBlock>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>

                                                            <div>
                                                                <div className="flex items-center gap-3 font-extrabold text-indigo-400 mb-4">
                                                                    <span className="w-8 h-8 rounded-full bg-indigo-100 bg-indigo-900/50 text-base font-black flex items-center justify-center border border-indigo-300 shrink-0">4</span>
                                                                    <span className="text-lg font-black">מרווח טעות ורווח סמך (Margin of Error & Confidence Interval)</span>
                                                                </div>
                                                                {(() => {
                                                                    const ciCrit2Side = varianceKnown ? inverseNormalCDF(1 - alpha / 2) : studentTPPF(1 - alpha / 2, stats.df);
                                                                    const ciCrit1Side = varianceKnown ? inverseNormalCDF(1 - alpha) : studentTPPF(1 - alpha, stats.df);
                                                                    const MoE2Side = ciCrit2Side * stats.se;
                                                                    const MoE1Side = ciCrit1Side * stats.se;

                                                                    const lower2Side = mu1 - MoE2Side;
                                                                    const upper2Side = mu1 + MoE2Side;
                                                                    const lower1Side = mu1 - MoE1Side;
                                                                    const upper1Side = mu1 + MoE1Side;

                                                                    const mu0In2Side = mu0 >= lower2Side && mu0 <= upper2Side;

                                                                    return (
                                                                        <div className="space-y-6">
                                                                            {tailType === 'two-tailed' ? (
                                                                                <div className="bg-indigo-950/20 border-2 border-indigo-500/20 p-5 rounded-xl">
                                                                                    <div className="text-center font-bold text-indigo-200 text-xl mb-4">רווח סמך דו-צדדי (Two-Sided CI)</div>
                                                                                    <FormulaBlock>
                                                                                        <BlockMath math={`MoE = ${varianceKnown ? 'Z' : 't'}_{crit} \\cdot SE`} />
                                                                                        <BlockMath math={`CI = \\left[ \\bar{X} - MoE, \\quad \\bar{X} + MoE \\right]`} />
                                                                                    </FormulaBlock>
                                                                                    <CalcBlock>
                                                                                        <BlockMath math={`MoE = ${ciCrit2Side.toFixed(4)} \\cdot ${stats.se.toFixed(4)} = ${MoE2Side.toFixed(4)}`} />
                                                                                        <BlockMath math={`CI = \\left[ ${mu1} - ${MoE2Side.toFixed(4)}, \\quad ${mu1} + ${MoE2Side.toFixed(4)} \\right]`} />
                                                                                        <div className="mt-4 p-3 bg-indigo-900/40 rounded-lg border border-indigo-400/30 text-indigo-100 font-bold text-2xl text-center">
                                                                                            <BlockMath math={`CI_{2\\text{-sided}} = \\left[ ${lower2Side.toFixed(4)}, \\quad ${upper2Side.toFixed(4)} \\right]`} />
                                                                                        </div>
                                                                                    </CalcBlock>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="bg-slate-900/40 border border-slate-700/50 p-5 rounded-xl">
                                                                                    <div className="text-center font-bold text-slate-300 text-lg mb-4">חסם סמך חד-צדדי (One-Sided Bound)</div>
                                                                                    <CalcBlock>
                                                                                        <BlockMath math={`MoE = ${ciCrit1Side.toFixed(4)} \\cdot ${stats.se.toFixed(4)} = ${MoE1Side.toFixed(4)}`} />
                                                                                    </CalcBlock>
                                                                                    <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 text-center">
                                                                                        {tailType === 'right' ? (
                                                                                            <>
                                                                                                <div className="text-sm text-slate-400 mb-2">חסם תחתון (Lower Bound)</div>
                                                                                                <BlockMath math={`\\left[ \\bar{X} - MoE, \\quad \\infty \\right)`} />
                                                                                                <div className="text-lg font-bold text-slate-200 mt-2" dir="ltr">
                                                                                                    <InlineMath math={`[${lower1Side.toFixed(4)}, \\infty)`} />
                                                                                                </div>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <div className="text-sm text-slate-400 mb-2">חסם עליון (Upper Bound)</div>
                                                                                                <BlockMath math={`\\left( -\\infty, \\quad \\bar{X} + MoE \\right]`} />
                                                                                                <div className="text-lg font-bold text-slate-200 mt-2" dir="ltr">
                                                                                                    <InlineMath math={`(-\\infty, ${upper1Side.toFixed(4)}]`} />
                                                                                                </div>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            <div className="mt-8 mb-4 border border-indigo-500/20 rounded-xl overflow-hidden bg-slate-900/40 p-4">
                                                                                <div className="text-center font-bold text-slate-300 text-lg mb-4">תצוגה גרפית - התפלגות המדגם מול האוכלוסייה</div>
                                                                                <div className="w-full h-64 md:h-80" dir="ltr">
                                                                                    <ResponsiveContainer width="100%" height="100%">
                                                                                        <AreaChart data={ciChartData} margin={{ top: 20, right: 10, left: -25, bottom: 25 }}>
                                                                                            <defs>
                                                                                                <linearGradient id="ciPopColor" x1="0" y1="0" x2="0" y2="1">
                                                                                                    <stop offset="5%" stopColor={'var(--color-accent)'} stopOpacity={0.1} />
                                                                                                    <stop offset="95%" stopColor={'var(--color-accent)'} stopOpacity={0} />
                                                                                                </linearGradient>
                                                                                                <linearGradient id="ciSampleColor" x1="0" y1="0" x2="0" y2="1">
                                                                                                    <stop offset="5%" stopColor="var(--chart-4)" stopOpacity={0.1} />
                                                                                                    <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0} />
                                                                                                </linearGradient>
                                                                                                <linearGradient id="ciFill" x1="0" y1="0" x2="0" y2="1">
                                                                                                    <stop offset="5%" stopColor="var(--chart-4)" stopOpacity={0.4} />
                                                                                                    <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0.1} />
                                                                                                </linearGradient>
                                                                                            </defs>
                                                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={'var(--chart-grid)'} />
                                                                                            
                                                                                            <XAxis 
                                                                                                dataKey="x" 
                                                                                                type="number"
                                                                                                domain={['dataMin', 'dataMax']}
                                                                                                ticks={ciChartTicks}
                                                                                                tick={{ fill: 'var(--chart-axis-label)', fontSize: 15, fontWeight: 'bold' }}
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
                                                                                            <RechartsTooltip content={<CustomCIChartTooltip />} />
                                                                                            
                                                                                            {/* Population Curve Base Area */}
                                                                                            <Area 
                                                                                                type="monotone" 
                                                                                                dataKey="pdfPop" 
                                                                                                stroke={'var(--color-accent)'} 
                                                                                                strokeWidth={2} 
                                                                                                strokeDasharray="5 5"
                                                                                                fill="url(#ciPopColor)" 
                                                                                                dot={false}
                                                                                                isAnimationActive={true} 
                                                                                            />
                                                                                            
                                                                                            {/* Sample Curve Base Area */}
                                                                                            <Area 
                                                                                                type="monotone" 
                                                                                                dataKey="pdfSample" 
                                                                                                stroke="var(--chart-4)" 
                                                                                                strokeWidth={2} 
                                                                                                fill="url(#ciSampleColor)" 
                                                                                                dot={false}
                                                                                                isAnimationActive={true} 
                                                                                            />
                                                                                            
                                                                                            {/* CI Filled Area */}
                                                                                            <Area 
                                                                                                type="monotone" 
                                                                                                dataKey="pdfSampleCI" 
                                                                                                stroke="none" 
                                                                                                fill="url(#ciFill)" 
                                                                                                dot={false}
                                                                                                isAnimationActive={false} 
                                                                                            />

                                                                                            <ReferenceLine x={mu0} stroke={'var(--color-accent)'} strokeDasharray="3 3" label={{ position: 'top', value: 'μ₀', fill: 'var(--color-accent)' }} />
                                                                                            <ReferenceLine x={mu1} stroke="var(--chart-4)" strokeDasharray="3 3" label={{ position: 'top', value: 'x̄', fill: 'var(--chart-4)' }} />
                                                                                            
                                                                                            <Legend verticalAlign="bottom" height={36} content={(props) => {
                                                                                                return (
                                                                                                    <div className="flex justify-center gap-6 mt-2 text-sm text-slate-300" dir="rtl">
                                                                                                        <span className="flex items-center gap-2"><div className="w-4 h-0.5 border-t-2 border-dashed" style={{borderColor: 'var(--color-accent)'}}></div> התפלגות האוכלוסייה (תחת H₀)</span>
                                                                                                        <span className="flex items-center gap-2"><div className="w-4 h-0.5" style={{backgroundColor: 'var(--chart-4)'}}></div> התפלגות המדגם</span>
                                                                                                        <span className="flex items-center gap-2"><div className="w-4 h-4 opacity-40 border" style={{backgroundColor: 'var(--chart-4)', borderColor: 'var(--chart-4)'}}></div> רווח סמך</span>
                                                                                                    </div>
                                                                                                );
                                                                                            }} />
                                                                                        </AreaChart>
                                                                                    </ResponsiveContainer>
                                                                                </div>
                                                                            </div>

                                                                            {/* Connection to Hypothesis Test */}
                                                                            {tailType === 'two-tailed' && (
                                                                                <div className={`p-4 rounded-2xl border-2 mt-4 text-center transition-all ${mu0In2Side ? 'bg-red-950/20 border-red-500/30' : 'bg-emerald-950/20 border-emerald-500/30'}`}>
                                                                                    <p className="text-sm sm:text-base text-slate-200 font-bold leading-relaxed mb-1">
                                                                                        <strong className={mu0In2Side ? 'text-red-300' : 'text-emerald-300'}>קשר למבחן ההשערות הדו-צדדי:</strong>{' '}
                                                                                    </p>
                                                                                    <p className="text-sm sm:text-base text-slate-300 font-semibold leading-relaxed">
                                                                                        {mu0In2Side
                                                                                            ? <>ערך השערת האפס <InlineMath math={`\\mu_0 = ${mu0}`} /> <strong className="text-red-400">נמצא בתוך</strong> גבולות רווח הסמך הדו-צדדי, ולכן לא ניתן לדחות את <InlineMath math="H_0" />.</>
                                                                                            : <>ערך השערת האפס <InlineMath math={`\\mu_0 = ${mu0}`} /> <strong className="text-emerald-400">נמצא מחוץ</strong> לגבולות רווח הסמך הדו-צדדי, ולכן נדחה את <InlineMath math="H_0" />.</>
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            )}

                                                                            {/* Researcher's note */}
                                                                            <p className="text-xl sm:text-2xl font-handwriting font-normal text-slate-300 text-center pt-2 mt-4" style={{ letterSpacing: '0.02em', WebkitFontSmoothing: 'antialiased' }}>
                                                                                <PenTool size={22} className="inline-block ml-2 opacity-60 text-indigo-400" /> אנו בטוחים ברמת ביטחון של {((1 - alpha) * 100).toFixed(0)}% שהתוחלת האמיתית של האוכלוסייה נמצאת בטווח [{lower2Side.toFixed(4)}, {upper2Side.toFixed(4)}].
                                                                            </p>
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </details>

                                                {/* Power Calc Accordion */}
                                                <details className="group border-2 border-indigo-500/20 rounded-2xl bg-slate-900/40 overflow-hidden shadow-lg">
                                                    <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-5 sm:p-6 text-slate-200 hover:bg-slate-800/60 transition-colors [&::-webkit-details-marker]:hidden border-b border-transparent group-open:border-indigo-500/20 group-open:bg-indigo-950/20">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                                                                <Activity size={26} />
                                                            </div>
                                                            <span className="text-xl sm:text-2xl font-black">חישוב עוצמת המבחן (Power & Type II Error)</span>
                                                        </div>
                                                        <span className="transition-transform duration-300 group-open:rotate-180 bg-slate-800/50 p-2 rounded-full">
                                                            <ChevronDown size={22} className="text-slate-400" />
                                                        </span>
                                                    </summary>
                                                    <div className="p-5 sm:p-8 space-y-8 bg-slate-900/20 text-right">
                                                        <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-semibold">
                                                            טעות מסוג שני (<InlineMath math="\beta" />) היא ההסתברות לקבל החלטה שגויה של אי-דחיית השערת האפס, למרות שהיא שקרית במציאות. עוצמת המבחן (<InlineMath math="1-\beta" />) היא ההסתברות לדחות בצדק את השערת האפס (לזהות אפקט אמיתי). לצורך החישוב, יש להגדיר תוחלת ספציפית חלופית <InlineMath math="\mu_1" /> תחת <InlineMath math="H_1" />.
                                                        </p>
                                                        
                                                        {calculatePower ? (
                                                            <div className="space-y-6">
                                                                <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-semibold">
                                                                    נמצא את ההסתברות לאי-דחיית <InlineMath math="H_0" /> (שהמדגם ייפול באזור <InlineMath math="\bar{C}" />), תחת ההנחה כי התוחלת האמיתית היא <InlineMath math="\mu_1" /> (התפלגות <InlineMath math="H_1" />).
                                                                </p>

                                                                {/* General formula template */}
                                                                <FormulaBlock>
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
                                                            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 text-center text-slate-400 space-y-2 max-w-xl mx-auto mt-4">
                                                                <Info size={20} className="mx-auto text-indigo-400" />
                                                                <h5 className="font-extrabold text-slate-200 text-sm sm:text-base">חישוב עוצמת מבחן כבוי</h5>
                                                                <p className="text-xs sm:text-sm font-medium leading-relaxed">
                                                                    על מנת להציג את שלבי החישוב המלאים של טעות מסוג שני (<InlineMath math="\beta" />) ועוצמת המבחן (<InlineMath math="1-\beta" />), הפעל את אפשרות "חישוב עוצמה" בתוך כרטיסיית הפרמטרים למעלה.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </details>
                        </div>
                    )}

                    {/* LEFT Column - Info & Explanations Panel */}
                    <div className="contents">

                        {/* Decision Matrix Hero (Moved to side panel) */}
                        <div className="text-right w-full min-w-0 order-2 lg:order-2">
                            <DecisionMatrix isValid={isValid} stats={stats} alpha={alpha} calculatePower={calculatePower} />
                        </div>

                    </div>

                </div>



            </div>
        </div>
    );
}


