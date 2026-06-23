import React, { useEffect, useMemo, useRef, useState } from 'react';
import { List, X } from 'lucide-react';

interface HeadingData {
  id: string;
  text: string;
  level: number;
  openPath: string[];
}

const MOBILE_MEDIA_QUERY = '(max-width: 767px)';

function slugifyHeading(text: string, fallbackIndex: number): string {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}-]+/gu, '');
  return normalized ? `toc-${normalized}` : `toc-heading-${fallbackIndex}`;
}

function parseOpenPath(rawValue: string | undefined): string[] {
  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function collectHeadings(): HeadingData[] {
  const main = document.querySelector('main');
  if (!main) {
    return [];
  }

  const seenIds = new Set<string>();
  const nodes = Array.from(main.querySelectorAll<HTMLElement>('[data-toc-label], h2, h3'));

  return nodes.flatMap((node, index) => {
    const explicitLabel = node.dataset.tocLabel?.trim();
    const text = explicitLabel || node.textContent?.trim() || '';
    if (!text) {
      return [];
    }

    let id = node.dataset.tocTarget?.trim() || node.id;
    if (!id) {
      const baseId = slugifyHeading(text, index);
      let candidateId = baseId;
      let suffix = 1;

      while (seenIds.has(candidateId)) {
        candidateId = `${baseId}-${suffix++}`;
      }

      id = candidateId;
      node.id = id;
    } else if (seenIds.has(id)) {
      return [];
    }
    seenIds.add(id);

    const level = explicitLabel
      ? Number(node.dataset.tocLevel || '2')
      : node.tagName === 'H3'
        ? 3
        : 2;

    return [{
      id,
      text,
      level,
      openPath: parseOpenPath(node.dataset.tocOpen),
    }];
  });
}

function waitForTarget(id: string, attemptsLeft = 24): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const tryResolve = () => {
      const target = document.getElementById(id);
      if (target || attemptsLeft <= 0) {
        resolve(target);
        return;
      }

      requestAnimationFrame(() => {
        waitForTarget(id, attemptsLeft - 1).then(resolve);
      });
    };

    tryResolve();
  });
}

function scrollToTarget(target: HTMLElement): void {
  const targetTop = target.getBoundingClientRect().top + window.scrollY;
  const viewportOffset = Math.max(Math.round(window.innerHeight * 0.1), 88);

  window.scrollTo({
    top: Math.max(0, targetTop - viewportOffset),
    behavior: 'smooth',
  });
}

function flashTarget(target: HTMLElement): void {
  target.classList.remove('toc-target-flash');
  void target.offsetWidth;

  const previousTabIndex = target.getAttribute('tabindex');
  if (!previousTabIndex) {
    target.setAttribute('tabindex', '-1');
  }

  target.classList.add('toc-target-flash');
  target.focus({ preventScroll: true });

  window.setTimeout(() => {
    target.classList.remove('toc-target-flash');
    if (!previousTabIndex) {
      target.removeAttribute('tabindex');
    }
  }, 1350);
}

