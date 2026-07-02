import { describe, expect, it } from 'vitest';
import {
  buildPowerChartData,
  computePowerAnalysis,
  getPowerChartDomain,
} from './power';

describe('power analysis helpers', () => {
  it('computes right-tailed power from five inputs only', () => {
    const result = computePowerAnalysis({
      mu0: 100,
      mu1: 108,
      sigma: 15,
      n: 36,
      alpha: 0.05,
    });

    expect(result.tail).toBe('right');
    expect(result.se).toBeCloseTo(2.5, 6);
    expect(result.criticalZ).toBeCloseTo(1.645, 2);
    expect(result.criticalValue).toBeCloseTo(104.11, 2);
    expect(result.beta).toBeCloseTo(0.0603, 3);
    expect(result.power).toBeCloseTo(0.9397, 3);
  });

  it('computes left-tailed power by flipping the rejection side from mu1 vs mu0', () => {
    const result = computePowerAnalysis({
      mu0: 37,
      mu1: 36.82,
      sigma: 0.41,
      n: 148,
      alpha: 0.05,
    });

    expect(result.tail).toBe('left');
    expect(result.criticalValue).toBeLessThan(result.effectH0Mean);
    expect(result.power).toBeGreaterThan(0.9);
    expect(result.beta).toBeLessThan(0.1);
  });

  it('builds chart data with alpha and power shading only in the rejection region', () => {
    const result = computePowerAnalysis({
      mu0: 100,
      mu1: 108,
      sigma: 15,
      n: 36,
      alpha: 0.05,
    });
    const domain = getPowerChartDomain(result);
    const points = buildPowerChartData(result, domain, 9);
    const leftOfCritical = points.filter((point) => point.x < result.criticalValue);
    const rightOfCritical = points.filter((point) => point.x > result.criticalValue);

    expect(domain.xMin).toBeLessThan(Math.min(result.effectH0Mean, result.effectH1Mean));
    expect(domain.xMax).toBeGreaterThan(Math.max(result.effectH0Mean, result.effectH1Mean));
    expect(leftOfCritical.every((point) => point.alphaShade === 0 && point.powerShade === 0)).toBe(true);
    expect(rightOfCritical.some((point) => point.alphaShade > 0)).toBe(true);
    expect(rightOfCritical.some((point) => point.powerShade > 0)).toBe(true);
  });
});
