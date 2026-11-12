import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxScrollPanel } from './scroll-panel.component';

@Component({
  imports: [TxScrollPanel],
  template: `
    <tx-scroll-panel
      [step]="20"
      ariaLabel="Release notes"
      [dt]="{ bar: { size: '6px' } }"
      [pt]="{ content: { class: 'own-content' }, barY: { class: 'own-bar' } }"
    >
      <p class="text">Long text</p>
    </tx-scroll-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly panel = viewChild.required(TxScrollPanel);
}

@Component({
  imports: [TxScrollPanel],
  template: `<tx-scroll-panel unstyled><span>Short</span></tx-scroll-panel>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainHost {}

interface Box {
  top: number;
  left: number;
}

function fakeScrollBox(element: HTMLElement, size: { scrollWidth: number; scrollHeight: number; clientWidth: number; clientHeight: number }): Box {
  const box: Box = { top: 0, left: 0 };
  for (const [name, value] of Object.entries(size)) {
    Object.defineProperty(element, name, { configurable: true, get: () => value });
  }
  Object.defineProperty(element, 'scrollTop', { configurable: true, get: () => box.top, set: (value: number) => (box.top = value) });
  Object.defineProperty(element, 'scrollLeft', { configurable: true, get: () => box.left, set: (value: number) => (box.left = value) });
  return box;
}

function pointer(type: string, clientX: number, clientY: number, button = 0): Event {
  return new MouseEvent(type, { bubbles: true, clientX, clientY, button });
}

describe('TxScrollPanel', () => {
  let fixture: ComponentFixture<Host>;
  let box: Box;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    box = fakeScrollBox(el('.tx-scroll-panel__content'), { scrollWidth: 100, scrollHeight: 400, clientWidth: 100, clientHeight: 100 });
    fixture.componentInstance.panel().refresh();
    await fixture.whenStable();
  });

  it('projects the content into a focusable, named region with the parts', () => {
    const content = el('.tx-scroll-panel__content');
    expect(el('.text').closest('.tx-scroll-panel__content')).toBe(content);
    expect(content.getAttribute('tabindex')).toBe('0');
    expect(content.getAttribute('role')).toBe('region');
    expect(content.getAttribute('aria-label')).toBe('Release notes');
    expect(content.classList).toContain('own-content');
    expect(el('.tx-scroll-panel__bar--y').classList).toContain('own-bar');
    expect(el('tx-scroll-panel').style.getPropertyValue('--tx-scroll-panel-bar-size')).toBe('6px');
  });

  it('shows only the bar of the overflowing axis, sized from the content', () => {
    const barY = el('.tx-scroll-panel__bar--y');
    expect(el('.tx-scroll-panel__bar--x').hidden).toBe(true);
    expect(barY.hidden).toBe(false);
    expect(barY.style.height).toBe('25px');
    expect(barY.style.top).toBe('0px');
    expect(barY.getAttribute('role')).toBe('scrollbar');
    expect(barY.getAttribute('aria-orientation')).toBe('vertical');
    expect(barY.getAttribute('aria-controls')).toBe(el('.tx-scroll-panel__content').id);
    expect(barY.getAttribute('aria-valuenow')).toBe('0');
  });

  it('moves the bar on scroll and scrollTop()', async () => {
    box.top = 150;
    el('.tx-scroll-panel__content').dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(el('.tx-scroll-panel__bar--y').style.top).toBe('37.5px');
    expect(el('.tx-scroll-panel__bar--y').getAttribute('aria-valuenow')).toBe('50');
    fixture.componentInstance.panel().scrollTop(1000);
    await fixture.whenStable();
    expect(box.top).toBe(300);
    expect(el('.tx-scroll-panel__bar--y').style.top).toBe('75px');
  });

  it('drags the content with the bar', async () => {
    const bar = el('.tx-scroll-panel__bar--y');
    bar.dispatchEvent(pointer('pointerdown', 0, 0));
    await fixture.whenStable();
    expect(el('tx-scroll-panel').getAttribute('data-grabbed')).toBe('y');
    bar.dispatchEvent(pointer('pointermove', 0, 30));
    expect(box.top).toBe(120);
    bar.dispatchEvent(pointer('pointerup', 0, 30));
    await fixture.whenStable();
    expect(el('tx-scroll-panel').hasAttribute('data-grabbed')).toBe(false);
  });

  it('scrolls with the bar keys', () => {
    const bar = el('.tx-scroll-panel__bar--y');
    const press = (key: string) => bar.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    press('ArrowDown');
    expect(box.top).toBe(20);
    press('PageDown');
    expect(box.top).toBe(120);
    press('End');
    expect(box.top).toBe(300);
    press('ArrowUp');
    expect(box.top).toBe(280);
    press('Home');
    expect(box.top).toBe(0);
  });

  it('shows the horizontal bar for wide content', async () => {
    fakeScrollBox(el('.tx-scroll-panel__content'), { scrollWidth: 200, scrollHeight: 100, clientWidth: 100, clientHeight: 100 });
    fixture.componentInstance.panel().scrollLeft(50);
    await fixture.whenStable();
    const barX = el('.tx-scroll-panel__bar--x');
    expect(barX.hidden).toBe(false);
    expect(el('.tx-scroll-panel__bar--y').hidden).toBe(true);
    expect(barX.style.width).toBe('50px');
    expect(barX.style.insetInlineStart).toBe('25px');
  });
});

