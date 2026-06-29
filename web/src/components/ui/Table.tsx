/**
 * Table.tsx
 * Primitive table component per DESIGN.md Component Usage Map
 * Variants: default (data tables), decision-matrix (Type I/II error tables)
 * All colors consume DESIGN.md tokens via var(--color-*)
 */

import React, { TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';

export type TableVariant = 'default' | 'decision-matrix';
export type TableSize = 'sm' | 'md' | 'lg';

// ============================================================================
// Table — Main table container
// ============================================================================

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Visual variant. 'decision-matrix' for Type I/II error tables. Default 'default'. */
  variant?: TableVariant;
  /** Size variant affecting cell padding and font scale. Default 'md'. */
  size?: TableSize;
  /** When true, adds horizontal scroll on overflow. Default true. */
  responsive?: boolean;
  /** When true, uses table-layout: fixed for equal columns. */
  fixedLayout?: boolean;
}

const TABLE_VARIANT_CLASSES: Record<TableVariant, string> = {
  default: 'bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm',
  'decision-matrix': 'bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm rounded-sm overflow-hidden',
};

const TABLE_SIZE_CLASSES: Record<TableSize, string> = {
  sm: 'text-xs sm:text-sm',
  md: 'text-sm sm:text-base',
  lg: 'text-base sm:text-lg',
};

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  function Table(
    {
      variant = 'default',
      size = 'md',
      responsive = true,
      fixedLayout = false,
      className = '',
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <div className={responsive ? 'overflow-x-auto' : ''}>
        <table
          ref={ref}
          className={`
            w-full border-collapse
            ${TABLE_VARIANT_CLASSES[variant]}
            ${TABLE_SIZE_CLASSES[size]}
            ${fixedLayout ? 'table-layout-fixed' : ''}
            ${className}
          `}
          {...rest}
        >
          {children}
        </table>
      </div>
    );
  },
);

Table.displayName = 'Table';

// ============================================================================
// TableHead / TableBody / TableRow / TableHeaderCell / TableCell
// ============================================================================

export interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
export const TableHead: React.FC<TableHeadProps> = ({ className = '', children, ...rest }) => (
  <thead className={`${className}`} {...rest}>{children}</thead>
);

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
export const TableBody: React.FC<TableBodyProps> = ({ className = '', children, ...rest }) => (
  <tbody className={`text-[var(--color-text-primary)] ${className}`} {...rest}>{children}</tbody>
);

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** When true, adds hover effect. */
  hover?: boolean;
  /** Click handler for interactive rows. */
  onClick?: () => void;
}
export const TableRow: React.FC<TableRowProps> = ({ hover = false, onClick, className = '', children, ...rest }) => (
  <tr
    className={`
      ${hover ? 'transition-colors hover:bg-[var(--color-surface-raised)]' : ''}
      ${onClick ? 'cursor-pointer select-none' : ''}
      ${className}
    `}
    onClick={onClick}
    {...rest}
  >
    {children}
  </tr>
);

export interface TableHeaderCellProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** Width hint (e.g., 'w-[20%]', 'w-20'). */
  width?: string;
  /** Text alignment. Default 'center'. */
  align?: 'left' | 'center' | 'right' | 'start' | 'end';
  /** When true, adds left border. */
  bordered?: boolean;
}
const ALIGN_CLASSES: Record<NonNullable<TableHeaderCellProps['align']>, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  start: 'text-start',
  end: 'text-end',
};

export const TableHeaderCell = React.forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  function TableHeaderCell(
    {
      width,
      align = 'center',
      bordered = false,
      className = '',
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <th
        ref={ref}
        style={width ? { width } : undefined}
        className={`
          font-bold p-4 border-b border-[var(--color-border)]
          ${ALIGN_CLASSES[align]}
          ${bordered ? 'border-l border-[var(--color-border)]' : ''}
          ${className}
        `}
        {...rest}
      >
        {children}
      </th>
    );
  },
);

TableHeaderCell.displayName = 'TableHeaderCell';

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** Text alignment. Default 'center'. */
  align?: 'left' | 'center' | 'right' | 'start' | 'end';
  /** When true, adds left border. */
  bordered?: boolean;
  /** Background variant for semantic cells. */
  tone?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'muted';
  /** When true, makes cell font-mono for numeric data. */
  mono?: boolean;
}

const TONE_CLASSES: Record<NonNullable<TableCellProps['tone']>, string> = {
  default: '',
  success: 'bg-[var(--color-success)]/10',
  error: 'bg-[var(--color-error)]/10',
  warning: 'bg-[var(--color-warning)]/10',
  info: 'bg-[var(--color-accent-cobalt-bg)]',
  muted: 'bg-[var(--color-surface-raised)]/50',
};

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell(
    {
      align = 'center',
      bordered = false,
      tone = 'default',
      mono = false,
      className = '',
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <td
        ref={ref}
        className={`
          p-4
          ${ALIGN_CLASSES[align]}
          ${bordered ? 'border-l border-[var(--color-border)]' : ''}
          ${TONE_CLASSES[tone]}
          ${mono ? 'font-mono' : ''}
          ${className}
        `}
        {...rest}
      >
        {children}
      </td>
    );
  },
);

TableCell.displayName = 'TableCell';

// ============================================================================
// DecisionMatrixCell — Specialized cell for decision matrix (Type I/II)
// ============================================================================

export interface DecisionMatrixCellProps extends TableCellProps {
  /** Decision matrix cell type. */
  decisionType?: 'correct-h0' | 'type1' | 'type2' | 'correct-h1';
  /** Probability value (e.g., 0.95, 0.05, 0.20). */
  probability?: number;
  /** Label for the probability (e.g., '1-α', 'α', 'β', 'Power'). */
  probabilityLabel?: string;
  /** Hebrew label for the cell. */
  hebrewLabel?: string;
  /** English label for the cell. */
  englishLabel?: string;
  /** When true, cell is disabled (power not calculated). */
  disabled?: boolean;
}

