import { inverseNormalCDF, normalCDF, normalPDF } from './math';

export type PowerTail = 'left' | 'right';

export interface PowerAnalysisInput {
  mu0: number;
  mu1: number;
  sigma: number;
  n: number;
  alpha: number;
}

export interface PowerAnalysisResult {
  tail: PowerTail;
  se: number;
  criticalZ: number;
  criticalValue: number;
  zUnderH1: number;
  beta: number;
  power: number;
  effectH0Mean: number;
  effectH1Mean: number;
  c1: number;
  c2: number;
}

export interface PowerChartDataPoint {
  x: number;
  pdfH0: number;
  pdfH1: number;
  alphaShade: number;
  powerShade: number;
}

export interface PowerChartDomain {
  xMin: number;
  xMax: number;
}

export function computePowerAnalysis({
  mu0,
  mu1,
  sigma,
  n,
  alpha,
}: PowerAnalysisInput): PowerAnalysisResult {
  const safeN = Math.max(1, n);
  const se = sigma / Math.sqrt(safeN);
  const tail: PowerTail = mu1 < mu0 ? 'left' : 'right';
  const criticalZ = inverseNormalCDF(1 - alpha);
  const criticalValue =
    tail === 'left' ? mu0 - criticalZ * se : mu0 + criticalZ * se;
  const zUnderH1 = (criticalValue - mu1) / se;

  const rawBeta =
    tail === 'left'
      ? 1 - normalCDF(criticalValue, mu1, se)
      : normalCDF(criticalValue, mu1, se);
  const beta = Math.max(0, Math.min(1, rawBeta));
  const power = Math.max(0, Math.min(1, 1 - beta));

  return {
    tail,
    se,
    criticalZ,
    criticalValue,
    zUnderH1,
    beta,
    power,
    effectH0Mean: mu0,
    effectH1Mean: mu1,
    c1: criticalValue,
    c2: criticalValue,
  };
}

export function getPowerChartDomain(result: PowerAnalysisResult): PowerChartDomain {
  const left = Math.min(result.effectH0Mean, result.effectH1Mean, result.criticalValue);
  const right = Math.max(result.effectH0Mean, result.effectH1Mean, result.criticalValue);

  return {
    xMin: left - 4 * result.se,
    xMax: right + 4 * result.se,
  };
}

export function buildPowerChartData(
  result: PowerAnalysisResult,
  domain = getPowerChartDomain(result),
  pointCount = 240,
): PowerChartDataPoint[] {
  const points: PowerChartDataPoint[] = [];
  const steps = Math.max(2, pointCount);
  const step = (domain.xMax - domain.xMin) / (steps - 1);

  for (let index = 0; index < steps; index += 1) {
    const x = domain.xMin + index * step;
    const pdfH0 = normalPDF(x, result.effectH0Mean, result.se);
    const pdfH1 = normalPDF(x, result.effectH1Mean, result.se);
    const isRejected =
      result.tail === 'left' ? x <= result.criticalValue : x >= result.criticalValue;

    points.push({
      x: Number(x.toFixed(4)),
      pdfH0,
      pdfH1,
      alphaShade: isRejected ? pdfH0 : 0,
      powerShade: isRejected ? pdfH1 : 0,
    });
  }

  return points;
}
