/**
 * math.ts
 * Pure probability/statistics helpers extracted from HypothesisTestingCalculator.
 * No React dependency. Single import surface for calculators and future pages.
 */

/** Error function approximation (A&S formula 7.1.26) */
export function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);

  const t = 1.0 / (1.0 + p * absX);
  const y =
    1.0 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX));

  return sign * y;
}

export function normalCDF(x: number, mean: number, stdDev: number): number {
  if (stdDev <= 0) return 0.5;
  const z = (x - mean) / stdDev;
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

export function normalPDF(x: number, mean: number, stdDev: number): number {
  if (stdDev <= 0) return 0;
  const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
}

export function inverseNormalCDF(p: number): number {
  if (p <= 0) return -5;
  if (p >= 1) return 5;

  const c = [2.515517, 0.802853, 0.010328];
  const d = [1.432788, 0.189269, 0.001308];

  const t = p < 0.5 ? Math.sqrt(-2.0 * Math.log(p)) : Math.sqrt(-2.0 * Math.log(1.0 - p));
  const z =
    t - ((c[2] * t + c[1]) * t + c[0]) / (((d[2] * t + d[1]) * t + d[0]) * t + 1.0);

  return p < 0.5 ? -z : z;
}

/** Lanczos approximation for ln(Gamma(x)) */
export function lnGamma(x: number): number {
  if (x < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * x)) - lnGamma(1 - x);
  }
  const cof = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.001208650973866179,
    -0.000005395239384953,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j <= 5; j++) {
    y += 1;
    ser += cof[j] / y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

export function studentTPDF(t: number, df: number): number {
  if (df > 250) {
    return normalPDF(t, 0, 1);
  }
  const logC =
    lnGamma((df + 1) / 2) - 0.5 * Math.log(df * Math.PI) - lnGamma(df / 2);
  const C = Math.exp(logC);
  return C * Math.pow(1 + (t * t) / df, -(df + 1) / 2);
}

export function studentTCDF(t: number, df: number): number {
  if (df <= 0) return 0.5;

  if (df >= 500) {
    return normalCDF(t, 0, 1);
  }

  const theta = Math.atan(t / Math.sqrt(df));
  const sin = Math.sin(theta);
  const cos = Math.cos(theta);

  if (df % 2 === 0) {
    // df is even
    let sum = 0;
    let term = 1;
    for (let r = 1; r <= df / 2 - 1; r++) {
      term = term * (2 * r - 1) / (2 * r) * cos * cos;
      sum += term;
    }
    return 0.5 + 0.5 * sin * (1 + sum);
  } else {
    // df is odd
    let sum = 0;
    let term = 1;
    for (let r = 1; r <= (df - 3) / 2; r++) {
      term = term * (2 * r) / (2 * r + 1) * cos * cos;
      sum += term;
    }
    const multiplier = df === 1 ? 0 : sin * cos * (1 + sum);
    return 0.5 + theta / Math.PI + multiplier / Math.PI;
  }
}

export function studentTPPFInitial(p: number, df: number): number {
  const z = inverseNormalCDF(p);
  if (df > 500) return z;

  const z2 = z * z;
  const z3 = z2 * z;
  const z5 = z3 * z2;
  const z7 = z5 * z2;

  const term1 = z;
  const term2 = (z3 + z) / (4 * df);
  const term3 = (5 * z5 + 16 * z3 + 3 * z) / (96 * df * df);
  const term4 =
    (3 * z7 + 19 * z5 + 17 * z3 - 15 * z) / (384 * df * df * df);

  return term1 + term2 + term3 + term4;
}

export function studentTPPF(p: number, df: number): number {
  if (p <= 0.00001) return -10.0;
  if (p >= 0.99999) return 10.0;

  // 1. Initial guess using Cornish-Fisher expansion
  let t = studentTPPFInitial(p, df);

  // 2. Newton-Raphson refinement (3 steps)
  for (let i = 0; i < 3; i++) {
    const error = studentTCDF(t, df) - p;
    const derivative = studentTPDF(t, df);
    if (derivative === 0) break;
    t = t - error / derivative;
  }
  return t;
}

export function studentTInverseCDF(p: number, df: number): number {
  if (p <= 0) return -999;
  if (p >= 1) return 999;
  if (p === 0.5) return 0;

  if (df === 1) {
    return Math.tan(Math.PI * (p - 0.5));
  }

  if (df >= 500) {
    return inverseNormalCDF(p);
  }

  const z = inverseNormalCDF(p);
  let low = z < 0 ? z * 10 - 2 : 0;
  let high = z < 0 ? 0 : z * 10 + 2;

  if (studentTCDF(high, df) < p) {
    high *= 5;
  }
  if (studentTCDF(low, df) > p) {
    low *= 5;
  }

  for (let iter = 0; iter < 100; iter++) {
    const mid = (low + high) / 2;
    const val = studentTCDF(mid, df);
    if (Math.abs(val - p) < 1e-12) {
      return mid;
    }
    if (val < p) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return (low + high) / 2;
}
