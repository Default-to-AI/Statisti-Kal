import React from 'react';

/**
 * Calculator Panel wrapper matching DESIGN.md panel-default / panel-elevated
 */
export const CalculatorPanel: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'hero';
  className?: string;
}> = ({ children, variant = 'default', className = '' }) => {
  let baseClass = 'border border-[var(--color-border)] ';
  
  if (variant === 'elevated') {
    baseClass += 'bg-[var(--color-surface-raised)] rounded-lg p-6 ';
  } else if (variant === 'hero') {
    baseClass += 'bg-[var(--color-surface)] rounded-xl p-8 ';
  } else {
    baseClass += 'bg-[var(--color-surface)] rounded-lg p-6 ';
  }

  return (
    <section className={`${baseClass} ${className}`}>
      {children}
    </section>
  );
};

/**
 * Standardized Section Header with Hebrew title and English formal term
 */
export const CalculatorSectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  id?: string;
}> = ({ title, subtitle, icon, actions, className = '', id }) => (
  <div className={`flex flex-col sm:flex-row gap-3 sm:items-center justify-between border-b border-[var(--color-border)] pb-4 mb-4 ${className}`} id={id}>
    <div className="flex items-center gap-3 text-[var(--color-accent-cobalt)]">
      {icon && <div className="rounded-lg bg-[var(--color-accent-cobalt)]/10 p-2 shrink-0">{icon}</div>}
      <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] m-0 flex items-baseline gap-2">
        {title}
        {subtitle && (
          <span className="text-sm font-normal text-[var(--color-text-secondary)] tracking-wider uppercase" dir="ltr">
            {subtitle}
          </span>
        )}
      </h2>
    </div>
    {actions && (
      <div className="flex w-full flex-col gap-3 sm:max-w-fit sm:flex-row sm:items-center shrink-0">
        {actions}
      </div>
    )}
  </div>
);

/**
 * Parameter Grid wrapper for tabular inputs
 */
export const ParameterGrid: React.FC<{
  children: React.ReactNode;
  headers: [React.ReactNode, React.ReactNode];
  className?: string;
}> = ({ children, headers, className = '' }) => (
  <div className={`overflow-visible rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition-all ${className}`} dir="rtl">
    <table className="w-full border-collapse border-spacing-0">
      <thead>
        <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <th className="relative overflow-hidden p-3.5 font-black text-xs sm:text-sm text-[var(--color-text-primary)] w-1/2 border-l border-[var(--color-border)]">
            <div className="relative z-10 flex items-center justify-center gap-1.5">
              {headers[0]}
            </div>
          </th>
          <th className="relative overflow-hidden p-3.5 text-center font-black text-xs sm:text-sm text-[var(--color-text-primary)] w-1/2">
            <div className="relative z-10">
              {headers[1]}
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {children}
      </tbody>
    </table>
  </div>
);


