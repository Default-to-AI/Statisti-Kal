/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * HypothesisCalcUI — extracted presentational helper components for
 * HypothesisTestingCalculator. These are pure, prop-driven sub-components
 * (step cards, formula/calc blocks, CI rail, decision matrix, tooltips,
 * watermarks). They were hoisted out of the 365KB calculator file to keep the
 * orchestrator focused on math + state. DESIGN.md §3 still applies: none of
 * these may render raw <h1>-<h3> — use <Heading> (see eslint.config.js).
 */
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { InlineMath, BlockMath } from 'react-katex';
import {
  Award,
  BookOpen,
  CheckCircle,
  XCircle,
  Info,
  ChevronDown,
} from 'lucide-react';
import {
  ReadingFormulaBlock as SharedReadingFormulaBlock,
  ReadingCalcBlock as SharedReadingCalcBlock,
  ResultBlock,
  Disclosure,
  HandwrittenNote,
  Heading,
} from '../ui';
import { AnimatedDetails } from '../ui/CustomComponents';
import { inverseNormalCDF, studentTPPF } from '../../lib/statistics/math';

type TailType = 'right' | 'left' | 'two-tailed';

const STEP_BLOCK_WIDTH_CLASS = 'w-full max-w-[65rem] mx-auto';

export function StepNumberBadge({ value }: { value: number | string }) {
    return (
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 text-sm font-bold text-[var(--color-primary)]">
            {value}
        </span>
    );
}

export function CalculationStepCard({
    step,
    title,
    intro,
    note,
    children,
    className = '',
}: {
    step: number | string;
    title: React.ReactNode;
    intro?: React.ReactNode;
    note?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section
            className={`${STEP_BLOCK_WIDTH_CLASS} rounded-[var(--rounded-xl)] border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/6 px-4 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] sm:px-6 sm:py-6 ${className}`}
            dir="rtl"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 text-right">
                    <h4 className="text-lg font-bold text-[var(--color-text-primary)] sm:text-xl">{title}</h4>
                    {intro ? (
                        <div className="text-sm leading-relaxed text-[var(--color-text-secondary)] sm:text-base">
                            {intro}
                        </div>
                    ) : null}
                </div>
                <StepNumberBadge value={step} />
            </div>
            <div className="mt-4 space-y-3">{children}</div>
            {note ? (
                <div className="mt-4 border-t border-[var(--color-border)]/70 pt-4 text-right text-sm leading-relaxed text-[var(--color-text-primary)] sm:text-base">
                    {note}
                </div>
            ) : null}
        </section>
    );
}

// FormulaBlock: Raw/general formula with symbolic variables
export function FormulaBlock({
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
        <SharedReadingFormulaBlock
            contentWidthClassName={STEP_BLOCK_WIDTH_CLASS}
            formulaName={formulaName}
            translation={translation}
            wrapperClassName={className}
        >
            {children}
        </SharedReadingFormulaBlock>
    );
}

// CalcBlock: Calculation with actual substituted values
export function CalcBlock({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <SharedReadingCalcBlock contentWidthClassName={STEP_BLOCK_WIDTH_CLASS} wrapperClassName={className}>
            {children}
        </SharedReadingCalcBlock>
    );
}

export function ResultSummaryCard({
    title,
    subtitle,
    math,
    visual,
}: {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    math: string;
    visual?: React.ReactNode;
}) {
    return (
        <section className="rounded-[var(--rounded-xl)] border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/6 px-4 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] sm:px-6 sm:py-6">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 text-right">
                    <h4 className="text-lg font-bold text-[var(--color-text-primary)] sm:text-xl">{title}</h4>
                </div>
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <Award size={18} />
                </div>
            </div>
            <div className="mt-4">
                <ResultBlock className="py-0">
                    <div className="text-center" dir="ltr">
                        <BlockMath math={math} />
                    </div>
                </ResultBlock>
            </div>
            {subtitle ? (
                <HandwrittenNote className="mt-4 text-lg sm:text-xl">
                    {subtitle}
                </HandwrittenNote>
            ) : null}
            {visual ? <div className="mt-5">{visual}</div> : null}
        </section>
    );
}

