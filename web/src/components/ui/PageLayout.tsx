import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export interface PageLayoutProps {
  /** The content of the header (title, logo, tabs, etc.) */
  header?: React.ReactNode;
  /** Optional global footer content */
  footer?: React.ReactNode;
  /** The main content sections */
  children: React.ReactNode;
  /** Add a specific dir attribute to the layout. Often 'rtl' for Hebrew. */
  dir?: 'ltr' | 'rtl';
}

/**
 * A standardized layout container that implements the Layered Dark Mode 
 * aesthetics and global grid alignment across all calculator pages.
 */
export const PageLayout: React.FC<PageLayoutProps> = ({ header, footer, children, dir = 'rtl' }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] font-sans p-3 sm:p-6 flex flex-col items-center">
      {header && (
        <header className="w-full max-w-[1800px] mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-[27px] border-b border-[var(--color-border)] pb-5">
          {header}
        </header>
      )}

      <main className="w-full max-w-[1800px] mx-auto flex flex-col gap-6" dir={dir}>
        {children}
      </main>

      {footer && (
        <footer className="mt-10 w-full max-w-[1800px] mx-auto border-t border-[var(--color-border)] pt-6" dir={dir}>
          {footer}
        </footer>
      )}

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-50 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-accent-cobalt)] hover:text-white hover:bg-[var(--color-accent-cobalt)] rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
          title="חזרה לראש העמוד"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
};