export const DecisionMatrixCell: React.FC<DecisionMatrixCellProps> = ({
  decisionType,
  probability,
  probabilityLabel,
  hebrewLabel,
  englishLabel,
  disabled = false,
  className = '',
  children,
  ...rest
}) => {
  const toneMap: Record<NonNullable<DecisionMatrixCellProps['decisionType']>, NonNullable<TableCellProps['tone']>> = {
    'correct-h0': 'success',
    'type1': 'error',
    'type2': 'error',
    'correct-h1': 'success',
  };

  const tone = decisionType ? toneMap[decisionType] : 'default';

  return (
    <TableCell
      tone={tone}
      className={`
        transition-colors
        ${!disabled ? 'hover:bg-[var(--color-success)]/20' : 'opacity-40 select-none'}
        ${className}
      `}
      {...rest}
    >
      {hebrewLabel && (
        <div className="mb-2">
          <span className="text-sm block text-[var(--color-text-primary)] font-bold">
            {hebrewLabel}
          </span>
          {englishLabel && (
            <span className="block text-xs font-mono text-[var(--color-text-secondary)] mt-1" dir="ltr">
              {englishLabel}
            </span>
          )}
        </div>
      )}
      {probability !== undefined && probabilityLabel && (
        <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2 mb-2">
          <span className={`font-bold text-xs flex items-center gap-1.5 ${
            tone === 'success' ? 'text-[var(--color-success)]' :
            tone === 'error' ? 'text-[var(--color-error)]' :
            'text-[var(--color-text-primary)]'
          }`}>
            {tone === 'success' && <span className="text-[var(--color-success)]">✓</span>}
            {tone === 'error' && <span className="text-[var(--color-error)]">✗</span>}
            {decisionType?.startsWith('correct') && 'החלטה נכונה'}
            {decisionType === 'type1' && 'שגיאה מסוג I'}
            {decisionType === 'type2' && 'שגיאה מסוג II'}
          </span>
          <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)]" dir="ltr">
            {probabilityLabel}
          </span>
        </div>
      )}
      {probability !== undefined && (
        <div className="my-2 flex items-baseline gap-x-2 flex-wrap">
          <span className="text-xl font-sans font-bold tracking-tight text-[var(--color-text-primary)]">
            {(probability * 100).toFixed(1)}%
          </span>
          <span className="text-xs font-bold text-[var(--color-text-secondary)]">
            {probabilityLabel === '1-α' || probabilityLabel === '1-β' ? 'רמת סמך' : 'עוצמה'}
          </span>
        </div>
      )}
      {children}
    </TableCell>
  );
};

// ============================================================================
// PowerTableRow / PowerTable — Specialized for power calculation tables
// ============================================================================

export interface PowerTableRowProps {
  /** Method name (e.g., 'סטטיסטי המבחן', 'אזור הדחייה', 'הסתברות מובהקות'). */
  method: string;
  /** Comparison metric (KaTeX). */
  metric: string;
  /** Decision rule (KaTeX). */
  rule: string;
  /** When true, this row has bottom border. */
  hasBorder?: boolean;
}

export const PowerTableRow: React.FC<PowerTableRowProps> = ({
  method,
  metric,
  rule,
  hasBorder = true,
}) => (
  <TableRow className={hasBorder ? 'border-b border-[var(--color-border)]' : ''}>
    <TableCell align="center" tone="default" className="font-bold">
      {method}
    </TableCell>
    <TableCell align="center" mono dir="ltr">
      {metric}
    </TableCell>
    <TableCell align="center">
      {rule}
    </TableCell>
  </TableRow>
);

export interface PowerTableProps {
  /** Array of rows. */
  rows: Array<PowerTableRowProps>;
  /** Table header color. Default 'cobalt'. */
  headerColor?: 'cobalt' | 'brass' | 'teal' | 'crimson';
}

const HEADER_COLOR_CLASSES: Record<NonNullable<PowerTableProps['headerColor']>, string> = {
  cobalt: 'bg-[var(--color-surface)] text-[var(--color-accent-cobalt)]',
  brass: 'bg-[var(--color-surface)] text-[var(--color-primary)]',
  teal: 'bg-[var(--color-surface)] text-[var(--chart-2)]',
  crimson: 'bg-[var(--color-surface)] text-[var(--color-accent-crimson)]',
};

export const PowerTable: React.FC<PowerTableProps> = ({
  rows,
  headerColor = 'cobalt',
}) => (
  <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] mt-6 mb-8">
    <Table variant="default" size="sm">
      <TableHead>
        <TableRow>
          <TableHeaderCell
            className={`${HEADER_COLOR_CLASSES[headerColor]} font-bold border-b border-[var(--color-border)]/50 text-center p-4`}
          >
            גישה
          </TableHeaderCell>
          <TableHeaderCell
            className={`${HEADER_COLOR_CLASSES[headerColor]} font-bold border-b border-[var(--color-border)]/50 text-center p-4`}
          >
            מדד ההשוואה
          </TableHeaderCell>
          <TableHeaderCell
            className={`${HEADER_COLOR_CLASSES[headerColor]} font-bold border-b border-[var(--color-border)]/50 text-center p-4`}
          >
            כלל ההחלטה
          </TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody className="bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]">
        {rows.map((row, idx) => (
          <PowerTableRow key={idx} {...row} hasBorder={idx < rows.length - 1} />
        ))}
      </TableBody>
    </Table>
  </div>
);