describe('TxScrollPanel unstyled', () => {
  it('keeps the behaviour without the styles', async () => {
    const fixture = TestBed.createComponent(PlainHost);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('tx-scroll-panel') as HTMLElement;
    expect(host.hasAttribute('data-styled')).toBe(false);
    expect(host.querySelector('.tx-scroll-panel__content')?.hasAttribute('role')).toBe(false);
    expect((host.querySelector('.tx-scroll-panel__bar--y') as HTMLElement).hidden).toBe(true);
  });
});

class FakeResizeObserver {
  static readonly all: FakeResizeObserver[] = [];
  readonly observed: Element[] = [];
  disconnected = false;

  constructor(readonly callback: () => void) {
    FakeResizeObserver.all.push(this);
  }

  observe(element: Element): void {
    this.observed.push(element);
  }

  disconnect(): void {
    this.disconnected = true;
  }
}

describe('TxScrollPanel on both axes', () => {
  let fixture: ComponentFixture<Host>;
  let box: Box;
  let direction = 'ltr';
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const press = (target: HTMLElement, key: string) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
  };

  beforeEach(async () => {
    direction = 'ltr';
    FakeResizeObserver.all.length = 0;
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () => ({ direction, getPropertyValue: (name: string) => (name === '--tx-scroll-panel-bar-size' ? '6px' : '') }) as CSSStyleDeclaration,
    );
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    box = fakeScrollBox(el('.tx-scroll-panel__content'), { scrollWidth: 200, scrollHeight: 400, clientWidth: 100, clientHeight: 100 });
    FakeResizeObserver.all[0].callback();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('refreshes on resize and leaves room for the other bar', () => {
    const observer = FakeResizeObserver.all[0];
    expect(observer.observed).toEqual([el('.tx-scroll-panel__content'), el('.tx-scroll-panel__inner')]);
    expect(el('.tx-scroll-panel__bar--x').style.width).toBe('47px');
    expect(el('.tx-scroll-panel__bar--y').style.height).toBe('23.5px');
    fixture.destroy();
    expect(observer.disconnected).toBe(true);
  });

  it('drags and keys the horizontal bar', async () => {
    const bar = el('.tx-scroll-panel__bar--x');
    bar.setPointerCapture = vi.fn();
    bar.hasPointerCapture = vi.fn(() => true);
    bar.releasePointerCapture = vi.fn();
    bar.dispatchEvent(pointer('pointerdown', 0, 0));
    await fixture.whenStable();
    expect(bar.getAttribute('data-grabbed')).toBe('true');
    expect(bar.setPointerCapture).toHaveBeenCalled();
    bar.dispatchEvent(pointer('pointermove', 10, 0));
    expect(box.left).toBeCloseTo(21.28, 1);
    bar.dispatchEvent(pointer('pointerup', 10, 0));
    expect(bar.releasePointerCapture).toHaveBeenCalled();
    bar.dispatchEvent(pointer('pointermove', 40, 0));
    bar.dispatchEvent(pointer('pointerup', 40, 0));
    expect(box.left).toBeCloseTo(21.28, 1);
    box.left = 0;
    expect(press(bar, 'ArrowRight').defaultPrevented).toBe(true);
    expect(box.left).toBe(20);
    expect(press(bar, 'PageDown').defaultPrevented).toBe(true);
    expect(box.left).toBe(100);
    expect(press(bar, 'Enter').defaultPrevented).toBe(false);
    expect(box.left).toBe(100);
  });

  it('ignores grabs with other mouse buttons', async () => {
    const bar = el('.tx-scroll-panel__bar--y');
    bar.dispatchEvent(pointer('pointerdown', 0, 0, 2));
    await fixture.whenStable();
    expect(el('tx-scroll-panel').hasAttribute('data-grabbed')).toBe(false);
    bar.dispatchEvent(pointer('pointermove', 0, 50));
    expect(box.top).toBe(0);
  });

  it('mirrors the horizontal bar in right-to-left', async () => {
    direction = 'rtl';
    fixture.componentInstance.panel().scrollLeft(30);
    expect(box.left).toBe(-30);
    const bar = el('.tx-scroll-panel__bar--x');
    press(bar, 'ArrowLeft');
    expect(box.left).toBe(-50);
    press(bar, 'ArrowRight');
    expect(box.left).toBe(-30);
    bar.dispatchEvent(pointer('pointerdown', 50, 0));
    bar.dispatchEvent(pointer('pointermove', 40, 0));
    expect(box.left).toBeCloseTo(-51.28, 1);
    bar.dispatchEvent(pointer('pointerup', 40, 0));
    await fixture.whenStable();
    expect(el('tx-scroll-panel').hasAttribute('data-grabbed')).toBe(false);
  });
});
