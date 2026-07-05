/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useState, useCallback, useMemo } from 'react';
import { Joyride, type Step } from 'react-joyride';
import LandingPage from './components/LandingPage';
import SiteFooter from './components/SiteFooter';
import SiteHeader, { type SitePage } from './components/SiteHeader';
import { PageLayout } from './components/ui/PageLayout';
import { PageTransition } from './components/PageTransition';
import type { CalcMode } from './components/calc-ui';

type ActivePage = 'landing' | 'hypothesis' | 'normal';
const JoyrideComponent = Joyride as any;

const HypothesisTestingCalculator = lazy(() => import('./components/HypothesisTestingCalculator'));
const NormalDistributionCalculator = lazy(() => import('./components/NormalDistributionCalculator'));

interface GuidedTourStep extends Step {
  context: {
    page: ActivePage;
    normalMode?: CalcMode;
  };
}

function getTourViewportOffset(): number {
  return Math.max(Math.round(window.innerHeight * 0.1), 88);
}

function scrollToTourTarget(target: HTMLElement): void {
  const targetTop = target.getBoundingClientRect().top + window.scrollY;
  const viewportOffset = getTourViewportOffset();

  window.scrollTo({
    top: Math.max(0, targetTop - viewportOffset),
    behavior: 'smooth',
  });
}

