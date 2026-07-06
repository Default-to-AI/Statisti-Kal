import type { ReactElement, ReactNode } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import {
  Award,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Dice5,
  FunctionSquare,
  Lightbulb,
  Ruler,
  Sigma,
  Target,
  TriangleAlert,
} from 'lucide-react';
import {
  AnimatedDetails,
  Disclosure,
  HandwrittenNote,
  ReadingCalcBlock,
  ReadingFormulaBlock,
  ResultBlock,
  StepList,
} from './ui';

const CONTENT_WIDTH_CLASS = 'w-full max-w-[70rem] mx-auto';

function SectionDisclosure({
  id,
  title,
  eyebrow,
  icon,
  children,
  defaultOpen = true,
}: {
  id: string;
  title: string;
  eyebrow?: ReactNode;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}): ReactElement {
  return (
    <section id={id} data-toc className={`${CONTENT_WIDTH_CLASS} scroll-mt-24`}>
      <AnimatedDetails
        defaultOpen={defaultOpen}
        className="group overflow-hidden rounded-[var(--rounded-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm"
      >
        <summary className="flex items-center justify-between gap-4 px-5 py-5 text-right text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface)]/80 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--color-primary)]/35 bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              {icon}
            </div>
            <div className="space-y-2">
              {eyebrow ? <p className="text-sm font-semibold tracking-wide text-[var(--color-primary)]">{eyebrow}</p> : null}
              <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
            </div>
          </div>
          <span className="text-[var(--color-text-secondary)] transition-transform group-[.is-open]:rotate-180">
            <ChevronDown size={24} />
          </span>
        </summary>
        <div className="space-y-5 px-5 pb-6 pt-5 sm:px-6">{children}</div>
      </AnimatedDetails>
    </section>
  );
}

function SummaryCard({
  title,
  children,
  tone = 'brass',
}: {
  title: ReactNode;
  children: ReactNode;
  tone?: 'brass' | 'cobalt' | 'teal' | 'crimson';
}): ReactElement {
  const toneMap = {
    brass: 'border-[var(--color-primary)]/20 bg-[var(--color-primary)]/6',
    cobalt: 'border-[var(--color-accent-cobalt-line)]/35 bg-[var(--color-accent-cobalt-bg)]/20',
    teal: 'border-[var(--chart-2)]/30 bg-[var(--chart-2)]/8',
    crimson: 'border-[var(--color-accent-crimson)]/25 bg-[var(--color-accent-crimson)]/8',
  } as const;

  return (
    <div className={`rounded-[var(--rounded-xl)] border px-5 py-5 shadow-sm sm:px-6 ${toneMap[tone]}`}>
      <h3 className="text-lg font-bold text-[var(--color-text-primary)] sm:text-xl">{title}</h3>
      <div className="mt-3 text-base leading-relaxed text-[var(--color-text-secondary)]">{children}</div>
    </div>
  );
}

function BiasVisualCard(): ReactElement {
  return (
    <SummaryCard title="איך נראית הטיה?" tone="crimson">
      <p>
        ההטיה היא המרחק בין <InlineMath math="E(T)" /> לבין הפרמטר האמיתי <InlineMath math="\theta" />.
        אם מרכז הפגיעות של האומד יושב קבוע משמאל או מימין ל-<InlineMath math="\theta" />, יש הטיה.
      </p>
      <div className="mt-5 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
            <span>מוטה כלפי מטה</span>
            <span>יעד אמיתי</span>
          </div>
          <div className="relative h-3 rounded-full bg-[var(--color-surface)]">
            <div className="absolute inset-y-0 left-[18%] w-16 rounded-full bg-[var(--color-accent-crimson)]/55" />
            <div className="absolute inset-y-[-3px] left-1/2 w-[2px] -translate-x-1/2 rounded-full bg-[var(--color-primary)]" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
            <span>חסר הטיה</span>
            <span dir="ltr"><InlineMath math="E(T)=\theta" /></span>
          </div>
          <div className="relative h-3 rounded-full bg-[var(--color-surface)]">
            <div className="absolute inset-y-0 left-[calc(50%-2rem)] w-16 rounded-full bg-[var(--chart-2)]/55" />
            <div className="absolute inset-y-[-3px] left-1/2 w-[2px] -translate-x-1/2 rounded-full bg-[var(--color-primary)]" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
            <span>יעד אמיתי</span>
            <span>מוטה כלפי מעלה</span>
          </div>
          <div className="relative h-3 rounded-full bg-[var(--color-surface)]">
            <div className="absolute inset-y-0 right-[18%] w-16 rounded-full bg-[var(--color-accent-cobalt)]/55" />
            <div className="absolute inset-y-[-3px] left-1/2 w-[2px] -translate-x-1/2 rounded-full bg-[var(--color-primary)]" />
          </div>
        </div>
      </div>
    </SummaryCard>
  );
}

