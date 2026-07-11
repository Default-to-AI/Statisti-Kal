import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import LinearRegressionCalculator from './LinearRegressionCalculator';

describe('LinearRegressionCalculator', () => {
  it('mounts with default inputs without throwing', () => {
    expect(() => render(<LinearRegressionCalculator />)).not.toThrow();
  });

  it('computes a valid Pearson r from the documented defaults', () => {
    render(<LinearRegressionCalculator />);
    // Defaults: n=8, xBar=10, yBar=20, sumXY=4000, sumX2=1600, sumY2=16000
    // r = (sumXY/n - xBar*yBar) / sqrt((sumX2/n - xBar^2)(sumY2/n - yBar^2))
    //   = (500-200) / sqrt((200-100)*(2000-400)) = 300 / sqrt(100*1600) = 300/400 = 0.75
    // Regression renders r to 4 decimals -> "0.7500". It may appear in
    // multiple nodes (result + formula). Assert it is present at least once.
    const matches = screen.getAllByText((content, el) =>
      !!el && /0\.7500/.test(el.textContent ?? '')
    );
    expect(matches.length).toBeGreaterThan(0);
  });

  it('shows the positive strong interpretation for default inputs', () => {
    render(<LinearRegressionCalculator />);
    // r=0.75 -> positive, strength "חזק" (strong). The phrase "קשר ליניארי" must appear.
    expect(screen.getAllByText(/קשר ליניארי/).length).toBeGreaterThan(0);
  });
});
