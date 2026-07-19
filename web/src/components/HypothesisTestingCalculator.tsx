import { useLocalStorageState } from '../hooks/useLocalStorageState';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedDetails } from './ui/CustomComponents';
import { Heading } from './ui';
import {
    ChartLegend,
    ChartTooltipShell,
    type ChartLegendItem,
    type ChartTooltipProps,
} from './charts/ChartPrimitives';
import HypothesisTestDisplay from './HypothesisTestDisplay';
import { unifiedDecision } from '../lib/statistics/hypothesis';
import {
    inverseNormalCDF,
    normalCDF,
    normalPDF,
    studentTCDF,
    studentTPDF,
    studentTPPF,
} from '../lib/statistics/math';
import {
    computePowerAnalysis,
} from '../lib/statistics/power';
import { InlineMath, BlockMath } from 'react-katex';
import {
    Info,
    Calculator,
    RefreshCw,
    Sliders,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    XCircle,
    Activity,
    Target,
    Map,
    Percent,
    BookOpen,
    Globe2,
    ExternalLink
} from 'lucide-react';
import { ChartWrapper } from './ui/CustomComponents';
import { HandwrittenNote } from './ui';
import { HypothesisChart, type HypothesisAxisTick } from './charts/HypothesisChart';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    ReferenceLine,
    CartesianGrid,
} from 'recharts';

import {
  StepNumberBadge,
  CalculationStepCard,
  FormulaBlock,
  CalcBlock,
  ResultSummaryCard,
  PowerStepCard,
  ConfidenceIntervalRail,
  TheoryCard,
  ConfidenceIntervalFollowups,
  DecisionMatrix,
  InputTooltip,
  FloatingFieldError,
  CellWatermark,
} from './calc-ui/HypothesisCalcUI';
import { ParameterGrid, ParameterGridHeader, ParameterGridCell, ParameterInputCell } from './calc-ui';
import { PageHeader, ResultBlock } from './ui';
import { useHypothesisTestCalculations } from './hooks/useHypothesisTestCalculations';
import { HypothesisTestingSteps } from './hypothesis-testing/HypothesisTestingSteps';
import { ConfidenceIntervalSection } from './hypothesis-testing/ConfidenceIntervalSection';
import { PowerAnalysisSection } from './hypothesis-testing/PowerAnalysisSection';

// --- Types ---
type TailType = 'right' | 'left' | 'two-tailed';

interface HypothesisChartDataPoint {
    x: number;
    pdfH0: number;
    pdfH1?: number;
    alphaShade?: number;
    powerShade?: number;
}

const DEFAULT_BODY_TEMPERATURE_STUDY = {
    varianceKnown: true,
    calculatePower: true,
    mu0: 37,
    mu0Input: '37',
    xBar: 36.82,
    xBarInput: '36.82',
    mu1: 36.82,
    mu1Input: '36.82',
    sigma: 0.41,
    sigmaInput: '0.41',
    n: 148,
    nInput: '148',
    alpha: 0.05,
    alphaInput: '0.05',
    tailType: 'left' as TailType,
    ciTailType: 'two-tailed' as TailType,
    ciAlpha: 0.05,
};

// No props needed - dark-only theme

interface HypothesisTestingCalculatorProps {
    onStartLocalTour?: () => void;
}

/**
 * Static 'Example Study' body (Wunderlich/Mackowiak body-temperature case).
 * Memoized: it contains ~18 static KaTeX <InlineMath> renders that are
 * expensive to re-typeset. It never reads parent state, so it renders
 * once and is skipped on parent re-renders (fixes the ~200ms touch lag).
 */
