import React, { useEffect, useState } from 'react';
import { List, X } from 'lucide-react';

interface HeadingData {
  id: string;
  text: string;
  level: number;
}

export const TableOfContents: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [headings, setHeadings] = useState<HeadingData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    // Only query headings inside the main content to avoid sidebar/header elements
    const elements = Array.from(document.querySelectorAll('main h2, main h3'));
    const parsedHeadings: HeadingData[] = elements.map((el, index) => {
      if (!el.id) {
        // Generate an ID if it doesn't exist
        el.id = `heading-${index}-${el.textContent?.replace(/\s+/g, '-').toLowerCase()}`;
      }
      return {
        id: el.id,
        text: el.textContent || '',
        level: el.tagName === 'H2' ? 2 : 3,
      };
    });
    
    setHeadings(parsedHeadings);

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible heading
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      { 
        // Trigger slightly before the heading reaches the top of the viewport
        rootMargin: '-20% 0px -60% 0px' 
      }
    );

    elements.forEach((el) => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        aria-label="פתח תוכן עניינים"
        className="fixed bottom-6 right-6 md:bottom-auto md:top-24 z-50 p-3 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-full shadow-lg text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors"
      >
        <List size={24} />
      </button>
    );
  }

  return (
    <aside 
      className="fixed bottom-0 right-0 md:bottom-auto md:top-24 md:right-6 z-50 w-full md:w-64 max-h-[50vh] md:max-h-[70vh] bg-[var(--color-surface-raised)] border-t md:border border-[var(--color-border)] md:rounded-xl shadow-2xl flex flex-col overflow-hidden" 
      dir="rtl"
    >
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <h2 className="font-bold text-[var(--color-accent-brass)] text-base m-0 flex items-center gap-2">
          <List size={18} />
          תוכן עניינים
        </h2>
        <button
          onClick={() => setIsExpanded(false)}
          aria-label="סגור תוכן עניינים"
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        {headings.length === 0 ? (
          <p className="text-[var(--color-text-secondary)] text-sm text-center py-4">
            אין סעיפים בעמוד זה
          </p>
        ) : (
          <ul className="list-none p-0 m-0 space-y-3 text-sm">
            {headings.map((h) => {
              const isActive = activeId === h.id;
              return (
                <li
                  key={h.id}
                  style={{ paddingRight: h.level === 3 ? '16px' : '0' }}
                  className={`border-r-2 transition-colors ${
                    isActive
                      ? 'border-[var(--color-accent-brass)]'
                      : 'border-transparent'
                  }`}
                >
                  <a
                    href={`#${h.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`block pr-2 transition-colors ${
                      isActive
                        ? 'text-[var(--color-accent-brass)] font-bold'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {h.text}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
};
