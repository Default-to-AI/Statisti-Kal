import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InlineMath, BlockMath } from 'react-katex';
import { 
  X, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  ArrowLeftRight, 
  Sliders, 
  ShieldAlert, 
  Info,
  Layers,
  Sparkles,
  TrendingDown
} from 'lucide-react';

interface StatisticalHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'sigma-vs-s' | 'standard-error' | 'sqrt-intuition';
}

export default function StatisticalHelperModal({ isOpen, onClose, initialTab = 'sigma-vs-s' }: StatisticalHelperModalProps) {
  const [activeTab, setActiveTab] = useState<'sigma-vs-s' | 'standard-error' | 'sqrt-intuition'>(initialTab);
  
  // Interactive Simulator States
  const [popSigma, setPopSigma] = useState<number>(15);
  const [sampleSize, setSampleSize] = useState<number>(16);

  if (!isOpen) return null;

  // Real-time calculations for simulator
  const standardError = popSigma / Math.sqrt(sampleSize);

  // SVG parameters for bell curve drawing
  const width = 450;
  const height = 180;
  const meanX = width / 2;

  const generateBellCurvePath = (stDev: number) => {
    // scale factor to make the curve fill the visual space nicely
    const scaleY = stDev < 4 ? 60 : stDev < 8 ? 80 : 100; 
    let points: string[] = [];
    for (let x = 0; x <= width; x += 3) {
      const z = (x - meanX) / (stDev * 8); // Scale standard dev to fit nicely in 450px width
      const y = height - Math.exp(-0.5 * z * z) * (scaleY / (stDev * 0.25 || 1)) - 10;
      points.push(`${x},${Math.min(height - 10, Math.max(10, y))}`);
    }
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[var(--color-surface)]/80 backdrop-blur-sm p-4 animate-fade-in" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-4xl rounded-lg border border-[var(--color-border)] dark:border-[var(--color-border)] bg-white dark:bg-[var(--color-surface)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--color-border)] dark:border-[var(--color-border)] bg-gradient-to-r from-[var(--color-accent-cobalt-bg)]/50 to-[var(--color-accent-cobalt)]/10 dark:from-[var(--color-surface-raised)]/60 dark:to-[var(--color-surface)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-lg bg-[var(--color-accent-cobalt-strong)]/10 text-[var(--color-accent-cobalt)] dark:text-[var(--color-accent-cobalt)]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] font-sans">
                מדריך אינטראקטיבי: סודות שגיאת התקן והשונות
              </h3>
              <p className="text-body-xs sm:text-caption text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">
                פענוח ההבדל בין מדגם לאוכלוסייה, ומדוע שגיאת הממוצע מתכווצת עם <InlineMath math="\sqrt{n}" />
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[var(--color-border)] dark:border-[var(--color-border)] hover:bg-[var(--color-surface-raised)] dark:hover:bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] [&_svg]:w-5 [&_svg]:h-5 transition-all"
            aria-label="סגור"
          >
            <X />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-surface-raised)]/30 dark:bg-[var(--color-surface)]/30 p-1.5 gap-1 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('sigma-vs-s')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all ${
              activeTab === 'sigma-vs-s'
                ? 'bg-[var(--color-accent-cobalt-strong)] text-white shadow-md shadow-[var(--color-accent-cobalt-line)]/15'
                : 'text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] dark:hover:bg-[var(--color-surface-raised)]'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>אוכלוסייה מול מדגם: <InlineMath math="\sigma" /> מול <InlineMath math="S" /></span>
          </button>

          <button
            onClick={() => setActiveTab('standard-error')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all ${
              activeTab === 'standard-error'
                ? 'bg-[var(--color-accent-cobalt-strong)] text-white shadow-md shadow-[var(--color-accent-cobalt-line)]/15'
                : 'text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] dark:hover:bg-[var(--color-surface-raised)]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>מדוע מחלקים בשורש <InlineMath math="(n)" />? (ההסבר המתמטי)</span>
          </button>

          <button
            onClick={() => setActiveTab('sqrt-intuition')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all ${
              activeTab === 'sqrt-intuition'
                ? 'bg-[var(--color-accent-cobalt-strong)] text-white shadow-md shadow-[var(--color-accent-cobalt-line)]/15'
                : 'text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] dark:hover:bg-[var(--color-surface-raised)]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>סימולטור ויזואלי אינטראקטיבי (LIVE)</span>
          </button>
        </div>

        {/* Component Content (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-[var(--color-text-secondary)] dark:text-[var(--color-text-primary)]">
          
          {/* TAB 1: Sigma vs S */}
          {activeTab === 'sigma-vs-s' && (
            <div className="space-y-5 animate-fade-in text-right">
              {/* Intro Banner */}
              <div className="p-4 rounded-lg bg-[var(--color-accent-brass)]/15 dark:bg-[var(--color-warning)]/5 border border-[var(--color-warning)]/50 dark:border-[var(--color-warning)]/40 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--color-warning)]/10 dark:bg-[var(--color-warning)]/20 text-[var(--color-warning)] dark:text-[var(--color-warning)] mt-0.5">
                  <Info className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-extrabold text-sm text-[var(--color-warning)] dark:text-[var(--color-accent-brass)]">
                    ההבחנה קריטית: האם אנחנו יודעים על הכל, או רק על דגימה קטנה?
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] leading-relaxed">
                    בסטטיסטיקה, יש קו מפריד ברור בין <strong>האוכלוסייה האמיתית והשלמה</strong> (שעליה כמעט אף פעם אין לנו נתונים מלאים) לבין <strong>המדגם</strong> המוגבל שיש לנו בפועל ביד.
                  </p>
                </div>
              </div>

              {/* Grid Box Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Population Side */}
                <div className="p-4 rounded-lg border border-[var(--color-accent-cobalt-line)] dark:border-[var(--color-accent-cobalt-line)]/40 bg-[var(--color-accent-cobalt-bg)]/10 dark:bg-[var(--color-accent-cobalt-strong)]/5 hover:border-[var(--color-accent-cobalt-line)] dark:hover:border-[var(--color-accent-cobalt-line)] transition-all shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-accent-cobalt-bg)] dark:bg-[var(--color-accent-cobalt-strong)]/30 text-[var(--color-accent-cobalt)] dark:text-[var(--color-accent-cobalt)] text-caption sm:text-xs font-black">
                      אוכלוסייה (עולם תיאורטי)
                    </span>
                    <span className="text-xl font-bold text-[var(--color-accent-cobalt)] dark:text-[var(--color-accent-cobalt)] font-mono"><InlineMath math="\sigma" /> (Sigma)</span>
                  </div>
                  
                  <h5 className="font-black text-xs sm:text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-1.5">
                    סטיית תקן של האוכלוסייה (Population SD)
                  </h5>
                  <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] leading-relaxed mb-4">
                    מייצגת את הפיזור החיוני והקבוע של הנתונים בעולם האמיתי (למשל: הגובה של כלל תושבי המדינה). היא קבועה לחלוטין ומהווה <strong>פרמטר</strong> לא ידוע.
                  </p>

                  <div className="bg-white dark:bg-[var(--color-surface)] p-2.5 rounded-lg border border-[var(--color-accent-cobalt-line)] dark:border-[var(--color-border)] text-center">
                    <span className="block text-body-xs text-[var(--color-text-secondary)] mb-1">נוסחת החישוב באוכלוסייה (חלוקה ב-N):</span>
                    <InlineMath math="\sigma = \sqrt{\frac{\sum_{i=1}^{N}(x_i - \mu)^2}{N}}" />
                  </div>
                </div>

                {/* Sample Side */}
                <div className="p-4 rounded-lg border border-[var(--color-accent-teal)] dark:border-[var(--color-accent-teal)]/40 bg-[var(--color-accent-teal)]/10 dark:bg-[var(--color-accent-teal)]/5 hover:border-[var(--color-accent-teal)] dark:hover:border-[var(--color-accent-teal)] transition-all shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-accent-teal)] dark:bg-[var(--color-accent-teal)]/30 text-[var(--color-success)] dark:text-[var(--color-accent-teal)] text-caption sm:text-xs font-black">
                      מדגם (עולם מעשי - הנתונים שיש לנו)
                    </span>
                    <span className="text-xl font-bold text-[var(--color-success)] dark:text-[var(--color-success)] font-mono"><InlineMath math="S" /> (Capital S)</span>
                  </div>
                  
                  <h5 className="font-black text-xs sm:text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-1.5">
                    סטיית תקן של המדגם (Sample SD)
                  </h5>
                  <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] leading-relaxed mb-4">
                    מחושבת ישירות על בסיס הנתונים שאספנו בפועל. היא <strong>סטטיסטי</strong> (אומדן ל-<InlineMath math="\sigma" /> האמיתית) ומשתנה ממדגם למדגם.
                  </p>

                  <div className="bg-white dark:bg-[var(--color-surface)] p-2.5 rounded-lg border border-[var(--color-accent-teal)] dark:border-[var(--color-border)] text-center">
                    <span className="block text-body-xs text-[var(--color-text-secondary)] mb-1">נוסחת המדגם המתוקנת (חלוקה ב-n-1):</span>
                    <InlineMath math="S = \sqrt{\frac{\sum_{i=1}^{n}(x_i - \overline{X})^2}{n - 1}}" />
                  </div>
                </div>
              </div>

              {/* The n-1 Secret: Bessel's Correction */}
              <div className="p-4 rounded-lg bg-[var(--color-accent-cobalt-bg)]/10 dark:bg-[var(--color-surface-raised)]/40 border border-[var(--color-border)] dark:border-[var(--color-border)]">
                <h4 className="font-extrabold text-xs sm:text-sm text-[var(--color-accent-cobalt)] dark:text-[var(--color-accent-cobalt)] mb-2 font-sans">
                  למה מחלקים ב-<InlineMath math="n-1" /> במדגם ולא ב-<InlineMath math="n" />? (תיקון בסל - Bessel's Correction)
                </h4>
                <div className="text-xs space-y-2.5 text-[var(--color-text-secondary)] dark:text-[var(--color-text-primary)] leading-relaxed">
                  <p>
                    כשאנחנו רוצים לחשב את השונות של המדגם, אין לנו את התוחלת האמיתית <InlineMath math="\mu" /> של האוכלוסייה. אנחנו נאלצים להחליף אותה בממוצע המדגם שלנו <InlineMath math="\overline{X}" />.
                  </p>
                  <p>
                    מכיוון שאנו משתמשים בממוצע המדגמי, הערכים במדגם נוטים להיות <strong>קרובים יותר לממוצע של עצמם</strong> מאשר לתוחלת האוכלוסייה האמיתית. אם סתם נחלק ב-<InlineMath math="n" />, נקבל אומדן שהוא תמיד <strong>מוטה כלפי מטה</strong> (אנחנו "נעריך בחסר" את הפיזור האמיתי בעולם בריבוע).
                  </p>
                  <p className="font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                    💡 החוק הדמוקרטי: חלוקה ב-<InlineMath math="n-1" /> מפצה במדויק על איבוד דרגת חופש אחת (בגלל השימוש בממוצע), ומחזירה לנו אומד חסר הטיה לשונות האמיתית!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Standard Error Mathematical Proof */}
          {activeTab === 'standard-error' && (
            <div className="space-y-5 animate-fade-in text-right">
              {/* Core Math Concept banner */}
              <div className="p-4.5 rounded-lg bg-[var(--color-accent-cobalt-strong)]/5 dark:bg-[var(--color-accent-cobalt-strong)]/10 border border-[var(--color-accent-cobalt-line)] dark:border-[var(--color-accent-cobalt-line)]/30">
                <h4 className="font-extrabold text-sm text-[var(--color-accent-cobalt)] dark:text-[var(--color-accent-cobalt)] mb-1.5 font-sans">
                  איך "שגיאת התקן" נולדת מתמטית ואיך השורש יורד למטה?
                </h4>
                <p className="text-xs text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] leading-relaxed">
                  משתמשים רבים שואלים: <em>"אם שונות היא סטיית התקן בריבוע, למה בטעות תקן יש פתאום שורש של n במכנה?"</em>
                  <br />
                  בואו נעקוב צעד אחר צעד אחרי חוקי השונות כדי לראות בדיוק היכן השורש הזה נוצר!
                </p>
              </div>

              {/* Step by Step Expansion Cards */}
              <div className="space-y-3.5">
                {/* Step 1 */}
                <div className="p-3.5 bg-[var(--color-surface-raised)] dark:bg-[var(--color-surface)]/50 rounded-lg border border-[var(--color-border)] dark:border-[var(--color-border)]/80 flex gap-3.5">
                  <div className="flex-shrink-0 w-7 h-7 bg-[var(--color-accent-cobalt-strong)] text-white rounded-full flex items-center justify-center font-bold text-xs mt-0.5">
                    1
                  </div>
                  <div className="flex-1 space-y-1">
                    <h5 className="font-extrabold text-xs sm:text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                      מהי השונות של סכום מדגמים עצמאיים?
                    </h5>
                    <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] leading-relaxed mb-2">
                      נניח שדגמנו <InlineMath math="n" /> דגימות בלתי-תלויות, שלכל אחת מהן יש שונות קבועה <InlineMath math="\sigma^2" />. לפי חוקי חיבור שונויות של משתנים עצמאיים:
                    </p>
                    <div className="bg-white dark:bg-[var(--color-surface)] p-2.5 rounded border border-[var(--color-border)] dark:border-[var(--color-border)] text-center font-mono">
                      <BlockMath math="Var(X_1 + X_2 + \dots + X_n) = Var(X_1) + Var(X_2) + \dots + Var(X_n) = n\sigma^2" />
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 bg-[var(--color-surface-raised)] dark:bg-[var(--color-surface)]/50 rounded-lg border border-[var(--color-border)] dark:border-[var(--color-border)]/80 flex gap-3.5">
                  <div className="flex-shrink-0 w-7 h-7 bg-[var(--color-accent-cobalt-strong)] text-white rounded-full flex items-center justify-center font-bold text-xs mt-0.5">
                    2
                  </div>
                  <div className="flex-1 space-y-1">
                    <h5 className="font-extrabold text-xs sm:text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                      מהי השונות של ממוצע המדגם <InlineMath math="(\overline{X})" />?
                    </h5>
                    <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] leading-relaxed mb-2">
                      ממוצע הוא הסכום מחולק ב-<InlineMath math="n" />. נשתמש בחוק השונות הבסיסי: <InlineMath math="Var(a \cdot Y) = a^2 \cdot Var(Y)" /> (כאשר כופלים משתנה בקבוע, השונות גדלה <strong>בריבוע הקבוע</strong>):
                    </p>
                    <div className="bg-white dark:bg-[var(--color-surface)] p-2.5 rounded border border-[var(--color-border)] dark:border-[var(--color-border)] text-center font-mono">
                      <BlockMath math="Var(\overline{X}) = Var\left( \frac{1}{n} \sum X_i \right) = \frac{1}{n^2} \cdot Var\left( \sum X_i \right) = \frac{1}{n^2} \cdot (n\sigma^2) = \frac{\sigma^2}{n}" />
                    </div>
                    <p className="text-caption text-[var(--color-accent-cobalt)] dark:text-[var(--color-accent-cobalt)] font-bold mt-1">
                      ⭐ שימו לב: השונות של הממוצע היא השונות המקורית מחולקת ישירות ב-n! החלוקה היא בלי שורש!
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 bg-[var(--color-surface-raised)] dark:bg-[var(--color-surface)]/50 rounded-lg border border-[var(--color-border)] dark:border-[var(--color-border)]/80 flex gap-3.5">
                  <div className="flex-shrink-0 w-7 h-7 bg-[var(--color-accent-cobalt-strong)] text-white rounded-full flex items-center justify-center font-bold text-xs mt-0.5">
                    3
                  </div>
                  <div className="flex-1 space-y-1">
                    <h5 className="font-extrabold text-xs sm:text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                      נרד לשגיאת התקן (סטיית התקן של הממוצע!)
                    </h5>
                    <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] leading-relaxed mb-2">
                      שגיאת תקן (Standard Error) היא ההגדרה של <strong>סטיית התקן</strong> של ממוצע המדגם. כדי לחזור משונות לסטיית תקן, חובה עלינו לקחת את <strong>השורש הריבועי</strong> של השונות שקיבלנו בשלב הקודם:
                    </p>
                    <div className="bg-white dark:bg-[var(--color-surface)] p-2.5 rounded border border-[var(--color-border)] dark:border-[var(--color-border)] text-center font-mono text-base font-black text-[var(--color-accent-cobalt)] dark:text-[var(--color-accent-cobalt)] flex items-center justify-center gap-2">
                      <span><InlineMath math="SE = \sqrt{Var(\overline{X})} = \sqrt{\frac{\sigma^2}{n}} = \frac{\sigma}{\sqrt{n}}" /></span>
                    </div>
                    <p className="text-caption text-[var(--color-success)] dark:text-[var(--color-success)] leading-relaxed font-black mt-2">
                      🏆 הנה זה! השורש של ה-n נובע לגמרי מתוך חוקי השונות והשורש הריבועי ההיפוכי. זהו אכן פשוט סטיית התקן חלקי שורש המדגם!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Interactive Visual Simulator */}
          {activeTab === 'sqrt-intuition' && (
            <div className="space-y-5 animate-fade-in text-right">
              <div className="p-4 rounded-lg bg-[var(--color-surface-raised)] dark:bg-[var(--color-surface)]/50 border border-[var(--color-border)] dark:border-[var(--color-border)]">
                <h4 className="font-extrabold text-xs sm:text-sm text-[var(--color-accent-cobalt)] dark:text-[var(--color-accent-cobalt)] mb-2 font-sans">
                  איך גודל המדגם <InlineMath math="(n)" /> מכווץ את השגיאה?
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] leading-relaxed">
                  השתמש בסליידרים כדי לשנות את סטיית התקן של האוכלוסייה (<InlineMath math="\sigma" />) ואת גודל המדגם (<InlineMath math="n" />), ותראה כיצד עקומת התפלגות הממוצע (בכחול) מתכנסת ומצטמצמת בהשוואה לאוכלוסייה הרחבה (באפור/שחור)!
                </p>
              </div>

              {/* Input Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg border border-[var(--color-accent-cobalt-line)] dark:border-[var(--color-border)] bg-white dark:bg-[var(--color-surface)] shadow-sm">
                {/* Population Sigma (StDev) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-black text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] flex items-center gap-1.5">
                      סטיית תקן אוכלוסייה <InlineMath math="(\sigma)" />:
                    </span>
                    <span className="font-mono bg-[var(--color-accent-cobalt-bg)] dark:bg-[var(--color-surface-raised)] text-[var(--color-accent-cobalt)] dark:text-[var(--color-accent-cobalt)] px-2 py-0.5 rounded font-black text-xs">
                      {popSigma}
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={popSigma}
                    onChange={(e) => setPopSigma(Number(e.target.value))}
                    className="w-full cursor-pointer h-1.5 bg-[var(--color-surface-raised)] dark:bg-[var(--color-surface-raised)] rounded-lg appearance-none accent-indigo-600"
                  />
                  <span className="block text-body-xs text-[var(--color-text-secondary)]">
                    מייצגת את הפיזור הפנימי המקורי בכל דגימה בנפרד.
                  </span>
                </div>

                {/* Sample Size (n) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-black text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                      גודל מדגם פוטנציאלי <InlineMath math="(n)" />:
                    </span>
                    <span className="font-mono bg-[var(--color-accent-cobalt-bg)] dark:bg-[var(--color-surface-raised)] text-[var(--color-accent-cobalt)] dark:text-[var(--color-accent-cobalt)] px-2 py-0.5 rounded font-black text-xs">
                      {sampleSize} דגימות
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={sampleSize}
                    onChange={(e) => setSampleSize(Number(e.target.value))}
                    className="w-full cursor-pointer h-1.5 bg-[var(--color-surface-raised)] dark:bg-[var(--color-surface-raised)] rounded-lg appearance-none accent-indigo-600"
                  />
                  <span className="block text-body-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                    <span>שורש מספר הדגימות:</span>
                    <span className="font-mono font-bold text-[var(--color-accent-cobalt)]"><InlineMath math={`\\sqrt{n} = ${Math.sqrt(sampleSize).toFixed(2)}`} /></span>
                  </span>
                </div>
              </div>

              {/* Real-time Math Output Box */}
              <div className="p-3 bg-gradient-to-r from-[var(--color-accent-cobalt)]/5 to-[var(--color-accent-cobalt)]/20 dark:from-[var(--color-background)] bg-[var(--color-surface-raised)] dark:bg-[var(--color-surface)]/40 rounded-lg border border-dashed border-[var(--color-accent-cobalt-line)] dark:border-[var(--color-border)] text-center grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div className="space-y-1">
                  <span className="block text-body-xs text-[var(--color-text-secondary)]">סטיית תקן בריבוע (שונות האוכלוסייה):</span>
                  <span className="font-mono text-sm font-extrabold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                    <InlineMath math={`\\sigma^2 = ${popSigma}^2 = ${popSigma * popSigma}`} />
                  </span>
                </div>
                <div className="space-y-1 border-y md:border-y-0 md:border-x border-[var(--color-border)] dark:border-[var(--color-border)] py-2 md:py-0">
                  <span className="block text-body-xs text-[var(--color-accent-cobalt)]">חישוב שונות הממוצע (בלי שורש):</span>
                  <span className="font-mono text-sm font-extrabold text-[var(--color-accent-cobalt)] dark:text-[var(--color-accent-cobalt)]">
                    <InlineMath math={`Var(\\overline{X}) = \\frac{\\sigma^2}{n} = \\frac{${popSigma * popSigma}}{${sampleSize}} = ${(popSigma * popSigma / sampleSize).toFixed(2)}`} />
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="block text-body-xs text-[var(--color-success)]">שגיאת התקן של הממוצע (עם שורש n):</span>
                  <span className="font-mono text-base font-black text-[var(--color-success)] dark:text-[var(--color-success)] block bg-[var(--color-accent-teal)] dark:bg-[var(--color-accent-teal)]/20 px-3 py-1 rounded inline-block">
                    <InlineMath math={`SE = \\frac{\\sigma}{\\sqrt{n}} = \\frac{${popSigma}}{\\sqrt{${sampleSize}}} = ${standardError.toFixed(3)}`} />
                  </span>
                </div>
              </div>

              {/* Graph Area */}
              <div className="p-4 rounded-lg border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-surface-raised)]/50 dark:bg-[var(--color-surface)]/50 space-y-3">
                <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                  <span className="font-extrabold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                    השוואה גרפית חיה של פונקציות צפיפות ההסתברות
                  </span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 font-bold">
                      <span className="w-3.5 h-1 border-t-2 border-[var(--color-border)] inline-block"></span>
                      <span className="text-[var(--color-text-secondary)]">פיזור האוכלוסייה (<InlineMath math="\sigma" />)</span>
                    </label>
                    <label className="flex items-center gap-1.5 font-bold text-[var(--color-accent-cobalt)] dark:text-[var(--color-accent-cobalt)]">
                      <span className="w-3.5 h-1 border-t-2 border-[var(--color-accent-cobalt-line)] inline-block"></span>
                      <span>פיזור ממוצע המדגם (שגיאת תקן)</span>
                    </label>
                  </div>
                </div>

                {/* SVG Graph rendering */}
                <div className="relative h-[200px] bg-white dark:bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] dark:border-[var(--color-border)] flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
                    {/* Center Axis Grid Line */}
                    <line x1={meanX} y1="10" x2={meanX} y2={height - 10} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
                    
                    {/* Population Curve */}
                    <path 
                      d={generateBellCurvePath(popSigma)} 
                      fill="none" 
                      stroke="#94a3b8" 
                      strokeWidth="2.5" 
                      className="transition-all duration-300"
                    />

                    {/* Standard Error (Averages Curve) */}
                    <path 
                      d={generateBellCurvePath(standardError)} 
                      fill="none" 
                      stroke="#4f46e5" 
                      strokeWidth="3.5" 
                      className="transition-all duration-150"
                    />
                  </svg>
                </div>
                
                <p className="text-body-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] text-center leading-relaxed">
                  העקומה הסטנדרטית הכללית מציגה כי ככל שגודל המדגם <InlineMath math="n" /> גדל, הממוצעים של המדגמים נוטים להתרכז בחוזקה מוחלטת סביב המרכז. השגיאה הולכת ונמוגה במהירות!
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-surface-raised)] dark:bg-[var(--color-surface)]/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">
            * השתמש במדריך זה ככלי תומך להבנת המבחנים ורווחי הסמך.
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-[var(--color-accent-cobalt-strong)] text-white font-black rounded-lg hover:bg-[var(--color-accent-cobalt-strong)] shadow shadow-[var(--color-accent-cobalt-line)]/10 hover:shadow-lg transition-all"
          >
            אישור, הבנתי!
          </button>
        </div>
      </motion.div>
    </div>
  );
}
