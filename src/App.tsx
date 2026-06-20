/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Fragment, useState } from 'react';
import HypothesisTestingCalculator from './components/HypothesisTestingCalculator';
import LandingPage from './components/LandingPage';
import SiteFooter from './components/SiteFooter';
import SiteHeader, { type SitePage } from './components/SiteHeader';
import { PageLayout } from './components/ui/PageLayout';
import NormalDistributionCalculator, { type CalcMode } from './NormalDistributionCalculator';

type ActivePage = 'landing' | 'hypothesis' | 'normal';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [normalMode, setNormalMode] = useState<CalcMode>('hypothesis');

  const handleNavigate = (page: SitePage) => {
    if (page === 'landing' || page === 'hypothesis') {
      setActivePage(page);
      return;
    }

    window.localStorage.setItem('ND_mode', JSON.stringify(page));
    setNormalMode(page);
    setActivePage('normal');
  };

  if (activePage === 'hypothesis') {
    return (
      <PageLayout
        header={<SiteHeader activePage="hypothesis" onNavigate={handleNavigate} />}
        footer={<SiteFooter onNavigate={handleNavigate} />}
      >
        <HypothesisTestingCalculator />
      </PageLayout>
    );
  }

  if (activePage === 'normal') {
    return (
      <Fragment key={normalMode}>
        <NormalDistributionCalculator
          initialMode={normalMode}
          onNavigate={handleNavigate}
        />
      </Fragment>
    );
  }

  return (
    <LandingPage
      onNavigate={handleNavigate}
      onTryHypothesis={() => setActivePage('hypothesis')}
    />
  );
}
