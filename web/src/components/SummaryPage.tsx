import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { BookText, Sparkles, Award, Lightbulb } from 'lucide-react';
function GoldenRuleCard({ title, children, example, watermark, icon: Icon = Sparkles }: { title: string, children: React.ReactNode, example?: React.ReactNode, watermark?: string, icon?: React.ElementType }) {
  return (
    <div className="bg-gradient-to-br from-[var(--color-surface-raised)] to-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col gap-4 shadow-lg relative overflow-hidden group hover:border-[var(--color-primary)]/40 transition-all duration-300">
      <div className="absolute top-0 right-0 w-1.5 h-full bg-[var(--color-primary)] opacity-70 group-hover:opacity-100 transition-opacity z-10" />
      
      {watermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0" aria-hidden="true">
          <div className="text-8xl font-bold opacity-[0.02] transform -rotate-12 scale-150 text-[var(--color-primary)] group-hover:opacity-[0.04] transition-opacity duration-300">
            <InlineMath math={watermark} />
          </div>
        </div>
      )}

      <div className="flex gap-4 relative z-10">
        <div className="mt-0.5 text-[var(--color-primary)]">
          <Icon className="w-6 h-6 opacity-90 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-extrabold text-[var(--color-text-primary)] mb-1.5">{title}</h3>
          <div className="text-[var(--color-text-secondary)] leading-relaxed relative z-10">
            {children}
          </div>
        </div>
      </div>

      {example && (
        <div className="mt-auto pt-4 border-t border-[var(--color-border)]/40 relative z-10">
          <div className="bg-[var(--color-surface-elevated)] rounded-xl py-2 px-4 border border-[var(--color-border-strong)] shadow-[var(--shadow-soft)]">
            <div className="text-center text-[var(--color-primary)] font-bold">
              {example}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { PageHeader } from './ui/PageHeader';

export default function SummaryPage(): React.ReactElement {
  return (
    <div className="w-full max-w-[90rem] mx-auto space-y-4 px-4 sm:px-0 py-8">
      <PageHeader title="משפטי ברזל" />
      <div className="w-full max-w-[90rem] mx-auto space-y-6 px-4 sm:px-0 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <GoldenRuleCard 
            title="תוחלות פשוטות"
            example={<BlockMath math="E(X+Y) = E(X) + E(Y)" />}
            watermark="E(X+Y)"
          >
            תוחלת של סכום שווה ל<span className="font-bold text-[var(--color-text-primary)] underline decoration-[var(--color-primary)] decoration-2 underline-offset-4">סכום התוחלות</span> - תמיד, בלי שום תנאים!
          </GoldenRuleCard>
          
          <GoldenRuleCard 
            title="מכפלות תוחלת"
            example={<BlockMath math="E(X \cdot Y) = E(X) \cdot E(Y)" />}
            watermark="E(XY)"
          >
            תוחלת של <span className="font-bold text-[var(--color-text-primary)] underline decoration-[var(--color-primary)] decoration-2 underline-offset-4">מכפלה</span> שווה למכפלת התוחלות - <span className="font-bold text-[var(--color-text-primary)] underline decoration-[var(--color-primary)] decoration-2 underline-offset-4">אך ורק</span> אם המשתנים בלתי תלויים.
          </GoldenRuleCard>
          
          <GoldenRuleCard 
            title="שונות מצטברת"
            example={<BlockMath math="V(X \pm Y) = V(X) + V(Y) \pm 2Cov(X,Y)" />}
            watermark="V(X \pm Y)"
          >
            שונות היא כמו גיל - אי אפשר לחסר אותה. היא <span className="font-bold text-[var(--color-text-primary)] underline decoration-[var(--color-accent-crimson)] decoration-2 underline-offset-4">תמיד מצטברת</span> (גם בהפרש משתנים <InlineMath math="X-Y" />).
          </GoldenRuleCard>
          
          <GoldenRuleCard 
            title="קבועים"
            example={<BlockMath math="E(cX) = cE(X), \quad V(cX) = c^2V(X)" />}
            watermark="c^2"
          >
            קבועים יוצאים מהתוחלת כמו שהם, אבל מהשונות הם קופצים <span className="font-bold text-[var(--color-text-primary)] underline decoration-[var(--color-primary)] decoration-2 underline-offset-4">בריבוע</span>.
          </GoldenRuleCard>
          
          <GoldenRuleCard 
            title="שונות של קבוע"
            example={<BlockMath math="V(c) = 0" />}
            watermark="V(c)=0"
          >
            שונות של קבוע היא <span className="font-bold text-[var(--color-text-primary)] underline decoration-[var(--color-primary)] decoration-2 underline-offset-4">אפס</span> - כי מה שקבוע, לעולם לא משתנה.
          </GoldenRuleCard>
          
          <GoldenRuleCard 
            title="חוסר הטיה"
            example={<BlockMath math="E(\hat{\theta}) = \theta" />}
            watermark="\hat{\theta}"
          >
            עומד נחשב <span className="font-bold text-[var(--color-text-primary)] underline decoration-[var(--color-accent-cobalt)] decoration-2 underline-offset-4">חסר הטיה</span> אם התוחלת שלו שווה בדיוק לפרמטר אותו הוא מנסה לאמוד.
          </GoldenRuleCard>
          
          <GoldenRuleCard 
            title="תכונת חוסר הזיכרון"
            example={<BlockMath math="P(X > s+t \mid X > s) = P(X > t)" />}
            watermark="Exp(\lambda)"
          >
            ההתפלגות המעריכית היא היחידה שאין לה <span className="font-bold text-[var(--color-text-primary)] underline decoration-[var(--color-primary)] decoration-2 underline-offset-4">זיכרון</span> - העבר לא מנבא שום דבר על העתיד.
          </GoldenRuleCard>
          
          <GoldenRuleCard 
            title="קורלציה לעומת תלות"
            example={<BlockMath math="Cov(X,Y)=0 \nRightarrow X \perp Y" />}
            watermark="\rho=0"
          >
            חוסר קורלציה (מתאם אפס) אומר שאין קשר <span className="font-bold text-[var(--color-text-primary)] underline decoration-[var(--color-accent-cobalt)] decoration-2 underline-offset-4">לינארי</span>, אבל בהחלט יכול להיות קשר מסוג אחר!
          </GoldenRuleCard>
          
          <GoldenRuleCard 
            title="משפט הגבול המרכזי"
            example={<BlockMath math="\bar{X} \approx N\left(\mu, \frac{\sigma^2}{n}\right)" />}
            watermark="משפט הגבול המרכזי"
          >
            לא משנה מאיזו צורה האוכלוסייה, אם תאספו מדגם מספיק גדול, הממוצעים ייראו <span className="font-bold text-[var(--color-text-primary)] underline decoration-[var(--color-primary)] decoration-2 underline-offset-4">נורמלים לחלוטין</span>.
          </GoldenRuleCard>
          
          <GoldenRuleCard 
            title="חוק המספרים הגדולים"
            example={<BlockMath math="\bar{X} \xrightarrow{n \to \infty} \mu" />}
            watermark="n \to \infty"
          >
            ככל שנדגום יותר, ממוצע המדגם <span className="font-bold text-[var(--color-text-primary)] underline decoration-[var(--color-primary)] decoration-2 underline-offset-4">יתביית וינעל</span> על התוחלת האמיתית של האוכלוסייה.
          </GoldenRuleCard>
          
          <GoldenRuleCard 
            title="קסם השורש"
            example={<BlockMath math="SD(\bar{X}) = \frac{\sigma}{\sqrt{n}}" />}
            watermark="\sqrt{n}"
          >
            שגיאת התקן של הממוצע מתכווצת ככל שהמדגם גדל, כי תמיד נחלק ב<span className="font-bold text-[var(--color-text-primary)] underline decoration-[var(--color-primary)] decoration-2 underline-offset-4">שורש גודל המדגם</span> (<InlineMath math="\sqrt{n}" />).
          </GoldenRuleCard>
          
          <GoldenRuleCard 
            title="טרייד-אוף הטעויות"
            example={<BlockMath math="\alpha \downarrow \implies \beta \uparrow \implies \text{Power} \downarrow" />}
            watermark="\alpha, \beta"
          >
            הקטנתם את אלפא כדי להוריד טעויות? העוצמה תיפגע. <span className="font-bold text-[var(--color-text-primary)] underline decoration-[var(--color-accent-crimson)] decoration-2 underline-offset-4">אי אפשר לאכול את העוגה ולהשאיר אותה שלמה</span>.
          </GoldenRuleCard>
        </div>
      </div>

      <div className="w-full max-w-[90rem] mx-auto space-y-6 px-4 sm:px-0 mt-12 mb-12">
        <div className="flex items-center gap-2.5 mb-6 border-b border-[var(--color-border)] pb-3">
          <BookText className="w-7 h-7 text-[var(--color-primary)]" />
          <h2 className="text-2xl font-extrabold text-[var(--color-text-primary)]">מושגי יסוד והבהרות</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <GoldenRuleCard
            title="רמת מובהקות (α) וטעות מסוג ראשון"
            watermark={String.raw`\alpha`}
            example={<BlockMath math={String.raw`\alpha = P(\text{Reject } H_0 \mid H_0 \text{ is true})`} />}
            icon={Lightbulb}
          >
            רמת המובהקות <InlineMath math={String.raw`\alpha`} /> היא ההסתברות לדחות את השערת האפס (<InlineMath math={String.raw`H_0`} />) כאשר היא נכונה. זוהי הטעות מסוג ראשון (Type I Error).
          </GoldenRuleCard>

          <GoldenRuleCard
            title="אלפא (α) ועוצמת המבחן (1 - β)"
            watermark={String.raw`1-\beta`}
            example={<BlockMath math={String.raw`\text{Power} = 1 - \beta = P(\text{Reject } H_0 \mid H_1 \text{ is true})`} />}
            icon={Lightbulb}
          >
            קיימות שתי טעויות אפשריות בבדיקת השערות:
            <ul className="list-disc pr-6 space-y-1 mt-2">
              <li>טעות מסוג ראשון (<InlineMath math={String.raw`\alpha`} />): דחיית <InlineMath math={String.raw`H_0`} /> למרות שהיא נכונה.</li>
              <li>טעות מסוג שני (<InlineMath math={String.raw`\beta`} />): קבלת <InlineMath math={String.raw`H_0`} /> למרות שהיא שגויה (<InlineMath math={String.raw`H_1`} /> נכונה).</li>
            </ul>
            <p className="mt-2">עוצמת המבחן היא ההסתברות לדחות את <InlineMath math={String.raw`H_0`} /> כאשר <InlineMath math={String.raw`H_1`} /> נכונה (החלטה נכונה).</p>
          </GoldenRuleCard>

          <GoldenRuleCard
            title="אזורי דחייה וקבלה"
            watermark={String.raw`H_0, H_1`}
            icon={Lightbulb}
          >
            אזור הדחייה ואזור הקבלה נקבעים אך ורק על ידי השערת האפס (<InlineMath math={String.raw`H_0`} />) ורמת המובהקות <InlineMath math={String.raw`\alpha`} />. הם לא משתנים אם השערת האלטרנטיבה (<InlineMath math={String.raw`H_1`} />) משתנה. מה שכן משתנה הוא עוצמת המבחן ו-<InlineMath math={String.raw`\beta`} />.
          </GoldenRuleCard>

          <GoldenRuleCard
            title="השערות על סוג התפלגות"
            watermark={String.raw`X \sim`}
            example={
              <div className="flex flex-col gap-1">
                <BlockMath math={String.raw`H_0: X \sim U(0,3)`} />
                <BlockMath math={String.raw`H_1: X \sim Bin(4, 0.2)`} />
              </div>
            }
            icon={Lightbulb}
          >
            יש לחשב את ההסתברויות לכל ערך אפשרי תחת כל אחת מההשערות, ולבחור את אזור הדחייה כך שההסתברות לקבל את הערכים הללו תחת <InlineMath math={String.raw`H_0`} /> תהיה בדיוק <InlineMath math={String.raw`\alpha`} />.
          </GoldenRuleCard>

          <GoldenRuleCard
            title="טבלת החלטות וטעויות"
            watermark={String.raw`\alpha, \beta`}
            icon={Lightbulb}
          >
            <ul className="list-disc pr-6 space-y-1">
              <li><strong>החלטה נכונה</strong> (<InlineMath math={String.raw`1 - \alpha`} />): מקבלים את <InlineMath math={String.raw`H_0`} /> והיא נכונה.</li>
              <li><strong>טעות מסוג ראשון</strong> (<InlineMath math={String.raw`\alpha`} />): דוחים את <InlineMath math={String.raw`H_0`} /> למרות שהיא נכונה.</li>
              <li><strong>טעות מסוג שני</strong> (<InlineMath math={String.raw`\beta`} />): מקבלים את <InlineMath math={String.raw`H_0`} /> למרות שהיא שגויה.</li>
              <li><strong>עוצמה / החלטה נכונה</strong> (<InlineMath math={String.raw`1 - \beta`} />): דוחים את <InlineMath math={String.raw`H_0`} /> והיא אכן שגויה.</li>
            </ul>
          </GoldenRuleCard>

          <GoldenRuleCard
            title="חילוץ פרמטרים (משפט הגבול המרכזי)"
            watermark={String.raw`\mu, \sigma^2`}
            icon={Lightbulb}
          >
            כאשר ההשערות הן על סוג התפלגות, נשתמש בתוחלת ובשונות של ההתפלגות הנתונה. למשל עבור התפלגות אחידה <InlineMath math={String.raw`X \sim U(0, 10)`} />:
            <ul className="list-disc pr-6 space-y-1 mt-2">
              <li>תוחלת: <InlineMath math={String.raw`E(X) = \frac{0+10}{2} = 5`} /></li>
              <li>שונות: <InlineMath math={String.raw`V(X) = \frac{(10-0)^2}{12} = \frac{100}{12}`} /></li>
            </ul>
            <p className="mt-2">ואז נציב בנוסחת משפט הגבול המרכזי.</p>
          </GoldenRuleCard>

          <GoldenRuleCard
            title="למה מחלקים ב-n כשמתקננים ממוצע?"
            watermark={String.raw`\sqrt{n}`}
            example={<BlockMath math={String.raw`SD(\bar{X}) = \frac{\sigma}{\sqrt{n}}`} />}
            icon={Lightbulb}
          >
            השונות של ממוצע המדגם קטנה פי <InlineMath math={String.raw`n`} /> מהשונות המקורית של האוכלוסייה:
            <BlockMath math={String.raw`\text{Var}(\bar{X}) = \frac{\sigma^2}{n}`} />
            לכן שגיאת התקן של ממוצע המדגם (סטיית התקן שלו) מחושבת על ידי חלוקה ב-<InlineMath math={String.raw`\sqrt{n}`} />.
          </GoldenRuleCard>

          <GoldenRuleCard
            title="מתי מחלקים ב-n ומתי לא?"
            watermark={String.raw`n`}
            icon={Lightbulb}
          >
            <ul className="list-disc pr-6 space-y-2">
              <li><strong>ממוצע המדגם</strong> (<InlineMath math={String.raw`\bar{X}`} />): מחלקים את השונות ב-<InlineMath math={String.raw`n`} /> (ואת סטיית התקן ב-<InlineMath math={String.raw`\sqrt{n}`} />).</li>
              <li><strong>תצפית בודדת</strong> (<InlineMath math={String.raw`X`} />): משתמשים בשונות וסטיית התקן של האוכלוסייה כפי שהן (לא מחלקים ב-<InlineMath math={String.raw`n`} />).</li>
            </ul>
          </GoldenRuleCard>

          <GoldenRuleCard
            title="סיגמא (σ), S, ושגיאת תקן"
            watermark={String.raw`\sigma, S`}
            icon={Lightbulb}
          >
            <ul className="list-disc pr-6 space-y-2">
              <li><InlineMath math={String.raw`\sigma`} />: סטיית התקן של האוכלוסייה (פרמטר אמיתי, לרוב לא ידוע).</li>
              <li><InlineMath math={String.raw`S`} />: סטיית התקן של המדגם (אומדן ל-<InlineMath math={String.raw`\sigma`} />).</li>
              <li><InlineMath math={String.raw`\frac{\sigma}{\sqrt{n}}`} /> או <InlineMath math={String.raw`\frac{S}{\sqrt{n}}`} />: שגיאת התקן - סטיית התקן של התפלגות ממוצע המדגם. זוהי מידת הפיזור של הממוצעים סביב התוחלת.</li>
            </ul>
          </GoldenRuleCard>

          <GoldenRuleCard
            title="רווח סמך לתוחלת וערך Z"
            watermark={String.raw`Z_{1-\alpha/2}`}
            example={<BlockMath math={String.raw`\bar{X} \pm Z_{1 - \frac{\alpha}{2}} \cdot \frac{\sigma}{\sqrt{n}}`} />}
            icon={Lightbulb}
          >
            רווח סמך ברמת סמך <InlineMath math={String.raw`1 - \alpha`} /> הוא טווח שצפוי להכיל את הפרמטר האמיתי בהסתברות <InlineMath math={String.raw`1 - \alpha`} />.
            ערך ה-<InlineMath math={String.raw`Z`} /> מתקבל מטבלת ההתפלגות הנורמלית הסטנדרטית עבור שטח של <InlineMath math={String.raw`1 - \frac{\alpha}{2}`} />.
          </GoldenRuleCard>

          <GoldenRuleCard
            title="שלבים לפתרון שאלת השערות"
            watermark={String.raw`H_0 \to H_1`}
            icon={Lightbulb}
          >
            <ol className="list-decimal pr-6 space-y-1">
              <li>ניסוח השערות: <InlineMath math={String.raw`H_0`} /> מול <InlineMath math={String.raw`H_1`} />.</li>
              <li>קביעת רמת המובהקות (<InlineMath math={String.raw`\alpha`} />).</li>
              <li>בחירת סטטיסטי המבחן (למשל <InlineMath math={String.raw`Z`} /> או <InlineMath math={String.raw`t`} />).</li>
              <li>מציאת אזור הדחייה / ערך קריטי (או חישוב P-Value).</li>
              <li>חישוב סטטיסטי המבחן מהמדגם.</li>
              <li>קבלת החלטה: דחייה או קבלה של <InlineMath math={String.raw`H_0`} />.</li>
            </ol>
          </GoldenRuleCard>

          <GoldenRuleCard
            title="רווח סמך מול ערך קריטי"
            watermark={String.raw`Z`}
            icon={Lightbulb}
          >
            <ul className="list-disc pr-6 space-y-2">
              <li><strong>ברווח סמך</strong> המטרה היא לאמוד פרמטר, ולכן תמיד נשתמש ב-<InlineMath math={String.raw`Z_{1 - \frac{\alpha}{2}}`} /> (דו-צדדי).</li>
              <li><strong>בבדיקת השערות</strong>, הערך הקריטי תלוי בכיוון ההשערה:
                <ul className="list-disc pr-6 mt-1 space-y-1">
                  <li>במבחן חד-צדדי נשתמש ב-<InlineMath math={String.raw`Z_{1 - \alpha}`} />.</li>
                  <li>במבחן דו-צדדי נשתמש ב-<InlineMath math={String.raw`Z_{1 - \frac{\alpha}{2}}`} />.</li>
                </ul>
              </li>
            </ul>
          </GoldenRuleCard>

          <GoldenRuleCard
            title="ניסוח רשמי של עוצמה וטעות"
            watermark={String.raw`1-\beta`}
            icon={Lightbulb}
          >
            <div className="flex flex-col gap-2 mt-2">
              <div className="text-center">
                <span className="text-sm text-[var(--color-text-secondary)] font-bold mb-1 block">טעות מסוג שני (<InlineMath math={String.raw`\beta`} />):</span>
                <BlockMath math={String.raw`P(\text{Fail to reject } H_0 \mid H_1 \text{ is true})`} />
              </div>
              <div className="text-center border-t border-[var(--color-border)]/50 pt-2">
                <span className="text-sm text-[var(--color-text-secondary)] font-bold mb-1 block">עוצמת המבחן (<InlineMath math={String.raw`1-\beta`} />):</span>
                <BlockMath math={String.raw`P(\text{Reject } H_0 \mid H_1 \text{ is true})`} />
              </div>
            </div>
          </GoldenRuleCard>

          <GoldenRuleCard
            title="חישוב שונות המדגם S²"
            watermark={String.raw`S^2`}
            example={<BlockMath math={String.raw`S^2 = \frac{\sum_{i=1}^{n} (X_i - \bar{X})^2}{n-1}`} />}
            icon={Lightbulb}
          >
            שונות המדגם <InlineMath math={String.raw`S^2`} /> משמשת לאמידת שונות האוכלוסייה <InlineMath math={String.raw`\sigma^2`} /> כאשר היא אינה ידועה.
            <br/><br/>
            החלוקה ב-<InlineMath math={String.raw`n-1`} /> (דרגות החופש) מתקנת את ההטיה שיש באומדן כאשר משתמשים בממוצע המדגם במקום בתוחלת האמיתית.
          </GoldenRuleCard>

          <GoldenRuleCard
            title="הסתברות המובהקות (P-Value)"
            watermark={String.raw`\text{P-Val}`}
            icon={Lightbulb}
          >
            P-Value הוא ההסתברות לקבל תוצאה קיצונית לפחות כמו זו שהתקבלה, בהנחה ש-<InlineMath math={String.raw`H_0`} /> נכונה. הוא רמת המובהקות המינימלית לדחיית <InlineMath math={String.raw`H_0`} />.
            <ul className="list-disc pr-6 space-y-1 mt-2">
              <li>אם <InlineMath math={String.raw`\text{P-Value} \le \alpha`} /> <InlineMath math={String.raw`\to`} /> דוחים את <InlineMath math={String.raw`H_0`} />.</li>
              <li>אם <InlineMath math={String.raw`\text{P-Value} > \alpha`} /> <InlineMath math={String.raw`\to`} /> לא דוחים.</li>
            </ul>
          </GoldenRuleCard>

          <GoldenRuleCard
            title="אותיות גדולות לעומת קטנות"
            watermark={String.raw`X, x`}
            icon={Lightbulb}
          >
            <ul className="list-disc pr-6 space-y-2 mt-2">
              <li><strong>אותיות גדולות (<InlineMath math={String.raw`X, \bar{X}`} />):</strong> מייצגות משתנים מקריים (לפני לקיחת המדגם, לערכים שלהם יש הסתברויות).</li>
              <li><strong>אותיות קטנות (<InlineMath math={String.raw`x, \bar{x}`} />):</strong> מייצגות ערכים תצפיתיים מסוימים (אחרי לקיחת המדגם, מדובר במספרים קבועים).</li>
            </ul>
          </GoldenRuleCard>

          <GoldenRuleCard
            title="יסודות תורת האומדנים"
            watermark={String.raw`\hat{\theta}`}
            icon={Lightbulb}
          >
            אומד הוא נתון מהמדגם המשמש להערכת פרמטר באוכלוסייה. אומדן הוא הערך המספרי שהתקבל במדגם מסוים.
            <p className="mt-2">למשל, ממוצע המדגם <InlineMath math={String.raw`\bar{X}`} /> הוא <strong>אומד</strong> ל-<InlineMath math={String.raw`\mu`} />. כשנחשב ונקבל <InlineMath math={String.raw`\bar{x} = 5`} />, זהו <strong>אומדן</strong>.</p>
          </GoldenRuleCard>

          <GoldenRuleCard
            title="תכונות אומדים"
            watermark={String.raw`MSE`}
            example={<BlockMath math={String.raw`MSE(\hat{\theta}) = \text{Var}(\hat{\theta}) + [\text{Bias}(\hat{\theta})]^2`} />}
            icon={Lightbulb}
          >
            אומד טוב צריך לעמוד במספר קריטריונים:
            <ol className="list-decimal pr-6 space-y-1 mt-2">
              <li><strong>חוסר הטיה:</strong> <InlineMath math={String.raw`E(\hat{\theta}) = \theta`} />.</li>
              <li><strong>יעילות:</strong> שונות קטנה ככל האפשר בהשוואה לאומדים אחרים.</li>
            </ol>
            <p className="mt-2">מדד להערכת אומדים הוא פונקציית הפסד MSE.</p>
          </GoldenRuleCard>

          <GoldenRuleCard
            title="טעויות בחישוב שונות וסטיית תקן"
            watermark={String.raw`SD`}
            example={<BlockMath math={String.raw`SD(X+Y) = \sqrt{\text{Var}(X) + \text{Var}(Y)}`} />}
            icon={Lightbulb}
          >
            <ul className="list-disc pr-6 space-y-2">
              <li><strong>הוצאת שורש:</strong> השונות היא ביחידות ריבועיות. תמיד צריך להוציא שורש כדי לקבל סטיית תקן.</li>
              <li>
                <strong>חיבור סטיות תקן:</strong> אי אפשר לחבר סטיות תקן! חברו שונויות (של משתנים בלתי תלויים) ורק אז הוציאו שורש.
              </li>
            </ul>
          </GoldenRuleCard>
        </div>
      </div>
    </div>
  );
}
