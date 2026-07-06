import React, { useRef } from 'react';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { ScrollToTopButton } from '../ScrollToTopButton';
import { TableOfContents } from './TableOfContents';
import { CyberneticBackground } from './CyberneticBackground';

export interface PageLayoutProps {
  /** The content of the header (title, logo, tabs, etc.) */
  header?: React.ReactNode;
  /** Optional global footer content */
  footer?: React.ReactNode;
  /** The main content sections */
  children: React.ReactNode;
  /** Add a specific dir attribute to the layout. Often 'rtl' for Hebrew. */
  dir?: 'ltr' | 'rtl';
  /** Optional shared width class for header/main/footer containers. */
  contentWidthClassName?: string;
  /** Optional outer padding override. */
  outerClassName?: string;
}

/**
 * A standardized layout container that implements the Layered Dark Mode 
 * aesthetics and global grid alignment across all calculator pages.
 * 
 * Features:
 * - Sticky header with scroll-aware backdrop blur + subtle border
 * - Animated scroll-to-top button with motion micro-interactions
 * - Smooth scroll behavior (set via CSS on html)
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  header,
  footer,
  children,
  dir = 'rtl',
  contentWidthClassName = 'max-w-[1800px]',
  outerClassName = 'p-3 sm:p-6',
}) => {
  const scrollY = useScrollPosition();
  const isScrolled = scrollY > 10;
  const showScrollTop = scrollY > 400;
  const mainRef = useRef<HTMLElement | null>(null);

  return (
    <div className="min-h-screen text-[var(--color-text-primary)] font-sans flex flex-col relative">
      <CyberneticBackground />
      {header && (
        <header
          className={`sticky top-0 z-40 w-full transition-all duration-300 ${
            isScrolled
              ? 'bg-[var(--color-background)]/85 backdrop-blur-lg border-b border-[var(--color-border)]/60 shadow-[0_1px_12px_rgba(0,0,0,0.25)]'
              : 'border-b border-[var(--color-border)] bg-transparent'
          }`}
        >
          <div className="w-full max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6 h-16" dir={dir}>
            {header}
          </div>
        </header>
      )}

      <div className={`flex-1 flex flex-col items-center ${outerClassName}`}>
        <main ref={mainRef} className={`w-full ${contentWidthClassName} mx-auto flex flex-col gap-6`} dir={dir}>
          {children}
        </main>

        {footer && (
          <div className="mt-auto w-full pt-10" dir={dir}>
            {footer}
          </div>
        )}
      </div>

      <TableOfContents rootRef={mainRef} />
      <ScrollToTopButton visible={showScrollTop} />
    </div>
  );
};