function waitForTourTarget(selector: string, attemptsLeft = 24): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const tryResolve = () => {
      const target = document.querySelector<HTMLElement>(selector);
      if (target || attemptsLeft <= 0) {
        resolve(target);
        return;
      }

      requestAnimationFrame(() => {
        waitForTourTarget(selector, attemptsLeft - 1).then(resolve);
      });
    };

    tryResolve();
  });
}

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [normalMode, setNormalMode] = useState<CalcMode>('hypothesis');
  const [guidedTourRun, setGuidedTourRun] = useState(false);
  const [guidedTourIndex, setGuidedTourIndex] = useState(0);

  const handleNavigate = useCallback((page: SitePage) => {
    // Smooth scroll to top on every navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page === 'landing' || page === 'hypothesis') {
      setActivePage(page);
      return;
    }

    try {
      window.localStorage.setItem('ND_mode', JSON.stringify(page));
    } catch {
      // Keep navigation working even when storage is unavailable.
    }
    setNormalMode(page);
    setActivePage('normal');
  }, []);

  const guidedTourSteps = useMemo<GuidedTourStep[]>(() => [
    {
      target: '.tour-step-intro',
      content: 'ברוכים הבאים לסיור המודרך. נתחיל מלמעלה ונרד לפי הסדר שבו הרכיבים מופיעים בדף, ואז נעבור לכלי הניווט ולדפי העזר.',
      disableBeacon: true,
      placement: 'center',
      context: { page: 'hypothesis' },
    },
    {
      target: '.tour-step-inputs',
      content: 'כאן מזינים את הפרמטרים של אוכלוסיית הבסיס, של המדגם, ושל השערת המחקר האלטרנטיבית.',
      placement: 'right',
      context: { page: 'hypothesis' },
    },
    {
      target: '.tour-power-quick-link',
      content: 'זהו קישור מהיר לעוצמת המבחן. לחיצה עליו פותחת את אקורדיון ה-Power ומקפיצה ישירות לחישוב המלא.',
      placement: 'bottom',
      context: { page: 'hypothesis' },
    },
    {
      target: '.tour-step-graph',
      content: 'זהו אזור הגרף. כאן רואים את התפלגות הדגימה, את אזור הדחייה, את האזור שאינו דחייה, ואת האזורים שנצבעים בזמן אמת.',
      placement: 'left',
      context: { page: 'hypothesis' },
    },
    {
      target: '.tour-step-graph-toggle',
      content: 'המתג הזה מציג או מסתיר את השערת המחקר בגרף, יחד עם אזור עוצמת המבחן. כך אפשר לראות ישירות את הקשר בין H₁ לבין 1-β.',
      placement: 'bottom',
      context: { page: 'hypothesis' },
    },
    {
      target: '.tour-step-decision',
      content: 'מטריצת ההחלטה מסכמת את ארבעת המצבים: דחייה נכונה, אי-דחייה נכונה, טעות מסוג I, וטעות מסוג II.',
      placement: 'top',
      context: { page: 'hypothesis' },
    },
    {
      target: '.tour-step-accordion-ht',
      content: 'באקורדיון הזה תמצאו את ששת שלבי פתרון בדיקת ההשערות, מניסוח ההשערות ועד קבלת המסקנה.',
      placement: 'top',
      context: { page: 'hypothesis' },
    },
    {
      target: '.tour-step-test-type',
      content: 'כאן בוחרים את סוג המבחן ואת הכיוון שלו, כלומר האם הבדיקה שמאלית, ימנית או דו-צדדית.',
      placement: 'bottom',
      context: { page: 'hypothesis' },
    },
    {
      target: '.tour-step-accordion-ci',
      content: 'כאן נמצא רווח הסמך, ומיד אחריו עוצמת המבחן. שני האזורים האלה משלימים את התמונה מעבר להחלטה הבסיסית של דחייה או אי-דחייה.',
      placement: 'top',
      context: { page: 'hypothesis' },
    },
    {
      target: '.tour-power-panel',
      content: 'כאן מופיע פירוק מלא של עוצמת המבחן: SE, ערך קריטי, חישוב Z תחת H₁, והמשמעות של 1-β מול β.',
      placement: 'top',
      context: { page: 'hypothesis' },
    },
    {
      target: '.tour-quick-nav-toggle',
      content: 'זהו כפתור הניווט המהיר. ממנו אפשר לקפוץ מיידית בין הכותרות המרכזיות של העמוד בלי לגלול ידנית.',
      placement: 'left',
      context: { page: 'hypothesis' },
    },
    {
      target: '.tour-scroll-top-button',
      content: 'וכשאתם כבר עמוק בעמוד, כפתור החזרה לראש העמוד מחזיר אתכם ישירות להתחלה.',
      placement: 'right',
      context: { page: 'hypothesis' },
    },
    {
      target: '.tour-nav-table',
      content: 'בסרגל העליון תמצאו מעבר ישיר לטבלאות ההתפלגות. ניכנס עכשיו לעמוד הזה כדי לראות איפה מאתרים ערכי Z וערכים קריטיים.',
      placement: 'bottom',
      isFixed: true,
      context: { page: 'hypothesis' },
    },
    {
      target: '.tour-z-table-scroll-anchor',
      spotlightTarget: '.tour-z-table-root',
      scrollTarget: '.tour-z-table-scroll-anchor',
      content: 'זהו עמוד טבלאות ההתפלגות. כאן תמצאו את טבלת ערכי Z הסטנדרטית ואת טבלאות העזר הרלוונטיות לעבודה ידנית.',
      placement: 'bottom',
      offset: 18,
      context: { page: 'normal', normalMode: 'table' },
    },
    {
      target: '.tour-nav-formula-sheet',
      content: 'בסרגל העליון יש גם מעבר לדף הנוסחאות. ניכנס עכשיו לעמוד הזה כדי לראות היכן נמצאים כל הריכוזים התיאורטיים במקום אחד.',
      placement: 'bottom',
      isFixed: true,
      context: { page: 'normal', normalMode: 'table' },
    },
    {
      target: '.tour-formula-sheet-scroll-anchor',
      spotlightTarget: '.tour-formula-sheet-root',
      scrollTarget: '.tour-formula-sheet-scroll-anchor',
      content: 'זהו דף הנוסחאות. כאן אפשר לחפש, להרחיב ולצמצם נושאים, ולעבור במהירות בין פרקים מרכזיים בסטטיסטיקה.',
      placement: 'bottom',
      offset: 18,
      context: { page: 'normal', normalMode: 'formula-sheet' },
    },
  ], []);

  const activateTourContext = useCallback((step: GuidedTourStep) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (step.context.page === 'hypothesis') {
      setActivePage('hypothesis');
      return;
    }

    if (step.context.page === 'normal' && step.context.normalMode) {
      setNormalMode(step.context.normalMode);
      setActivePage('normal');
    }
  }, []);

  const moveGuidedTourToStep = useCallback(async (nextIndex: number) => {
    const nextStep = guidedTourSteps[nextIndex];
    if (!nextStep) {
      return;
    }

    const isAlreadyOnTargetPage =
      (nextStep.context.page === 'hypothesis' && activePage === 'hypothesis') ||
      (nextStep.context.page === 'normal' && activePage === 'normal' && normalMode === nextStep.context.normalMode);

    activateTourContext(nextStep);

    const scrollTargetSelector =
      typeof nextStep.scrollTarget === 'string'
        ? nextStep.scrollTarget
        : typeof nextStep.target === 'string'
          ? nextStep.target
          : null;
    const settleDelay = isAlreadyOnTargetPage ? 0 : 420;

    window.setTimeout(async () => {
      if (scrollTargetSelector && nextStep.placement !== 'center') {
        const target = await waitForTourTarget(scrollTargetSelector);
        if (target) {
          scrollToTourTarget(target);
        }
      }

      window.setTimeout(() => {
        setGuidedTourIndex(nextIndex);
      }, scrollTargetSelector && nextStep.placement !== 'center' ? 320 : 0);
    }, settleDelay);
  }, [activateTourContext, activePage, guidedTourSteps, normalMode]);

  const handleStartHypothesisTour = useCallback(() => {
    const firstStep = guidedTourSteps[0];
    if (!firstStep) {
      return;
    }

    setGuidedTourRun(false);
    setGuidedTourIndex(0);
    activateTourContext(firstStep);
    window.setTimeout(() => {
      setGuidedTourIndex(0);
      setGuidedTourRun(true);
    }, 420);
  }, [activateTourContext, guidedTourSteps]);

  const tourScrollOffset = typeof window !== 'undefined'
    ? getTourViewportOffset()
    : 88;

  return (
    <PageTransition pageKey={activePage === 'normal' ? `normal-${normalMode}` : activePage}>
      <JoyrideComponent
        steps={guidedTourSteps}
        run={guidedTourRun}
        stepIndex={guidedTourIndex}
        continuous
        showSkipButton
        disableOverlayClose
        scrollOffset={tourScrollOffset}
        scrollToFirstStep
        portalElement="body"
        options={{
          zIndex: 10000,
          primaryColor: '#d4a843',
          backgroundColor: '#1e1e24',
          textColor: '#e0e0e0',
          arrowColor: '#1e1e24',
          overlayColor: 'rgba(3, 6, 13, 0.42)',
          spotlightPadding: 10,
          spotlightRadius: 18,
          skipScroll: true,
        }}
        styles={({
          tooltip: {
            direction: 'rtl',
            fontFamily: 'Assistant, sans-serif',
            textAlign: 'right',
            borderRadius: '8px',
            border: '1px solid #3f3f46',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.42)',
          },
          spotlight: {
            stroke: '#d4a843',
            strokeWidth: 3,
            filter: 'drop-shadow(0 0 12px rgba(212, 168, 67, 0.8)) drop-shadow(0 0 24px rgba(52, 82, 158, 0.45))',
          },
          buttonNext: { backgroundColor: '#34529e', color: '#fff', borderRadius: '4px', fontWeight: 'bold' },
          buttonBack: { color: '#a1a1aa', fontWeight: 'bold' },
          buttonSkip: { color: '#ef4444', fontWeight: 'bold' },
        }) as any}
        onEvent={(data: any) => {
          if (data.status === 'finished' || data.status === 'skipped') {
            setGuidedTourRun(false);
            setGuidedTourIndex(0);
            return;
          }

          if (data.type !== 'step:after' && data.type !== 'error:target_not_found') {
            return;
          }

          const delta = data.action === 'prev' ? -1 : 1;
          const nextIndex = data.index + delta;

          if (nextIndex < 0 || nextIndex >= guidedTourSteps.length) {
            setGuidedTourRun(false);
            return;
          }

          moveGuidedTourToStep(nextIndex);
        }}
        locale={{ back: 'חזור', close: 'סגור', last: 'סיום', next: 'הבא', skip: 'דלג' }}
      />

      {activePage === 'hypothesis' ? (
        <PageLayout
          header={<SiteHeader activePage="hypothesis" onNavigate={handleNavigate} />}
          footer={<SiteFooter onNavigate={handleNavigate} />}
        >
          <Suspense fallback={<PageLoadingState />}>
            <HypothesisTestingCalculator onStartGuidedTour={handleStartHypothesisTour} />
          </Suspense>
        </PageLayout>
      ) : null}

      {activePage === 'normal' ? (
        <PageLayout
          header={<SiteHeader activePage={normalMode as SitePage} onNavigate={handleNavigate} />}
          footer={<SiteFooter onNavigate={handleNavigate} />}
        >
          <Suspense fallback={<PageLoadingState />}>
            <NormalDistributionCalculator
              key={normalMode}
              initialMode={normalMode}
              onNavigate={handleNavigate}
            />
          </Suspense>
        </PageLayout>
      ) : null}

      {activePage === 'landing' ? (
        <LandingPage
          onNavigate={handleNavigate}
          onTryHypothesis={() => handleNavigate('hypothesis')}
          onStartHypothesisTour={handleStartHypothesisTour}
        />
      ) : null}
    </PageTransition>
  );
}

function PageLoadingState() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 text-center">
      <p className="text-body-base font-bold text-[var(--color-text-secondary)]">
        טוען מחשבון...
      </p>
    </div>
  );
}
