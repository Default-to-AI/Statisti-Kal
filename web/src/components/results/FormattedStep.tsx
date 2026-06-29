import { Award, BookOpen, Calculator } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';

export const FormattedStep: React.FC<{ text: string }> = ({ text }) => {
  const isResult = text.startsWith('תוצאה סופית:');
  const stepMatch = text.match(/^שלב\s+(\d+)\s*\|\s*(.*?)\s*\|\s*(.*)$/);
  const fallbackMatch = !stepMatch ? text.match(/^שלב\s+(\d+):\s*(.*)$/) : null;

  const isStepTitle = Boolean(stepMatch || fallbackMatch);
  const stepNumber = stepMatch?.[1] ?? fallbackMatch?.[1] ?? null;
  const stepTitle = stepMatch?.[2] ?? null;
  const normalizedText = stepMatch?.[3] ?? fallbackMatch?.[2] ?? text;

  const isPureMath = /^\[MATH\].*\[\/MATH\]$/.test(normalizedText.trim());
  const hasMathEquation = /\[MATH\].*=.*\[\/MATH\]/.test(normalizedText);
  const parts = normalizedText.split(/\[MATH\](.*?)\[\/MATH\]/g);
  const blockTone = isResult
    ? 'result'
    : (isPureMath || (!isStepTitle && hasMathEquation))
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
