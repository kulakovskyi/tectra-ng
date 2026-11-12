import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxSplitterPanel } from './splitter-panel.component';
import { TxSplitter } from './splitter.component';
import { moveGutter } from './splitter.resize';
import { TxSplitterCollapseEvent, TxSplitterLayout, TxSplitterResizeEvent } from './splitter.types';

@Component({
  imports: [TxSplitter, TxSplitterPanel],
  template: `
    <tx-splitter
      id="split"
      [layout]="layout()"
      [disabled]="disabled()"
      [gutterSize]="8"
      [step]="10"
      [dt]="{ gutter: { background: 'red' } }"
      [pt]="{ panel: { class: 'own-panel' }, handle: { class: 'own-handle' } }"
      (resizeStart)="starts.push($event)"
      (resizing)="moves.push($event)"
      (resizeEnd)="ends.push($event)"
      (collapsedChange)="collapses.push($event)"
    >
      <tx-splitter-panel [size]="30" [minSize]="10" collapsible><span class="first">First</span></tx-splitter-panel>
      <tx-splitter-panel [size]="70" [minSize]="20"><span class="second">Second</span></tx-splitter-panel>
    </tx-splitter>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly splitter = viewChild.required(TxSplitter);
  readonly layout = signal<TxSplitterLayout>('horizontal');
  readonly disabled = signal(false);
  readonly starts: TxSplitterResizeEvent[] = [];
  readonly moves: TxSplitterResizeEvent[] = [];
  readonly ends: TxSplitterResizeEvent[] = [];
  readonly collapses: TxSplitterCollapseEvent[] = [];
}

@Component({
  imports: [TxSplitter, TxSplitterPanel],
  template: `
    <tx-splitter #outer id="outer" stateKey="tx-spec-split" stateStorage="local" [panelSizes]="[25, 75]" [minSizes]="[5, 5]" unstyled>
      <tx-splitter-panel>Left</tx-splitter-panel>
      <tx-splitter-panel>
        <tx-splitter id="inner" layout="vertical">
          <tx-splitter-panel>Top</tx-splitter-panel>
          <tx-splitter-panel>Middle</tx-splitter-panel>
          <tx-splitter-panel>Bottom</tx-splitter-panel>
        </tx-splitter>
      </tx-splitter-panel>
    </tx-splitter>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class NestedHost {
  readonly outer = viewChild.required<TxSplitter>('outer');
}

const limits = [
  { minSize: 10, maxSize: 100, collapsible: true, collapsedSize: 0 },
  { minSize: 20, maxSize: 100, collapsible: false, collapsedSize: 0 },
];

function pointer(type: string, clientX: number, clientY = 0): Event {
  return new MouseEvent(type, { bubbles: true, clientX, clientY, button: 0 });
}

function key(target: HTMLElement, value: string, type = 'keydown'): KeyboardEvent {
  const event = new KeyboardEvent(type, { key: value, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

describe('moveGutter', () => {
  it('grows the panel before the gutter and keeps the minimum of the one after', () => {
    expect(moveGutter({ sizes: [30, 70], collapsed: [false, false] }, limits, 0, 20).sizes).toEqual([50, 50]);
    expect(moveGutter({ sizes: [30, 70], collapsed: [false, false] }, limits, 0, 90).sizes).toEqual([80, 20]);
  });

  it('snaps a collapsible panel shut below its minimum and pops it back open', () => {
    const shut = moveGutter({ sizes: [30, 70], collapsed: [false, false] }, limits, 0, -25);
    expect(shut).toEqual({ sizes: [0, 100], collapsed: [true, false] });
    const open = moveGutter(shut, limits, 0, 1);
    expect(open).toEqual({ sizes: [10, 90], collapsed: [false, false] });
  });

  it('leaves the sizes for a zero move and skips collapsed panels it passes', () => {
    const three = [...limits, { minSize: 10, maxSize: 100, collapsible: true, collapsedSize: 0 }];
    const state = { sizes: [50, 50, 0], collapsed: [false, false, true] };
    expect(moveGutter(state, three, 0, 0)).toEqual(state);
    expect(moveGutter(state, three, 0, 60)).toEqual({ sizes: [80, 20, 0], collapsed: [false, false, true] });
  });

  it('respects the maximum and takes space from further panels', () => {
    const three = [...limits, { minSize: 0, maxSize: 40, collapsible: false, collapsedSize: 0 }];
    expect(moveGutter({ sizes: [20, 50, 30], collapsed: [false, false, false] }, three, 1, -20).sizes).toEqual([20, 40, 40]);
    expect(moveGutter({ sizes: [40, 20, 40], collapsed: [false, false, false] }, three, 0, 30).sizes).toEqual([70, 20, 10]);
  });
});

describe('TxSplitter', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const panels = () => Array.from(fixture.nativeElement.querySelectorAll('.tx-splitter__panel')) as HTMLElement[];

  beforeEach(async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const size = this.classList.contains('tx-splitter__panel') ? 250 : 0;
      return { width: size, height: size, top: 0, left: 0, right: size, bottom: size, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    });
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
  });

  afterEach(() => vi.restoreAllMocks());

  it('renders the panels with their sizes, a gutter between them and the parts', () => {
    expect(el('tx-splitter').getAttribute('data-layout')).toBe('horizontal');
    expect(el('tx-splitter').hasAttribute('data-styled')).toBe(true);
    expect(panels().map((panel) => panel.style.flex)).toEqual(['30 1 0px', '70 1 0px']);
    expect(el('.first').closest('.tx-splitter__panel')).toBe(panels()[0]);
    expect(panels()[0].classList).toContain('own-panel');
    expect(el('.tx-splitter__handle').classList).toContain('own-handle');
    expect(el('.tx-splitter__gutter').style.width).toBe('8px');
    expect(el('tx-splitter').style.getPropertyValue('--tx-splitter-gutter-background')).toBe('red');
  });

  it('wires the gutter as a separator', () => {
    const gutter = el('.tx-splitter__gutter');
    expect(gutter.getAttribute('role')).toBe('separator');
    expect(gutter.getAttribute('tabindex')).toBe('0');
    expect(gutter.getAttribute('aria-orientation')).toBe('vertical');
    expect(gutter.getAttribute('aria-valuenow')).toBe('30');
    expect(gutter.getAttribute('aria-valuemin')).toBe('0');
    expect(gutter.getAttribute('aria-valuemax')).toBe('80');
    expect(gutter.getAttribute('aria-controls')).toBe(panels()[0].id);
    expect(gutter.getAttribute('aria-label')).toBe('Resize panels');
  });

  it('resizes with the pointer and reports start, move and end', async () => {
    const gutter = el('.tx-splitter__gutter');
    gutter.dispatchEvent(pointer('pointerdown', 100));
    gutter.dispatchEvent(pointer('pointermove', 150));
    await fixture.whenStable();
    expect(el('tx-splitter').hasAttribute('data-resizing')).toBe(true);
    expect(panels().map((panel) => panel.style.flex)).toEqual(['40 1 0px', '60 1 0px']);
    gutter.dispatchEvent(pointer('pointerup', 150));
    await fixture.whenStable();
    const host = fixture.componentInstance;
    expect(host.starts[0].sizes).toEqual([30, 70]);
    expect(host.moves.at(-1)?.sizes).toEqual([40, 60]);
    expect(host.ends).toHaveLength(1);
    expect(el('tx-splitter').hasAttribute('data-resizing')).toBe(false);
  });

  it('moves the gutter with the arrow keys of its layout, Home and End', async () => {
    const gutter = el('.tx-splitter__gutter');
    key(gutter, 'ArrowRight');
    await fixture.whenStable();
    expect(fixture.componentInstance.splitter().sizes()).toEqual([32, 68]);
    expect(key(gutter, 'ArrowDown').defaultPrevented).toBe(false);
    key(gutter, 'ArrowLeft');
    key(gutter, 'keyup', 'keyup');
    expect(fixture.componentInstance.splitter().sizes()).toEqual([30, 70]);
    expect(fixture.componentInstance.ends).toHaveLength(1);
    key(gutter, 'End');
    expect(fixture.componentInstance.splitter().sizes()).toEqual([80, 20]);
    key(gutter, 'Home');
    expect(fixture.componentInstance.splitter().sizes()).toEqual([0, 100]);
  });

  it('collapses and restores a collapsible panel with Enter', async () => {
    const gutter = el('.tx-splitter__gutter');
    key(gutter, 'Enter');
    await fixture.whenStable();
    expect(fixture.componentInstance.splitter().sizes()).toEqual([0, 100]);
    expect(panels()[0].hasAttribute('data-collapsed')).toBe(true);
    expect(fixture.componentInstance.collapses[0]).toEqual({ index: 0, collapsed: true, sizes: [0, 100] });
    key(gutter, 'Enter');
    await fixture.whenStable();
    expect(fixture.componentInstance.splitter().sizes()).toEqual([30, 70]);
    expect(fixture.componentInstance.collapses[1].collapsed).toBe(false);
  });

  it('uses the vertical arrows in a vertical layout', async () => {
    fixture.componentInstance.layout.set('vertical');
    await fixture.whenStable();
    const gutter = el('.tx-splitter__gutter');
    expect(gutter.getAttribute('aria-orientation')).toBe('horizontal');
    expect(gutter.style.height).toBe('8px');
    key(gutter, 'ArrowDown');
    expect(fixture.componentInstance.splitter().sizes()).toEqual([32, 68]);
    gutter.dispatchEvent(pointer('pointerdown', 0, 0));
    gutter.dispatchEvent(pointer('pointermove', 0, -50));
    expect(fixture.componentInstance.splitter().sizes()).toEqual([22, 78]);
  });

  it('ignores the pointer and keys while disabled', async () => {
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    const gutter = el('.tx-splitter__gutter');
    expect(gutter.getAttribute('tabindex')).toBe('-1');
    expect(gutter.getAttribute('aria-disabled')).toBe('true');
    key(gutter, 'ArrowRight');
    gutter.dispatchEvent(pointer('pointerdown', 0));
    gutter.dispatchEvent(pointer('pointermove', 100));
    expect(fixture.componentInstance.splitter().sizes()).toEqual([30, 70]);
  });
});

describe('TxSplitter nested and stateful', () => {
  beforeEach(() => localStorage.clear());

  it('splits evenly, nests without a border and takes splitter-level sizes', async () => {
    const fixture = TestBed.createComponent(NestedHost);
    await fixture.whenStable();
    const outer = fixture.nativeElement.querySelector('#outer') as HTMLElement;
    const inner = fixture.nativeElement.querySelector('#inner') as HTMLElement;
    expect(outer.hasAttribute('data-styled')).toBe(false);
    expect(inner.classList).toContain('tx-splitter--nested');
    expect(outer.classList).not.toContain('tx-splitter--nested');
    expect(fixture.componentInstance.outer().sizes()).toEqual([25, 75]);
    const innerPanels = Array.from(inner.querySelectorAll(':scope > .tx-splitter__panel')) as HTMLElement[];
    expect(innerPanels.map((panel) => parseFloat(panel.style.flex))).toEqual([100 / 3, 100 / 3, 100 / 3]);
    expect(inner.querySelectorAll(':scope > .tx-splitter__gutter')).toHaveLength(2);
  });

  it('stores the sizes after a resize and restores them', async () => {
    const fixture = TestBed.createComponent(NestedHost);
    await fixture.whenStable();
    const gutter = fixture.nativeElement.querySelector('#outer > .tx-splitter__gutter') as HTMLElement;
    key(gutter, 'End');
    key(gutter, 'End', 'keyup');
    expect(JSON.parse(localStorage.getItem('tx-spec-split') ?? '[]')).toEqual([95, 5]);
    const again = TestBed.createComponent(NestedHost);
    await again.whenStable();
    expect(again.componentInstance.outer().sizes()).toEqual([95, 5]);
    again.componentInstance.outer().resetState();
    expect(again.componentInstance.outer().sizes()).toEqual([95, 5]);
  });

  it('ignores Enter between panels that cannot collapse', async () => {
    const fixture = TestBed.createComponent(NestedHost);
    await fixture.whenStable();
    const gutter = fixture.nativeElement.querySelector('#inner > .tx-splitter__gutter') as HTMLElement;
    expect(key(gutter, 'Enter').defaultPrevented).toBe(false);
  });
});

@Component({
  imports: [TxSplitter, TxSplitterPanel],
  template: `
    <tx-splitter [layout]="layout()" [panelSizes]="sizes()" [stateKey]="stateKey()" (collapsedChange)="collapses.push($event)">
      <tx-splitter-panel [minSize]="10">One</tx-splitter-panel>
      <tx-splitter-panel [minSize]="10" collapsible>Two</tx-splitter-panel>
      @if (third()) {
        <tx-splitter-panel>Three</tx-splitter-panel>
      }
    </tx-splitter>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class EdgeHost {
  readonly splitter = viewChild.required(TxSplitter);
  readonly layout = signal<TxSplitterLayout>('horizontal');
  readonly sizes = signal<readonly number[]>([60, 0, 40]);
  readonly third = signal(true);
  readonly stateKey = signal<string | undefined>(undefined);
  readonly collapses: TxSplitterCollapseEvent[] = [];
}

describe('TxSplitter edges', () => {
  let fixture: ComponentFixture<EdgeHost>;
  const gutters = () => Array.from(fixture.nativeElement.querySelectorAll('.tx-splitter__gutter')) as HTMLElement[];
  const sizes = () => fixture.componentInstance.splitter().sizes();

  beforeEach(async () => {
    sessionStorage.clear();
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const size = this.classList.contains('tx-splitter__panel') ? 100 : 0;
      return { width: size, height: size, top: 0, left: 0, right: size, bottom: size, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    });
    fixture = TestBed.createComponent(EdgeHost);
    await fixture.whenStable();
  });

  afterEach(() => vi.restoreAllMocks());

  it('opens a panel that starts collapsed to its minimum from the gutter after it', async () => {
    expect(fixture.componentInstance.splitter().collapsed()).toEqual([false, true, false]);
    key(gutters()[0], 'Enter');
    expect(sizes()).toEqual([50, 10, 40]);
    key(gutters()[1], 'keyup', 'keyup');
    key(gutters()[1], 'Enter');
    expect(sizes()).toEqual([50, 0, 50]);
    expect(fixture.componentInstance.collapses.map((event) => event.collapsed)).toEqual([false, true]);
  });

  it('ignores other keys and a key up without a move', () => {
    fixture.componentInstance.sizes.set([50, 50]);
    fixture.componentInstance.third.set(false);
    fixture.detectChanges();
    const splitter = fixture.componentInstance.splitter();
    splitter.resetState();
    const [gutter] = gutters();
    expect(key(gutter, 'x').defaultPrevented).toBe(false);
    expect(key(gutter, 'ArrowUp').defaultPrevented).toBe(false);
    key(gutter, 'keyup', 'keyup');
    expect(sizes()).toEqual([50, 50]);
  });

  it('ignores the horizontal arrows in a vertical layout and moves up with ArrowUp', async () => {
    fixture.componentInstance.layout.set('vertical');
    await fixture.whenStable();
    const [, gutter] = gutters();
    expect(key(gutter, 'ArrowRight').defaultPrevented).toBe(false);
    expect(key(gutter, 'ArrowLeft').defaultPrevented).toBe(false);
    key(gutter, 'ArrowUp');
    const [first, second, third] = sizes();
    expect(first).toBeLessThan(60);
    expect(second).toBe(0);
    expect(third).toBeGreaterThan(40);
    key(gutters()[0], 'ArrowUp');
    expect(sizes()[1]).toBe(10);
  });

  it('mirrors the pointer and the arrows in right-to-left', async () => {
    vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({ direction: 'rtl' }) as CSSStyleDeclaration);
    const [gutter] = gutters();
    key(gutter, 'ArrowLeft');
    expect(sizes()[0]).toBeGreaterThan(60);
    key(gutter, 'keyup', 'keyup');
    fixture.componentInstance.splitter().resetState();
    gutter.setPointerCapture = vi.fn();
    gutter.hasPointerCapture = vi.fn(() => true);
    gutter.releasePointerCapture = vi.fn();
    gutter.dispatchEvent(pointer('pointerdown', 100));
    gutter.dispatchEvent(pointer('pointermove', 80));
    expect(sizes()[0]).toBeGreaterThan(60);
    gutter.dispatchEvent(pointer('pointerup', 80));
    expect(gutter.releasePointerCapture).toHaveBeenCalled();
    gutter.dispatchEvent(pointer('pointerup', 80));
    expect(gutter.releasePointerCapture).toHaveBeenCalledTimes(1);
  });

  it('keeps the dragged sizes when the panels change during a drag', async () => {
    const [gutter] = gutters();
    gutter.dispatchEvent(pointer('pointerdown', 0));
    fixture.componentInstance.third.set(false);
    await fixture.whenStable();
    expect(sizes()).toEqual([60, 0, 40]);
    gutter.dispatchEvent(pointer('pointerup', 0));
    await fixture.whenStable();
    expect(gutters()).toHaveLength(1);
  });

  it('counts a layout without any size as a hundred', () => {
    fixture.componentInstance.sizes.set([0, 0, 0]);
    fixture.detectChanges();
    fixture.componentInstance.splitter().resetState();
    key(gutters()[1], 'End');
    expect(sizes()).toEqual([0, 0, 0]);
  });

  it('keeps working when the storage fails or holds broken data', async () => {
    fixture.componentInstance.stateKey.set('tx-spec-edge');
    sessionStorage.setItem('tx-spec-edge', '{broken');
    await fixture.whenStable();
    expect(sizes()).toEqual([60, 0, 40]);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const [gutter] = gutters();
    key(gutter, 'ArrowRight');
    key(gutter, 'keyup', 'keyup');
    expect(sizes()[0]).toBeGreaterThan(60);
    vi.spyOn(window, 'sessionStorage', 'get').mockImplementation(() => {
      throw new Error('denied');
    });
    fixture.componentInstance.splitter().resetState();
    expect(sizes()).toEqual([60, 0, 40]);
  });
});
