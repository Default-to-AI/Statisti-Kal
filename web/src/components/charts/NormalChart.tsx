import { useMemo } from 'react';
import { InlineMath } from 'react-katex';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { normalPDF } from '../../lib/statistics/math';
import type { CalcMode, CalcType, CondType } from '../calc-ui';

export const NormalChart: React.FC<{
  mean: number;
  stdDev: number;
  type: CalcType;
  x1: number;
  x2: number;
  condType?: CondType;
  condTypeA?: CondType;
  condX1?: number;
  condX2?: number;
  mode?: CalcMode;
}> = ({ mean, stdDev, type, x1, x2, condType, condTypeA, condX1, condX2, mode }) => {

  const chartData = useMemo(() => {
    if (stdDev <= 0) return [];

    const pts = [];
    const numPoints = 140;
    const xMin = mean - 4 * stdDev;
    const xMax = mean + 4 * stdDev;
    const step = (xMax - xMin) / (numPoints - 1);

    const getRangeRange = (t: string | undefined, v1: number | undefined, v2: number | undefined): [number, number] => {
      const val1 = v1 ?? 0;
      const val2 = v2 ?? 0;
      if (t === 'below') return [-Infinity, val1];
      if (t === 'above') return [val1, Infinity];
      if (t === 'between') return [Math.min(val1, val2), Math.max(val1, val2)];
      return [-Infinity, Infinity];
    };

    const isXInside = (val: number, range: [number, number]) => val >= range[0] && val <= range[1];

    const minStandardX = Math.min(x1, x2);
    const maxStandardX = Math.max(x1, x2);

    for (let i = 0; i < numPoints; i++) {
      const x = xMin + i * step;
      const y = normalPDF(x, mean, stdDev);

      let shadedY: number | null = null;
      let shadedYBelow: number | null = null;
      let shadedYAbove: number | null = null;
      let condBShadedY: number | null = null;
      let intersectShadedY: number | null = null;

      if (type === 'conditional') {
        const rA = getRangeRange(condTypeA || 'below', x1, x2);
        const rB = getRangeRange(condType, condX1, condX2);

        if (isXInside(x, rB)) {
          condBShadedY = y;
        }
        if (isXInside(x, rA) && isXInside(x, rB)) {
          intersectShadedY = y;
        }
      } else {
        switch (type) {
          case 'below':
            if (x <= x1) shadedY = y;
            break;
          case 'above':
            if (x >= x1) shadedY = y;
            break;
          case 'between':
            if (x >= minStandardX && x <= maxStandardX) shadedY = y;
            break;
          case 'outside':
            if (x <= minStandardX) shadedYBelow = y;
            if (x >= maxStandardX) shadedYAbove = y;
            break;
        }
      }

      pts.push({
        x: Number(x.toFixed(4)),
        pdf: y,
        shadedY,
        shadedYBelow,
        shadedYAbove,
        condBShadedY,
        intersectShadedY,
      });
    }
    return pts;
  }, [mean, stdDev, type, x1, x2, condType, condTypeA, condX1, condX2]);

  if (stdDev <= 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-[var(--color-surface)] text-[var(--color-error)] font-bold border border-[var(--color-accent-crimson)]/30">
        נא להזין סטיית תקן גדולה מ-0 להצגת גרף.
      </div>
    );
  }

  const curveColor = 'var(--color-accent-brass)';
  const secondaryCurveColor = 'var(--color-accent-teal)';
  const zLineColor = 'var(--color-accent-cobalt)';
  const mainGridColor = 'var(--chart-grid)';
  const axisLabelColor = 'var(--chart-axis-label)';
  const shadedColor = 'var(--color-accent-cobalt)';
  const bShadedColor = 'var(--color-accent-teal)';
  const intersectShadedColor = 'var(--color-accent-cobalt)';

  const minStandardX = Math.min(x1, x2);
  const maxStandardX = Math.max(x1, x2);

  const xDomain = [mean - 4.2 * stdDev, mean + 4.2 * stdDev] as const;
  const xMarkers = useMemo(() => {
    const markers: Array<{ value: number; math: string; color: string }> = [
      { value: mean, math: '\\mu', color: 'var(--color-accent-brass)' },
    ];

    if (type === 'conditional' && mode === 'forward') {
      markers.push({ value: x1, math: 'a_1', color: 'var(--color-accent-cobalt)' });
      if (condTypeA === 'between') {
        markers.push({ value: x2, math: 'a_2', color: 'var(--color-accent-cobalt)' });
      }
      if (typeof condX1 === 'number') {
        markers.push({ value: condX1, math: 'b_1', color: 'var(--color-accent-teal)' });
      }
      if (condType === 'between' && typeof condX2 === 'number') {
        markers.push({ value: condX2, math: 'b_2', color: 'var(--color-accent-teal)' });
      }
    } else if (mode === 'inverse') {
      markers.push({ value: x1, math: type === 'between' || type === 'outside' ? 'X_1' : 'X', color: 'var(--color-accent-cobalt)' });
      if (type === 'between' || type === 'outside') {
        markers.push({ value: x2, math: 'X_2', color: 'var(--color-accent-teal)' });
      }
    } else if (type === 'between' || type === 'outside') {
      markers.push({ value: x1, math: 'X_1', color: 'var(--color-accent-cobalt)' });
      markers.push({ value: x2, math: 'X_2', color: 'var(--color-accent-teal)' });
    } else {
      markers.push({ value: x1, math: 'X', color: 'var(--color-accent-cobalt)' });
    }

    return markers;
  }, [mean, mode, type, x1, x2, condType, condTypeA, condX1, condX2]);

  const xAxisTicks = useMemo(() => {
    const zTicks = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map(z => mean + z * stdDev);
    const markerTicks = xMarkers.map(m => Number(m.value.toFixed(2)));

    const minSpacing = stdDev * 0.45; // prevent overlap

    // Filter zTicks to ensure they don't overlap with markers
    const filteredZTicks = zTicks.filter(zt => {
      const roundedZ = Number(zt.toFixed(2));
      if (markerTicks.includes(roundedZ)) return true;
      const isTooClose = markerTicks.some(mt => Math.abs(mt - roundedZ) < minSpacing);
      return !isTooClose;
    });

    const combined = Array.from(new Set([...filteredZTicks.map(t => Number(t.toFixed(2))), ...markerTicks])).sort((a, b) => a - b);

    return combined;
  }, [mean, stdDev, xMarkers]);

  const legendChips = useMemo(() => {
    const chips: Array<{ math: string; color: string; style: 'line' | 'area' }> = [
      { math: '\\mu', color: curveColor, style: 'line' },
    ];

    if (type === 'conditional' && mode === 'forward') {
      chips.push({ math: 'A / a_1, a_2', color: zLineColor, style: 'line' });
      chips.push({ math: 'B / b_1, b_2', color: secondaryCurveColor, style: 'area' });
    } else {
      chips.push({ math: type === 'between' || type === 'outside' ? 'X_1' : 'X', color: zLineColor, style: 'line' });
      if (mode === 'inverse' && (type === 'between' || type === 'outside')) {
        chips.push({ math: 'X_2', color: secondaryCurveColor, style: 'line' });
      } else if (type === 'between' || type === 'outside') {
        chips.push({ math: 'X_2', color: secondaryCurveColor, style: 'line' });
      }
    }

    return chips;
  }, [curveColor, mode, secondaryCurveColor, type, zLineColor]);

  // Customized tooltip
  const CustomTooltipInner = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPt = payload[0].payload;
      const zVal = (dataPt.x - mean) / stdDev;
      return (
        <div className="p-3 border rounded-sm shadow-sm text-xs font-sans text-right space-y-1 backdrop-blur-md bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)]">
          <p className="font-bold text-sm text-[var(--color-accent-brass)]">נקודה על העקומה</p>
          <p className="flex justify-between gap-4"><span>ערך <InlineMath math="X" />:</span> <span className="font-mono font-bold">{dataPt.x.toFixed(2)}</span></p>
          <p className="flex justify-between gap-4"><span>ציון תקן <InlineMath math="Z" />:</span> <span className="font-mono font-bold">{zVal.toFixed(2)}</span></p>
          <p className="flex justify-between gap-4"><span>צפיפות PDF:</span> <span className="font-mono font-bold">{dataPt.pdf.toFixed(4)}</span></p>
        </div>
      );
    }
    return null;
  };

  const renderXAxisTick = (props: { x?: number | string; y?: number | string; payload?: { value?: number | string } }) => {
    const x = typeof props.x === 'number' ? props.x : Number(props.x ?? 0);
    const y = typeof props.y === 'number' ? props.y : Number(props.y ?? 0);
    const tickValue = typeof props.payload?.value === 'number' ? props.payload.value : Number(props.payload?.value ?? 0);
    const marker = xMarkers.find((item) => Math.abs(Number(item.value.toFixed(2)) - Number(tickValue.toFixed(2))) < 0.01);

    const zVal = (tickValue - mean) / stdDev;
    let zText = zVal.toFixed(2);
    if (zText.endsWith('.00')) zText = zVal.toFixed(0);
    if (zText === '-0.00' || zText === '-0') zText = '0';

    if (!marker) {
      return (
        <g transform={`translate(${x},${y})`}>
          <text x={0} y={12} textAnchor="middle" fill={axisLabelColor} fontSize={15} fontWeight="bold">
            {tickValue.toFixed(0)}
          </text>
          <text x={0} y={28} textAnchor="middle" fill={axisLabelColor} fontSize={13} fontWeight="bold" opacity={0.8}>
            Z = {zText}
          </text>
        </g>
      );
    }

    return (
      <g transform={`translate(${x},${y})`}>
        {/* Values below the axis */}
        <foreignObject x={-40} y={4} width={80} height={80} style={{ overflow: 'visible' }}>
          <div
            className="flex flex-col items-center justify-start leading-none"
            style={{ color: marker.color }}
          >
            <span className="text-[1.25rem] font-black">
              <InlineMath math={tickValue.toFixed(2)} />
            </span>
            <span className="mt-1 text-[0.85rem] font-bold opacity-80" style={{ color: axisLabelColor }}>
              Z = {zText}
            </span>
          </div>
        </foreignObject>
      </g>
    );
  };

  const renderReferenceLabel = (props: any, math: string, color: string) => {
    const { viewBox } = props;
    if (!viewBox) return null;
    return (
      <foreignObject x={viewBox.x - 40} y={viewBox.y - 20} width={80} height={40} style={{ overflow: 'visible' }}>
        <div className="flex justify-center items-start h-full leading-none" style={{ color }}>
          <span className="text-[1.25rem] font-black bg-[var(--color-surface)]/60 px-1 rounded shadow-sm backdrop-blur-md">
            <InlineMath math={math} />
          </span>
        </div>
      </foreignObject>
    );
  };

  return (
    <div className="h-[425px] w-full" dir="ltr">
      <div className="mb-3 flex flex-wrap items-center gap-4 border-b border-[var(--color-border)] pb-3">
        {legendChips.map((chip) => (
          <div key={chip.math} className="flex items-center gap-1.5 font-black text-sm select-none" style={{ color: chip.color }}>
            {chip.style === 'line' ? (
              <span className="inline-block h-3 w-0.5" style={{ backgroundColor: chip.color }} />
            ) : (
              <span className="inline-block h-3 w-3 border" style={{ backgroundColor: `${chip.color}33`, borderColor: chip.color }} />
            )}
            <span dir="ltr"><InlineMath math={chip.math} /></span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 24, right: 10, left: -25, bottom: 110 }}>
          <defs>
            <linearGradient id="mainColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={curveColor} stopOpacity={0.1} />
              <stop offset="95%" stopColor={curveColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={mainGridColor} />

          <XAxis
            dataKey="x"
            type="number"
            domain={xDomain}
            ticks={xAxisTicks}
            tick={renderXAxisTick}
            axisLine={{ stroke: mainGridColor }}
            tickLine={true}
          />
          <YAxis
            tickFormatter={(val) => val.toFixed(2)}
            tick={{ fill: axisLabelColor, fontSize: 12, fontWeight: 'bold' }}
            axisLine={{ stroke: mainGridColor }}
            tickLine={true}
            width={45}
          />
          <RechartsTooltip content={<CustomTooltipInner />} />

          {/* Always render standard curve path */}
          <Area
            type="monotone"
            dataKey="pdf"
            stroke={curveColor}
            strokeWidth={2.5}
            fill="url(#mainColor)"
            dot={false}
            isAnimationActive={false}
          />

          {/* Shaded area layers depending on normal / conditional type */}
          {type === 'conditional' ? (
            <>
              <Area
                type="monotone"
                dataKey="condBShadedY"
                stroke="none"
                fill={bShadedColor}
                fillOpacity={0.22}
                dot={false}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="intersectShadedY"
                stroke="none"
                fill={intersectShadedColor}
                fillOpacity={0.48}
                dot={false}
                isAnimationActive={false}
              />
            </>
          ) : type === 'outside' ? (
            <>
              <Area
                type="monotone"
                dataKey="shadedYBelow"
                stroke="none"
                fill={shadedColor}
                fillOpacity={0.35}
                dot={false}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="shadedYAbove"
                stroke="none"
                fill={shadedColor}
                fillOpacity={0.35}
                dot={false}
                isAnimationActive={false}
              />
            </>
          ) : (
            <Area
              type="monotone"
              dataKey="shadedY"
              stroke="none"
              fill={shadedColor}
              fillOpacity={0.35}
              dot={false}
              isAnimationActive={false}
            />
          )}

          <ReferenceLine
            x={mean}
            stroke={curveColor}
            strokeWidth={1.5}
            strokeDasharray="10 4"
            label={(props) => renderReferenceLabel(props, '\\mu', curveColor)}
          />

          {type === 'conditional' ? (
            <>
              {condX1 !== undefined && (condType === 'below' || condType === 'above' || condType === 'between') && (
                <ReferenceLine
                  x={condX1}
                  stroke={secondaryCurveColor}
                  strokeWidth={1.5}
                  strokeDasharray="10 4"
                  label={(props) => renderReferenceLabel(props, 'b_1', secondaryCurveColor)}
                />
              )}
              {condX2 !== undefined && condType === 'between' && (
                <ReferenceLine
                  x={condX2}
                  stroke={secondaryCurveColor}
                  strokeWidth={1.5}
                  strokeDasharray="10 4"
                  label={(props) => renderReferenceLabel(props, 'b_2', secondaryCurveColor)}
                />
              )}
              {(condTypeA === 'below' || condTypeA === 'above' || condTypeA === 'between') && (
                <ReferenceLine
                  x={x1}
                  stroke={zLineColor}
                  strokeWidth={2.5}
                  label={(props) => renderReferenceLabel(props, 'a_1', zLineColor)}
                />
              )}
              {condTypeA === 'between' && (
                <ReferenceLine
                  x={x2}
                  stroke={zLineColor}
                  strokeWidth={2.5}
                  label={(props) => renderReferenceLabel(props, 'a_2', zLineColor)}
                />
              )}
            </>
          ) : mode === 'inverse' ? (
            <ReferenceLine
              x={x1}
              stroke={zLineColor}
              strokeWidth={2.5}
              label={(props) => renderReferenceLabel(props, type === 'between' || type === 'outside' ? 'X_1' : 'X', zLineColor)}
            />
          ) : (
            <>
              <ReferenceLine
                x={x1}
                stroke={zLineColor}
                strokeWidth={2.5}
                label={(props) => renderReferenceLabel(props, type === 'between' || type === 'outside' ? 'X_1' : 'X', zLineColor)}
              />
              {(type === 'between' || type === 'outside') && (
                <ReferenceLine
                  x={x2}
                  stroke={secondaryCurveColor}
                  strokeWidth={2.5}
                  label={(props) => renderReferenceLabel(props, 'X_2', secondaryCurveColor)}
                />
              )}
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