function PointEstimationPage(): ReactElement {
  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 text-[var(--color-text-primary)] sm:p-6 md:p-8" dir="rtl">
      <div className={`${CONTENT_WIDTH_CLASS} space-y-6`}>
        <section className="rounded-[calc(var(--rounded-xl)+6px)] border border-[var(--color-primary)]/25 bg-[linear-gradient(135deg,rgba(212,168,67,0.14),rgba(52,82,158,0.08))] px-5 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:px-7 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-4 text-right">
              <h1 className="text-4xl font-black tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
                אמידה נקודתית
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)] sm:text-xl">
                איך בוחרים אומד, איך בודקים אם הוא חסר הטיה, מתי אומד מוטה עדיין עדיף, ואיך שיטת
                <InlineMath math="\ MLE " /> מייצרת אומד ישירות מהנתונים.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-1 lg:w-[16rem]">
              <SummaryCard title="מה יופיע כאן?" tone="brass">
                מושגי יסוד, א.ח.ה, שונות ו-<InlineMath math="MSE" />, ועוד דוגמאות פתורות מיידיות מההרצאות.
              </SummaryCard>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 space-y-8">
        <SectionDisclosure id="point-overview" eyebrow="יסודות" title="מושגי יסוד באמידה" icon={<Target className="h-6 w-6" />}>
          <div className="grid gap-4 lg:grid-cols-3">
            <SummaryCard title="מילון קצר" tone="cobalt">
              <ul className="space-y-2">
                <li><strong>פרמטר:</strong> גודל קבוע אך לא ידוע באוכלוסייה.</li>
                <li><strong>סטטיסטי:</strong> פונקציה של המדגם, למשל <InlineMath math="\bar{X}, \sum X_i" />.</li>
                <li><strong>אומד:</strong> סטטיסטי שמיועד להעריך את <InlineMath math="\theta" />.</li>
                <li><strong>אמדן:</strong> הערך המספרי שקיבלנו בפועל מהמדגם.</li>
                <li><strong>טעות אמידה:</strong> <InlineMath math="\left|\hat{\theta}-\theta\right|" />.</li>
              </ul>
            </SummaryCard>
            <SummaryCard title="דוגמה מהירה" tone="teal">
              בכנסת ה-20 מפלגת מסוימת קיבלה 24 מנדטים בפועל. במדגם סקר אחד התקבלו 27.
              לכן <InlineMath math="\theta=24" />, האומד בפועל הוא <InlineMath math="\hat{\theta}=27" />,
              וטעות האמידה היא <InlineMath math="\left|27-24\right|=3" />.
            </SummaryCard>
            <BiasVisualCard />
          </div>

          <ReadingFormulaBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2" formulaName="הגדרת אומד חסר הטיה" translation="תוחלת האומד שווה בדיוק לפרמטר">
            <BlockMath math="Bias(T)=E(T)-\theta,\qquad T\ \text{חסר הטיה} \iff E(T)=\theta" />
          </ReadingFormulaBlock>

          <HandwrittenNote className={CONTENT_WIDTH_CLASS}>
            אומד חסר הטיה לא מבטיח פגיעה מושלמת בכל מדגם. הוא רק אומר שבממוצע, על פני הרבה דגימות,
            מרכז הטעות שלו יושב בדיוק על הפרמטר.
          </HandwrittenNote>
        </SectionDisclosure>

        <section className={`${CONTENT_WIDTH_CLASS} grid gap-4 lg:grid-cols-3`}>
          <SummaryCard title="פרמטר מול אומד" tone="teal">
            הפרמטר <InlineMath math="\theta" /> שייך לאוכלוסייה; האומד <InlineMath math="\hat{\theta}" /> מחושב מהמדגם.
          </SummaryCard>
          <SummaryCard title="חסר הטיה" tone="teal">
            אם <InlineMath math="E(T)=\theta" />, אין נטייה שיטתית לסטות למעלה או למטה.
          </SummaryCard>
          <SummaryCard title="לא תמיד אומד חסר הטיה מנצח" tone="crimson">
            לפעמים אומד מוטה עם שונות קטנה יותר נותן <InlineMath math="MSE" /> קטן יותר ולכן עדיף.
          </SummaryCard>
        </section>

        <SectionDisclosure id="unbiased-panel" eyebrow="אומדים חסרי הטיה" title="איך בודקים ומי עדיף" icon={<CheckCircle2 className="h-6 w-6" />}>
          <Disclosure
            title="בדיקת א.ח.ה לתוחלת בעזרת שלושה אומדים"
            icon={<Sigma className="h-5 w-5 text-[var(--color-primary)]" />}
            defaultOpen
            accentOnOpen="brass"
            watermark={<InlineMath math="\mu" />}
          >
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              עבור <InlineMath math="X_1,X_2,X_3" /> עם <InlineMath math="E(X_i)=\mu" />, נבדוק את
              <InlineMath math="T_1=2X_1-X_2,\ T_2=\frac{X_1+2X_2}{2},\ T_3=\frac{X_1+X_2+X_3}{3}" />.
            </p>

            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="E(T_1)=2E(X_1)-E(X_2)=2\mu-\mu=\mu" />
            </ReadingCalcBlock>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="E(T_2)=\frac{E(X_1)+2E(X_2)}{2}=\frac{\mu+2\mu}{2}=1.5\mu\neq\mu" />
            </ReadingCalcBlock>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="E(T_3)=\frac{E(X_1)+E(X_2)+E(X_3)}{3}=\mu" />
            </ReadingCalcBlock>

            <HandwrittenNote>
              מסקנה: <InlineMath math="T_1" /> ו-<InlineMath math="T_3" /> חסרי הטיה, אבל
              <InlineMath math="T_2" /> מוטה.
            </HandwrittenNote>
          </Disclosure>

          <Disclosure
            title="כששני האומדים חסרי הטיה: מי עדיף?"
            icon={<Ruler className="h-5 w-5 text-[var(--color-accent-cobalt)]" />}
            accentOnOpen="cobalt"
            watermark={<InlineMath math="V(T)" />}
          >
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              אם גם <InlineMath math="T_1" /> וגם <InlineMath math="T_3" /> חסרי הטיה, משווים שונות:
              מי שמתפזר פחות סביב <InlineMath math="\theta" /> עדיף.
            </p>

            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="V(T_1)=V(2X_1-X_2)=4V(X_1)+V(X_2)=500" />
            </ReadingCalcBlock>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="V(T_3)=V\left(\frac{X_1+X_2+X_3}{3}\right)=\frac{V(X_1)+V(X_2)+V(X_3)}{9}=\frac{300}{9}=33.33" />
            </ReadingCalcBlock>

            <ResultBlock className="py-2">
              <BlockMath math="V(T_3) < V(T_1)\Rightarrow T_3\ \text{עדיף}" />
            </ResultBlock>

            <HandwrittenNote>
              שני אומדים יכולים להיות חסרי הטיה, אבל הממוצע <InlineMath math="\bar{X}" /> יציב יותר מאומד פראי כמו
              <InlineMath math="2X_1-X_2" />.
            </HandwrittenNote>
          </Disclosure>

          <Disclosure
            title="לינאריות ודוגמאות קלאסיות"
            icon={<FunctionSquare className="h-5 w-5 text-[var(--chart-2)]" />}
            accentOnOpen="teal"
            watermark={<InlineMath math="aT+b" />}
          >
            <ReadingFormulaBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2" formulaName="שימור א.ח.ה בלינאריות" translation="אם T חסר הטיה ל-theta, אז טרנספורמציה לינארית שלו חסרת הטיה לטרנספורמציה המקבילה של theta">
              <BlockMath math="T\ \text{חסר הטיה ל-}\theta \Rightarrow aT+b\ \text{חסר הטיה ל-}a\theta+b" />
            </ReadingFormulaBlock>

            <div className="grid gap-4 lg:grid-cols-2">
              <SummaryCard title="אומדים חסרי הטיה שכדאי לזכור" tone="teal">
                <ol className="space-y-2">
                  <li><InlineMath math="\bar{X}" /> הוא אומד א.ח.ה לתוחלת <InlineMath math="\mu" />.</li>
                  <li><InlineMath math="\frac{\sum (X_i-\mu)^2}{n}" /> הוא אומד א.ח.ה לשונות כש-<InlineMath math="\mu" /> ידועה.</li>
                  <li><InlineMath math="S^2=\frac{\sum (X_i-\bar{X})^2}{n-1}" /> הוא אומד א.ח.ה לשונות כש-<InlineMath math="\mu" /> אינה ידועה.</li>
                </ol>
              </SummaryCard>
              <SummaryCard title="למה מחלקים ב- n-1 ?" tone="cobalt">
                כי שימוש ב-<InlineMath math="\bar{X}" /> במקום <InlineMath math="\mu" /> כבר "אכל" דרגת חופש אחת.
                החלוקה ב-<InlineMath math="n-1" /> מתקנת את ההטיה כלפי מטה.
              </SummaryCard>
            </div>
          </Disclosure>
        </SectionDisclosure>

        <SectionDisclosure id="mse-panel" eyebrow="קריטריון השוואה" title="שונות, הטיה ו- MSE" icon={<BarChart3 className="h-6 w-6" />}>
          <div className="grid gap-4 lg:grid-cols-3">
            <SummaryCard title="שונות" tone="teal">
              מודדת כמה האומד מתפזר ממדגם למדגם. שונות קטנה אומרת תוצאה יציבה יותר.
            </SummaryCard>
            <SummaryCard title="הטיה" tone="crimson">
              מודדת הסטה שיטתית של מרכז האומד: <InlineMath math="E(T)-\theta" />.
            </SummaryCard>
            <SummaryCard title="MSE" tone="cobalt">
              מחבר את שניהם למדד אחד: גם כמה האומד זז, וגם כמה הוא יושב לא במרכז.
            </SummaryCard>
          </div>

          <ReadingFormulaBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2" formulaName="תוחלת ריבוע הטעות" translation="שונות האומד ועוד ריבוע ההטיה">
            <BlockMath math="MSE(\hat{\theta})=E\left[(\hat{\theta}-\theta)^2\right]=V(\hat{\theta})+\left(E(\hat{\theta})-\theta\right)^2" />
          </ReadingFormulaBlock>

          <HandwrittenNote className={CONTENT_WIDTH_CLASS}>
            אומד מוטה לא נפסל אוטומטית. אם ההטיה קטנה אבל החיסכון בשונות גדול,
            ה-<InlineMath math="MSE" /> הכולל יכול להיות קטן יותר.
          </HandwrittenNote>

          <Disclosure
            title="דוגמה: אומד מוטה יכול להיות עדיף"
            icon={<Award className="h-5 w-5 text-[var(--color-primary)]" />}
            defaultOpen
            accentOnOpen="brass"
            watermark={<InlineMath math="U(0,\theta)" />}
          >
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              אם <InlineMath math="X\sim U(0,\theta)" />, נבדוק את <InlineMath math="T_1=2X" /> מול
              <InlineMath math="T_2=1.5X" />.
            </p>

            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="E(T_1)=2E(X)=2\cdot\frac{\theta}{2}=\theta,\qquad MSE(T_1)=V(T_1)=\frac{\theta^2}{3}" />
            </ReadingCalcBlock>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="Bias(T_2)=E(1.5X)-\theta=0.75\theta-\theta=-0.25\theta" />
            </ReadingCalcBlock>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="MSE(T_2)=V(T_2)+Bias(T_2)^2=\frac{9}{48}\theta^2+\frac{1}{16}\theta^2=\frac{1}{4}\theta^2" />
            </ReadingCalcBlock>

            <ResultBlock className="py-2">
              <BlockMath math="\frac{1}{4}\theta^2 < \frac{1}{3}\theta^2\Rightarrow T_2\ \text{עדיף}" />
            </ResultBlock>
          </Disclosure>

          <Disclosure
            title="דוגמה: הוספת קבוע לאומד"
            icon={<TriangleAlert className="h-5 w-5 text-[var(--color-accent-crimson)]" />}
            accentOnOpen="crimson"
            watermark={<InlineMath math="B(10,p)" />}
          >
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              עבור <InlineMath math="X\sim B(10,p)" />, נשווה בין <InlineMath math="T_1=\frac{X}{10}" /> ובין
              <InlineMath math="T_2=\frac{X+1}{10}" />.
            </p>

            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="E(T_1)=p,\qquad MSE(T_1)=V(T_1)=\frac{p(1-p)}{10}" />
            </ReadingCalcBlock>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="E(T_2)=p+0.1,\qquad MSE(T_2)=\frac{p(1-p)}{10}+0.01" />
            </ReadingCalcBlock>

            <HandwrittenNote>
              הוספת קבוע לא שינתה את השונות, אבל כן יצרה הטיה קבועה, ולכן רק הגדילה את
              <InlineMath math="MSE" />.
            </HandwrittenNote>
          </Disclosure>
        </SectionDisclosure>

        <SectionDisclosure id="mle-panel" title="אומד נראות מקסימלית (MLE)" icon={<Lightbulb className="h-6 w-6" />}>
          <div className="grid gap-4 lg:grid-cols-3">
            <SummaryCard title="רעיון אינטואיטיבי" tone="teal">
              אחרי שראינו מדגם, אנחנו שואלים: עבור איזה ערך של הפרמטר המדגם הזה היה הכי סביר להופיע?
              זה כל הרעיון של MLE.
            </SummaryCard>
            <SummaryCard title="מהי פונקציית נראות?" tone="cobalt">
              זו אותה הסתברות או צפיפות של הנתונים שכבר ראינו, אבל עכשיו מסתכלים עליה כפונקציה של
              <InlineMath math="\theta" /> ולא של <InlineMath math="x" />.
            </SummaryCard>
            <SummaryCard title="מה מחפשים בפועל?" tone="brass">
              את הערך <InlineMath math="\hat{\theta}_{MLE}" /> שממקסם את <InlineMath math="L(\theta)" /> או את
              <InlineMath math="l(\theta)=\ln L(\theta)" />.
            </SummaryCard>
          </div>

          <SummaryCard title="למה בכלל זה עובד?" tone="teal">
            הרעיון הוא לבחור את הפרמטר שמסביר הכי טוב את מה שבפועל נצפה. אם שני ערכי פרמטר אפשריים,
            והנתונים שלנו הרבה יותר סבירים תחת אחד מהם, נעדיף אותו בתור אומד. לכן הנראות איננה
            "הסתברות של הפרמטר", אלא מדד התאמה של הפרמטר לנתונים שכבר התקבלו.
          </SummaryCard>

          <div className={CONTENT_WIDTH_CLASS}>
            <StepList
              accentColor="cobalt"
              steps={[
                {
                  number: 1,
                  title: 'בונים פונקציית נראות',
                  content: (
                    <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
                      למדגם בלתי תלוי כותבים את צפיפות/הסתברות כל תצפית ואז כופלים:
                      <InlineMath math="L(\theta)=\prod_{i=1}^{n}f(x_i;\theta)" />.
                    </p>
                  ),
                },
                {
                  number: 2,
                  title: 'עוברים ללוג-נראות',
                  content: (
                    <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
                      מותר למקסם גם את <InlineMath math="\ln L(\theta)" />, כי לוג הוא פונקציה עולה, והוא
                      הופך מכפלות ארוכות לסכומים נוחים.
                    </p>
                  ),
                },
                {
                  number: 3,
                  title: 'גוזרים ומוצאים מועמד',
                  content: (
                    <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
                      פותרים <InlineMath math="\frac{\partial l(\theta)}{\partial\theta}=0" /> ומבודדים את
                      הפרמטר.
                    </p>
                  ),
                },
                {
                  number: 4,
                  title: 'בודקים שזה באמת מקסימום',
                  content: (
                    <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
                      משתמשים בנגזרת שנייה או בודקים מי מקטין/מגדיל את הנראות בקצות התחום.
                    </p>
                  ),
                },
                {
                  number: 5,
                  title: 'נזהרים כשיש תמיכה תלויה בפרמטר',
                  content: (
                    <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
                      אם עצם התחום המותר של הנתונים תלוי ב-<InlineMath math="\theta" />, לפעמים המקסימום יגיע
                      מהגבול ולא מנקודת גזירה פנימית.
                    </p>
                  ),
                },
              ]}
            />
          </div>

          <Disclosure
            title="דוגמה 1: ברנולי עם 3 הצלחות מתוך 5"
            icon={<Dice5 className="h-5 w-5 text-[var(--color-primary)]" />}
            defaultOpen
            accentOnOpen="brass"
            watermark={<InlineMath math="\hat{p}_{MLE}" />}
          >
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              ראינו 3 הצלחות ו-2 כישלונות. לכן בוחנים איזה ערך של <InlineMath math="p" /> נותן למדגם הזה
              את ההסתברות הכי גבוהה.
            </p>

            <ReadingFormulaBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2" formulaName="נראות לברנולי" translation="מכפלת הסתברויות של הצלחות וכישלונות">
              <BlockMath math="L(p)=p^3(1-p)^2" />
            </ReadingFormulaBlock>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="l(p)=3\ln(p)+2\ln(1-p)" />
            </ReadingCalcBlock>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="\frac{dl(p)}{dp}=\frac{3}{p}-\frac{2}{1-p}=0\Rightarrow 3(1-p)=2p" />
            </ReadingCalcBlock>
            <ResultBlock className="py-2">
              <BlockMath math="\hat{p}_{MLE}=\frac{3}{5}=0.6" />
            </ResultBlock>
            <HandwrittenNote>
              כאן ה-MLE תואם את האינטואיציה: שיעור ההצלחות שנראה במדגם.
            </HandwrittenNote>
          </Disclosure>

          <Disclosure
            title="דוגמה 2: מידות חולצות משלוש קטגוריות"
            icon={<Award className="h-5 w-5 text-[var(--color-accent-cobalt)]" />}
            accentOnOpen="cobalt"
            watermark={<InlineMath math="\theta" />}
          >
            <ReadingFormulaBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2" formulaName="נראות קטגוריאלית" translation="מכפלת הסתברויות לפי שכיחות כל קטגוריה">
              <BlockMath math="L(\theta)=(2\theta)^3(1-6\theta)^3(4\theta)^4" />
            </ReadingFormulaBlock>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="l(\theta)=7\ln(\theta)+3\ln(1-6\theta)+C" />
            </ReadingCalcBlock>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="\frac{\partial l(\theta)}{\partial \theta}=\frac{7}{\theta}-\frac{18}{1-6\theta}=0" />
            </ReadingCalcBlock>
            <ResultBlock className="py-2">
              <BlockMath math="\hat{\theta}_{MLE}=\frac{7}{60}" />
            </ResultBlock>
            <HandwrittenNote>
              שימו לב במיוחד לנגזרת של <InlineMath math="\ln(1-6\theta)" />: השרשרת גורמת לפקטור <InlineMath math="-6" />.
            </HandwrittenNote>
          </Disclosure>

          <Disclosure
            title="מקרה קצה: הפרמטר תוחם את המדגם"
            icon={<TriangleAlert className="h-5 w-5 text-[var(--color-accent-crimson)]" />}
            accentOnOpen="crimson"
            watermark={<InlineMath math="U(0,\theta)" />}
            className="border-[var(--color-accent-crimson)]/45"
          >
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              אם <InlineMath math="X\sim U(0,\theta)" />, כל התצפיות חייבות לקיים <InlineMath math="X_i\le\theta" />.
              לכן לפעמים אין נקודת מקסימום פנימית, אלא הגבול עצמו קובע.
            </p>

            <ReadingFormulaBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2" formulaName="נראות להתפלגות אחידה" translation="בתוך התחום המותר בלבד">
              <BlockMath math="L(\theta)=\frac{1}{\theta^n},\qquad 0\le x_i\le \theta\ \forall i" />
            </ReadingFormulaBlock>

            <ResultBlock className="py-2">
              <BlockMath math="\hat{\theta}_{MLE}=\max(X_1,\dots,X_n)=X_{(n)}" />
            </ResultBlock>

            <HandwrittenNote>
              כדי למקסם את הנראות צריך לבחור את הערך הקטן ביותר של <InlineMath math="\theta" />
              שעדיין מכיל את כל המדגם, כלומר התצפית המקסימלית.
            </HandwrittenNote>
          </Disclosure>
        </SectionDisclosure>
      </div>
    </div>
  );
}

export default PointEstimationPage;
