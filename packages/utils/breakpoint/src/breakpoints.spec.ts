import { TestBed } from '@angular/core/testing';
import { TxBreakpoints } from './breakpoints';

describe('TxBreakpoints', () => {
  const listeners = new Map<string, (event: { matches: boolean }) => void>();

  beforeEach(() => {
    listeners.clear();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(max-width: 768px)',
      addEventListener: (_: string, listener: (event: { matches: boolean }) => void) => listeners.set(query, listener),
      removeEventListener: vi.fn(),
    }));
  });

  it('follows the mobile and tablet breakpoints', () => {
    const breakpoints = TestBed.inject(TxBreakpoints);
    expect(breakpoints.isMobile()).toBe(false);
    expect(breakpoints.isTablet()).toBe(true);
    listeners.get('(max-width: 640px)')?.({ matches: true });
    expect(breakpoints.isMobile()).toBe(true);
  });

  it('shares one signal per query', () => {
    const breakpoints = TestBed.inject(TxBreakpoints);
    expect(breakpoints.matches('(prefers-reduced-motion: reduce)')).toBe(breakpoints.matches('(prefers-reduced-motion: reduce)'));
  });
});
