import { useLocalStorageState } from '../hooks/useLocalStorageState';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
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
        if (!isNaN(parsed)) setMu0(parsed);
    };

    const handleXBarChange = (val: string) => {
        setXBarInput(val);
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) setXBar(parsed);
    };

    const handleMu1Change = (val: string) => {
        setMu1Input(val);
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) setMu1(parsed);
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

    // --- Core Calculations Engine ---
    const stats = useMemo(() => {
        if (!isValid) return null;

        // Mean-only hypothesis testing: standard error is based on the sampling distribution of X-bar.
        const se = sigma / Math.sqrt(n);
        const effectH0Mean = mu0;
        const effectH1Mean = parsedMu1Input ?? mu0;
        const df = Math.max(1, n - 1);

        // Non-Centrality Parameter calculation
        const ncp = (effectH1Mean - effectH0Mean) / se;

        // 2. Critical Score Sourcing & Distribution Mapping
        let zCrit: number = 0;
        let zCritLower: number = 0; // for two-tailed

        const usesNormalApprox = varianceKnown || n >= 30;

        if (usesNormalApprox) {
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

        if (usesNormalApprox) {
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
            varianceKnown,
            usesNormalApprox
        };
    }, [mu0, parsedMu1Input, sigma, n, alpha, tailType, isValid, varianceKnown]);

    // --- Dynamic Decision Data Logic ---
    const decisionData = useMemo(() => {
        if (!stats || !isValid) return null;

        const xBarValue = xBar;

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

        if (stats.usesNormalApprox) {
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
    }, [stats, isValid, mu0, xBar, alpha, tailType]);

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
            alternativeMean: stats.effectH1Mean,
        });
    }, [stats, decisionData, isValid, n, alpha, tailType]);

    // --- Chart Limits for X-axis & Gradient Calculations ---
    const showH1OnChart = powerEnabled && showPowerOverlay;
    const chartLimits = useMemo(() => {
        if (!stats || !decisionData || !isValid) return { xMin: 0, xMax: 100 };
        const { effectH0Mean, effectH1Mean, se, c1, c2 } = stats;
        const xBar = decisionData.xBar;
        const criticalValues = tailType === 'two-tailed' ? [c1, c2] : [c2];
        const criticalPadding = 0.5 * se;
        const leftExtent = showH1OnChart ? effectH1Mean - 4 * se : effectH0Mean - 4 * se;
        const rightExtent = showH1OnChart ? effectH1Mean + 4 * se : effectH0Mean + 4 * se;

        return {
            xMin: Math.min(
                effectH0Mean - 4 * se,
                leftExtent,
                xBar - 0.5 * se,
                ...criticalValues.map((value) => value - criticalPadding)
            ),
            xMax: Math.max(
                effectH0Mean + 4 * se,
                rightExtent,
                xBar + 0.5 * se,
                ...criticalValues.map((value) => value + criticalPadding)
            ),
        };
    }, [stats, decisionData, isValid, tailType, showH1OnChart]);

    // --- Custom Ticks for X-Axis representing means and standard deviations ---
    const xAxisTicks = useMemo((): HypothesisAxisTick[] => {
        if (!stats || !decisionData || !isValid) return [];
        const { effectH0Mean, se, c1, c2 } = stats;
        const sampleMean = decisionData.xBar;
        const minDynamicSpacing = se * 0.45;

        const dynamicTicks: HypothesisAxisTick[] = [
            { value: Number(c2.toFixed(6)), role: 'critical' },
            { value: Number(sampleMean.toFixed(6)), role: 'sample' },
        ];

        if (tailType === 'two-tailed') {
            dynamicTicks.push({ value: Number(c1.toFixed(6)), role: 'critical' });
        }

        const standardTicks: HypothesisAxisTick[] = Array.from({ length: 9 }, (_, index) => {
            const k = index - 4;
            return { value: Number((effectH0Mean + k * se).toFixed(6)), role: 'standard' };
        });

        const visibleStandardTicks = standardTicks.filter((tick) =>
            dynamicTicks.every((dynamicTick) => Math.abs(tick.value - dynamicTick.value) >= minDynamicSpacing)
        );

        const ticksByValue = new globalThis.Map<number, HypothesisAxisTick>();

        [...visibleStandardTicks, ...dynamicTicks].forEach((tick) => {
            const key = Number(tick.value.toFixed(6));
            const currentTick = ticksByValue.get(key);

            if (!currentTick || currentTick.role === 'standard') {
                ticksByValue.set(key, { ...tick, value: key });
            }
        });

        return Array.from(ticksByValue.values()).sort((a, b) => a.value - b.value);
    }, [stats, decisionData, isValid, tailType]);

    // --- Dynamic Graph Data Generation ---
    const chartData = useMemo((): HypothesisChartDataPoint[] => {
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
            const pdfH1 = showH1OnChart ? (varianceKnown
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
            const powerShade = showH1OnChart && isRejected ? pdfH1 : 0;

            pts.push({
                x: Number(x.toFixed(4)),
                pdfH0,
                pdfH1,
                alphaShade,
                powerShade,
            });
        }

        return pts;
    }, [stats, isValid, tailType, showH1OnChart, chartLimits]);

    const powerStats = useMemo(() => {
        if (!powerEnabled || !isValid || parsedMu1Input === null) {
            return null;
        }

        return computePowerAnalysis({
            mu0,
            mu1: parsedMu1Input,
            sigma,
            n,
            alpha,
        });
    }, [powerEnabled, isValid, mu0, parsedMu1Input, sigma, n, alpha]);


    const ciChartData = useMemo(() => {
        if (!stats || !isValid) return [];

        const pts = [];
        const numPoints = 200;
        const { se, df, usesNormalApprox } = stats;

        const alphaNum = parseFloat(alphaInput) || 0.05;

        // Limits for the CI chart: +/- 4 SE from both mu0 and xBar to ensure both distributions are visible
        const minMean = Math.min(mu0, xBar);
        const maxMean = Math.max(mu0, xBar);
        const xMin = minMean - 4 * se;
        const xMax = maxMean + 4 * se;
        const step = (xMax - xMin) / (numPoints - 1);

        const ciCrit2Side = usesNormalApprox ? inverseNormalCDF(1 - alphaNum / 2) : studentTPPF(1 - alphaNum / 2, df);
        const ciCrit1Side = usesNormalApprox ? inverseNormalCDF(1 - alphaNum) : studentTPPF(1 - alphaNum, df);
        const MoE2Side = ciCrit2Side * se;
        const MoE1Side = ciCrit1Side * se;

        const lower2Side = xBar - MoE2Side;
        const upper2Side = xBar + MoE2Side;
        const lower1Side = xBar - MoE1Side;
        const upper1Side = xBar + MoE1Side;

        for (let i = 0; i < numPoints; i++) {
            const x = xMin + i * step;
            const pdfPop = usesNormalApprox
                ? normalPDF(x, mu0, se)
                : studentTPDF((x - mu0) / se, df) / se;
            const pdfSample = usesNormalApprox
                ? normalPDF(x, xBar, se)
                : studentTPDF((x - xBar) / se, df) / se;

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
    }, [stats, isValid, mu0, xBar, tailType, alphaInput]);

    // Custom tooltips for graphs


    const ciChartTicks = useMemo(() => {
        if (!stats || !isValid) return [];
        const { se, df, usesNormalApprox } = stats;
        const alphaNum = parseFloat(alphaInput) || 0.05;
        const ciCrit2Side = usesNormalApprox ? inverseNormalCDF(1 - alphaNum / 2) : studentTPPF(1 - alphaNum / 2, df);
        const ciCrit1Side = usesNormalApprox ? inverseNormalCDF(1 - alphaNum) : studentTPPF(1 - alphaNum, df);
        const MoE2Side = ciCrit2Side * se;
        const MoE1Side = ciCrit1Side * se;

        const lower2Side = xBar - MoE2Side;
        const upper2Side = xBar + MoE2Side;
        const lower1Side = xBar - MoE1Side;
        const upper1Side = xBar + MoE1Side;

        const ticksSet = new Set<string>();
        const addVal = (val) => { ticksSet.add(val.toFixed(2)); };

        addVal(mu0);
        addVal(xBar);
        addVal(xBar - se);
        addVal(xBar + se);
        addVal(xBar - 2 * se);
        addVal(xBar + 2 * se);
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
                        return sv === mu0.toFixed(2) || sv === xBar.toFixed(2) ||
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
    }, [stats, isValid, mu0, xBar, tailType, alphaInput]);

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

                    <div id="hypothesis-panel" className="tour-step-accordion-ht rounded-lg border shadow-md transition-all overflow-hidden bg-[var(--color-surface)] border-[var(--color-border)] w-full min-w-0 lg:col-span-2 order-3 lg:order-3">
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
                            className="relative overflow-hidden w-full px-8 py-5.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors border-b border-[var(--color-border)] cursor-pointer"
                        >
                            <div className="flex justify-end gap-3 lg:col-span-2 order-2 lg:order-2 mb-2">
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setShowHypothesisTesting(true);
                                        setShowCI(true);
                                        setShowPower(true);
                                    }}
                                    className="px-4 py-2 text-sm font-bold bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-md hover:bg-[var(--color-surface)] transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
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
                                    className="px-4 py-2 text-sm font-bold bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-md hover:bg-[var(--color-surface)] transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                                >
                                    <ChevronUp size={16} />
                                    צמצם הכל
                                </button>
                                <div className="relative z-10 flex items-center self-end sm:self-auto gap-4">
                                    <div className="text-[var(--color-text-secondary)]">
                                        <ChevronDown size={24} className={`transition-transform duration-200 ${showHypothesisTesting ? 'rotate-180' : ''}`} />
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
                                <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -rotate-6 opacity-10 text-4xl sm:text-5xl font-mono text-[var(--chart-2)]">
                                    <InlineMath math={String.raw`\bar{X}`} />
                                </div>
                                <div className="absolute right-1/4 top-1/2 -translate-y-1/2 rotate-12 opacity-10 text-5xl sm:text-6xl font-mono text-[var(--color-accent-violet)]">
                                    <InlineMath math="P" />
                                </div>
                            </div>

                            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 text-right">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[var(--color-accent-cobalt-bg)]/20 p-2 rounded-lg text-[var(--color-accent-cobalt)]"><Calculator size={24} /></div>
                                    <div className="flex flex-col items-start gap-1">
                                        <Heading level="section" withAccentBar data-toc data-toc-target="hypothesis-panel" data-toc-open="hypothesis-panel" className="text-xl sm:text-2xl">
                                            בדיקת השערות
                                        </Heading>
                                        <span aria-hidden="true" className="text-base sm:text-lg font-serif text-[var(--color-text-secondary)] opacity-80" dir="ltr">
                                            <InlineMath math={String.raw`\text{Hypothesis Testing}`} />
                                        </span>
                                    </div>
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
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm sm:text-base font-semibold bg-[var(--color-surface)] hover:bg-[var(--color-accent-cobalt-bg)] text-[var(--color-text-primary)] hover:text-[var(--color-accent-cobalt)] border border-[var(--color-border)] shadow-md transition-all duration-300 leading-none group cursor-pointer"
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
                                        <AnimatedDetails id="hypothesis-step-1" tocId="hypothesis-step-1" className="group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm [&_summary::-webkit-details-marker]:hidden">

                                            <summary className="p-4 sm:p-5 flex items-center justify-between cursor-pointer list-none hover:bg-[var(--color-surface)]/50 transition-colors rounded-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                                                <div className="flex items-center gap-3 font-extrabold text-[var(--color-primary)]">
                                                    <span className="w-9 h-9 rounded-full bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-base font-semibold flex items-center justify-center border border-[var(--color-primary)]/50 shrink-0">1</span>
                                                    <Heading level="subsection" data-toc data-toc-target="hypothesis-step-1" data-toc-open="hypothesis-panel,hypothesis-step-1" className="text-xl sm:text-2xl font-semibold text-[var(--color-text-primary)]">ניסוח השערות המחקר</Heading>
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
                                                            const parameterSymbol = '\\mu';
                                                            const h0Val = mu0Input;
                                                            const nullValueSymbol = '\\mu_0';
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
                                                    <HandwrittenNote className="mt-4">
                                                        {tailType === 'right' ? (
                                                            <span>מכיוון שהשערת המחקר <InlineMath math="H_1" /> מציינת הבדל <span className="font-bold underline">בכיוון אחד בלבד</span> (גדול מערך השערת האפס), אנו אומרים שזהו <span className="font-bold">מבחן חד-צדדי (ימני)</span>.</span>
                                                        ) : tailType === 'left' ? (
                                                            <span>מכיוון שהשערת המחקר <InlineMath math="H_1" /> מציינת הבדל <span className="font-bold underline">בכיוון אחד בלבד</span> (קטן מערך השערת האפס), אנו אומרים שזהו <span className="font-bold">מבחן חד-צדדי (שמאלי)</span>.</span>
                                                        ) : (
                                                            <span>מכיוון שהשערת המחקר <InlineMath math="H_1" /> מציינת הבדל <span className="font-bold underline">בשני הכיוונים</span> (שונה מערך השערת האפס), אנו אומרים שזהו <span className="font-bold">מבחן דו-צדדי</span>.</span>
                                                        )}
                                                    </HandwrittenNote>
                                                </div>
                                            </div></AnimatedDetails>


                                        {/* Step 2: Select an appropriate test */}
                                        <AnimatedDetails id="step-2" tocId="step-2" className="tour-step-test-type group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm [&_summary::-webkit-details-marker]:hidden">

                                            <summary className="p-4 sm:p-5 flex items-center justify-between cursor-pointer list-none hover:bg-[var(--color-surface)]/50 transition-colors rounded-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                                                <div className="flex items-center gap-3 font-extrabold text-[var(--color-primary)]">
                                                    <span className="w-9 h-9 rounded-full bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-base font-semibold flex items-center justify-center border border-[var(--color-primary)]/50 shrink-0">2</span>
                                                    <Heading level="subsection" data-toc data-toc-target="step-2" data-toc-open="hypothesis-panel,step-2" className="text-xl sm:text-2xl font-semibold text-[var(--color-text-primary)]">בחירת מבחן סטטיסטי מתאים</Heading>
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
                                                            האם סטיית התקן של האוכלוסייה (<InlineMath math="\sigma" />) ידועה?
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
                                                                    className={`text-sm font-semibold mb-1 px-6 py-2 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 border-2 shadow-md ${varianceKnown ? 'bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/50' : 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-success)]/50 hover:bg-[var(--color-surface)] hover:text-[var(--color-success)]'}`}>
                                                                    כן
                                                                </button>
                                                                <div className="w-[2px] h-[15px] bg-[var(--color-border)]"></div>
                                                                <div className={`w-full text-center px-2 py-2.5 rounded-sm border-2 font-bold z-10 transition-all ${varianceKnown ? 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-success)] shadow-[0_0_15px_color-mix(in_srgb,var(--color-success)_30%,transparent)] ring-1 ring-[var(--color-success)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
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
                                                                    className={`text-sm font-semibold mb-1 px-6 py-2 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 border-2 shadow-md ${!varianceKnown ? 'bg-[var(--color-error)]/15 text-[var(--color-error)] border-[var(--color-error)]/50' : 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-error)]/50 hover:bg-[var(--color-surface)] hover:text-[var(--color-error)]'}`}>
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
                                                                        <div className={`w-full text-center px-1 py-1.5 rounded-sm border-2 font-bold z-10 transition-all ${!varianceKnown && n >= 30 ? 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-success)] shadow-[0_0_15px_color-mix(in_srgb,var(--color-success)_30%,transparent)] ring-1 ring-[var(--color-success)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
                                                                            מבחן <InlineMath math="Z" />
                                                                        </div>
                                                                    </div>

                                                                    {/* NO for Q2 (Left in RTL) */}
                                                                    <div className="flex flex-col items-center relative z-10 w-[70px]">
                                                                        <div className="w-[2px] h-[15px] bg-[var(--color-border)]"></div>
                                                                        <span className={`text-xs font-bold mb-1 px-1 rounded-lg transition-all ${!varianceKnown && n < 30 ? 'bg-[var(--color-error)]/15 text-[var(--color-error)]' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`}>לא</span>
                                                                        <div className="w-[2px] h-[10px] bg-[var(--color-border)]"></div>
                                                                        <div className={`w-full text-center px-1 py-1.5 rounded-sm border-2 font-bold z-10 transition-all ${!varianceKnown && n < 30 ? 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-error)] shadow-[0_0_15px_color-mix(in_srgb,var(--color-error)_30%,transparent)] ring-1 ring-[var(--color-error)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
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
                                                <HandwrittenNote className="mt-6">
                                                    {varianceKnown ? (
                                                        <span>מכיוון שסטיית התקן (<InlineMath math="\sigma" />) <span className="font-bold underline">ידועה</span>, המבחן הסטטיסטי המתאים הוא <span className="font-bold">מבחן <InlineMath math="Z" /></span>.</span>
                                                    ) : !varianceKnown && n >= 30 ? (
                                                        <span>מכיוון ששונות האוכלוסייה <span className="font-bold underline">אינה ידועה</span> אך גודל המדגם הוא <InlineMath math="n \ge 30" />, משתמשים בסטיית התקן המדגמית <InlineMath math="S" /> ובקירוב נורמלי מסוג <span className="font-bold">מבחן <InlineMath math="Z" /></span>.</span>
                                                    ) : (
                                                        <span>מכיוון ששונות האוכלוסייה <span className="font-bold underline">אינה ידועה</span> וגודל המדגם קטן מ-30 (<InlineMath math="n < 30" />), נשתמש בסטיית התקן המדגמית <InlineMath math="S" /> וב<span className="font-bold">מבחן <InlineMath math="t" /></span>.</span>
                                                    )}
                                                </HandwrittenNote>
                                            </div></AnimatedDetails>

                                        {/* Step 3: Specify the level of significance */}
                                        <AnimatedDetails id="hypothesis-step-3" tocId="hypothesis-step-3" className="group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm [&_summary::-webkit-details-marker]:hidden">

                                            <summary className="p-4 sm:p-5 flex items-center justify-between cursor-pointer list-none hover:bg-[var(--color-surface)]/50 transition-colors rounded-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                                                <div className="flex items-center gap-3 font-extrabold text-[var(--color-primary)]">
                                                    <span className="w-9 h-9 rounded-full bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-base font-semibold flex items-center justify-center border border-[var(--color-primary)]/50 shrink-0">3</span>
                                                    <Heading level="subsection" data-toc data-toc-target="hypothesis-step-3" data-toc-open="hypothesis-panel,hypothesis-step-3" className="text-xl sm:text-2xl font-semibold text-[var(--color-text-primary)]">קביעת רמת המובהקות (<InlineMath math="\alpha" />)</Heading>
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
                                                    <span className="text-xs sm:text-sm font-semibold text-[var(--color-text-secondary)]">
                                                        בחר רמת מובהקות (<InlineMath math="\alpha" />):
                                                    </span>

                                                    <div className="flex gap-1.5 bg-[var(--color-surface-raised)] p-1.5 rounded-lg border border-[var(--color-border)]">
                                                        {[0.10, 0.05, 0.01].map((pVal) => (
                                                            <button
                                                                key={pVal}
                                                                type="button"
                                                                onClick={() => applyAlphaPreset(pVal)}
                                                                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${alpha === pVal
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
                                                <HandwrittenNote className="mt-6">
                                                    קבענו שרמת המובהקות של המבחן תהיה <InlineMath math={`\\alpha = ${alpha}`} />, הנגזרת מרמת ביטחון של <InlineMath math={`${((1 - alpha) * 100).toFixed(0)}\\%`} />.
                                                </HandwrittenNote>
                                            </div></AnimatedDetails>


                                        {isValid && stats && decisionData ? (
                                            <>
                                                {/* Step 4: Critical Value derivation & SE */}
                                                <AnimatedDetails id="hypothesis-step-4" tocId="hypothesis-step-4" className="group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm [&_summary::-webkit-details-marker]:hidden">

                                                    <summary className="p-4 sm:p-5 flex items-center justify-between cursor-pointer list-none hover:bg-[var(--color-surface)]/50 transition-colors rounded-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                                                        <div className="flex items-center gap-3 font-extrabold text-[var(--color-primary)]">
                                                            <span className="w-9 h-9 rounded-full bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-base font-semibold flex items-center justify-center border border-[var(--color-primary)]/50 shrink-0">4</span>
                                                            <Heading level="subsection" data-toc data-toc-target="hypothesis-step-4" data-toc-open="hypothesis-panel,hypothesis-step-4" className="text-xl sm:text-2xl font-semibold text-[var(--color-text-primary)]">קביעת הערכים הקריטיים והגדרת כלל ההחלטה</Heading>
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
                                                                    <div className="absolute top-4 right-6 bg-[var(--color-surface)] py-1.5 px-3 rounded-lg border border-[var(--color-border)]/50 z-10" dir="rtl">
                                                                        <ChartLegend
                                                                            items={[{ math: String.raw`\alpha`, color: 'var(--color-accent-crimson)', style: 'area' }]}
                                                                            className="gap-1.5"
                                                                        />
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
                                                                                        <stop offset="5%" stopColor="var(--color-accent-cobalt)" stopOpacity={0.3} />
                                                                                        <stop offset="95%" stopColor="var(--color-accent-cobalt)" stopOpacity={0} />
                                                                                    </linearGradient>
                                                                                </defs>
                                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" opacity={0.5} />
                                                                                <XAxis dataKey="x" type="number" domain={[-3.5, 3.5]} tickFormatter={(val) => val.toFixed(2)} stroke="var(--chart-grid)" tick={{ fill: 'var(--chart-axis-label)', fontSize: 12, fontWeight: 'bold' }} />
                                                                                <YAxis
                                                                                    tickFormatter={(val) => val.toFixed(2)}
                                                                                    tick={{ fill: 'var(--chart-axis-label)', fontSize: 12, fontWeight: 'bold' }}
                                                                                    axisLine={{ stroke: 'var(--chart-grid)' }}
                                                                                    tickLine={true}
                                                                                    width={45}
                                                                                />
                                                                                <Area type="monotone" dataKey="y" stroke="var(--color-accent-cobalt)" strokeWidth={2.5} fill="url(#miniH0Color)" isAnimationActive={false} />
                                                                                <Area type="monotone" dataKey="alphaShade" stroke="none" fill="var(--color-accent-crimson)" fillOpacity={0.5} isAnimationActive={false} />

                                                                                {tailType === 'two-tailed' ? (
                                                                                    <>
                                                                                        <ReferenceLine x={-Math.abs(stats.zCrit)} stroke="var(--color-accent-crimson)" strokeWidth={2} strokeDasharray="4 4" label={{ value: `-${Math.abs(stats.zCrit).toFixed(2)}`, position: 'insideTopLeft', fill: 'var(--color-accent-crimson)', fontSize: 13, fontWeight: 'bold', offset: 10 }} />
                                                                                        <ReferenceLine x={Math.abs(stats.zCrit)} stroke="var(--color-accent-crimson)" strokeWidth={2} strokeDasharray="4 4" label={{ value: `+${Math.abs(stats.zCrit).toFixed(2)}`, position: 'insideTopRight', fill: 'var(--color-accent-crimson)', fontSize: 13, fontWeight: 'bold', offset: 10 }} />
                                                                                    </>
                                                                                ) : tailType === 'right' ? (
                                                                                    <ReferenceLine x={Math.abs(stats.zCrit)} stroke="var(--color-accent-crimson)" strokeWidth={2} strokeDasharray="4 4" label={{ value: `+${Math.abs(stats.zCrit).toFixed(2)}`, position: 'insideTopRight', fill: 'var(--color-accent-crimson)', fontSize: 13, fontWeight: 'bold', offset: 10 }} />
                                                                                ) : (
                                                                                    <ReferenceLine x={-Math.abs(stats.zCrit)} stroke="var(--color-accent-crimson)" strokeWidth={2} strokeDasharray="4 4" label={{ value: `-${Math.abs(stats.zCrit).toFixed(2)}`, position: 'insideTopLeft', fill: 'var(--color-accent-crimson)', fontSize: 13, fontWeight: 'bold', offset: 10 }} />
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
                                                                                        השטח <strong>מימין לערך</strong> על גבי גרף ההתפלגות: <span dir="ltr" className="font-mono text-xs text-[var(--color-primary)] px-1 py-0.5 rounded"><InlineMath math={`P(${varianceKnown ? 'Z' : 'T'} > ${varianceKnown ? 'z' : 't'}) = \\alpha`} /></span>.
                                                                                        לכן, עבור <InlineMath math="\alpha = 0.05" />, הסימון יהיה <InlineMath math={`${varianceKnown ? 'Z' : 't'}_{0.05}`} />.
                                                                                    </li>
                                                                                    <li>
                                                                                        פונקציית התפלגות מצטברת <strong>רגילה</strong> <span dir="ltr" className="font-mono text-xs text-[var(--color-primary)] px-1 py-0.5 rounded"><InlineMath math={`P(${varianceKnown ? 'Z' : 'T'} < ${varianceKnown ? 'z' : 't'}) = ${varianceKnown ? '\\Phi' : 'F_t'}(${varianceKnown ? 'z' : 't'})`} /></span> מקבלת ערכי <InlineMath math={`${varianceKnown ? 'Z' : 'T'}`} /> ומחזירה הסתברות מצטברת משמאל לערך (<InlineMath math={`${varianceKnown ? 'Z' : 'T'} \\rightarrow \\text{Probability}`} />).
                                                                                        כדי למצוא ערך <InlineMath math={`${varianceKnown ? 'Z' : 'T'}`} /> לפי הסתברות נשתמש בפונקציה <strong>ההופכית</strong> <span dir="ltr" className="font-mono text-xs text-[var(--color-primary)] px-1 py-0.5 rounded"><InlineMath math={`${varianceKnown ? 'z' : 't'} = ${varianceKnown ? '\\Phi^{-1}' : 'F_t^{-1}'}(P(${varianceKnown ? 'Z' : 'T'} < ${varianceKnown ? 'z' : 't'}))`} /></span> המקבלת הסתברויות ומחזירה ערך <InlineMath math={`${varianceKnown ? 'Z' : 'T'}`} /> (<InlineMath math={`\\text{Probability} \\rightarrow ${varianceKnown ? 'Z' : 'T'}`} />).
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
                                                                        <HandwrittenNote className="mt-10 mb-2">
                                                                            ערך ה-{varianceKnown ? 'Z' : 't'} הקריטי יהווה את הרף שעל פיו נגדיר את אזור הדחייה של המבחן: <InlineMath math={`${varianceKnown ? 'Z' : 't'}_{\\text{crit}} = ${tailType === 'two-tailed' ? '\\pm ' : tailType === 'left' ? '-' : ''}${displayCrit}`} />.
                                                                        </HandwrittenNote>
                                                                    </>
                                                                );
                                                            })()}

                                                            {/* Subheading for Decision Rules */}
                                                            <div className="mt-12 mb-6 pt-8 border-t border-[var(--color-border)]/60">
                                                                <h4 className="text-2xl font-semibold text-[var(--color-accent-cobalt)] flex items-center gap-3">
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
                                                                <AnimatedDetails id="hypothesis-step-4-test-statistic" tocId="hypothesis-step-4-test-statistic" className="group rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
                                                                    <summary className="flex items-center gap-3 p-4 sm:p-5 cursor-pointer text-[var(--color-accent-cobalt)] font-bold outline-none select-none hover:bg-[var(--color-surface-raised)] rounded-t-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                                                                        <div className="flex-1 flex items-center gap-3">
                                                                            <Target size={20} />
                                                                            <h4 data-toc data-toc-target="hypothesis-step-4-test-statistic" data-toc-open="hypothesis-panel,hypothesis-step-4,hypothesis-step-4-test-statistic" className="text-lg sm:text-xl">כלל סטטיסטי המבחן</h4>
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
                                                                        <HandwrittenNote className="mt-6 mb-2">
                                                                            בכלל סטטיסטי המבחן נדחה את <strong>השערת האפס</strong> (<InlineMath math="H_0" />) אם סטטיסטי המבחן המחושב נופל באזור הדחייה, מעבר לערך הסף הקריטי.
                                                                        </HandwrittenNote>
                                                                    </div>
                                                                </AnimatedDetails>

                                                                {/* Approach 2 */}
                                                                {(() => {
                                                                    if (!stats) return null;
                                                                    const paramSymbol = '\\bar{X}';
                                                                    const muSymbol = '\\mu_0';
                                                                    return (
                                                                        <AnimatedDetails id="hypothesis-step-4-rejection-region" tocId="hypothesis-step-4-rejection-region" className="group rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm transition-all duration-300 [&_summary::-webkit-details-marker]:hidden" defaultOpen={false}>
                                                                            <summary className="flex items-center gap-3 p-4 sm:p-5 cursor-pointer text-[var(--color-accent-cobalt)] font-bold outline-none select-none hover:bg-[var(--color-surface-raised)] rounded-t-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                                                                                <div className="flex-1 flex items-center gap-3">
                                                                                    <Map size={20} />
                                                                                    <h4 data-toc data-toc-target="hypothesis-step-4-rejection-region" data-toc-open="hypothesis-panel,hypothesis-step-4,hypothesis-step-4-rejection-region" className="text-lg sm:text-xl">כלל אזור הדחייה</h4>
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
                                                                                <HandwrittenNote className="mt-6 mb-2">
                                                                                    בכלל אזור הדחייה (הערך המקורי) נדחה את <strong>השערת האפס</strong> (<InlineMath math="H_0" />) אם הערך המקורי של המדגם שייך לקבוצת הדחייה (<InlineMath math="C" />).
                                                                                </HandwrittenNote>
                                                                            </div>
                                                                        </AnimatedDetails>
                                                                    );
                                                                })()}

                                                                {/* Approach 3 */}
                                                                <AnimatedDetails id="hypothesis-step-4-p-value" tocId="hypothesis-step-4-p-value" className="group rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm transition-all duration-300 [&_summary::-webkit-details-marker]:hidden" defaultOpen={false}>
                                                                    <summary className="flex items-center gap-3 p-4 sm:p-5 cursor-pointer text-[var(--color-accent-cobalt)] font-bold outline-none select-none hover:bg-[var(--color-surface-raised)] rounded-t-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                                                                        <div className="flex-1 flex items-center gap-3">
                                                                            <Percent size={20} />
                                                                            <h4 data-toc data-toc-target="hypothesis-step-4-p-value" data-toc-open="hypothesis-panel,hypothesis-step-4,hypothesis-step-4-p-value" className="text-lg sm:text-xl">כלל מובהקות התוצאה (P-Value)</h4>
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
                                                                        <HandwrittenNote className="mt-6 mb-2">
                                                                            בכלל מובהקות התוצאה נדחה את <strong>השערת האפס</strong> (<InlineMath math="H_0" />) אם ההסתברות לקבל תוצאת מדגם כזו או קיצונית ממנה קטנה או שווה לרמת המובהקות (<InlineMath math="\alpha" />).
                                                                        </HandwrittenNote>
                                                                    </div>
                                                                </AnimatedDetails>
                                                            </div>
                                                        </div>
                                                    </div></AnimatedDetails>


                                                {/* Step 5: P-Value Calculation */}
                                                <AnimatedDetails id="hypothesis-step-5" tocId="hypothesis-step-5" className="group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm text-right [&_summary::-webkit-details-marker]:hidden">

                                                    <summary className="p-4 sm:p-5 flex items-center justify-between cursor-pointer list-none hover:bg-[var(--color-surface)]/50 transition-colors rounded-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                                                        <div className="flex items-center gap-3 font-extrabold text-[var(--color-primary)]">
                                                            <span className="w-9 h-9 rounded-full bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-base font-semibold flex items-center justify-center border border-[var(--color-primary)]/50 shrink-0 shrink-0">5</span>
                                                            <Heading level="subsection" data-toc data-toc-target="hypothesis-step-5" data-toc-open="hypothesis-panel,hypothesis-step-5" className="text-xl sm:text-2xl font-semibold text-[var(--color-text-primary)]">חישוב סטטיסטי המבחן</Heading>
                                                        </div>
                                                        <div className="text-[var(--color-text-secondary)] group-[.is-open]:rotate-180 transition-transform duration-300">
                                                            <ChevronDown size={24} />
                                                        </div>
                                                    </summary>
                                                    <div className="p-5 sm:p-6 space-y-4">


                                                        <div className="pr-5 py-1 space-y-5">
                                                            <p className="text-base sm:text-lg text-[var(--color-text-primary)] leading-relaxed font-semibold">
                                                                נחשב את שגיאת התקן (SE) של התפלגות ממוצע המדגם ע"י{' '}
                                                                <span dir="ltr"><InlineMath math={`\\frac{${varianceKnown ? '\\sigma' : 'S'}}{\\sqrt{n}}`} /></span>
                                                                :
                                                            </p>
                                                            <div className="py-3 space-y-4 text-xl md:text-2xl">


                                                                <CalcBlock>
                                                                    <BlockMath math={`SE = \\frac{${sigmaInput}}{\\sqrt{${nInput}}} = \\frac{${sigmaInput}}{${Math.sqrt(n).toFixed(4)}} = ${stats.se.toFixed(4)}`} />
                                                                </CalcBlock>
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
                                                                    <BlockMath math={`Z_{\\text{stat}} = \\frac{${xBar} - ${mu0}}{${stats.se.toFixed(4)}} = ${decisionData.statObs.toFixed(4)}`} />
                                                                ) : (
                                                                    <BlockMath math={`t_{\\text{stat}} = \\frac{${xBar} - ${mu0}}{${stats.se.toFixed(4)}} = ${decisionData.statObs.toFixed(4)}`} />
                                                                )}
                                                            </CalcBlock>

                                                            {/* Researcher's note */}
                                                            <HandwrittenNote className="mt-6">
                                                                מצאנו כי סטטיסטי המבחן (מרחק התוצאה מתוחלת <InlineMath math="H_0" />) הוא <span dir="ltr"><InlineMath math={`${varianceKnown ? 'Z' : 't'} = ${decisionData.statObs.toFixed(4)}`} /></span>.
                                                            </HandwrittenNote>
                                                        </div>
                                                    </div></AnimatedDetails>

                                                {/* Step 6: P-Value Calculation and Final Decision */}
                                                <AnimatedDetails id="step-6" tocId="step-6" className="group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm text-right [&_summary::-webkit-details-marker]:hidden">

                                                    <summary className="p-4 sm:p-5 flex items-center justify-between cursor-pointer list-none hover:bg-[var(--color-surface)]/50 transition-colors rounded-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                                                        <div className="flex items-center gap-3 font-extrabold text-[var(--color-primary)]">
                                                            <span className="w-9 h-9 rounded-full bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-accent-cobalt-bg)] bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-base font-semibold flex items-center justify-center border border-[var(--color-primary)]/50 shrink-0 shrink-0">6</span>
                                                            <Heading level="subsection" data-toc data-toc-target="step-6" data-toc-open="hypothesis-panel,step-6" className="text-xl sm:text-2xl font-semibold text-[var(--color-text-primary)]">קבלת החלטה / הסקת מסקנות</Heading>
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
                                                                        <AnimatedDetails id="hypothesis-step-6-test-statistic" tocId="hypothesis-step-6-test-statistic" className="group border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] overflow-hidden">
                                                                            <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-5 text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors [&::-webkit-details-marker]:hidden">
                                                                                <div className="flex items-center gap-3">
                                                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-accent-cobalt-line)]/30 bg-[var(--color-accent-cobalt-bg)]/18 text-[var(--color-accent-cobalt)]">
                                                                                        <Target size={16} />
                                                                                    </span>
                                                                                    <h4 data-toc data-toc-target="hypothesis-step-6-test-statistic" data-toc-open="hypothesis-panel,step-6,hypothesis-step-6-test-statistic" className="text-lg sm:text-xl">גישת סטטיסטי המבחן <span className="text-sm font-normal text-[var(--color-text-secondary)] hidden sm:inline-block mr-1">(Standardized Scale)</span></h4>
                                                                                </div>
                                                                                <span className="transition group-[.is-open]:rotate-180">
                                                                                    <ChevronDown size={20} className="text-[var(--color-text-primary)]0" />
                                                                                </span>
                                                                            </summary>
                                                                            <div className="p-5 border-t border-[var(--color-border)]/50 text-[var(--color-text-primary)] space-y-4">
                                                                                <div className="mb-4 text-[var(--color-text-primary)] leading-relaxed text-sm sm:text-base">
                                                                                    <p className="mb-2">גישה זו מנרמלת את המדגם לציון תקן, המציין כמה סטיות תקן הוא מרוחק מתוחלת האפס.</p>
                                                                                    <strong className="text-[var(--color-text-primary)]">דרך החישוב:</strong>
                                                                                    <FormulaBlock>
                                                                                        <BlockMath math={`${statSymbol}_{stat} = \\frac{\\bar{X} - \\mu_0}{SE}`} />
                                                                                    </FormulaBlock>
                                                                                    <CalcBlock>
                                                                                        <BlockMath math={`${statSymbol}_{stat} = \\frac{${X_bar.toFixed(3)} - ${mu0}}{${stats.se.toFixed(3)}} = ${Z_stat.toFixed(3)}`} />
                                                                                    </CalcBlock>
                                                                                    <div className="flex gap-3 items-start bg-[var(--color-surface)] border border-[var(--color-accent-cobalt-line)]/30 p-4 rounded-lg mt-4 ml-4">
                                                                                        <Info size={20} className="text-[var(--color-primary)] mt-0.5 shrink-0" />
                                                                                        <p className="text-[var(--color-text-primary)] text-sm leading-relaxed">בודקים האם התוצאה המנורמלת נמצאת מעבר לסף המובהקות (<InlineMath math={`${critSymbol}_{${alphaSymbol}}`} />) שקבענו מהטבלה.</p>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                    <div className={`bg-[var(--color-surface)] border p-4 rounded-lg text-center transition-all duration-700 ${isReject ? 'border-[var(--chart-2)]/60 shadow-[0_0_15px_color-mix(in_srgb,var(--color-success)_40%,transparent)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-[var(--color-border)]'}`}>
                                                                                        <div className="text-[var(--color-success)] font-bold mb-2">אזור הדחייה (Reject <InlineMath math="H_0" />)</div>
                                                                                        <BlockMath math={
                                                                                            tailType === 'right' ? `${statSymbol} \\ge ${Z_crit.toFixed(3)}` :
                                                                                                tailType === 'left' ? `${statSymbol} \\le -${Z_crit.toFixed(3)}` :
                                                                                                    `|${statSymbol}| \\ge ${Z_crit.toFixed(3)}`
                                                                                        } />
                                                                                    </div>
                                                                                    <div className={`bg-[var(--color-surface)] border p-4 rounded-lg text-center transition-all duration-700 ${!isReject ? 'border-[var(--color-accent-crimson)]/60 shadow-[0_0_15px_color-mix(in_srgb,var(--color-error)_40%,transparent)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-[var(--color-border)]'}`}>
                                                                                        <div className="text-[var(--color-error)] font-bold mb-2">אזור אי-הדחייה (Fail to Reject <InlineMath math="H_0" />)</div>
                                                                                        <BlockMath math={
                                                                                            tailType === 'right' ? `${statSymbol} < ${Z_crit.toFixed(3)}` :
                                                                                                tailType === 'left' ? `${statSymbol} > -${Z_crit.toFixed(3)}` :
                                                                                                    `|${statSymbol}| < ${Z_crit.toFixed(3)}`
                                                                                        } />
                                                                                    </div>
                                                                                </div>
                                                                                <ResultBlock isReject={isReject}>
                                                                                    <BlockMath math={`${statSymbol}_{stat} = ${Z_stat.toFixed(3)}`} />
                                                                                </ResultBlock>
                                                                                <HandwrittenNote className="mt-4 text-xl">
                                                                                    <span className={isReject ? 'text-[var(--color-success)] font-bold' : 'text-[var(--color-error)] font-bold'}>
                                                                                        {isReject ? `דחיית השערת האפס (Reject H0)` : `אי-דחיית השערת האפס (Fail to reject H0)`}
                                                                                    </span>
                                                                                    <span>
                                                                                        {' '}מכיוון שציון התקן (<InlineMath math={statSymbol} />) שחושב עבור ממוצע המדגם <strong dir="ltr" className="inline-block px-1"><InlineMath math={`\\bar{X} = ${X_bar.toFixed(3)}`} /></strong> הינו <strong dir="ltr" className="inline-block px-1"><InlineMath math={`${Z_stat.toFixed(3)}`} /></strong>, אשר נופל ב{isReject ? 'אזור הדחייה' : 'אזור אי-הדחייה'}.
                                                                                    </span>
                                                                                </HandwrittenNote>
                                                                            </div>
                                                                        </AnimatedDetails>

                                                                        {/* Accordion 2 */}
                                                                        <AnimatedDetails id="hypothesis-step-6-rejection-region" tocId="hypothesis-step-6-rejection-region" className="group border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] overflow-hidden">
                                                                            <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-5 text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors [&::-webkit-details-marker]:hidden">
                                                                                <div className="flex items-center gap-3">
                                                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-accent-cobalt-line)]/30 bg-[var(--color-accent-cobalt-bg)]/18 text-[var(--color-accent-cobalt)]">
                                                                                        <Map size={16} />
                                                                                    </span>
                                                                                    <h4 data-toc data-toc-target="hypothesis-step-6-rejection-region" data-toc-open="hypothesis-panel,step-6,hypothesis-step-6-rejection-region" className="text-lg sm:text-xl">גישת אזורי דחייה/אי-דחייה ע"פ ממוצע המדגם <span dir="ltr" className="inline-block px-1">(<InlineMath math="\bar{X}" />)</span> <span className="text-sm font-normal text-[var(--color-text-secondary)] hidden sm:inline-block mr-1">(Original Scale)</span></h4>
                                                                                </div>
                                                                                <span className="transition group-[.is-open]:rotate-180">
                                                                                    <ChevronDown size={20} className="text-[var(--color-text-primary)]0" />
                                                                                </span>
                                                                            </summary>
                                                                            <div className="p-5 border-t border-[var(--color-border)]/50 text-[var(--color-text-primary)] space-y-4">
                                                                                <div className="mb-4 text-[var(--color-text-primary)] leading-relaxed text-sm sm:text-base">
                                                                                    <p className="mb-2">גישה זו מציגה את הסף ביחידות המקוריות של הבעיה, המאפשרת השוואה ישירה לממוצע המדגם.</p>
                                                                                    <strong className="text-[var(--color-text-primary)]">דרך החישוב:</strong>
                                                                                    <FormulaBlock>
                                                                                        <BlockMath math={`C = \\mu_0 ${tailType === 'left' ? '-' : tailType === 'right' ? '+' : '\\pm'} ${critSymbol}_{${alphaSymbol}} \\cdot SE`} />
                                                                                    </FormulaBlock>
                                                                                    <CalcBlock>
                                                                                        <BlockMath math={`C = ${mu0} ${tailType === 'left' ? '-' : tailType === 'right' ? '+' : '\\pm'} ${Z_crit.toFixed(3)} \\cdot ${stats.se.toFixed(3)} ${tailType === 'two-tailed' ? `\\Rightarrow [${C_crit_1.toFixed(3)}, ${C_crit_2.toFixed(3)}]` : `= ${C_crit.toFixed(3)}`}`} />
                                                                                    </CalcBlock>
                                                                                    <div className="flex gap-3 items-start bg-[var(--color-surface)] border border-[var(--color-accent-cobalt-line)]/30 p-4 rounded-lg mt-4 ml-4">
                                                                                        <Info size={20} className="text-[var(--color-primary)] mt-0.5 shrink-0" />
                                                                                        <p className="text-[var(--color-text-primary)] text-sm leading-relaxed">כל תוצאה השייכת לקבוצת הדחייה <span dir="ltr" className="inline-block px-1"><InlineMath math={`C = \\{ \\bar{X} \\mid ${tailType === 'left' ? '\\bar{X} \\le C' : tailType === 'right' ? '\\bar{X} \\ge C' : `\\bar{X} \\le C_1 \\text{ or } \\bar{X} \\ge C_2`} \\}`} /></span> מעידה על כך שהמדגם אינו עולה בקנה אחד עם השערת האפס.</p>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                    <div className={`bg-[var(--color-surface)] border p-4 rounded-lg text-center transition-all duration-700 ${isReject ? 'border-[var(--chart-2)]/60 shadow-[0_0_15px_color-mix(in_srgb,var(--color-success)_40%,transparent)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-[var(--color-border)]'}`}>
                                                                                        <div className="text-[var(--color-success)] font-bold mb-2">אזור הדחייה (<InlineMath math="C" />)</div>
                                                                                        <BlockMath math={
                                                                                            tailType === 'right' ? `\\bar{X} \\ge ${C_crit.toFixed(3)}` :
                                                                                                tailType === 'left' ? `\\bar{X} \\le ${C_crit.toFixed(3)}` :
                                                                                                    `\\bar{X} \\le ${C_crit_1.toFixed(3)} \\text{ or } \\bar{X} \\ge ${C_crit_2.toFixed(3)}`
                                                                                        } />
                                                                                    </div>
                                                                                    <div className={`bg-[var(--color-surface)] border p-4 rounded-lg text-center transition-all duration-700 ${!isReject ? 'border-[var(--color-accent-crimson)]/60 shadow-[0_0_15px_color-mix(in_srgb,var(--color-error)_40%,transparent)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-[var(--color-border)]'}`}>
                                                                                        <div className="text-[var(--color-error)] font-bold mb-2">אזור אי-הדחייה (<InlineMath math={String.raw`\bar{C}`} />)</div>
                                                                                        <BlockMath math={
                                                                                            tailType === 'right' ? `\\bar{X} < ${C_crit.toFixed(3)}` :
                                                                                                tailType === 'left' ? `\\bar{X} > ${C_crit.toFixed(3)}` :
                                                                                                    `${C_crit_1.toFixed(3)} < \\bar{X} < ${C_crit_2.toFixed(3)}`
                                                                                        } />
                                                                                    </div>
                                                                                </div>
                                                                                <ResultBlock isReject={isReject}>
                                                                                    <BlockMath math={`\\bar{X} = ${X_bar.toFixed(3)}`} />
                                                                                </ResultBlock>
                                                                                <HandwrittenNote className="mt-4 text-xl">
                                                                                    <span className={isReject ? 'text-[var(--color-success)] font-bold' : 'text-[var(--color-error)] font-bold'}>
                                                                                        {isReject ? `דחיית השערת האפס (Reject H0)` : `אי-דחיית השערת האפס (Fail to reject H0)`}
                                                                                    </span>
                                                                                    <span>
                                                                                        {' '}מכיוון שממוצע המדגם שהתקבל, <strong dir="ltr" className="inline-block px-1"><InlineMath math={`\\bar{X} = ${X_bar.toFixed(3)}`} /></strong>, ממוקם ב{isReject ? 'אזור הדחייה' : 'אזור אי-הדחייה'} (<strong dir="ltr" className="inline-block px-1"><InlineMath math={isReject ? 'C' : '\\bar{C}'} /></strong>).
                                                                                    </span>
                                                                                </HandwrittenNote>
                                                                            </div>
                                                                        </AnimatedDetails>

                                                                        {/* Accordion 3 */}
                                                                        <AnimatedDetails id="hypothesis-step-6-p-value" tocId="hypothesis-step-6-p-value" className="group border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] overflow-hidden">
                                                                            <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-5 text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors [&::-webkit-details-marker]:hidden">
                                                                                <div className="flex items-center gap-3">
                                                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-accent-cobalt-line)]/30 bg-[var(--color-accent-cobalt-bg)]/18 text-[var(--color-accent-cobalt)]">
                                                                                        <Percent size={16} />
                                                                                    </span>
                                                                                    <h4 data-toc data-toc-target="hypothesis-step-6-p-value" data-toc-open="hypothesis-panel,step-6,hypothesis-step-6-p-value" className="text-lg sm:text-xl">גישת מובהקות התוצאה (P-Value) <span className="text-sm font-normal text-[var(--color-text-secondary)] hidden sm:inline-block mr-1">(Probability)</span></h4>
                                                                                </div>
                                                                                <span className="transition group-[.is-open]:rotate-180">
                                                                                    <ChevronDown size={20} className="text-[var(--color-text-primary)]0" />
                                                                                </span>
                                                                            </summary>
                                                                            <div className="p-5 border-t border-[var(--color-border)]/50 text-[var(--color-text-primary)] space-y-4">
                                                                                <div className="mb-4 text-[var(--color-text-primary)] leading-relaxed text-sm sm:text-base">
                                                                                    <p className="mb-2">גישה זו מודדת את הסבירות לקבלת התוצאה שנצפתה מהמדגם המקרי תחת התפלגות <InlineMath math="H_0" />, אל מול רמת המובהקות שנקבעה (<InlineMath math="\alpha" />).</p>
                                                                                    <strong className="text-[var(--color-text-primary)]">דרך החישוב:</strong>
                                                                                    <FormulaBlock>
                                                                                        <BlockMath math={tailType === 'right' ? `P\\text{-value} = P(${statSymbol} > ${statSymbol}_{stat})` : tailType === 'left' ? `P\\text{-value} = P(${statSymbol} < ${statSymbol}_{stat})` : `P\\text{-value} = 2 \\cdot P(${statSymbol} > |${statSymbol}_{stat}|)`} />
                                                                                    </FormulaBlock>
                                                                                    <CalcBlock>
                                                                                        <BlockMath math={tailType === 'right' ? `P\\text{-value} = P(${statSymbol} > ${Z_stat.toFixed(3)}) = ${pVal.toFixed(4)}` : tailType === 'left' ? `P\\text{-value} = P(${statSymbol} < ${Z_stat.toFixed(3)}) = ${pVal.toFixed(4)}` : `P\\text{-value} = 2 \\cdot P(${statSymbol} > ${Math.abs(Z_stat).toFixed(3)}) = ${pVal.toFixed(4)}`} />
                                                                                    </CalcBlock>
                                                                                    <div className="flex gap-3 items-start bg-[var(--color-surface)] border border-[var(--color-accent-cobalt-line)]/30 p-4 rounded-lg mt-4 ml-4">
                                                                                        <Info size={20} className="text-[var(--color-primary)] mt-0.5 shrink-0" />
                                                                                        <p className="text-[var(--color-text-primary)] text-sm leading-relaxed">ה-P-value מוגדר כהסתברות המצטברת {tailType === 'right' ? 'מימין' : tailType === 'left' ? 'משמאל' : 'בשני הקצוות מעבר'} לערך סטטיסטי המבחן. אם הסתברות זו קטנה או שווה ל-<InlineMath math={String.raw`\alpha`} />, התוצאה נחשבת לנדירה מכדי להיות מקרית, מה שמצדיק את דחיית השערת האפס.</p>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                    <div className={`bg-[var(--color-surface)] border p-4 rounded-lg text-center transition-all duration-700 ${isReject ? 'border-[var(--chart-2)]/60 shadow-[0_0_15px_color-mix(in_srgb,var(--color-success)_40%,transparent)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-[var(--color-border)]'}`}>
                                                                                        <div className="text-[var(--color-success)] font-bold mb-2">אזור הדחייה (Reject <InlineMath math="H_0" />)</div>
                                                                                        <BlockMath math={`\\text{P-Value} \\le ${alpha}`} />
                                                                                    </div>
                                                                                    <div className={`bg-[var(--color-surface)] border p-4 rounded-lg text-center transition-all duration-700 ${!isReject ? 'border-[var(--color-accent-crimson)]/60 shadow-[0_0_15px_color-mix(in_srgb,var(--color-error)_40%,transparent)] animate-[pulse_3s_ease-in-out_infinite]' : 'border-[var(--color-border)]'}`}>
                                                                                        <div className="text-[var(--color-error)] font-bold mb-2">אזור אי-הדחייה (Fail to Reject <InlineMath math="H_0" />)</div>
                                                                                        <BlockMath math={`\\text{P-Value} > ${alpha}`} />
                                                                                    </div>
                                                                                </div>
                                                                                <ResultBlock isReject={isReject}>
                                                                                    <BlockMath math={`\\text{P-Value} = ${pVal.toFixed(4)}`} />
                                                                                </ResultBlock>
                                                                                <HandwrittenNote className="mt-4 text-xl">
                                                                                    <span className={isReject ? 'text-[var(--color-success)] font-bold' : 'text-[var(--color-error)] font-bold'}>
                                                                                        {isReject ? `דחיית השערת האפס (Reject H0)` : `אי-דחיית השערת האפס (Fail to reject H0)`}
                                                                                    </span>
                                                                                    <span>
                                                                                        {' '}מכיוון שהסתברות המובהקות (P-Value) שחושבה הינה <strong dir="ltr" className="inline-block px-1"><InlineMath math={`${pVal.toFixed(4)}`} /></strong>, ערך אשר {isReject ? 'קטן או שווה ל' : 'גדול מ'}-<strong dir="ltr" className="inline-block px-1"><InlineMath math={`\\alpha = ${alpha}`} /></strong>.
                                                                                    </span>
                                                                                </HandwrittenNote>
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

                                                                    <div className="bg-[var(--color-surface)] border border-[var(--color-primary)]/30 p-4 rounded-lg flex gap-3 items-start">
                                                                        <AlertTriangle size={20} className="text-[var(--color-warning)] mt-0.5 shrink-0" />
                                                                        <div className="text-[var(--color-primary)]/80 text-sm">
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
                        <div id="confidence-panel" className="tour-step-accordion-ci rounded-lg border shadow-md transition-all overflow-hidden bg-[var(--color-surface)] border-[var(--color-border)] w-full min-w-0 lg:col-span-2 order-4 lg:order-4 text-right mt-6">
                            <div className="relative overflow-hidden border-b border-[var(--color-border)]">
                                <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" dir="ltr">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-12 opacity-10 text-4xl sm:text-5xl font-mono text-[var(--chart-2)]">
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
                                <div className="relative z-10 flex flex-col gap-4 px-8 py-5.5 lg:flex-row lg:items-center lg:justify-between">
                                    <button
                                        onClick={() => setShowCI(!showCI)}
                                        className="flex min-w-0 flex-1 cursor-pointer flex-col gap-4 text-[var(--color-text-primary)] transition-colors sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex items-center gap-3 text-right">
                                            <div className="bg-[var(--color-accent-cobalt-bg)]/20 p-2 rounded-lg text-[var(--color-accent-cobalt)]"><Target size={24} /></div>
                                            <div className="flex flex-col items-start gap-1">
                                                <Heading level="section" withAccentBar data-toc data-toc-target="confidence-panel" data-toc-open="confidence-panel" className="text-xl sm:text-2xl">
                                                    רווח סמך לתוחלת <span dir="ltr" className="inline-flex align-middle"><InlineMath math="(CI)" /></span>
                                                </Heading>
                                            <span aria-hidden="true" className="text-base sm:text-lg font-serif text-[var(--color-text-secondary)] opacity-80" dir="ltr">
                                                    <InlineMath math="\text{Confidence Interval}\;(CI)" />
                                            </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center self-end sm:self-auto gap-4">
                                            <div className="text-[var(--color-text-secondary)]">
                                                <ChevronDown size={24} className={`transition-transform duration-200 ${showCI ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>
                                    </button>
                                    <div className="w-full lg:w-[23rem]">
                                        <a
                                            href="#hypothesis-step-2"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                openHypothesisStep2FromLink();
                                            }}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition-all hover:border-[var(--color-accent-cobalt-line)] hover:text-[var(--color-accent-cobalt)]"
                                        >
                                            <span>שונות אכלוסיה ידועה?</span>
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {showCI && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="p-5 sm:p-8 space-y-8 bg-[var(--color-surface)] text-right">
                                            {/* --- CI CONTROLS MOVED TO TOP --- */}
                                            <div className="grid grid-cols-1 gap-4 p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm mb-6 xl:grid-cols-2">
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

                                            <div className="text-base sm:text-lg text-[var(--color-text-primary)] leading-relaxed space-y-6">
                                                <p>
                                                    אמידה נקודתית (כמו הממוצע <InlineMath math="\bar{X}" />) מספקת לנו ניחוש בודד לפרמטר. עם זאת, הסיכוי שהניחוש הזה יהיה מדויק עד רמת העשרונית האחרונה הוא אפסי. לכן, אנו בונים <strong>רווח סמך</strong> (Confidence Interval).
                                                </p>

                                                <div className="transition-all mt-4 mb-8">
                                                    <Heading level="subsection" className="font-bold text-xl mb-4 underline text-[var(--color-text-primary)]">הגדרת רווח סמך</Heading>
                                                    <div className="text-base sm:text-lg mb-4 text-[var(--color-text-primary)]">
                                                        <p>
                                                            עבור פרמטר לא ידוע <InlineMath math="\theta" />, נבנה מרווח <InlineMath math="(A, B)" /> כך שבהסתברות מסוימת שתיקבע מראש, הפרמטר האמיתי ייפול בתוך המרווח הזה.
                                                        </p>

                                                        <FormulaBlock className="my-2 tour-first-ci-formula" formulaName="הגדרת רווח סמך" translation="רווח הסמך הוא טווח ערכים שבו אנו מאמינים שהפרמטר האמיתי של האוכלוסייה נמצא, במידת ביטחון מסוימת.">
                                                            <BlockMath math="P(A < \theta < B) = 1 - \alpha" />
                                                        </FormulaBlock>

                                                        <ul className="list-disc list-inside space-y-3 mt-4 text-[var(--color-text-secondary)]">
                                                            <li>
                                                                <strong className="text-[var(--color-text-primary)]">רמת הסמך (רמת הביטחון):</strong> ההסתברות <InlineMath math="1 - \alpha" /> (לרוב 90, 95, או 99). מציינת עד כמה אנו "בטוחים" שהשיטה שלנו תלכוד את הפרמטר.
                                                            </li>
                                                            <li>
                                                                <strong className="text-[var(--color-text-primary)]">אורך רווח הסמך (<InlineMath math="L" />):</strong> המרחק בין הגבול העליון לתחתון: <InlineMath math="L = B - A" />.
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Known Variance */}
                                            {varianceKnown && (
                                                <div className="transition-all mt-4">
                                                    <Heading level="subsection" className="font-bold text-xl mb-4 underline text-[var(--color-text-primary)]">נוסחת רווח סמך לתוחלת - שונות ידועה</Heading>
                                                    <div className="text-base sm:text-lg mb-4 text-[var(--color-text-primary)]">
                                                        כאשר האוכלוסייה מתפלגת נורמלית, או כאשר המדגם גדול מספיק (לפי משפט הגבול המרכזי), נשתמש בהתפלגות הנורמלית הסטנדרטית (Z).
                                                    </div>

                                                    <p className="mt-2 text-right text-[var(--color-text-secondary)]">
                                                        המרווח ברמת סמך <InlineMath math="1-\alpha" /> מחושב באופן הבא:
                                                    </p>
                                                    <FormulaBlock
                                                        formulaName="רווח בר סמך לתוחלת (Z)"
                                                        translation="טווח הערכים שבו אנו מעריכים שהתוחלת האמיתית של האוכלוסייה תימצא ברמת ביטחון מסוימת. מבוסס על התפלגות Z כיוון שסטיית התקן של האוכלוסייה נתונה."
                                                    >
                                                        {ciTailType === 'two-tailed' ? <BlockMath math="\bar{X} \pm Z_{1-\frac{\alpha}{2}} \frac{\sigma}{\sqrt{n}}" /> : ciTailType === 'left' ? <BlockMath math="(-\infty, \bar{X} + Z_{1-\alpha} \frac{\sigma}{\sqrt{n}}]" /> : <BlockMath math="[\bar{X} - Z_{1-\alpha} \frac{\sigma}{\sqrt{n}}, \infty)" />}
                                                    </FormulaBlock>
                                                    <FormulaBlock className="mt-0 pt-0">
                                                        {ciTailType === 'two-tailed' ? <BlockMath math="A = \bar{X} - Z_{1-\frac{\alpha}{2}} \frac{\sigma}{\sqrt{n}} \quad , \quad B = \bar{X} + Z_{1-\frac{\alpha}{2}} \frac{\sigma}{\sqrt{n}}" /> : ciTailType === 'left' ? <BlockMath math="B = \bar{X} + Z_{1-\alpha} \frac{\sigma}{\sqrt{n}}" /> : <BlockMath math="A = \bar{X} - Z_{1-\alpha} \frac{\sigma}{\sqrt{n}}" />}
                                                    </FormulaBlock>

                                                    <HandwrittenNote className="mt-2">
                                                        ערך {ciTailType === 'two-tailed' ? <InlineMath math="Z_{1-\frac{\alpha}{2}}" /> : <InlineMath math="Z_{1-\alpha}" />} נלקח מטבלת ההתפלגות הנורמלית הסטנדרטית.
                                                    </HandwrittenNote>

                                                    {stats && decisionData && (
                                                        <div className="mt-8 border-t border-[var(--color-border)] pt-6">
                                                            {(() => {
                                                                const cv = Math.abs(inverseNormalCDF(ciTailType === 'two-tailed' ? ciAlpha / 2 : ciAlpha));
                                                                const me = cv * stats.se;
                                                                const probValue = ciTailType === 'two-tailed' ? ciAlpha / 2 : ciAlpha;
                                                                const lower = decisionData.xBar - me;
                                                                const upper = decisionData.xBar + me;
                                                                return (
                                                                    <div className="text-[var(--color-text-secondary)] text-sm sm:text-base space-y-4" dir="rtl">
                                                                        <div className="font-bold text-[var(--color-text-primary)] mb-4 text-right text-lg">החישוב בפועל</div>

                                                                        <div className="space-y-5">
                                                                            <CalculationStepCard
                                                                                step={1}
                                                                                title={<span>חילוץ הנתונים <span className="text-[var(--color-text-secondary)]"><InlineMath math="(\bar{X},\,n,\,\sigma)" /></span></span>}
                                                                                intro="רושמים את ממוצע המדגם, גודל המדגם וסטיית התקן הידועה של האוכלוסייה. שלושת הנתונים האלה ייכנסו ישירות לנוסחת רווח הסמך."
                                                                                note={<span>במסלול הזה משתמשים ב-<InlineMath math="\sigma" /> כי שונות האוכלוסייה ידועה.</span>}
                                                                            >
                                                                                <CalcBlock>
                                                                                    <BlockMath math={`\\bar{X} = ${decisionData.xBar}, \\quad n = ${nInput}, \\quad \\sigma = ${sigmaInput}`} />
                                                                                </CalcBlock>
                                                                            </CalculationStepCard>

                                                                            <CalculationStepCard
                                                                                step={2}
                                                                                title={<span>מציאת ערך ה-<InlineMath math="Z" /> <span className="text-[var(--color-text-secondary)]"><InlineMath math="(Z_{crit})" /></span></span>}
                                                                                intro="ממירים את רמת הסמך לערך קריטי מתאים מתוך התפלגות Z."
                                                                                note={<span>הערך הקריטי קובע את גודל איבר ה"פלוס-מינוס" שנוסיף לממוצע המדגם.</span>}
                                                                            >
                                                                                <CalcBlock>
                                                                                    {ciTailType === 'two-tailed' ? (
                                                                                        <BlockMath math={`1 - \\alpha = ${1 - ciAlpha} \\implies \\alpha = ${ciAlpha} \\implies \\frac{\\alpha}{2} = ${ciAlpha / 2}`} />
                                                                                    ) : (
                                                                                        <BlockMath math={`1 - \\alpha = ${1 - ciAlpha} \\implies \\alpha = ${ciAlpha}`} />
                                                                                    )}
                                                                                </CalcBlock>
                                                                                <p className="text-[var(--color-text-primary)] text-right">
                                                                                    נחפש בטבלת Z את הערך:
                                                                                </p>
                                                                                <CalcBlock>
                                                                                    <BlockMath math={`Z_{1 - ${probValue}} = Z_{${1 - probValue}} = ${cv.toFixed(4)}`} />
                                                                                </CalcBlock>
                                                                            </CalculationStepCard>

                                                                            <CalculationStepCard
                                                                                step={3}
                                                                                title={<span>הצבה בנוסחה <span className="text-[var(--color-text-secondary)]"><InlineMath math="(\mu \in CI)" /></span></span>}
                                                                                intro="מציבים את הנתונים ואת הערך הקריטי בתוך נוסחת רווח הסמך, ומקבלים את תחום הערכים הסופי."
                                                                                note={
                                                                                    <div className="space-y-1">
                                                                                        {ciTailType !== 'left' && <div><strong>הגבול התחתון:</strong> <InlineMath math={`${decisionData.xBar} - ${me.toFixed(4)} = ${lower.toFixed(4)}`} /></div>}
                                                                                        {ciTailType !== 'right' && <div><strong>הגבול העליון:</strong> <InlineMath math={`${decisionData.xBar} + ${me.toFixed(4)} = ${upper.toFixed(4)}`} /></div>}
                                                                                    </div>
                                                                                }
                                                                            >
                                                                                <CalcBlock>
                                                                                    {ciTailType === 'two-tailed' && (
                                                                                        <>
                                                                                        <BlockMath math={`\\mu \\in \\left( ${decisionData.xBar} \\pm ${cv.toFixed(4)} \\cdot \\frac{${sigmaInput}}{\\sqrt{${nInput}}} \\right)`} />
                                                                                        <BlockMath math={String.raw`\mu \in ${decisionData.xBar} \pm ${cv.toFixed(4)} \cdot ${stats.se.toFixed(4)} \Rightarrow ${decisionData.xBar} \pm ${me.toFixed(4)}`} />
                                                                                        </>
                                                                                    )}
                                                                                    {ciTailType === 'left' && (
                                                                                        <>
                                                                                            <BlockMath math={`\\mu \\in \\left( -\\infty, ${decisionData.xBar} + ${cv.toFixed(4)} \\cdot \\frac{${sigmaInput}}{\\sqrt{${nInput}}} \\right]`} />
                                                                                            <BlockMath math={`\\mu \\in \\left( -\\infty, ${decisionData.xBar} + ${cv.toFixed(4)} \\cdot ${stats.se.toFixed(4)} \\right] = \\left( -\\infty, ${upper.toFixed(4)} \\right]`} />
                                                                                        </>
                                                                                    )}
                                                                                    {ciTailType === 'right' && (
                                                                                        <>
                                                                                            <BlockMath math={`\\mu \\in \\left[ ${decisionData.xBar} - ${cv.toFixed(4)} \\cdot \\frac{${sigmaInput}}{\\sqrt{${nInput}}}, \\infty \\right)`} />
                                                                                            <BlockMath math={`\\mu \\in \\left[ ${decisionData.xBar} - ${cv.toFixed(4)} \\cdot ${stats.se.toFixed(4)}, \\infty \\right) = \\left[ ${lower.toFixed(4)}, \\infty \\right)`} />
                                                                                        </>
                                                                                    )}
                                                                                </CalcBlock>
                                                                            </CalculationStepCard>
                                                                        </div>

                                                                        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] xl:items-start">
                                                                            <div className="space-y-5 xl:order-1">
                                                                                <ResultSummaryCard
                                                                                    title={<>תשובה סופית <span className="text-[var(--color-text-secondary)]"><InlineMath math="(CI)" /></span></>}
                                                                                    subtitle={<>אנו בטוחים ב-{(1 - ciAlpha) * 100}% שתוחלת האוכלוסייה נמצאת בטווח הנ"ל.</>}
                                                                                    math={ciTailType === 'two-tailed' ? `[${lower.toFixed(4)}, ${upper.toFixed(4)}]` : ciTailType === 'left' ? `(-\\infty, ${upper.toFixed(4)}]` : `[${lower.toFixed(4)}, \\infty)`}
                                                                                    visual={ciTailType === 'two-tailed' ? (
                                                                                        <ConfidenceIntervalRail
                                                                                            lower={lower}
                                                                                            mean={decisionData.xBar}
                                                                                            upper={upper}
                                                                                        />
                                                                                    ) : undefined}
                                                                                />
                                                                            </div>
                                                                            <div className="xl:order-2">
                                                                                <ConfidenceIntervalFollowups
                                                                                    ciAlpha={ciAlpha}
                                                                                    ciTailType={ciTailType}
                                                                                    n={n}
                                                                                    scale={sigma}
                                                                                    scaleInput={sigmaInput}
                                                                                    scaleSymbol="\sigma"
                                                                                    currentWidth={upper - lower}
                                                                                    populationVarianceKnown={true}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Unknown Variance */}
                                            {!varianceKnown && (
                                                <div className="transition-all mt-4">
                                                    <Heading level="subsection" className="font-bold text-xl mb-4 underline text-[var(--color-text-primary)]">נוסחת רווח סמך לתוחלת - שונות לא ידועה</Heading>
                                                    <div className="space-y-6">
                                                        <TheoryCard
                                                            title={<span>התפלגות לחישוב <span className="text-[var(--color-text-secondary)]"><InlineMath math={n >= 30 ? '(Z)' : '(t_{n-1})'} /></span></span>}
                                                            intro={n >= 30 ? (
                                                                <>כאשר שונות האוכלוסייה איננה ידועה אבל גודל המדגם הוא <InlineMath math="n \ge 30" />, משתמשים בסטיית התקן המדגמית <InlineMath math="S" /> ובקירוב נורמלי סטנדרטי.</>
                                                            ) : (
                                                                <>כאשר שונות האוכלוסייה איננה ידועה, מחליפים את <InlineMath math="\sigma" /> באומד המדגמי <InlineMath math="S" />. ההחלפה הזו מוסיפה אי־ודאות ולכן הסטטיסטי מתפלג לפי <InlineMath math="t" /> של סטודנט עם <InlineMath math="n-1" /> דרגות חופש.</>
                                                            )}
                                                            icon={<BookOpen size={18} />}
                                                            className="border-[var(--color-error)]/30 bg-[var(--color-error)]/5"
                                                        >
                                                            <FormulaBlock>
                                                                <BlockMath math={n >= 30
                                                                    ? String.raw`Z = \frac{\overline{X} - \mu}{\frac{S}{\sqrt{n}}} \sim N(0,1)`
                                                                    : String.raw`T = \frac{\overline{X} - \mu}{\frac{S}{\sqrt{n}}} \sim t_{(n-1)}`} />
                                                            </FormulaBlock>
                                                        </TheoryCard>

                                                        <TheoryCard
                                                            title={<span>נוסחת רווח סמך לתוחלת <span className="text-[var(--color-text-secondary)]"><InlineMath math={n >= 30 ? '(CI,\;Z,\;S)' : '(CI,\;t,\;S)'} /></span></span>}
                                                            intro={<>המרווח ברמת סמך <InlineMath math="1-\alpha" /> מחושב באופן הבא.</>}
                                                            icon={<BookOpen size={18} />}
                                                        >
                                                            <FormulaBlock
                                                                formulaName={n >= 30 ? 'רווח בר סמך לתוחלת (Z עם S)' : 'רווח בר סמך לתוחלת (T)'}
                                                                translation={n >= 30
                                                                    ? 'כאשר שונות האוכלוסייה אינה ידועה אבל המדגם גדול, משתמשים בסטיית התקן המדגמית S ובערכי Z מההתפלגות הנורמלית הסטנדרטית.'
                                                                    : 'טווח הערכים שבו אנו מעריכים שהתוחלת האמיתית של האוכלוסייה תימצא ברמת ביטחון מסוימת. מבוסס על התפלגות T של סטודנט כיוון שסטיית התקן של האוכלוסייה איננה ידועה.'}
                                                            >
                                                                {n >= 30
                                                                    ? (ciTailType === 'two-tailed'
                                                                        ? <BlockMath math={String.raw`\bar{X} \pm z_{1-\frac{\alpha}{2}} \frac{S}{\sqrt{n}}`} />
                                                                        : ciTailType === 'left'
                                                                            ? <BlockMath math={String.raw`(-\infty, \bar{X} + z_{1-\alpha} \frac{S}{\sqrt{n}}]`} />
                                                                            : <BlockMath math={String.raw`[\bar{X} - z_{1-\alpha} \frac{S}{\sqrt{n}}, \infty)`} />)
                                                                    : (ciTailType === 'two-tailed'
                                                                        ? <BlockMath math={String.raw`\bar{X} \pm t_{n-1, 1-\frac{\alpha}{2}} \frac{S}{\sqrt{n}}`} />
                                                                        : ciTailType === 'left'
                                                                            ? <BlockMath math={String.raw`(-\infty, \bar{X} + t_{n-1, 1-\alpha} \frac{S}{\sqrt{n}}]`} />
                                                                            : <BlockMath math={String.raw`[\bar{X} - t_{n-1, 1-\alpha} \frac{S}{\sqrt{n}}, \infty)`} />)}
                                                            </FormulaBlock>
                                                            <FormulaBlock className="mt-0 pt-0">
                                                                {n >= 30
                                                                    ? (ciTailType === 'two-tailed'
                                                                        ? <BlockMath math={String.raw`A = \bar{X} - z_{1-\frac{\alpha}{2}} \frac{S}{\sqrt{n}} \quad , \quad B = \bar{X} + z_{1-\frac{\alpha}{2}} \frac{S}{\sqrt{n}}`} />
                                                                        : ciTailType === 'left'
                                                                            ? <BlockMath math={String.raw`B = \bar{X} + z_{1-\alpha} \frac{S}{\sqrt{n}}`} />
                                                                            : <BlockMath math={String.raw`A = \bar{X} - z_{1-\alpha} \frac{S}{\sqrt{n}}`} />)
                                                                    : (ciTailType === 'two-tailed'
                                                                        ? <BlockMath math={String.raw`A = \bar{X} - t_{n-1, 1-\frac{\alpha}{2}} \frac{S}{\sqrt{n}} \quad , \quad B = \bar{X} + t_{n-1, 1-\frac{\alpha}{2}} \frac{S}{\sqrt{n}}`} />
                                                                        : ciTailType === 'left'
                                                                            ? <BlockMath math={String.raw`B = \bar{X} + t_{n-1, 1-\alpha} \frac{S}{\sqrt{n}}`} />
                                                                            : <BlockMath math={String.raw`A = \bar{X} - t_{n-1, 1-\alpha} \frac{S}{\sqrt{n}}`} />)}
                                                            </FormulaBlock>
                                                            <HandwrittenNote className="mt-2">
                                                                ערך {n >= 30
                                                                    ? (ciTailType === 'two-tailed' ? <InlineMath math={String.raw`z_{1-\frac{\alpha}{2}}`} /> : <InlineMath math={String.raw`z_{1-\alpha}`} />)
                                                                    : (ciTailType === 'two-tailed' ? <InlineMath math={String.raw`t_{n-1, 1-\frac{\alpha}{2}}`} /> : <InlineMath math={String.raw`t_{n-1, 1-\alpha}`} />)}
                                                                {' '}נלקח {n >= 30 ? 'מטבלת Z הסטנדרטית.' : 'מטבלת התפלגות T של סטודנט.'}
                                                            </HandwrittenNote>
                                                        </TheoryCard>
                                                    </div>

                                                    {stats && decisionData && (
                                                        <div className="mt-8 border-t border-[var(--color-border)] pt-6">
                                                            {(() => {
                                                                const usesLargeSampleZ = n >= 30;
                                                                const cv = Math.abs(
                                                                    usesLargeSampleZ
                                                                        ? inverseNormalCDF(ciTailType === 'two-tailed' ? ciAlpha / 2 : ciAlpha)
                                                                        : studentTPPF(ciTailType === 'two-tailed' ? ciAlpha / 2 : ciAlpha, stats.df)
                                                                );
                                                                const me = cv * stats.se;
                                                                const probValue = ciTailType === 'two-tailed' ? ciAlpha / 2 : ciAlpha;
                                                                const lower = decisionData.xBar - me;
                                                                const upper = decisionData.xBar + me;
                                                                const sumXi = decisionData.xBar * n;
                                                                return (
                                                                    <div className="text-[var(--color-text-secondary)] text-sm sm:text-base space-y-4" dir="rtl">
                                                                        <div className="font-bold text-[var(--color-text-primary)] mb-4 text-right text-lg">החישוב בפועל</div>

                                                                        <div className="space-y-5">
                                                                            <CalculationStepCard
                                                                                step={1}
                                                                                title={<span>חישוב ממוצע המדגם <InlineMath math="(\bar{X})" /></span>}
                                                                                intro="קודם מציגים את נוסחת ממוצע המדגם, ואז רושמים את הנתונים שניתנו לנו לצורך ההצבה."
                                                                                note={<span>הממוצע הזה הוא מרכז רווח הסמך שנחשב בהמשך.</span>}
                                                                            >
                                                                                <FormulaBlock
                                                                                    formulaName="נוסחת ממוצע המדגם"
                                                                                    translation="ממוצע המדגם מתקבל מחלוקת סכום כל התצפיות בגודל המדגם."
                                                                                >
                                                                                    <BlockMath math={String.raw`\bar{X} = \frac{\sum X_i}{n}`} />
                                                                                </FormulaBlock>
                                                                                <CalcBlock>
                                                                                    <BlockMath math={String.raw`\bar{X} = ${decisionData.xBar}, \quad n = ${nInput}`} />
                                                                                </CalcBlock>
                                                                            </CalculationStepCard>

                                                                            <CalculationStepCard
                                                                                step={2}
                                                                                title={<span>אומד שונות המדגם וסטיית התקן <span className="text-[var(--color-text-secondary)]"><InlineMath math="(S^2,\;S)" /></span></span>}
                                                                                intro={usesLargeSampleZ
                                                                                    ? <>כאן <InlineMath math="S" /> כבר נתון כסטיית התקן המדגמית, ולכן נשתמש בו ישירות. יחד עם זאת, חשוב לראות גם את נוסחת העבודה למקרה שבו כל התצפיות היו נתונות.</>
                                                                                    : <>כאשר שונות האוכלוסייה אינה ידועה והמדגם קטן, בונים תחילה את <InlineMath math="S^2" /> ורק אחר כך מוציאים שורש כדי להגיע ל-<InlineMath math="S" />.</>}
                                                                                note={usesLargeSampleZ
                                                                                    ? <span>במסלול הזה אין צורך לשחזר את כל התצפיות; מספיק לדעת ש-<InlineMath math={`S = ${sigmaInput}`} /> נתון לנו מראש.</span>
                                                                                    : <span>אם היו נותנים את כל התצפיות, היינו מחשבים את <InlineMath math="\sum X_i^2" />, מוצאים את <InlineMath math="S^2" />, ואז מקבלים את <InlineMath math="S" /> על ידי הוצאת שורש.</span>}
                                                                            >
                                                                                {usesLargeSampleZ ? (
                                                                                    <>
                                                                                        <p className="text-[var(--color-text-primary)] text-right leading-relaxed">
                                                                                            אילו כל התצפיות היו מונחות על השולחן, היינו יכולים לחשב גם את <InlineMath math="\sum X_i^2" /> ואז למצוא בעזרת נוסחת העבודה את <InlineMath math="S^2" />. כאן אין לנו את כל התצפיות, ולכן משתמשים בעובדה ש-<InlineMath math={`S = ${sigmaInput}`} /> כבר נתון.
                                                                                        </p>
                                                                                        <FormulaBlock
                                                                                            formulaName="נוסחת העבודה למקרה שכל התצפיות נתונות"
                                                                                            translation="אם כל התצפיות ידועות, מחשבים את סכום ריבועי התצפיות וממנו מקבלים את אומד השונות של המדגם."
                                                                                        >
                                                                                            <BlockMath math={String.raw`S^2 = \frac{\sum X_i^2 - n\bar{X}^2}{n-1}`} />
                                                                                        </FormulaBlock>
                                                                                        <CalcBlock>
                                                                                            <BlockMath math={String.raw`\sum X_i = n\bar{X} = ${nInput} \cdot ${decisionData.xBar} = ${sumXi.toFixed(4)}`} />
                                                                                        </CalcBlock>
                                                                                        <CalcBlock>
                                                                                            <BlockMath math={String.raw`S = ${sigmaInput}`} />
                                                                                        </CalcBlock>
                                                                                        <CalcBlock>
                                                                                            <BlockMath math={String.raw`S^2 = (${sigmaInput})^2 = ${(sigma ** 2).toFixed(4)}`} />
                                                                                        </CalcBlock>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <p className="text-[var(--color-text-primary)] text-right leading-relaxed">
                                                                                            אם כל התצפיות נתונות, מחשבים קודם את <InlineMath math="\sum X_i" /> ואת <InlineMath math="\sum X_i^2" />, מהם מקבלים את <InlineMath math="S^2" />, ורק בסוף לוקחים שורש כדי להגיע ל-<InlineMath math="S" />.
                                                                                        </p>
                                                                                        <FormulaBlock
                                                                                            formulaName="נוסחת העבודה לשונות המדגם"
                                                                                            translation="נוסחה שקושרת בין סכום ריבועי התצפיות, ממוצע המדגם וגודל המדגם כדי לקבל את אומד השונות כאשר שונות האוכלוסייה אינה ידועה."
                                                                                        >
                                                                                            <BlockMath math={String.raw`S^2 = \frac{\sum X_i^2 - n\bar{X}^2}{n-1}`} />
                                                                                        </FormulaBlock>
                                                                                        <CalcBlock>
                                                                                            <BlockMath math={String.raw`\sum X_i = n\bar{X} = ${nInput} \cdot ${decisionData.xBar} = ${sumXi.toFixed(4)}`} />
                                                                                        </CalcBlock>
                                                                                        <CalcBlock>
                                                                                            <BlockMath math={String.raw`S^2 = \frac{\sum X_i^2 - ${n}\cdot (${decisionData.xBar})^2}{${n - 1}}`} />
                                                                                        </CalcBlock>
                                                                                        <FormulaBlock
                                                                                            formulaName="מעבר מאומד השונות לסטיית התקן"
                                                                                            translation="אם סימנו את אומד השונות המדגמית ב-S^2, אז לפי ההגדרה סטיית התקן המדגמית היא השורש שלו."
                                                                                        >
                                                                                            <BlockMath math={String.raw`S = \sqrt{S^2}`} />
                                                                                        </FormulaBlock>
                                                                                        <CalcBlock>
                                                                                            <BlockMath math={String.raw`S = \sqrt{\frac{\sum X_i^2 - n\bar{X}^2}{n-1}}`} />
                                                                                        </CalcBlock>
                                                                                    </>
                                                                                )}
                                                                            </CalculationStepCard>

                                                                            <CalculationStepCard
                                                                                step={3}
                                                                                title={<span>מציאת ערך ה-<InlineMath math={usesLargeSampleZ ? 'Z' : 't'} /> <span className="text-[var(--color-text-secondary)]"><InlineMath math={usesLargeSampleZ ? '(Z_{crit})' : '(t_{crit})'} /></span></span>}
                                                                                intro={usesLargeSampleZ ? 'מאחר שהמדגם גדול, משתמשים בערך קריטי מתוך התפלגות Z.' : 'מאחר שהמדגם קטן והשונות אינה ידועה, משתמשים בערך קריטי מתוך התפלגות t של סטודנט.'}
                                                                                note={<span>גם כאן רמת הסמך קובעת איזה ערך קריטי נשלוף מהטבלה המתאימה.</span>}
                                                                            >
                                                                                <CalcBlock>
                                                                                    {ciTailType === 'two-tailed' ? (
                                                                                        <BlockMath math={String.raw`1 - \alpha = ${1 - ciAlpha} \implies \alpha = ${ciAlpha} \implies \frac{\alpha}{2} = ${ciAlpha / 2}`} />
                                                                                    ) : (
                                                                                        <BlockMath math={String.raw`1 - \alpha = ${1 - ciAlpha} \implies \alpha = ${ciAlpha}`} />
                                                                                    )}
                                                                                </CalcBlock>
                                                                                <p className="text-[var(--color-text-primary)] text-right">
                                                                                    {usesLargeSampleZ
                                                                                        ? 'נחפש בטבלת Z את הערך:'
                                                                                        : `נחפש בטבלת T עבור ${stats.df} דרגות חופש את הערך:`}
                                                                                </p>
                                                                                <CalcBlock>
                                                                                    <BlockMath math={usesLargeSampleZ
                                                                                        ? String.raw`z_{1 - ${probValue}} = z_{${1 - probValue}} = ${cv.toFixed(4)}`
                                                                                        : String.raw`t_{${stats.df}, 1 - ${probValue}} = t_{${stats.df}, ${1 - probValue}} = ${cv.toFixed(4)}`} />
                                                                                </CalcBlock>
                                                                            </CalculationStepCard>

                                                                            <CalculationStepCard
                                                                                step={4}
                                                                                title={<span>הצבה בנוסחה <span className="text-[var(--color-text-secondary)]"><InlineMath math="(\mu \in CI)" /></span></span>}
                                                                                intro="בשלב הזה מציבים את ממוצע המדגם, סטיית התקן המדגמית והערך הקריטי, ומקבלים את רווח הסמך עצמו."
                                                                                note={
                                                                                    <div className="space-y-1">
                                                                                        {ciTailType !== 'left' && <div><strong>הגבול התחתון:</strong> <InlineMath math={`${decisionData.xBar} - ${me.toFixed(4)} = ${lower.toFixed(4)}`} /></div>}
                                                                                        {ciTailType !== 'right' && <div><strong>הגבול העליון:</strong> <InlineMath math={`${decisionData.xBar} + ${me.toFixed(4)} = ${upper.toFixed(4)}`} /></div>}
                                                                                    </div>
                                                                                }
                                                                            >
                                                                                <CalcBlock>
                                                                                    {ciTailType === 'two-tailed' && (
                                                                                        <>
                                                                                        <BlockMath math={`\\mu \\in \\left( ${decisionData.xBar} \\pm ${cv.toFixed(4)} \\cdot \\frac{${sigmaInput}}{\\sqrt{${nInput}}} \\right)`} />
                                                                                        <BlockMath math={String.raw`\mu \in ${decisionData.xBar} \pm ${cv.toFixed(4)} \cdot ${stats.se.toFixed(4)} \Rightarrow ${decisionData.xBar} \pm ${me.toFixed(4)}`} />
                                                                                        </>
                                                                                    )}
                                                                                    {ciTailType === 'left' && (
                                                                                        <>
                                                                                            <BlockMath math={`\\mu \\in \\left( -\\infty, ${decisionData.xBar} + ${cv.toFixed(4)} \\cdot \\frac{${sigmaInput}}{\\sqrt{${nInput}}} \\right]`} />
                                                                                            <BlockMath math={`\\mu \\in \\left( -\\infty, ${decisionData.xBar} + ${cv.toFixed(4)} \\cdot ${stats.se.toFixed(4)} \\right] = \\left( -\\infty, ${upper.toFixed(4)} \\right]`} />
                                                                                        </>
                                                                                    )}
                                                                                    {ciTailType === 'right' && (
                                                                                        <>
                                                                                            <BlockMath math={`\\mu \\in \\left[ ${decisionData.xBar} - ${cv.toFixed(4)} \\cdot \\frac{${sigmaInput}}{\\sqrt{${nInput}}}, \\infty \\right)`} />
                                                                                            <BlockMath math={`\\mu \\in \\left[ ${decisionData.xBar} - ${cv.toFixed(4)} \\cdot ${stats.se.toFixed(4)}, \\infty \\right) = \\left[ ${lower.toFixed(4)}, \\infty \\right)`} />
                                                                                        </>
                                                                                    )}
                                                                                </CalcBlock>
                                                                            </CalculationStepCard>
                                                                        </div>

                                                                        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] xl:items-start">
                                                                            <div className="space-y-5 xl:order-1">
                                                                                <ResultSummaryCard
                                                                                    title={<>תשובה סופית <span className="text-[var(--color-text-secondary)]"><InlineMath math="(CI)" /></span></>}
                                                                                    subtitle={<>אנו בטוחים ב-{(1 - ciAlpha) * 100}% שתוחלת האוכלוסייה נמצאת בטווח הנ"ל.</>}
                                                                                    math={ciTailType === 'two-tailed' ? `[${lower.toFixed(4)}, ${upper.toFixed(4)}]` : ciTailType === 'left' ? `(-\\infty, ${upper.toFixed(4)}]` : `[${lower.toFixed(4)}, \\infty)`}
                                                                                    visual={ciTailType === 'two-tailed' ? (
                                                                                        <ConfidenceIntervalRail
                                                                                            lower={lower}
                                                                                            mean={decisionData.xBar}
                                                                                            upper={upper}
                                                                                        />
                                                                                    ) : undefined}
                                                                                />
                                                                            </div>
                                                                            <div className="xl:order-2">
                                                                                <ConfidenceIntervalFollowups
                                                                                    ciAlpha={ciAlpha}
                                                                                    ciTailType={ciTailType}
                                                                                    n={n}
                                                                                    scale={sigma}
                                                                                    scaleInput={sigmaInput}
                                                                                    scaleSymbol="S"
                                                                                    currentWidth={upper - lower}
                                                                                    populationVarianceKnown={false}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}



                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Power Section */}
                    {isValid && stats && (
                        <div id="power-panel" className="tour-power-panel rounded-lg border shadow-md transition-all overflow-hidden bg-[var(--color-surface)] border-[var(--color-border)] w-full min-w-0 lg:col-span-2 order-5 lg:order-5 text-right mt-6">
                            <button
                                onClick={() => setShowPower(!showPower)}
                                className="relative overflow-hidden w-full px-8 py-5.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors border-b border-[var(--color-border)] cursor-pointer"
                            >
                                <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" dir="ltr">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-12 opacity-10 text-4xl sm:text-5xl font-mono text-[var(--chart-2)]">
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
                                        <div className="flex flex-col items-start gap-1">
                                            <Heading level="section" withAccentBar data-toc data-toc-target="power-panel" data-toc-open="power-panel" className="text-xl sm:text-2xl">
                                                עוצמת מבחן <span dir="ltr" className="inline-flex align-middle"><InlineMath math="(1-\beta)" /></span>
                                            </Heading>
                                            <span aria-hidden="true" className="text-base sm:text-lg font-serif text-[var(--color-text-secondary)] opacity-80" dir="ltr">
                                                <InlineMath math="\text{Statistical Power}\;(1-\beta)" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative z-10 flex items-center self-end sm:self-auto gap-4">
                                    <div className="text-[var(--color-text-secondary)]">
                                        <ChevronDown size={24} className={`transition-transform duration-200 ${showPower ? 'rotate-180' : ''}`} />
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
                                                <InlineMath math="\beta = P(\text{Fail to Reject } H_0 \mid H_1)" />. לכן <InlineMath math="1-\beta" /> היא ההסתברות לדחות נכון את <InlineMath math="H_0" /> כאשר <InlineMath math="H_1" /> נכונה.
                                            </p>

                                            {powerEnabled && powerStats ? (
                                                <div className="space-y-8">
                                                    <p className="text-base sm:text-lg text-[var(--color-text-primary)] leading-relaxed font-semibold">
                                                        קלט: <InlineMath math="\mu_0,\ \mu_1,\ \sigma,\ n,\ \alpha" />. מהלך: <InlineMath math="SE \to C \to Z \to Power,\beta" />.
                                                    </p>

                                                    <div className="space-y-5">
                                                        <PowerStepCard
                                                            step="שלב 1"
                                                            title={<>מוצאים את התפלגות ממוצע המדגם <span dir="ltr" className="inline-flex align-middle"><InlineMath math="(\bar{X},\,SE)" /></span></>}
                                                            description={<>עובדים עם <InlineMath math="\bar{X}" />, כי זה המשתנה שעליו מתקבלת ההחלטה. לכן סטיית התקן הרלוונטית היא טעות התקן <InlineMath math="SE" />.</>}
                                                            formula={[
                                                                String.raw`\bar{X} \sim N\!\left(\mu,\frac{\sigma^2}{n}\right)`,
                                                                String.raw`SE = \frac{\sigma}{\sqrt{n}}`,
                                                            ]}
                                                            application={String.raw`SE = \frac{${sigma.toFixed(4)}}{\sqrt{${n}}} = ${powerStats.se.toFixed(4)}`}
                                                            note={<>כלומר: במקום לעבוד עם תצפית בודדת, עובדים עם פיזור של ממוצע המדגם סביב <InlineMath math="\mu" />.</>}
                                                        />

                                                        <PowerStepCard
                                                            step="שלב 2"
                                                            title={<>קובעים את סף הדחייה <span dir="ltr" className="inline-flex align-middle"><InlineMath math="(C)" /></span></>}
                                                            description={powerStats.tail === 'left'
                                                                ? <>כאן <InlineMath math="\mu_1 < \mu_0" />, לכן זה מבחן שמאלי. אזור הדחייה נמצא משמאל, ולכן <InlineMath math="C" /> נבנה משמאל ל-<InlineMath math="\mu_0" />.</>
                                                                : <>כאן <InlineMath math="\mu_1 > \mu_0" />, לכן זה מבחן ימני. אזור הדחייה נמצא מימין, ולכן <InlineMath math="C" /> נבנה מימין ל-<InlineMath math="\mu_0" />.</>}
                                                            formula={powerStats.tail === 'left'
                                                                ? String.raw`C = \mu_0 - Z_{1-\alpha}\cdot SE`
                                                                : String.raw`C = \mu_0 + Z_{1-\alpha}\cdot SE`}
                                                            application={powerStats.tail === 'left'
                                                                ? `C = ${mu0.toFixed(4)} - ${powerStats.criticalZ.toFixed(4)} \\cdot ${powerStats.se.toFixed(4)} = ${powerStats.criticalValue.toFixed(4)}`
                                                                : `C = ${mu0.toFixed(4)} + ${powerStats.criticalZ.toFixed(4)} \\cdot ${powerStats.se.toFixed(4)} = ${powerStats.criticalValue.toFixed(4)}`}
                                                            note={<>הערך <InlineMath math="C" /> הוא הגבול שמפריד בין דחיית <InlineMath math="H_0" /> לבין אי-דחייתה.</>}
                                                        />

                                                        <PowerStepCard
                                                            step="שלב 3"
                                                            title={<>מתרגמים את הגבול להתפלגות של H₁ <span dir="ltr" className="inline-flex align-middle"><InlineMath math="(Z)" /></span></>}
                                                            description={<>כעת בודקים איפה הערך הקריטי <InlineMath math="C" /> יושב ביחס להתפלגות האלטרנטיבית, כלומר ביחס ל-<InlineMath math="\mu_1" />.</>}
                                                            formula={String.raw`Z = \frac{C-\mu_1}{SE}`}
                                                            application={`Z = \\frac{${powerStats.criticalValue.toFixed(4)} - ${mu1.toFixed(4)}}{${powerStats.se.toFixed(4)}} = ${powerStats.zUnderH1.toFixed(4)}`}
                                                            note={<>זהו המרחק של <InlineMath math="C" /> מ-<InlineMath math="\mu_1" />, ביחידות של טעות תקן.</>}
                                                        />

                                                        <PowerStepCard
                                                            step="שלב 4"
                                                            title={<>מחשבים את Power ואת β <span dir="ltr" className="inline-flex align-middle"><InlineMath math="(1-\beta,\;\beta)" /></span></>}
                                                            description={powerStats.tail === 'left'
                                                                ? <>במבחן שמאלי ה־Power הוא השטח שמשמאל ל-<InlineMath math="C" /> תחת <InlineMath math="H_1" />. השטח המשלים הוא <InlineMath math="\beta" />.</>
                                                                : <>במבחן ימני ה־Power הוא השטח שמימין ל-<InlineMath math="C" /> תחת <InlineMath math="H_1" />. השטח המשלים הוא <InlineMath math="\beta" />.</>}
                                                            formula={powerStats.tail === 'left'
                                                                ? [
                                                                    String.raw`\text{Power} = \Phi(Z)`,
                                                                    String.raw`\beta = 1 - \Phi(Z)`,
                                                                ]
                                                                : [
                                                                    String.raw`\text{Power} = 1 - \Phi(Z)`,
                                                                    String.raw`\beta = \Phi(Z)`,
                                                                ]}
                                                            application={powerStats.tail === 'left'
                                                                ? [
                                                                    `\\text{Power} = \\Phi(${powerStats.zUnderH1.toFixed(4)}) = ${powerStats.power.toFixed(4)}`,
                                                                    `\\beta = 1 - ${powerStats.power.toFixed(4)} = ${powerStats.beta.toFixed(4)}`,
                                                                ]
                                                                : [
                                                                    `\\text{Power} = 1 - \\Phi(${powerStats.zUnderH1.toFixed(4)}) = ${powerStats.power.toFixed(4)}`,
                                                                    `\\beta = \\Phi(${powerStats.zUnderH1.toFixed(4)}) = ${powerStats.beta.toFixed(4)}`,
                                                                ]}
                                                            note={<>ככל שה־Power גבוה יותר, כך גדל הסיכוי לזהות אפקט אמיתי ולא לפספס אותו.</>}
                                                        />
                                                    </div>

                                                    <div className="grid gap-4 lg:grid-cols-3">
                                                        <ResultSummaryCard
                                                            title={<>ערך קריטי <InlineMath math="C" /></>}
                                                            subtitle={<>סף הדחייה שנקבע לפי <InlineMath math="\mu_0" />, <InlineMath math="\alpha" />, ו-<InlineMath math="SE" />.</>}
                                                            math={`C = ${powerStats.criticalValue.toFixed(4)}`}
                                                        />
                                                        <ResultSummaryCard
                                                            title={<>עוצמת מבחן <InlineMath math={String.raw`1-\beta`} /></>}
                                                            subtitle={<>ההסתברות לזהות נכון אפקט אמיתי כאשר <InlineMath math="H_1" /> נכונה.</>}
                                                            math={`1-\\beta = ${(powerStats.power * 100).toFixed(2)}\\%`}
                                                        />
                                                        <ResultSummaryCard
                                                            title={<>טעות מסוג II <InlineMath math={String.raw`\beta`} /></>}
                                                            subtitle={<>הסיכוי שלא לדחות את <InlineMath math="H_0" /> למרות שקיים אפקט אמיתי.</>}
                                                            math={`\\beta = ${(powerStats.beta * 100).toFixed(2)}\\%`}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-[var(--color-surface)] p-5 rounded-lg border border-[var(--color-border)] text-center text-[var(--color-text-secondary)] space-y-2 max-w-xl mx-auto mt-4">
                                                    <Info size={20} className="mx-auto text-[var(--color-accent-cobalt)]" />
                                                    <h5 className="font-extrabold text-[var(--color-text-primary)] text-sm sm:text-base">נדרש ממוצע תחת <InlineMath math="H_1" /></h5>
                                                    <p className="text-xs sm:text-sm font-medium leading-relaxed">
                                                        כדי להמשיך לחישוב המלא של <InlineMath math="\beta" /> ושל <InlineMath math="1-\beta" />, הזן ערך תקין עבור ממוצע השערת המחקר <InlineMath math="\mu_1" /> בטבלת הפרמטרים.
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
                            <DecisionMatrix isValid={isValid} stats={decisionMatrixStats} alpha={alpha} calculatePower={powerEnabled} />
                        </div>

                    </div>

                </div>



            </div>
        </div>
    );
}
