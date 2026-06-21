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

    expect(html).toContain('דוגמה מהמציאות: בדיקת השערות על טמפרטורת גוף (צלזיוס)');
    expect(html).toContain('רקע והשערות מבחן');
    expect(html).toContain('נתונים יבשים');
    expect(html).toContain('מסקנה');
    expect(html).toContain('קישור למקור');
    expect(html).toContain('\\text{Reject } H_0');
    expect(html).toContain('n = 148');
    expect(html).toContain('H_1: \\mu &lt; 37');
    expect(html).toContain('\\bar{X} = 36.82^\\circ C');
    expect(html).toContain('תוחלת של השערת האפס');
    expect(html).toContain('ממוצע מדגם');
    expect(html).toContain('סטיית תקן');
    expect(html).toContain('גודל מדגם');
    expect(html).toContain('Philip A. Mackowiak');
    expect(html).toContain('JAMA, 1992');
    expect(html).toContain('10.1001/jama.1992.03490120092034');
    expect(html).toContain('טען נתוני ברירת מחדל');
    expect(html).toContain('הפעל סיור מודרך');
    expect(html).toContain('רמת מובהקות');
    expect(html).toContain('5%');
    expect(html).toContain('התוצאה מובהקת מאוד');
    expect(html).toContain('מבחן שמאלי');
    expect(html).not.toContain('נתוני מדגם ה-IQ מ-2025');
  });

  it('renders a mode-aware sample statistic label for single, mean, and sum modes', () => {
    expect(renderCalculator({ HT_testType: 'single' })).toContain('ערך בודד');
    expect(renderCalculator({ HT_testType: 'mean' })).toContain('ממוצע מדגם');
    expect(renderCalculator({ HT_testType: 'sum' })).toContain('סכום מדגם');
  });

  it('renders the parameter table in the requested order with editable sigma and math placeholders', () => {
    const html = renderCalculator({
      HT_varianceKnown: false,
      HT_mu0Input: '',
      HT_mu1Input: '',
      HT_muH1Input: '',
      HT_sigmaInput: '',
      HT_nInput: '',
    });
    const tableStart = html.indexOf('<table');
    const tableEnd = html.indexOf('</table>', tableStart);
    const tableHtml = html.slice(tableStart, tableEnd);

    expect(tableHtml.indexOf('ממוצע מדגם')).toBeLessThan(tableHtml.indexOf('גודל מדגם'));
    expect(tableHtml.indexOf('ממוצע (')).toBeLessThan(tableHtml.indexOf('חישוב עוצמה'));
    expect(tableHtml).toContain('data-testid="parameter-sigma-input"');
    expect(tableHtml).not.toContain('לא נקבע');
    expect(tableHtml).toContain('data-cell-watermark="\\mu_0"');
    expect(tableHtml).toContain('data-cell-watermark="\\sigma"');
    expect(tableHtml).toContain('data-cell-watermark="\\bar{X}"');
    expect(tableHtml).toContain('data-cell-watermark="n"');
    expect(tableHtml).toContain('data-cell-watermark="\\mu_1"');
    expect(tableHtml).toContain('data-cell-watermark="1-\\beta"');
    expect(tableHtml.indexOf('data-cell-watermark="\\mu_0"')).toBeLessThan(tableHtml.indexOf('data-cell-watermark="\\bar{X}"'));
    expect(tableHtml.indexOf('data-cell-watermark="\\bar{X}"')).toBeLessThan(tableHtml.indexOf('data-cell-watermark="\\mu_1"'));
    expect(tableHtml.indexOf('data-cell-watermark="\\mu_1"')).toBeLessThan(tableHtml.indexOf('data-cell-watermark="\\sigma"'));
    expect(tableHtml.indexOf('data-cell-watermark="\\sigma"')).toBeLessThan(tableHtml.indexOf('data-cell-watermark="n"'));
    expect(tableHtml.indexOf('data-cell-watermark="n"')).toBeLessThan(tableHtml.indexOf('data-cell-watermark="1-\\beta"'));
    expect(tableHtml).toContain('annotation encoding="application/x-tex">\\sigma</annotation>');
    expect(tableHtml).toContain('annotation encoding="application/x-tex">\\mu_0</annotation>');
    expect(tableHtml).toContain('annotation encoding="application/x-tex">\\mu_1</annotation>');
    expect(tableHtml).toContain('annotation encoding="application/x-tex">\\bar{X}</annotation>');
    expect(tableHtml).toContain('annotation encoding="application/x-tex">n</annotation>');
  });
});
