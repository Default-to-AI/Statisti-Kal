import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SiteHeader from './SiteHeader';

afterEach(cleanup);

beforeEach(() => {
  class ResizeObserverMock {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }

  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
});

describe('SiteHeader', () => {
  it('renders the requested desktop hierarchy and marks the active category', () => {
    render(<SiteHeader activePage="hypothesis" onNavigate={vi.fn()} />);

    expect(screen.getByLabelText('חזרה לדף הבית')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'קטגוריות ראשיות' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /הסקה סטטיסטית/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByLabelText('סטטיסטי־קל')).toBeInTheDocument();
  });

  it('opens a stable category panel and navigates from a destination', () => {
    const onNavigate = vi.fn();
    render(<SiteHeader activePage="landing" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /הסקה סטטיסטית/ }));
    expect(screen.getByRole('link', { name: /בדיקת השערות/ })).toBeInTheDocument();
    expect(screen.getByText('כלי לבדיקת טענות על ממוצע האוכלוסייה.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: /בדיקת השערות/ }));
    expect(onNavigate).toHaveBeenCalledWith('hypothesis');
  });

  it('closes the open menu with Escape', () => {
    render(<SiteHeader activePage="landing" onNavigate={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /כלי עזר/ }));
    expect(screen.getByRole('link', { name: /טבלאות התפלגות/ })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('link', { name: /טבלאות התפלגות/ })).not.toBeInTheDocument();
  });

  it('keeps every destination available from the mobile navigation', () => {
    render(<SiteHeader activePage="landing" onNavigate={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'פתיחת תפריט ניווט' }));
    expect(screen.getByRole('link', { name: /הסתברויות/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /מבחן 2023/ })).toBeInTheDocument();
  });

  it('home button calls onNavigate with landing', () => {
    const onNavigate = vi.fn();
    render(<SiteHeader activePage="forward" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByLabelText('חזרה לדף הבית'));
    expect(onNavigate).toHaveBeenCalledWith('landing');
  });

  it('brand button calls onNavigate with landing', () => {
    const onNavigate = vi.fn();
    render(<SiteHeader activePage="hypothesis" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByLabelText('סטטיסטי־קל'));
    expect(onNavigate).toHaveBeenCalledWith('landing');
  });

  it('marks home as current when activePage is landing', () => {
    render(<SiteHeader activePage="landing" onNavigate={vi.fn()} />);

    expect(screen.getByLabelText('חזרה לדף הבית')).toHaveAttribute('aria-current', 'page');
  });

  it('switching category replaces content in the viewport', () => {
    render(<SiteHeader activePage="landing" onNavigate={vi.fn()} />);

    // Open calculators
    fireEvent.click(screen.getByRole('button', { name: /מחשבונים/ }));
    expect(screen.getByRole('link', { name: /הסתברויות/ })).toBeInTheDocument();

    // Switch to inference
    fireEvent.click(screen.getByRole('button', { name: /הסקה סטטיסטית/ }));
    expect(screen.getByRole('link', { name: /בדיקת השערות/ })).toBeInTheDocument();
    // Calculators content should be gone
    expect(screen.queryByRole('link', { name: /הסתברויות/ })).not.toBeInTheDocument();
  });

  it('preserves tour-nav-* selectors on desktop menu links', () => {
    render(<SiteHeader activePage="landing" onNavigate={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /הסקה סטטיסטית/ }));
    const hypothesisLink = screen.getByRole('link', { name: /בדיקת השערות/ });
    expect(hypothesisLink.closest('.tour-nav-hypothesis')).toBeInTheDocument();
  });

  it('preserves tour-nav-* selectors on mobile navigation links', () => {
    render(<SiteHeader activePage="landing" onNavigate={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'פתיחת תפריט ניווט' }));
    const forwardLink = screen.getByRole('link', { name: /הסתברויות/ });
    expect(forwardLink.classList.toString()).toContain('tour-nav-forward');
  });

  it('renders all 10 SitePage destinations from mobile navigation', () => {
    render(<SiteHeader activePage="landing" onNavigate={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'פתיחת תפריט ניווט' }));

    const expectedPages = [
      'הסתברויות',      // forward
      'אחוזונים',       // inverse
      'בדיקת השערות',   // hypothesis
      'אמידה נקודתית',  // point-estimation
      'רגרסיה',         // regression
      'טבלאות התפלגות', // table
      'דף נוסחאות',     // formula-sheet
      'סיכום',          // summary
      'בחן את עצמך',    // test-yourself
      'מבחן 2023',      // exam-2023
    ];

    for (const label of expectedPages) {
      expect(screen.getByRole('link', { name: new RegExp(label) })).toBeInTheDocument();
    }
  });

  it('destination click calls onNavigate exactly once', () => {
    const onNavigate = vi.fn();
    render(<SiteHeader activePage="landing" onNavigate={onNavigate} />);

    // Open resources category
    fireEvent.click(screen.getByRole('button', { name: /כלי עזר/ }));

    // Click formula-sheet destination
    fireEvent.click(screen.getByRole('link', { name: /דף נוסחאות/ }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith('formula-sheet');
  });

  it('marks the active page item in mobile navigation', () => {
    render(<SiteHeader activePage="regression" onNavigate={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'פתיחת תפריט ניווט' }));

    const regressionLink = screen.getByRole('link', { name: /רגרסיה/ });
    expect(regressionLink).toHaveAttribute('aria-current', 'page');
  });
});
