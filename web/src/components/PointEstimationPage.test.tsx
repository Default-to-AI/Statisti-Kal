import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import PointEstimationPage from './PointEstimationPage';

describe('PointEstimationPage', () => {
  it('renders core sections and MLE content in static markup', () => {
    const html = renderToStaticMarkup(<PointEstimationPage />);

    expect(html).toContain('אמידה נקודתית');
    expect(html).toContain('מושגי יסוד באמידה');
    expect(html).toContain('אומד נראות מקסימלית');
    expect(html).toContain('רעיון אינטואיטיבי');
  });
});
