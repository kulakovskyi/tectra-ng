import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxThemeService, provideTectra } from '@tectra-ng/core/config';
import { Tectra } from '@tectra-ng/themes';
import { TxRipple } from './ripple.directive';

@Component({
  imports: [TxRipple],
  template: `<button txRipple>Press</button><button txRipple [ripple]="false">Off</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {}

@Component({
  imports: [TxRipple],
  template: `
    <button txRipple [rippleCentered]="centered()" rippleColor="red">Press</button>
    <button txRipple disabled>Disabled</button>
    <button txRipple rippleDisabled>Off</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class KeyboardHost {
  readonly centered = signal(false);
}

interface RecordedAnimation {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  finish: () => void;
  cancel: () => void;
}

describe('TxRipple', () => {
  let resolveEnter: () => void;

  const tick = () => new Promise((resolve) => setTimeout(resolve));

  beforeEach(() => {
    window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList);
    HTMLElement.prototype.animate = vi.fn(() => {
      const finished = new Promise<void>((resolve) => (resolveEnter = resolve));
      return { finished } as unknown as Animation;
    });
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: Tectra, ripple: true })] });
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

  it('follows the global switch at runtime', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLElement;
    TestBed.inject(TxThemeService).setRipple(false);
    await fixture.whenStable();
    expect(button.classList).not.toContain('tx-ripple-host');
    press(button);
    expect(button.querySelector('.tx-ripple')).toBeNull();
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

describe('TxRipple waves', () => {
  let animations: RecordedAnimation[];

  const tick = () => new Promise((resolve) => setTimeout(resolve));

  beforeEach(() => {
    animations = [];
    window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList);
    HTMLElement.prototype.animate = vi.fn((keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
      let finish = () => undefined as void;
      let cancel = () => undefined as void;
      const finished = new Promise<void>((resolve, reject) => {
        finish = resolve;
        cancel = () => reject(new Error('cancelled'));
      });
      animations.push({ keyframes, options, finish, cancel });
      return { finished } as unknown as Animation;
    }) as unknown as HTMLElement['animate'];
    TestBed.configureTestingModule({ providers: [provideTectra({ preset: Tectra, ripple: true })] });
  });

  function setup() {
    const fixture = TestBed.createComponent(KeyboardHost);
    fixture.detectChanges();
    const [button, disabled, off] = [...fixture.nativeElement.querySelectorAll('button')] as HTMLElement[];
    return { fixture, button, disabled, off };
  }

  const waves = (button: HTMLElement) => button.querySelectorAll('.tx-ripple').length;

  it('starts a centered wave on Enter and Space and ends it on key up only', async () => {
    const { button } = setup();
    expect(button.style.getPropertyValue('--tx-ripple-color')).toBe('red');
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', repeat: true }));
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(waves(button)).toBe(1);
    expect(animations[0].options.duration).toBe(450 * 0.8);

    animations[0].finish();
    await tick();
    button.dispatchEvent(new MouseEvent('pointerup'));
    button.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
    expect(animations).toHaveLength(1);

    button.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    expect(animations).toHaveLength(2);
    expect(animations[1].keyframes.at(-1)).toEqual({ opacity: 0 });
    animations[1].finish();
    await tick();
    expect(waves(button)).toBe(0);
  });

  it('releases a wave once and fades it out after it entered', async () => {
    const { button } = setup();
    button.dispatchEvent(new MouseEvent('pointerdown', { button: 0, clientX: 2, clientY: 2 }));
    button.dispatchEvent(new MouseEvent('pointerdown', { button: 2 }));
    expect(waves(button)).toBe(1);
    button.dispatchEvent(new MouseEvent('pointerup'));
    button.dispatchEvent(new MouseEvent('pointerleave'));
    animations[0].finish();
    await tick();
    expect(animations).toHaveLength(2);
    animations[1].cancel();
    await tick();
    expect(waves(button)).toBe(0);
  });

  it('removes the wave on blur and when its entrance is cancelled', async () => {
    const { button } = setup();
    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    animations[0].finish();
    await tick();
    button.dispatchEvent(new FocusEvent('blur'));
    animations[1].finish();
    await tick();
    expect(waves(button)).toBe(0);

    button.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }));
    animations[2].cancel();
    await tick();
    expect(waves(button)).toBe(0);
  });

  it('reads durations and easing from CSS and centers when asked', async () => {
    const { fixture, button } = setup();
    fixture.componentInstance.centered.set(true);
    await fixture.whenStable();
    button.style.setProperty('--tx-ripple-enter-duration', '0.5s');
    button.style.setProperty('--tx-ripple-exit-duration', '200ms');
    button.style.setProperty('--tx-ripple-easing', 'linear');
    button.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }));
    expect(animations[0].options).toEqual({ duration: 400, easing: 'linear', fill: 'forwards' });
    button.dispatchEvent(new MouseEvent('pointerup'));
    animations[0].finish();
    await tick();
    expect(animations[1].options.duration).toBe(200);
  });

  it('only fades in when reduced motion is asked for', () => {
    window.matchMedia = vi.fn(() => ({ matches: true }) as MediaQueryList);
    const { button } = setup();
    button.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }));
    expect(animations[0].keyframes).toEqual([{ transform: 'scale(1)', opacity: 0 }, { transform: 'scale(1)' }]);
  });

  it('puts the container back when it was taken out of the host', () => {
    const { button } = setup();
    button.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }));
    button.querySelector('.tx-ripple-container')?.remove();
    button.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }));
    expect(button.querySelectorAll('.tx-ripple-container')).toHaveLength(1);
  });

  it('skips disabled hosts and hosts that cannot animate', () => {
    const { button, disabled, off } = setup();
    disabled.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }));
    off.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }));
    expect(waves(disabled) + waves(off)).toBe(0);
    Object.defineProperty(button, 'animate', { value: undefined });
    button.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }));
    expect(waves(button)).toBe(0);
  });
});