const HypothesisStudyExampleBody = React.memo(function HypothesisStudyExampleBody() {
  return (
                <div className="relative z-10 p-4 sm:p-6 space-y-5">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <span className="absolute top-4 left-8 -rotate-12 text-5xl sm:text-6xl font-mono font-semibold text-[var(--color-accent-cobalt)]/10" dir="ltr"><InlineMath math="\bar{X} = 36.82^\circ C" /></span>
                        <span className="absolute top-24 right-10 rotate-6 text-4xl sm:text-5xl font-mono font-semibold text-[var(--color-primary)]/10" dir="ltr"><InlineMath math="n = 148" /></span>
                        <span className="absolute bottom-16 left-12 rotate-3 text-4xl sm:text-6xl font-mono font-semibold text-[var(--color-success)]/10" dir="ltr"><InlineMath math="\text{Reject } H_0" /></span>
                        <span className="absolute bottom-3 right-20 -rotate-6 text-4xl sm:text-5xl font-mono font-semibold text-[var(--color-accent-crimson)]/10" dir="ltr"><InlineMath math="\alpha = 5\%" /></span>
                    </div>

                    <div className="relative grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5 text-sm leading-relaxed">
                        <section className="bg-[var(--color-surface)]/80 border border-[var(--color-border)] rounded-lg p-4 sm:p-5">
                            <Heading level="subsection" className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                                <Target size={18} className="text-[var(--color-accent-cobalt)]" />
                                <span>רקע והשערות מבחן</span>
                            </Heading>
                            <p className="text-[var(--color-text-secondary)]">
                                <span className="text-[var(--color-text-primary)] font-bold">Wunderlich</span> קבע ב-1868 ש-<span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="37.0^\circ C" /></span> היא נקודת הייחוס לחום גוף תקין. Mackowiak בדק מחדש אם ממוצע חום הגוף באוכלוסייה נמוך מהקונצנזוס הזה.
                            </p>
                            <p className="mt-3 text-[var(--color-text-secondary)]">
                                המדגם כלל <span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="n = 148" /></span> נבדקים בריאים; ממוצע המדגם <span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="\bar{X} = 36.82^\circ C" /></span> הושווה ל-<span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="\mu_0 = 37.0^\circ C" /></span> באמצעות מבחן Z לתוחלת.
                            </p>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)]/40 p-3">
                                    <div className="text-[var(--color-text-secondary)] mb-1">השערת אפס</div>
                                    <div className="text-[var(--color-text-primary)] font-semibold" dir="ltr"><InlineMath math="H_0: \mu = 37.0" /></div>
                                </div>
                                <div className="rounded-md border border-[var(--color-accent-cobalt-line)]/40 bg-[var(--color-accent-cobalt-bg)]/10 p-3">
                                    <div className="text-[var(--color-text-secondary)] mb-1">השערת מחקר</div>
                                    <div className="text-[var(--color-text-primary)] font-semibold" dir="ltr"><InlineMath math="H_1: \mu < 37.0" /></div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-[var(--color-surface)]/80 border border-[var(--color-border)] rounded-lg p-4 sm:p-5">
                            <Heading level="subsection" className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                                <Calculator size={18} className="text-[var(--color-primary)]" />
                                <span>נתונים יבשים</span>
                            </Heading>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    ['תוחלת של השערת האפס', '\\mu_0 = 37.0^\\circ C'],
                                    ['ממוצע מדגם', '\\bar{X} = 36.82^\\circ C'],
                                    ['סטיית תקן', '\\sigma = 0.41'],
                                    ['גודל מדגם', 'n = 148'],
                                ].map(([label, math]) => (
                                    <div key={label} className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)]/40 p-3">
                                        <div className="text-[var(--color-text-secondary)] text-xs">{label}</div>
                                        <div className="text-[var(--color-text-primary)] font-semibold font-mono" dir="ltr"><InlineMath math={math} /></div>
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
                            <Heading level="subsection" className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                                <Percent size={18} className="text-[var(--color-primary)]" />
                                <span>מובהקות</span>
                            </Heading>
                            <p className="text-[var(--color-text-secondary)]">
                                ברירת המחדל היא <span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="\alpha = 5\%" /></span>, אבל התוצאה רחוקה מספיק מ-<span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="37.0^\circ C" /></span> כך שגם רמות מובהקות מחמירות יותר עדיין מובילות לדחיית <span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="H_0" /></span>.
                            </p>
                        </section>

                        <section className="bg-[var(--color-surface)]/80 border border-[var(--color-success)]/30 rounded-lg p-4 sm:p-5">
                            <Heading level="subsection" className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                                <CheckCircle size={18} className="text-[var(--color-success)]" />
                                <span>מסקנה</span>
                            </Heading>
                            <p className="text-[var(--color-text-secondary)]">
                                <span className="text-[var(--color-text-primary)] font-bold">התוצאה מובהקת מאוד</span>: המדגם תומך ב-<span className="text-[var(--color-text-primary)] font-bold">דחיית השערת האפס</span> ובהערכה שחום הגוף הממוצע קרוב ל-<span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="36.8^\circ C" /></span>. גם רמות מובהקות מחמירות מ-<span className="text-[var(--color-text-primary)] font-bold" dir="ltr"><InlineMath math="5\%" /></span> עדיין יובילו לדחייה במקרה הזה.
                            </p>
                        </section>
                    </div>

                    <div className="relative bg-[var(--color-surface)]/80 border border-[var(--color-accent-cobalt-line)]/40 rounded-lg p-4 text-sm text-[var(--color-text-secondary)]">
                        <span className="font-semibold text-[var(--color-text-primary)] inline-flex items-center gap-2">
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
  );
});

