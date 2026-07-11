import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import NormalDistributionCalculator from './NormalDistributionCalculator';

describe('NormalDistributionCalculator', () => {
  it('mounts with default inputs without throwing', () => {
    expect(() => render(<NormalDistributionCalculator />)).not.toThrow();
  });

  it('renders within the shared ChartWrapper shell', () => {
    const { container } = render(<NormalDistributionCalculator />);
    expect(container.querySelector('[class*="chart"], [class*="Chart"]')).toBeTruthy();
  });

  // DESIGN.md §3 raw-heading enforcement is owned by ESLint `react/forbid-elements`
  // (web/eslint.config.js) — the durable machine guard against raw <h2>/<h3> in
  // calculators. The three raw headings that previously existed here were migrated
  // to <Heading> (verified by the lint rule passing on this file).
});
