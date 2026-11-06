import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTectra } from '@tectra-ng/core/config';
import { InkPreset } from '@tectra-ng/themes';
import { TxRipple } from './ripple.directive';

@Component({
  imports: [TxRipple],
  template: `<button txRipple>Press</button><button txRipple [ripple]="false">Off</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {}

describe('TxRipple', () => {
  let resolveEnter: () => void;

  const tick = () => new Promise((resolve) => setTimeout(resolve));

  beforeEach(() => {
    window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList);
    HTMLElement.prototype.animate = vi.fn(() => {
      const finished = new Promise<void>((resolve) => (resolveEnter = resolve));
      return { finished } as unknown as Animation;
    });
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: InkPreset, ripple: true })] });
  });

  function press(button: HTMLElement): void {
    button.dispatchEvent(new MouseEvent('pointerdown', { button: 0, clientX: 5, clientY: 5 }));
  }

  it('adds a wave on press and removes it after release', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLElement;
    expect(button.classList).toContain('tx-ripple-host');
    press(button);
    expect(button.querySelectorAll('.tx-ripple').length).toBe(1);
    button.dispatchEvent(new MouseEvent('pointerup'));
    resolveEnter();
    await tick();
    resolveEnter();
    await tick();
    expect(button.querySelectorAll('.tx-ripple').length).toBe(0);
  });

  it('does nothing when switched off', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelectorAll('button')[1] as HTMLElement;
    press(button);
    expect(button.querySelector('.tx-ripple')).toBeNull();
    expect(button.classList).not.toContain('tx-ripple-host');
  });

  it('spreads the wave over the border so the whole button tints', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLElement;
    button.style.border = '2px solid black';
    press(button);
    const container = button.querySelector('.tx-ripple-container') as HTMLElement;
    expect([container.style.top, container.style.right, container.style.bottom, container.style.left]).toEqual(['-2px', '-2px', '-2px', '-2px']);
  });
});
