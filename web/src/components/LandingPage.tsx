import { useMemo, useState, useEffect, type ReactElement } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Brain,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  Goal,
  Layers3,
  LibraryBig,
  Play,
  Rocket,
  Sigma,
  Sparkles,
  Table2,
} from 'lucide-react';
import { InlineMath } from 'react-katex';
import {
  AnimatedBackground,
  GlowingTiltCard,
  GradientButton,
  HoverImageCard,
  MagneticButton,
  ParallaxScroll,
  ProgressStrip,
  ScrollReveal,
  SimpleTabs,
  SpotlightCard,
  StaggerContainer,
} from './landing-template/TemplatePrimitives';
import SiteFooter from './SiteFooter';
import SiteHeader, { type SitePage } from './SiteHeader';
import { EditableText, ReviewTarget } from './review-overlay';
import { Accordion } from './ui/Accordion';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { PageLayout } from './ui/PageLayout';

interface LandingPageProps {
  onNavigate: (page: SitePage) => void;
  onTryHypothesis: () => void;
}

const showcaseTabs = [
  { id: 'surfaces', label: 'מסכי עבודה' },
  { id: 'motion', label: 'אינטראקציה' },
];

export default function LandingPage({ onNavigate, onTryHypothesis }: LandingPageProps): ReactElement {
  const [activeTab, setActiveTab] = useState('surfaces');

  const faqItems = useMemo(
    () => [
      {
        key: 'faq-1',
        trigger: 'מה יש באתר חוץ מבדיקת השערות?',
        content:
          'יש גם חישובי הסתברויות בהתפלגות נורמלית, חישוב אחוזונים, טבלאות התפלגות ודף נוסחאות. כל מסך נגיש ישירות מהניווט העליון ומהכרטיסים בדף.',
      },
      {
        key: 'faq-2',
        trigger: 'למי האתר הזה מתאים?',
        content:
          'לסטודנטים שלומדים סטטיסטיקה ורוצים גם לחשב וגם להבין. הממשק בנוי בעברית RTL, והנוסחאות מוצגות בצורה קריאה עם KaTeX.',
      },
      {
        key: 'faq-3',
        trigger: 'מה מקבלים במסך בדיקת השערות?',
        content:
          'מנסחים H₀ ו־H₁, בוחרים רמת מובהקות, מזינים נתונים, ומקבלים סטטיסטי מבחן, ערך קריטי, p-value, גרף התפלגויות והחלטה מנוסחת בעברית.',
      },
      {
        key: 'faq-4',
        trigger: 'האם יש גם עזרי לימוד ולא רק מחשבונים?',
        content:
          'כן. יש דף נוסחאות, טבלאות התפלגות ומסכים שמקשרים בין הנוסחה, הגרף והתוצאה. הרעיון הוא לא רק לפתור תרגיל, אלא להבין למה התשובה נכונה.',
      },
    ],
    [],
  );

  return (
    <PageLayout
      header={<SiteHeader activePage="landing" onNavigate={onNavigate} />}
      footer={<SiteFooter onNavigate={onNavigate} />}
      contentWidthClassName="max-w-none"
    >
      <main className="relative flex w-full flex-col gap-10 overflow-hidden">
        <ReviewTarget id="landing-product-surfaces" label="Hero Section" editScope>
          <section className="relative w-full overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(20,23,31,0.98),rgba(26,29,36,0.94))] px-6 py-10 sm:px-8 lg:px-10 lg:py-16">
          <AnimatedBackground variant="gradient" className="-z-0" />
          <div className="absolute inset-0 -z-0 bg-[linear-gradient(90deg,rgba(250,204,21,0.03),transparent_22%,transparent_72%,rgba(46,196,182,0.04))]" />
          
          <div className="relative z-10 space-y-12">
            <ScrollReveal>
              <div className="space-y-6 text-center">
                <h1 className="mx-auto flex flex-col items-center justify-center gap-2 max-w-4xl text-[clamp(2.75rem,5vw,4.5rem)] font-display leading-[1.05] tracking-[-0.02em] text-[var(--color-text-primary)]">
                  <span>
                    תבינו את <span className="font-serif font-normal italic text-[var(--color-accent-brass)] px-1 drop-shadow-sm">הסמנטיקה</span> של...
                  </span>
                  <TypewriterEffect words={['הסתברות', 'התנייה', 'אחוזון', 'בדיקת השערות', 'ציון תקן', 'מובהקות', 'תוחלת', 'שונות', 'משתנה מקרי', 'סטיית תקן', 'התפלגות', 'רווח בר-סמך', 'מרחב מדגם', 'חוק בייס', 'פונקציית צפיפות', 'התפלגות נורמלית', 'התפלגות בינומית', 'מאורע משלים', 'משפט הגבול המרכזי']} />
                </h1>
                <p className="mx-auto block max-w-3xl text-body-lg font-semibold text-[var(--color-text-secondary)]">
                  <span className="font-serif italic font-normal text-[var(--color-accent-brass)] text-xl pr-1">סטטיסטי-קל</span> לא מיועד לקהל שמחפש רק תשובות סופיות או מהירות. כאן תמצאו <span className="text-[var(--color-text-primary)]">דרך, מוטיבציה, נשמה.</span> אם את/ה מחפש/ת תשובות זריזות לשאלות - הצ'אט AI יהיה הכתובת שלך.
                </p>
              </div>
            </ScrollReveal>

            <ParallaxScroll speed={0.12}>
              <div className="grid gap-6 lg:grid-cols-3">
                <GlowingTiltCard className="h-full">
                  <FeatureCard
                    icon={<Calculator size={24} />}
                    title="חישובי הסתברות"
                    body="חישוב הסתברות מצטברת, משלימה, בין שתי ערכים, מותנית, אחוזון, בליווי שלבי פתרון מלאים וגרף אינטראקטיבי מתעדכן בלייב להמחשה."
                    actionLabel="חשב הסתברות"
                    tone="cobalt"
                    onClick={() => onNavigate('forward')}
                  />
                </GlowingTiltCard>

                <div className="relative h-full">
                  <div className="absolute -inset-0.5 rounded-[26px] bg-gradient-to-b from-[var(--color-accent-brass)]/40 to-transparent opacity-80 blur-[2px] pointer-events-none" />
                  <GlowingTiltCard className="h-full relative z-10">
                    <FeatureCard
                      icon={<Goal size={24} />}
                      title="בדיקת השערות"
                      body="בדיקת השערות מא' עד ת' - 6 שלבים מדויקים בממשק נוח מקליטת נתונים למסקנה סופית."
                      actionLabel="מעבר לעמוד"
                      tone="brass"
                      onClick={() => onNavigate('hypothesis')}
                    />
                  </GlowingTiltCard>
                </div>

                <GlowingTiltCard className="h-full">
                  <FeatureCard
                    icon={<LibraryBig size={24} />}
                    title="טבלאות ונוסחאות"
                    body="עמודי עזר משופרים: טבלאות Z ו-t חכמות, כולל חיפוש הפוך ועמוד נוסחאות מדוגם עם נוסחאות מסטטיסטיקה א' וב'."
                    actionLabel="לנוסחאות והטבלאות"
                    tone="teal"
                    onClick={() => onNavigate('table')}
                  />
                </GlowingTiltCard>
              </div>
            </ParallaxScroll>
          </div>
          </section>
        </ReviewTarget>


        <section className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <ScrollReveal>
            <ReviewTarget id="landing-uniqueness-section" label="What Makes Site Unique" editScope>
              <Card variant="raised" className="h-full overflow-hidden rounded-[28px] p-0">
                <div className="border-b border-[var(--color-border)] px-6 py-5">
                  <SectionEyebrow label="זה לא רק מחשבון." />
                  <EditableText
                    id="landing-uniqueness-title"
                    label="Uniqueness Section Title"
                    text="מה מיוחד פה?"
                    as="h2"
                    className="mt-3 block text-display-h2 text-[var(--color-text-primary)]"
                  />
                </div>

                <div className="grid gap-4 p-6">
                  <InsightPanel
                    icon={<Sparkles size={18} />}
                    title="שלבי פתרון מלאים"
                    body="האתר לא עוצר בתשובה סופית. הוא מציג שלבי פתרון מלאים עם עזרים ויזואליים שמחברים בין הנוסחה, הגרף וההחלטה."
                    onClick={onTryHypothesis}
                    actionLabel="פתח בדיקת השערות"
                  />
                  <InsightPanel
                    icon={<Layers3 size={18} />}
                    title="טבלאות Z ו-T אינטראקטיביות עם חיפוש לשני הכיוונים"
                    body="חיפוש הסתברות לפי ערכי Z ו-T והפוך."
                    onClick={() => onNavigate('table')}
                    actionLabel="פתח טבלאות"
                  />
                  <InsightPanel
                    icon={<CheckCircle2 size={18} />}
                    title="ממשק עברית ברור ונקי"
                    body="השפה באתר מיועדת למשתמשי קצה רגילים: ברורה, מסודרת ונוחה לקריאה גם כשיש נוסחאות, גרפים וטבלאות על אותו מסך."
                    tone="teal"
                  />
                  <InsightPanel
                    icon={<BookOpen size={18} />}
                    title="עמוד נוסחאות מורחב"
                    body="עמוד נוסחאות מלא מסטטיסטיקה א' עד סטטיסטיקה ב'. מורחב, מפורט ומסודר לקטגוריות."
                    onClick={() => onNavigate('formula-sheet')}
                    actionLabel="פתח דף נוסחאות"
                  />
                </div>
              </Card>
            </ReviewTarget>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <ReviewTarget id="landing-showcase-gallery" label="Showcase Image Grid" editScope>
              <div className="grid gap-4 sm:grid-cols-2">
                <HoverImageCard
                  imageSrc="/public_images/landing-showcase-2026-06-22/z-table.png"
                  imageAlt="טבלת Z אינטראקטיבית"
                  title="טבלת Z"
                  description="חיפוש לפי ערך Z או לפי הסתברות, עם קפיצה אוטומטית לתא המתאים בתוך הטבלה."
                  badge="Z"
                />
                <HoverImageCard
                  imageSrc="/public_images/landing-showcase-2026-06-22/t-table.png"
                  imageAlt="טבלת T אינטראקטיבית"
                  title="טבלת T"
                  description="בחירת דרגות חופש, סוג מבחן ואלפא כדי לאתר מיד את הערך הקריטי המתאים להתפלגות t."
                  badge="T"
                />
                <HoverImageCard
                  imageSrc="/public_images/landing-showcase-2026-06-22/solution-steps.png"
                  imageAlt="שלבי פתרון"
                  title="שלבי פתרון"
                  description="פרוטוקול מלא של ניסוח השערות, בחירת מבחן, קביעת מובהקות, ערכים קריטיים וחישוב סטטיסטי המבחן."
                  badge="שלבים"
                />
                <HoverImageCard
                  imageSrc="/public_images/landing-showcase-2026-06-22/formula-sheet.png"
                  imageAlt="דף נוסחאות"
                  title="עמוד נוסחאות מורחב"
                  description="עמוד נוסחאות מלא מסטטיסטיקה א' עד סטטיסטיקה ב', מסודר לקטגוריות ועם חיפוש מהיר לפי נושא."
                  badge="נוסחאות"
                />
              </div>
            </ReviewTarget>
          </ScrollReveal>
        </section>


        <ReviewTarget id="landing-workflow-section" label="Workflow Showcase Section" editScope>
          <section className="w-full space-y-8">
          <ScrollReveal>
            <div className="space-y-4 text-center">
              <SectionEyebrow label="איך עובדים עם האתר" center />
              <EditableText
                id="landing-workflow-title"
                label="Workflow Title"
                text="מה המשתמש פוגש בפועל בתוך המוצר"
                as="h2"
                className="block text-display-h1 text-[var(--color-text-primary)]"
              />
              <EditableText
                id="landing-workflow-body"
                label="Workflow Body"
                text="הסקשן הזה נשאר showcase של רכיבים, אבל כל התוכן בו מחובר למסכים, פעולות ותוצרים אמיתיים של האתר."
                as="p"
                className="mx-auto block max-w-3xl text-body-base font-semibold text-[var(--color-text-secondary)]"
              />
              <SimpleTabs tabs={showcaseTabs} active={activeTab} onChange={setActiveTab} />
            </div>
          </ScrollReveal>

          {activeTab === 'surfaces' ? (
            <StaggerContainer className="grid gap-6 lg:grid-cols-3">
              <Card className="rounded-[28px] p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Brain className="text-[var(--color-accent-cobalt)]" size={22} />
                  <h3 className="text-heading-section font-black text-[var(--color-text-primary)]">מסלול עבודה טיפוסי</h3>
                </div>
                <div className="space-y-3">
                  {[
                    ['01', 'בוחרים סוג משימה: השערות / הסתברות / אחוזון'],
                    ['02', 'מזינים פרמטרים ונתוני מדגם'],
                    ['03', 'בודקים גרף, חישוב וערכים קריטיים'],
                    ['04', 'עוברים לטבלה או לנוסחאות לפי הצורך'],
                  ].map(([step, label]) => (
                    <div key={step} className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/75 px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-accent-cobalt-line)] bg-[var(--color-accent-cobalt-bg)] font-mono text-mono-xs text-[var(--color-accent-cobalt)]">
                        {step}
                      </div>
                      <span className="text-body-sm font-semibold text-[var(--color-text-secondary)]">{label}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="rounded-[28px] p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Sigma className="text-[var(--color-accent-brass)]" size={22} />
                  <h3 className="text-heading-section font-black text-[var(--color-text-primary)]">מה כל מסך מחזיר</h3>
                </div>
                <div className="grid gap-4">
                  <SignalCard label="בדיקת השערות" value={String.raw`z,\ p,\ Decision`} tone="brass" />
                  <SignalCard label="הסתברויות" value={String.raw`P(X<x),\ P(a<X<b)`} tone="cobalt" />
                  <SignalCard label="אחוזונים / עזר" value={String.raw`Quantile,\ Table,\ Formula`} tone="teal" />
                </div>
              </Card>

              <Card className="rounded-[28px] p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Rocket className="text-[var(--color-accent-teal)]" size={22} />
                  <h3 className="text-heading-section font-black text-[var(--color-text-primary)]">מעברים מהירים</h3>
                </div>
                <div className="grid gap-3">
                  <Button size="lg" onClick={onTryHypothesis} rightIcon={<ArrowUpRight size={16} />}>
                    פתח בדיקת השערות
                  </Button>
                  <Button size="lg" variant="secondary" onClick={() => onNavigate('inverse')} rightIcon={<ArrowUpRight size={16} />}>
                    פתח חישוב אחוזונים
                  </Button>
                  <Button size="lg" variant="ghost" onClick={() => onNavigate('formula-sheet')} rightIcon={<ArrowUpRight size={16} />}>
                    פתח נוסחאות
                  </Button>
                </div>
              </Card>
            </StaggerContainer>
          ) : null}

          {activeTab === 'motion' ? (
            <StaggerContainer className="grid gap-6 lg:grid-cols-3">
              <Card className="rounded-[28px] p-6">
                <h3 className="text-heading-section font-black text-[var(--color-text-primary)]">חשיפת מידע הדרגתית</h3>
                <p className="mt-2 text-body-sm font-semibold text-[var(--color-text-secondary)]">
                  הסקשנים נפתחים בהדרגה כדי לא להעמיס על המשתמש בבת אחת, במיוחד בדף שמרכז כמה סוגי משימות סטטיסטיות.
                </p>
                <div className="mt-5 space-y-4">
                  <ProgressStrip label="פתיחת hero" value={94} tone="brass" />
                  <ProgressStrip label="מעבר למסכי מוצר" value={88} tone="cobalt" />
                  <ProgressStrip label="הדגשת קריאה לפעולה" value={82} tone="teal" />
                </div>
              </Card>

              <Card className="rounded-[28px] p-6">
                <h3 className="text-heading-section font-black text-[var(--color-text-primary)]">פידבק אינטראקטיבי</h3>
                <p className="mt-2 text-body-sm font-semibold text-[var(--color-text-secondary)]">
                  hover, tilt ו־magnetic buttons מופיעים רק איפה שיש בחירה או מעבר חשוב, לא כקישוט שחוזר על עצמו בכל מקום.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <GradientButton size="md">פתח בדיקה</GradientButton>
                  <MagneticButton className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-2 text-body-sm font-black text-[var(--color-text-primary)]">
                    מעבר לטבלאות
                  </MagneticButton>
                </div>
              </Card>

              <Card className="rounded-[28px] p-6">
                <h3 className="text-heading-section font-black text-[var(--color-text-primary)]">ניווט שמחזיק הקשר</h3>
                <p className="mt-2 text-body-sm font-semibold text-[var(--color-text-secondary)]">
                  המעבר בין המסכים נשאר בתוך אותו workflow. אפשר לעבור מחישוב לעזרי לימוד בלי לאבד את הכיוון או את השפה הוויזואלית.
                </p>
                <div className="mt-5 grid gap-3">
                  <MiniBadge icon={<Goal size={16} />} text="בדיקת השערות" />
                  <MiniBadge icon={<Calculator size={16} />} text="חישובי Z והסתברויות" />
                  <MiniBadge icon={<BookOpen size={16} />} text="טבלאות ונוסחאות" />
                </div>
              </Card>
            </StaggerContainer>
          ) : null}
          </section>
        </ReviewTarget>

        <ReviewTarget id="landing-faq-section" label="FAQ Section" editScope>
          <section className="w-full rounded-[32px] border border-[var(--color-border)] bg-[linear-gradient(145deg,rgba(26,29,36,0.96),rgba(13,15,20,0.98))] px-6 py-10 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
            <ScrollReveal>
              <div className="space-y-5">
                <SectionEyebrow label="שאלות נפוצות" />
                <EditableText
                  id="landing-faq-title"
                  label="FAQ Title"
                  text="מה חשוב להבין לפני שנכנסים לחשב"
                  as="h2"
                  className="block text-display-h2 text-[var(--color-text-primary)]"
                />
                <EditableText
                  id="landing-faq-body"
                  label="FAQ Body"
                  text="השאלות כאן נבחרו לפי מה שהאתר באמת מציע: אילו מסכים יש, למי זה מתאים, ומה מקבלים במסכי החישוב והעזר."
                  as="p"
                  className="block max-w-2xl text-body-base font-semibold text-[var(--color-text-secondary)]"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <MiniBadge icon={<Goal size={16} />} text="בדיקת השערות" />
                  <MiniBadge icon={<Calculator size={16} />} text="הסתברויות ואחוזונים" />
                  <MiniBadge icon={<Table2 size={16} />} text="טבלאות התפלגות" />
                  <MiniBadge icon={<BookOpen size={16} />} text="דף נוסחאות" />
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.08}>
              <Accordion items={faqItems} variant="card" size="lg" className="rounded-[28px]" />
            </ScrollReveal>
          </div>
          </section>
        </ReviewTarget>

        <ReviewTarget id="landing-final-cta" label="Final CTA Section" editScope>
          <section className="relative w-full overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(99,102,241,0.16),rgba(13,15,20,0.98)_45%,rgba(46,196,182,0.12))] px-6 py-10 sm:px-8 lg:px-10">
          <AnimatedBackground variant="dots" className="-z-0" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <EditableText
                id="landing-final-cta-title"
                label="Final CTA Title"
                text={'התחל במקום שבו השאלה הסטטיסטית שלך\nהופכת להחלטה ברורה.'}
                as="h2"
                className="block max-w-4xl whitespace-pre-line text-[clamp(2.8rem,4vw,4.6rem)] font-display leading-[1] tracking-[-0.03em] text-[var(--color-text-primary)]"
              />
              <EditableText
                id="landing-final-cta-body"
                label="Final CTA Body"
                text="אפשר להתחיל בבדיקת השערות, לעבור לחישובי הסתברות או לפתוח מיד את דף הנוסחאות. כל המסלולים נשארים בתוך אותה שפה ויזואלית ואותו היגיון אקדמי."
                as="p"
                className="block max-w-2xl text-body-base font-semibold text-[var(--color-text-secondary)]"
              />
            </div>

            <div className="flex flex-col gap-3">
              <GradientButton size="lg" onClick={onTryHypothesis} rightIcon={<Goal size={18} />}>
                <EditableText
                  id="landing-final-primary-cta"
                  label="Final Primary CTA"
                  text="התחל בבדיקת השערות"
                />
              </GradientButton>
              <Button size="lg" variant="secondary" onClick={() => onNavigate('forward')} rightIcon={<ChevronLeft size={18} />}>
                <EditableText
                  id="landing-final-secondary-cta"
                  label="Final Secondary CTA"
                  text="עבור לחישובי הסתברות"
                />
              </Button>
            </div>
          </div>
          </section>
        </ReviewTarget>
      </main>
    </PageLayout>
  );
}

