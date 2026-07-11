/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useState, useCallback, useMemo, useEffect } from 'react';
import { Joyride, type Step } from 'react-joyride';
import LandingPage from './components/LandingPage';
import SiteFooter from './components/SiteFooter';
import SiteHeader, { type SitePage } from './components/SiteHeader';
import { PageLayout } from './components/ui/PageLayout';
import { PageTransition } from './components/PageTransition';
import type { CalcMode } from './components/calc-ui';
import { type TourMode, type GuidedTourStep, getTourStepsByMode } from './config/tours';

type ActivePage = 'landing' | 'hypothesis' | 'point-estimation' | 'exam-2023' | 'normal' | 'summary' | 'regression' | 'test-yourself';
const JoyrideComponent = Joyride as any;

const HypothesisTestingCalculator = lazy(() => import('./components/HypothesisTestingCalculator'));
const NormalDistributionCalculator = lazy(() => import('./components/NormalDistributionCalculator'));
const PointEstimationPage = lazy(() => import('./components/PointEstimationPage'));
const SummaryPage = lazy(() => import('./components/SummaryPage'));
const Exam2023Page = lazy(() => import('./components/Exam2023Page'));
const LinearRegressionCalculator = lazy(() => import('./components/LinearRegressionCalculator'));
const TestYourselfPage = lazy(() => import('./components/TestYourselfPage'));

