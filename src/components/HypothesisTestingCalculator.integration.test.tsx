import React from 'react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import HypothesisTestingCalculator from './HypothesisTestingCalculator';

vi.mock('recharts', async () => {
  const React = await import('react');
  const Passthrough = ({ children }: { children?: React.ReactNode }) => React.createElement('div', null, children);
  const Leaf = () => null;

  return {
    ResponsiveContainer: Passthrough,
    AreaChart: Passthrough,
    Area: Leaf,
    XAxis: Leaf,
    YAxis: Leaf,
    Tooltip: Leaf,
    ReferenceLine: Leaf,
    CartesianGrid: Leaf,
    Legend: Leaf,
  };
});

type StorageValues = Record<string, unknown>;

function installLocalStorage(values: StorageValues) {
  const store = new Map<string, string>();
  for (const [key, value] of Object.entries(values)) {
    store.set(key, JSON.stringify(value));
  }

  Object.defineProperty(globalThis, 'window', {
    value: {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
        removeItem: (key: string) => store.delete(key),
        clear: () => store.clear(),
      },
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      requestAnimationFrame: (callback: FrameRequestCallback) => setTimeout(callback, 0),
      cancelAnimationFrame: (id: number) => clearTimeout(id),
    },
    configurable: true,
  });
}

function renderCalculator(values: StorageValues) {
  installLocalStorage({
    HT_varianceKnown: true,
    HT_calculatePower: true,
    HT_mu0: 100,
    HT_mu0Input: '100',
    HT_mu1: 108,
    HT_mu1Input: '108',
    HT_muH1: 108,
    HT_muH1Input: '108',
    HT_sigma: 15,
    HT_sigmaInput: '15',
    HT_n: 36,
    HT_nInput: '36',
    HT_alpha: 0.05,
    HT_alphaInput: '0.05',
    HT_testType: 'mean',
    HT_tailType: 'right',
    ...values,
  });

  return renderToStaticMarkup(<HypothesisTestingCalculator />);
}

describe('HypothesisTestingCalculator unified Step 6 integration', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    Reflect.deleteProperty(globalThis, 'window');
    consoleError = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      const message = args.map(String).join(' ');
      if (message.includes('linearGradient') && message.includes('incorrect casing')) return;
      throw new Error(`Unexpected console.error during render: ${message}`);
    });
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('renders the Mackowiak body-temperature study as the default example card', () => {
    const html = renderCalculator({
      HT_mu0: 37,
      HT_mu0Input: '37',
      HT_mu1: 36.82,
      HT_mu1Input: '36.82',
      HT_muH1: 36.82,
      HT_muH1Input: '36.82',
      HT_sigma: 0.41,
      HT_sigmaInput: '0.41',
      HT_n: 148,
      HT_nInput: '148',
      HT_tailType: 'left',
    });

    expect(html).toContain('מחקר חום גוף תקין');
    expect(html).toContain('Philip A. Mackowiak');
    expect(html).toContain('JAMA, 1992');
    expect(html).toContain('10.1001/jama.1992.03490120092034');
    expect(html).toContain('טען נתוני ברירת מחדל');
    expect(html).toContain('מבחן שמאלי');
    expect(html).not.toContain('נתוני מדגם ה-IQ מ-2025');
  });

  it('renders a mode-aware sample statistic label for single, mean, and sum modes', () => {
    expect(renderCalculator({ HT_testType: 'single' })).toContain('ערך בודד');
    expect(renderCalculator({ HT_testType: 'mean' })).toContain('ממוצע מדגם');
    expect(renderCalculator({ HT_testType: 'sum' })).toContain('סכום מדגם');
  });
});
