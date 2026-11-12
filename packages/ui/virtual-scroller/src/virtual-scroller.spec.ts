import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxVirtualScroller } from './virtual-scroller.component';
import {
  TxVirtualScrollerContent,
  TxVirtualScrollerItem,
  TxVirtualScrollerLoader,
  TxVirtualScrollerLoadingIcon,
} from './virtual-scroller.templates';
import {
  TxVirtualScrollerLazyLoadEvent,
  TxVirtualScrollerOrientation,
  TxVirtualScrollerRange,
} from './virtual-scroller.types';

@Component({
  imports: [TxVirtualScroller, TxVirtualScrollerItem, TxVirtualScrollerLoader],
  template: `<tx-virtual-scroller
    ariaLabel="Items"
    scrollHeight="200px"
    [items]="items()"
    [itemSize]="size()"
    [orientation]="orientation()"
    [lazy]="lazy()"
    [disabled]="disabled()"
    [showLoader]="showLoader()"
    [loading]="loading()"
    [numToleratedItems]="2"
    [dt]="{ loader: { iconSize: '30px' } }"
    [pt]="{ item: { class: 'own-item' } }"
    (lazyLoad)="loads.push($event)"
  >
    <ng-template txVirtualScrollerItem let-item let-index="index"
      ><span class="cell">{{ index }}:{{ item }}</span></ng-template
    >
    @if (withLoader()) {
      <ng-template txVirtualScrollerLoader let-index
        ><span class="loader">…{{ index }}</span></ng-template
      >
    }
  </tx-virtual-scroller>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly items = signal<unknown[]>(Array.from({ length: 1000 }, (_, index) => `Item ${index}`));
  readonly size = signal<number | [number, number]>(20);
  readonly orientation = signal<TxVirtualScrollerOrientation>('vertical');
  readonly lazy = signal(false);
  readonly disabled = signal(false);
  readonly showLoader = signal(false);
  readonly loading = signal(false);
  readonly withLoader = signal(false);
  loads: TxVirtualScrollerLazyLoadEvent[] = [];
}

describe('TxVirtualScroller', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const render = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const scroller = () => fixture.nativeElement.querySelector('tx-virtual-scroller') as HTMLElement;
  const instance = () => fixture.debugElement.children[0].componentInstance as TxVirtualScroller;
  const cells = () =>
    Array.from(fixture.nativeElement.querySelectorAll('.cell')).map(
      (cell) => (cell as HTMLElement).textContent,
    );
  const scrollTo = async (top: number, left = 0) => {
    Object.defineProperty(scroller(), 'scrollTop', { configurable: true, value: top });
    Object.defineProperty(scroller(), 'scrollLeft', { configurable: true, value: left });
    scroller().dispatchEvent(new Event('scroll'));
    await render();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await render();
  });

  it('renders only the visible window with a spacer of the full size', () => {
    expect(scroller().getAttribute('role')).toBe('region');
    expect(scroller().getAttribute('tabindex')).toBe('0');
    expect(scroller().style.height).toBe('200px');
    expect(
      (fixture.nativeElement.querySelector('.tx-virtual-scroller__spacer') as HTMLElement).style
        .height,
    ).toBe('20000px');
    expect(cells().length).toBe(12);
    expect(cells()[0]).toBe('0:Item 0');
    expect(fixture.nativeElement.querySelector('.tx-virtual-scroller__item').classList).toContain(
      'own-item',
    );
    expect(scroller().style.getPropertyValue('--tx-virtual-scroller-loader-icon-size')).toBe(
      '30px',
    );
  });

  it('moves the window while scrolling', async () => {
    await scrollTo(2000);
    expect(cells()[0]).toBe('98:Item 98');
    expect(cells().at(-1)).toBe('111:Item 111');
    expect(
      (fixture.nativeElement.querySelector('.tx-virtual-scroller__content') as HTMLElement).style
        .transform,
    ).toContain('1960px');
    expect(instance().getRenderedRange().viewport).toEqual({ first: 100, last: 110 });
  });

  it('scrolls horizontally and in both directions', async () => {
    host.orientation.set('horizontal');
    await render();
    expect(
      (fixture.nativeElement.querySelector('.tx-virtual-scroller__spacer') as HTMLElement).style
        .width,
    ).toBe('20000px');
    host.orientation.set('both');
    host.size.set([20, 50]);
    host.items.set(
      Array.from({ length: 100 }, (_, row) =>
        Array.from({ length: 100 }, (_, column) => `${row}.${column}`),
      ),
    );
    await render();
    await scrollTo(400, 1000);
    expect(cells()[0]).toBe('18:18.18');
    expect(instance().getRenderedRange().first).toEqual([18, 18]);
  });

  it('asks for lazy ranges and shows loaders for missing items', async () => {
    host.items.set(Array.from({ length: 1000 }));
    host.lazy.set(true);
    host.withLoader.set(true);
    await render();
    expect(host.loads.at(-1)).toEqual({ first: 0, last: 12 });
    expect(fixture.nativeElement.querySelectorAll('.loader').length).toBe(12);
    await scrollTo(1000);
    expect(host.loads.at(-1)).toEqual({ first: 48, last: 62 });
  });

  it('shows a loading mask while loading', async () => {
    host.showLoader.set(true);
    host.loading.set(true);
    await render();
    expect(fixture.nativeElement.querySelector('.tx-virtual-scroller__loader')).not.toBeNull();
    expect(scroller().getAttribute('aria-busy')).toBe('true');
    host.withLoader.set(true);
    await render();
    expect(fixture.nativeElement.querySelector('.tx-virtual-scroller__loader')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.loader').length).toBe(cells().length + 12);
  });

  it('counts one column in a vertical list, one row in a horizontal one and no grid outside both', async () => {
    expect(instance().columnCount()).toBe(1);
    expect(instance().grid()).toEqual([]);
    expect(instance().renderedRows()).toEqual([]);
    host.orientation.set('horizontal');
    await render();
    expect(instance().rowCount()).toBe(1);
    expect(instance().columnCount()).toBe(1000);
    host.orientation.set('both');
    host.items.set(null as unknown as unknown[]);
    await render();
    expect(instance().rowCount()).toBe(0);
    expect(instance().renderedRows()).toEqual([]);
  });

  it('renders everything when disabled and scrolls to an index', async () => {
    host.disabled.set(true);
    await render();
    expect(cells().length).toBe(1000);
    host.disabled.set(false);
    await render();
    instance().scrollToIndex(500);
    await render();
    expect(cells()).toContain('500:Item 500');
    instance().scrollInView(600, 'to-end');
    await render();
    expect(cells()).toContain('600:Item 600');
  });
});

@Component({
  imports: [TxVirtualScroller, TxVirtualScrollerContent, TxVirtualScrollerLoadingIcon],
  template: `<tx-virtual-scroller
    scrollWidth="300px"
    [items]="items()"
    [itemSize]="size()"
    [orientation]="orientation()"
    [showLoader]="true"
    [loading]="loading()"
    [delay]="delay()"
    [lazy]="lazy()"
    [step]="step()"
    [appendOnly]="appendOnly()"
    (lazyLoad)="loads.push($event)"
    (scrolled)="scrolls = scrolls + 1"
    (scrollIndexChange)="views.push($event)"
  >
    <ng-template
      txVirtualScrollerContent
      let-items
      let-first="first"
      let-count="count"
      let-spacer="spacerBefore"
      let-size="itemSize"
    >
      <span class="summary"
        >{{ first }}/{{ count }}/{{ spacer }}/{{ size }}/{{ items.length }}</span
      >
    </ng-template>
    <ng-template txVirtualScrollerLoadingIcon><span class="own-icon">Wait</span></ng-template>
  </tx-virtual-scroller>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ContentHost {
  readonly items = signal<unknown[] | null>(Array.from({ length: 100 }, (_, index) => index));
  readonly size = signal<number | [number, number]>(20);
  readonly orientation = signal<TxVirtualScrollerOrientation>('vertical');
  readonly loading = signal(false);
  readonly delay = signal(0);
  readonly lazy = signal(false);
  readonly step = signal(0);
  readonly appendOnly = signal(false);
  loads: TxVirtualScrollerLazyLoadEvent[] = [];
  views: TxVirtualScrollerRange[] = [];
  scrolls = 0;
}

describe('TxVirtualScroller content template', () => {
  let fixture: ComponentFixture<ContentHost>;
  let host: ContentHost;
  const render = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const scroller = () => fixture.nativeElement.querySelector('tx-virtual-scroller') as HTMLElement;
  const instance = () => fixture.debugElement.children[0].componentInstance as TxVirtualScroller;
  const summary = () =>
    (fixture.nativeElement.querySelector('.summary') as HTMLElement).textContent;
  const scrollTo = (top: number, left = 0) => {
    Object.defineProperty(scroller(), 'scrollTop', { configurable: true, value: top });
    Object.defineProperty(scroller(), 'scrollLeft', { configurable: true, value: left });
    scroller().dispatchEvent(new Event('scroll'));
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(ContentHost);
    host = fixture.componentInstance;
    await render();
  });

  it('hands the rendered window to the content template in both directions', async () => {
    expect(scroller().style.width).toBe('300px');
    expect(summary()).toBe('0/100/0/20/15');
    scrollTo(400);
    await render();
    expect(summary()).toBe('15/100/300/20/20');
    host.orientation.set('horizontal');
    host.size.set(50);
    await render();
    scrollTo(0, 1000);
    await render();
    expect(summary()).toBe('15/100/750/50/20');
    host.items.set(null);
    await render();
    expect(summary()).toBe('0/0/0/50/0');
  });

  it('shows its own loading icon while loading', async () => {
    host.loading.set(true);
    await render();
    expect(
      fixture.nativeElement.querySelector('.tx-virtual-scroller__loader .own-icon')?.textContent,
    ).toBe('Wait');
  });

  it('waits for the delay before moving the window and shows the loader meanwhile', async () => {
    vi.useFakeTimers();
    try {
      host.delay.set(100);
      await render();
      scrollTo(400);
      scrollTo(600);
      await render();
      expect(host.scrolls).toBe(2);
      expect(scroller().classList).toContain('tx-virtual-scroller--loading');
      expect(summary()).toBe('0/100/0/20/15');
      vi.advanceTimersByTime(100);
      await render();
      expect(scroller().classList).not.toContain('tx-virtual-scroller--loading');
      expect(summary()).toBe('25/100/500/20/20');
    } finally {
      vi.useRealTimers();
    }
  });

  it('rounds lazy ranges to the step, emits a range once and loads horizontally', async () => {
    host.lazy.set(true);
    host.step.set(10);
    await render();
    expect(host.loads).toEqual([{ first: 0, last: 20 }]);
    scrollTo(20);
    await render();
    expect(host.loads).toHaveLength(1);
    scrollTo(400);
    await render();
    expect(host.loads.at(-1)).toEqual({ first: 10, last: 40 });
    host.orientation.set('horizontal');
    host.step.set(0);
    await render();
    expect(host.loads.at(-1)).toEqual({ first: 0, last: 15 });
  });

  it('keeps the rows above when appending only, and renders all with a zero size', async () => {
    host.appendOnly.set(true);
    await render();
    scrollTo(1000);
    await render();
    expect(summary()).toBe('0/100/0/20/65');
    host.size.set(0);
    await render();
    expect(summary()).toBe('0/100/0/0/100');
  });

  it('scrolls to rows, columns and cells, and leaves smooth scrolling to the browser', async () => {
    const calls: ScrollToOptions[] = [];
    scroller().scrollTo = ((options: ScrollToOptions) =>
      calls.push(options)) as HTMLElement['scrollTo'];
    instance().scrollInView(30, 'to-start');
    await render();
    expect(instance().scrollTop()).toBe(600);
    expect(summary()).toBe('25/100/500/20/20');
    instance().scrollToIndex(80, 'smooth');
    expect(instance().scrollTop()).toBe(600);
    expect(calls.at(-1)).toEqual({ top: 1600, left: 0, behavior: 'smooth' });
    host.orientation.set('both');
    host.size.set([20, 40]);
    host.items.set([[1, 2, 3], null, [4]]);
    await render();
    instance().scrollToIndex([2, 1]);
    expect(instance().scrollTop()).toBe(40);
    expect(instance().scrollLeft()).toBe(40);
    instance().scrollTo({ top: -5 });
    expect(instance().scrollTop()).toBe(0);
    expect(instance().scrollLeft()).toBe(40);
    instance().scrollTo({ left: 0 });
    expect(instance().scrollTop()).toBe(0);
    expect(instance().scrollLeft()).toBe(0);
    host.orientation.set('horizontal');
    host.items.set([1, 2, 3]);
    await render();
    instance().scrollToIndex(2);
    expect(instance().scrollLeft()).toBe(80);
    expect(host.views.length).toBeGreaterThan(1);
  });

  it('measures again on refresh and when the size changes', async () => {
    const observed: Element[] = [];
    let notify = () => undefined as void;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          notify = callback;
        }
        observe(target: Element) {
          observed.push(target);
        }
        unobserve() {
          return undefined;
        }
        disconnect() {
          observed.length = 0;
        }
      },
    );
    try {
      const resized = TestBed.createComponent(ContentHost);
      resized.detectChanges();
      await resized.whenStable();
      const element = resized.nativeElement.querySelector('tx-virtual-scroller') as HTMLElement;
      const virtual = resized.debugElement.children[0].componentInstance as TxVirtualScroller;
      expect(observed).toEqual([element]);
      Object.defineProperty(element, 'clientHeight', { configurable: true, value: 100 });
      notify();
      expect(virtual.viewportHeight()).toBe(100);
      Object.defineProperty(element, 'clientWidth', { configurable: true, value: 250 });
      virtual.refresh();
      expect(virtual.viewportWidth()).toBe(250);
      resized.destroy();
      expect(observed).toEqual([]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

@Component({
  imports: [TxVirtualScroller, TxVirtualScrollerItem],
  template: `<tx-virtual-scroller
    orientation="both"
    [itemSize]="[20, 40]"
    [items]="grid"
    [trackBy]="track"
  >
    <ng-template txVirtualScrollerItem let-item let-index="index" let-last="last"
      ><span class="cell">{{ index }}:{{ item ?? '-' }}:{{ last }}</span></ng-template
    >
  </tx-virtual-scroller>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class GridHost {
  readonly grid = [['a', 'b'], null, ['c']] as unknown as string[][];
  tracked: unknown[] = [];
  readonly track = (index: number, item: unknown) => {
    this.tracked.push(item);
    return `${index}-${String(item)}`;
  };
}

describe('TxVirtualScroller grid', () => {
  it('renders ragged and missing rows with its own track function', async () => {
    const fixture = TestBed.createComponent(GridHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const rows = Array.from(
      fixture.nativeElement.querySelectorAll('.tx-virtual-scroller__row'),
    ) as HTMLElement[];
    expect(
      rows.map((row) => Array.from(row.querySelectorAll('.cell')).map((cell) => cell.textContent)),
    ).toEqual([
      ['0:a:false', '1:b:true'],
      ['0:-:false', '1:-:true'],
      ['0:c:false', '1:-:true'],
    ]);
    expect(fixture.componentInstance.tracked).toContain('a');
  });
});

describe('TxVirtualScroller recompiled by TestBed', () => {
  it('still finds its projected templates when a test overrides the component', async () => {
    TestBed.overrideComponent(TxVirtualScroller, { set: { styles: [] } });
    const fixture = TestBed.createComponent(ContentHost);
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement.querySelector('.summary') as HTMLElement).textContent).toBe(
      '0/100/0/20/15',
    );
    expect(fixture.nativeElement.querySelector('.own-icon')?.textContent).toBe('Wait');
  });
});
