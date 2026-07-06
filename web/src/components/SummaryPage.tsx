import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { Disclosure } from './ui/CustomComponents';
import { FormulaBlock } from './ui/FormulaBlock';
import { BookText } from 'lucide-react';

export default function SummaryPage(): React.ReactElement {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 px-4 sm:px-0 py-8">
      <div className="flex items-center gap-3 py-2 mb-6">
        <BookText className="w-8 h-8 text-[var(--color-primary)]" />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
          סיכום שיעור סטטיסטיקה
        </h1>
      </div>
      <div className="w-full max-w-4xl mx-auto space-y-4 px-4 sm:px-0">
        <Disclosure
          title="1. רמת מובהקות (α) וטעות מסוג ראשון"
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="space-y-3 text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <p>
              רמת המובהקות <InlineMath math="\alpha" /> היא ההסתברות לדחות את השערת האפס (<InlineMath math="H_0" />) כאשר היא נכונה. זוהי הטעות מסוג ראשון (Type I Error).
            </p>
            <FormulaBlock>
              <BlockMath math="\alpha = P(\text{Reject } H_0 \mid H_0 \text{ is true})" />
            </FormulaBlock>
          </div>
        </Disclosure>

        <Disclosure
          title="2. הקשר וההבדל בין אלפא (α) לעוצמת המבחן (1 - β)"
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="space-y-3 text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <p>קיימות שתי טעויות אפשריות בבדיקת השערות:</p>
            <ul className="list-disc pr-6 space-y-1">
              <li>טעות מסוג ראשון (<InlineMath math="\alpha" />): דחיית <InlineMath math="H_0" /> למרות שהיא נכונה.</li>
              <li>טעות מסוג שני (<InlineMath math="\beta" />): קבלת <InlineMath math="H_0" /> למרות שהיא שגויה (כלומר <InlineMath math="H_1" /> נכונה).</li>
            </ul>
            <p>עוצמת המבחן היא ההסתברות לדחות את <InlineMath math="H_0" /> כאשר <InlineMath math="H_1" /> נכונה (החלטה נכונה).</p>
            <FormulaBlock>
              <BlockMath math="\text{Power} = 1 - \beta = P(\text{Reject } H_0 \mid H_1 \text{ is true})" />
            </FormulaBlock>
          </div>
        </Disclosure>

        <Disclosure
          title="3. אזורי דחייה וקבלה - האם הם משתנים או זזים?"
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <p>
              אזור הדחייה ואזור הקבלה נקבעים אך ורק על ידי השערת האפס (<InlineMath math="H_0" />) ורמת המובהקות <InlineMath math="\alpha" />. הם לא משתנים אם השערת האלטרנטיבה (<InlineMath math="H_1" />) משתנה. מה שכן משתנה כתוצאה משינוי ב-<InlineMath math="H_1" /> הוא עוצמת המבחן ו-<InlineMath math="\beta" />, כיוון שההתפלגות תחת <InlineMath math="H_1" /> זזה.
            </p>
          </div>
        </Disclosure>

        <Disclosure
          title="4. ניסוח השערות על סוג התפלגות"
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="space-y-3 text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <p>במקרים בהם ההשערה נוגעת לסוג ההתפלגות כולו (למשל, בין אחידה לבינומית):</p>
            <FormulaBlock>
              <BlockMath math="H_0: X \sim U(0,3)" />
              <BlockMath math="H_1: X \sim Bin(4, 0.2)" />
            </FormulaBlock>
            <p>
              יש לחשב את ההסתברויות לכל ערך אפשרי תחת כל אחת מההשערות, ולבחור את אזור הדחייה כך שההסתברות לקבל את הערכים הללו תחת <InlineMath math="H_0" /> תהיה בדיוק <InlineMath math="\alpha" />.
            </p>
          </div>
        </Disclosure>

        <Disclosure
          title="5. טבלת החלטות וטעויות (מטריצת הבלבולים)"
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <ul className="list-disc pr-6 space-y-2">
              <li>החלטה: מקבלים את <InlineMath math="H_0" />, מציאות: <InlineMath math="H_0" /> נכונה <InlineMath math="\leftarrow" /> החלטה נכונה (הסתברות <InlineMath math="1 - \alpha" />)</li>
              <li>החלטה: דוחים את <InlineMath math="H_0" />, מציאות: <InlineMath math="H_0" /> נכונה <InlineMath math="\leftarrow" /> טעות מסוג ראשון (<InlineMath math="\alpha" />)</li>
              <li>החלטה: מקבלים את <InlineMath math="H_0" />, מציאות: <InlineMath math="H_1" /> נכונה <InlineMath math="\leftarrow" /> טעות מסוג שני (<InlineMath math="\beta" />)</li>
              <li>החלטה: דוחים את <InlineMath math="H_0" />, מציאות: <InlineMath math="H_1" /> נכונה <InlineMath math="\leftarrow" /> החלטה נכונה / עוצמה (<InlineMath math="1 - \beta" />)</li>
            </ul>
          </div>
        </Disclosure>

        <Disclosure
          title="6. חילוץ פרמטרים ממשפט הגבול המרכזי (CLT) כשההשערה היא התפלגות מלאה"
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="space-y-3 text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <p>
              כאשר ההשערות הן על סוג התפלגות, נשתמש בתוחלת ובשונות של ההתפלגות הנתונה. למשל עבור התפלגות אחידה <InlineMath math="X \sim U(0, 10)" />:
            </p>
            <ul className="list-disc pr-6 space-y-2">
              <li>תוחלת: <InlineMath math="E(X) = \frac{0+10}{2} = 5" /></li>
              <li>שונות: <InlineMath math="V(X) = \frac{(10-0)^2}{12} = \frac{100}{12}" /></li>
            </ul>
            <p>
              ואז נציב בנוסחת משפט הגבול המרכזי כדי למצוא את התפלגות ממוצע המדגם.
            </p>
          </div>
        </Disclosure>

        <Disclosure
          title="7. למה מחלקים ב-n כשמתקננים ממוצע (שורש שונות חלקי מדגם)?"
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="space-y-3 text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <p>
              כאשר דוגמים <InlineMath math="n" /> תצפיות ומחשבים את ממוצע המדגם <InlineMath math="\bar{X}" />, השונות של ממוצע המדגם קטנה פי <InlineMath math="n" /> מהשונות המקורית של האוכלוסייה. לכן:
            </p>
            <FormulaBlock>
              <BlockMath math="\text{Var}(\bar{X}) = \frac{\sigma^2}{n}" />
            </FormulaBlock>
            <p>ומכאן שסטיית התקן (שגיאת התקן) של ממוצע המדגם היא:</p>
            <FormulaBlock>
              <BlockMath math="SD(\bar{X}) = \frac{\sigma}{\sqrt{n}}" />
            </FormulaBlock>
          </div>
        </Disclosure>

        <Disclosure
          title="8. מתי מחלקים ב-n ומתי לא?"
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <ul className="list-disc pr-6 space-y-2">
              <li>כאשר שואלים על <strong>ממוצע המדגם</strong> (<InlineMath math="\bar{X}" />): מחלקים את השונות ב-<InlineMath math="n" /> (ואת סטיית התקן ב-<InlineMath math="\sqrt{n}" />).</li>
              <li>כאשר שואלים על <strong>תצפית בודדת</strong> (<InlineMath math="X" />): משתמשים בשונות וסטיית התקן של האוכלוסייה כפי שהן (לא מחלקים ב-<InlineMath math="n" />).</li>
            </ul>
          </div>
        </Disclosure>

        <Disclosure
          title='9. סלט של סימנים ונוסחאות: סיגמא (σ), S, ו"טעות התקן" (שגיאת תקן)'
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <ul className="list-disc pr-6 space-y-2">
              <li><InlineMath math="\sigma" />: סטיית התקן של האוכלוסייה (פרמטר אמיתי, לרוב לא ידוע).</li>
              <li><InlineMath math="S" />: סטיית התקן של המדגם (אומדן ל-<InlineMath math="\sigma" />).</li>
              <li><InlineMath math="\frac{\sigma}{\sqrt{n}}" /> או <InlineMath math="\frac{S}{\sqrt{n}}" />: שגיאת התקן - סטיית התקן של התפלגות ממוצע המדגם. זוהי מידת הפיזור של הממוצעים האפשריים סביב התוחלת האמיתית.</li>
            </ul>
          </div>
        </Disclosure>

        <Disclosure
          title="10. רווח סמך לתוחלת ואיך מוצאים את ערך ה-Z"
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="space-y-3 text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <p>
              רווח סמך ברמת סמך <InlineMath math="1 - \alpha" /> הוא טווח ערכים שצפוי להכיל את הפרמטר האמיתי בהסתברות <InlineMath math="1 - \alpha" />. עבור תוחלת <InlineMath math="\mu" /> כאשר <InlineMath math="\sigma" /> ידוע:
            </p>
            <FormulaBlock>
              <BlockMath math="\bar{X} \pm Z_{1 - \frac{\alpha}{2}} \cdot \frac{\sigma}{\sqrt{n}}" />
            </FormulaBlock>
            <p>
              ערך ה-<InlineMath math="Z" /> מתקבל מטבלת ההתפלגות הנורמלית הסטנדרטית עבור שטח של <InlineMath math="1 - \frac{\alpha}{2}" />.
            </p>
          </div>
        </Disclosure>

        <Disclosure
          title="11. אלגוריתם עבודה: השלבים לפתרון שאלת בדיקת השערות"
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <ol className="list-decimal pr-6 space-y-1">
              <li>ניסוח השערות: <InlineMath math="H_0" /> מול <InlineMath math="H_1" />.</li>
              <li>קביעת רמת המובהקות (<InlineMath math="\alpha" />).</li>
              <li>בחירת סטטיסטי המבחן (למשל <InlineMath math="Z" /> או <InlineMath math="t" />).</li>
              <li>מציאת אזור הדחייה / ערך קריטי (או חישוב P-Value).</li>
              <li>חישוב סטטיסטי המבחן מהמדגם.</li>
              <li>קבלת החלטה: דחייה או קבלה של <InlineMath math="H_0" />.</li>
            </ol>
          </div>
        </Disclosure>

        <Disclosure
          title="12. הבלבול הנפוץ: רווח סמך מול ערך קריטי"
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <ul className="list-disc pr-6 space-y-2">
              <li><strong>ברווח סמך</strong>, המטרה היא לאמוד פרמטר לא ידוע בתוך טווח, ולכן אנו תמיד משתמשים ב-<InlineMath math="Z_{1 - \frac{\alpha}{2}}" /> (מבחן דו-צדדי).</li>
              <li><strong>בבדיקת השערות</strong>, הערך הקריטי תלוי בכוון ההשערה:
                <ul className="list-disc pr-6 mt-1 space-y-1">
                  <li>במבחן חד-צדדי נשתמש ב-<InlineMath math="Z_{1 - \alpha}" />.</li>
                  <li>במבחן דו-צדדי נשתמש ב-<InlineMath math="Z_{1 - \frac{\alpha}{2}}" />.</li>
                </ul>
              </li>
            </ul>
          </div>
        </Disclosure>

        <Disclosure
          title="13. ניסוח רשמי ואקדמי של עוצמת המבחן (1 - β) וטעות מסוג שני (β)"
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="space-y-3 text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <FormulaBlock>
              <BlockMath math="\beta = P(\text{Fail to reject } H_0 \mid H_1 \text{ is true}) = P(\text{Test Statistic } \notin \text{ Rejection Region} \mid \mu = \mu_1)" />
            </FormulaBlock>
            <FormulaBlock>
              <BlockMath math="\text{Power} = 1 - \beta = P(\text{Reject } H_0 \mid H_1 \text{ is true}) = P(\text{Test Statistic } \in \text{ Rejection Region} \mid \mu = \mu_1)" />
            </FormulaBlock>
          </div>
        </Disclosure>

        <Disclosure
          title="14. כיצד נתון או מחושב S²"
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="space-y-3 text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <p>שונות המדגם <InlineMath math="S^2" /> משמשת לאמידת שונות האוכלוסייה <InlineMath math="\sigma^2" /> כאשר היא אינה ידועה.</p>
            <p>הנוסחה לחישוב מאומד חסר הטיה היא:</p>
            <FormulaBlock>
              <BlockMath math="S^2 = \frac{\sum_{i=1}^{n} (X_i - \bar{X})^2}{n-1}" />
            </FormulaBlock>
            <p>החלוקה ב-<InlineMath math="n-1" /> (דרגות החופש) מתקנת את ההטיה שיש באומדן כאשר משתמשים בממוצע המדגם במקום בתוחלת האמיתית.</p>
          </div>
        </Disclosure>

        <Disclosure
          title="15. הסתברות המובהקות (P-Value)"
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="space-y-3 text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <p>P-Value הוא ההסתברות לקבל תוצאה קיצונית לפחות כמו זו שהתקבלה במדגם, בהנחה ש-<InlineMath math="H_0" /> נכונה.</p>
            <ul className="list-disc pr-6 space-y-1">
              <li>אם <InlineMath math="\text{P-Value} \le \alpha" />, דוחים את <InlineMath math="H_0" />.</li>
              <li>אם <InlineMath math="\text{P-Value} > \alpha" />, לא דוחים את <InlineMath math="H_0" />.</li>
            </ul>
            <p>ה-P-Value הוא רמת המובהקות המינימלית שעבורה היינו דוחים את <InlineMath math="H_0" />.</p>
          </div>
        </Disclosure>

        <Disclosure
          title="16. אותיות גדולות לעומת קטנות"
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <p>בסטטיסטיקה, יש משמעות עמוקה להבדל בין אותיות גדולות לקטנות:</p>
            <ul className="list-disc pr-6 space-y-2 mt-2">
              <li><strong>אותיות גדולות (למשל <InlineMath math="X" />, <InlineMath math="\bar{X}" />):</strong> מייצגות משתנים מקריים (לפני לקיחת המדגם, לערכים שלהם יש הסתברויות).</li>
              <li><strong>אותיות קטנות (למשל <InlineMath math="x" />, <InlineMath math="\bar{x}" />):</strong> מייצגות ערכים תצפיתיים מסוימים (אחרי לקיחת המדגם, מדובר במספרים קבועים).</li>
            </ul>
          </div>
        </Disclosure>

        <Disclosure
          title="17. יסודות תורת האומדנים"
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="space-y-3 text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <p>אומד הוא נתון מהמדגם המשמש להערכת פרמטר באוכלוסייה. אומדן הוא הערך המספרי שהתקבל במדגם מסוים.</p>
            <p>למשל, ממוצע המדגם <InlineMath math="\bar{X}" /> הוא אומד לתוחלת האוכלוסייה <InlineMath math="\mu" />. כאשר נחשב אותו למדגם ספציפי ונקבל <InlineMath math="\bar{x} = 5" />, זהו האומדן.</p>
          </div>
        </Disclosure>

        <Disclosure
          title="18. תכונות אומדים והשוואה ביניהם"
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="space-y-3 text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <p>אומד טוב צריך לעמוד במספר קריטריונים:</p>
            <ol className="list-decimal pr-6 space-y-2">
              <li><strong>חוסר הטיה (Unbiasedness):</strong> התוחלת של האומד שווה לפרמטר האמיתי, <InlineMath math="E(\hat{\theta}) = \theta" />. הטיה מוגדרת כ- <InlineMath math="\text{Bias}(\hat{\theta}) = E(\hat{\theta}) - \theta" />.</li>
              <li><strong>יעילות (Efficiency):</strong> לאומד יש שונות קטנה ככל האפשר בהשוואה לאומדים חסרי הטיה אחרים.</li>
            </ol>
            <p>מדד להערכת אומדים הוא פונקציית הפסד MSE (Mean Squared Error):</p>
            <FormulaBlock>
              <BlockMath math="MSE(\hat{\theta}) = \text{Var}(\hat{\theta}) + [\text{Bias}(\hat{\theta})]^2" />
            </FormulaBlock>
          </div>
        </Disclosure>

        <Disclosure
          title="19. טעויות נפוצות בחישוב שונות וסטיית תקן"
          defaultOpen={false}
          accentOnOpen="brass"
        >
          <div className="text-body-base text-[var(--color-text-primary)] leading-relaxed">
            <ul className="list-disc pr-6 space-y-2">
              <li><strong>שכחת הוצאת שורש:</strong> השונות היא תמיד ביחידות ריבועיות. כדי לקבל את הפיזור ביחידות המקוריות יש להוציא שורש ריבועי לקבלת סטיית התקן.</li>
              <li>
                <strong>חיבור סטיות תקן:</strong> אי אפשר לחבר סטיות תקן. תמיד יש לחבר שונויות (של משתנים בלתי תלויים) ורק אז להוציא שורש:
                <FormulaBlock>
                  <BlockMath math="SD(X+Y) = \sqrt{\text{Var}(X) + \text{Var}(Y)} \neq SD(X) + SD(Y)" />
                </FormulaBlock>
              </li>
            </ul>
          </div>
        </Disclosure>
      </div>
    </div>
  );
}
