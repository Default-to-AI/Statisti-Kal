import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { InlineMath } from 'react-katex';
import { HelpCircle } from 'lucide-react';
import { studentTInverseCDF } from '../../lib/statistics/math';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { Disclosure, InputGroup, ModeTabs } from '../ui';

export const TTable: React.FC = () => {
  const [tDf, setTDf] = useLocalStorageState<number | ''>('ND_tDf', '');
  const [tAlpha, setTAlpha] = useLocalStorageState<number>('ND_tAlpha', 0.05);
  const [tSide, setTSide] = useLocalStorageState<'two' | 'one'>('ND_tSide', 'two');
  const [isTGuideOpen, setIsTGuideOpen] = useState<boolean>(false);

  const dfList = useMemo(() => [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    40, 50, 60, 80, 100, 120, 500
  ], []);

  const tCols = useMemo(() => [
    { oneTail: 0.10, twoTail: 0.20 },
    { oneTail: 0.05, twoTail: 0.10 },
    { oneTail: 0.025, twoTail: 0.05 },
    { oneTail: 0.01, twoTail: 0.02 },
    { oneTail: 0.005, twoTail: 0.01 },
    { oneTail: 0.0005, twoTail: 0.001 }
  ], []);

  const computedTCritical = useMemo(() => {
    if (typeof tDf === 'string' || tDf <= 0 || isNaN(tDf)) return null;
    const targetP = tSide === 'two' ? 1 - (tAlpha / 2) : 1 - tAlpha;
    if (targetP <= 0 || targetP >= 1 || isNaN(targetP)) return null;
    return studentTInverseCDF(targetP, tDf);
  }, [tDf, tAlpha, tSide]);

  const renderTTableSection = () => (
    <div className="overflow-auto rounded-lg border border-[var(--color-border)] max-h-[480px]">
      <table className="w-full text-xs sm:text-sm border-collapse">
        <thead className="sticky top-0 z-30 shadow-sm">
          <tr className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">
            <th rowSpan={2} className="sticky right-0 p-3 border-b-[3px] border-l-[3px] border-b-[var(--color-border-strong)] border-l-[var(--color-border-strong)] text-[var(--color-primary)] font-extrabold text-center text-xs sm:text-sm w-16 bg-[var(--color-surface-elevated)] z-40 shadow-sm">
              דרגות חופש <br /> (df)
            </th>
            <th colSpan={6} className="p-1.5 border-b-2 border-b-[var(--color-border-strong)] font-extrabold text-center text-xs bg-[var(--color-surface-elevated)] text-[var(--color-primary)]">
              רמת מובהקות עבור התפלגות T
            </th>
          </tr>
          <tr className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">
            {tCols.map((c, idx) => {
              const isActiveCol = (tSide === 'two' && Math.abs(tAlpha - c.twoTail) < 0.0001) || (tSide === 'one' && Math.abs(tAlpha - c.oneTail) < 0.0001);
              return (
                <th
                  key={idx}
                  className={`p-2.5 border-b-[3px] border-x border-b-[var(--color-border-strong)] border-x-[var(--color-border)] font-bold text-center transition-colors min-w-[70px] ${isActiveCol
                    ? 'bg-[var(--color-accent-cobalt-strong)] text-white'
                    : 'text-[var(--color-primary)] bg-[var(--color-surface-elevated)] shadow-sm'
                    }`}
                >
                  <div className="text-caption opacity-75">חד-צדדי: {c.oneTail}</div>
                  <div className="text-xs">דו-צדדי: {c.twoTail}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {dfList.map(df => {
            const isRowActive = df === tDf;
            return (
              <tr key={df} className={`transition-colors duration-200 ${isRowActive
                ? 'bg-[var(--color-surface-raised)]'
                : 'hover:bg-[var(--color-surface)]'
                }`}>
                <td className={`sticky right-0 p-2.5 border-l-[3px] border-y border-l-[var(--color-border-strong)] border-y-[var(--color-border)] font-bold text-center text-xs sm:text-sm transition-colors duration-300 z-20 ${isRowActive
                  ? 'bg-[var(--color-accent-cobalt-strong)] text-white'
                  : 'text-[var(--color-primary)] bg-[var(--color-surface-elevated)] shadow-sm'
                  }`}>
                  {df === 500 ? '∞ (Z)' : df}
                </td>
                {tCols.map((c, colIdx) => {
                  const val = studentTInverseCDF(1 - c.oneTail, df);
                  const isActiveCol = (tSide === 'two' && Math.abs(tAlpha - c.twoTail) < 0.0001) || (tSide === 'one' && Math.abs(tAlpha - c.oneTail) < 0.0001);
                  const isActive = isRowActive && isActiveCol;
                  return (
                    <td
                      key={colIdx}
                      className={`p-2.5 border border-[var(--color-border)] text-center transition-all duration-300 tabular-nums text-mono-sm sm:text-mono-base ${isActive
                        ? 'bg-[var(--color-accent-cobalt-bg-hover)] text-white font-extrabold scale-102 shadow-sm z-10 relative rounded-lg'
                        : isRowActive || isActiveCol
                          ? 'bg-[var(--color-accent-cobalt-strong)]/20 text-[var(--color-accent-cobalt)] font-bold'
                          : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] font-medium'
                        }`}
                    >
                      {val.toFixed(3)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <Disclosure
      id="normal-t-table"
      tocId="normal-t-table"
      title={
        <span className="flex items-center gap-x-2 flex-wrap">
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] px-1.5 text-[var(--color-accent-cobalt)] shadow-[var(--shadow-soft)]">
            <InlineMath math="t" />
          </span>
          <span>ערכים קריטיים להתפלגות Student's t</span>
          <span dir="ltr" className="text-sm font-medium text-[var(--color-text-secondary)] mt-1 sm:mt-0">
            <InlineMath math={String.raw`\text{Critical\ Values\ for\ Student's\ t-Distribution}`} />
          </span>
        </span>
      }
      accentOnOpen="cobalt"
    >
      <div className="space-y-6 pt-4 text-right">
        <div className="flex items-center justify-between mb-3">
          <div></div>
          <button
            onClick={() => setIsTGuideOpen(!isTGuideOpen)}
            className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 font-sans cursor-pointer"
          >
            <HelpCircle size={14} />
            {isTGuideOpen ? 'הסתר הסבר' : <>מדריך מקוצר להתפלגות <InlineMath math="t" /></>}
          </button>
        </div>

        {isTGuideOpen && (
          <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-primary)] leading-relaxed space-y-1 text-right mb-3">
            <p>● הטבלה מציגה דרגות חופש (df) בשורות ורמות מובהקות (אלפא) בעמודות.</p>
            <p>● ערכי התאים הם הערך הקריטי <InlineMath math={String.raw`t_{crit}`} /> שעבורו השטח מימין (למבחן חד-צדדי) או משני הצדדים (לדו-צדדי) שווה לאלפא.</p>
            <p>● עבור דרגת חופש אינסופית (∞), התפלגות <InlineMath math="t" /> מתכנסת בדיוק להתפלגות נורמלית סטנדרטית <InlineMath math="Z" />.</p>
          </div>
        )}

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col xl:flex-row items-center justify-center gap-6 bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border)]">
            
            <div className="flex items-center gap-4 bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] p-2 shadow-inner w-full xl:w-auto shrink-0 justify-between sm:justify-start">
              <span className="text-sm font-semibold text-[var(--color-text-secondary)] whitespace-nowrap pl-2">דרגות חופש <InlineMath math="(df)" />:</span>
              <div className="w-24">
                <InputGroup
                  value={tDf === '' ? '' : tDf.toString()}
                  onChange={(v) => setTDf(v === '' ? '' : Math.max(1, parseInt(v) || 1))}
                  type="number"
                  min={1}
                  placeholder="N - 1"
                  dir="ltr"
                  size="sm"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] p-2 shadow-inner w-full xl:w-auto shrink-0 justify-between sm:justify-start">
              <span className="text-sm font-semibold text-[var(--color-text-secondary)] whitespace-nowrap pl-2">סוג המבחן:</span>
              <ModeTabs
                tabs={[
                  { id: 'two', label: 'דו-צדדי' },
                  { id: 'one', label: 'חד-צדדי' }
                ]}
                activeTab={tSide}
                onChange={(id) => setTSide(id as 'two' | 'one')}
                orientation="horizontal"
                size="sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] p-2 shadow-inner w-full xl:w-auto xl:flex-1 justify-between sm:justify-start">
              <span className="text-sm font-semibold text-[var(--color-text-secondary)] whitespace-nowrap pl-2">אלפא <span className="text-xs font-normal opacity-70">(מובהקות)</span>:</span>
              <div className="flex flex-wrap sm:flex-nowrap w-full gap-1">
                {[0.20, 0.10, 0.05, 0.02, 0.01, 0.001].map(a => (
                  <button
                    key={a}
                    onClick={() => setTAlpha(a)}
                    className={`relative flex-1 min-w-[40px] py-1.5 rounded-sm text-xs sm:text-sm font-bold font-mono transition-colors z-10 ${tAlpha === a ? 'bg-[var(--color-accent-cobalt-strong)] text-white shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] bg-transparent'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <AnimatePresence mode="popLayout">
            {computedTCritical !== null && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm overflow-hidden"
              >
                <div className="w-full p-4 sm:p-5 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] flex flex-col items-center justify-center gap-2 text-center">
                  <span className="text-base sm:text-lg font-mono text-[var(--color-text-secondary)] opacity-90" dir="ltr">
                    <InlineMath math={String.raw`t_{${tAlpha}, ${tDf === 500 ? '\\infty' : tDf}} = \textcolor{#D4A843}{${computedTCritical.toFixed(4)}}`} />
                  </span>
                </div>
                <div className="w-full p-6 sm:p-8 text-center text-lg sm:text-xl text-[var(--color-text-primary)] leading-relaxed bg-[var(--color-surface)]">
                  עבור <span className="font-bold">df = {tDf === 500 ? '∞ (Z)' : tDf}</span>,
                  רמת מובהקות של <span className="text-[var(--color-primary)] mx-1 text-xl font-bold"><InlineMath math={String.raw`${(tAlpha * 100).toFixed(1)}\%`} /></span> (<span className="font-bold">{tSide === 'two' ? 'מבחן דו-צדדי' : 'מבחן חד-צדדי'}</span>),<br />
                  הערך הקריטי המתאים הוא <span dir="ltr" className="font-bold"><InlineMath math={String.raw`t_{crit} \approx ${computedTCritical.toFixed(3)}`} /></span>.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {renderTTableSection()}
      </div>
    </Disclosure>
  );
};
