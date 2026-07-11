/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle, XCircle, Scale, Target } from 'lucide-react';
import { InlineMath } from 'react-katex';
import type { UnifiedResult, Tail } from '../lib/statistics/hypothesis';
import { HandwrittenNote } from './ui';

export interface HypothesisTestDisplayProps {
  result: UnifiedResult;
  alpha: number;
  sample: number;
  nullMean: number;
  tail: Tail;
  varianceKnown: boolean;
  statisticSymbol: string;
  parameterSymbol: string;
}

function formatNumber(value: number, digits = 4): string {
  if (!Number.isFinite(value)) return '—';
  return `${value}`.includes('.') ? value.toFixed(digits) : value.toFixed(0);
}

function formatCritical(critical: UnifiedResult['critical']): string {
  if (Array.isArray(critical)) {
    return `${formatNumber(critical[0])} / ${formatNumber(critical[1])}`;
  }
  return formatNumber(critical);
}

function formatPValue(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return value < 0.0001 ? '< 0.0001' : value.toFixed(4);
}

function criticalMath(statName: string, critical: UnifiedResult['critical']): string {
  if (Array.isArray(critical)) {
    return `${statName} \\le ${formatNumber(critical[0])} \\; \\text{or} \\; ${statName} \\ge ${formatNumber(critical[1])}`;
  }
  return `${statName} = ${formatNumber(critical)}`;
}

function criticalRuleMath(statName: string, critical: UnifiedResult['critical'], tail: Tail): string {
  if (Array.isArray(critical)) {
    return `${statName} \\le ${formatNumber(critical[0])} \\; \\text{or} \\; ${statName} \\ge ${formatNumber(critical[1])}`;
  }
  return `${statName} ${tail === 'left' ? '\\le' : '\\ge'} ${formatNumber(critical)}`;
}

function pValueRuleMath(isReject: boolean): string {
  return `\\text{P-value} ${isReject ? '<' : '\\ge'} \\alpha`;
}

function pValueMath(value: number): string {
  if (!Number.isFinite(value)) return '\\text{P-value} = \\text{—}';
  return value < 0.0001 ? '\\text{P-value} < 0.0001' : `\\text{P-value} = ${value.toFixed(4)}`;
}

function tailLabel(tail: Tail): string {
  if (tail === 'right') return 'ימני';
  if (tail === 'left') return 'שמאלי';
  return 'דו-צדדי';
}

