import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { renderChartMathReferenceLabel } from './ChartPrimitives';

export type HypothesisAxisTickRole = 'standard' | 'critical' | 'sample';

export interface HypothesisAxisTick {
  value: number;
  role: HypothesisAxisTickRole;
}

export interface HypothesisChartProps {
  chartData: any[];
  stats: {
    effectH0Mean: number;
    effectH1Mean: number;
    c1: number;
    c2: number;
    se: number;
  };
  isValid: boolean;
  chartLimits: { xMin: number; xMax: number };
  tailType: 'left' | 'right' | 'two-tailed';
  calculatePower: boolean;
  xAxisTicks: HypothesisAxisTick[];
  sampleMean: number | null;
}

export const HypothesisChart: React.FC<HypothesisChartProps> = ({
  chartData,
  stats,
  isValid,
  chartLimits,
  tailType,
  calculatePower,
  xAxisTicks,
  sampleMean,
}) => {
  if (!isValid || !stats || !chartLimits) {
    return (
      <div className="py-24 text-center text-[var(--color-accent-crimson)] font-medium text-lg md:text-xl">
        נא לתקן את שגיאות הקלטים בצד ימין על מנת להציג את הגרף.
      </div>
    );
  }

  const { c1, c2 } = stats;
  const { xMin, xMax } = chartLimits;
  const xAxisTickValues = xAxisTicks.map((tick) => tick.value);
  const zScoreAxisTicks = Array.from({ length: 9 }, (_, index) => {
    const zScore = index - 4;
    return {
      value: stats.effectH0Mean + zScore * stats.se,
      label: zScore === 0 ? '0' : `${zScore > 0 ? '+' : ''}${zScore}\u03c3`,
    };
  });
  const zScoreAxisTickValues = zScoreAxisTicks.map((tick) => tick.value);

  const pct = (x: number) => {
    const p = ((x - xMin) / (xMax - xMin)) * 100;
    return Math.max(0, Math.min(100, p));
  };

  const getRejectionGradient = () => {
    if (tailType === 'right') {
      const c2Pct = pct(c2);
      return (
        <linearGradient id="rejectionGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-accent-crimson)" stopOpacity={0} />
          <stop offset={c2Pct + "%"} stopColor="var(--color-accent-crimson)" stopOpacity={0} />
          <stop offset={(c2Pct + 0.001) + "%"} stopColor="var(--color-accent-crimson)" stopOpacity={0.95} />
          <stop offset="100%" stopColor="var(--color-accent-crimson)" stopOpacity={0.95} />
        </linearGradient>
      );
    } else if (tailType === 'left') {
      const c2Pct = pct(c2);
      return (
        <linearGradient id="rejectionGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-accent-crimson)" stopOpacity={0.95} />
          <stop offset={c2Pct + "%"} stopColor="var(--color-accent-crimson)" stopOpacity={0.95} />
          <stop offset={(c2Pct + 0.001) + "%"} stopColor="var(--color-accent-crimson)" stopOpacity={0} />
          <stop offset="100%" stopColor="var(--color-accent-crimson)" stopOpacity={0} />
        </linearGradient>
      );
    } else { // two-tailed
      const c1Pct = pct(c1);
      const c2Pct = pct(c2);
      return (
        <linearGradient id="rejectionGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-accent-crimson)" stopOpacity={0.95} />
          <stop offset={c1Pct + "%"} stopColor="var(--color-accent-crimson)" stopOpacity={0.95} />
          <stop offset={(c1Pct + 0.001) + "%"} stopColor="var(--color-accent-crimson)" stopOpacity={0} />
          <stop offset={c2Pct + "%"} stopColor="var(--color-accent-crimson)" stopOpacity={0} />
          <stop offset={(c2Pct + 0.001) + "%"} stopColor="var(--color-accent-crimson)" stopOpacity={0.95} />
          <stop offset="100%" stopColor="var(--color-accent-crimson)" stopOpacity={0.95} />
        </linearGradient>
      );
    }
  };

  return (
    <div className="h-full min-h-[305px] w-full flex-1" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 54 }}>
          <defs>
            <linearGradient id="h0Color" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={'var(--chart-1)'} stopOpacity={0.1} />
              <stop offset="95%" stopColor={'var(--chart-1)'} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="h1Color" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.1} />
              <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
            </linearGradient>
            {getRejectionGradient()}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={'var(--color-border)'} />

          <XAxis
            dataKey="x"
            type="number"
            domain={[chartLimits.xMin, chartLimits.xMax]}
            ticks={xAxisTickValues}
            interval={0}
            tick={(props: any) => {
              const { x, y, payload } = props;
              const val = payload.value;
              const tickRole = xAxisTicks.find((tick) => Math.abs(tick.value - val) < 1e-5)?.role ?? 'standard';
              let fill = 'var(--color-text-secondary)';

              if (tickRole === 'critical') {
                fill = 'var(--color-accent-crimson)';
              } else if (tickRole === 'sample') {
                fill = 'var(--color-success)';
              } else if (Math.abs(val - stats.effectH0Mean) < 1e-4) {
                fill = 'var(--chart-1)';
              } else if (calculatePower && Math.abs(val - stats.effectH1Mean) < 1e-4) {
                fill = 'var(--chart-2)';
              }

              return (
                <g transform={`translate(${x},${y})`}>
                  <text
                    x={0}
                    y={0}
                    dy={16}
                    textAnchor="end"
                    transform="rotate(-35)"
                    fill={fill}
                    fontSize={12}
                    className="font-semibold font-sans"
                  >
                    {val.toFixed(3)}
                  </text>
                </g>
              );
            }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickLine={true}
            tickFormatter={(val) => val.toFixed(3)}
          />
          <XAxis
            xAxisId="zScore"
            dataKey="x"
            type="number"
            domain={[chartLimits.xMin, chartLimits.xMax]}
            ticks={zScoreAxisTickValues}
            interval={0}
            height={28}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickLine={{ stroke: 'var(--color-border)' }}
            tick={(props: any) => {
              const { x, y, payload } = props;
              const tick = zScoreAxisTicks.find((candidate) => Math.abs(candidate.value - payload.value) < 1e-5);

              return (
                <g transform={`translate(${x},${y})`}>
                  <text
                    x={0}
                    y={0}
                    dy={18}
                    textAnchor="middle"
                    fill="var(--color-text-secondary)"
                    fontSize={12}
                    className="font-semibold font-sans"
                  >
                    {tick?.label ?? ''}
                  </text>
                </g>
              );
            }}
          />
          <YAxis
            tickFormatter={(val) => val.toFixed(2)}
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickLine={true}
            width={45}
            className="font-mono font-medium"
          />

          {/* H0 Curve Base Area */}
          <Area
            type="monotone"
            dataKey="pdfH0"
            stroke={'var(--chart-1)'}
            strokeWidth={2}
            fill="url(#h0Color)"
            dot={false}
            isAnimationActive={true}
          />

          {/* H1 Curve Base Area */}
          {calculatePower && (
            <Area
              type="monotone"
              dataKey="pdfH1"
              stroke="var(--chart-2)"
              strokeWidth={2}
              fill="url(#h1Color)"
              dot={false}
              isAnimationActive={true}
            />
          )}

          {/* Shaded Emerald Layer for Power Area */}
          {calculatePower && (
            <Area
              type="monotone"
              dataKey="powerShade"
              stroke="none"
              fill={'var(--chart-2)'}
              fillOpacity={0.35}
              dot={false}
              isAnimationActive={false}
            />
          )}

          {/* Shaded Red Layer for Alpha Area (Type I) */}
          <Area
            type="monotone"
            dataKey="alphaShade"
            stroke="none"
            fill="url(#rejectionGradient)"
            dot={false}
            isAnimationActive={false}
          />

          {/* Vertical Reference Line at Mean of H0 */}
          <ReferenceLine
            x={stats.effectH0Mean}
            stroke="var(--chart-1)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            label={(props) =>
              renderChartMathReferenceLabel(props, {
                math: '\\mu_0',
                color: 'var(--chart-1)',
                width: 40,
                height: 30,
                xOffset: -20,
                yOffset: -25,
                className: 'text-sm font-semibold',
              })
            }
          />

          {/* Vertical Reference Line at Mean of H1 */}
          <ReferenceLine
            x={stats.effectH1Mean}
            stroke="var(--chart-2)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            label={calculatePower ? (props) =>
              renderChartMathReferenceLabel(props, {
                math: '\\mu_1',
                color: 'var(--chart-2)',
                width: 40,
                height: 30,
                xOffset: -20,
                yOffset: -25,
                className: 'text-sm font-semibold',
              }) : undefined}
          />

          {/* Vertical LINE for SELECTOR: Critical Values */}
          {tailType === 'two-tailed' ? (
            <>
              <ReferenceLine
                x={stats.c1}
                stroke="var(--color-accent-crimson)"
                strokeWidth={2}
                label={(props) =>
                  renderChartMathReferenceLabel(props, {
                    math: `C_1`,
                    color: 'var(--color-accent-crimson)',
                    width: 40,
                    height: 30,
                    xOffset: -20,
                    yOffset: -25,
                    className: 'text-xs font-semibold',
                  })
                }
              />
              <ReferenceLine
                x={stats.c2}
                stroke="var(--color-accent-crimson)"
                strokeWidth={2}
                label={(props) =>
                  renderChartMathReferenceLabel(props, {
                    math: `C_2`,
                    color: 'var(--color-accent-crimson)',
                    width: 40,
                    height: 30,
                    xOffset: -20,
                    yOffset: -25,
                    className: 'text-xs font-semibold',
                  })
                }
              />
            </>
          ) : (
            <ReferenceLine
              x={stats.c2}
              stroke="var(--color-accent-crimson)"
              strokeWidth={2}
              label={(props) =>
                renderChartMathReferenceLabel(props, {
                  math: `C`,
                  color: 'var(--color-accent-crimson)',
                  width: 40,
                  height: 30,
                  xOffset: -20,
                  yOffset: -25,
                  className: 'text-sm font-semibold',
                })
              }
            />
          )}

          {sampleMean !== null && (
            <ReferenceLine
              x={sampleMean}
              stroke="var(--color-success)"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              label={(props) =>
                renderChartMathReferenceLabel(props, {
                  math: '\\bar{X}',
                  color: 'var(--color-success)',
                  width: 48,
                  height: 30,
                  xOffset: -24,
                  yOffset: -25,
                  className: 'text-sm font-semibold',
                })
              }
            />
          )}

        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