function getTourViewportOffset(): number {
  // Clears the sticky header and leaves a small visual buffer above the spotlight.
  return Math.max(Math.round(window.innerHeight * 0.1), 108);
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
  const [activeTourMode, setActiveTourMode] = useState<TourMode>(null);
  const [guidedTourIndex, setGuidedTourIndex] = useState(0);
  const [isTourTransitioning, setIsTourTransitioning] = useState(false);

  useEffect(() => {
    if (activeTourMode !== 'global') return;

    const handleClick = (e: MouseEvent) => {
      if (guidedTourIndex === 5) {
        // Quick nav toggle step
        const target = e.target as HTMLElement;
        if (target.closest('.tour-quick-nav-toggle')) {
          setIsTourTransitioning(true);
          // Programmatically open the confidence panel
          window.dispatchEvent(new CustomEvent('toc-open-path', { detail: { ids: ['confidence-panel'] } }));
          
          // We must wait for the accordion to fully expand, React to render
          // the formula blocks (incl. KaTeX), and then scroll the info button
          // into view before advancing.
          // Timeline: 350ms (accordion animation) → poll for element →
          //           scroll → 500ms (scroll settle) → advance tour.
          const ciFormulaSelector = '.tour-first-ci-formula button';
          setTimeout(() => {
            waitForTourTarget(ciFormulaSelector, 30).then((formulaBtn) => {
              if (formulaBtn) {
                // Position the button ~40% down the viewport so the
                // 'top'-placed tooltip has room to display above it.
                const btnTop = formulaBtn.getBoundingClientRect().top + window.scrollY;
                const offset = Math.round(window.innerHeight * 0.4);
                window.scrollTo({
                  top: Math.max(0, btnTop - offset),
                  behavior: 'smooth',
                });
                // Allow smooth scroll to finish before showing the tooltip
                setTimeout(() => {
                  setGuidedTourIndex(6);
                  setIsTourTransitioning(false);
                }, 500);
              } else {
                // Fallback: advance anyway so the tour doesn't get stuck
                setGuidedTourIndex(6);
                setIsTourTransitioning(false);
              }
            });
          }, 350);
        }
      } else if (guidedTourIndex === 7) {
        // Scroll top button step
        const target = e.target as HTMLElement;
        if (target.closest('.tour-scroll-top-button')) {
          setIsTourTransitioning(true);
          // Native component handles scroll to top. Just delay to let it scroll, then move to step 8.
          setTimeout(() => {
            setGuidedTourIndex(8);
            setIsTourTransitioning(false);
          }, 600);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [activeTourMode, guidedTourIndex]);

  const handleNavigate = useCallback((page: SitePage) => {
    // Smooth scroll to top on every navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page === 'landing' || page === 'hypothesis' || page === 'point-estimation' || page === 'exam-2023' || page === 'summary' || page === 'regression' || page === 'test-yourself') {
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

  const currentTourSteps = useMemo(() => getTourStepsByMode(activeTourMode), [activeTourMode]);

  const activateTourContext = useCallback((step: GuidedTourStep) => {
    if (step.context?.page === 'landing') {
      setActivePage('landing');
      return;
    }

    if (step.context?.page === 'hypothesis') {
      setActivePage('hypothesis');
      return;
    }

    if (step.context?.page === 'point-estimation') {
      setActivePage('point-estimation');
      return;
    }

    if (step.context?.page === 'normal' && step.context.normalMode) {
      setNormalMode(step.context.normalMode);
      setActivePage('normal');
    }
  }, []);

  const moveGuidedTourToStep = useCallback(async (nextIndex: number) => {
    const nextStep = currentTourSteps[nextIndex];
    if (!nextStep) {
      return;
    }

    const isAlreadyOnTargetPage =
      (nextStep.context?.page === 'landing' && activePage === 'landing') ||
      (nextStep.context?.page === 'hypothesis' && activePage === 'hypothesis') ||
      (nextStep.context?.page === 'point-estimation' && activePage === 'point-estimation') ||
      (nextStep.context?.page === 'normal' && activePage === 'normal' && normalMode === nextStep.context.normalMode);

    if (!isAlreadyOnTargetPage) {
      setIsTourTransitioning(true);
    }

    activateTourContext(nextStep);

    const scrollTargetSelector =
      typeof nextStep.scrollTarget === 'string'
        ? nextStep.scrollTarget
        : typeof nextStep.target === 'string'
          ? nextStep.target
          : null;
    const settleDelay = isAlreadyOnTargetPage ? 0 : 420;

    window.setTimeout(async () => {
      const selectorToFind = nextStep.scrollToId
        ? `#${nextStep.scrollToId}`
        : scrollTargetSelector;

      let target: HTMLElement | null = null;
      if (selectorToFind && (nextStep.placement !== 'center' || nextStep.scrollToId)) {
        // Wait extra time for the PageTransition animation to settle
        if (!isAlreadyOnTargetPage) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
        target = await waitForTourTarget(selectorToFind, 40);
      }

      if (nextStep.openPath) {
        window.dispatchEvent(new CustomEvent('toc-open-path', { detail: { ids: nextStep.openPath } }));
        await new Promise((resolve) => setTimeout(resolve, 350));
      }

      if (target) {
        scrollToTourTarget(target);
      }

      window.setTimeout(() => {
        setGuidedTourIndex(nextIndex);
        setIsTourTransitioning(false);
      }, selectorToFind && (nextStep.placement !== 'center' || nextStep.scrollToId) ? 320 : 0);
    }, settleDelay);
  }, [activateTourContext, activePage, currentTourSteps, normalMode]);

  const handleStartTour = useCallback((mode: TourMode) => {
    const steps = getTourStepsByMode(mode);
    const firstStep = steps[0];
    if (!firstStep) {
      return;
    }

    setIsTourTransitioning(true);
    setActiveTourMode(null);
    setGuidedTourIndex(0);
    // Only a newly-started tour resets to its first page. Advancing steps
    // stays on the current scroll position until the next target is ready.
    window.scrollTo({ top: 0, behavior: 'smooth' });
    activateTourContext(firstStep);
    window.setTimeout(async () => {
      // Wait for layout to settle
      await new Promise((resolve) => setTimeout(resolve, 300));

      let target: HTMLElement | null = null;
      if (firstStep.scrollToId) {
        target = await waitForTourTarget(`#${firstStep.scrollToId}`, 40);
      }

      if (firstStep.openPath) {
        window.dispatchEvent(new CustomEvent('toc-open-path', { detail: { ids: firstStep.openPath } }));
        await new Promise((resolve) => setTimeout(resolve, 350));
      }

      if (target) {
        scrollToTourTarget(target);
        await new Promise((resolve) => setTimeout(resolve, 320));
      }

      setGuidedTourIndex(0);
      setActiveTourMode(mode);
      setIsTourTransitioning(false);
    }, 420);
  }, [activateTourContext]);

  const handleStartHypothesisTour = useCallback(() => handleStartTour('global'), [handleStartTour]);

  const tourScrollOffset = typeof window !== 'undefined'
    ? getTourViewportOffset()
    : 88;

  return (
    <PageTransition pageKey={activePage === 'normal' ? `normal-${normalMode}` : activePage}>
      <JoyrideComponent
        key={activeTourMode || 'inactive'}
        steps={currentTourSteps}
        run={activeTourMode !== null}
        stepIndex={guidedTourIndex}
        continuous
        showSkipButton
        scrollOffset={tourScrollOffset}
        scrollToFirstStep
        portalElement="body"
        options={{
          zIndex: 10000,
          primaryColor: 'var(--color-accent-brass)',
          backgroundColor: 'var(--color-surface-raised)',
          textColor: 'var(--color-text-primary)',
          arrowColor: 'var(--color-surface-raised)',
          overlayColor: 'rgba(0, 0, 0, 0.28)',
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
            border: '1px solid var(--color-border)',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.42)',
            ...(isTourTransitioning && { opacity: 0, pointerEvents: 'none' }),
          },
          ...(isTourTransitioning && { overlay: { opacity: 0, pointerEvents: 'none' } }),
          spotlight: {
            stroke: 'var(--color-accent-brass)',
            strokeWidth: 3,
            filter: 'drop-shadow(0 0 12px color-mix(in srgb, var(--color-accent-brass) 80%, transparent)) drop-shadow(0 0 24px color-mix(in srgb, var(--color-accent-cobalt) 45%, transparent))',
            ...(isTourTransitioning && { opacity: 0 }),
          },
          buttonNext: { backgroundColor: 'var(--color-accent-cobalt)', color: 'var(--color-text-primary)', borderRadius: '4px', fontWeight: 'bold' },
          buttonBack: { color: 'var(--color-text-secondary)', fontWeight: 'bold' },
          buttonSkip: { color: 'var(--color-error)', fontWeight: 'bold' },
        }) as any}
        onEvent={(data: any) => {
          if (data.status === 'finished' || data.status === 'skipped' || data.action === 'close') {
            setActiveTourMode(null);
            setGuidedTourIndex(0);
            return;
          }

          if (data.type !== 'step:after' && data.type !== 'error:target_not_found') {
            return;
          }

          const delta = data.action === 'prev' ? -1 : 1;
          const nextIndex = data.index + delta;

          if (data.index === 6 && data.action === 'next') {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }

          if (nextIndex < 0 || nextIndex >= currentTourSteps.length) {
            setActiveTourMode(null);
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
            <HypothesisTestingCalculator onStartLocalTour={() => handleStartTour('hypothesis')} />
          </Suspense>
        </PageLayout>
      ) : null}

      {activePage === 'point-estimation' ? (
        <PageLayout
          header={<SiteHeader activePage="point-estimation" onNavigate={handleNavigate} />}
          footer={<SiteFooter onNavigate={handleNavigate} />}
        >
          <Suspense fallback={<PageLoadingState />}>
            <PointEstimationPage />
          </Suspense>
        </PageLayout>
      ) : null}

      {activePage === 'summary' ? (
        <PageLayout
          header={<SiteHeader activePage="summary" onNavigate={handleNavigate} />}
          footer={<SiteFooter onNavigate={handleNavigate} />}
        >
          <Suspense fallback={<PageLoadingState />}>
            <SummaryPage />
          </Suspense>
        </PageLayout>
      ) : null}

      {activePage === 'exam-2023' ? (
        <PageLayout
          header={<SiteHeader activePage="exam-2023" onNavigate={handleNavigate} />}
          footer={<SiteFooter onNavigate={handleNavigate} />}
        >
          <Suspense fallback={<PageLoadingState />}>
            <Exam2023Page />
          </Suspense>
        </PageLayout>
      ) : null}

      {activePage === 'test-yourself' ? (
        <PageLayout
          header={<SiteHeader activePage="test-yourself" onNavigate={handleNavigate} />}
          footer={<SiteFooter onNavigate={handleNavigate} />}
        >
          <Suspense fallback={<PageLoadingState />}>
            <TestYourselfPage />
          </Suspense>
        </PageLayout>
      ) : null}

      {activePage === 'regression' ? (
        <PageLayout
          header={<SiteHeader activePage="regression" onNavigate={handleNavigate} />}
          footer={<SiteFooter onNavigate={handleNavigate} />}
        >
          <Suspense fallback={<PageLoadingState />}>
            <LinearRegressionCalculator />
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
          onTryPointEstimation={() => handleNavigate('point-estimation')}
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
