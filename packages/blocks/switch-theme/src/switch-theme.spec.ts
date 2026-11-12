import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxThemeMode, TxThemeService } from '@tectra-ng/core/config';
import { TxSwitchTheme } from './switch-theme.component';
import { TxThemeReveal } from './theme-reveal.directive';

@Component({
  imports: [TxSwitchTheme, TxThemeReveal],
  template: `
    <tx-switch-theme [dt]="{ root: { size: '40px' } }" [pt]="{ button: { class: 'own' } }" (modeChange)="modes.push($event)" />
    <button type="button" class="own-reveal" txThemeReveal (themeChange)="reveals = reveals + 1">Theme</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly modes: TxThemeMode[] = [];
  reveals = 0;
}

describe('TxSwitchTheme', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-tx-theme');
    document.documentElement.classList.remove('tx-theme-reveal');
  });

  it('toggles the theme mode, swaps the icons and the label', async () => {
    const fixture = TestBed.createComponent(Host);
    const theme = TestBed.inject(TxThemeService);
    theme.setMode('light');
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-switch-theme') as HTMLElement;
    const button = root.querySelector('button') as HTMLButtonElement;
    expect(root.style.getPropertyValue('--tx-switch-theme-size')).toBe('40px');
    expect(button.classList).toContain('own');
    expect(button.getAttribute('aria-label')).toBe('Switch to dark theme');
    expect(root.querySelector('.tx-switch-theme__icon--moon')?.classList).toContain('tx-switch-theme__icon--hidden');

    button.click();
    await fixture.whenStable();
    expect(theme.mode()).toBe('dark');
    expect(document.documentElement.getAttribute('data-tx-theme')).toBe('dark');
    expect(fixture.componentInstance.modes).toEqual(['dark']);
    expect(button.getAttribute('aria-label')).toBe('Switch to light theme');
    expect(root.getAttribute('data-mode')).toBe('dark');
    expect(root.querySelector('.tx-switch-theme__icon--sun')?.classList).toContain('tx-switch-theme__icon--hidden');
    expect(root.querySelector('.tx-switch-theme__icon--moon')?.classList).not.toContain('tx-switch-theme__icon--hidden');
  });

  it('runs the change inside a view transition when the browser has one', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const animate = vi.fn();
    const root = document.documentElement as HTMLElement & { animate: typeof animate };
    const originalAnimate = root.animate;
    root.animate = animate;
    const start = vi.fn((update: () => void) => {
      update();
      return { ready: Promise.resolve(), finished: Promise.resolve(), updateCallbackDone: Promise.resolve(), skipTransition: vi.fn() };
    });
    const original = document.startViewTransition;
    document.startViewTransition = start as unknown as Document['startViewTransition'];
    const button = fixture.nativeElement.querySelector('.own-reveal') as HTMLButtonElement;
    button.dispatchEvent(new MouseEvent('click', { clientX: 40, clientY: 30, bubbles: true }));
    expect(start).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.reveals).toBe(1);
    expect(document.documentElement.classList).toContain('tx-theme-reveal');
    await Promise.resolve();
    await Promise.resolve();
    expect(animate).toHaveBeenCalledWith(
      expect.objectContaining({ clipPath: [expect.stringContaining('circle(0px at 40px 30px)'), expect.stringContaining('at 40px 30px')] }),
      expect.objectContaining({ duration: 550, pseudoElement: '::view-transition-new(root)' }),
    );
    await new Promise((resolve) => setTimeout(resolve));
    expect(document.documentElement.classList).not.toContain('tx-theme-reveal');
    document.startViewTransition = original;
    root.animate = originalAnimate;
  });

  it('starts the reveal from the middle of the button after a keyboard click', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const animate = vi.fn();
    const root = document.documentElement as HTMLElement & { animate: typeof animate };
    const originalAnimate = root.animate;
    root.animate = animate;
    const original = document.startViewTransition;
    document.startViewTransition = ((update: () => void) => {
      update();
      return { ready: Promise.resolve(), finished: Promise.resolve(), updateCallbackDone: Promise.resolve(), skipTransition: vi.fn() };
    }) as unknown as Document['startViewTransition'];
    try {
      const button = fixture.nativeElement.querySelector('.own-reveal') as HTMLButtonElement;
      vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 20, width: 40, height: 20 } as DOMRect);
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(fixture.componentInstance.reveals).toBe(1);
      await Promise.resolve();
      await Promise.resolve();
      expect(animate).toHaveBeenCalledWith(
        expect.objectContaining({ clipPath: [expect.stringContaining('circle(0px at 120px 30px)'), expect.stringContaining('at 120px 30px')] }),
        expect.anything(),
      );
      await new Promise((resolve) => setTimeout(resolve));
    } finally {
      document.startViewTransition = original;
      root.animate = originalAnimate;
      vi.restoreAllMocks();
    }
  });
});
