/**
 * Heading.tsx
 * Primitive heading component per DESIGN.md Component Usage Map
 * 4 scales: page, section, subsection, label
 * All tokens consume DESIGN.md typography scale via var(--text-*)
 */

import React, { forwardRef, HTMLAttributes } from 'react';

export type HeadingLevel = 'page' | 'section' | 'subsection' | 'label';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Semantic level. Maps to DESIGN.md typography scale. */
  level?: HeadingLevel;
  /** Optional accent color for the text. Default none (uses text-primary). */
  accent?: 'brass' | 'teal' | 'crimson' | 'cobalt' | 'none';
  /** When true, adds the accent bar (48x4px brass→teal gradient) as prefix. */
  withAccentBar?: boolean;
  /** Text alignment. Default 'center' for page/section, 'start' for subsection/label. */
  align?: 'start' | 'center' | 'end';
}

const LEVEL_CLASSES: Record<HeadingLevel, string> = {
  page: 'text-[var(--text-heading-page)] font-black leading-[var(--text-heading-page--line-height)] tracking-[var(--text-heading-page--letter-spacing)]',
  section: 'text-[var(--text-heading-section)] font-bold leading-[var(--text-heading-section--line-height)] tracking-[var(--text-heading-section--letter-spacing)]',
  subsection: 'text-[var(--text-heading-subsection)] font-bold leading-[var(--text-heading-subsection--line-height)] tracking-[var(--text-heading-subsection--letter-spacing)]',
  label: 'text-[var(--text-heading-label)] font-black leading-[var(--text-heading-label--line-height)] tracking-[var(--text-heading-label--letter-spacing)] uppercase',
};

const ACCENT_CLASSES: Record<NonNullable<HeadingProps['accent']>, string> = {
  brass: 'text-[var(--color-accent-brass)]',
  teal: 'text-[var(--color-accent-teal)]',
  crimson: 'text-[var(--color-accent-crimson)]',
  cobalt: 'text-[var(--color-accent-cobalt)]',
  none: 'text-[var(--color-text-primary)]',
};

const ALIGN_CLASSES: Record<NonNullable<HeadingProps['align']>, string> = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
};

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  function Heading(
    {
      level = 'section',
      accent = 'none',
      withAccentBar = false,
      align,
      className = '',
      children,
      ...rest
    },
    ref,
  ) {
    const Tag = (level === 'page' ? 'h1' : level === 'section' ? 'h2' : level === 'subsection' ? 'h3' : 'h4') as any;
    const defaultAlign = level === 'label' ? 'start' : 'center';

    return (
      <Tag
        ref={ref}
        className={`
          flex items-center gap-3 font-sans
          ${LEVEL_CLASSES[level]}
          ${ACCENT_CLASSES[accent]}
          ${ALIGN_CLASSES[align ?? defaultAlign]}
          ${withAccentBar ? 'w-full justify-center' : ''}
          ${className}
        `}
        {...rest}
      >
        {withAccentBar && <span className="accent-bar" aria-hidden="true" />}
        {children}
        {withAccentBar && <span className="accent-bar" aria-hidden="true" />}
      </Tag>
    );
  },
);

Heading.displayName = 'Heading';

/**
 * SectionHeader — convenience composite: Heading + optional description
 * Used for major sections with subtitle text (e.g. "הגדרות ופרמטרים")
 */
export interface SectionHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  level?: Exclude<HeadingLevel, 'label'>;
  accent?: Exclude<HeadingProps['accent'], 'none'>;
  withAccentBar?: boolean;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  level = 'section',
  accent = 'cobalt',
  withAccentBar = true,
  className = '',
}) => (
  <div className={`flex flex-col items-center gap-2 ${level === 'page' ? 'mb-8' : 'mb-6'} ${className}`}>
    <Heading level={level} accent={accent} withAccentBar={withAccentBar}>
      {title}
    </Heading>
    {description && (
      <p className="text-[var(--text-body-base)] text-[var(--color-text-secondary)] text-center max-w-2xl">
        {description}
      </p>
    )}
  </div>
);