import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useState, type ReactElement } from 'react';
import { Menu, MenuContent, MenuItem, MenuLink, MenuTrigger } from './navbar-menu';

afterEach(cleanup);

beforeEach(() => {
  class ResizeObserverMock {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }

  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
});

/** Minimal harness matching the SiteHeader usage pattern. */
function TestMenu({ onNavigate = vi.fn() }: { onNavigate?: (id: string) => void }): ReactElement {
  const [active, setActive] = useState<string | null>(null);

  return (
    <Menu active={active} setActive={setActive} label="ניווט ראשי">
      <MenuItem value="group-a">
        <MenuTrigger current>קבוצה א</MenuTrigger>
        <MenuContent>
          <div className="grid grid-cols-2 gap-1" role="group" aria-label="קבוצה א">
            <MenuLink href="#item-1" onClick={() => { setActive(null); onNavigate('item-1'); }} current>
              פריט 1
            </MenuLink>
            <MenuLink href="#item-2" onClick={() => { setActive(null); onNavigate('item-2'); }}>
              פריט 2
            </MenuLink>
          </div>
        </MenuContent>
      </MenuItem>
      <MenuItem value="group-b">
        <MenuTrigger>קבוצה ב</MenuTrigger>
        <MenuContent>
          <div className="grid grid-cols-2 gap-1" role="group" aria-label="קבוצה ב">
            <MenuLink href="#item-3" onClick={() => { setActive(null); onNavigate('item-3'); }}>
              פריט 3
            </MenuLink>
          </div>
        </MenuContent>
      </MenuItem>
    </Menu>
  );
}

describe('navbar-menu primitive', () => {
  it('renders an RTL horizontal list with a shared viewport', () => {
    render(<TestMenu />);

    const nav = screen.getByRole('navigation', { name: 'ניווט ראשי' });
    expect(nav).toBeInTheDocument();
    expect(nav.getAttribute('dir')).toBe('rtl');

    // Two triggers are visible
    expect(screen.getByRole('button', { name: /קבוצה א/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /קבוצה ב/ })).toBeInTheDocument();
  });

  it('opens a trigger on click and sets expanded state', () => {
    render(<TestMenu />);

    const trigger = screen.getByRole('button', { name: /קבוצה א/ });
    fireEvent.click(trigger);

    expect(screen.getByRole('link', { name: /פריט 1/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /פריט 2/ })).toBeInTheDocument();
  });

  it('switches triggers while retaining the viewport container', () => {
    render(<TestMenu />);

    // Open group A
    fireEvent.click(screen.getByRole('button', { name: /קבוצה א/ }));
    expect(screen.getByRole('link', { name: /פריט 1/ })).toBeInTheDocument();

    // Switch to group B
    fireEvent.click(screen.getByRole('button', { name: /קבוצה ב/ }));
    expect(screen.getByRole('link', { name: /פריט 3/ })).toBeInTheDocument();
    // Group A content should be replaced
    expect(screen.queryByRole('link', { name: /פריט 1/ })).not.toBeInTheDocument();
  });

  it('closes content on Escape', () => {
    render(<TestMenu />);

    fireEvent.click(screen.getByRole('button', { name: /קבוצה א/ }));
    expect(screen.getByRole('link', { name: /פריט 1/ })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('link', { name: /פריט 1/ })).not.toBeInTheDocument();
  });

  it('marks the current trigger with aria-current', () => {
    render(<TestMenu />);

    const currentTrigger = screen.getByRole('button', { name: /קבוצה א/ });
    expect(currentTrigger).toHaveAttribute('aria-current', 'page');

    const otherTrigger = screen.getByRole('button', { name: /קבוצה ב/ });
    expect(otherTrigger).not.toHaveAttribute('aria-current');
  });
});
