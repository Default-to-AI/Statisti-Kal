import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { InlineMath } from 'react-katex';
import { Card } from './Card';
import { Badge } from './Badge';
import { InsightBlock } from './FormulaBlock';

const CONTENT_WIDTH_CLASS = 'w-full max-w-[70rem] mx-auto';

export interface MCOption {
  label: string;
  /** KaTeX expression for the option (use when the answer is mathematical). */
  latex?: string;
  /** Plain-text answer (use for Hebrew/prose options; renders without math mode). */
  text?: string;
  correct?: boolean;
}

export interface MCQuestionCardProps {
  id: string;
  /** When rendered inside a titled accordion, pass empty to hide the duplicate prompt header. */
  prompt?: string;
  options: MCOption[];
  rationale?: React.ReactNode;
}

export function MCQuestionCard({ id, prompt, options, rationale }: MCQuestionCardProps): React.ReactElement {
  const correctOption = options.find((opt) => opt.correct);

  return (
    <Card variant="default" className={CONTENT_WIDTH_CLASS} id={id}>
      {prompt ? (
        <div className="border-b border-[var(--color-border)] px-4 py-3 sm:px-5">
          <p className="text-right text-base font-semibold leading-relaxed text-[var(--color-text-primary)] sm:text-lg">
            {prompt}
          </p>
        </div>
      ) : null}

      <div className="divide-y divide-[var(--color-border)]">
        {options.map((opt) => {
          const isCorrect = Boolean(opt.correct);
          return (
            <div
              key={opt.label}
              className={`flex items-center gap-3 px-4 py-3 text-right transition-colors sm:px-5 ${
                isCorrect ? 'bg-[var(--color-success)]/8' : 'bg-transparent'
              }`}
            >
              <span
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-sm font-bold ${
                  isCorrect
                    ? 'border-[var(--color-success)]/40 bg-[var(--color-success)]/12 text-[var(--color-success)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)]'
                }`}
              >
                {opt.label}
              </span>
              <span className="flex-1 text-right text-base text-[var(--color-text-primary)]">
                {opt.text ? (
                  <span className="inline-block">{opt.text}</span>
                ) : (
                  <InlineMath math={opt.latex ?? ''} />
                )}
              </span>
              {isCorrect ? (
                <Badge variant="success" className="shrink-0 gap-1">
                  <CheckCircle2 size={14} /> תשובה נכונה
                </Badge>
              ) : null}
            </div>
          );
        })}
      </div>

      {rationale ? (
        <div className="border-t border-[var(--color-border)] px-4 py-3 sm:px-5">
          <InsightBlock>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
              <div className="text-right text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {rationale}
              </div>
            </div>
          </InsightBlock>
        </div>
      ) : null}
    </Card>
  );
}

export default MCQuestionCard;
