import { Award, BookOpen, Calculator } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import { CalculationStepCard, FormulaBlock, CalcBlock } from '../calc-ui/HypothesisCalcUI';
import { ResultBlock } from '../ui';

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

  const renderContent = () => (
    <div className={`space-y-3 text-sm md:text-base leading-relaxed ${isResult ? 'font-bold text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const isOnlyMath = parts.length === 3 && parts[0] === '' && parts[2] === '';
          const hasFraction = part.includes('\\frac');
          const hasPercentage = part.includes('%') || part.includes('\\%');
          const hasEquals = part.includes('=');
          const shouldBeBlockPoint = (hasFraction || (isOnlyMath && hasEquals)) && !hasPercentage;

          if (blockTone === 'result' || shouldBeBlockPoint) {
            return (
              <div key={i} className="my-2" dir="ltr">
                {blockTone === 'result' ? (
                  <ResultBlock>
                    <BlockMath math={part} />
                  </ResultBlock>
                ) : blockTone === 'calculation' ? (
                  <CalcBlock>
                    <BlockMath math={part} />
                  </CalcBlock>
                ) : (
                  <FormulaBlock>
                    <BlockMath math={part} />
                  </FormulaBlock>
                )}
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
  );

  if (isStepTitle) {
    return (
      <CalculationStepCard step={stepNumber!} title={stepTitle ? stepTitle.trim() : `שלב ${stepNumber}`}>
        {renderContent()}
      </CalculationStepCard>
    );
  }

  if (blockTone === 'result') {
    return (
      <div className="mt-4">
        {renderContent()}
      </div>
    );
  }

  // Not a step title, just standalone content
  return (
    <div className="mb-4 text-[var(--color-text-primary)]">
      {renderContent()}
    </div>
  );
};