export const TableOfContents: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [headings, setHeadings] = useState<HeadingData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const refreshFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const refreshHeadings = () => {
      if (refreshFrameRef.current !== null) {
        cancelAnimationFrame(refreshFrameRef.current);
      }

      refreshFrameRef.current = requestAnimationFrame(() => {
        setHeadings(collectHeadings());
      });
    };

    refreshHeadings();

    const main = document.querySelector('main');
    if (!main) {
      return () => {
        if (refreshFrameRef.current !== null) {
          cancelAnimationFrame(refreshFrameRef.current);
        }
      };
    }

    const mutationObserver = new MutationObserver(refreshHeadings);
    mutationObserver.observe(main, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['id', 'data-toc-label', 'data-toc-target', 'data-toc-level', 'data-toc-open'],
    });

    return () => {
      mutationObserver.disconnect();
      if (refreshFrameRef.current !== null) {
        cancelAnimationFrame(refreshFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    observerRef.current?.disconnect();

    const visibleTargets = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((target): target is HTMLElement => Boolean(target));

    if (visibleTargets.length === 0) {
      setActiveId(null);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);

        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-12% 0px -70% 0px',
        threshold: [0, 0.1, 0.5, 1],
      },
    );

    visibleTargets.forEach((target) => observer.observe(target));
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [headings]);

  const hasHeadings = headings.length > 0;

  const asideClassName = useMemo(() => (
    isExpanded
      ? 'pointer-events-auto opacity-100 translate-y-0 md:translate-x-0'
      : 'pointer-events-none opacity-0 translate-y-4 md:translate-y-0 md:translate-x-4'
  ), [isExpanded]);

  const handleJump = async (heading: HeadingData): Promise<void> => {
    setActiveId(heading.id);

    if (heading.openPath.length > 0) {
      const emitOpenPath = () => {
        window.dispatchEvent(new CustomEvent('toc-open-path', { detail: { ids: heading.openPath } }));
      };

      emitOpenPath();
      await new Promise((resolve) => window.setTimeout(resolve, 60));
      emitOpenPath();
      await new Promise((resolve) => window.setTimeout(resolve, 180));
      emitOpenPath();
      await new Promise((resolve) => window.setTimeout(resolve, 240));
    }

    const target = await waitForTarget(heading.id);
    if (!target) {
      return;
    }

    scrollToTarget(target);
    window.setTimeout(() => flashTarget(target), 320);

    if (window.matchMedia(MOBILE_MEDIA_QUERY).matches) {
      setIsExpanded(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        aria-label={isExpanded ? 'סגור תוכן עניינים' : 'פתח תוכן עניינים'}
        aria-expanded={isExpanded}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm font-black text-[var(--color-text-primary)] shadow-[0_16px_40px_rgba(0,0,0,0.32)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-surface)]"
      >
        {isExpanded ? <X size={18} /> : <List size={18} />}
        <span>תוכן עניינים</span>
      </button>

      <aside
        className={`pointer-events-none fixed inset-x-3 bottom-24 z-50 md:inset-x-auto md:bottom-24 md:right-6 md:w-[22rem] transition-all duration-250 ${asideClassName}`}
        dir="rtl"
        aria-hidden={!isExpanded}
        inert={!isExpanded}
      >
        <div className="pointer-events-auto max-h-[min(68vh,38rem)] overflow-hidden rounded-[1.25rem] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-raised)_94%,transparent)] shadow-[0_24px_64px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 py-3">
            <div className="flex items-center gap-2">
              <List size={18} className="text-[var(--color-accent-brass)]" />
              <h2 className="m-0 text-sm font-black text-[var(--color-accent-brass)]">תוכן עניינים</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              aria-label="סגור תוכן עניינים"
              className="rounded-full p-1 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)]"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="max-h-[min(68vh,34rem)] overflow-y-auto px-3 py-3">
            {!hasHeadings ? (
              <p className="rounded-xl border border-dashed border-[var(--color-border)] px-4 py-6 text-center text-sm font-bold text-[var(--color-text-secondary)]">
                אין סעיפים זמינים בעמוד זה
              </p>
            ) : (
              <ul className="m-0 list-none space-y-1.5 p-0 text-sm">
                {headings.map((heading) => {
                  const isActive = activeId === heading.id;
                  return (
                    <li key={heading.id}>
                      <button
                        type="button"
                        onClick={() => {
                          void handleJump(heading);
                        }}
                        className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-2.5 text-right transition-all ${
                          isActive
                            ? 'border-[var(--color-accent-brass)]/50 bg-[var(--color-accent-brass)]/12 text-[var(--color-text-primary)] shadow-[0_0_0_1px_rgba(250,204,21,0.18)]'
                            : 'border-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-border)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]'
                        }`}
                        style={{ paddingRight: heading.level >= 3 ? '1.2rem' : undefined }}
                      >
                        <span
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                            isActive ? 'bg-[var(--color-accent-brass)]' : 'bg-[var(--color-border)]'
                          }`}
                        />
                        <span className={`flex-1 leading-6 ${isActive ? 'font-black' : 'font-bold'}`}>{heading.text}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
};
