import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { InlineMath } from 'react-katex';
import { Award, BookOpen, Calculator, ChevronDown, HelpCircle, Star } from 'lucide-react';
import { normalCDF, studentTInverseCDF } from '../../lib/statistics/math';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';

interface PopularZCardProps {
  item: { confidence: string; alpha: number; tail: string; phi: number; z: number; label: string };
  isMatched: boolean;
  onClick: () => void;
}

const PopularZCard: React.FC<PopularZCardProps> = ({ item, isMatched, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative pt-3 pb-4 px-3 rounded-md border transition-colors flex flex-col justify-start items-center cursor-pointer ${isMatched
        ? 'bg-[var(--color-accent-cobalt-bg)] border-[var(--color-accent-cobalt-line)]'
        : 'bg-transparent border-[var(--color-border)] hover:bg-[var(--color-surface-raised)] hover:border-[var(--color-text-secondary)]'
        }`}
    >
      {/* Header section (Research direction & Confidence) */}
      <div className="flex justify-center items-baseline gap-1.5 w-full mb-3 border-b border-[var(--color-border)] pb-2" dir="rtl">
        <span className="text-body-base font-bold text-[var(--color-text-primary)]">{item.label}</span>
        <span className="text-caption text-[var(--color-text-secondary)] font-medium">({item.confidence})</span>
      </div>

      {/* Alpha (Primary Emphasis) */}
      <div className={`text-xl ${isMatched ? 'text-[var(--color-accent-cobalt)]' : 'text-[var(--color-accent-crimson)]'}`}>
        <InlineMath math={`\\alpha = ${item.alpha.toFixed(2)}\\ (${(item.alpha * 100).toFixed(0)}\\%)`} />
      </div>

      {/* Z and Phi */}
      <div className="flex items-center justify-center gap-3 mt-3 text-body-xs text-[var(--color-text-primary)]" dir="ltr">
        <InlineMath math={`Z = ${item.z.toFixed(3)}`} />
        <span className="text-[var(--color-border)]">|</span>
        <InlineMath math={`\\Phi = ${item.phi.toFixed(4)}`} />
      </div>
    </button>
  );
};

export const ZTable: React.FC<{ activeZ?: number | null; showSearch?: boolean }> = ({ activeZ = null, showSearch = false }) => {
  const [searchType, setSearchType] = useLocalStorageState<'z' | 'phi'>('ND_searchType', 'z');
  const [searchVal, setSearchVal] = useState<string>('');
  const [phiSearchVal, setPhiSearchVal] = useState<string>('');
  const [isZGuideOpen, setIsZGuideOpen] = useState<boolean>(false);
  const [isTGuideOpen, setIsTGuideOpen] = useState<boolean>(false);

  // Accordion states
  const [isZTableOpen, setIsZTableOpen] = useState<boolean>(false);
  const [isPopularOpen, setIsPopularOpen] = useState<boolean>(false);
  const [isTTableOpen, setIsTTableOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleOpenPath = (event: Event) => {
      const customEvent = event as CustomEvent<{ ids?: string[] }>;
      const openIds = customEvent.detail?.ids ?? [];

      if (openIds.includes('normal-z-table')) {
        setIsZTableOpen(true);
      }

      if (openIds.includes('normal-popular-z')) {
        setIsPopularOpen(true);
      }

      if (openIds.includes('normal-t-table')) {
        setIsTTableOpen(true);
      }
    };

    window.addEventListener('toc-open-path', handleOpenPath);
    return () => window.removeEventListener('toc-open-path', handleOpenPath);
  }, []);

  // Student's T-distribution states
  const [tDf, setTDf] = useLocalStorageState<number | ''>('ND_tDf', '');
  const [tAlpha, setTAlpha] = useLocalStorageState<number>('ND_tAlpha', 0.05);
  const [tSide, setTSide] = useLocalStorageState<'two' | 'one'>('ND_tSide', 'two');

  const rows = useMemo(() => Array.from({ length: 40 }, (_, i) => i / 10), []);
  const cols = useMemo(() => Array.from({ length: 10 }, (_, i) => i / 100), []);

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

  const findZByPhiVal = (targetPhi: number) => {
    let closestZ = 0;
    let minDiff = Infinity;

    for (const r of rows) {
      for (const c of cols) {
        const z = r + c;
        const phi = normalCDF(z, 0, 1);
        const diff = Math.abs(phi - targetPhi);
        if (diff < minDiff) {
          minDiff = diff;
          closestZ = z;
        }
      }
    }
    return closestZ;
  };

  if (activeZ === null && !showSearch) return null;

  const actualZ = useMemo(() => {
    if (searchType === 'phi') {
      const parsedPhi = parseFloat(phiSearchVal);
      if (isNaN(parsedPhi) || parsedPhi < 0 || parsedPhi > 1) return null;
      return findZByPhiVal(parsedPhi);
    }
    const parsed = parseFloat(searchVal);
    return isNaN(parsed) ? null : parsed;
  }, [searchVal, phiSearchVal, searchType, rows, cols]);

  const isZNegative = actualZ !== null && actualZ < 0;
  const lookupZ = actualZ !== null ? Math.abs(actualZ) : null;

  const rowVal = lookupZ !== null ? Math.floor(lookupZ * 10) / 10 : null;
  const colVal = lookupZ !== null ? Math.round((lookupZ - rowVal!) * 100) / 100 : null;

  const activeCellRef = useRef<HTMLTableCellElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeCellRef.current && containerRef.current) {
      const cell = activeCellRef.current;
      const container = containerRef.current;

      const cellRect = cell.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const scrollTop = container.scrollTop + (cellRect.top - containerRect.top) - (containerRect.height / 2) + (cellRect.height / 2);
      const scrollLeft = container.scrollLeft + (cellRect.left - containerRect.left) - (containerRect.width / 2) + (cellRect.width / 2);

      container.scrollTo({
        top: scrollTop,
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [rowVal, colVal]);

  const computedTCritical = useMemo(() => {
    if (typeof tDf === 'string' || tDf <= 0 || isNaN(tDf)) return null;
    const targetP = tSide === 'two' ? 1 - (tAlpha / 2) : 1 - tAlpha;
    if (targetP <= 0 || targetP >= 1 || isNaN(targetP)) return null;
    return studentTInverseCDF(targetP, tDf);
  }, [tDf, tAlpha, tSide]);

  const renderTableSection = (tableRows: number[]) => (
    <div ref={containerRef} dir="ltr" className="overflow-auto rounded-lg border border-[var(--color-border)] max-h-[480px]">
      <table className="w-full text-xs sm:text-sm border-collapse">
        <thead className="sticky top-0 z-30 shadow-sm">
          <tr className="bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]">
            <th className="sticky left-0 p-2.5 border border-[var(--color-border)] text-[var(--color-primary)] font-extrabold text-center text-sm w-14 bg-[var(--color-surface-raised)] z-40">Z</th>
            {cols.map(c => {
              const isColActive = lookupZ !== null && Math.abs(c - colVal!) < 0.001;
              return (
                <th
                  key={c}
                  className={`p-2.5 border border-[var(--color-border)] transition-colors duration-300 font-extrabold text-center min-w-[58px] ${isColActive
                    ? 'bg-[var(--color-accent-cobalt-strong)] text-white'
                    : 'text-[var(--color-text-primary)] bg-[var(--color-surface-raised)]'
                    }`}
                >
                  {c.toFixed(2).slice(2)}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {tableRows.map(r => {
            const isRowActive = lookupZ !== null && Math.abs(r - rowVal!) < 0.01;
            return (
              <tr key={r} className={`transition-colors duration-200 ${isRowActive
                ? 'bg-[var(--color-surface-raised)]'
                : 'hover:bg-[var(--color-surface)]'
                }`}>
                <td className={`sticky left-0 p-2.5 border border-[var(--color-border)] font-semibold text-center text-sm transition-colors duration-300 z-20 ${isRowActive
                  ? 'bg-[var(--color-accent-cobalt-strong)] text-white'
                  : 'text-[var(--color-text-primary)] bg-[var(--color-surface-raised)]'
                  }`}>
                  {r.toFixed(1)}
                </td>
                {cols.map(c => {
                  const z = r + c;
                  const val = normalCDF(z, 0, 1);
                  const isColActive = lookupZ !== null && Math.abs(c - colVal!) < 0.001;
                  const isActive = isRowActive && isColActive;

                  return (
                    <td
                      key={c}
                      ref={isActive ? activeCellRef : undefined}
                      className={`p-2.5 border border-[var(--color-border)] text-center transition-all duration-300 tabular-nums text-mono-sm sm:text-mono-base ${isActive
                        ? 'bg-[var(--color-accent-cobalt-bg-hover)] text-white font-extrabold scale-102 shadow-sm z-10 relative rounded-lg'
                        : isRowActive
                          ? 'bg-[var(--color-accent-cobalt-strong)]/20 text-[var(--color-primary)] font-semibold'
                          : isColActive
                            ? 'bg-[var(--color-accent-cobalt-strong)]/20 text-[var(--color-accent-cobalt)] font-semibold'
                            : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] font-medium'
                        }`}
                    >
                      {val.toFixed(4)}
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

  const renderTTableSection = () => (
    <div className="overflow-auto rounded-lg border border-[var(--color-border)] max-h-[480px]">
      <table className="w-full text-xs sm:text-sm border-collapse">
        <thead className="sticky top-0 z-30 shadow-sm">
          <tr className="bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]">
            <th rowSpan={2} className="sticky right-0 p-3 border border-[var(--color-border)] text-[var(--color-accent-cobalt)] font-semibold text-center text-xs sm:text-sm w-16 bg-[var(--color-surface-raised)] z-40">
              דרגות חופש <br /> (df)
            </th>
            <th colSpan={6} className="p-1.5 border-b border-[var(--color-border)] font-extrabold text-center text-xs bg-[var(--color-surface-raised)]">
              רמת מובהקות עבור התפלגות T
            </th>
          </tr>
          <tr className="bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]">
            {tCols.map((c, idx) => {
              const isActiveCol = (tSide === 'two' && Math.abs(tAlpha - c.twoTail) < 0.0001) || (tSide === 'one' && Math.abs(tAlpha - c.oneTail) < 0.0001);
              return (
                <th
                  key={idx}
                  className={`p-2.5 border border-[var(--color-border)] font-bold text-center transition-colors min-w-[70px] ${isActiveCol
                    ? 'bg-[var(--color-accent-cobalt-strong)] text-white'
                    : 'bg-[var(--color-surface-raised)]'
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
                <td className={`sticky right-0 p-2.5 border border-[var(--color-border)] font-semibold text-center text-xs sm:text-sm transition-colors duration-300 z-20 ${isRowActive
                  ? 'bg-[var(--color-accent-cobalt-strong)] text-white'
                  : 'text-[var(--color-text-primary)] bg-[var(--color-surface)]'
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
                        ? 'bg-[var(--color-accent-cobalt-bg-hover)] text-white bg-[var(--color-accent-cobalt-bg)]0 font-extrabold scale-102 shadow-sm z-10 relative rounded-lg'
                        : isRowActive
                          ? 'bg-[var(--color-accent-cobalt-bg)]/40 text-[var(--color-accent-cobalt)] bg-[var(--color-accent-cobalt-strong)]/20 text-[var(--color-accent-cobalt)] font-bold'
                          : isActiveCol
                            ? 'bg-[var(--color-accent-cobalt-bg)]/40 text-[var(--color-accent-cobalt)] bg-[var(--color-accent-cobalt-strong)]/20 text-[var(--color-accent-cobalt)] font-bold'
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
    <div className="tour-z-table-root space-y-6 text-right" dir="rtl">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h2 data-toc id="normal-distribution-tables" className="text-lg font-bold text-[var(--color-text-primary)]">טבלאות התפלגות סטטיסטיות</h2>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-sans">איתור ערכים קריטיים וחיפוש מדויק בהתפלגות נורמלית ובהתפלגות t של Student</p>
      </div>

      <div className="tour-z-table-scroll-anchor h-px w-full" aria-hidden="true" />

      {/* Z-Table Accordion */}
      <div id="normal-z-table" className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <button
          onClick={() => setIsZTableOpen(!isZTableOpen)}
          className="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] transition-colors border-b border-[var(--color-border)] cursor-pointer"
        >
          <h3
            data-toc
            data-toc-label="התפלגות נורמלית סטנדרטית - טבלת ערכי Z"
            data-toc-target="normal-z-table"
            data-toc-open="normal-z-table"
            className="text-base font-bold text-[var(--color-text-primary)] flex flex-wrap items-center gap-x-2 gap-y-1"
          >
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] px-1.5 text-[var(--color-accent-cobalt)] shadow-[var(--shadow-soft)]">
              <InlineMath math="Z" />
            </span>
            <span>התפלגות נורמלית סטנדרטית - טבלת ערכי Z</span>
            <span dir="ltr" className="text-sm font-medium text-[var(--color-text-secondary)]">
              <InlineMath math="\text{Standard\ Normal\ Distribution\ -\ Z-Score\ Table}" />
            </span>
          </h3>
          <ChevronDown size={20} className={`text-[var(--color-text-secondary)] transition-transform duration-200 ${isZTableOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isZTableOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-5 space-y-6">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsZGuideOpen(!isZGuideOpen)}
                        className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 font-sans cursor-pointer"
                      >
                        <HelpCircle size={14} />
                        {isZGuideOpen ? 'הסתר הסבר' : 'כיצד לקרוא את הטבלה?'}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isZGuideOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-4"
                      >
                        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-primary)] leading-relaxed space-y-1 text-right">
                          <p>● <strong>השורה הראשונה (<InlineMath math="Z" />):</strong> מציגה את ערך ה-<InlineMath math="Z" /> בדיוק של ספרה אחת לאחר הנקודה (למשל: 1.2).</p>
                          <p>● <strong>העמודות (0.00 עד 0.09):</strong> מציגות את מאיות ציון התקן (למשל: עמודה 0.06 משלימה ל-1.26).</p>
                          <p>● <strong>התא שבמפגש:</strong> מייצג את ההסתברות המצטברת <InlineMath math="P(Z \le z)" />, השטח המעוגל משמאל לנקודת הציון.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border)]">
                      <div className="relative flex flex-col sm:flex-row bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] p-1.5 shadow-inner shrink-0 w-full md:w-auto" dir="rtl">
                        {[
                          { id: 'z', label: 'חיפוש לפי ציון תקן', math: 'Z' },
                          { id: 'phi', label: 'חיפוש לפי הסתברות', math: '\\Phi' }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setSearchType(tab.id as 'z' | 'phi')}
                            className={`relative px-5 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer flex-1 md:flex-none z-10 ${searchType === tab.id ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                              }`}
                          >
                            {searchType === tab.id && (
                              <motion.div
                                layoutId="activeSearchType"
                                className="absolute inset-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded shadow-sm -z-10"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                              />
                            )}
                            <span>{tab.label}</span>
                            <span className="font-mono" dir="ltr"><InlineMath math={tab.math} /></span>
                          </button>
                        ))}
                      </div>

                      <div className="w-full md:max-w-[340px] flex flex-col justify-center relative">
                        <input
                          type="text"
                          value={searchType === 'z' ? searchVal : phiSearchVal}
                          onChange={e => searchType === 'z' ? setSearchVal(e.target.value) : setPhiSearchVal(e.target.value)}
                          placeholder=""
                          className={`w-full h-full bg-transparent border rounded px-4 py-3 text-base sm:text-lg text-[var(--color-text-primary)] font-mono focus:outline-none transition-all text-center shadow-sm relative z-10 ${(searchType === 'z' && !searchVal) || (searchType === 'phi' && !phiSearchVal)
                            ? 'border-[var(--color-error)]/60 focus:border-[var(--color-error)]/80 focus:ring-1 focus:ring-[var(--color-error)]/80'
                            : 'border-[var(--color-border)] focus:border-[var(--color-accent-cobalt-line)] focus:ring-1 focus:ring-[var(--color-accent-cobalt-line)]'
                            }`}
                          dir="ltr"
                        />

                        <AnimatePresence>
                          {(!searchVal && searchType === 'z') && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 flex items-center justify-center pointer-events-none text-[var(--color-text-secondary)] opacity-50 text-lg sm:text-xl z-10"
                              dir="ltr"
                            >
                              <InlineMath math="Z = ?" />
                            </motion.div>
                          )}
                          {(!phiSearchVal && searchType === 'phi') && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 flex items-center justify-center pointer-events-none text-[var(--color-text-secondary)] opacity-50 text-lg sm:text-xl z-10"
                              dir="ltr"
                            >
                              <InlineMath math="\Phi = ?" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <AnimatePresence mode="popLayout">
                      {actualZ !== null && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="w-full flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm overflow-hidden"
                        >
                          <div className="w-full p-4 sm:p-5 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] flex flex-col items-center justify-center gap-2 text-center">
                            <span className="text-base sm:text-lg font-mono text-[var(--color-text-secondary)] opacity-90" dir="ltr">
                              {searchType === 'z'
                                ? <InlineMath math={`\\Phi(\\textcolor{#D4A843}{${actualZ.toFixed(2)}}) = \\int_{-\\infty}^{\\textcolor{#D4A843}{${actualZ.toFixed(2)}}} f_Z dz = ${normalCDF(actualZ, 0, 1).toFixed(4)}`} />
                                : <InlineMath math={`Z = \\Phi^{-1}(\\textcolor{#D4A843}{${parseFloat(phiSearchVal || "0").toFixed(4)}}) \\approx ${actualZ.toFixed(2)}`} />
                              }
                            </span>
                          </div>
                          <div className="w-full p-6 sm:p-8 text-center text-lg sm:text-xl text-[var(--color-text-primary)] leading-relaxed bg-[var(--color-surface)]">
                            {searchType === 'z' ? (
                              <>
                                עבור ציון תקן <span dir="ltr" className="font-bold"><InlineMath math={`Z = ${actualZ.toFixed(2)}`} /></span>,<br />
                                השטח המצטבר (ההסתברות) הוא <span dir="ltr" className="font-bold"><InlineMath math={`\\Phi(Z) = ${normalCDF(actualZ, 0, 1).toFixed(4)}`} /></span>
                                <span className="text-[var(--color-primary)] mx-2 text-xl font-bold">(<InlineMath math={`${(normalCDF(actualZ, 0, 1) * 100).toFixed(2)}\\%`} />)</span>.
                              </>
                            ) : (
                              <>
                                עבור הסתברות מצטברת של <span className="text-[var(--color-primary)] mx-1 text-xl font-bold"><InlineMath math={`${(parseFloat(phiSearchVal || "0") * 100).toFixed(1)}\\%`} /></span>,<br />
                                ציון התקן המתאים הוא <span dir="ltr" className="font-bold"><InlineMath math={`Z \\approx ${actualZ.toFixed(2)}`} /></span>.
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {renderTableSection(rows)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Popular Z-Scores Static */}
      <div id="normal-popular-z" className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <div className="w-full flex items-center p-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-[var(--color-accent-cobalt)]" />
            <h3 data-toc data-toc-target="normal-popular-z" data-toc-open="normal-popular-z" className="text-base font-bold text-[var(--color-text-primary)]">ערכים וציוני תקן פופולריים למבחני השערות</h3>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="p-5 bg-[var(--color-surface)]">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { confidence: "90%", alpha: 0.10, tail: "one", phi: 0.9000, z: 1.282, label: "חד-צדדי" },
                { confidence: "90%", alpha: 0.10, tail: "two", phi: 0.9500, z: 1.645, label: "דו-צדדי" },
                { confidence: "95%", alpha: 0.05, tail: "one", phi: 0.9500, z: 1.645, label: "חד-צדדי" },
                { confidence: "95%", alpha: 0.05, tail: "two", phi: 0.9750, z: 1.960, label: "דו-צדדי" },
                { confidence: "99%", alpha: 0.01, tail: "one", phi: 0.9900, z: 2.326, label: "חד-צדדי" },
                { confidence: "99%", alpha: 0.01, tail: "two", phi: 0.9950, z: 2.576, label: "דו-צדדי" },
              ].map((item, idx) => {
                const isMatched = actualZ !== null && (
                  Math.abs(Math.abs(actualZ) - item.z) < 0.05 ||
                  (searchType === 'phi' && phiSearchVal && Math.abs(parseFloat(phiSearchVal) - item.phi) < 0.01)
                );

                return (
                  <PopularZCard
                    key={idx}
                    item={item}
                    isMatched={isMatched}
                    onClick={() => {
                      setSearchType('z');
                      setSearchVal(item.z.toFixed(3));
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* T-Table Accordion */}
      <div id="normal-t-table" className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <button
          onClick={() => setIsTTableOpen(!isTTableOpen)}
          className="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] transition-colors border-b border-[var(--color-border)] cursor-pointer"
        >
          <h3
            data-toc
            data-toc-label="ערכים קריטיים להתפלגות Student's"
            data-toc-target="normal-t-table"
            data-toc-open="normal-t-table"
            className="text-base font-bold text-[var(--color-text-primary)] flex flex-wrap items-center gap-x-2 gap-y-1"
          >
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] px-1.5 text-[var(--color-accent-cobalt)] shadow-[var(--shadow-soft)]">
              <InlineMath math="t" />
            </span>
            <span>ערכים קריטיים להתפלגות Student's t</span>
            <span dir="ltr" className="text-sm font-medium text-[var(--color-text-secondary)]">
              <InlineMath math="\text{Critical\ Values\ for\ Student's\ t-Distribution}" />
            </span>
          </h3>
          <ChevronDown size={20} className={`text-[var(--color-text-secondary)] transition-transform duration-200 ${isTTableOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isTTableOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-5 space-y-6">
                <div>
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

                  <AnimatePresence>
                    {isTGuideOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-3"
                      >
                        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-primary)] leading-relaxed space-y-1 text-right">
                          <p>● הטבלה מציגה דרגות חופש (df) בשורות ורמות מובהקות (אלפא) בעמודות.</p>
                          <p>● ערכי התאים הם הערך הקריטי <InlineMath math="t_{crit}" /> שעבורו השטח מימין (למבחן חד-צדדי) או משני הצדדים (לדו-צדדי) שווה לאלפא.</p>
                          <p>● עבור דרגת חופש אינסופית (∞), התפלגות <InlineMath math="t" /> מתכנסת בדיוק להתפלגות נורמלית סטנדרטית <InlineMath math="Z" />.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mb-4 bg-[var(--color-surface-raised)] p-4 rounded-lg border border-[var(--color-border)]">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-2 flex flex-col justify-end relative">
                        <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-2 font-sans">דרגות חופש (<InlineMath math="df" />):</label>
                        <div className="relative w-full">
                          <input
                            type="number"
                            value={tDf}
                            onChange={e => {
                              const val = e.target.value;
                              setTDf(val === '' ? '' : Math.max(1, parseInt(val) || 1));
                            }}
                            className={`w-full bg-transparent border rounded-sm px-3 py-2 text-sm text-[var(--color-text-primary)] font-mono focus:outline-none transition-colors relative z-10 ${tDf === ''
                              ? 'border-[var(--color-error)]/60 focus:border-[var(--color-error)]/80 focus:ring-1 focus:ring-[var(--color-error)]/80'
                              : 'border-[var(--color-border)] focus:border-[var(--color-accent-cobalt-line)]'
                              }`}
                          />
                          <AnimatePresence>
                            {tDf === '' && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center px-4 pointer-events-none text-[var(--color-text-secondary)] opacity-50 z-0"
                                dir="ltr"
                              >
                                <span className="w-full text-center"><InlineMath math="N - 1" /></span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <div className="md:col-span-4 lg:col-span-3 flex flex-col justify-end">
                        <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-2 font-sans">סוג המבחן:</label>
                        <div className="flex bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]/50 p-1 shadow-sm w-full relative">
                          {['two', 'one'].map(side => (
                            <button
                              key={side}
                              onClick={() => setTSide(side as 'two' | 'one')}
                              className={`relative flex-1 py-1.5 rounded-sm text-xs font-bold transition-colors z-10 ${tSide === side ? 'text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                            >
                              {tSide === side && (
                                <motion.div
                                  layoutId="tSidePill"
                                  className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-sm shadow-sm -z-10"
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                              )}
                              {side === 'two' ? 'דו-צדדי' : 'חד-צדדי'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-6 lg:col-span-7 flex flex-col justify-end">
                        <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-2 font-sans">אלפא (מובהקות):</label>
                        <div className="flex flex-wrap sm:flex-nowrap bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]/50 p-1 shadow-sm w-full gap-1 relative">
                          {[0.20, 0.10, 0.05, 0.02, 0.01, 0.001].map(a => (
                            <button
                              key={a}
                              onClick={() => setTAlpha(a)}
                              className={`relative flex-1 min-w-[40px] py-1.5 rounded-sm text-xs font-bold font-mono transition-colors z-10 ${tAlpha === a ? 'text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                            >
                              {tAlpha === a && (
                                <motion.div
                                  layoutId="tAlphaPill"
                                  className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-sm shadow-sm -z-10"
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                              )}
                              {a}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {computedTCritical !== null && (
                    <div className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
                      עבור df = {tDf === 500 ? '∞ (Z)' : tDf}, אלפא = {tAlpha}, מבחן {tSide === 'two' ? 'דו-צדדי' : 'חד-צדדי'}:
                      ערך קריטי <InlineMath math="t_{crit}" /> = <span className="text-[var(--color-accent-cobalt)] font-mono text-base ml-1">{computedTCritical.toFixed(4)}</span>
                    </div>
                  )}

                  {renderTTableSection()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
