import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxSwapEffect } from '@tectra-ng/core/utils';
import { TxCarousel } from './carousel.component';
import { TxCarouselFooter, TxCarouselHeader, TxCarouselIndicatorTemplate, TxCarouselItemTemplate } from './carousel.templates';
import { TxCarouselIndicatorContext, TxCarouselOrientation, TxCarouselResponsiveOption } from './carousel.types';

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

@Component({
  imports: [TxCarousel, TxCarouselItemTemplate],
  template: `
    <tx-carousel
      [value]="items()"
      [(page)]="page"
      [numVisible]="2"
      [numScroll]="2"
      [effect]="effect()"
      [swipe]="swipe()"
      [orientation]="orientation()"
      [responsiveOptions]="responsive()"
    >
      <ng-template txCarouselItem let-item><button type="button" class="card">{{ item }}</button></ng-template>
    </tx-carousel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class EffectHost {
  readonly carousel = viewChild.required(TxCarousel);
  readonly items = signal<string[] | null>(['A', 'B', 'C', 'D', 'E', 'F']);
  readonly page = signal(0);
  readonly effect = signal<TxSwapEffect>('fade');
  readonly swipe = signal(true);
  readonly orientation = signal<TxCarouselOrientation>('horizontal');
  readonly responsive = signal<TxCarouselResponsiveOption[] | undefined>(undefined);
}

interface FakeAnimation {
  element: HTMLElement;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  finished: Promise<void>;
  resolve: () => void;
  reject: () => void;
  cancel: ReturnType<typeof vi.fn>;
}

function stubAnimations(): { calls: FakeAnimation[]; running: { cancel: ReturnType<typeof vi.fn> }; restore: () => void } {
  const calls: FakeAnimation[] = [];
  const running = { cancel: vi.fn() };
  Object.defineProperty(HTMLElement.prototype, 'animate', {
    configurable: true,
    value(this: HTMLElement, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
      let resolve = (): void => undefined;
      let reject = (): void => undefined;
      const finished = new Promise<void>((done, fail) => {
        resolve = () => done();
        reject = () => fail(new Error('cancelled'));
      });
      const animation: FakeAnimation = { element: this, keyframes, options, finished, resolve, reject, cancel: vi.fn() };
      calls.push(animation);
      return animation;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'getAnimations', { configurable: true, value: () => [running] });
  return {
    calls,
    running,
    restore: () => {
      delete (HTMLElement.prototype as Partial<Record<'animate' | 'getAnimations', unknown>>).animate;
      delete (HTMLElement.prototype as Partial<Record<'animate' | 'getAnimations', unknown>>).getAnimations;
    },
  };
}

function pointer(type: string, init: { x: number; y?: number; id?: number; pointerType?: string; button?: number }): MouseEvent {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: init.button ?? 0, clientX: init.x, clientY: init.y ?? 50 });
  Object.defineProperty(event, 'pointerId', { value: init.id ?? 1 });
  Object.defineProperty(event, 'pointerType', { value: init.pointerType ?? 'touch' });
  return event;
}

async function microtasks(): Promise<void> {
  for (let index = 0; index < 10; index++) {
    await Promise.resolve();
  }
}

describe('TxCarousel effects and edges', () => {
  let fixture: ComponentFixture<EffectHost>;
  let host: EffectHost;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const settle = () => fixture.whenStable();

  beforeEach(async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      () => ({ width: 400, height: 400, top: 0, left: 0, right: 400, bottom: 400, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect,
    );
    fixture = TestBed.createComponent(EffectHost);
    host = fixture.componentInstance;
    await settle();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('guards the indicator context and shows a single page for few or no items', async () => {
    const context: TxCarouselIndicatorContext = { $implicit: 0, active: true };
    expect(TxCarouselIndicatorTemplate.ngTemplateContextGuard({} as TxCarouselIndicatorTemplate, context)).toBe(true);
    host.items.set(['A', 'B']);
    await settle();
    expect(host.carousel().totalPages()).toBe(1);
    host.carousel().next();
    expect(host.page()).toBe(0);
    host.items.set(null);
    await settle();
    expect(all('.tx-carousel__item')).toHaveLength(0);
    expect(host.carousel().totalPages()).toBe(1);
  });

  it('drives the public paging and autoplay methods and stops at the ends', async () => {
    const carousel = host.carousel();
    carousel.prev();
    expect(host.page()).toBe(0);
    carousel.next();
    carousel.next();
    carousel.next();
    expect(host.page()).toBe(2);
    carousel.prev();
    expect(host.page()).toBe(1);
    carousel.stopAutoplay();
    expect(carousel.autoplayStopped()).toBe(true);
    carousel.startAutoplay();
    expect(carousel.autoplayStopped()).toBe(false);
  });

  it('fades the outgoing slides, then brings the new ones in with a stagger', async () => {
    const animations = stubAnimations();
    try {
      el('.tx-carousel__viewport').style.setProperty('--tx-carousel-slide-easing', 'linear');
      host.page.set(1);
      await settle();
      expect(animations.running.cancel).toHaveBeenCalled();
      const leaves = animations.calls.slice();
      expect(leaves.map((call) => call.element.textContent?.trim())).toEqual(['A', 'B']);
      expect(leaves[0].keyframes).toEqual([{ opacity: 1 }, { opacity: 0 }]);
      expect(leaves[0].options.easing).toBe('linear');
      expect(host.carousel().shownFirst()).toBe(0);
      leaves[0].resolve();
      leaves[1].reject();
      await vi.waitFor(() => expect(animations.calls).toHaveLength(4));
      await settle();
      expect(host.carousel().shownFirst()).toBe(2);
      expect(leaves[0].cancel).toHaveBeenCalled();
      const enters = animations.calls.slice(2);
      expect(enters.map((call) => call.element.textContent?.trim())).toEqual(['C', 'D']);
      expect(enters.map((call) => call.options.delay)).toEqual([0, 40]);
      expect(enters[0].keyframes).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    } finally {
      animations.restore();
    }
  });

  it('keeps only the latest swap when pages change during the motion', async () => {
    const animations = stubAnimations();
    try {
      host.page.set(1);
      await settle();
      const first = animations.calls.slice(0, 2);
      host.page.set(2);
      await settle();
      const second = animations.calls.slice(2, 4);
      expect(second).toHaveLength(2);
      first.forEach((call) => call.resolve());
      await microtasks();
      expect(host.carousel().shownFirst()).toBe(0);
      second.forEach((call) => call.resolve());
      await microtasks();
      expect(host.carousel().shownFirst()).toBe(4);
      host.page.set(0);
      await settle();
      expect(animations.calls).toHaveLength(6);
      expect(second[0].cancel).toHaveBeenCalled();
      const third = animations.calls.slice(4, 6);
      expect(third).toHaveLength(2);
      third.forEach((call) => call.resolve());
      await vi.waitFor(() => expect(animations.calls).toHaveLength(8));
      expect(host.carousel().shownFirst()).toBe(0);
      expect(animations.calls.slice(6).map((call) => call.element.textContent?.trim())).toEqual(['A', 'B']);
    } finally {
      animations.restore();
    }
  });

  it('switches at once without motion, without animation support or for the same page', async () => {
    host.effect.set('none');
    host.page.set(1);
    await settle();
    expect(host.carousel().shownFirst()).toBe(2);
    host.effect.set('fade');
    host.page.set(2);
    await settle();
    expect(host.carousel().shownFirst()).toBe(4);
  });

  it('ignores unknown indicator keys and keeps focus state while focus stays inside', async () => {
    const dot = all('.tx-carousel__indicator-button')[0];
    expect(key(dot, 'Enter').defaultPrevented).toBe(false);
    expect(host.page()).toBe(0);
    const root = el('tx-carousel');
    root.dispatchEvent(new FocusEvent('focusin'));
    root.dispatchEvent(new FocusEvent('focusout', { relatedTarget: dot }));
    expect(host.carousel().focused()).toBe(true);
    root.dispatchEvent(new FocusEvent('focusout', { relatedTarget: document.body }));
    expect(host.carousel().focused()).toBe(false);
  });

  it('lets clicks through when nothing was dragged', async () => {
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    el('.card').dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
  });

  it('ignores secondary mouse buttons, disabled swipes, other pointers and cancelled drags', async () => {
    const viewport = el('.tx-carousel__viewport');
    viewport.dispatchEvent(pointer('pointerdown', { x: 300, pointerType: 'mouse', button: 2 }));
    document.dispatchEvent(pointer('pointermove', { x: 100 }));
    expect(host.carousel().dragging()).toBe(false);
    viewport.dispatchEvent(pointer('pointerdown', { x: 300, id: 1 }));
    document.dispatchEvent(pointer('pointermove', { x: 100, id: 2 }));
    document.dispatchEvent(pointer('pointerup', { x: 100, id: 2 }));
    expect(host.carousel().dragging()).toBe(false);
    document.dispatchEvent(pointer('pointermove', { x: 250, id: 1 }));
    document.dispatchEvent(pointer('pointermove', { x: 200, id: 1 }));
    expect(host.carousel().dragOffset()).toBe(-100);
    document.dispatchEvent(new Event('pointercancel'));
    expect(host.carousel().dragging()).toBe(false);
    expect(host.carousel().dragOffset()).toBe(0);
    document.dispatchEvent(pointer('pointerup', { x: 100, id: 1 }));
    await settle();
    expect(host.page()).toBe(0);
    host.swipe.set(false);
    await settle();
    viewport.dispatchEvent(pointer('pointerdown', { x: 300 }));
    document.dispatchEvent(pointer('pointermove', { x: 100 }));
    expect(host.carousel().dragging()).toBe(false);
  });

  it('drops a drag that turns across the axis and keeps the page on a short swipe', async () => {
    const viewport = el('.tx-carousel__viewport');
    viewport.dispatchEvent(pointer('pointerdown', { x: 300, y: 50 }));
    document.dispatchEvent(pointer('pointermove', { x: 290, y: 80 }));
    expect(host.carousel().dragging()).toBe(false);
    document.dispatchEvent(pointer('pointermove', { x: 200, y: 50 }));
    expect(host.carousel().dragOffset()).toBe(0);
    viewport.dispatchEvent(pointer('pointerdown', { x: 300 }));
    document.dispatchEvent(pointer('pointermove', { x: 280 }));
    document.dispatchEvent(pointer('pointerup', { x: 280 }));
    await settle();
    expect(host.page()).toBe(0);
  });

  it('swipes vertically along the y axis', async () => {
    host.orientation.set('vertical');
    await settle();
    const viewport = el('.tx-carousel__viewport');
    viewport.dispatchEvent(pointer('pointerdown', { x: 50, y: 300 }));
    document.dispatchEvent(pointer('pointermove', { x: 52, y: 200 }));
    expect(host.carousel().dragOffset()).toBe(-100);
    document.dispatchEvent(pointer('pointerup', { x: 52, y: 200 }));
    await settle();
    expect(host.page()).toBe(1);
  });

  it('falls back to its own counts when no breakpoint matches', async () => {
    window.matchMedia = (() => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined }) as unknown as MediaQueryList) as typeof window.matchMedia;
    host.responsive.set([{ breakpoint: '600px', numVisible: 1 }]);
    await settle();
    expect(host.carousel().visibleCount()).toBe(2);
    expect(host.carousel().scrollCount()).toBe(2);
  });
});

describe('TxCarousel recompiled by TestBed', () => {
  it('still finds its templates when a test overrides the component', async () => {
    TestBed.overrideComponent(TxCarousel, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.tx-carousel__header')?.textContent).toContain('Picks');
    expect(root.querySelector('.tx-carousel__footer')?.textContent).toContain('More soon');
    expect(root.querySelector('.card')?.textContent).toBe('0:A');
    const plain = TestBed.createComponent(PlainHost);
    await plain.whenStable();
    expect(Array.from(plain.nativeElement.querySelectorAll('.dot')).map((dot) => (dot as HTMLElement).textContent)).toEqual(['1*', '2']);
  });
});

describe('carousel item template directive', () => {
  it('narrows its template context', () => {
    expect(TxCarouselItemTemplate.ngTemplateContextGuard({} as TxCarouselItemTemplate<string>, { $implicit: 'a', index: 0, active: true })).toBe(true);
    expect(TxCarouselItemTemplate.ngTemplateContextGuard({} as TxCarouselItemTemplate<string>, undefined)).toBe(false);
  });
});
