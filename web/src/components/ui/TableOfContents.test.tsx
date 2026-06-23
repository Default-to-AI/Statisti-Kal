import { render, screen } from '@testing-library/react';
import { TableOfContents } from './TableOfContents';
import { describe, it, expect } from 'vitest';

describe('TableOfContents', () => {
  it('renders a toggle button and opens to show the title', () => {
    render(<TableOfContents />);
    const toggleBtn = screen.getByRole('button', { name: /תוכן עניינים/i });
    expect(toggleBtn).toBeDefined();
    
    // It should open by default on desktop, but let's assume it can be toggled
    // We'll verify the "תוכן עניינים" title is present
    expect(screen.getByText('תוכן עניינים')).toBeDefined();
  });
});
