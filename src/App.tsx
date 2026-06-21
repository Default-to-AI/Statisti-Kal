/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useState } from 'react';
import LandingPage from './components/LandingPage';
import SiteFooter from './components/SiteFooter';
import SiteHeader, { type SitePage } from './components/SiteHeader';
import { PageLayout } from './components/ui/PageLayout';
import type { CalcMode } from './NormalDistributionCalculator';

type ActivePage = 'landing' | 'hypothesis' | 'normal';

const HypothesisTestingCalculator = lazy(() => import('./components/HypothesisTestingCalculator'));
const NormalDistributionCalculator = lazy(() => import('./NormalDistributionCalculator'));

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [normalMode, setNormalMode] = useState<CalcMode>('hypothesis');

  const handleNavigate = (page: SitePage) => {
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
  };

  if (activePage === 'hypothesis') {
    return (
      <PageLayout
        header={<SiteHeader activePage="hypothesis" onNavigate={handleNavigate} />}
        footer={<SiteFooter onNavigate={handleNavigate} />}
      >
        <Suspense fallback={<PageLoadingState />}>
          <HypothesisTestingCalculator />
        </Suspense>
      </PageLayout>
    );
  }

  if (activePage === 'normal') {
    return (
      <Suspense fallback={<PageLoadingState />}>
        <NormalDistributionCalculator
          key={normalMode}
          initialMode={normalMode}
          onNavigate={handleNavigate}
        />
      </Suspense>
    );
  }

  return (
    <LandingPage
      onNavigate={handleNavigate}
      onTryHypothesis={() => setActivePage('hypothesis')}
    />
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