export default function HypothesisTestDisplay({
  result,
  alpha,
  sample,
  nullMean,
  tail,
  varianceKnown,
  statisticSymbol,
  parameterSymbol,
}: HypothesisTestDisplayProps) {
  const isReject = result.decisionLabel === 'reject';
  const decisionText = isReject ? 'דוחים את השערת האפס' : 'אין לדחות את השערת האפס';
  const DecisionIcon = isReject ? CheckCircle : XCircle;
  const statName = varianceKnown ? 'Z' : 't';
  const pRule = pValueRuleMath(isReject);
  const decisionToneClass = isReject
    ? 'border-[var(--color-success)]/45 shadow-[0_0_24px_color-mix(in_srgb,var(--color-success)_18%,transparent)] pulse-success'
    : 'border-[var(--color-error)]/45 shadow-[0_0_24px_color-mix(in_srgb,var(--color-error)_18%,transparent)] pulse-error';
  const headerToneClass = isReject
    ? 'border-[var(--color-success)]/30 bg-[var(--color-success)]/7'
    : 'border-[var(--color-error)]/30 bg-[var(--color-error)]/7';
  const cardToneClass = isReject
    ? 'border-[var(--color-success)]/35 shadow-[0_0_16px_color-mix(in_srgb,var(--color-success)_12%,transparent)]'
    : 'border-[var(--color-error)]/35 shadow-[0_0_16px_color-mix(in_srgb,var(--color-error)_12%,transparent)]';

  return (
    <section
      dir="rtl"
      aria-labelledby="hypothesis-unified-decision-title"
      className={`overflow-hidden rounded-lg border bg-[var(--color-surface-raised)] shadow-md ${decisionToneClass}`}
    >
      <header className={`flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between ${headerToneClass}`}>
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${isReject ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]' : 'bg-[var(--color-error)]/15 text-[var(--color-error)]'}`}>
            <DecisionIcon size={24} aria-hidden="true" />
          </div>
          <div>
            <h3 id="hypothesis-unified-decision-title" className="m-0 text-xl sm:text-2xl font-semibold text-[var(--color-text-primary)]">
              החלטה מאוחדת
            </h3>
            <p className="mt-1 text-sm font-bold text-[var(--color-text-secondary)]">
              בדיקה לפי ערך קריטי ו-P-value באותו מהלך החלטה
            </p>
          </div>
        </div>

        <div
          data-decision={result.decisionLabel}
          className={`inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm sm:text-base font-semibold ${isReject ? 'border-[var(--color-success)]/50 bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'border-[var(--color-error)]/50 bg-[var(--color-error)]/10 text-[var(--color-error)]'}`}
        >
          {decisionText}
        </div>
      </header>

      <div className="grid gap-4 p-5 lg:grid-cols-3">
        <article className={`rounded-md border bg-[var(--color-surface)] p-4 ${cardToneClass}`}>
          <div className="mb-3 flex items-center gap-2 font-semibold text-[var(--color-accent-cobalt)]">
            <Target size={18} aria-hidden="true" />
            <span>סטטיסטי המבחן</span>
          </div>
          <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            <p>
              המדגם: <span dir="ltr" className="inline-block text-[var(--color-text-primary)]"><InlineMath math={`${parameterSymbol} = ${formatNumber(sample, 3)}`} /></span>
            </p>
            <p>
              השערת האפס: <span dir="ltr" className="inline-block text-[var(--color-text-primary)]"><InlineMath math={`${parameterSymbol} = ${formatNumber(nullMean, 3)}`} /></span>
            </p>
            <p>
              סטטיסטי: <span dir="ltr" className="inline-block text-[var(--color-text-primary)]"><InlineMath math={`${statName} = ${formatNumber(result.stat)}`} /></span>
            </p>
          </div>
        </article>

        <article className={`rounded-md border bg-[var(--color-surface)] p-4 ${cardToneClass}`}>
          <div className="mb-3 flex items-center gap-2 font-semibold text-[var(--color-primary)]">
            <Scale size={18} aria-hidden="true" />
            <span>כלל הערך הקריטי</span>
          </div>
          <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            <p>מבחן {tailLabel(tail)} ברמת מובהקות <span dir="ltr" className="inline-block text-[var(--color-text-primary)]"><InlineMath math={`\\alpha = ${alpha}`} /></span></p>
            <p>ערך קריטי: <span dir="ltr" className="inline-block text-[var(--color-text-primary)]"><InlineMath math={criticalMath(statName, result.critical)} /></span></p>
            <p>כלל החלטה: <span dir="ltr" className="inline-block text-[var(--color-text-primary)]"><InlineMath math={criticalRuleMath(statName, result.critical, tail)} /></span></p>
          </div>
        </article>

        <article className={`rounded-md border bg-[var(--color-surface)] p-4 ${cardToneClass}`}>
          <div className="mb-3 flex items-center gap-2 font-semibold text-[var(--chart-2)]">
            <CheckCircle size={18} aria-hidden="true" />
            <span>כלל P-value</span>
          </div>
          <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            <p>P-value: <span dir="ltr" className="inline-block text-[var(--color-text-primary)]"><InlineMath math={pValueMath(result.pValue)} /></span></p>
            <p>כלל החלטה: <span dir="ltr" className="inline-block text-[var(--color-text-primary)]"><InlineMath math={pRule} /></span></p>
            <p className="font-bold text-[var(--color-text-primary)]">שתי הגישות מובילות לאותה החלטה.</p>
          </div>
        </article>
      </div>

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-[var(--color-text-primary)]">
        <HandwrittenNote>
          מאחר שסטטיסטי המבחן הוא <span dir="ltr" className="inline-block"><InlineMath math={`${statName} = ${formatNumber(result.stat)}`} /></span>
          {' '}והמובהקות היא <span dir="ltr" className="inline-block"><InlineMath math={pValueMath(result.pValue)} /></span>,
          {' '}ההחלטה הסופית היא: <strong data-testid="unified-final-decision">{decisionText}</strong>.
        </HandwrittenNote>
      </footer>
    </section>
  );
}