function SectionEyebrow({ label, center = false }: { label: string; center?: boolean }): ReactElement {
  return (
    <div className={`flex items-center gap-3 ${center ? 'justify-center' : ''}`}>
      <div className="accent-bar" />
      <span className="text-heading-label font-black text-[var(--color-accent-brass)]">{label}</span>
    </div>
  );
}

function SignalCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'brass' | 'teal' | 'cobalt';
}): ReactElement {
  const borderClass = {
    brass: 'border-[var(--color-accent-brass)]/45',
    teal: 'border-[var(--color-accent-teal)]/45',
    cobalt: 'border-[var(--color-accent-cobalt-line)]',
  }[tone];

  const textClass = {
    brass: 'text-[var(--color-accent-brass)]',
    teal: 'text-[var(--color-accent-teal)]',
    cobalt: 'text-[var(--color-accent-cobalt)]',
  }[tone];

  return (
    <div className={`rounded-[18px] border bg-[var(--color-surface)] p-4 ${borderClass}`}>
      <div className={`text-heading-label font-black ${textClass}`}>{label}</div>
      <div dir="ltr" className="mt-1 font-mono text-mono-lg text-[var(--color-text-primary)]">
        <InlineMath math={value} />
      </div>
    </div>
  );
}

function InputTile({ title, math }: { title: string; math: string }): ReactElement {
  return (
    <div className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
      <div className="text-body-xs font-black text-[var(--color-text-secondary)]">{title}</div>
      <div dir="ltr" className="mt-1 font-mono text-mono-sm text-[var(--color-text-primary)]">
        <InlineMath math={math} />
      </div>
    </div>
  );
}

