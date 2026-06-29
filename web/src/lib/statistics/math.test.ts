import { describe, expect, it } from 'vitest';
import {
  inverseNormalCDF,
  normalCDF,
  normalPDF,
  studentTCDF,
  studentTInverseCDF,
  studentTPPF,
} from './math';

describe('statistics math helpers', () => {
  it('computes standard normal CDF/PDF anchor values', () => {
    expect(normalCDF(0, 0, 1)).toBeCloseTo(0.5, 6);
    expect(normalPDF(0, 0, 1)).toBeCloseTo(0.3989, 4);
  });

  it('keeps inverse normal boundary behavior stable', () => {
    expect(inverseNormalCDF(0)).toBe(-5);
    expect(inverseNormalCDF(1)).toBe(5);
    expect(inverseNormalCDF(0.975)).toBeCloseTo(1.96, 2);
  });

  it('computes student t distribution anchors', () => {
    expect(studentTCDF(0, 10)).toBeCloseTo(0.5, 6);
    expect(studentTCDF(0, 0)).toBeCloseTo(0.5, 6);
    expect(studentTPPF(0.975, 10)).toBeCloseTo(2.228, 2);
    expect(studentTInverseCDF(0.975, 10)).toBeCloseTo(2.228, 2);
  });
});
