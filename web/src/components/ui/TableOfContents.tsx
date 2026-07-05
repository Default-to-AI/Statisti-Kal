import React, { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Bolt, X } from 'lucide-react';

interface HeadingData {
  id: string;
  text: string;
  level: number;
  openPath: string[];
}

const MOBILE_MEDIA_QUERY = '(max-width: 767px)';
const TOC_SELECTOR = '[data-toc-label], h2[data-toc], h3[data-toc], h4[data-toc]';

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

function collectHeadings(root: HTMLElement | null): HeadingData[] {
  if (!root) {
    return [];
  }

  const seenIds = new Set<string>();
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(TOC_SELECTOR));

  return nodes.flatMap((node, index) => {
    if (node.hasAttribute('data-toc-ignore')) {
      return [];
    }

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
      : node.tagName === 'H4'
        ? 4
        : node.tagName === 'H3'
          ? 3
          : 2;

    const target = document.getElementById(id);
    if (!target) {
      return [];
    }

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

function getScrollSpyOffset(): number {
  return Math.max(Math.round(window.innerHeight * 0.1), 88) + 16;
}

function resolveActiveHeadingId(headings: HeadingData[]): string | null {
  if (headings.length === 0) {
    return null;
  }

  const thresholdY = window.scrollY + getScrollSpyOffset();
  let nextActiveId = headings[0]?.id ?? null;

  for (const heading of headings) {
    const target = document.getElementById(heading.id);
    if (!target) {
      continue;
    }

    const targetTop = target.getBoundingClientRect().top + window.scrollY;
    if (targetTop <= thresholdY) {
      nextActiveId = heading.id;
    } else {
      break;
    }
  }

  return nextActiveId;
}

interface TableOfContentsProps {
  rootRef: RefObject<HTMLElement | null>;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ rootRef }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [headings, setHeadings] = useState<HeadingData[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const refreshFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const refreshHeadings = () => {
      if (refreshFrameRef.current !== null) {
        cancelAnimationFrame(refreshFrameRef.current);
      }

      refreshFrameRef.current = requestAnimationFrame(() => {
        setHeadings(collectHeadings(rootRef.current));
      });
    };

    refreshHeadings();

    const root = rootRef.current;
    if (!root) {
      return () => {
        if (refreshFrameRef.current !== null) {
          cancelAnimationFrame(refreshFrameRef.current);
        }
      };
    }

    const mutationObserver = new MutationObserver(refreshHeadings);
    mutationObserver.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['id', 'class', 'data-toc', 'data-toc-label', 'data-toc-target', 'data-toc-level', 'data-toc-open', 'data-toc-ignore'],
    });

    return () => {
      mutationObserver.disconnect();
      if (refreshFrameRef.current !== null) {
        cancelAnimationFrame(refreshFrameRef.current);
      }
    };
  }, [rootRef]);

  useEffect(() => {
    if (headings.length === 0) {
      setActiveId(null);
      return;
    }

    let frameId: number | null = null;

    const updateActiveHeading = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        setActiveId(resolveActiveHeadingId(headings));
      });
    };

    updateActiveHeading();
    window.addEventListener('scroll', updateActiveHeading, { passive: true });
    window.addEventListener('resize', updateActiveHeading);

    return () => {
      window.removeEventListener('scroll', updateActiveHeading);
      window.removeEventListener('resize', updateActiveHeading);
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
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
        aria-label={isExpanded ? 'סגור ניווט מהיר' : 'פתח ניווט מהיר'}
        aria-expanded={isExpanded}
        className="tour-quick-nav-toggle fixed bottom-6 right-6 z-50 inline-flex cursor-pointer flex-row-reverse items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] shadow-[0_16px_40px_rgba(0,0,0,0.32)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-surface)]"
      >
        {isExpanded ? <X size={18} /> : <Bolt size={18} />}
        <span>ניווט מהיר</span>
      </button>

      <aside
        className={`pointer-events-none fixed inset-x-3 bottom-24 z-50 md:inset-x-auto md:bottom-24 md:right-6 md:w-[22rem] transition-all duration-250 ${asideClassName}`}
        dir="rtl"
        aria-hidden={!isExpanded}
        inert={!isExpanded ? true : undefined}
      >
        <div className="pointer-events-auto max-h-[min(68vh,38rem)] overflow-hidden rounded-[1.25rem] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-raised)_94%,transparent)] shadow-[0_24px_64px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 py-3">
            <div className="flex flex-row-reverse items-center gap-2">
              <Bolt size={18} className="text-[var(--color-primary)]" />
              <h2 className="m-0 text-sm font-semibold text-[var(--color-primary)]">ניווט מהיר</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              aria-label="סגור ניווט מהיר"
              className="cursor-pointer rounded-full p-1 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)]"
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
              <ul className="m-0 list-none space-y-1 p-0 text-body-xs">
                {headings.map((heading) => {
                  const isActive = activeId === heading.id;
                  const isNested = heading.level >= 4;
                  const indent = heading.level >= 4 ? '2rem' : heading.level >= 3 ? '1.2rem' : undefined;
                  return (
                    <li key={heading.id} className={`relative ${isNested ? 'pr-4' : ''}`}>
                      <button
                        type="button"
                        onClick={() => {
                          void handleJump(heading);
                        }}
                        className={`relative flex w-full cursor-pointer items-start gap-3 px-3 py-2 text-right transition-all ${
                          isActive
                            ? 'bg-[var(--color-primary)]/12 text-[var(--color-text-primary)]'
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]/72 hover:text-[var(--color-text-primary)]'
                        } ${
                          isNested
                            ? 'rounded-lg text-[0.92rem]'
                            : 'rounded-2xl'
                        }`}
                        style={{ paddingRight: indent }}
                      >
                        {isNested ? (
                          <>
                            <span aria-hidden="true" className="absolute -right-3 top-0 bottom-0 w-px bg-[var(--color-border)]/45" />
                            <span aria-hidden="true" className="absolute -right-3 top-1/2 h-px w-3 -translate-y-1/2 bg-[var(--color-border)]/45" />
                          </>
                        ) : null}
                        <span
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                            isActive ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
                          }`}
                        />
                        <span className={`flex-1 leading-6 ${isNested ? 'text-[0.95em]' : ''} ${isActive ? 'font-semibold' : 'font-bold'}`}>{heading.text}</span>
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
