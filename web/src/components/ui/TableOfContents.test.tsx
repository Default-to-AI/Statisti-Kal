import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { useRef } from 'react';
import { TableOfContents } from './TableOfContents';

// ── Test wrapper that creates a stable rootRef ──────────────────────────
function TestWrapper({ children }: { children?: React.ReactNode }) {
  const rootRef = useRef<HTMLElement | null>(null);
  return (
    <>
      <main ref={rootRef} data-testid="main">
        {children}
      </main>
      <TableOfContents rootRef={rootRef} />
    </>
  );
}

function renderWithMain(ui?: React.ReactElement) {
  return render(<TestWrapper>{ui}</TestWrapper>);
}

// ── Shared mocks ────────────────────────────────────────────────────────
const MockedIntersectionObserver = vi.fn(function (
  this: IntersectionObserver,
  _cb: IntersectionObserverCallback,
) {
  this.observe = vi.fn();
  this.unobserve = vi.fn();
  this.disconnect = vi.fn();
  this.takeRecords = () => [];
});

Object.defineProperties(MockedIntersectionObserver.prototype, {
  root: { value: null, writable: true, configurable: true },
  rootMargin: { value: '', writable: true, configurable: true },
  thresholds: { value: [], writable: true, configurable: true },
});

const MockedMutationObserver = vi.fn(function (
  this: MutationObserver,
  _cb: MutationCallback,
) {
  this.observe = vi.fn();
  this.disconnect = vi.fn();
  this.takeRecords = () => [];
} as unknown as typeof MutationObserver);

// ── Helpers ─────────────────────────────────────────────────────────────
let rafHandleCounter = 1;

/** Stub requestAnimationFrame to fire synchronously — avoids fake-timer conflicts with React state updates */
function installSyncRAF() {
  rafHandleCounter = 1;
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((cb: FrameRequestCallback) => {
      const handle = rafHandleCounter++;
      // Fire the callback synchronously so setHeadings runs inline during the effect
      cb(performance.now());
      return handle;
    }),
  );
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
}

/** Fake only timers (setTimeout/setInterval), NOT requestAnimationFrame */
function installFakeTimers() {
  vi.useFakeTimers({ toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'Date'] });
}

function getToggleButton() {
  const buttons = screen.getAllByRole('button').filter(
    (btn) => btn.getAttribute('aria-expanded') !== null,
  );
  if (buttons.length === 0) {
    throw new Error('Could not find ToC toggle button');
  }
  return buttons[0]!;
}

function expandToc() {
  fireEvent.click(getToggleButton());
}

/** Returns all button elements inside the ToC nav (the heading navigation links). */
function getNavItems(): HTMLElement[] {
  const nav = document.querySelector('nav');
  if (!nav) return [];
  return Array.from(nav.querySelectorAll('button'));
}

beforeEach(() => {
  cleanup();
  installSyncRAF();
  installFakeTimers();
  vi.stubGlobal(
    'IntersectionObserver',
    MockedIntersectionObserver as unknown as typeof IntersectionObserver,
  );
  vi.stubGlobal('MutationObserver', MockedMutationObserver);
  window.scrollTo = vi.fn();
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  cleanup();
});

