import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxVirtualScroller } from './virtual-scroller.component';
import { TxVirtualScrollerItem, TxVirtualScrollerLoader } from './virtual-scroller.templates';
import { TxVirtualScrollerLazyLoadEvent, TxVirtualScrollerOrientation } from './virtual-scroller.types';

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
    <ng-template txVirtualScrollerItem let-item let-index="index"><span class="cell">{{ index }}:{{ item }}</span></ng-template>
    @if (withLoader()) {
      <ng-template txVirtualScrollerLoader let-index><span class="loader">…{{ index }}</span></ng-template>
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
  const cells = () => Array.from(fixture.nativeElement.querySelectorAll('.cell')).map((cell) => (cell as HTMLElement).textContent);
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
    expect((fixture.nativeElement.querySelector('.tx-virtual-scroller__spacer') as HTMLElement).style.height).toBe('20000px');
    expect(cells().length).toBe(12);
    expect(cells()[0]).toBe('0:Item 0');
    expect(fixture.nativeElement.querySelector('.tx-virtual-scroller__item').classList).toContain('own-item');
    expect(scroller().style.getPropertyValue('--tx-virtual-scroller-loader-icon-size')).toBe('30px');
  });

  it('moves the window while scrolling', async () => {
    await scrollTo(2000);
    expect(cells()[0]).toBe('98:Item 98');
    expect(cells().at(-1)).toBe('111:Item 111');
    expect((fixture.nativeElement.querySelector('.tx-virtual-scroller__content') as HTMLElement).style.transform).toContain('1960px');
    expect(instance().getRenderedRange().viewport).toEqual({ first: 100, last: 110 });
  });

  it('scrolls horizontally and in both directions', async () => {
    host.orientation.set('horizontal');
    await render();
    expect((fixture.nativeElement.querySelector('.tx-virtual-scroller__spacer') as HTMLElement).style.width).toBe('20000px');
    host.orientation.set('both');
    host.size.set([20, 50]);
    host.items.set(Array.from({ length: 100 }, (_, row) => Array.from({ length: 100 }, (_, column) => `${row}.${column}`)));
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