export function PowerStepCard({
    step,
    title,
    description,
    formula,
    application,
    note,
}: {
    step: string;
    title: React.ReactNode;
    description: React.ReactNode;
    formula: string | string[];
    application?: string | string[];
    note?: React.ReactNode;
}) {
    const formulas = Array.isArray(formula) ? formula : [formula];
    const applications = application ? (Array.isArray(application) ? application : [application]) : [];
    const stepNumber = step.replace(/\D+/g, '') || step;

    return (
        <AnimatedDetails defaultOpen className="group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm [&_summary::-webkit-details-marker]:hidden">
            <summary className="p-4 sm:p-5 flex items-center justify-between cursor-pointer list-none hover:bg-[var(--color-surface)]/50 transition-colors rounded-lg border-b border-transparent group-[.is-open]:border-[var(--color-border)]">
                <div className="flex items-center gap-3 font-extrabold text-[var(--color-primary)]">
                    <span className="w-9 h-9 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-base font-semibold flex items-center justify-center border border-[var(--color-primary)]/50 shrink-0">
                        {stepNumber}
                    </span>
                    <Heading level="subsection" className="text-xl sm:text-2xl font-semibold text-[var(--color-text-primary)]">{title}</Heading>
                </div>
                <div className="text-[var(--color-text-secondary)] group-[.is-open]:rotate-180 transition-transform duration-300">
                    <ChevronDown size={24} />
                </div>
            </summary>
            <div className="p-5 sm:p-6 space-y-4">
                <div className="space-y-3 text-right">
                    <p className="text-base sm:text-lg leading-relaxed text-[var(--color-text-secondary)]">
                        {description}
                    </p>
                </div>

                <FormulaBlock className="my-0">
                    {formulas.map((entry) => (
                        <BlockMath key={entry} math={entry} />
                    ))}
                </FormulaBlock>

                {applications.length ? (
                    <CalcBlock className="my-0">
                        {applications.map((entry) => (
                            <BlockMath key={entry} math={entry} />
                        ))}
                    </CalcBlock>
                ) : null}

                {note ? (
                    <HandwrittenNote className="text-lg sm:text-xl">
                        {note}
                    </HandwrittenNote>
                ) : null}
            </div>
        </AnimatedDetails>
    );
}

