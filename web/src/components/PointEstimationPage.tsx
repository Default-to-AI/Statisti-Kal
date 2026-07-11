import type { ReactElement, ReactNode } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import {
  Award,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Coins,
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
  InsightBlock,
  ReadingCalcBlock,
  ReadingFormulaBlock,
  ResultBlock,
  StepList,
} from './ui';

const CONTENT_WIDTH_CLASS = 'w-full max-w-[70rem] mx-auto';

function SectionDisclosure({
  id,
  title,
  englishTitle,
  englishAbbr,
  eyebrow,
  icon,
  children,
  defaultOpen = true,
}: {
  id: string;
  title: string;
  englishTitle?: string;
  englishAbbr?: string;
  eyebrow?: ReactNode;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}): ReactElement {
  return (
    <section id={id} data-toc data-toc-label={title} data-toc-target={id} data-toc-open={id} className={`${CONTENT_WIDTH_CLASS} scroll-mt-24`}>
      <AnimatedDetails
        tocId={id}
        defaultOpen={defaultOpen}
        className="group overflow-hidden rounded-[var(--rounded-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm"
      >
        <summary className="flex items-center justify-between gap-4 px-5 py-5 text-right text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface)]/80 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--color-primary)]/35 bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              {icon}
            </div>
            <div className="flex flex-col items-start gap-1">
              {eyebrow ? <p className="text-sm font-semibold tracking-wide text-[var(--color-primary)] mb-1">{eyebrow}</p> : null}
              <h2 className="text-2xl font-bold sm:text-3xl">
                {title} {englishAbbr && <span dir="ltr" className="inline-flex align-middle"><InlineMath math={`(${englishAbbr})`} /></span>}
              </h2>
              {englishTitle && (
                <span aria-hidden="true" className="text-base sm:text-lg font-serif text-[var(--color-text-secondary)] opacity-80 font-normal" dir="ltr">
                  <InlineMath math={`\\text{${englishTitle}}\\text{ }(${englishAbbr})`} />
                </span>
              )}
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
  watermark,
}: {
  title: ReactNode;
  children: ReactNode;
  tone?: 'brass' | 'cobalt' | 'teal' | 'crimson';
  watermark?: ReactNode;
}): ReactElement {
  const toneMap = {
    brass: 'border-[var(--color-primary)]/20 bg-[var(--color-primary)]/6',
    cobalt: 'border-[var(--color-accent-cobalt-line)]/35 bg-[var(--color-accent-cobalt-bg)]/20',
    teal: 'border-[var(--chart-2)]/30 bg-[var(--chart-2)]/8',
    crimson: 'border-[var(--color-accent-crimson)]/25 bg-[var(--color-accent-crimson)]/8',
  } as const;

  return (
    <div className={`relative overflow-hidden rounded-[var(--rounded-xl)] border px-5 py-5 shadow-sm sm:px-6 ${toneMap[tone]}`}>
      {watermark && (
        <div className="pointer-events-none absolute -bottom-6 -left-4 select-none opacity-[0.04] text-[var(--color-text-primary)] transition-opacity duration-500 hover:opacity-[0.06]" aria-hidden="true">
          {watermark}
        </div>
      )}
      <h3 className="relative z-10 text-lg font-bold text-[var(--color-text-primary)] sm:text-xl">{title}</h3>
      <div className="relative z-10 mt-3 text-base leading-relaxed text-[var(--color-text-secondary)]">{children}</div>
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
    <div className="min-h-screen p-4 text-[var(--color-text-primary)] sm:p-6 md:p-8" dir="rtl">
      <div className={`${CONTENT_WIDTH_CLASS} space-y-6`}>
        <section className="rounded-[calc(var(--rounded-xl)+6px)] border border-[var(--color-primary)]/25 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-accent-brass)_14%,transparent),color-mix(in_srgb,var(--color-accent-cobalt)_8%,transparent))] px-5 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:px-7 sm:py-8">
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
              אם שני אומדים (כמו <InlineMath math="T_1" /> ו-<InlineMath math="T_3" /> מהדוגמה הקודמת) נמצאו חסרי הטיה, משווים ביניהם בעזרת השונות: מי שמתפזר פחות סביב היעד (<InlineMath math="\theta" />) הוא יעיל יותר ולכן עדיף.
            </p>
            
            <InsightBlock>
              <strong>הנתון החסר:</strong> נניח שנתון לנו בשאלה שמדובר במדגם מתוך אוכלוסייה בעלת <strong>שונות 100</strong> (כלומר לכל תצפית בודדת <InlineMath math="V(X) = 100" />). כעת נחשב את השונות עבור כל אומד ונראה מי מהם קטן (ויציב) יותר.
            </InsightBlock>

            <p className="text-base leading-relaxed text-[var(--color-text-secondary)] mt-4">
              <strong>האומד הראשון (<InlineMath math="T_1" />):</strong><br/>
              נזכור שכאשר קבוע יוצא מהשונות הוא עולה בריבוע, ושונות של הפרש בין משתנים בלתי תלויים היא סכום השונויות.
            </p>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="V(T_1) = V(2X_1 - X_2) = 2^2 \cdot V(X_1) + (-1)^2 \cdot V(X_2) = 4V(X_1) + V(X_2)" />
            </ReadingCalcBlock>
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              נציב את הנתון <InlineMath math="V(X) = 100" /> ונקבל:
            </p>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="V(T_1) = 4(100) + 100 = 500" />
            </ReadingCalcBlock>

            <p className="text-base leading-relaxed text-[var(--color-text-secondary)] mt-4">
              <strong>האומד השלישי (<InlineMath math="T_3" />, ממוצע המדגם):</strong><br/>
              כאן החלוקה ב-3 (הקבוע <InlineMath math="\frac{1}{3}" />) יוצאת מהשונות בריבוע, כלומר הופכת למכנה 9.
            </p>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="V(T_3) = V\left(\frac{X_1+X_2+X_3}{3}\right) = \frac{V(X_1)+V(X_2)+V(X_3)}{3^2}" />
            </ReadingCalcBlock>
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              שוב נציב 100 עבור כל תצפית במונה:
            </p>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="V(T_3) = \frac{100+100+100}{9} = \frac{300}{9} \approx 33.33" />
            </ReadingCalcBlock>

            <ResultBlock className="py-2 mt-4">
              <BlockMath math="V(T_3) < V(T_1)\Rightarrow T_3\ \text{עדיף}" />
            </ResultBlock>

            <HandwrittenNote>
              <strong>המסקנה ברורה:</strong> למרות ששני האומדים חסרי הטיה, ממוצע המדגם (<InlineMath math="\bar{X}" />) תמיד יהיה יציב יותר (שונות 33.33) מאומד פראי שמכפיל תצפיות (שונות 500).
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

          <InsightBlock>
            <strong>רגע, מה זה בכלל אומר כשמכניסים אומד לתוך ה-MSE?</strong><br/>
            תחשבו על אומד כמו חץ שנורה למטרה (הפרמטר האמיתי <InlineMath math="\theta" />). ה-MSE מודד את סך הכל של "הפספוס" שלנו. כשמכניסים אומד <InlineMath math="\hat{\theta}" /> לתוך ה-<InlineMath math="MSE" />, הפעולה שעושים היא לחשב את המרחק הממוצע בין הניחוש שלנו לאמת, כשהוא מועלה בריבוע. ציון ה"פספוס" הסופי מורכב משני סוגים של טעויות שיכולות להיות לקשת שלנו:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>שונות (Variance):</strong> האם החצים מפוזרים לכל עבר, או פוגעים קרוב אחד לשני?</li>
              <li><strong>הטיה (Bias):</strong> האם הכוונת של הקשת עקומה מראש? גם אם החצים פוגעים קרוב אחד לשני, אולי המרכז שלהם סוטה ימינה או שמאלה מהמטרה.</li>
            </ul>
          </InsightBlock>

          <ReadingFormulaBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2 mt-4" formulaName="תוחלת ריבוע הטעות" translation="שונות האומד ועוד ריבוע ההטיה">
            <BlockMath math="MSE(\hat{\theta})=E\left[(\hat{\theta}-\theta)^2\right]=V(\hat{\theta})+\left(E(\hat{\theta})-\theta\right)^2" />
          </ReadingFormulaBlock>

          <HandwrittenNote className={CONTENT_WIDTH_CLASS}>
            המסקנה המפתיעה: אומד עם <strong>Bias</strong> (הטיה) לא נפסל אוטומטית. אם ההטיה קטנה אבל הוא מדויק ועקבי מאוד (חוסך הרבה בשונות),
            ה-<InlineMath math="MSE" /> הכולל שלו יכול להיות קטן יותר, והוא ינצח!
          </HandwrittenNote>

          <Disclosure
            title="דוגמה: אומד מוטה יכול להיות עדיף"
            icon={<Award className="h-5 w-5 text-[var(--color-primary)]" />}
            defaultOpen
            accentOnOpen="brass"
            watermark={<InlineMath math="U(0,\theta)" />}
          >
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              נניח שיש לנו התפלגות אחידה <InlineMath math="X\sim U(0,\theta)" /> (כמו לבחור מספר אקראי בין 0 ל-<InlineMath math="\theta" />). אנחנו רוצים לנחש את <InlineMath math="\theta" />. נשווה בין שני מועמדים: <InlineMath math="T_1=2X" /> ו-<InlineMath math="T_2=1.5X" />.
            </p>

            <p className="text-base leading-relaxed text-[var(--color-text-secondary)] mt-4 font-bold text-[var(--color-text-primary)]">
              בדיקת המועמד הראשון (<InlineMath math="T_1" />):
            </p>
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              התוחלת שלו פוגעת בול במטרה - אין לו שום הטיה (Bias = 0). לכן, הציון הכולל שלו מורכב נטו מהשונות שלו.
            </p>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="E(T_1)=2E(X)=2\cdot\frac{\theta}{2}=\theta,\qquad MSE(T_1)=V(T_1)=\frac{\theta^2}{3}" />
            </ReadingCalcBlock>

            <p className="text-base leading-relaxed text-[var(--color-text-secondary)] mt-4 font-bold text-[var(--color-text-primary)]">
              בדיקת המועמד השני (<InlineMath math="T_2" />):
            </p>
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              קודם כל, נחשב את ה-Bias שלו. ה-Bias עושה פעולה פשוטה - הוא מחסיר את היעד האמיתי (<InlineMath math="\theta" />) מהתוחלת של האומד, וכך מראה לנו מהי הסטייה הקבועה:
            </p>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="Bias(T_2)=E(1.5X)-\theta=0.75\theta-\theta=-0.25\theta" />
            </ReadingCalcBlock>
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              התוצאה שלילית, מה שאומר שהאומד סובל מ"הטיה כלפי מטה". הוא באופן שיטתי מנחש קצת פחות מהאמת.<br/>
              כעת, ה-MSE מחבר את השונות יחד עם הסטייה הזו (מועלית בריבוע, כדי שמינוס ופלוס לא יבטלו זה את זה):
            </p>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="MSE(T_2)=V(T_2)+Bias(T_2)^2=\frac{9}{48}\theta^2+\frac{1}{16}\theta^2=\frac{1}{4}\theta^2" />
            </ReadingCalcBlock>

            <p className="text-base leading-relaxed text-[var(--color-text-secondary)] mt-4 font-bold text-[var(--color-text-primary)]">
              השוואת התוצאות הסופיות:
            </p>
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              ה-<InlineMath math="MSE" /> הוא ציון של טעות, אז הנמוך מנצח. למרות שהאומד השני מוטה, <InlineMath math="1/4" /> קטן יותר מ-<InlineMath math="1/3" />:
            </p>
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

        <SectionDisclosure 
          id="mle-panel" 
          title="אומד נראות מקסימלית" 
          englishTitle="Maximum Likelihood Estimator" 
          englishAbbr="MLE" 
          icon={<Lightbulb className="h-6 w-6" />}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <SummaryCard 
              title="מה זה בכלל?" 
              tone="teal"
              watermark={<CircleHelp className="h-40 w-40" />}
            >
              אומד נראות מקסימלית (Maximum Likelihood Estimator - MLE) היא שיטה לאמידת פרמטרים של התפלגות נתונים. הרעיון המרכזי הוא: בהינתן אוסף של תצפיות שכבר קרו במציאות, אנו מחפשים את הפרמטר הסטטיסטי שהופך את התצפיות הללו לאירוע הסביר ביותר (בעל ההסתברות הגבוהה ביותר) להתרחש.
            </SummaryCard>
            <SummaryCard 
              title="דוגמת המטבע" 
              tone="brass"
              watermark={<Coins className="h-40 w-40" />}
            >
              נניח שמצאת מטבע מוזר. הטלת אותו 10 פעמים, וקיבלת <strong>7 פעמים "עץ" ו-3 פעמים "פלי"</strong>.
              אנחנו רוצים למצוא את הפרמטר <InlineMath math="p" /> (ההסתברות לקבל "עץ" בהטלה בודדת) שהופך את התוצאה הזו (7 מתוך 10) לתוצאה הסבירה ביותר.
            </SummaryCard>
          </div>

          <p className="text-xl font-bold mt-4 mb-2 text-[var(--color-text-primary)]">
            תהליך מציאת אומד MLE מורכב מ-5 שלבים טכניים קבועים:
          </p>

          <Disclosure
            title="פונקציית ההסתברות של תצפית בודדת"
            icon={<span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-sm font-bold text-[var(--color-primary)]">1</span>}
            accentOnOpen="brass"
          >
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              עבור כל הטלה בודדת (משתנה מקרי מסוג ברנולי), ההסתברות מוגדרת כך:
            </p>
            <ul className="list-inside list-disc text-base leading-relaxed text-[var(--color-text-secondary)] space-y-1 my-2">
              <li>ההסתברות לעץ היא <InlineMath math="p" />.</li>
              <li>ההסתברות לפלי היא <InlineMath math="1-p" />.</li>
            </ul>
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              המתמטיקאים אוהבים לכתוב את זה כמשוואה אחת שמתאימה לכל תוצאה <InlineMath math="x" /> (כאשר עץ=1, פלי=0):
            </p>

            <ReadingFormulaBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2" formulaName="הסתברות ברנולי" translation="פונקציית הסתברות לתצפית בודדת">
              <BlockMath math="f(x; p) = p^x \cdot (1-p)^{1-x}" />
            </ReadingFormulaBlock>

            <InsightBlock>
              המשוואה הזו היא פשוט "טריק" רישום מתמטי.<br/>
              אם יצא עץ (<InlineMath math="x=1" />), אז מציבים 1 ומקבלים <InlineMath math="p^1 \cdot (1-p)^0" />, שזה פשוט <InlineMath math="p" />.<br/>
              אם יצא פלי (<InlineMath math="x=0" />), אז מציבים 0 ומקבלים <InlineMath math="p^0 \cdot (1-p)^1" />, שזה פשוט <InlineMath math="1-p" />.<br/>
              זה כל מה שהנוסחה הזו אומרת.
            </InsightBlock>
          </Disclosure>

          <Disclosure
            title={
              <span className="flex items-center flex-wrap gap-x-2 gap-y-1 font-sans">
                <span>בניית פונקציית הנראות</span>
                <span aria-hidden="true" className="text-[0.9em] font-serif text-[var(--color-text-secondary)] opacity-80 font-normal" dir="ltr">
                  (Likelihood &ndash; <InlineMath math="L" />)
                </span>
              </span>
            }
            icon={<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-sm font-bold text-[var(--color-primary)]">2</span>}
            accentOnOpen="brass"
          >
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              הנראות היא ההסתברות לקבל את <strong>כל המדגם שלנו יחד</strong>. מכיוון שההטלות בלתי תלויות, כופלים את ההסתברויות. קיבלנו 7 פעמים עץ ו-3 פעמים פלי:
            </p>

            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="L(p) = \underbrace{(p \cdot p \cdot ... \cdot p)}_{\text{7 times}} \cdot \underbrace{((1-p) \cdot (1-p) \cdot (1-p))}_{\text{3 times}}" />
            </ReadingCalcBlock>

            <ReadingFormulaBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2" formulaName="פונקציית הנראות" translation="מכפלת ההסתברויות של המדגם כולו">
              <BlockMath math="L(p) = p^7 \cdot (1-p)^3" />
            </ReadingFormulaBlock>

            <InsightBlock>
              למה כופלים? בדיוק כמו שאם תשאל "מה הסיכוי לקבל '6' בקובייה פעמיים ברצף?", התשובה היא שישית כפול שישית (<InlineMath math="1/36" />). כשיש מאורעות בלתי תלויים, ההסתברות שכולם יקרו יחד היא המכפלה שלהם. הפונקציה <InlineMath math="L(p)" /> מתארת את הסיכוי לקבל בדיוק את מה שקיבלנו במציאות, כתלות בפרמטר הלא ידוע <InlineMath math="p" />.
            </InsightBlock>
          </Disclosure>

          <Disclosure
            title={
              <span className="flex items-center flex-wrap gap-x-2 gap-y-1 font-sans">
                <span>מעבר לפונקציית הלוג-נראות</span>
                <span aria-hidden="true" className="text-[0.9em] font-serif text-[var(--color-text-secondary)] opacity-80 font-normal" dir="ltr">
                  (Log-Likelihood &ndash; <InlineMath math="l" />)
                </span>
              </span>
            }
            icon={<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-sm font-bold text-[var(--color-primary)]">3</span>}
            accentOnOpen="brass"
          >
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              כדי שנוכל לגזור את הפונקציה בקלות, נפעיל עליה לוגריתם טבעי (<InlineMath math="\ln" />).
              נשתמש בחוקי הלוגריתמים:
            </p>
            <ol className="list-inside list-decimal text-base leading-relaxed text-[var(--color-text-secondary)] space-y-1 my-2">
              <li>לוג של מכפלה הופך לחיבור: <InlineMath math="\ln(a \cdot b) = \ln(a) + \ln(b)" /></li>
              <li>לוג של חזקה קופץ החוצה ככפל: <InlineMath math="\ln(a^b) = b \cdot \ln(a)" /></li>
            </ol>
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              נפעיל זאת על הפונקציה שלנו:
            </p>

            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="l(p) = \ln(p^7 \cdot (1-p)^3)" />
            </ReadingCalcBlock>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="l(p) = \ln(p^7) + \ln((1-p)^3)" />
            </ReadingCalcBlock>
            <ReadingFormulaBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2" formulaName="לוג-נראות" translation="הלוגריתם הטבעי של פונקציית הנראות">
              <BlockMath math="l(p) = 7\ln(p) + 3\ln(1-p)" />
            </ReadingFormulaBlock>

            <InsightBlock>
              זה שלב שנראה מרתיע, אבל הוא "גלגל ההצלה" שלנו. לגזור מתמטית מכפלות של אלפי תצפיות זה סיוט אלגברי (דורש את כלל השרשרת של הכפל המון פעמים). הלוגריתם הופך פעולות כפל לפעולות חיבור, וחזקות לכפל רגיל.<br/>
              מכיוון שפונקציית לוגריתם היא פונקציה שעולה תמיד (מונוטונית), הנקודה שבה פונקציית הלוג תגיע למקסימום היא <strong>בדיוק</strong> אותה נקודה שבה הפונקציה המקורית תגיע למקסימום. אנחנו רק משנים את ה"קנה מידה" כדי שיהיה קל לגזור.
            </InsightBlock>
          </Disclosure>

          <Disclosure
            title="הגזירה והשוואה לאפס"
            icon={<span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-sm font-bold text-[var(--color-primary)]">4</span>}
            accentOnOpen="brass"
          >
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              עכשיו אנחנו רוצים למצוא מתי הפונקציה נמצאת בשיא שלה (המקסימום). כדי לעשות זאת, נגזור את <InlineMath math="l(p)" /> לפי <InlineMath math="p" /> ונשווה לאפס.
            </p>
            <ul className="list-inside list-disc text-base leading-relaxed text-[var(--color-text-secondary)] space-y-1 my-2">
              <li>הנגזרת של <InlineMath math="\ln(p)" /> היא <InlineMath math="\frac{1}{p}" />.</li>
              <li>הנגזרת של <InlineMath math="\ln(1-p)" /> היא <InlineMath math="\frac{1}{1-p}" />, כפול הנגזרת הפנימית שהיא (<InlineMath math="-1" />), כלומר: <InlineMath math="-\frac{1}{1-p}" />.</li>
            </ul>
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              נבצע את הגזירה:
            </p>

            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="l'(p) = 7 \cdot \left(\frac{1}{p}\right) + 3 \cdot \left(-\frac{1}{1-p}\right)" />
            </ReadingCalcBlock>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2">
              <BlockMath math="l'(p) = \frac{7}{p} - \frac{3}{1-p}" />
            </ReadingCalcBlock>

            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              נשווה לאפס כדי למצוא קיצון (מקסימום):
            </p>

            <ReadingFormulaBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2" formulaName="השוואה לאפס" translation="חיפוש נקודת הקיצון">
              <BlockMath math="\frac{7}{p} - \frac{3}{1-p} = 0" />
            </ReadingFormulaBlock>

            <InsightBlock>
              למה גוזרים ומשווים לאפס? דמיין הר. כשאתה מטפס על ההר, השיפוע (הנגזרת) חיובי. כשאתה יורד, השיפוע שלילי. רק בפסגה של ההר, השיפוע שטוח לחלוטין - כלומר שווה לאפס. המטרה שלנו היא למצוא את ה-<InlineMath math="p" /> שמביא אותנו לפסגת ההר, לנקודה הכי גבוהה (הסבירה ביותר).
            </InsightBlock>
          </Disclosure>

          <Disclosure
            title="חילוץ הפרמטר"
            icon={<span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-sm font-bold text-[var(--color-primary)]">5</span>}
            accentOnOpen="brass"
            watermark={<InlineMath math="\hat{p}_{MLE}" />}
          >
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
              נשאר לנו רק לפתור משוואה אלגברית פשוטה כדי לבודד את <InlineMath math="p" />:
            </p>
            
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)] mt-2">נעביר אגף:</p>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-1">
              <BlockMath math="\frac{7}{p} = \frac{3}{1-p}" />
            </ReadingCalcBlock>

            <p className="text-base leading-relaxed text-[var(--color-text-secondary)] mt-2">נבצע כפל בהצלבה:</p>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-1">
              <BlockMath math="7(1-p) = 3p" />
            </ReadingCalcBlock>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-1">
              <BlockMath math="7 - 7p = 3p" />
            </ReadingCalcBlock>

            <p className="text-base leading-relaxed text-[var(--color-text-secondary)] mt-2">נעביר את ה-<InlineMath math="p" /> לצד אחד:</p>
            <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-1">
              <BlockMath math="7 = 10p" />
            </ReadingCalcBlock>

            <p className="text-base leading-relaxed text-[var(--color-text-secondary)] mt-2">נחלק ב-10 ונקבל את האומד שלנו:</p>
            <ResultBlock className="py-2">
              <BlockMath math="\hat{p}_{MLE} = \frac{7}{10} = 0.7" />
            </ResultBlock>

            <InsightBlock>
              יצא לנו 0.7. עכשיו תחשוב על זה בהיגיון פשוט: אם זרקת מטבע 10 פעמים ויצא לך 7 פעמים עץ, מה הניחוש הכי טוב שלך לגבי הסיכוי של המטבע הזה ליפול על עץ? כמובן, 7 מתוך 10 (70%).<br/>
              המתמטיקה הארוכה של ה-MLE בעצם מספקת <strong>הוכחה מתמטית פורמלית</strong> לכך שהאינטואיציה האנושית הפשוטה שלנו (ממוצע המדגם) היא אכן האומדן הסטטיסטי הטוב והמדויק ביותר האפשרי במקרה הזה.
            </InsightBlock>
          </Disclosure>

          <Disclosure
            title="דוגמה 2: מידות חולצות משלוש קטגוריות"
            icon={<Award className="h-5 w-5 text-[var(--color-accent-cobalt)]" />}
            accentOnOpen="cobalt"
            watermark={<InlineMath math="\theta" />}
          >
            <p className="text-base leading-relaxed text-[var(--color-text-secondary)] mb-4">
              בחנות בגדים יש שלוש מידות. ההסתברות שלקוח יבחר מידה Small היא <InlineMath math="2\theta" />, מידה Medium היא <InlineMath math="1-6\theta" />, ומידה Large היא <InlineMath math="4\theta" />.<br/>
              נניח שהגיעו 10 לקוחות לחנות, ומתוכם: <strong>3 בחרו Small, 3 בחרו Medium, ו-4 בחרו Large</strong>.
            </p>
            
            <ReadingFormulaBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-2" formulaName="נראות קטגוריאלית" translation="מכפלת הסתברויות לפי שכיחות כל קטגוריה במדגם">
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
