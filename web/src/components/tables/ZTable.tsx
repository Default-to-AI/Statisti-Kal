import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { InlineMath } from 'react-katex';
import { HelpCircle, Star } from 'lucide-react';
import { normalCDF } from '../../lib/statistics/math';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { Disclosure, Card, CardBody, SectionHeader } from '../ui';

interface PopularZCardProps {
  item: { confidence: string; alpha: number; tail: string; phi: number; z: number; label: string };
  isMatched: boolean;
  onClick: () => void;
}

const PopularZCard: React.FC<PopularZCardProps> = ({ item, isMatched, onClick }) => {
  return (
    <Card
      variant={isMatched ? 'raised' : 'default'}
      onClick={onClick}
      className={`relative p-3 flex flex-col justify-start items-center cursor-pointer transition-colors hover:border-[var(--color-accent-cobalt)] ${isMatched ? 'border-[var(--color-accent-cobalt)] ring-1 ring-[var(--color-accent-cobalt)]' : 'border-[var(--color-border)]'}`}
    >
      <CardBody className="w-full">
        {/* Header section (Research direction & Confidence) */}
        <div className="flex justify-center items-baseline gap-1.5 w-full mb-3 border-b border-[var(--color-border)] pb-2" dir="rtl">
          <span className="text-sm font-bold text-[var(--color-text-primary)]">{item.label}</span>
          <span className="text-xs text-[var(--color-text-secondary)] font-medium">({item.confidence})</span>
        </div>

        {/* Alpha (Primary Emphasis) */}
        <div className={`text-lg text-center font-mono ${isMatched ? 'text-[var(--color-accent-cobalt)]' : 'text-[var(--color-accent-crimson)]'}`}>
          <InlineMath math={String.raw`\alpha = ${item.alpha.toFixed(2)}\ (${(item.alpha * 100).toFixed(0)}\%)`} />
        </div>

        {/* Z and Phi */}
        <div className="flex items-center justify-center gap-3 mt-3 text-xs font-mono text-[var(--color-text-primary)]" dir="ltr">
          <InlineMath math={String.raw`Z = ${item.z.toFixed(3)}`} />
          <span className="text-[var(--color-border)]">|</span>
          <InlineMath math={String.raw`\Phi = ${item.phi.toFixed(4)}`} />
        </div>
      </CardBody>
    </Card>
  );
};