export function ConfidenceIntervalRail({
    lower,
    mean,
    upper,
}: {
    lower: number;
    mean: number;
    upper: number;
}) {
    const width = Math.max(upper - lower, 1e-9);
    const domainMin = lower - width * 0.35;
    const domainMax = upper + width * 0.35;
    const domainSpan = Math.max(domainMax - domainMin, 1e-9);
    const toPercent = (value: number) => ((value - domainMin) / domainSpan) * 100;
    const lowerPercent = toPercent(lower);
    const upperPercent = toPercent(upper);
    const meanPercent = toPercent(mean);
    const intervalPercent = Math.max(upperPercent - lowerPercent, 0);

    return (
        <div className="rounded-[var(--rounded-lg)] border border-[var(--color-border)]/70 bg-[var(--color-surface)]/80 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 text-right">
                <div>
                    <div className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                        הקטע המוזהב מייצג את <InlineMath math="CI" />, הנקודה במרכז היא <InlineMath math="\bar{X}" />.
                    </div>
                </div>
                <div className="rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                    <InlineMath math="L = B - A" />
                </div>
            </div>

            <div className="mt-5" dir="ltr">
                <div className="relative px-2 py-8">
                    <div className="absolute left-[12%] right-[12%] top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-[var(--color-border)]/80" />
                    <div
                        className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full border border-[var(--color-primary)]/45 bg-[var(--color-primary)]/18 shadow-[0_0_18px_rgba(212,168,67,0.22)]"
                        style={{ left: `${lowerPercent}%`, width: `${intervalPercent}%` }}
                    />
                    <div
                        className="absolute top-[calc(50%-1.1rem)] h-[2px] rounded-full bg-[var(--color-primary)]/80"
                        style={{ left: `${lowerPercent}%`, width: `${intervalPercent}%` }}
                    />
                    <div
                        className="absolute top-[calc(50%-1.55rem)] h-3 w-[2px] rounded-full bg-[var(--color-primary)]/80"
                        style={{ left: `${lowerPercent}%` }}
                    />
                    <div
                        className="absolute top-[calc(50%-1.55rem)] h-3 w-[2px] rounded-full bg-[var(--color-primary)]/80"
                        style={{ left: `${upperPercent}%` }}
                    />
                    <div
                        className="absolute top-[calc(50%-1.65rem)] -translate-x-1/2 rounded-full bg-[var(--color-surface)]/95 px-2 py-0.5 text-mono-xs font-bold uppercase tracking-[0.28em] text-[var(--color-primary)]/90"
                        style={{ left: `${(lowerPercent + upperPercent) / 2}%` }}
                    >
                        CI
                    </div>
                    <div
                        className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--color-accent-cobalt)] bg-[var(--color-accent-cobalt)] shadow-[0_0_0_4px_rgba(78,205,196,0.12)]"
                        style={{ left: `${meanPercent}%` }}
                    />
                    <div
                        className="absolute top-[calc(50%+0.95rem)] h-5 w-[2px] -translate-x-1/2 rounded-full bg-[var(--color-primary)]/70"
                        style={{ left: `${lowerPercent}%` }}
                    />
                    <div
                        className="absolute top-[calc(50%+0.95rem)] h-5 w-[2px] -translate-x-1/2 rounded-full bg-[var(--color-accent-cobalt)]/70"
                        style={{ left: `${meanPercent}%` }}
                    />
                    <div
                        className="absolute top-[calc(50%+0.95rem)] h-5 w-[2px] -translate-x-1/2 rounded-full bg-[var(--color-primary)]/70"
                        style={{ left: `${upperPercent}%` }}
                    />
                </div>

                <div className="mt-2 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-[var(--rounded-md)] border border-[var(--color-border)]/70 bg-[var(--color-surface-raised)]/80 px-2 py-2">
                        <div className="text-[var(--color-text-primary)]" dir="ltr">
                            <InlineMath math={`A = ${lower.toFixed(4)}`} />
                        </div>
                    </div>
                    <div className="rounded-[var(--rounded-md)] border border-[var(--color-accent-cobalt)]/35 bg-[var(--color-accent-cobalt)]/10 px-2 py-2">
                        <div className="text-[var(--color-text-primary)]" dir="ltr">
                            <InlineMath math={`\\bar{X} = ${mean.toFixed(4)}`} />
                        </div>
                    </div>
                    <div className="rounded-[var(--rounded-md)] border border-[var(--color-border)]/70 bg-[var(--color-surface-raised)]/80 px-2 py-2">
                        <div className="text-[var(--color-text-primary)]" dir="ltr">
                            <InlineMath math={`B = ${upper.toFixed(4)}`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TheoryCard({
    title,
    intro,
    children,
    icon,
    className = '',
}: {
    title: React.ReactNode;
    intro?: React.ReactNode;
    children: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={`${STEP_BLOCK_WIDTH_CLASS} rounded-[var(--rounded-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)]/75 px-4 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] sm:px-6 sm:py-6 ${className}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 text-right">
                    <h4 className="text-lg font-bold text-[var(--color-text-primary)] sm:text-xl">{title}</h4>
                    {intro ? (
                        <div className="text-sm leading-relaxed text-[var(--color-text-secondary)] sm:text-base">
                            {intro}
                        </div>
                    ) : null}
                </div>
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-primary)]/35 bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    {icon ?? <BookOpen size={18} />}
                </div>
            </div>
            <div className="mt-4 space-y-3">{children}</div>
        </section>
    );
}

interface ConfidenceIntervalFollowupsProps {
    ciAlpha: number;
    ciTailType: TailType;
    n: number;
    scale: number;
    scaleInput: string;
    scaleSymbol: '\\sigma' | 'S';
    currentWidth: number;
    populationVarianceKnown: boolean;
}

export function ConfidenceIntervalFollowups({
    ciAlpha,
    ciTailType,
    n,
    scale,
    scaleInput,
    scaleSymbol,
    currentWidth,
    populationVarianceKnown,
}: ConfidenceIntervalFollowupsProps) {
    if (ciTailType !== 'two-tailed') return null;

    const halfWidth = currentWidth / 2;
    const referenceSampleSize = 100;
    const comparisonConfidence = 0.99;
    const targetWidth = 0.15;

    const getTwoSidedCritical = (sampleSize: number, alphaValue: number) => {
        const usesZ = populationVarianceKnown || sampleSize >= 30;
        const df = Math.max(1, sampleSize - 1);
        return {
            usesZ,
            df,
            value: usesZ
                ? inverseNormalCDF(1 - alphaValue / 2)
                : studentTPPF(1 - alphaValue / 2, df),
        };
    };

    const sampleSizeScenario = getTwoSidedCritical(referenceSampleSize, ciAlpha);
    const sampleSizeWidth = 2 * sampleSizeScenario.value * scale / Math.sqrt(referenceSampleSize);
    const sampleSizeRelation = sampleSizeWidth > currentWidth ? 'יגדל' : sampleSizeWidth < currentWidth ? 'יקטן' : 'יישאר ללא שינוי';

    const confidenceAlpha = 1 - comparisonConfidence;
    const confidenceScenario = getTwoSidedCritical(n, confidenceAlpha);
    const confidenceWidth = 2 * confidenceScenario.value * scale / Math.sqrt(n);
    const confidenceSymbol = confidenceScenario.usesZ
        ? String.raw`z_{0.995}`
        : String.raw`t_{${confidenceScenario.df}, 0.995}`;

    const planningCritical = inverseNormalCDF(1 - 0.05 / 2);
    const minNReal = (2 * planningCritical * scale / targetWidth) ** 2;
    const minNRounded = Math.ceil(minNReal);

    return (
        <div className="mt-8 space-y-4">
            <div className="text-right">
                <h4 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
                    חקירת רווח סמך <span className="text-[var(--color-text-secondary)]"><InlineMath math="(CI,\;L,\;d)" /></span>
                </h4>
            </div>

            <Disclosure
                title="מהו אורך רווח הסמך?"
                icon={<StepNumberBadge value={1} />}
                accentOnOpen="brass"
                className={STEP_BLOCK_WIDTH_CLASS}
                watermark="L"
            >
                <FormulaBlock formulaName="אורך רווח הסמך" translation="האורך הוא המרחק בין הגבול העליון לבין הגבול התחתון של הרווח.">
                    <BlockMath math={String.raw`L = B - A`} />
                </FormulaBlock>
                <CalcBlock>
                    <BlockMath math={String.raw`L = ${currentWidth.toFixed(4)}`} />
                </CalcBlock>
                <CalcBlock>
                    <BlockMath math={String.raw`L = 2 \cdot ${halfWidth.toFixed(4)} = ${currentWidth.toFixed(4)}`} />
                </CalcBlock>
            </Disclosure>

            <Disclosure
                title="מהי הסטייה המרבית?"
                icon={<StepNumberBadge value={2} />}
                accentOnOpen="brass"
                className={STEP_BLOCK_WIDTH_CLASS}
                watermark="d"
            >
                <FormulaBlock formulaName="חצי מאורך הרווח" translation="הסטייה המרבית היא המרחק מהממוצע אל אחד מגבולות רווח הסמך.">
                    <BlockMath math={String.raw`d = \frac{L}{2}`} />
                </FormulaBlock>
                <CalcBlock>
                    <BlockMath math={String.raw`d = \frac{${currentWidth.toFixed(4)}}{2} = ${halfWidth.toFixed(4)}`} />
                </CalcBlock>
                <p className="text-right text-[var(--color-text-primary)] leading-relaxed">
                    הסטייה המירבית <InlineMath math="(d)" /> היא בדיוק איבר ה"פלוס-מינוס" סביב <InlineMath math="\bar{X}" />, ולכן כאן היא <InlineMath math={halfWidth.toFixed(4)} /> לכל צד.
                </p>
            </Disclosure>

            <Disclosure
                title={`איך ישתנה אורך הרווח אם ניקח מדגם של ${referenceSampleSize}?`}
                icon={<StepNumberBadge value={3} />}
                accentOnOpen="brass"
                className={STEP_BLOCK_WIDTH_CLASS}
                watermark="n"
            >
                <FormulaBlock formulaName="אורך הרווח לפי גודל המדגם" translation="כאשר מחליפים את גודל המדגם, אותה נוסחת אורך נשארת בתוקף ורק n משתנה במכנה.">
                    <BlockMath math={String.raw`L_{new} = 2 \cdot c \cdot \frac{${scaleSymbol}}{\sqrt{n_{new}}}`} />
                </FormulaBlock>
                <p className="text-right text-[var(--color-text-primary)] leading-relaxed">
                    כאן אנחנו שומרים על אותו פיזור נתון, כלומר על <InlineMath math={`${scaleSymbol} = ${scaleInput}`} />, ורק מחליפים את גודל המדגם.
                </p>
                <CalcBlock>
                    <BlockMath math={String.raw`L_{new} = 2 \cdot ${sampleSizeScenario.value.toFixed(4)} \cdot \frac{${scaleInput}}{\sqrt{${referenceSampleSize}}} = ${sampleSizeWidth.toFixed(4)}`} />
                </CalcBlock>
                <p className="text-right text-[var(--color-text-primary)] leading-relaxed">
                    במקרה הזה אורך הרווח <strong>{sampleSizeRelation}</strong> מ-<InlineMath math={currentWidth.toFixed(4)} /> ל-<InlineMath math={sampleSizeWidth.toFixed(4)} />.
                </p>
                <p className="text-right text-[var(--color-text-primary)] leading-relaxed">
                    הסיבה: כאשר <InlineMath math="n" /> גדל, המכנה <InlineMath math="\sqrt{n}" /> גדל גם הוא, ולכן כל הביטוי נהיה קטן יותר והרווח נעשה צר יותר.
                </p>
            </Disclosure>

            <Disclosure
                title="איך ישתנה אורך הרווח אם נגדיל את רמת הסמך ל-99%?"
                icon={<StepNumberBadge value={4} />}
                accentOnOpen="brass"
                className={STEP_BLOCK_WIDTH_CLASS}
                watermark="99%"
            >
                <FormulaBlock formulaName="אורך הרווח ברמת סמך חדשה" translation="כאשר מעלים את רמת הסמך, מחליפים את הערך הקריטי בנוסחת האורך ומקבלים רווח חדש.">
                    <BlockMath math={String.raw`L = 2 \cdot c_{new} \cdot \frac{${scaleSymbol}}{\sqrt{n}}`} />
                </FormulaBlock>
                <p className="text-right text-[var(--color-text-primary)] leading-relaxed">
                    רמת סמך גבוהה יותר מחייבת ערך קריטי גדול יותר, ולכן המרווח נהיה רחב יותר.
                </p>
                <CalcBlock>
                    <BlockMath math={String.raw`1-\alpha = 0.99 \Rightarrow \alpha = 0.01 \Rightarrow \frac{\alpha}{2} = 0.005`} />
                </CalcBlock>
                <CalcBlock>
                    <BlockMath math={String.raw`${confidenceSymbol} = ${confidenceScenario.value.toFixed(4)}`} />
                </CalcBlock>
                <CalcBlock>
                    <BlockMath math={String.raw`L = 2 \cdot ${confidenceScenario.value.toFixed(4)} \cdot \frac{${scaleInput}}{\sqrt{${n}}} = ${confidenceWidth.toFixed(4)}`} />
                </CalcBlock>
                <p className="text-right text-[var(--color-text-primary)] leading-relaxed">
                    לכן האורך יגדל מ-<InlineMath math={currentWidth.toFixed(4)} /> ל-<InlineMath math={confidenceWidth.toFixed(4)} />.
                </p>
                <p className="text-right text-[var(--color-text-primary)] leading-relaxed">
                    כלומר, ככל שרוצים להיות בטוחים יותר, נדרש ערך קריטי גדול יותר ולכן גם רווח הסמך מתרחב.
                </p>
            </Disclosure>

            <Disclosure
                title={`מהו גודל המדגם המינימלי כדי שאורך רווח הסמך ברמת 95% לא יעלה על ${targetWidth}?`}
                icon={<StepNumberBadge value={5} />}
                accentOnOpen="brass"
                className={STEP_BLOCK_WIDTH_CLASS}
                watermark="n?"
            >
                <FormulaBlock formulaName="נוסחת תכנון מדגם" translation="בתכנון מדגם מציבים דרישה על אורך רווח הסמך, ואז פותרים את האי-שוויון לפי n.">
                    <BlockMath math={String.raw`L \le L_{max} \Rightarrow 2 \cdot z_{0.975} \cdot \frac{S}{\sqrt{n}} \le L_{max}`} />
                </FormulaBlock>
                <p className="text-right text-[var(--color-text-primary)] leading-relaxed">
                    כאן פותרים בעיית תכנון מדגם. אנחנו דורשים מראש שאורך הרווח יהיה לכל היותר <InlineMath math={targetWidth.toString()} />.
                </p>
                <p className="text-right text-[var(--color-text-primary)] leading-relaxed">
                    אם שונות האוכלוסייה אינה ידועה אך עובדים עם <InlineMath math="S" />, אז בשלב התכנון משתמשים באותו אומדן פיזור נתון. במקרה שנרצה דיוק גבוה במיוחד, גודל המדגם הנדרש יוצא גדול, ולכן מקובל להשתמש כאן בקירוב <InlineMath math="Z" />.
                </p>
                <CalcBlock>
                    <BlockMath math={String.raw`L = 2 \cdot z_{0.975} \cdot \frac{${scaleSymbol}}{\sqrt{n}} \le ${targetWidth}`} />
                </CalcBlock>
                <CalcBlock>
                    <BlockMath math={String.raw`2 \cdot ${planningCritical.toFixed(2)} \cdot \frac{${scaleInput}}{\sqrt{n}} \le ${targetWidth}`} />
                </CalcBlock>
                <CalcBlock>
                    <BlockMath math={String.raw`\sqrt{n} \ge \frac{${(2 * planningCritical * scale).toFixed(4)}}{${targetWidth}} \Rightarrow \sqrt{n} \ge ${Math.sqrt(minNReal).toFixed(4)}`} />
                </CalcBlock>
                <CalcBlock>
                    <BlockMath math={String.raw`n \ge ${minNReal.toFixed(2)}`} />
                </CalcBlock>
                <p className="text-right text-[var(--color-text-primary)] leading-relaxed">
                    מאחר שגודל מדגם חייב להיות שלם, מעגלים כלפי מעלה ומקבלים <strong>תשובה: <InlineMath math={`n = ${minNRounded}`} /></strong>.
                </p>
                <p className="text-right text-[var(--color-text-primary)] leading-relaxed">
                    זה בדיוק סוג תרגיל שבו לא מחשבים רווח סמך קיים, אלא שואלים מראש איזה מדגם צריך כדי להגיע לדיוק הרצוי.
                </p>
            </Disclosure>
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


export function DecisionMatrix({ isValid, stats, alpha, calculatePower }: DecisionMatrixProps) {
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

export const InputTooltip: React.FC<InputTooltipProps> = ({ content, children, className = "", tooltipClassName = "w-52" }) => {
    const [canPortal, setCanPortal] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const triggerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setCanPortal(true);
    }, []);

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
            {isVisible && canPortal && typeof document !== 'undefined' && document.body
                ? createPortal(
                    <AnimatePresence>
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
                    </AnimatePresence>,
                    document.body
                )
                : null}
        </div>
    );
};

interface FloatingFieldErrorProps {
    message?: string;
    offsetY?: number;
    bubbleClassName?: string;
}

export const FloatingFieldError: React.FC<FloatingFieldErrorProps> = ({
    message,
    offsetY = 8,
    bubbleClassName = "px-2.5 py-1",
}) => {
    const [canPortal, setCanPortal] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const anchorRef = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
        setCanPortal(true);
    }, []);

    useEffect(() => {
        if (!message) return;

        const updatePosition = () => {
            if (!anchorRef.current) return;

            const rect = anchorRef.current.getBoundingClientRect();
            setPosition({
                top: rect.top + offsetY,
                left: rect.left,
            });
        };

        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [message, offsetY]);

    return (
        <>
            <span
                ref={anchorRef}
                aria-hidden="true"
                className="pointer-events-none absolute top-full left-1/2 h-0 w-0 -translate-x-1/2"
            />
            {message && canPortal && typeof document !== 'undefined' && document.body
                ? createPortal(
                    <AnimatePresence>
                        {message && (
                            <div
                                className="pointer-events-none fixed z-[9999]"
                                style={{ top: position.top, left: position.left, transform: 'translateX(-50%)' }}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className={`relative flex items-center justify-center whitespace-nowrap rounded bg-[var(--color-error)] text-xs font-bold text-white shadow-lg ${bubbleClassName}`}
                                >
                                    <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[var(--color-error)]" />
                                    <span className="relative z-10">{message}</span>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>,
                    document.body
                )
                : null}
        </>
    );
};

interface CellWatermarkProps {
    math: string;
    colorClass: string;
}

export const CellWatermark: React.FC<CellWatermarkProps> = ({ math, colorClass }) => {
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

interface HypothesisTestingCalculatorProps {
    onStartLocalTour?: () => void;
}

