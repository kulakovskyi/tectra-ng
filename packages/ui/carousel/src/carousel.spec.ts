import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxCarousel } from './carousel.component';
import { TxCarouselFooter, TxCarouselHeader, TxCarouselIndicatorTemplate, TxCarouselItemTemplate } from './carousel.templates';
import { TxCarouselOrientation, TxCarouselResponsiveOption } from './carousel.types';

@Component({
  imports: [TxCarousel, TxCarouselItemTemplate, TxCarouselHeader, TxCarouselFooter],
  template: `
    <tx-carousel
      ariaLabel="Products"
      [value]="items"
      [(page)]="page"
      [numVisible]="3"
      [numScroll]="numScroll()"
      [circular]="circular()"
      [orientation]="orientation()"
      [autoplayInterval]="autoplay()"
      [responsiveOptions]="responsive()"
      [dt]="{ indicator: { width: '30px' } }"
      [pt]="{ item: { class: 'own-item' } }"
    >
      <h3 txCarouselHeader>Picks</h3>
      <ng-template txCarouselItem let-item let-index="index" let-active="active">
        <span class="card" [attr.data-active]="active">{{ index }}:{{ item }}</span>
      </ng-template>
      <p txCarouselFooter>More soon</p>
    </tx-carousel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly carousel = viewChild.required(TxCarousel);
  readonly items = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  readonly page = signal(0);
  readonly numScroll = signal(1);
  readonly circular = signal(false);
  readonly orientation = signal<TxCarouselOrientation>('horizontal');
  readonly autoplay = signal(0);
  readonly responsive = signal<TxCarouselResponsiveOption[] | undefined>(undefined);
}

@Component({
  imports: [TxCarousel, TxCarouselItemTemplate, TxCarouselIndicatorTemplate],
  template: `
    <tx-carousel [value]="['One', 'Two']" [showNavigators]="false" unstyled>
      <ng-template txCarouselItem let-item>{{ item }}</ng-template>
      <ng-template txCarouselIndicator let-page let-active="active"><span class="dot">{{ page + 1 }}{{ active ? '*' : '' }}</span></ng-template>
    </tx-carousel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainHost {}

function key(target: Element, value: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

describe('TxCarousel', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const nav = (which: 'prev' | 'next') => el(`.tx-carousel__${which}`) as HTMLButtonElement;
  const settle = () => fixture.whenStable();

  beforeEach(async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      () => ({ width: 300, height: 300, top: 0, left: 0, right: 300, bottom: 300, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect,
    );
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await settle();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders a labelled carousel region with slides, header and footer', () => {
    const root = el('tx-carousel');
    expect(root.getAttribute('role')).toBe('region');
    expect(root.getAttribute('aria-roledescription')).toBe('Carousel');
    expect(root.getAttribute('aria-label')).toBe('Products');
    expect(root.style.getPropertyValue('--tx-carousel-indicator-width')).toBe('30px');
    expect(el('.tx-carousel__header').textContent).toContain('Picks');
    expect(el('.tx-carousel__footer').textContent).toContain('More soon');
    const items = all('.tx-carousel__item');
    expect(items).toHaveLength(7);
    expect(items[0].classList).toContain('own-item');
    expect(items[0].getAttribute('aria-roledescription')).toBe('Slide');
    expect(items[0].getAttribute('aria-label')).toBe('1 of 7');
    expect(items[0].style.flexBasis).toBe('33.3333%');
    expect(items.map((item) => item.getAttribute('aria-hidden'))).toEqual([null, null, null, 'true', 'true', 'true', 'true']);
    expect(items[3].hasAttribute('inert')).toBe(true);
    expect(all('.card').map((card) => card.textContent)).toEqual(['0:A', '1:B', '2:C', '3:D', '4:E', '5:F', '6:G']);
  });

  it('pages with the navigators and indicators', async () => {
    expect(all('.tx-carousel__indicator-button')).toHaveLength(5);
    expect(nav('prev').disabled).toBe(true);
    nav('next').click();
    await settle();
    expect(host.page()).toBe(1);
    expect(el('.tx-carousel__track').style.transform).toBe('translate3d(calc(-33.3333% + 0px), 0, 0)');
    all('.tx-carousel__indicator-button')[4].click();
    await settle();
    expect(host.page()).toBe(4);
    expect(nav('next').disabled).toBe(true);
    const current = all('.tx-carousel__indicator-button')[4];
    expect(current.getAttribute('aria-current')).toBe('true');
    expect(current.getAttribute('aria-label')).toBe('Page 5');
    expect(current.tabIndex).toBe(0);
  });

  it('scrolls by numScroll and keeps the last page full', async () => {
    host.numScroll.set(3);
    await settle();
    expect(all('.tx-carousel__indicator-button')).toHaveLength(3);
    host.page.set(2);
    await settle();
    expect(host.carousel().firstIndex()).toBe(4);
    expect(all('.tx-carousel__item--active').map((item) => item.textContent?.trim())).toEqual(['4:E', '5:F', '6:G']);
  });

  it('wraps around when circular', async () => {
    host.circular.set(true);
    await settle();
    expect(nav('prev').disabled).toBe(false);
    nav('prev').click();
    await settle();
    expect(host.page()).toBe(4);
    nav('next').click();
    await settle();
    expect(host.page()).toBe(0);
  });

  it('moves between indicators with the keyboard', async () => {
    const list = () => all('.tx-carousel__indicator-button')[host.page()];
    key(list(), 'ArrowRight');
    await settle();
    expect(host.page()).toBe(1);
    key(list(), 'End');
    await settle();
    expect(host.page()).toBe(4);
    key(list(), 'ArrowRight');
    await settle();
    expect(host.page()).toBe(0);
    key(list(), 'ArrowLeft');
    await settle();
    expect(host.page()).toBe(4);
    key(list(), 'Home');
    await settle();
    expect(host.page()).toBe(0);
  });

  it('swipes to the next and previous page', async () => {
    const viewport = el('.tx-carousel__viewport');
    viewport.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 200, clientY: 50 }));
    document.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, cancelable: true, clientX: 150, clientY: 52 }));
    await settle();
    expect(el('tx-carousel').classList).toContain('tx-carousel--dragging');
    expect(el('.tx-carousel__track').style.transform).toBe('translate3d(calc(0% + -50px), 0, 0)');
    document.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 150 }));
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    el('.card').dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    await settle();
    expect(host.page()).toBe(1);

    viewport.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 100, clientY: 50 }));
    document.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, cancelable: true, clientX: 160, clientY: 50 }));
    document.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 160 }));
    await settle();
    expect(host.page()).toBe(0);
    expect(el('tx-carousel').classList).not.toContain('tx-carousel--dragging');
  });

  it('ignores a vertical drag and resists past the first page', async () => {
    const viewport = el('.tx-carousel__viewport');
    viewport.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 100, clientY: 50 }));
    document.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, cancelable: true, clientX: 102, clientY: 120 }));
    document.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
    expect(host.page()).toBe(0);
    viewport.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 100, clientY: 50 }));
    document.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, cancelable: true, clientX: 200, clientY: 50 }));
    expect(host.carousel().dragOffset()).toBe(30);
    document.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
    expect(host.page()).toBe(0);
  });

  it('turns vertical with up and down icons and a fixed viewport height', async () => {
    host.orientation.set('vertical');
    await settle();
    expect(el('tx-carousel').getAttribute('data-orientation')).toBe('vertical');
    expect(el('.tx-carousel__viewport').style.height).toBe('300px');
    expect(host.carousel().prevIconName()).toBe('chevron-up');
    nav('next').click();
    await settle();
    expect(el('.tx-carousel__track').style.transform).toBe('translate3d(0, calc(-33.3333% + 0px), 0)');
  });

  it('plays automatically, pauses on hover and stops after a click', async () => {
    vi.useFakeTimers();
    host.autoplay.set(1000);
    fixture.detectChanges();
    expect(el('.tx-carousel__viewport').getAttribute('aria-live')).toBe('off');
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(host.page()).toBe(1);
    el('tx-carousel').dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    vi.advanceTimersByTime(3000);
    expect(host.page()).toBe(1);
    el('tx-carousel').dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    nav('next').click();
    fixture.detectChanges();
    expect(host.page()).toBe(2);
    vi.advanceTimersByTime(3000);
    expect(host.page()).toBe(2);
    expect(el('.tx-carousel__viewport').getAttribute('aria-live')).toBe('polite');
  });

  it('follows the responsive options', async () => {
    const listeners: (() => void)[] = [];
    let width = 500;
    const original = window.matchMedia;
    window.matchMedia = ((query: string) =>
        ({
          get matches() {
            return width <= parseFloat(query.replace(/\D+/, ''));
          },
          addEventListener: (_: string, listener: () => void) => listeners.push(listener),
          removeEventListener: () => undefined,
        }) as unknown as MediaQueryList) as typeof window.matchMedia;
    host.responsive.set([
      { breakpoint: '1024px', numVisible: 2, numScroll: 2 },
      { breakpoint: '560px', numVisible: 1 },
    ]);
    await settle();
    expect(host.carousel().visibleCount()).toBe(1);
    expect(all('.tx-carousel__indicator-button')).toHaveLength(7);
    width = 800;
    listeners.forEach((listener) => listener());
    await settle();
    expect(host.carousel().visibleCount()).toBe(2);
    expect(all('.tx-carousel__indicator-button')).toHaveLength(4);
    window.matchMedia = original;
  });
});

describe('TxCarousel templates', () => {
  it('renders own indicators and works without styles and navigators', async () => {
    const fixture = TestBed.createComponent(PlainHost);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('tx-carousel')?.hasAttribute('data-styled')).toBe(false);
    expect(root.querySelector('.tx-carousel__navigator')).toBeNull();
    expect(Array.from(root.querySelectorAll('.dot')).map((dot) => dot.textContent)).toEqual(['1*', '2']);
  });
});
