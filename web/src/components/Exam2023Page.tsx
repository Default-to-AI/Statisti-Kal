import type { ReactElement, ReactNode } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import { Calculator, CheckCircle2, ChevronDown, HelpCircle, Sigma } from 'lucide-react';
import {
  AlertBlock,
  AnimatedDetails,
  Card,
  CardBody,
  CardHeader,
  Disclosure,
  HandwrittenNote,
  InsightBlock,
  MCQuestionCard,
  ReadingCalcBlock,
  ReadingFormulaBlock,
  ResultBlock,
} from './ui';

const CONTENT_WIDTH_CLASS = 'w-full max-w-[70rem] mx-auto';

// ── Parent accordion (question mark icon, topic title) ──────────────────────

function ParentAccordion({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section
      id={id}
      data-toc
      data-toc-label={title}
      data-toc-target={id}
      data-toc-open={id}
      className={`${CONTENT_WIDTH_CLASS} scroll-mt-24`}
    >
      <AnimatedDetails
        tocId={id}
        defaultOpen
        className="group overflow-hidden rounded-[var(--rounded-xl)] border border-[var(--color-primary)]/35 bg-[var(--color-surface)] shadow-md"
      >
        <summary className="flex cursor-pointer items-center justify-between gap-4 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-accent-brass)_10%,transparent),color-mix(in_srgb,var(--color-accent-cobalt)_6%,transparent))] px-5 py-5 text-right transition-colors hover:bg-[var(--color-surface)]/80 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--color-accent-cobalt)]/40 bg-[var(--color-accent-cobalt)]/10 text-[var(--color-accent-cobalt)]">
              <HelpCircle size={24} />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">{title}</h2>
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

// ── Eye-catching exam question block (verbatim exam wording) ─────────────────

function ExamStatement({ children }: { children: ReactNode }): ReactElement {
  return (
    <Card
      variant="raised"
      className="border-[var(--color-primary)]/45 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-accent-brass)_14%,transparent),color-mix(in_srgb,var(--color-accent-cobalt)_7%,transparent))] shadow-[0_14px_44px_rgba(0,0,0,0.20)]"
    >
      <CardBody className="space-y-3 text-right">
        <p className="border-r-4 border-[var(--color-primary)] pr-4 text-lg font-medium leading-relaxed text-[var(--color-text-primary)] sm:text-xl">
          {children}
        </p>
      </CardBody>
    </Card>
  );
}

// ── Child accordion: question (circled number) with collapsing answers ──────

function QuestionChild({
  number,
  title,
  children,
}: {
  number: string;
  title: ReactNode;
  children: ReactNode;
}): ReactElement {
  return (
    <Disclosure
      title={title}
      icon={
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/12 text-[var(--color-primary)] text-lg font-bold">
          {number}
        </span>
      }
      defaultOpen
      accentOnOpen="brass"
    >
      {children}
    </Disclosure>
  );
}

// ── Child accordion: solution (calculator icon) ──────────────────────────────

function SolutionChild({ title, children }: { title: ReactNode; children: ReactNode }): ReactElement {
  return (
    <Disclosure
      title={title}
      icon={
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-accent-cobalt)]/40 bg-[var(--color-accent-cobalt)]/10 text-[var(--color-accent-cobalt)]">
          <Calculator size={18} />
        </span>
      }
      defaultOpen
      accentOnOpen="cobalt"
    >
      {children}
    </Disclosure>
  );
}

// ── Reusable solution body: Approach/Prep + Step-by-step ─────────────────────

interface PreFlightData {
  whatsGoingOn: ReactNode;
  distribution: ReactNode;
  formulas: string[];
  approach: ReactNode;
}

interface SolutionStep {
  math: string;
  commentary?: ReactNode;
}

