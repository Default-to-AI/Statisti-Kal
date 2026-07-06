import React, { useState, useMemo } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { AnimatedDetails } from './ui/CustomComponents';
import { ParameterInputCell } from './calc-ui';
import { ReadingCalcBlock, ReadingFormulaBlock } from './ui';
import {
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const Z_SCORES = [-2.2, -1.8, -1.5, -1.1, -0.8, -0.4, 0, 0.3, 0.7, 1.2, 1.6, 1.9, 2.3];
const ERR_FACTORS = [0.6, -1.1, 0.3, -0.8, 1.2, -0.2, 0.0, -0.9, 0.7, -1.3, 0.4, 0.9, -0.5];

export default function LinearRegressionCalculator(): React.ReactElement {
  const [nStr, setNStr] = useState('8');
  const [xBarStr, setXBarStr] = useState('10');
  const [yBarStr, setYBarStr] = useState('20');
  const [sumXYStr, setSumXYStr] = useState('4000');
  const [sumX2Str, setSumX2Str] = useState('1600');
  const [sumY2Str, setSumY2Str] = useState('16000');

  const n = parseFloat(nStr);
  const xBar = parseFloat(xBarStr);
  const yBar = parseFloat(yBarStr);
  const sumXY = parseFloat(sumXYStr);
  const sumX2 = parseFloat(sumX2Str);
  const sumY2 = parseFloat(sumY2Str);

  const isValid = !isNaN(n) && !isNaN(xBar) && !isNaN(yBar) && !isNaN(sumXY) && !isNaN(sumX2) && !isNaN(sumY2) && n > 0;

  const vX = isValid ? (sumX2 / n) - Math.pow(xBar, 2) : NaN;
  const vY = isValid ? (sumY2 / n) - Math.pow(yBar, 2) : NaN;
  const sdX = isValid && vX >= 0 ? Math.sqrt(vX) : NaN;
  const sdY = isValid && vY >= 0 ? Math.sqrt(vY) : NaN;
  const covXY = isValid ? (sumXY / n) - (xBar * yBar) : NaN;
  const r = (isValid && sdX > 0 && sdY > 0) ? covXY / (sdX * sdY) : NaN;
  const b = (isValid && vX > 0) ? covXY / vX : NaN;
  const a = isValid && !isNaN(b) ? yBar - b * xBar : NaN;

  const formatNum = (num: number, decimals: number = 4) => isNaN(num) ? '-' : num.toFixed(decimals);

  const getInterpretation = (rValue: number) => {
    if (isNaN(rValue)) return '';
    const dir = rValue > 0 ? 'חיובי' : rValue < 0 ? 'שלילי' : 'אין קשר ליניארי';
    const abs = Math.abs(rValue);
    let strength = '';
    if (abs > 0.8) strength = 'חזק מאוד';
    else if (abs > 0.6) strength = 'חזק';
    else if (abs > 0.4) strength = 'בינוני';
    else if (abs > 0.2) strength = 'חלש';
    else strength = 'חלש מאוד עד אפסי';
    return `קשר ליניארי ${dir} ו${strength}`;
  };

  const chartData = useMemo(() => {
    if (!isValid || isNaN(r) || isNaN(b) || isNaN(a) || sdX === 0 || sdY === 0) return { scatter: [], line: [] };
    
    const errSd = sdY * Math.sqrt(Math.max(0, 1 - r * r));
    
    const scatter = Z_SCORES.map((z, i) => {
      const x = xBar + z * sdX;
      const predictedY = a + b * x;
      const error = ERR_FACTORS[i] * errSd;
      return {
        x: Number(x.toFixed(2)),
        y: Number((predictedY + error).toFixed(2))
      };
    });

    const xMin = xBar - 3 * sdX;
    const xMax = xBar + 3 * sdX;

    const line = [
      { x: Number(xMin.toFixed(2)), y: Number((a + b * xMin).toFixed(2)) },
      { x: Number(xMax.toFixed(2)), y: Number((a + b * xMax).toFixed(2)) }
    ];

    return { scatter, line };
  }, [isValid, r, b, a, sdX, sdY, xBar]);

  return (
    <div className="mx-auto w-full max-w-[70rem] space-y-8 pb-16 pt-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
            קשר ליניארי ורגרסיה
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--color-text-secondary)] sm:text-base">
            חישוב מקדם מתאם פירסון (r) ומשוואת קו רגרסיה (y = a + bx)
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6">
        {/* Data Entry Matrix */}
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3">
            <h2 data-toc id="regression-data-entry" className="text-body-base font-bold text-[var(--color-text-primary)]">
              אזור הזנת נתונים
            </h2>
          </div>
          <div className="overflow-x-auto" dir="rtl">
            <table className="w-full min-w-[600px] border-collapse">
              <tbody>
                <tr>
                  <ParameterInputCell
                    watermark="n"
                    colorClass="text-[var(--color-text-tertiary)]/10"
                    label={<span className="flex items-center gap-1.5 whitespace-nowrap">גודל המדגם: <InlineMath math="n" /></span>}
                    tooltip="מספר התצפיות במדגם או באוכלוסייה"
                    value={nStr}
                    onChange={setNStr}
                    error={isNaN(n) || n <= 0 ? 'חייב להיות חיובי' : ''}
                  />
                  <ParameterInputCell
                    watermark="\sum XY"
                    colorClass="text-[var(--color-primary)]/10"
                    label={<span className="flex items-center gap-1.5 whitespace-nowrap">סכום המכפלות: <InlineMath math="\sum x_i y_i" /></span>}
                    tooltip="סכום מכפלות התצפיות"
                    value={sumXYStr}
                    onChange={setSumXYStr}
                  />
                </tr>
                <tr>
                  <ParameterInputCell
                    watermark="\bar{X}"
                    colorClass="text-[var(--color-accent-cobalt)]/10"
                    label={<span className="flex items-center gap-1.5 whitespace-nowrap">ממוצע: <InlineMath math="\bar{x}" /></span>}
                    tooltip={<span>לפעמים יינתנו סכומי התצפיות <InlineMath math="\sum x_i" />, מהם ניתן לחלץ את הממוצע על ידי חלוקה ב-<InlineMath math="n" />.</span>}
                    value={xBarStr}
                    onChange={setXBarStr}
                  />
                  <ParameterInputCell
                    watermark="\sum X^2"
                    colorClass="text-[var(--color-accent-cobalt)]/10"
                    label={<span className="flex items-center gap-1.5 whitespace-nowrap">סכום הריבועים: <InlineMath math="\sum x_i^2" /></span>}
                    tooltip="סכום ריבועי התצפיות עבור המשתנה"
                    value={sumX2Str}
                    onChange={setSumX2Str}
                  />
                </tr>
                <tr>
                  <ParameterInputCell
                    watermark="\bar{Y}"
                    colorClass="text-[var(--color-warning)]/10"
                    label={<span className="flex items-center gap-1.5 whitespace-nowrap">ממוצע: <InlineMath math="\bar{y}" /></span>}
                    tooltip={<span>לפעמים יינתנו סכומי התצפיות <InlineMath math="\sum y_i" />, מהם ניתן לחלץ את הממוצע על ידי חלוקה ב-<InlineMath math="n" />.</span>}
                    value={yBarStr}
                    onChange={setYBarStr}
                  />
                  <ParameterInputCell
                    watermark="\sum Y^2"
                    colorClass="text-[var(--color-warning)]/10"
                    label={<span className="flex items-center gap-1.5 whitespace-nowrap">סכום הריבועים: <InlineMath math="\sum y_i^2" /></span>}
                    tooltip="סכום ריבועי התצפיות עבור המשתנה"
                    value={sumY2Str}
                    onChange={setSumY2Str}
                  />
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Steps Accordions */}
        <div className="mt-8 space-y-4">
          <AnimatedDetails tocId="regression-step-1" defaultOpen className="group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between p-4 outline-none transition-colors hover:bg-[var(--color-surface-raised-hover)] focus-visible:bg-[var(--color-surface-raised-hover)] sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 font-bold text-[var(--color-primary)]">
                  1
                </div>
                <h3 data-toc data-toc-label="שלב 1: חישוב שונויות וסטיות התקן" data-toc-target="regression-step-1" data-toc-open="regression-step-1" className="text-lg font-bold text-[var(--color-text-primary)]">חישוב שונויות וסטיות התקן</h3>
              </div>
              <svg className="h-5 w-5 shrink-0 text-[var(--color-text-secondary)] transition-transform duration-300 group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </summary>
            <div className="border-t border-[var(--color-border)] p-4 sm:p-5 space-y-6">
              <p className="text-body-base text-[var(--color-text-primary)] leading-relaxed mb-4">
                הנוסחה המקוצרת לשונות היא ממוצע הריבועים פחות ריבוע הממוצע:
              </p>
              <ReadingFormulaBlock
                formulaName="שונות משתנה X"
                translation="Variance of X"
              >
                <BlockMath math="V(X) = \frac{\sum x_i^2}{n} - (\bar{x})^2" />
              </ReadingFormulaBlock>

              <p className="text-body-base text-[var(--color-text-primary)] leading-relaxed mt-6 mb-4">
                נציב את הנתונים לתוך הנוסחה:
              </p>
              <ReadingCalcBlock>
                <BlockMath math={`V(X) = \\frac{${formatNum(sumX2, 0)}}{${formatNum(n, 0)}} - (${formatNum(xBar, 2)})^2 = ${formatNum(vX)}`} />
              </ReadingCalcBlock>

              <p className="text-body-base text-[var(--color-text-primary)] leading-relaxed mt-6 mb-4">
                סטיית התקן היא פשוט השורש הריבועי של השונות:
              </p>
              <ReadingCalcBlock>
                <BlockMath math={`\\sigma_X = \\sqrt{${formatNum(vX)}} = ${formatNum(sdX)}`} />
              </ReadingCalcBlock>

              <div className="mt-8 mb-8 border-t border-[var(--color-border)]" />

              <ReadingFormulaBlock
                formulaName="שונות משתנה Y"
                translation="Variance of Y"
              >
                <BlockMath math="V(Y) = \frac{\sum y_i^2}{n} - (\bar{y})^2" />
              </ReadingFormulaBlock>
              
              <p className="text-body-base text-[var(--color-text-primary)] leading-relaxed mt-6 mb-4">
                נציב את הנתונים לתוך הנוסחה:
              </p>
              <ReadingCalcBlock>
                <BlockMath math={`V(Y) = \\frac{${formatNum(sumY2, 0)}}{${formatNum(n, 0)}} - (${formatNum(yBar, 2)})^2 = ${formatNum(vY)}`} />
              </ReadingCalcBlock>

              <p className="text-body-base text-[var(--color-text-primary)] leading-relaxed mt-6 mb-4">
                סטיית התקן היא פשוט השורש הריבועי של השונות:
              </p>
              <ReadingCalcBlock>
                <BlockMath math={`\\sigma_Y = \\sqrt{${formatNum(vY)}} = ${formatNum(sdY)}`} />
              </ReadingCalcBlock>
            </div>
          </AnimatedDetails>

          <AnimatedDetails tocId="regression-step-2" defaultOpen className="group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between p-4 outline-none transition-colors hover:bg-[var(--color-surface-raised-hover)] focus-visible:bg-[var(--color-surface-raised-hover)] sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-cobalt)]/10 font-bold text-[var(--color-accent-cobalt)]">
                  2
                </div>
                <h3 data-toc data-toc-label="שלב 2: חישוב שונות משותפת" data-toc-target="regression-step-2" data-toc-open="regression-step-2" className="text-lg font-bold text-[var(--color-text-primary)]">חישוב שונות משותפת (Covariance)</h3>
              </div>
              <svg className="h-5 w-5 shrink-0 text-[var(--color-text-secondary)] transition-transform duration-300 group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </summary>
            <div className="border-t border-[var(--color-border)] p-4 sm:p-5 space-y-6">
              <p className="text-body-base text-[var(--color-text-primary)] leading-relaxed mb-4">
                סכום המכפלות משמש אך ורק למציאת מדד השונות המשותפת (<InlineMath math="Cov(X,Y)" />), שהוא הבסיס למדידת הקשר הקווי בין שני המשתנים. הנוסחה המקוצרת היא:
              </p>
              <ReadingFormulaBlock
                formulaName="שונות משותפת"
                translation="Covariance"
              >
                <BlockMath math="Cov(X,Y) = \frac{\sum x_i y_i}{n} - \bar{x} \cdot \bar{y}" />
              </ReadingFormulaBlock>
              <ReadingCalcBlock>
                <BlockMath math={`Cov(X,Y) = \\frac{${formatNum(sumXY, 0)}}{${formatNum(n, 0)}} - (${formatNum(xBar, 2)} \\cdot ${formatNum(yBar, 2)})`} />
                <BlockMath math={`Cov(X,Y) = ${formatNum(covXY)}`} />
              </ReadingCalcBlock>
            </div>
          </AnimatedDetails>

          <AnimatedDetails tocId="regression-step-3" defaultOpen className="group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between p-4 outline-none transition-colors hover:bg-[var(--color-surface-raised-hover)] focus-visible:bg-[var(--color-surface-raised-hover)] sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 font-bold text-[var(--color-primary)]">
                  3
                </div>
                <h3 data-toc data-toc-label="שלב 3: מקדם מתאם פירסון" data-toc-target="regression-step-3" data-toc-open="regression-step-3" className="text-lg font-bold text-[var(--color-text-primary)]">מקדם מתאם פירסון (r)</h3>
              </div>
              <svg className="h-5 w-5 shrink-0 text-[var(--color-text-secondary)] transition-transform duration-300 group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </summary>
            <div className="border-t border-[var(--color-border)] p-4 sm:p-5 space-y-6">
              <p className="text-body-base text-[var(--color-text-primary)] leading-relaxed mb-4">
                מקדם מתאם לינארי של פירסון (<InlineMath math="r" />): מודד את עוצמת וכיוון הקשר הלינארי (בין 1 למינוס 1).
              </p>
              <ReadingFormulaBlock
                formulaName="מקדם מתאם של פירסון"
                translation="Pearson Correlation Coefficient"
              >
                <BlockMath math="r = \frac{Cov(X,Y)}{\sigma_x \cdot \sigma_y}" />
              </ReadingFormulaBlock>
              <ReadingCalcBlock>
                <BlockMath math={`r = \\frac{${formatNum(covXY)}}{${formatNum(sdX)} \\cdot ${formatNum(sdY)}}`} />
                <BlockMath math={`r = ${formatNum(r, 4)}`} />
              </ReadingCalcBlock>
              {isValid && !isNaN(r) && (
                <div className="text-center font-bold text-[var(--color-text-primary)] mt-4 border border-[var(--color-border)] bg-[var(--color-surface)] py-3 rounded-md shadow-sm">
                  פירוש התוצאה: {getInterpretation(r)}
                </div>
              )}
            </div>
          </AnimatedDetails>

          <AnimatedDetails tocId="regression-step-4" defaultOpen className="group space-y-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-sm [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between p-4 outline-none transition-colors hover:bg-[var(--color-surface-raised-hover)] focus-visible:bg-[var(--color-surface-raised-hover)] sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-cobalt)]/10 font-bold text-[var(--color-accent-cobalt)]">
                  4
                </div>
                <h3 data-toc data-toc-label="שלב 4: קו רגרסיה וגרף" data-toc-target="regression-step-4" data-toc-open="regression-step-4" className="text-lg font-bold text-[var(--color-text-primary)]">משוואת קו רגרסיה וגרף</h3>
              </div>
              <svg className="h-5 w-5 shrink-0 text-[var(--color-text-secondary)] transition-transform duration-300 group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </summary>
            <div className="border-t border-[var(--color-border)] p-4 sm:p-5 space-y-8">
              <p className="text-body-base text-[var(--color-text-primary)] leading-relaxed mb-4">
                משוואת קו רגרסיה (<InlineMath math="\hat{y} = a + bx" />): מציאת השיפוע (<InlineMath math="b" />) למטרות ניבוי.
              </p>
              <ReadingFormulaBlock
                formulaName="מציאת שיפוע וחותך"
                translation="Slope and Intercept"
              >
                <BlockMath math="b = \frac{Cov(X,Y)}{V(X)}" />
                <BlockMath math="a = \bar{y} - b \bar{x}" />
              </ReadingFormulaBlock>
              
              <ReadingCalcBlock>
                <BlockMath math={`b = \\frac{${formatNum(covXY)}}{${formatNum(vX)}} = ${formatNum(b)}`} />
                <BlockMath math={`a = ${formatNum(yBar, 2)} - (${formatNum(b)}) \\cdot ${formatNum(xBar, 2)} = ${formatNum(a)}`} />
              </ReadingCalcBlock>

              <div className="text-center bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)]/30 rounded-xl p-6 shadow-sm">
                <h4 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider mb-3">משוואת קו הרגרסיה המלאה</h4>
                <div className="text-2xl sm:text-3xl text-[var(--color-text-primary)]" dir="ltr">
                  <InlineMath math={`\\hat{y} = ${formatNum(a)} ${b >= 0 ? '+' : ''} ${formatNum(b)}x`} />
                </div>
              </div>

              {chartData.line.length > 0 && (
                <div className="mt-8 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] p-4 shadow-sm" dir="ltr">
                  <h4 className="text-center font-bold text-[var(--color-text-primary)] mb-4" dir="rtl">
                    מגמת הרגרסיה <span className="font-normal text-sm text-[var(--color-text-secondary)]">(תצוגה מקורבת של הקשר, המבוססת על פיזור סינתטי המשמר את התכונות הסטטיסטיות)</span>
                  </h4>
                  <div className="h-64 sm:h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                        <XAxis 
                          type="number" 
                          dataKey="x" 
                          domain={['auto', 'auto']} 
                          tick={{ fill: 'var(--color-text-secondary)' }}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="y" 
                          domain={['auto', 'auto']} 
                          tick={{ fill: 'var(--color-text-secondary)' }}
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          contentStyle={{ backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)', direction: 'ltr' }}
                          formatter={(value: number) => value.toFixed(2)}
                        />
                        <Scatter name="Data" data={chartData.scatter} fill="var(--color-primary)" opacity={0.6} />
                        <Line 
                          data={chartData.line} 
                          type="linear" 
                          dataKey="y" 
                          stroke="var(--color-accent-cobalt)" 
                          strokeWidth={3} 
                          dot={false} 
                          activeDot={false} 
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </AnimatedDetails>
        </div>
      </div>
    </div>
  );
}
