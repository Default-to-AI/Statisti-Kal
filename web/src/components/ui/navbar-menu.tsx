import type { ReactElement, ReactNode } from 'react';
import { useEffect } from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';

interface MenuProps {
  active: string | null;
  setActive: (item: string | null) => void;
  children: ReactNode;
  label: string;
}

interface MenuItemProps {
  value: string;
  children: ReactNode;
}

interface MenuTriggerProps {
  children: ReactNode;
  className?: string;
  current?: boolean;
}

interface MenuContentProps {
  children: ReactNode;
}

interface MenuLinkProps {
  children: ReactNode;
  className?: string;
  href: string;
  onClick: () => void;
  current?: boolean;
}

/**
 * Shared accessible desktop menu with a single centered viewport.
 */
export function Menu({ active, setActive, children, label }: MenuProps): ReactElement {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setActive(null);
      }
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [setActive]);

  return (
    <NavigationMenuPrimitive.Root
      value={active ?? ''}
      onValueChange={(value) => setActive(value || null)}
      delayDuration={80}
      skipDelayDuration={120}
      dir="rtl"
      className="relative flex min-w-0 flex-1 justify-center"
      aria-label={label}
    >
      <NavigationMenuPrimitive.List className="flex min-w-0 items-center justify-center gap-1" aria-label={label}>
        {children}
      </NavigationMenuPrimitive.List>
      <div className="mega-menu-wrapper absolute top-full left-1/2 z-50 flex w-[min(44rem,calc(100vw_-_2rem))] -translate-x-1/2 justify-center pt-2">
        <NavigationMenuPrimitive.Viewport
          className="mega-menu-viewport pointer-events-auto h-[var(--radix-navigation-menu-viewport-height)] w-full origin-top overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]/98 p-2 shadow-[var(--shadow-elevated)] backdrop-blur-lg transition-[width,height] duration-200 motion-reduce:transition-none"
          data-menu-viewport=""
        />
      </div>
    </NavigationMenuPrimitive.Root>
  );
}

export function MenuItem({ value, children }: MenuItemProps): ReactElement {
  return <NavigationMenuPrimitive.Item value={value}>{children}</NavigationMenuPrimitive.Item>;
}

export function MenuTrigger({ children, className = '', current = false }: MenuTriggerProps): ReactElement {
  return (
    <NavigationMenuPrimitive.Trigger aria-current={current ? 'page' : undefined} className={`group relative flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-accent-brass)] ${className}`}>
      {children}
    </NavigationMenuPrimitive.Trigger>
  );
}

export function MenuContent({ children }: MenuContentProps): ReactElement {
  return (
    <NavigationMenuPrimitive.Content
      className="mega-menu-content w-full"
    >
      {children}
    </NavigationMenuPrimitive.Content>
  );
}

export function MenuLink({ children, className = '', href, onClick, current = false }: MenuLinkProps): ReactElement {
  return (
    <NavigationMenuPrimitive.Link asChild active={current}>
      <a
        href={href}
        onClick={(event) => {
          event.preventDefault();
          onClick();
        }}
        aria-current={current ? 'page' : undefined}
        className={`group flex cursor-pointer items-start gap-3 rounded-lg p-3 text-right outline-none transition hover:bg-[var(--color-surface-elevated)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-brass)] ${className}`}
      >
        {children}
      </a>
    </NavigationMenuPrimitive.Link>
  );
}