export default function HypothesisTestingCalculator({ onStartLocalTour }: HypothesisTestingCalculatorProps) {

    // Input states
    const [varianceKnown, setVarianceKnown] = useLocalStorageState<boolean>('HT_varianceKnown', DEFAULT_BODY_TEMPERATURE_STUDY.varianceKnown);
    const [showPowerOverlay, setShowPowerOverlay] = useLocalStorageState<boolean>('HT_showPowerOverlay', DEFAULT_BODY_TEMPERATURE_STUDY.calculatePower);

    const [mu0, setMu0] = useLocalStorageState<number>('HT_mu0', DEFAULT_BODY_TEMPERATURE_STUDY.mu0);
    const [mu0Input, setMu0Input] = useLocalStorageState<string>('HT_mu0Input', DEFAULT_BODY_TEMPERATURE_STUDY.mu0Input);

    const [xBar, setXBar] = useLocalStorageState<number>('HT_xBar', DEFAULT_BODY_TEMPERATURE_STUDY.xBar);
    const [xBarInput, setXBarInput] = useLocalStorageState<string>('HT_xBarInput', DEFAULT_BODY_TEMPERATURE_STUDY.xBarInput);

    const [mu1, setMu1] = useLocalStorageState<number>('HT_mu1', DEFAULT_BODY_TEMPERATURE_STUDY.mu1);
    const [mu1Input, setMu1Input] = useLocalStorageState<string>('HT_mu1Input', DEFAULT_BODY_TEMPERATURE_STUDY.mu1Input);

    const [sigma, setSigma] = useLocalStorageState<number>('HT_sigma', DEFAULT_BODY_TEMPERATURE_STUDY.sigma);
    const [sigmaInput, setSigmaInput] = useLocalStorageState<string>('HT_sigmaInput', DEFAULT_BODY_TEMPERATURE_STUDY.sigmaInput);

    const [n, setN] = useLocalStorageState<number>('HT_n', DEFAULT_BODY_TEMPERATURE_STUDY.n);
    const [nInput, setNInput] = useLocalStorageState<string>('HT_nInput', DEFAULT_BODY_TEMPERATURE_STUDY.nInput);

    const [alpha, setAlpha] = useLocalStorageState<number>('HT_alpha', DEFAULT_BODY_TEMPERATURE_STUDY.alpha);
    const [alphaInput, setAlphaInput] = useLocalStorageState<string>('HT_alphaInput', DEFAULT_BODY_TEMPERATURE_STUDY.alphaInput);

    const [tailType, setTailType] = useLocalStorageState<TailType>('HT_tailType', DEFAULT_BODY_TEMPERATURE_STUDY.tailType);

    const [ciTailType, setCiTailType] = useLocalStorageState<TailType>('HT_ciTailType', DEFAULT_BODY_TEMPERATURE_STUDY.ciTailType);
    const [ciAlpha, setCiAlpha] = useLocalStorageState<number>('HT_ciAlpha', DEFAULT_BODY_TEMPERATURE_STUDY.ciAlpha);

    const applyCiAlphaPreset = (preset: number) => {
        setCiAlpha(preset);
    };

    // Keep typing instant: push the expensive numeric recompute (which drives
    // the Recharts bell-curve + KaTeX step cards) into a low-priority
    // transition so it never blocks the keypress/input interaction window
    // (INP). The raw string state stays urgent so the input box tracks keys.
    const [, startTransition] = useTransition();

    const statSymbol = '\\bar{X}';
    const statName = 'ממוצע המדגם';
    const statNamePlural = 'ממוצעי מדגם';
    const sampleStatisticLabel = 'ממוצע מדגם';
    const sampleStatisticTooltip = 'ממוצע המדגם בפועל שנבדק מול השערת האפס';



    // Accordion state
    const [showHypothesisTesting, setShowHypothesisTesting] = useState<boolean>(false);
    const [showCI, setShowCI] = useState<boolean>(false);
    const [showPower, setShowPower] = useState<boolean>(false);

    const openHypothesisStep2FromLink = async () => {
        setShowHypothesisTesting(true);
        setShowCI(false);
        setShowPower(false);

        window.history.replaceState(null, '', '#hypothesis-step-2');

        const emitOpenPath = () => {
            window.dispatchEvent(new CustomEvent('toc-open-path', { detail: { ids: ['hypothesis-panel', 'step-2'] } }));
        };

        const waitForTarget = (id: string, attemptsLeft = 24): Promise<HTMLElement | null> => (
            new Promise((resolve) => {
                const tryResolve = () => {
                    const target = document.getElementById(id);
                    if (target || attemptsLeft <= 0) {
                        resolve(target);
                        return;
                    }

                    requestAnimationFrame(() => {
                        waitForTarget(id, attemptsLeft - 1).then(resolve);
                    });
                };

                tryResolve();
            })
        );

        const scrollToTarget = (target: HTMLElement) => {
            const targetTop = target.getBoundingClientRect().top + window.scrollY;
            const viewportOffset = Math.max(Math.round(window.innerHeight * 0.1), 88);

            window.scrollTo({
                top: Math.max(0, targetTop - viewportOffset),
                behavior: 'smooth',
            });
        };

        const flashTarget = (target: HTMLElement) => {
            target.classList.remove('toc-target-flash');
            void target.offsetWidth;

            const previousTabIndex = target.getAttribute('tabindex');
            if (!previousTabIndex) {
                target.setAttribute('tabindex', '-1');
            }

            target.classList.add('toc-target-flash');
            target.focus({ preventScroll: true });

            window.setTimeout(() => {
                target.classList.remove('toc-target-flash');
                if (!previousTabIndex) {
                    target.removeAttribute('tabindex');
                }
            }, 1350);
        };

        emitOpenPath();
        await new Promise((resolve) => window.setTimeout(resolve, 60));
        emitOpenPath();
        await new Promise((resolve) => window.setTimeout(resolve, 180));
        emitOpenPath();
        await new Promise((resolve) => window.setTimeout(resolve, 240));

        const target = await waitForTarget('step-2');
        if (!target) {
            return;
        }

        scrollToTarget(target);
        window.setTimeout(() => flashTarget(target), 320);
    };

    const openPowerSectionFromQuickNav = () => {
        setShowPower(true);

        const target = document.getElementById('power-panel');
        if (!target) {
            return;
        }

        const targetTop = target.getBoundingClientRect().top + window.scrollY;
        const viewportOffset = Math.max(Math.round(window.innerHeight * 0.1), 88);

        window.scrollTo({
            top: Math.max(0, targetTop - viewportOffset),
            behavior: 'smooth',
        });

        window.dispatchEvent(new CustomEvent('toc-open-path', { detail: { ids: ['power-panel'] } }));

        window.setTimeout(() => {
            target.classList.remove('toc-target-flash');
            void target.offsetWidth;
            target.classList.add('toc-target-flash');

            window.setTimeout(() => {
                target.classList.remove('toc-target-flash');
            }, 1350);
        }, 320);
    };

    useEffect(() => {
        const handleOpenPath = (event: Event) => {
            const customEvent = event as CustomEvent<{ ids?: string[] }>;
            const openIds = customEvent.detail?.ids ?? [];

            if (openIds.includes('hypothesis-panel')) {
                setShowHypothesisTesting(true);
            }

            if (openIds.includes('confidence-panel')) {
                setShowCI(true);
            }

            if (openIds.includes('power-panel')) {
                setShowPower(true);
            }
        };

        window.addEventListener('toc-open-path', handleOpenPath);
        return () => window.removeEventListener('toc-open-path', handleOpenPath);
    }, []);

    useEffect(() => {
        const handleHashNavigation = () => {
            if (window.location.hash === '#hypothesis-step-2') {
                void openHypothesisStep2FromLink();
            }
        };

        handleHashNavigation();
        window.addEventListener('hashchange', handleHashNavigation);
        return () => window.removeEventListener('hashchange', handleHashNavigation);
    }, []);

    const parsedMu1Input = useMemo(() => {
        const parsed = parseFloat(mu1Input);
        return mu1Input.trim() !== '' && !Number.isNaN(parsed) ? parsed : null;
    }, [mu1Input]);

    const powerInputError = useMemo(() => {
        if (mu1Input.trim() === '') return 'שדה חובה';
        if (parsedMu1Input === null) return 'הזן מספר תקין';
        return undefined;
    }, [mu1Input, parsedMu1Input]);

    const powerEnabled = parsedMu1Input !== null;

    // Error validations
    const errors = useMemo(() => {
        const errList: { [key: string]: string } = {};

        const parsedMu0 = parseFloat(mu0Input);
        if (mu0Input.trim() === '') errList.mu0 = 'שדה חובה';
        else if (isNaN(parsedMu0)) errList.mu0 = 'הזן מספר תקין';

        const parsedXBar = parseFloat(xBarInput);
        if (xBarInput.trim() === '') errList.xBar = 'שדה חובה';
        else if (isNaN(parsedXBar)) errList.xBar = 'הזן מספר תקין';

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
    }, [mu0Input, xBarInput, sigmaInput, nInput, alphaInput]);

    const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

    // Handle input changes
    const handleMu0Change = (val: string) => {
        setMu0Input(val);
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) startTransition(() => setMu0(parsed));
    };

    const handleXBarChange = (val: string) => {
        setXBarInput(val);
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) startTransition(() => setXBar(parsed));
    };

    const handleMu1Change = (val: string) => {
        setMu1Input(val);
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) startTransition(() => setMu1(parsed));
    };

    const handleSigmaChange = (val: string) => {
        setSigmaInput(val);
        const parsed = parseFloat(val);
        if (!isNaN(parsed) && parsed > 0) startTransition(() => setSigma(parsed));
    };

    const handleNChange = (val: string) => {
        setNInput(val);
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed) && parsed > 0) startTransition(() => setN(parsed));
    };

    const handleAlphaChange = (val: string) => {
        setAlphaInput(val);
        const parsed = parseFloat(val);
        if (!isNaN(parsed) && parsed > 0 && parsed < 1) startTransition(() => setAlpha(parsed));
    };

    // Safe preset setters
    const applyAlphaPreset = (preset: number) => {
        setAlpha(preset);
        setAlphaInput(preset.toString());
    };

    // Reset calculator to the Mackowiak body-temperature study defaults.
    const handleReset = () => {
        setVarianceKnown(DEFAULT_BODY_TEMPERATURE_STUDY.varianceKnown);
        setShowPowerOverlay(DEFAULT_BODY_TEMPERATURE_STUDY.calculatePower);
        setMu0(DEFAULT_BODY_TEMPERATURE_STUDY.mu0);
        setMu0Input(DEFAULT_BODY_TEMPERATURE_STUDY.mu0Input);
        setXBar(DEFAULT_BODY_TEMPERATURE_STUDY.xBar);
        setXBarInput(DEFAULT_BODY_TEMPERATURE_STUDY.xBarInput);
        setMu1(DEFAULT_BODY_TEMPERATURE_STUDY.mu1);
        setMu1Input(DEFAULT_BODY_TEMPERATURE_STUDY.mu1Input);
        setSigma(DEFAULT_BODY_TEMPERATURE_STUDY.sigma);
        setSigmaInput(DEFAULT_BODY_TEMPERATURE_STUDY.sigmaInput);
        setN(DEFAULT_BODY_TEMPERATURE_STUDY.n);
        setNInput(DEFAULT_BODY_TEMPERATURE_STUDY.nInput);
        setAlpha(DEFAULT_BODY_TEMPERATURE_STUDY.alpha);
        setAlphaInput(DEFAULT_BODY_TEMPERATURE_STUDY.alphaInput);
        setTailType(DEFAULT_BODY_TEMPERATURE_STUDY.tailType);
        setCiTailType(DEFAULT_BODY_TEMPERATURE_STUDY.ciTailType);
        setCiAlpha(DEFAULT_BODY_TEMPERATURE_STUDY.ciAlpha);
    };


    // --- Core Calculations Engine (using hook) ---
    const calculationsResult = useHypothesisTestCalculations({
        isValid,
        mu0,
        xBar,
        sigma,
        n,
        alpha,
        tailType,
        varianceKnown,
        parsedMu1Input,
        powerEnabled,
        showPowerOverlay,
        ciAlpha,
        ciTailType,
    });

    const {
        stats,
        decisionData,
        chartLimits,
        xAxisTicks,
        chartData,
        powerStats,
        ciChartData,
        ciChartTicks,
    } = calculationsResult;

    const CustomCIChartTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const dataPt = payload[0].payload;
            return (
                <div className="p-3 border rounded-sm shadow-sm text-sm font-sans space-y-2 backdrop-blur-md bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] min-w-[160px]" dir="rtl">
                    <div className="flex justify-between gap-6 border-b border-[var(--color-border)] pb-2 mb-2">
                        <span className="font-bold text-[var(--color-accent-cobalt)]">ממוצע <InlineMath math="\bar{X}" />:</span>
                        <span className="font-mono font-bold text-[var(--color-accent-cobalt)]" dir="ltr">{dataPt.x.toFixed(2)}</span>
                    </div>
                    <div className="text-xs font-bold text-[var(--color-text-secondary)] mb-1">צפיפות הסתברות:</div>
                    <div className="flex justify-between gap-6" style={{ color: 'var(--color-primary)' }}>
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

    const CustomChartTooltip = ({ active, payload }: ChartTooltipProps<HypothesisChartDataPoint>) => {
        if (active && payload && payload.length) {
            const dataPt = payload[0].payload;
            return (
                <ChartTooltipShell className="text-sm min-w-[160px]">
                    <div className="flex justify-between gap-6 border-b border-[var(--color-border)] pb-2 mb-2">
                        <span className="font-bold text-[var(--color-accent-cobalt)]">ממוצע <InlineMath math="\bar{X}" />:</span>
                        <span className="font-mono font-bold text-[var(--color-accent-cobalt)]" dir="ltr">{dataPt.x.toFixed(2)}</span>
                    </div>
                    <div className="text-xs font-bold text-[var(--color-text-secondary)] mb-1">צפיפות הסתברות:</div>
                    <div className="flex justify-between gap-6 text-[var(--color-primary)]">
                        <span className="font-semibold">אוכלוסיה (<InlineMath math="H_0" />):</span>
                        <span className="font-mono font-bold" dir="ltr">{dataPt.pdfH0.toFixed(2)}</span>
                    </div>
                    {dataPt.pdfH1 !== undefined && (
                        <div className="flex justify-between gap-6 text-[var(--chart-2)]">
                            <span className="font-semibold">מדגם (<InlineMath math="H_1" />):</span>
                            <span className="font-mono font-bold" dir="ltr">{dataPt.pdfH1.toFixed(2)}</span>
                        </div>
                    )}
                </ChartTooltipShell>
            );
        }
        return null;
    };

    const showH1OnChart = powerEnabled && showPowerOverlay;

    const hypothesisLegendItems = useMemo((): ChartLegendItem[] => {
        const items: ChartLegendItem[] = [
            { math: 'H_0', color: 'var(--chart-1)', style: 'area' },
            { math: String.raw`\alpha`, color: 'var(--color-accent-crimson)', style: 'area' },
            { math: 'C', color: 'var(--color-accent-crimson)', style: 'line', label: <span dir="rtl">קריטי</span> },
            { math: String.raw`\bar{X}`, color: 'var(--color-text-primary)', style: 'dashed-line' },
        ];

        if (showH1OnChart) {
            items.splice(1, 0, { math: 'H_1', color: 'var(--chart-2)', style: 'area' });
            items.push({ math: String.raw`1-\beta`, color: 'var(--chart-2)', style: 'area' });
        }

        return items;
    }, [showH1OnChart]);

    const decisionMatrixStats = powerEnabled && powerStats && stats
        ? { ...stats, beta: powerStats.beta, power: powerStats.power }
        : stats;

    const unifiedDecisionResult = useMemo(() => {
        if (!stats || !decisionData || !isValid) return null;

        return unifiedDecision({
            sample: decisionData.xBar,
            nullMean: stats.effectH0Mean,
            stdDev: stats.se * Math.sqrt(n),
            n,
            alpha,
            tail: tailType,
            varianceKnown: stats.varianceKnown,
        });
    }, [stats, decisionData, isValid, n, alpha, tailType]);

    return (
        <div className="tour-step-intro space-y-8 min-h-screen text-[var(--color-text-primary)] p-4 sm:p-6 md:p-8" dir="rtl">
            {/* Default Study Accordion */}
            <AnimatedDetails id="hypothesis-study-example" tocId="hypothesis-study-example" defaultOpen className="group relative bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg mb-8 shadow-sm border-r-4 border-r-[var(--color-accent-cobalt)] overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="relative z-10 cursor-pointer select-none p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center gap-4 border-b border-[var(--color-border)]/70 overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <span className="absolute top-2 left-[18%] -rotate-6 text-2xl sm:text-4xl font-mono font-semibold text-[var(--color-accent-cobalt)]/10" dir="ltr"><InlineMath math="\bar{X} = 36.82^\circ C" /></span>
                        <span className="absolute top-7 left-[42%] rotate-3 text-xl sm:text-3xl font-mono font-semibold text-[var(--color-primary)]/10" dir="ltr"><InlineMath math="n = 148" /></span>
                        <span className="absolute bottom-1 right-[34%] -rotate-2 text-xl sm:text-3xl font-mono font-semibold text-[var(--color-success)]/10" dir="ltr"><InlineMath math="H_1: \mu < 37" /></span>
                        <span className="absolute bottom-2 left-[6%] rotate-6 text-xl sm:text-3xl font-mono font-semibold text-[var(--color-accent-crimson)]/10" dir="ltr"><InlineMath math="\alpha = 5\%" /></span>
                    </div>
                    <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-[var(--color-accent-cobalt-bg)]/20 p-2 rounded-lg text-[var(--color-accent-cobalt)] shrink-0">
                            <Globe2 size={20} />
                        </div>
                        <Heading level="section" data-toc data-toc-target="hypothesis-study-example" data-toc-open="hypothesis-study-example" className="font-semibold text-base sm:text-lg">
                            דוגמה מהמציאות: בדיקת השערות על טמפרטורת גוף (צלזיוס)
                        </Heading>
                    </div>
                    <div className="relative z-10 flex flex-wrap items-center gap-3 xl:justify-end">
                        <button
                            type="button"
                            onClick={(event) => {
                                event.preventDefault();
                                handleReset();
                            }}
                            className="px-4 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/50 rounded-md text-sm font-bold shadow-sm hover:bg-[var(--color-primary)]/20 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={16} />
                            <span>טען נתוני ברירת מחדל</span>
                        </button>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.preventDefault();
                                onStartLocalTour?.();
                            }}
                            className="tour-hypothesis-local-trigger cursor-pointer px-4 py-1.5 bg-[var(--color-accent-cobalt-bg)] text-[var(--color-accent-cobalt)] border border-[var(--color-accent-cobalt-line)]/50 rounded-md text-sm font-bold shadow-sm hover:bg-[var(--color-accent-cobalt-bg-hover)] hover:text-white transition-colors flex items-center gap-2"
                        >
                            <span>סיור בדיקת השערות</span>
                        </button>
                        <ChevronDown size={22} className="text-[var(--color-text-secondary)] transition-transform duration-300 group-[.is-open]:rotate-180" />
                    </div>
                </summary>

                    <HypothesisStudyExampleBody />
            </AnimatedDetails>

            {/* Parameters Input Card */}
            <div className="tour-step-inputs rounded-lg p-5 md:p-6 border shadow-md transition-colors bg-[var(--color-surface)] border-[var(--color-border)]">
                <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-4 mb-5">
                    <div className="bg-[var(--color-accent-cobalt-bg)]/20 p-2 rounded-lg text-[var(--color-accent-cobalt)]"><Sliders size={20} /></div>
                    <Heading level="section" data-toc id="hypothesis-parameters" className="text-lg sm:text-xl font-semibold text-[var(--color-text-primary)]">
                        פרמטרים והשערות מחקר
                    </Heading>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="w-full">
                        {/* Custom Parameters Table Layout */}
                        <ParameterGrid columns={3}>
                          <ParameterGridHeader watermark={<InlineMath math="H_0" />} watermarkColorClass="text-[var(--color-accent-cobalt)]">
                            השערת האפס
                          </ParameterGridHeader>
                          <ParameterGridHeader watermark={<InlineMath math={statSymbol} />} watermarkColorClass="text-[var(--color-primary)]">
                            מדגם
                          </ParameterGridHeader>
                          <ParameterGridHeader watermark={<InlineMath math="H_1" />} watermarkColorClass="text-[var(--chart-2)]">
                            השערת המחקר
                          </ParameterGridHeader>
                          <ParameterInputCell
                            watermark={'\\mu_0'}
                            colorClass="text-[var(--color-accent-cobalt)]"
                            label={<><span>תוחלת (</span><InlineMath math={'\\mu_0'} /><span>):</span></>}
                            tooltip={<span>תוחלת אוכלוסיית הבסיס (השערת האפס <InlineMath math="H_0" />)</span>}
                            value={mu0Input}
                            onChange={handleMu0Change}
                            error={errors.mu0}
                          />
                          <ParameterInputCell
                            watermark={statSymbol}
                            colorClass="text-[var(--color-primary)]"
                            label={<><span>{sampleStatisticLabel} (</span><InlineMath math={statSymbol} /><span>):</span></>}
                            tooltip={sampleStatisticTooltip}
                            value={xBarInput}
                            onChange={handleXBarChange}
                            error={errors.xBar}
                          />
                          <ParameterInputCell
                            watermark={'\\mu_1'}
                            colorClass="text-[var(--chart-2)]"
                            label={<><span>ממוצע (</span><InlineMath math={'\\mu_1'} /><span>):</span></>}
                            tooltip={<span>התוחלת המשוערת תחת השערת המחקר האלטרנטיבית (<InlineMath math="H_1" />)</span>}
                            value={mu1Input}
                            onChange={handleMu1Change}
                            error={powerInputError}
                          />
                          <ParameterInputCell
                            watermark={'\\sigma'}
                            colorClass="text-[var(--color-accent-cobalt)]"
                            label={<><span>סטיית תקן (</span><InlineMath math={'\\sigma'} /><span>):</span></>}
                            tooltip="סטיית התקן של אוכלוסיית הבסיס (אם ידועה)"
                            value={sigmaInput}
                            onChange={handleSigmaChange}
                            error={errors.sigma}
                          />
                          <ParameterInputCell
                            watermark="n"
                            colorClass="text-[var(--color-primary)]"
                            label={<><span>גודל מדגם (</span><InlineMath math="n" /><span>):</span></>}
                            tooltip={<span>מספר התצפיות במדגם (<InlineMath math="n" />)</span>}
                            value={nInput}
                            onChange={handleNChange}
                            error={errors.n}
                          />
                          <ParameterGridCell className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={openPowerSectionFromQuickNav}
                              disabled={!isValid || !stats}
                              className={`tour-power-quick-link relative z-10 inline-flex w-fit mx-auto items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-sm font-semibold transition-all ${
                                isValid && stats
                                  ? 'cursor-pointer border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] hover:border-[var(--color-accent-cobalt-line)] hover:text-[var(--color-accent-cobalt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chart-2)]/35'
                                  : 'cursor-default border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] opacity-70'
                              }`}
                              aria-label="קפיצה לעוצמת מבחן ופתיחת האקורדיון"
                            >
                              <span className="whitespace-nowrap">
                                עוצמת מבחן <span dir="ltr" className="inline-flex align-middle"><InlineMath math="(1-\beta)" /></span>
                              </span>
                              <ExternalLink size={14} className="shrink-0" />
                            </button>
                          </ParameterGridCell>
                        </ParameterGrid>


                    </div>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

                {/* RIGHT Column - Dashboard & Visual Analytics */}
                <div className="contents">

                    {/* Overlapping Curves Chart */}
                    <div className="tour-step-graph w-full min-w-0 order-1 lg:order-1 relative">
                        {/* H₁ Toggle — top-left corner, independent of legend */}
                        {powerEnabled && (
                            <label
                                className={`tour-step-graph-toggle absolute top-3 left-3 z-20 flex h-10 items-center gap-2.5 pl-3 pr-3.5 rounded-xl border text-sm font-semibold transition-all duration-300 cursor-pointer select-none backdrop-blur-lg ${
                                    showPowerOverlay
                                        ? 'bg-[var(--chart-2)]/12 border-[var(--chart-2)]/50 text-[var(--chart-2)] shadow-[0_0_12px_var(--chart-2)/20]'
                                        : 'bg-[var(--color-surface)]/90 border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-secondary)]/50 shadow-md'
                                }`}
                            >
                                {/* Toggle track */}
                                <span
                                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ease-in-out ${
                                        showPowerOverlay
                                            ? 'bg-[var(--chart-2)]'
                                            : 'bg-[var(--color-border)]'
                                    }`}
                                >
                                    {/* Toggle thumb */}
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--color-surface)] shadow-lg ring-0 transition-transform duration-300 ease-in-out mt-0.5 ${
                                            showPowerOverlay ? '-translate-x-[1.375rem]' : 'translate-x-0.5'
                                        }`}
                                    />
                                </span>
                                {/* Label area: colored swatch + H₁ math */}
                                <span className="flex items-center gap-1.5" dir="ltr">
                                    <span
                                        className="inline-block h-3 w-3 rounded-sm border transition-colors duration-300"
                                        style={{
                                            backgroundColor: showPowerOverlay ? 'color-mix(in srgb, var(--chart-2) 25%, transparent)' : 'transparent',
                                            borderColor: showPowerOverlay ? 'var(--chart-2)' : 'var(--color-border)',
                                        }}
                                    />
                                    <InlineMath math="H_1" />
                                </span>
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={showPowerOverlay}
                                    onChange={() => setShowPowerOverlay(!showPowerOverlay)}
                                    aria-label={showPowerOverlay ? 'הסתרת H1 והשטח של עוצמת המבחן בגרף' : 'הצגת H1 והשטח של עוצמת המבחן בגרף'}
                                />
                            </label>
                        )}
                        <ChartWrapper legend={<div className="flex w-full justify-start" dir="ltr"><ChartLegend items={hypothesisLegendItems} /></div>} className="flex min-h-[455px] flex-1 flex-col" height={355}>
                            <HypothesisChart
                                chartData={chartData}
                                stats={stats as any}
                                isValid={isValid}
                                chartLimits={chartLimits as any}
                                tailType={tailType}
                                powerEnabled={powerEnabled}
                                showPowerOverlay={showPowerOverlay}
                                xAxisTicks={xAxisTicks}
                                sampleMean={decisionData?.xBar ?? null}
                            />
                        </ChartWrapper>
                    </div>

                    {/* Solutions Steps Accordion / Panel */}


                    {/* Hypothesis Testing Steps */}
                    <HypothesisTestingSteps
                        isValid={isValid}
                        stats={stats}
                        decisionData={decisionData}
                        errors={errors}
                        varianceKnown={varianceKnown}
                        setVarianceKnown={setVarianceKnown}
                        n={n}
                        nInput={nInput}
                        tailType={tailType}
                        setTailType={setTailType}
                        alpha={alpha}
                        alphaInput={alphaInput}
                        handleAlphaChange={handleAlphaChange}
                        setAlpha={setAlpha}
                        sigmaInput={sigmaInput}
                        handleSigmaChange={handleSigmaChange}
                        mu0Input={mu0Input}
                        mu0={mu0}
                        xBar={xBar}
                        showHypothesisTesting={showHypothesisTesting}
                        setShowHypothesisTesting={setShowHypothesisTesting}
                        setShowCI={setShowCI}
                        setShowPower={setShowPower}
                        unifiedDecisionResult={unifiedDecisionResult}
                    />

                    {/* Confidence Interval Section */}
                    <ConfidenceIntervalSection
                        isValid={isValid}
                        stats={stats}
                        decisionData={decisionData}
                        showCI={showCI}
                        setShowCI={setShowCI}
                        ciTailType={ciTailType}
                        setCiTailType={setCiTailType}
                        ciAlpha={ciAlpha}
                        setCiAlpha={setCiAlpha}
                        ciChartData={ciChartData}
                        ciChartTicks={ciChartTicks}
                        CustomCIChartTooltip={CustomCIChartTooltip}
                        xBar={xBar}
                        mu0={mu0}
                        sigma={sigma}
                        sigmaInput={sigmaInput}
                        n={n}
                        nInput={nInput}
                        alphaInput={alphaInput}
                        tailType={tailType}
                        openHypothesisStep2FromLink={openHypothesisStep2FromLink}
                    />

                    {/* Power Analysis Section */}
                    <PowerAnalysisSection
                        isValid={isValid}
                        stats={stats}
                        showPower={showPower}
                        setShowPower={setShowPower}
                        powerEnabled={powerEnabled}
                        powerStats={powerStats}
                        mu0={mu0}
                        mu1={mu1}
                        sigma={sigma}
                        n={n}
                    />

                    {/* LEFT Column - Info & Explanations Panel */}
                    <div className="contents">

                        {/* Decision Matrix Hero (Moved to side panel) */}
                        <div className="tour-step-decision text-right w-full min-w-0 order-2 lg:order-2">
                            <DecisionMatrix isValid={isValid} stats={decisionMatrixStats} alpha={alpha} calculatePower={powerEnabled} />
                        </div>

                    </div>

                </div>



            </div>
        </div>
    );
}