export const ZTable: React.FC<{ activeZ?: number | null; showSearch?: boolean }> = ({ activeZ = null, showSearch = false }) => {
  const [searchType, setSearchType] = useLocalStorageState<'z' | 'phi'>('ND_searchType', 'z');
  const [searchVal, setSearchVal] = useState<string>('');
  const [phiSearchVal, setPhiSearchVal] = useState<string>('');
  const [isZGuideOpen, setIsZGuideOpen] = useState<boolean>(false);

  const rows = useMemo(() => Array.from({ length: 40 }, (_, i) => i / 10), []);
  const cols = useMemo(() => Array.from({ length: 10 }, (_, i) => i / 100), []);

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

  const lookupZ = actualZ !== null ? Math.abs(actualZ) : null;
  const rowVal = lookupZ !== null ? Math.floor(lookupZ * 10) / 10 : null;
  const colVal = lookupZ !== null ? Math.round((lookupZ - rowVal!) * 100) / 100 : null;

  const activeCellRef = useRef<HTMLTableCellElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeCellRef.current) {
      activeCellRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  }, [actualZ]);

  const renderTableSection = (tableRows: number[]) => (
    <div ref={containerRef} dir="ltr" className="overflow-auto rounded-lg border border-[var(--color-border)] max-h-[480px]">
      <table className="w-full text-xs sm:text-sm border-collapse">
        <thead className="sticky top-0 z-30 shadow-sm">
          <tr className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">
            <th className="sticky left-0 p-2.5 border-b-[3px] border-r-[3px] border-b-[var(--color-border-strong)] border-r-[var(--color-border-strong)] text-[var(--color-primary)] font-extrabold text-center text-sm w-14 bg-[var(--color-surface-elevated)] z-40 shadow-sm">Z</th>
            {cols.map(c => {
              const isColActive = lookupZ !== null && Math.abs(c - colVal!) < 0.001;
              return (
                <th
                  key={c}
                  className={`p-2.5 border-b-[3px] border-r border-l border-b-[var(--color-border-strong)] border-x-[var(--color-border)] transition-colors duration-300 font-extrabold text-center min-w-[58px] ${isColActive
                    ? 'bg-[var(--color-accent-cobalt-strong)] text-white'
                    : 'text-[var(--color-primary)] bg-[var(--color-surface-elevated)] shadow-sm'
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
                <td className={`sticky left-0 p-2.5 border-r-[3px] border-y border-r-[var(--color-border-strong)] border-y-[var(--color-border)] font-bold text-center text-sm transition-colors duration-300 z-20 ${isRowActive
                  ? 'bg-[var(--color-accent-cobalt-strong)] text-white'
                  : 'text-[var(--color-primary)] bg-[var(--color-surface-elevated)] shadow-sm'
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

  return (
    <div className="tour-z-table-root space-y-6 text-right" dir="rtl">
      <SectionHeader 
        title="טבלאות התפלגות סטטיסטיות"
        description="איתור ערכים קריטיים וחיפוש מדויק בהתפלגות נורמלית ובהתפלגות t של Student"
        accent="none"
        withAccentBar={false}
        className="pb-4 border-b border-[var(--color-border)]"
      />

      <div className="tour-z-table-scroll-anchor h-px w-full" aria-hidden="true" />

      {/* Z-Table Accordion */}
      <Disclosure
        id="normal-z-table"
        tocId="normal-z-table"
        title={
          <span className="flex items-center gap-x-2 flex-wrap">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] px-1.5 text-[var(--color-accent-cobalt)] shadow-[var(--shadow-soft)]">
              <InlineMath math="Z" />
            </span>
            <span>התפלגות נורמלית סטנדרטית - טבלת ערכי Z</span>
            <span dir="ltr" className="text-sm font-medium text-[var(--color-text-secondary)] mt-1 sm:mt-0">
              <InlineMath math={String.raw`\text{Standard\ Normal\ Distribution\ -\ Z-Score\ Table}`} />
            </span>
          </span>
        }
        accentOnOpen="cobalt"
      >
        <div className="space-y-6 pt-4 text-right">
          <div className="flex items-center justify-between mb-3">
            <div></div>
            <button
              onClick={() => setIsZGuideOpen(!isZGuideOpen)}
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 font-sans cursor-pointer"
            >
              <HelpCircle size={14} />
              {isZGuideOpen ? 'הסתר הסבר' : 'כיצד לקרוא את הטבלה?'}
            </button>
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
                  <p>● <strong>התא שבמפגש:</strong> מייצג את ההסתברות המצטברת <InlineMath math={String.raw`P(Z \le z)`} />, השטח המעוגל משמאל לנקודת הציון.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 bg-[var(--color-surface-raised)] p-6 rounded-lg border border-[var(--color-border)]">
              <div className="relative flex flex-col sm:flex-row bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] p-1.5 shadow-inner shrink-0 w-full md:w-auto" dir="rtl">
                {[
                  { id: 'z', label: 'חיפוש לפי ציון תקן', math: 'Z' },
                  { id: 'phi', label: 'חיפוש לפי הסתברות', math: String.raw`\Phi` }
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
                      <InlineMath math={String.raw`0 \le Z \le 3.99`} />
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
                      <InlineMath math={String.raw`0 \le \Phi \le 1`} />
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
                        ? <InlineMath math={String.raw`\Phi(\textcolor{#D4A843}{${actualZ.toFixed(2)}}) = \int_{-\infty}^{\textcolor{#D4A843}{${actualZ.toFixed(2)}}} f_Z dz = ${normalCDF(actualZ, 0, 1).toFixed(4)}`} />
                        : <InlineMath math={String.raw`Z = \Phi^{-1}(\textcolor{#D4A843}{${parseFloat(phiSearchVal || "0").toFixed(4)}}) \approx ${actualZ.toFixed(2)}`} />
                      }
                    </span>
                  </div>
                  <div className="w-full p-6 sm:p-8 text-center text-lg sm:text-xl text-[var(--color-text-primary)] leading-relaxed bg-[var(--color-surface)]">
                    {searchType === 'z' ? (
                      <>
                        עבור ציון תקן <span dir="ltr" className="font-bold"><InlineMath math={String.raw`Z = ${actualZ.toFixed(2)}`} /></span>,<br />
                        השטח המצטבר (ההסתברות) הוא <span dir="ltr" className="font-bold"><InlineMath math={String.raw`\Phi(Z) = ${normalCDF(actualZ, 0, 1).toFixed(4)}`} /></span>
                        <span className="text-[var(--color-primary)] mx-2 text-xl font-bold">(<InlineMath math={String.raw`${(normalCDF(actualZ, 0, 1) * 100).toFixed(2)}\%`} />)</span>.
                      </>
                    ) : (
                      <>
                        עבור הסתברות מצטברת של <span className="text-[var(--color-primary)] mx-1 text-xl font-bold"><InlineMath math={String.raw`${(parseFloat(phiSearchVal || "0") * 100).toFixed(1)}\%`} /></span>,<br />
                        ציון התקן המתאים הוא <span dir="ltr" className="font-bold"><InlineMath math={String.raw`Z \approx ${actualZ.toFixed(2)}`} /></span>.
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {renderTableSection(rows)}
        </div>
      </Disclosure>

      {/* Popular Z-Scores Static */}
      <Disclosure
        id="normal-popular-z"
        tocId="normal-popular-z"
        title="ערכים וציוני תקן פופולריים למבחני השערות"
        icon={<Star size={18} className="text-[var(--color-accent-cobalt)]" />}
        accentOnOpen="cobalt"
      >
        <div className="pt-4 text-right">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
      </Disclosure>

    </div>
  );
};