function InsightPanel({
  icon,
  title,
  body,
  onClick,
  actionLabel,
  tone = 'cobalt',
}: {
  icon: ReactElement;
  title: string;
  body: string;
  onClick?: () => void;
  actionLabel?: string;
  tone?: 'cobalt' | 'teal' | 'brass';
}): ReactElement {
  const accentClasses = {
    cobalt: {
      icon: 'border-[var(--color-accent-cobalt-line)] bg-[var(--color-accent-cobalt-bg)] text-[var(--color-accent-cobalt)]',
      action: 'text-[var(--color-accent-cobalt)]',
      panel: 'bg-[var(--color-surface)]',
    },
    teal: {
      icon: 'border-[var(--color-accent-teal)]/45 bg-[rgba(46,196,182,0.12)] text-[var(--color-accent-teal)]',
      action: 'text-[var(--color-accent-teal)]',
      panel: 'bg-[linear-gradient(180deg,rgba(14,40,38,0.74),rgba(20,23,31,0.96))]',
    },
    brass: {
      icon: 'border-[var(--color-accent-brass)]/45 bg-[rgba(212,168,67,0.12)] text-[var(--color-accent-brass)]',
      action: 'text-[var(--color-accent-brass)]',
      panel: 'bg-[var(--color-surface)]',
    },
  }[tone];

  const content = (
    <>
      <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${accentClasses.icon}`}>
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-heading-section font-black text-[var(--color-text-primary)]">{title}</h3>
        <p className="text-body-sm font-semibold text-[var(--color-text-secondary)]">{body}</p>
        {actionLabel ? (
          <div className={`inline-flex items-center gap-2 pt-1 text-body-sm font-black ${accentClasses.action}`}>
            <span>{actionLabel}</span>
            <ArrowLeft size={16} />
          </div>
        ) : null}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`grid w-full grid-cols-[auto_1fr] gap-4 rounded-[22px] border border-[var(--color-border)] ${accentClasses.panel} p-4 text-right transition-transform hover:-translate-y-0.5`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`grid grid-cols-[auto_1fr] gap-4 rounded-[22px] border border-[var(--color-border)] ${accentClasses.panel} p-4`}>
      {content}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  actionLabel,
  progressLabel,
  progressValue,
  tone,
  onClick,
}: {
  icon: ReactElement;
  title: string;
  body: string;
  actionLabel: string;
  progressLabel?: string;
  progressValue?: number;
  tone: 'brass' | 'teal' | 'cobalt';
  onClick: () => void;
}): ReactElement {
  const glowClass = {
    brass: 'shadow-[0_24px_48px_rgba(250,204,21,0.08)]',
    teal: 'shadow-[0_24px_48px_rgba(46,196,182,0.08)]',
    cobalt: 'shadow-[0_24px_48px_rgba(99,102,241,0.12)]',
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-full w-full cursor-pointer rounded-[24px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(20,23,31,0.96),rgba(13,15,20,0.98))] p-6 text-right ${glowClass}`}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]">
              {icon}
            </div>
            <h3 className="m-0 text-display-h3 text-[var(--color-text-primary)]">{title}</h3>
          </div>
          <ArrowUpRight className="text-[var(--color-text-secondary)]" size={18} />
        </div>

        <div className="space-y-2">
          <p className="text-body-sm font-semibold text-[var(--color-text-secondary)]">{body}</p>
        </div>

        {progressLabel && progressValue !== undefined && (
          <ProgressStrip label={progressLabel} value={progressValue} tone={tone} />
        )}

        <div className="inline-flex items-center gap-2 text-body-sm font-black text-[var(--color-accent-brass)]">
          <span>{actionLabel}</span>
          <ChevronLeft size={16} />
        </div>
      </div>
    </button>
  );
}

function MiniBadge({ icon, text }: { icon: ReactElement; text: string }): ReactElement {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-body-sm font-black text-[var(--color-text-primary)]">
      <span className="text-[var(--color-accent-cobalt)]">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function TypewriterEffect({ words }: { words: string[] }): ReactElement {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[index];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(word.substring(0, text.length + 1));
        if (text === word) {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        setText(word.substring(0, text.length - 1));
        if (text === '') {
          setIsDeleting(false);
          setIndex((index + 1) % words.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, index, words]);

  return (
    <span className="inline-block min-w-[3ch] text-[var(--color-accent-teal)]">
      {text}<span className="animate-pulse">|</span>
    </span>
  );
}