function SolutionBody({
  preFlight,
  solutionSteps,
  finalAnswer,
  narration,
  trap,
}: {
  preFlight: PreFlightData;
  solutionSteps: SolutionStep[];
  finalAnswer: string;
  narration: ReactNode;
  trap: ReactNode;
}): ReactElement {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-primary)]">
          <Sigma size={16} /> גישה והכנות
        </h4>
        <Card variant="transparent" className="border-[var(--color-border)]">
          <CardBody className="space-y-3 text-base leading-relaxed">
            <p>
              <strong className="text-[var(--color-text-primary)]">מה קורה כאן:</strong> {preFlight.whatsGoingOn}
            </p>
            <p>
              <strong className="text-[var(--color-text-primary)]">התפלגות רלוונטית:</strong> {preFlight.distribution}
            </p>
            <p>
              <strong className="text-[var(--color-text-primary)]">איך גישים:</strong> {preFlight.approach}
            </p>
          </CardBody>
        </Card>
        <div className="space-y-1 pt-1">
          {preFlight.formulas.map((formula, idx) => (
            <ReadingFormulaBlock
              key={idx}
              contentWidthClassName={CONTENT_WIDTH_CLASS}
              wrapperClassName="py-1"
              formulaName="נוסחה"
              translation=""
            >
              <BlockMath math={formula} />
            </ReadingFormulaBlock>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-accent-cobalt)]">
          <Calculator size={16} /> פתרון שלב אחר שלב
        </h4>
        <div className="space-y-2">
          {solutionSteps.map((step, idx) => (
            <div key={idx}>
              <ReadingCalcBlock contentWidthClassName={CONTENT_WIDTH_CLASS} wrapperClassName="py-1">
                <BlockMath math={step.math} />
              </ReadingCalcBlock>
              {step.commentary ? (
                <p className="px-1 pt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]" dir="rtl">
                  {step.commentary}
                </p>
              ) : null}
            </div>
          ))}
        </div>
        <Card variant="transparent" className="mt-2 border-[var(--color-border)]">
          <CardHeader title="תשובה סופית" icon={<CheckCircle2 size={18} className="text-[var(--color-success)]" />} />
          <ResultBlock className="py-2">
            <BlockMath math={finalAnswer} />
          </ResultBlock>
        </Card>
        <HandwrittenNote className={CONTENT_WIDTH_CLASS}>{narration}</HandwrittenNote>
      </div>

      <AlertBlock>{trap}</AlertBlock>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

function Exam2023Page(): ReactElement {
  return (
    <div className="min-h-screen p-4 text-[var(--color-text-primary)] sm:p-6 md:p-8" dir="rtl">
      <div className={`${CONTENT_WIDTH_CLASS} space-y-6`}>
        <section className="rounded-[calc(var(--rounded-xl)+6px)] border border-[var(--color-primary)]/25 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-accent-brass)_14%,transparent),color-mix(in_srgb,var(--color-accent-cobalt)_8%,transparent))] px-5 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:px-7 sm:py-8">
          <h1 className="text-4xl font-black tracking-tight text-[var(--color-text-primary)] sm:text-5xl">מבחן 2023</h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)] sm:text-xl">
            מעבר מבחן מלא עם פתרון צעד-אחר-צעד — ביטוח לאומי ואלבומין. כל שאלה מתפצלת לתשובות רב-ברירה ולפתרון (גישה, הכנות וביצוע).
          </p>
        </section>
      </div>

      <div className="mt-8 space-y-8">
        <ParentAccordion id="bituach-leumi" title="זמן המתנה בביטוח לאומי">
          <ExamStatement>
            זמן ההמתנה לקבלת שירות בביטוח לאומי היה עד כה 50 דקות בממוצע עם סטיית תקן 10. לאחר שדרוג טכנולוגי נמדדו 16 לקוחות ונמצא ממוצע
            המתנה של 42 דקות. הנח שהתפלגות זמן ההמתנה היא נורמלית ושסטיית התקן לא השתנתה.
          </ExamStatement>

          {/* ── Question 1 / Section A ── */}
          <QuestionChild number="1" title="מהן ההשערות הנבדקות?">
            <MCQuestionCard
              id="mc-q1"
              options={[
                { label: 'א', latex: String.raw`H_0:\mu=50,\ H_1:\mu<50`, correct: true },
                { label: 'ב', latex: String.raw`H_0:\mu=42,\ H_1:\mu\neq42` },
                { label: 'ג', latex: String.raw`H_0:\mu=50,\ H_1:\mu\neq50` },
                { label: 'ד', latex: String.raw`H_0:\mu=42,\ H_1:\mu<42` },
                { label: 'ה', latex: String.raw`H_0:\bar{X}=50,\ H_1:\bar{X}=42` },
              ]}
              rationale={
                <>
                  ההשערות עוסקות בפרמטר האוכלוסייה <InlineMath math={String.raw`\mu`} /> (ממוצע היסטורי 50); ״שיפור״ = זמן קצר יותר ⇒ חד‑צדדי שמאלי{' '}
                  <InlineMath math={String.raw`\mu<50`} />. האפשרויות ב/ד משתמשות בערך המדגם 42; ה משתמשת ב‑<InlineMath math={String.raw`\bar{X}`} />.
                </>
              }
            />
          </QuestionChild>

          <SolutionChild title="פתרון">
            <SolutionBody
              preFlight={{
                whatsGoingOn: (
                  <>
                    אנחנו נשאלים איזו זוג השערות נכון. השערות תמיד עוסקות בפרמטר האוכלוסייה <InlineMath math={String.raw`\mu`} />, לעולם לא בסטטיסטי המדגם{' '}
                    <InlineMath math={String.raw`\bar{x}`} />.
                  </>
                ),
                distribution: (
                  <>
                    <InlineMath math={String.raw`X\sim N(\mu_0=50,\sigma_0^2=10^2)`} /> במצב ההיסטורי; <InlineMath math={String.raw`\sigma`} /> ידוע ולא השתנה.
                  </>
                ),
                formulas: [String.raw`H_0:\mu=\mu_0`, String.raw`H_1:\mu<\mu_0\ \text{(שיפור = זמן קצר יותר)}`],
                approach: (
                  <>
                    זהה את פרמטר האוכלוסייה (<InlineMath math={String.raw`\mu`} />, לא <InlineMath math={String.raw`\bar{x}=42`} />). ״שיפור״ → זמן קצר יותר → חד‑צדדי שמאלי{' '}
                    <InlineMath math={String.raw`\mu<50`} />. סלק כל אפשרות עם <InlineMath math={String.raw`\bar{x}`} /> או המספר 42.
                  </>
                ),
              }}
              solutionSteps={[
                {
                  math: String.raw`E(X)=\mu_0=50\ \text{תוחלת האוכלוסייה; }\bar{x}=42\ \text{ממוצע המדגם, ידוע}`,
                  commentary:
                    <>ממוצע באוכלוסייה = תוחלת; במדגם = ממוצע מדגם. כל תשובה עם <InlineMath math={String.raw`\bar{x}`} /> או 42 שגויה מייד — 42 הוא נתון שנצפה, לא פרמטר להשערה.</>,
                },
                {
                  math: String.raw`\text{״שיפור״ זמן המתנה = לקצר אותו}\Rightarrow H_1:\mu<50`,
                  commentary: <>לו השאלה הייתה ״שינוי״ ללא כיוון היינו משתמשים ב‑<InlineMath math={String.raw`\mu`} />≠50; כאן ״שיפור״ הוא ירידה, ולכן חד‑צדדי שמאלי.</>,
                },
                { math: String.raw`H_0:\mu=50,\qquad H_1:\mu<50`, commentary: '' },
              ]}
              finalAnswer={String.raw`H_0:\mu=50\ \text{מול}\ H_1:\mu<50\ (\text{מבחן חד-צדדי שמאלי})`}
              narration={
                <>
                  השערות נכתבות תמיד במונחי <InlineMath math={String.raw`\mu`} />; מכיוון ש״לשפר״ זמן המתנה אומר לקצר אותו — ההשערה האלטרנטיבית היא{' '}
                  <InlineMath math={String.raw`\mu<50`} />.
                </>
              }
              trap={
                <>
                  <strong>מלכודת קונספטואלית קריטית:</strong> אל תכתבו השערה עם <InlineMath math={String.raw`\bar{x}`} /> או עם ערך המדגם 42.{' '}
                  <InlineMath math={String.raw`\bar{x}=42`} /> הוא נתון שנצפה; ההשערות עוסקות ב‑<InlineMath math={String.raw`\mu`} />. מבחן חד‑צדדי שמאלי נבחר לפי המילה
                  ״שיפור״ (קצר יותר), לא לפי סימן ההפרש.
                </>
              }
            />
          </SolutionChild>

          {/* ── Question 2 / Section B ── */}
          <QuestionChild
            number="2"
            title="ברמת מובהקות 1% __________ את השערת האפס. הטעות האפשרית במסקנה שהתקבלה היא טעות מסוג ___________."
          >
            <MCQuestionCard
              id="mc-q2"
              options={[
                { label: 'א', latex: String.raw`\text{נדחה ; ראשון}`, correct: true },
                { label: 'ב', latex: String.raw`\text{לא נדחה ; שני}` },
                { label: 'ג', latex: String.raw`\text{לא נדחה ; ראשון}` },
                { label: 'ד', latex: String.raw`\text{נדחה ; שני}` },
                { label: 'ה', latex: String.raw`\text{נדחה ; עוצמת המבחן}` },
              ]}
              rationale={
                <>
                  מפתרון דחינו את <InlineMath math={String.raw`H_0`} /> ברמת <InlineMath math={String.raw`\alpha=0.01`} /> (<InlineMath math={String.raw`p=0.0007`} />); דחיית{' '}
                  <InlineMath math={String.raw`H_0`} /> אומרת שהשגיאה האפשרית היחידה היא מסוג ראשון. ״עוצמת המבחן״ אינה סוג שגיאה.
                </>
              }
            />
          </QuestionChild>

          <SolutionChild title="פתרון">
            <SolutionBody
              preFlight={{
                whatsGoingOn: <>ברמת מובהקות 1% מחליטים האם לדחות את <InlineMath math={String.raw`H_0`} /> ומציינים איזה סוג שגיאה אפשרי.</>,
                distribution: (
                  <>
                    <InlineMath math={String.raw`X\sim N(\mu_0=50,\sigma^2=10^2)`} />, <InlineMath math={String.raw`n=16`} />, <InlineMath math={String.raw`\bar{x}=42`} />; <InlineMath math={String.raw`\sigma`} /> ידוע ⇒ מבחן{' '}
                    <InlineMath math={String.raw`Z`} />.
                  </>
                ),
                formulas: [
                  String.raw`Z=\dfrac{\bar{X}-\mu_0}{\sigma/\sqrt{n}}`,
                  String.raw`p\text{-value}=P(Z<z_{\text{obs}})\ \text{(חד-צדדי שמאלי)}`,
                  String.raw`\text{דוחים }H_0\iff p\text{-value}<\alpha`,
                ],
                approach: (
                  <>
                    חשבו את <InlineMath math={String.raw`Z`} />, מצאו את זנב שמאל של ה‑<InlineMath math={String.raw`p`} />-value, השוו ל‑<InlineMath math={String.raw`\alpha=0.01`} />. ואז קשרו להחלטה
                    לסוג השגיאה.
                  </>
                ),
              }}
              solutionSteps={[
                {
                  math: String.raw`z=\dfrac{42-50}{10/\sqrt{16}}=\dfrac{-8}{10/4}=\dfrac{-8}{2.5}=-3.2`,
                  commentary: <>מחלקים ב‑<InlineMath math={String.raw`\sigma`} />/<InlineMath math={String.raw`\sqrt{n}`} /> כי מנרמלים את ממוצע המדגם, לא תצפית בודדת — לכן <InlineMath math={String.raw`\sqrt{16}=4`} /> במכנה.</>,
                },
                {
                  math: String.raw`p\text{-value}=P(Z<-3.2)=1-P(Z<3.2)=1-0.9993=0.0007`,
                  commentary: 'z שלילי אינו בטבלה, לכן הופכים סימן וזנב: שטח משמאל ל‑−3.2 = שטח מימין ל‑+3.2 = 1−Φ(3.2).',
                },
                {
                  math: String.raw`0.0007<0.01=\alpha\Rightarrow\text{דוחים }H_0`,
                  commentary: 'הכלל ״דוחים אם p-value < α״ עובד לכל כיוון. כאן ה‑p-value רחוק מתחת ל‑1%, לכן דוחים.',
                },
                {
                  math: String.raw`\text{דחינו }H_0\Rightarrow\text{ השגיאה האפשרית = מסוג ראשון (Type I)}`,
                  commentary: <>״אם דחינו את <InlineMath math={String.raw`H_0`} /> הטעות האפשרית היא תמיד מסוג ראשון; אם לא דחינו — מסוג שני.״</>,
                },
              ]}
              finalAnswer={String.raw`\text{דוחים }H_0:\mu=50\ \text{ברמת }\alpha=0.01;\ \text{השגיאה האפשרית = מסוג ראשון (Type I)}`}
              narration={
                <>
                  בכך שה‑<InlineMath math={String.raw`p`} />-value (0.0007) קטן מאחוז אחד דחינו את השערת האפס, ולכן הטעות האפשרית במסקנה הזו היא מסוג ראשון בלבד.
                </>
              }
              trap={
                <>
                  <strong>מלכודת קונספטואלית קריטית:</strong> כשדוחים את <InlineMath math={String.raw`H_0`} /> השגיאה האפשרית היא תמיד מסוג ראשון; כשלא
                  דוחים — תמיד מסוג שני. עדיף את מסלול ה‑<InlineMath math={String.raw`p`} />-value: הוא עונה ״דוחים ב‑1%? ב‑5%?״ במספר אחד. הופכים סימן{' '}
                  <strong>וגם</strong> זנב עבור <InlineMath math={String.raw`z`} /> שלילי: <InlineMath math={String.raw`P(Z<-a)=1-\Phi(a)`} />.
                </>
              }
            />
          </SolutionChild>
        </ParentAccordion>

        {/* ════════════════════════════════════════════════════════════════
            QUESTION 2 — Haifa families (variable identification)
            ════════════════════════════════════════════════════════════════ */}

        <ParentAccordion id="haifa-families" title="זיהוי משתנים (משפחות חיפה)">
          <ExamStatement>
            להלן נתונים שנאספו על 12 משפחות בחיפה: מספר סידורי, רמת הכנסה (1=נמוכה מאוד … 5=גבוהה מאוד), ומספר ילדים.
          </ExamStatement>

          {/* ── Question 3 / Section A ── */}
          <QuestionChild number="3" title="כמה משתנים מוצגים בטבלה?">
            <MCQuestionCard
              id="mc-q3"
              options={[
                { label: 'א', text: '2', correct: true },
                { label: 'ב', text: '24' },
                { label: 'ג', text: '36' },
                { label: 'ד', text: '3' },
                { label: 'ה', text: '12' },
              ]}
              rationale={
                <>
                  מספר סידורי סופר את המשפחות ואינו משתנה; שני המשתנים האמיתיים הם רמת הכנסה ומספר ילדים. הקודים (1…5) הם ערכים של משתנה, לא משתנים נפרדים.
                </>
              }
            />
          </QuestionChild>

          <SolutionChild title="פתרון">
            <SolutionBody
              preFlight={{
                whatsGoingOn: <>סופרים את המשתנים הנמדדים בפועל בטבלה.</>,
                distribution: <>תיאורי / אוריינות נתונים — אין התפלגות הסתברותית.</>,
                formulas: [
                  String.raw`\text{משתנה = תכונה הנמדדת לכל יחידה}`,
                  String.raw`\text{מספר סידורי = מזהה, לא משתנה}`,
                ],
                approach: (
                  <>
                    מספר סידורי רק מספור את המשפחות ⇒ לא משתנה. רמת הכנסה ומספר ילדים הם שני המאפיינים הנמדדים.
                  </>
                ),
              }}
              solutionSteps={[
                {
                  math: String.raw`\text{מספר סידורי}\ \Rightarrow\ \text{לא משתנה (רק סופר משפחות)}`,
                  commentary: '"מספר סידורי זה לא משתנה" — הוא רק ממספר את המשפחות, לא מתאר תכונה נמדדת.',
                },
                {
                  math: String.raw`\text{משתנים: }\underbrace{\text{רמת הכנסה}}_{(1\dots5)\ \text{ערכים}},\ \underbrace{\text{מספר ילדים}}_{\text{ערכים}}`,
                  commentary: 'הקודים 1…5 לרמת הכנסה הם ערכים של אותו משתנה, לא חמישה משתנים נפרדים.',
                },
                { math: String.raw`\Rightarrow\boxed{2\ \text{משתנים}}`, commentary: '' },
              ]}
              finalAnswer={String.raw`2\ \text{משתנים: רמת הכנסה ומספר ילדים}`}
              narration={
                <>
                  מספר סידורי סופר את המשפחות ואינו משתנה; נשארים רק שני משתנים אמתיים — רמת הכנסה ומספר ילדים.
                </>
              }
              trap={
                <>
                  <strong>מלכודת קונספטואלית קריטית:</strong> עמודת מספור/ת.ז. אינה משתנה לעולם. קודים (1–5) הם ערכים של משתנה אחד, לא חמישה משתנים.
                </>
              }
            />
          </SolutionChild>

          {/* ── Question 4 / Section B ── */}
          <QuestionChild
            number="4"
            title={'מהו התיאור הגרפי המתאים לבדיקת הקשר בין "רמת ההכנסה" ל"מספר הילדים"?'}
          >
            <MCQuestionCard
              id="mc-q4"
              options={[
                { label: 'א', text: 'דיאגרמת פיזור (scatter)', correct: true },
                { label: 'ב', text: 'דיאגרמת עוגה (pie chart)' },
                { label: 'ג', text: 'היסטוגרמה (histogram)' },
                { label: 'ד', text: 'התפלגות נורמלית (normal distribution)' },
                { label: 'ה', text: 'דיאגרמת מקלות (bar chart)' },
              ]}
              rationale={
                <>
                  קשר בין שני משתנים מוצג רק על‑ידי דיאגרמת פיזור; עוגה/היסטוגרמה/מקלות מתארים כל אחת משתנה בודד, ו"התפלגות נורמלית" היא התפלגות ולא תרשים.
                </>
              }
            />
          </QuestionChild>

          <SolutionChild title="פתרון">
            <SolutionBody
              preFlight={{
                whatsGoingOn: <>בוחרים את התיאור הגרפי המראה את ה<strong>קשר</strong> (התאמה) בין שני משתנים.</>,
                distribution: <>תיאור דו‑משתני (bivariate).</>,
                formulas: [String.raw`\text{רק דיאגרמת פיזור מראה קשר בין שני משתנים}`],
                approach: (
                  <>
                    עוגה / היסטוגרמה / מקלות מתארים כל אחת משתנה אחד. קשר דורש ציר X = משתנה אחד, ציר Y = השני, נקודה לכל משפחה.
                  </>
                ),
              }}
              solutionSteps={[
                {
                  math: String.raw`\text{עוגה, היסטוגרמה או מקלות}\ \Rightarrow\ \text{מתאר משתנה אחד, לא קשר}`,
                  commentary: '"עוגה, היסטוגרמה או מקלות — מתאר לי משתנה אחד, לא מתאר קשר."',
                },
                {
                  math: String.raw`(\text{הכנסה},\ \text{ילדים})\ \text{לכל משפחה}\ \Rightarrow\ \text{נקודה אחת}`,
                  commentary: '"הדבר היחיד שיכול לתאר קשר זה דיאגרמת פיזור" — ציר אחד לכל משתנה, נקודה לכל תצפית.',
                },
                { math: String.raw`\Rightarrow\boxed{\text{דיאגרמת פיזור}}`, commentary: '' },
              ]}
              finalAnswer={String.raw`\text{דיאגרמת פיזור (scatter diagram)}`}
              narration={
                <>
                  כשבודקים קשר בין שני משתנים, הדיאגרמה היחידה שמתאימה היא דיאגרמת פיזור — משתנה אחד על ציר ה‑X ומשתנה שני על ציר ה‑Y.
                </>
              }
              trap={
                <>
                  <strong>מלכודת קונספטואלית קריטית:</strong> היסטוגרמה / עוגה / מקלות מתארים משתנה אחד בלבד. "קשר בין שני משתנים" ⇒ פיזור, תמיד.
                  שימו לב ש"התפלגות נורמלית" היא התפלגות, לא תיאור גרפי — היא אינה יכולה להיות התשובה ל"איזה תרשים".
                </>
              }
            />
          </SolutionChild>
        </ParentAccordion>

        {/* ════════════════════════════════════════════════════════════════
            QUESTION 3 — Upper quartile of uniformly distributed soup time
            ════════════════════════════════════════════════════════════════ */}

        <ParentAccordion id="soup-quartile" title="רבעון עליון של זמן מרק (התפלגות אחידה)">
          <ExamStatement>
            הזמן ששף מסעדה מכין מרק מתפלג אחיד בין 25 ל‑33 דקות. מהו הרבעון העליון (האחוזון ה‑75) של זמן הכנת המרק?
          </ExamStatement>

          {/* ── Question 5 / Section A ── */}
          <QuestionChild number="5" title="מהו הרבעון העליון של זמן הכנת המרק?">
            <MCQuestionCard
              id="mc-q5"
              options={[
                { label: 'א', text: '31 דקות', correct: true },
                { label: 'ב', text: '25%' },
                { label: 'ג', text: '75%' },
                { label: 'ד', text: '28 דקות' },
                { label: 'ה', text: 'אין תשובה נכונה' },
              ]}
              rationale={
                <>
                  רבעון עליון = אחוזון 75; פותרים <InlineMath math={String.raw`(x-25)/(33-25)=0.75`} /> ⇒ <InlineMath math={String.raw`x=31`} />. ב/ג נותנים את ההסתברות, לא הערך; ד הוא מטעה.
                </>
              }
            />
          </QuestionChild>

          <SolutionChild title="פתרון">
            <SolutionBody
              preFlight={{
                whatsGoingOn: (
                  <>
                    מוצאים את הערך <InlineMath math={String.raw`x_{0.75}`} /> המקיים <InlineMath math={String.raw`P(X\le x_{0.75})=0.75`} /> עבור <InlineMath math={String.raw`X\sim U(25,33)`} />.
                  </>
                ),
                distribution: (
                  <>
                    <InlineMath math={String.raw`X\sim U(a=25,\ b=33)`} /> — אחיד רציף (הזמן רציף).
                  </>
                ),
                formulas: [
                  'F(x)=\\dfrac{x-a}{b-a},\\quad x\\in[a,b]',
                  'x_p=a+p(b-a)',
                ],
                approach: (
                  <>
                    משווים את פונקציית ההתפלגות המצטברת ל‑0.75 ופותרים את <InlineMath math={String.raw`x`} />; לחלופין משתמשים בנוסחת האחוזון.
                  </>
                ),
              }}
              solutionSteps={[
                {
                  math: String.raw`0.75=\dfrac{x_{0.75}-25}{33-25}`,
                  commentary: 'רבעון עליון = אחוזון 75 = הנקודה שמשמאלה 75% מהשטח; <>זה בדיוק <InlineMath math={String.raw`F(x)=0.75`} />.</>',
                },
                {
                  math: String.raw`x_{0.75}-25=0.75\times 8=6\ \Rightarrow\ x_{0.75}=25+6=31`,
                  commentary: 'רוחב כולל 33−25=8; 75% ממנו הם 6, בתוספת הגבול התחתון 25 מקבלים 31.',
                },
                {
                  math: String.raw`P(X<31)=0.75\ \Rightarrow\ x=31\ \text{הוא האחוזון ה‑75}`,
                  commentary: '"ה‑31 הוא האחוזון ה‑75" — האחוזון הוא ערך הגבול, לא ההסתברות.',
                },
              ]}
              finalAnswer={String.raw`x_{0.75}=31\ \text{דקות}`}
              narration={
                <>
                  הרבעון העליון של זמן הכנת המרק הוא 31 דקות — הערך שמשמאלו 75% מהשטח ומימינו 25% מהשטח תחת פונקציית הצפיפות האחידה.
                </>
              }
              trap={
                <>
                  <strong>מלכודת קונספטואלית קריטית:</strong> האחוזון הוא <strong>הערך</strong> (31), לא ההסתברות (0.75). אפשרות שנותנת "ההסתברות שמשך הבישול{' '}
                  <InlineMath math={String.raw`<31`} />" מתארת את אותה נקודה, לא תשובה אחרת. פונקציית ה‑CDF האחידה ליניארית; בהתפלגות שאינה אחידה לא ניתן להשתמש ביחס רוחב פשוט.
                </>
              }
            />
          </SolutionChild>
        </ParentAccordion>

        {/* ════════════════════════════════════════════════════════════════
            QUESTION 4 — Estimator preference (unbiased vs biased)
            ════════════════════════════════════════════════════════════════ */}

        <ParentAccordion id="estimator-pref" title="העדפת אומדים (מוטה מול חסר הטיה)">
          <ExamStatement>
            איזו טענה בהכרח נכונה? (כמה עומדים מוצעים: מוטה תמיד עדיף על חסר הטיה; חסר הטיה תמיד עדיף על מוטה; חסר הטיה בעל הטיה קטנה יותר עדיף; אם שני עומדים מוטים — נעדיף בעל שונות קטנה יותר).
          </ExamStatement>

          {/* ── Question 6 / Section A ── */}
          <QuestionChild number="6" title="איזו טענה בהכרח נכונה?">
            <MCQuestionCard
              id="mc-q6"
              options={[
                { label: 'א', text: 'אין טענה שנכונה בהכרח', correct: true },
                { label: 'ב', text: 'אומד מוטה יהיה תמיד עדיף על פני אומד חסר הטיה' },
                { label: 'ג', text: 'אומד חסר הטיה יהיה תמיד עדיף על פני אומד מוטה' },
                { label: 'ד', text: 'אומד חסר הטיה בעל הטיה יותר קטנה עדיף מאומד חסר הטיה בעל הטיה יותר גדולה' },
                { label: 'ה', text: 'אם שני אומדים הם מוטים, נעדיף את זה שיש לו שונות יותר קטנה' },
              ]}
              rationale={
                <>
                  העדפת אומדים נקבעת לפי <InlineMath math={String.raw`MSE=V+\text{bias}^2`} />, לא לפי חסר‑הטיה או שונות בנפרד. אף אחת מב–ה אינה בהכרח נכונה.
                </>
              }
            />
          </QuestionChild>

          <SolutionChild title="פתרון">
            <SolutionBody
              preFlight={{
                whatsGoingOn: <>מחליטים איזו טענה (אם בכלל) על העדפת אומדים נכונה תמיד.</>,
                distribution: <>תורת האמידה; קריטריון ההחלטה הוא שגיאת הריבוע הממוצעת.</>,
                formulas: [
                  String.raw`\operatorname{MSE}(T)=V(T)+\operatorname{Bias}(T)^2`,
                  String.raw`\text{העדפה לפי }MSE\ \text{קטן יותר, לא לפי חסר‑הטיה בלבד}`,
                ],
                approach: (
                  <>
                    לכל טענה בודקים אם ה‑<InlineMath math={String.raw`MSE`} /> אכן נקבע. אומד מוטה יכול לנצח אומד חסר‑הטיה אם שונותו קטנה בהרבה; אומד חסר‑הטיה עם שונות ענקית
                    יכול להיות גרוע מאומד מוטה מעט.
                  </>
                ),
              }}
              solutionSteps={[
                {
                  math: String.raw`"\text{מוטה תמיד עדיף}"\ \Rightarrow\ \text{שגוי — משווים לפי }MSE`,
                  commentary: <>"אנחנו קובעים לפי ה‑<InlineMath math={String.raw`MSE`} />… לא לפי אם העומד מוטה או לא מוטה."</>,
                },
                {
                  math: String.raw`"\text{חסר הטיה תמיד עדיף}"\ \Rightarrow\ \text{שגוי — אותה סיבה}`,
                  commentary: <>חסר‑הטיה אינו מבטיח <InlineMath math={String.raw`MSE`} /> נמוך יותר.</>,
                },
                {
                  math: String.raw`"\text{חסר הטיה בעל הטיה קטנה יותר}"\ \Rightarrow\ \text{חסר‑משמעות (חסר הטיה}\Rightarrow\text{bias=0)}`,
                  commentary: 'משפט סתירה עצמית: חסר הטיה פירושו הטיה 0, אז "הטיה קטנה יותר" אינו קיים.',
                },
                {
                  math: String.raw`"\text{שני מוטים}\Rightarrow\text{נעדיף שונות קטנה}"\ \Rightarrow\ \text{שגוי — צריך גם }bias^2`,
                  commentary: <>רק אם שניהם חסרי הטיה (bias=0) היה "שונות קטנה ⇒ <InlineMath math={String.raw`MSE`} /> קטן" נכון. עם הטיה נדרשים שני האיברים.</>,
                },
                { math: String.raw`\Rightarrow\boxed{\text{אף טענה אינה בהכרח נכונה}}`, commentary: '' },
              ]}
              finalAnswer={String.raw`\text{אין טענה שנכונה בהכרח; הבחירה לפי }\operatorname{MSE}(T)=V(T)+\operatorname{Bias}(T)^2`}
              narration={
                <>
                  כדי להחליט איזה עומד עדיף מסתכלים תמיד על ה‑<InlineMath math={String.raw`MSE`} /> שמשקלל גם שונות וגם הטיה בריבוע — ולכן אף אחת מהטענות הללו אינה נכונה בהכרח.
                </>
              }
              trap={
                <>
                  <strong>מלכודת קונספטואלית קריטית:</strong> "חסר הטיה" אינו אומר "טוב יותר". קריטריון הדירוג הוא <InlineMath math={String.raw`MSE=V+\text{bias}^2`} />. שני אומדים
                  חסרי הטיה ⇒ שונות קטנה מנצחת; שני מוטים ⇒ דרושים שני האיברים. שימו לב לניסוח: "חסר הטיה בעל הטיה יותר קטנה" הוא סתירה עצמית (חסר הטיה ⇒ הטיה 0).
                </>
              }
            />
          </SolutionChild>
        </ParentAccordion>

        {/* ════════════════════════════════════════════════════════════════
            QUESTION 5 — Albumin in diabetic patients (open question, A–F)
            ════════════════════════════════════════════════════════════════ */}

        <ParentAccordion id="albumin-diabetes" title="אלבומין בחולי סוכרת (שאלה פתוחה)">
          <ExamStatement>
            במחקר על תפקודי כבד של חולי סוכרת נמדד ריכוז האלבומין בדם (גרם/דציליטר) של 6 נבדקים:{' '}
            <InlineMath math={String.raw`5.4,\ 3.4,\ 5.0,\ 5.5,\ 3.5,\ 7.1`} />. ידוע שהריכוז מתפלג נורמלית, ושבקרב אנשים <strong>בריאים</strong> ריכוז האלבומין הוא{' '}
            <InlineMath math={String.raw`\mu=4.4`} />.
          </ExamStatement>

          {/* ── Section A: population & variable ── */}
          <QuestionChild
            number="א"
            title="אוכלוסיית המחקר והמשתנה הנחקר"
          >
            <SolutionBody
              preFlight={{
                whatsGoingOn: (
                  <>
                    מזהים את אוכלוסיית היעד ואת המשתנה הנמדד — פתיחת "מהי האוכלוסייה / מהו המשתנה" הקלאסית.
                  </>
                ),
                distribution: (
                  <>
                    <InlineMath math={String.raw`X`} /> = ריכוז אלבומין, <InlineMath math={String.raw`X\sim N(\mu,\sigma^2)`} /> (נורמליות נתונה).
                  </>
                ),
                formulas: [
                  String.raw`\text{אוכלוסייה = הקבוצה שעליה רוצים להיסק}`,
                  String.raw`\text{משתנה = הגודל הנמדד על כל יחידה}`,
                ],
                approach: (
                  <>
                    המחקר עוסק בתפקודי כבד של חולי סוכרת ⇒ האוכלוסייה = חולי סוכרת; המשתנה = ריכוז אלבומין בדם.
                  </>
                ),
              }}
              solutionSteps={[
                {
                  math: String.raw`\text{אוכלוסייה} = \text{חולי סוכרת}`,
                  commentary: '"אוכלוסיית המחקר זו חולי הסוכרת."',
                },
                {
                  math: String.raw`X=\text{ריכוז האלבומין בדם (גרם/דציליטר)},\quad X\sim N(\mu,\sigma^2)`,
                  commentary: 'הערך 4.4 שייך לאוכלוסייה הבריאה, לא לאוכלוסייה החולת‑סוכרת שאנו חוקרים — יש להפריד ביניהן.',
                },
              ]}
              finalAnswer={String.raw`\text{אוכלוסייה: חולי סוכרת; משתנה: ריכוז אלבומין בדם }X\sim N(\mu,\sigma^2)`}
              narration={
                <>
                  אוכלוסיית המחקר היא חולי הסוכרת והמשתנה הנחקר הוא ריכוז האלבומין בדם, שהתפלגותו נורמלית.
                </>
              }
              trap={
                <>
                  <strong>מלכודת קונספטואלית קריטית:</strong> המספר 4.4 הוא ממוצע אוכלוסיית ה<strong>בריאים</strong>, לא פרמטר האוכלוסייה החולת‑סוכרת. אל תבלבלו
                  בין "בריאים <InlineMath math={String.raw`\mu=4.4`} />" לבין "חולי סוכרת <InlineMath math={String.raw`\mu`} />".
                </>
              }
            />
          </QuestionChild>

          {/* ── Section B: unbiased point estimators ── */}
          <QuestionChild number="ב" title={<>אומדים חסרי הטיה של <InlineMath math={String.raw`\mu`} /> ושל <InlineMath math={String.raw`\sigma^2`} /></>}>
            <SolutionBody
              preFlight={{
                whatsGoingOn: (
                  <>
                    בעזרת אומדים חסרי הטיה מחשבים את ממוצע המדגם (ל‑<InlineMath math={String.raw`\mu`} />) ואת שונות המדגם (ל‑<InlineMath math={String.raw`\sigma^2`} />) מ‑6 התצפיות.
                  </>
                ),
                distribution: (
                  <>
                    <InlineMath math={String.raw`X\sim N(\mu,\sigma^2)`} />, <InlineMath math={String.raw`n=6`} />; <InlineMath math={String.raw`\mu`} /> ו‑<InlineMath math={String.raw`\sigma^2`} /> לא ידועים.
                  </>
                ),
                formulas: [
                  String.raw`\bar X=\dfrac{1}{n}\sum X_i\ \text{(חסר הטיה ל‑}\mu)`,
                  String.raw`s^2=\dfrac{1}{n-1}\sum (X_i-\bar X)^2\ \text{(חסר הטיה ל‑}\sigma^2)`,
                  String.raw`s^2=\dfrac{\sum X_i^2-n\bar X^2}{n-1}\ \text{(צורה חישובית)}`,
                ],
                approach: (
                  <>
                    מחשבים את <InlineMath math={String.raw`\bar x`} /> ישירות; ל‑<InlineMath math={String.raw`s^2`} /> משתמשים בצורה החישובית (מהירה, פחות עיגולים). כי <InlineMath math={String.raw`\mu`} /> של חולי
                    הסוכרת לא ידוע — מחלקים ב‑<InlineMath math={String.raw`n-1=5`} />, לא ב‑<InlineMath math={String.raw`n`} />.
                  </>
                ),
              }}
              solutionSteps={[
                {
                  math: String.raw`\bar x=\dfrac{5.4+3.4+5.0+5.5+3.5+7.1}{6}=\dfrac{29.9}{6}=4.983`,
                  commentary: <>זהו האומד <InlineMath math={String.raw`\bar X`} />, <strong>הערכה</strong> של <InlineMath math={String.raw`\mu`} /> — לעולם לא כותבים "<InlineMath math={String.raw`\mu`} />=4.983"; <InlineMath math={String.raw`\mu`} /> נשאר בלתי ידוע.</>,
                },
                {
                  math: String.raw`\sum X_i^2=5.4^2+3.4^2+5.0^2+5.5^2+3.5^2+7.1^2=158.63`,
                  commentary: <>מרבעים כל תצפית; נזווג עם <InlineMath math={String.raw`n\cdot \bar{x}^2`} />.</>,
                },
                {
                  math: String.raw`s^2=\dfrac{158.63-6(4.983)^2}{5}=\dfrac{158.63-148.98}{5}=\dfrac{9.65}{5}=1.93\ (1.9257\ \text{בדיוק})`,
                  commentary: <>כי ממוצע אוכלוסיית חולי הסוכרת אינו ידוע — משתמשים במכנה <InlineMath math={String.raw`n-1`} />. אילו <InlineMath math={String.raw`\mu`} /> היה ידוע היינו מחלקים ב‑<InlineMath math={String.raw`n`} />.</>,
                },
                {
                  math: String.raw`\text{אין שורש ריבוע — מבקשים את אומד השונות }s^2`,
                  commentary: <>אומד סטיית תקן היה דורש <InlineMath math={String.raw`\sqrt{s^2}`} />.</>,
                },
              ]}
              finalAnswer={String.raw`\bar x=4.983;\quad s^2=1.9257\ \text{(אומדים חסרי הטיה של }\mu,\ \sigma^2)`}
              narration={
                <>
                  הערכנו את תוחלת ריכוז האלבומין ב‑<InlineMath math={String.raw`4.983`} /> ואת שונותו ב‑<InlineMath math={String.raw`1.9257`} /> באמצעות עומדים חסרי הטיה, כאשר מחלקים ב‑
                  <InlineMath math={String.raw`n-1=5`} /> כי תוחלת חולי הסוכרת אינה ידועה.
                </>
              }
              trap={
                <>
                  <strong>מלכודת קונספטואלית קריטית:</strong> כותבים <InlineMath math={String.raw`\bar x=4.983`} /> (הערכה), <strong>לעולם לא</strong> "<InlineMath math={String.raw`\mu`} />=4.983". כך גם לשונות:{' '}
                  <InlineMath math={String.raw`s^2`} /> הוא האומד, <InlineMath math={String.raw`\sigma^2`} /> נשאר בלתי ידוע. תוחלת אוכלוסייה לא ידועה ⇒ מחלקים ב‑n−1; ידועה ⇒ ב‑n. ערבוב ביניהם מפסיד
                  נקודות. אל תוציאו שורש אלא אם מבקשים אומד סטיית תקן.
                </>
              }
            />
          </QuestionChild>

          {/* ── Section C: 95% CI for μ ── */}
          <QuestionChild number="ג" title={<>רווח סמך ברמת 95% ל‑<InlineMath math={String.raw`\mu`} /> (<InlineMath math={String.raw`t`} />)</>}>
            <SolutionBody
              preFlight={{
                whatsGoingOn: <>בונים רווח סמך ברמת ביטחון 95% לתוחלת אוכלוסיית חולי הסוכרת <InlineMath math={String.raw`\mu`} />.</>,
                distribution: (
                  <>
                    <InlineMath math={String.raw`X\sim N(\mu,\sigma^2)`} />, <InlineMath math={String.raw`\sigma^2`} /> <strong>לא ידועה</strong> ⇒ משתמשים בהתפלגות <InlineMath math={String.raw`t`} /> עם{' '}
                    <InlineMath math={String.raw`n-1`} /> דרגות חופש.
                  </>
                ),
                formulas: [
                  String.raw`\bar X\pm t_{n-1,\,1-\alpha/2}\cdot\dfrac{s}{\sqrt{n}}`,
                  String.raw`1-\alpha=0.95\ \Rightarrow\ \alpha=0.05\ \Rightarrow\ t_{5,\,0.975}`,
                ],
                approach: (
                  <>
                    יש לנו רק גדלים מדגמיים (<InlineMath math={String.raw`\bar x`} />, <InlineMath math={String.raw`s^2`} />), לכן הרווח מבוסס‑<InlineMath math={String.raw`t`} />, לא <InlineMath math={String.raw`Z`} />. מוצאים{' '}
                    <InlineMath math={String.raw`t_{5,0.975}=2.571`} />.
                  </>
                ),
              }}
              solutionSteps={[
                {
                  math: String.raw`df=n-1=5;\quad 1-\alpha/2=0.975\ \Rightarrow\ t_{5,0.975}=2.571`,
                  commentary: 'עוברים לטבלת t כי שונות האוכלוסייה לא ידועה ומציבים שונות מדגמית s². התפלגות t תלויה בגודל המדגם דרך df=n−1.',
                },
                {
                  math: String.raw`s=\sqrt{1.9257}=1.3877;\quad \dfrac{s}{\sqrt{n}}=\dfrac{1.3877}{\sqrt{6}}=\dfrac{1.3877}{2.449}=0.5665`,
                  commentary: '√6≈2.449; זהו שגיאת התקן המוערכת של הממוצע.',
                },
                {
                  math: String.raw`\text{שולי טעות} = 2.571\times 0.5665=1.457`,
                  commentary: '',
                },
                {
                  math: String.raw`4.983\pm1.457=(3.526,\ 6.440)`,
                  commentary: '',
                },
              ]}
              finalAnswer={String.raw`95\%\ \text{CI for }\mu:\ (3.526,\ 6.440)`}
              narration={
                <>
                  רווח הסמך ברמת ביטחון של 95% לתוחלת ריכוז האלבומין בחולי סוכרת הוא שבין 3.526 ל‑6.440 גרם/דציליטר, ונבנה על התפלגות <InlineMath math={String.raw`t`} /> כי שונות
                  האוכלוסייה אינה ידועה.
                </>
              }
              trap={
                <>
                  <strong>מלכודת קונספטואלית קריטית:</strong> שונות אוכלוסייה לא ידועה ⇒ רווח <strong>t</strong>, לא Z. שימוש ב‑Z כאן שגוי. "שונות מדגמית" s² תמיד ניתנת
                  לחישוב; מה שקובע לבחירת המבחן/הרווח הוא אם <InlineMath math={String.raw`\sigma^2`} /> (האוכלוסייה) ידועה. ככל ש‑n גדל, t מתקרבת ל‑Z.
                </>
              }
            />
          </QuestionChild>

          {/* ── Section D: test at α=0.05 ── */}
          <QuestionChild number="ד" title="מבחן ברמת 5%: האם אלבומין חולי סוכרת גבוה מהבריאים?">
            <SolutionBody
              preFlight={{
                whatsGoingOn: (
                  <>
                    בודקים האם ריכוז האלבומין של חולי סוכרת גבוה מהערך הבריא 4.4.
                  </>
                ),
                distribution: (
                  <>
                    <InlineMath math={String.raw`X\sim N(\mu,\sigma^2)`} />, <InlineMath math={String.raw`\sigma^2`} /> לא ידועה ⇒ מבחן <InlineMath math={String.raw`t`} /> חד‑צדדי ימני.
                  </>
                ),
                formulas: [
                  String.raw`H_0:\mu=4.4\quad\text{מול}\quad H_1:\mu>4.4`,
                  String.raw`t_{\text{stat}}=\dfrac{\bar X-\mu_0}{s/\sqrt{n}}`,
                  String.raw`\text{דוחים }H_0\iff t_{\text{stat}}>t_{n-1,\,1-\alpha}`,
                ],
                approach: (
                  <>
                    כותבים השערות (חובה — שווֹת נקודות), ואז משתמשים בכלל אזור הדחייה (מועדף ל‑t כי הטבלה גסה ל‑p-value מדויק).
                  </>
                ),
              }}
              solutionSteps={[
                {
                  math: String.raw`H_0:\mu=4.4,\qquad H_1:\mu>4.4`,
                  commentary: '"חייבים לכתוב השערות" — השמטה מפסידה נקודות גם אם החישוב מושלם. "גבוה מהבריאים (4.4)" ⇒ ימני.',
                },
                {
                  math: String.raw`\bar x=4.983,\ s=1.3877,\ n=6,\ \mu_0=4.4,\ \alpha=0.05`,
                  commentary: 'סיכום נתונים מהסעיפים הקודמים.',
                },
                {
                  math: String.raw`t_{\text{stat}}=\dfrac{4.983-4.4}{1.3877/\sqrt{6}}=\dfrac{0.583}{0.5665}=1.029`,
                  commentary: <>אותו מכנה כמו ברווח — מנרמלים את ממוצע המדגם עם סטיית התקן המדגמית כי <InlineMath math={String.raw`\sigma`} /> לא ידועה.</>,
                },
                {
                  math: String.raw`t_{5,\,1-\alpha}=t_{5,0.95}=2.015`,
                  commentary: '',
                },
                {
                  math: String.raw`1.029<2.015\ \Rightarrow\ \text{באזור הקבלה}\ \Rightarrow\ \text{לא דוחים }H_0`,
                  commentary: <>דחייה דורשת <InlineMath math={String.raw`t_\text{stat} \ge t_\text{crit}`} />; 1.029 רחוק מתחת ל‑2.015, לכן נשארים עם <InlineMath math={String.raw`H_0`} />.</>,
                },
              ]}
              finalAnswer={String.raw`\text{לא דוחים }H_0:\mu=4.4\ \text{ברמת }\alpha=0.05\ \text{(לא גבוה מהבריאים)}`}
              narration={
                <>
                  ברמת מובהקות של 5% אין ראיה מספקת לכך שריכוז האלבומין בדם חולי הסוכרת גבוה מהריכוז אצל אנשים בריאים, ולכן לא דחינו את השערת האפס.
                </>
              }
              trap={
                <>
                  <strong>מלכודת קונספטואלית קריטית:</strong> תמיד כותבים את ההשערות — הן מדורגות במפורש. ימני "גבוה מ‑4.4" ⇒ <InlineMath math={String.raw`H_1:\mu>4.4`} />, דוחים רק
                  על <InlineMath math={String.raw`t`} /> חיובי גדול. למבחני t עדיף כלל אזור הדחייה על פני ה‑p-value כשהטבלה גסה; שניהם נותנים את אותה החלטה. המסקנה חייבת להיות בהקשר
                  ("לא גבוה מהבריאים"), לא רק "לא דוחים <InlineMath math={String.raw`H_0`} />".
                </>
              }
            />
          </QuestionChild>

          {/* ── Section E: error type in D ── */}
          <QuestionChild number="ה" title="סוג השגיאה האפשרית ב‑ד">
            <SolutionBody
              preFlight={{
                whatsGoingOn: <>מכיוון שלא דחינו את <InlineMath math={String.raw`H_0`} />, קובעים איזה סוג שגיאה יכול היה להיגרם.</>,
                distribution: <>טקסונומיית שגיאות בבדיקת השערות.</>,
                formulas: [
                  String.raw`\text{Type I: דחיית }H_0\text{ אמתית}`,
                  String.raw`\text{Type II: אי‑דחיית }H_0\text{ שגויה (}H_1\text{ אמתית)}`,
                ],
                approach: (
                  <>
                    ההחלטה = "לא דוחים" ⇒ רק שגיאה מסוג שני אפשרית.
                  </>
                ),
              }}
              solutionSteps={[
                {
                  math: String.raw`\text{לא דחינו }H_0\ \Rightarrow\ \text{השגיאה האפשרית = מסוג שני (Type II)}`,
                  commentary: 'שגיאה מסוג שני פירושה ש‑H₁ אמנם אמתית אך המבחן לא זיהה זאת. זו שגיאה אפשרית, לא ודאית.',
                },
              ]}
              finalAnswer={String.raw`\text{השגיאה האפשרית = מסוג שני (Type II)}`}
              narration={
                <>
                  מכיוון שלא דחינו את <InlineMath math={String.raw`H_0`} /> על אף שייתכן שהיינו צריכים לדחות אותה, הטעות האפשרית כאן היא מסוג שני.
                </>
              }
              trap={
                <>
                  <strong>מלכודת קונספטואלית קריטית:</strong> "שגיאה אפשרית" פירושה תמיד Type I או Type II במובן הסטטיסטי — לעולם לא "טעות חישובית". סטודנטים
                  שכתבו "אולי טעות במחשבון" לא קיבלו נקודות. החלטה וסוג שגיאה זוגיים: דחייה ⇒ Type I אפשרית; אי‑דחייה ⇒ Type II אפשרית.
                </>
              }
            />
          </QuestionChild>

          {/* ── Section F: p-value bound ── */}
          <QuestionChild number="ו" title="מה ניתן לומר על ה‑p-value?">
            <SolutionBody
              preFlight={{
                whatsGoingOn: (
                  <>
                    <>אי‑אפשר לקרוא <InlineMath math={String.raw`p\text{-value}`} /> מדויק מטבלת <InlineMath math={String.raw`t`} />, אך אפשר <strong>לחסום</strong> אותו.</>
                  </>
                ),
                distribution: (
                  <>
                    <InlineMath math={String.raw`t`} /> עם <InlineMath math={String.raw`df=5`} />, ימני; <InlineMath math={String.raw`t_{\text{stat}}=1.029`} />.
                  </>
                ),
                formulas: [
                  String.raw`p\text{-value}=P(t_5>1.029)\ \text{(ימני)}`,
                  String.raw`\text{הטבלה נותנת שטחי זנב ימיני ל‑}t\text{ הרשומים}`,
                ],
                approach: (
                  <>
                    מוצאים את שני ערכי ה‑t המרחיקים את 1.029, קוראים את שטחי הזנב הימני שלהם, וקובעים שה‑p-value נמצא ביניהם. משווים ל‑<InlineMath math={String.raw`\alpha=0.05`} />.
                  </>
                ),
              }}
              solutionSteps={[
                {
                  math: String.raw`\text{שורה }t_5:\ t=0.727\Rightarrow\text{זנב ימין }0.25;\quad t=1.476\Rightarrow\text{זנב ימין }0.10`,
                  commentary: '1.029 שלנו נמצא בין 0.727 ל‑1.476, לכן שטח הזנב הימני שלו נמצא בין שטחי הזנבות שלהם.',
                },
                {
                  math: '0.10<P(t_5>1.029)<0.25',
                  commentary: '<><InlineMath math={String.raw`t`} /> גדול יותר ⇒ זנב ימיני קטן יותר;</> מכיוון ש‑1.029 בין שני הגבולות, השטח ביניהם.',
                },
                {
                  math: String.raw`\text{התחום כולו }>0.05=\alpha\ \Rightarrow\ \text{לא דוחים (תואם סעיף ד)}`,
                  commentary: '"אני יודעת שזה בין 10 ל‑25 אחוז, אבל זה בטוח גדול מ‑5 אחוז" — מספיק להחליט בלי ה‑p המדויק.',
                },
              ]}
              finalAnswer={String.raw`0.10<p\text{-value}<0.25\ \text{(ימני, }df=5)`}
              narration={
                <>
                  מהטבלה אפשר רק לחסום את ה‑<InlineMath math={String.raw`p`} />-value שלנו בין 0.10 ל‑0.25, ומכיוון שכל התחום הזה גדול מ‑0.05 — ההחלטה שלא לדחות את{' '}
                  <InlineMath math={String.raw`H_0`} /> נשארת בעינה.
                </>
              }
              trap={
                <>
                  <strong>מלכודת קונספטואלית קריטית:</strong> אי‑אפשר לקרוא p-value מדויק מטבלת t — רק לחסום אותו. הצגת התחום הפתוח היא התשובה המלאה הנכונה.
                  החסימה לבדה כבר מכריעה את המבחן כשכל התחום מצד אחד של <InlineMath math={String.raw`\alpha`} />.
                </>
              }
            />
          </QuestionChild>
        </ParentAccordion>

        {/* ════════════════════════════════════════════════════════════════
            QUESTION 6 — Two populations A and B
            ════════════════════════════════════════════════════════════════ */}

        <ParentAccordion id="two-populations" title="שתי אוכלוסיות A ו‑B">
          <ExamStatement>
            באוכלוסייה א׳ <InlineMath math={String.raw`X\sim U(20,40)`} />. באוכלוסייה ב׳ <InlineMath math={String.raw`X\sim N(35,2^2)`} />.
          </ExamStatement>

          {/* ── Section A: expectation & variance in A ── */}
          <QuestionChild number="א" title="תוחלת ושונות באוכלוסייה A">
            <SolutionBody
              preFlight={{
                whatsGoingOn: (
                  <>
                    מחשבים <InlineMath math={String.raw`E(X)`} /> ו‑<InlineMath math={String.raw`V(X)`} /> להתפלגות אחידה רציפה על <InlineMath math={String.raw`[20,40]`} />.
                  </>
                ),
                distribution: <>X ∼ U(a=20, b=40).</>,
                formulas: [
                  String.raw`E(X)=\dfrac{a+b}{2}`,
                  String.raw`V(X)=\dfrac{(b-a)^2}{12}`,
                ],
                approach: <>מציבים a=20, b=40 בשתי נוסחאות האחיד.</>,
              }}
              solutionSteps={[
                {
                  math: String.raw`E(X)=\dfrac{20+40}{2}=\dfrac{60}{2}=30`,
                  commentary: '',
                },
                {
                  math: String.raw`V(X)=\dfrac{(40-20)^2}{12}=\dfrac{400}{12}=33.33`,
                  commentary: '',
                },
              ]}
              finalAnswer={String.raw`E(X)=30;\quad V(X)=33.33`}
              narration={
                <>
                  באוכלוסייה א׳ המתפלגת אחיד רציף בין 20 ל‑40, התוחלת היא 30 והשונות היא 33.33.
                </>
              }
              trap={
                <>
                  <strong>מלכודת קונספטואלית קריטית:</strong> שונות אחידה משתמשת במכנה <strong>12</strong> (רציף), לא 2. אל תשתמשו מחדש במכנה של נוסחת התוחלת.
                </>
              }
            />
          </QuestionChild>

          {/* ── Section B: conditional probability from B ── */}
          <QuestionChild number="ב" title="הסתברות מותנית מאוכלוסייה B">
            <SolutionBody
              preFlight={{
                whatsGoingOn: (
                  <>
                    מחשבים <InlineMath math={String.raw`P(X>31\mid X>28.5)`} /> כאשר <InlineMath math={String.raw`X\sim N(35,2^2)`} />.
                  </>
                ),
                distribution: (
                  <>
                    <InlineMath math={String.raw`X\sim N(\mu=35,\sigma=2)`} />; תצפית בודדת (ללא ממוצע מדגם ⇒ ללא <InlineMath math={String.raw`\sqrt{n}`} />).
                  </>
                ),
                formulas: [
                  String.raw`P(A\mid B)=\dfrac{P(A\cap B)}{P(B)}`,
                  String.raw`Z=\dfrac{X-\mu}{\sigma}`,
                  String.raw`P(Z<-a)=1-\Phi(a)\ \text{(הופכים סימן וגם זנב)}`,
                ],
                approach: (
                  <>
                    החיתוך של "X&gt;31" ו‑"X&gt;28.5" הוא פשוט "X&gt;31". מנרמלים את שני הגבולות, עוברים לטבלה, ויוצרים היחס.
                  </>
                ),
              }}
              solutionSteps={[
                {
                  math: String.raw`A=\{X>31\},\ B=\{X>28.5\}\ \Rightarrow\ A\cap B=\{X>31\}`,
                  commentary: '"גדול מ‑31" כבר גורר "גדול מ‑28.5", לכן החיתוך מתכווץ לתנאי המחמיר.',
                },
                {
                  math: String.raw`z_1=\dfrac{31-35}{2}=\dfrac{-4}{2}=-2;\quad z_2=\dfrac{28.5-35}{2}=\dfrac{-6.5}{2}=-3.25`,
                  commentary: <>תצפית בודדת ⇒ המכנה הוא <InlineMath math={String.raw`\sigma`} />=2, לא <InlineMath math={String.raw`\sigma`} />/<InlineMath math={String.raw`\sqrt{n}`} />. אין כאן מדגם.</>,
                },
                {
                  math: String.raw`P(X>31)=P(Z>-2)=\Phi(2)=0.9772`,
                  commentary: '"משנים סימן, משנים כיוון" — זנב שמאל שלילי הופך לזנב שמאל של ערך חיובי; קוראים Φ (זנב שמאל) של הערך החיובי.',
                },
                {
                  math: String.raw`P(X>28.5)=P(Z>-3.25)=\Phi(3.25)=0.9994`,
                  commentary: '',
                },
                {
                  math: String.raw`P(X>31\mid X>28.5)=\dfrac{0.9772}{0.9994}=0.9778`,
                  commentary: '',
                },
              ]}
              finalAnswer={String.raw`P(X>31\mid X>28.5)=0.9778`}
              narration={
                <>
                  בהינתן שהערך כבר גדול מ‑28.5, ההסתברות שהוא יהיה גם גדול מ‑31 היא כ‑0.9778 — ושימו לב שאין כאן מדגם ולכן לא מחלקים בשורש{' '}
                  <InlineMath math={String.raw`n`} />.
                </>
              }
              trap={
                <>
                  <strong>מלכודת קונספטואלית קריטית:</strong> אין כאן √n — זו תצפית בודדת מאוכלוסייה B, לכן מנרמלים עם <InlineMath math={String.raw`\sigma`} /> לבדה. לזנב שמאל של z שלילי הופכים{' '}
                  <strong>גם</strong> סימן <strong>וגם</strong> זנב: <InlineMath math={String.raw`P(Z<-a)=1-\Phi(a)=\Phi(a)`} /> המשלים; אל תכתבו בטעות <InlineMath math={String.raw`1-\Phi(2)`} /> עבור <InlineMath math={String.raw`\Phi(2)`} />.
                </>
              }
            />
          </QuestionChild>

          {/* ── Section C: P(ΣXᵢ<1600) via משפט הגבול המרכזי ── */}
          <QuestionChild number="ג" title="P(ΣXᵢ<1600) באוכלוסייה A (משפט הגבול המרכזי)">
            <SolutionBody
              preFlight={{
                whatsGoingOn: (
                  <>
                    עם <InlineMath math={String.raw`n=50`} /> תצפיות i.i.d. מ‑<InlineMath math={String.raw`U(20,40)`} />, מוצאים <InlineMath math={String.raw`P(\sum_{i=1}^{50}X_i<1600)`} />.
                  </>
                ),
                distribution: (
                  <>
                    ה‑X המקורי <InlineMath math={String.raw`\sim U(20,40)`} /> (לא נורמלי); סכום/ממוצע מדגם ⇒ מפעילים את <strong>משפט הגבול המרכזי</strong>.
                  </>
                ),
                formulas: [
                  String.raw`\bar X\overset{\text{approx}}{\sim}N\!\left(\mu,\dfrac{\sigma^2}{n}\right)`,
                  String.raw`\mu=30,\ \sigma^2=33.33\ \text{(מסעיף א)}`,
                  String.raw`P\!\left(\sum X_i<1600\right)=P\!\left(\bar X<\dfrac{1600}{50}=32\right)`,
                ],
                approach: (
                  <>
                    ממירים גבול סכום לגבול ממוצע (1600/50=32), אז מנרמלים את ממוצע המדגם עם <InlineMath math={String.raw`\sigma`} />/<InlineMath math={String.raw`\sqrt{n}`} /> וקוראים זנב שמאל. <strong>ציון ה‑משפט הגבול המרכזי חובה</strong> (שווֹת נקודות).
                  </>
                ),
              }}
              solutionSteps={[
                {
                  math: String.raw`\sum X_i<1600\ \iff\ \bar X<32\ \text{(חלוקה ב‑}n=50)`,
                  commentary: 'עבודה עם הממוצע חוסכת את הסכום הגדול; התפלגות X̄ היא מה שמשפט הגבול המרכזי מתאר.',
                },
                {
                  math: String.raw`n=50;\ \bar X\overset{\text{approx}}{\sim}N\!\left(30,\ \dfrac{33.33}{50}\right)`,
                  commentary: '"מי שלא רושם את חלק משפט הגבול המרכזי — יורדות לו שלוש נקודות." ה‑X המקורי אחיד (לא נורמלי), לכן ה‑משפט הגבול המרכזי הוא בדיוק מה שמצדיק הקירוב הנורמלי.',
                },
                {
                  math: String.raw`z=\dfrac{32-30}{\sqrt{33.33/50}}=\dfrac{2}{\sqrt{0.6666}}=\dfrac{2}{0.8165}=2.45`,
                  commentary: <>משתמשים ב‑<InlineMath math={String.raw`\sigma`} />/<InlineMath math={String.raw`\sqrt{n}`} /> (כאן <InlineMath math={String.raw`\sqrt{33.33/50}`} />), שגיאת התקן של הממוצע — לא ב‑<InlineMath math={String.raw`\sigma`} /> של האוכלוסייה.</>,
                },
                {
                  math: String.raw`P(Z<2.45)=\Phi(2.45)=0.9929`,
                  commentary: '',
                },
              ]}
              finalAnswer={String.raw`P\!\left(\sum_{i=1}^{50}X_i<1600\right)=P(\bar X<32)\approx0.9929`}
              narration={
                <>
                  כי ה‑X המקורי אינו נורמלי, השתמשנו במשפט הגבול המרכזי כדי להתקרב לממוצע המדגמי בנורמלי, וקיבלנו שהסיכוי שהסכום ירד מתחת ל‑1600 הוא כ‑0.9929.
                </>
              }
              trap={
                <>
                  <strong>מלכודת קונספטואלית קריטית:</strong> ה‑X המקורי אחיד ⇒ <strong>חובה</strong> לצטט את ה‑משפט הגבול המרכזי כדי להצדיק קירוב נורמלי; השמטת צעד ה‑משפט הגבול המרכזי עולה
                  <>בכמחצית נקודות הסעיף. אילו X היה כבר נורמלי, ה‑משפט הגבול המרכזי היה מיותר (סכום נורמליים הוא בדיוק נורמלי).</> מנרמלים את <strong>הממוצע</strong> עם <InlineMath math={String.raw`\sigma`} />/<InlineMath math={String.raw`\sqrt{n}`} />; אל תשתמשו
                  ב‑<InlineMath math={String.raw`\sigma`} /> לבדה כאן.
                </>
              }
            />
          </QuestionChild>

          {/* ── Section D: α and β for rejection rule ── */}
          <QuestionChild number="ד" title="α ו‑β לכלל הדחייה X̄>34">
            <SolutionBody
              preFlight={{
                whatsGoingOn: (
                  <>
                    כל 20 התצפיות מגיעות מאותה אוכלוסייה (לא ידוע איזו). <InlineMath math={String.raw`H_0`} />: אוכלוסייה A (<InlineMath math={String.raw`U(20,40)`} />);{' '}
                    <InlineMath math={String.raw`H_1`} />: אוכלוסייה B (<InlineMath math={String.raw`N(35,2^2)`} />). כלל דחייה: דוחים את <InlineMath math={String.raw`H_0`} /> אם{' '}
                    <InlineMath math={String.raw`\bar X>34`} />. מחשבים <InlineMath math={String.raw`\alpha`} /> (Type I) ו‑<InlineMath math={String.raw`\beta`} /> (Type II).
                  </>
                ),
                distribution: (
                  <>
                    תחת <InlineMath math={String.raw`H_0`} />: <InlineMath math={String.raw`X\sim U(20,40)`} />, <InlineMath math={String.raw`n=20`} /> ⇒ משפט הגבול המרכזי ל‑X̄. תחת <InlineMath math={String.raw`H_1`} />:{' '}
                    <InlineMath math={String.raw`X\sim N(35,2^2)`} />, <InlineMath math={String.raw`n=20`} /> ⇒ X̄ נורמלית מדויקת.
                  </>
                ),
                formulas: [
                  String.raw`\alpha=P(\bar X>34\mid H_0)`,
                  String.raw`\beta=P(\bar X\le34\mid H_1)`,
                  String.raw`\text{תחת }H_0:\ \bar X\sim N(30,\ 33.33/20)\ \text{(משפט הגבול המרכזי)}`,
                  String.raw`\text{תחת }H_1:\ \bar X\sim N(35,\ 4/20)\ \text{(מדויק)}`,
                ],
                approach: (
                  <>
                    עבור <InlineMath math={String.raw`\alpha`} /> מקרבים את X̄ תחת <InlineMath math={String.raw`H_0`} /> ב‑משפט הגבול המרכזי ומוצאים זנב ימין מעל 34. עבור <InlineMath math={String.raw`\beta`} /> משתמשים בנורמלית
                    המדויקת תחת <InlineMath math={String.raw`H_1`} /> ומוצאים זנב שמאל עד 34.
                  </>
                ),
              }}
              solutionSteps={[
                {
                  math: String.raw`\text{Type I (}\alpha\text{) — תחת }H_0\text{ (A):}\quad SE=\sqrt{33.33/20}=\sqrt{1.6665}=1.291`,
                  commentary: 'תחת האפס הנתונים אחידים, לכן שוב זקוקים ל‑משפט הגבול המרכזי כדי להצדיק נורמליות של X̄. הגבול 34 רחוק בזנב הימני ⇒ α זעיר.',
                },
                {
                  math: String.raw`z=\dfrac{34-30}{1.291}=\dfrac{4}{1.291}=3.09;\quad \alpha=P(Z>3.09)=1-\Phi(3.09)=1-0.9990=0.001`,
                  commentary: '',
                },
                {
                  math: String.raw`\text{Type II (}\beta\text{) — תחת }H_1\text{ (B):}\quad SE=\sqrt{4/20}=\sqrt{0.2}=0.447`,
                  commentary: 'כאן X נורמלי ממילא, לכן X̄ נורמלית מדויקת לכל n — בלי משפט הגבול המרכזי.',
                },
                {
                  math: String.raw`z=\dfrac{34-35}{0.447}=\dfrac{-1}{0.447}=-2.24;\quad \beta=P(Z\le-2.24)=P(Z>2.24)=1-\Phi(2.24)=1-0.9875=0.0125`,
                  commentary: 'z שלילי ⇒ הופכים סימן וזנב: זנב שמאל של −2.24 = זנב ימין של +2.24.',
                },
              ]}
              finalAnswer={String.raw`\alpha=0.001;\quad \beta=0.0125`}
              narration={
                <>
                  רמת המובהקות (טעות מסוג ראשון) היא 0.001 וסיכוי הטעות מסוג שני הוא 0.0125 — ושימו לב שתחת <InlineMath math={String.raw`H_0`} /> נזקקנו למשפט הגבול המרכזי בעוד שתחת{' '}
                  <InlineMath math={String.raw`H_1`} /> ההתפלגות נורמלית ממילא.
                </>
              }
              trap={
                <>
                  <strong>מלכודת קונספטואלית קריטית:</strong> תחת <InlineMath math={String.raw`H_0`} /> (אחיד) זקוקים ל‑משפט הגבול המרכזי כדי לקרב את X̄; תחת <InlineMath math={String.raw`H_1`} /> (נורמלי){' '}
                  <strong>אין</strong> צורך בו — סכום/ממוצע של נורמליים הוא בדיוק נורמלי. שכחת משפט הגבול המרכזי היכן שנדרש, או הוספתו היכן שאינו נדרש, שתיהן עולות בנקודות.{' '}
                  <InlineMath math={String.raw`\alpha`} /> ו‑<InlineMath math={String.raw`\beta`} /> מחושבים תחת התפלגויות <em>שונות</em> (אפס מול חלופית). שמרו על ה‑<InlineMath math={String.raw`SE`} /> במקומו הנכון: <InlineMath math={String.raw`\sqrt{33.33/20}`} /> תחת
                  <InlineMath math={String.raw`H_0`} /> מול <InlineMath math={String.raw`\sqrt{4/20}`} /> תחת <InlineMath math={String.raw`H_1`} />.
                </>
              }
            />
          </QuestionChild>
        </ParentAccordion>

        {/* ════════════════════════════════════════════════════════════════
            APPENDIX 1 — Formula Cheat-Sheet
            ════════════════════════════════════════════════════════════════ */}

        <ParentAccordion id="appendix-formulas" title="נספח 1 — דף נוסחאות">
          <Card variant="default" className={CONTENT_WIDTH_CLASS}>
            <CardBody className="space-y-2 text-right" dir="rtl">
              {[
                ['אחיד — תוחלת', 'E(X)=\\dfrac{a+b}{2}', 'אחיד רציף על [a,b]'],
                ['אחיד — שונות', 'V(X)=\\dfrac{(b-a)^2}{12}', 'מכנה 12 (רציף)'],
                [<>אחיד — פונקציית מצטברת</>, 'F(x)=\\dfrac{x-a}{b-a},\\ x\\in[a,b]', 'לאחוזונים / הסתברויות'],
                ['אחיד — אחוזון', 'x_p=a+p(b-a)', 'p\\in[0,1]'],
                ['הסתברות מותנית', 'P(A\\mid B)=\\dfrac{P(A\\cap B)}{P(B)}', 'תוצאה ב‑[0,1]'],
                [<>Z חד‑מדגמי (<InlineMath math={String.raw`\sigma`} /> ידוע)</>, 'Z=\\dfrac{\\bar X-\\mu_0}{\\sigma/\\sqrt{n}}', 'שמאלי / ימני / דו‑צדדי'],
                [<>t חד‑מדגמי (<InlineMath math={String.raw`\sigma`} /> לא ידוע)</>, 't=\\dfrac{\\bar X-\\mu_0}{s/\\sqrt{n}}', 'df=n-1'],
                [<>רווח סמך t ל‑<InlineMath math={String.raw`\mu`} /></>, '\\bar X\\pm t_{n-1,1-\\alpha/2}\\dfrac{s}{\\sqrt{n}}', <><InlineMath math={String.raw`\sigma`} /> לא ידוע</>],
                [<>שונות מדגמית (חסר הטיה, <InlineMath math={String.raw`\mu`} /> לא ידוע)</>, 's^2=\\dfrac{1}{n-1}\\sum(X_i-\\bar X)^2', '<>מחלקים ב‑<InlineMath math={String.raw`n-1`} /></>'],
                [<>שונות — צורה חישובית</>, 's^2=\\dfrac{\\sum X_i^2-n\\bar X^2}{n-1}', 'מהיר, פחות עיגולים'],
                [<>אומד שונות כש‑<InlineMath math={String.raw`\mu`} /> ידוע</>, '\\dfrac{1}{n}\\sum(X_i-\\mu)^2', 'מחלקים ב‑n'],
                [<>משפט הגבול המרכזי (ממוצע מדגם)</>, '\\bar X\\overset{\\text{approx}}{\\sim}N\\!\\left(\\mu,\\dfrac{\\sigma^2}{n}\\right)', <>X לא נורמלי ⇒ צטטו משפט הגבול המרכזי</>],
                [<>סכום נורמליים בלתי־תלויים</>, '\\sum X_i\\sim N(n\\mu,\\ n\\sigma^2)', 'מדויק, בלי משפט הגבול המרכזי'],
                [<>שגיאות <InlineMath math={String.raw`\text{Type I / II}`} /></>, '\\alpha=P(\\text{דחייה}\\mid H_0);\\ \\beta=P(\\text{קבלה}\\mid H_1)', <>דחייה⇒I; קבלה⇒II</>],
                [<><InlineMath math={String.raw`MSE`} /> של אומד</>, '\\operatorname{MSE}(T)=V(T)+\\operatorname{Bias}(T)^2', 'קריטריון דירוג אומדים'],
              ].map(([name, latex, note], idx) => (
                <div key={idx} className="border-b border-[var(--color-border)] py-2 last:border-0">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{name}</p>
                  <div className="text-center" dir="ltr">
                    <BlockMath math={latex} />
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">{note}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </ParentAccordion>

        {/* ════════════════════════════════════════════════════════════════
            APPENDIX 2 — Sofia's Consolidated Exam Traps
            ════════════════════════════════════════════════════════════════ */}

        <ParentAccordion id="appendix-traps" title="נספח 2 — המלכודות של סופי">
          <Card variant="default" className={CONTENT_WIDTH_CLASS}>
            <CardBody className="space-y-3 text-right" dir="rtl">
              {[
                [<>השערות עוסקות ב‑<InlineMath math={String.raw`\mu`} />, לא ב‑<InlineMath math={String.raw`\bar{x}`} /></>, <>לעולם לא כותבים השערה עם 42 או <InlineMath math={String.raw`\bar{x}`} />; 42 הוא נתון מדגמי שנצפה.</>],
                [<>החלטה ↔ סוג שגיאה נעולים</>, <>דחיית <InlineMath math={String.raw`H_0`} /> ⇒ <InlineMath math={String.raw`\text{Type I}`} /> אפשרי; אי‑דחייה ⇒ <InlineMath math={String.raw`\text{Type II}`} /> אפשרי. "שגיאה אפשרית" פירושה סטטיסטית, לעולם לא "טעות במחשבון".</>],
                [<>כלל ה‑<InlineMath math={String.raw`p\text{-value}`} /> אוניברסלי</>, <>דוחים ⇔ <InlineMath math={String.raw`p\text{-value} < \alpha`} />, לכל כיוון ולכל מבחן (Z או t).</>],
                [<>טיפול ב‑<InlineMath math={String.raw`z`} /> שלילי</>, <><InlineMath math={String.raw`P(Z<-a)=1-\Phi(a)`} /> — הופכים גם סימן וגם זנב; אל תקראו שלילי מטבלה חיובית‑בלבד.</>],
                [<>שונות אוכלוסייה לא ידועה ⇒ <InlineMath math={String.raw`t`} />, לא Z</>, <>רווח ומבחן ל‑<InlineMath math={String.raw`\mu`} /> משתמשים בהתפלגות <InlineMath math={String.raw`t`} />; מה שקובע הוא אם <InlineMath math={String.raw`\sigma^2`} /> (האוכלוסייה) ידוע.</>],
                [<>מכנה שונות חסרת הטיה</>, <><InlineMath math={String.raw`\mu`} /> לא ידוע ⇒ מחלקים ב‑n−1; <InlineMath math={String.raw`\mu`} /> ידוע ⇒ מחלקים ב‑n. ערבוב ביניהם מפסיד נקודות.</>],
                [<>הערכה מול פרמטר</>, <>כותבים <InlineMath math={String.raw`\bar{x}`} />=4.983 ו‑<InlineMath math={String.raw`s^2`} />=1.9257, לעולם לא "<InlineMath math={String.raw`\mu`} />=4.983" או "<InlineMath math={String.raw`\sigma^2`} />=…". הפרמטר נשאר לא ידוע.</>],
                ['חובה לצטט את ה‑משפט הגבול המרכזי', 'כש‑X המקורי לא נורמלי ומשתמשים בקירוב נורמלי לסכום/ממוצע — כותבים את שורת ה‑משפט הגבול המרכזי; השמטה עולה בכמחצית נקודות הסעיף.'],
                [<>אין <InlineMath math={String.raw`\sqrt{n}`} /> לתצפית בודדת</>, <>נרמול תצפית אחת משתמש ב‑<InlineMath math={String.raw`\sigma`} /> לבדה, לא ב‑<InlineMath math={String.raw`\sigma`} />/<InlineMath math={String.raw`\sqrt{n}`} />.</>],
                [<>העדפת אומדים = <InlineMath math={String.raw`MSE`} /></>, <>חסר‑הטיה לבדו אינו הופך אומד לטוב יותר; משווים <InlineMath math={String.raw`MSE=V+\text{bias}^2`} />. שני חסרי הטיה ⇒ שונות קטנה מנצחת; שני מוטים ⇒ דרושים שני האיברים.</>],
              ].map(([title, body], idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 text-sm font-bold text-[var(--color-warning)]">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
                    <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{body}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </ParentAccordion>
      </div>
    </div>
  );
}

export default Exam2023Page;
