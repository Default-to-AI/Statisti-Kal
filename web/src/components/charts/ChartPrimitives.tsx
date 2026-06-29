import React from 'react';
import { InlineMath } from 'react-katex';

export type ChartLegendItemStyle = 'line' | 'area';

export interface ChartLegendItem {
  math: string;
  color: string;
  style: ChartLegendItemStyle;
  label?: React.ReactNode;
  onClick?: () => void;
  muted?: boolean;
}

export interface ChartLegendProps {
  items: ChartLegendItem[];
  className?: string;
}

export const ChartLegend: React.FC<ChartLegendProps> = ({ items, className = '' }) => (
  <div className={`flex flex-wrap items-center gap-4 text-xs sm:text-sm ${className}`}>
    {items.map((item) => {
      const content = (
        <>
          {item.style === 'line' ? (
            <span className="inline-block h-3 w-0.5" style={{ backgroundColor: item.color }} />
          ) : (
            <span className="inline-block h-3 w-3 border" style={{ backgroundColor: `${item.color}33`, borderColor: item.color }} />
          )}
          <span dir="ltr">
            <InlineMath math={item.math} />
          </span>
          {item.label}
        </>
      );

      const baseClass = `flex items-center gap-1.5 font-semibold select-none transition-all ${item.muted ? 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]' : ''}`;

      if (item.onClick) {
        return (
          <button
            key={item.math}
            type="button"
            onClick={item.onClick}
            className={`${baseClass} cursor-pointer`}
            style={{ color: item.color }}
          >
            {content}
          </button>
        );
      }

      return (
        <span key={item.math} className={baseClass} style={{ color: item.color }}>
          {content}
        </span>
      );
    })}
  </div>
);

export interface ChartTooltipPayload<TPayload> {
  payload: TPayload;
}

export interface ChartTooltipProps<TPayload> {
  active?: boolean;
  payload?: Array<ChartTooltipPayload<TPayload>>;
}

export interface ChartTooltipShellProps {
  children: React.ReactNode;
  className?: string;
}

export const ChartTooltipShell: React.FC<ChartTooltipShellProps> = ({ children, className = '' }) => (
  <div
    className={`p-3 border rounded-sm shadow-sm font-sans space-y-2 backdrop-blur-md bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] ${className}`}
    dir="rtl"
  >
    {children}
  </div>
);

interface ChartReferenceLabelViewBox {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface ChartMathReferenceLabelOptions {
  math: string;
  color: string;
  width?: number;
  height?: number;
  xOffset?: number;
  yOffset?: number | ((viewBox: ChartReferenceLabelViewBox) => number);
  className?: string;
}

function getReferenceViewBox(props: unknown): ChartReferenceLabelViewBox | null {
  if (!props || typeof props !== 'object' || !('viewBox' in props)) return null;

  const viewBox = (props as { viewBox?: unknown }).viewBox;
  if (!viewBox || typeof viewBox !== 'object') return null;

  const candidate = viewBox as { x?: unknown; y?: unknown; width?: unknown; height?: unknown };
  if (typeof candidate.x !== 'number' || typeof candidate.y !== 'number') return null;

  return {
    x: candidate.x,
    y: candidate.y,
    width: typeof candidate.width === 'number' ? candidate.width : undefined,
    height: typeof candidate.height === 'number' ? candidate.height : undefined,
  };
}

export function renderChartMathReferenceLabel(
  props: unknown,
  {
    math,
    color,
    width = 80,
    height = 40,
    xOffset = -40,
    yOffset = -20,
    className = 'text-[1.25rem] font-semibold bg-[var(--color-surface)]/80 px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md border border-[var(--color-border)]/50',
  }: ChartMathReferenceLabelOptions,
): React.ReactElement | null {
  const viewBox = getReferenceViewBox(props);
  if (!viewBox) return null;
  const resolvedYOffset = typeof yOffset === 'function' ? yOffset(viewBox) : yOffset;

  return (
    <foreignObject x={viewBox.x + xOffset} y={viewBox.y + resolvedYOffset} width={width} height={height} style={{ overflow: 'visible' }}>
      <div className="flex h-full items-start justify-center leading-none" style={{ color }}>
        <span className={className}>
          <InlineMath math={math} />
        </span>
      </div>
    </foreignObject>
  );
}
