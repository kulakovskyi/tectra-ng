import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxHoverEffect } from './hover-effect.component';

@Component({
  imports: [TxHoverEffect],
  template: `<tx-hover-effect [constrain]="50" [disabled]="disabled()"><div class="card">Card</div></tx-hover-effect>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly disabled = signal(false);
}

function move(element: HTMLElement, x: number, y: number, pointerType = 'mouse'): void {
  const event = new MouseEvent('pointermove', { clientX: x, clientY: y, bubbles: true });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  element.dispatchEvent(event);
}

describe('TxHoverEffect', () => {
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 1;
    });
  });
  afterEach(() => vi.restoreAllMocks());

  async function setup(disabled = false) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.disabled.set(disabled);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-hover-effect') as HTMLElement;
    const layer = root.querySelector('.tx-hover-effect__layer') as HTMLElement;
    vi.spyOn(layer, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, width: 200, height: 100, top: 0, left: 0, right: 200, bottom: 100, toJSON: () => ({}) } as DOMRect);
    return { fixture, root, layer };
  }

  it('tilts the layer towards the pointer and settles back when it leaves', async () => {
    const { fixture, root, layer } = await setup();
    expect(layer.querySelector('.card')?.textContent).toBe('Card');
    expect(layer.classList).toContain('tx-hover-effect__layer--resting');
    move(root, 200, 0);
    await fixture.whenStable();
    expect(layer.style.getPropertyValue('--tx-hover-effect-x')).toBe('1deg');
    expect(layer.style.getPropertyValue('--tx-hover-effect-y')).toBe('2deg');
    expect(layer.classList).not.toContain('tx-hover-effect__layer--resting');
    root.dispatchEvent(new MouseEvent('pointerleave'));
    await fixture.whenStable();
    expect(layer.style.getPropertyValue('--tx-hover-effect-x')).toBe('0deg');
    expect(layer.classList).toContain('tx-hover-effect__layer--resting');
  });

  it('ignores touch and does nothing while disabled', async () => {
    const { fixture, root, layer } = await setup();
    move(root, 200, 0, 'touch');
    await fixture.whenStable();
    expect(layer.style.getPropertyValue('--tx-hover-effect-y')).toBe('0deg');
    const off = await setup(true);
    move(off.root, 200, 0);
    await off.fixture.whenStable();
    expect(off.layer.style.getPropertyValue('--tx-hover-effect-y')).toBe('0deg');
  });
});