// ── Tests ───────────────────────────────────────────────────────────────
describe('TableOfContents', () => {
  // ── Collapsed state ───────────────────────────────────────────────────
  it('renders a floating toggle button when collapsed', () => {
    renderWithMain();
    const toggleBtn = getToggleButton();
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveTextContent('ניווט מהיר');
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands and collapses when the toggle button is clicked', () => {
    renderWithMain();
    const toggleBtn = getToggleButton();

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
  });

  // ── Empty state ───────────────────────────────────────────────────────
  it('shows empty-state message when main has no data-toc headings', () => {
    renderWithMain();
    expandToc();
    expect(screen.getByText('אין סעיפים זמינים בעמוד זה')).toBeInTheDocument();
  });

  // ── Heading collection ────────────────────────────────────────────────
  it('collects headings from inside the referenced main element', () => {
    renderWithMain(
      <div>
        <h2 data-toc>מבוא</h2>
        <h2 data-toc>שיטות</h2>
        <h3 data-toc>ניתוח נתונים</h3>
      </div>,
    );

    expandToc();

    const items = getNavItems();
    expect(items).toHaveLength(3);
    expect(items[0]!.textContent).toContain('מבוא');
    expect(items[1]!.textContent).toContain('שיטות');
    expect(items[2]!.textContent).toContain('ניתוח נתונים');
  });

  it('respects data-toc-ignore to skip headings', () => {
    renderWithMain(
      <div>
        <h2 data-toc>גלוי</h2>
        <h2 data-toc data-toc-ignore>
          מוסתר
        </h2>
      </div>,
    );

    expandToc();

    const items = getNavItems();
    expect(items).toHaveLength(1);
    expect(items[0]!.textContent).toContain('גלוי');
  });

  it('uses data-toc-label override for display text', () => {
    renderWithMain(
      <div>
        <h2 data-toc data-toc-label="תווית מותאמת">
          טקסט מקורי
        </h2>
      </div>,
    );

    expandToc();

    const items = getNavItems();
    expect(items).toHaveLength(1);
    expect(items[0]!.textContent).toContain('תווית מותאמת');
    expect(items[0]!.textContent).not.toContain('טקסט מקורי');
  });

  it('assigns auto-generated id when heading has no id', () => {
    renderWithMain(
      <div>
        <h2 data-toc>כותרת ללא מזהה</h2>
      </div>,
    );

    const headings = document.querySelectorAll('[data-toc]');
    expect(headings[0]?.id).toMatch(/^toc-/);
  });

  it('preserves existing id on headings', () => {
    renderWithMain(
      <div>
        <h2 data-toc id="custom-id">
          כותרת עם מזהה
        </h2>
      </div>,
    );

    const heading = document.querySelector('#custom-id');
    expect(heading).toBeInTheDocument();
  });

  // ── Navigation click ──────────────────────────────────────────────────
  it('scrolls to heading when an item is clicked', async () => {
    renderWithMain(
      <div>
        <h2 data-toc id="section-a">
          פרק א׳
        </h2>
        <h2 data-toc id="section-b">
          פרק ב׳
        </h2>
      </div>,
    );

    expandToc();

    fireEvent.click(getNavItems()[0]!);

    // Advance past the 320ms flash timeout in handleJump
    await act(() => vi.advanceTimersByTime(500));

    expect(window.scrollTo).toHaveBeenCalled();
  });

  // ── Scroll-spy active heading ─────────────────────────────────────────
  it('highlights the active heading based on scroll position', () => {
    renderWithMain(
      <div>
        <h2 data-toc id="top">
          עליון
        </h2>
        <h2 data-toc id="bottom">
          תחתון
        </h2>
      </div>,
    );

    expandToc();

    // Simulate scroll past the first heading
    vi.stubGlobal('scrollY', 9999);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    // After scroll, the last heading (bottom) should be active.
    // resolveActiveHeadingId reads window.scrollY directly and runs in a RAF callback;
    // with our sync RAF stub the update happens immediately.
    const items = getNavItems();
    expect(items[1]?.className).toContain('bg-[var(--color-primary)]/12');
  });

  // ── Nested heading indentation ────────────────────────────────────────
  it('renders h3 with increased right padding (RTL indentation)', () => {
    renderWithMain(
      <div>
        <h2 data-toc>ראשי</h2>
        <h3 data-toc>משני</h3>
      </div>,
    );

    expandToc();

    const items = getNavItems();
    expect(items).toHaveLength(2);
    expect(items[1]!.style.paddingRight).toBe('1.2rem');
  });

  // ── Close via header X button ─────────────────────────────────────────
  it('allows closing via the X button in the panel header', () => {
    renderWithMain(
      <div>
        <h2 data-toc>פרק</h2>
      </div>,
    );

    expandToc();

    const closeBtn = document.querySelector(
      '[aria-label="סגור ניווט מהיר"]',
    ) as HTMLButtonElement;
    expect(closeBtn).not.toBeNull();
    fireEvent.click(closeBtn);

    expect(getToggleButton()).toHaveAttribute('aria-expanded', 'false');
  });
});
