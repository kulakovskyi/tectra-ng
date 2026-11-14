import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxSwapEffect } from '@tectra-ng/core/utils';
import { TxGalleria } from './galleria.component';
import { TxGalleriaCaptionTemplate, TxGalleriaFooter, TxGalleriaHeader, TxGalleriaIndicatorTemplate, TxGalleriaItemTemplate, TxGalleriaThumbnailTemplate } from './galleria.templates';
import { TxGalleriaImage, TxGalleriaIndicatorContext, TxGalleriaPosition, TxGalleriaResponsiveOption } from './galleria.types';

const IMAGES: TxGalleriaImage[] = Array.from({ length: 6 }, (_, index) => ({
  src: `photo-${index}.jpg`,
  thumbnailSrc: `thumb-${index}.jpg`,
  alt: `Photo ${index}`,
  title: `Title ${index}`,
  description: index === 0 ? 'First description' : undefined,
}));

@Component({
  imports: [TxGalleria, TxGalleriaHeader, TxGalleriaFooter],
  template: `
    <tx-galleria
      [value]="images"
      [(activeIndex)]="active"
      [numVisible]="3"
      [circular]="circular()"
      [showItemNavigators]="true"
      [showIndicators]="indicators()"
      [showIndicatorsOnItem]="inset()"
      [indicatorsPosition]="indicatorsPosition()"
      [thumbnailsPosition]="thumbnailsPosition()"
      [changeItemOnIndicatorHover]="true"
      [autoPlay]="autoPlay()"
      [transitionInterval]="1000"
      [dt]="{ navButton: { size: '40px' } }"
      [pt]="{ thumbnail: { class: 'own-thumbnail' } }"
    >
      <p txGalleriaHeader>Trip</p>
      <p txGalleriaFooter>6 photos</p>
    </tx-galleria>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly galleria = viewChild.required(TxGalleria);
  readonly images = IMAGES;
  readonly active = signal(0);
  readonly circular = signal(false);
  readonly indicators = signal(false);
  readonly inset = signal(false);
  readonly indicatorsPosition = signal<TxGalleriaPosition>('bottom');
  readonly thumbnailsPosition = signal<TxGalleriaPosition>('bottom');
  readonly autoPlay = signal(false);
}

@Component({
  imports: [TxGalleria, TxGalleriaItemTemplate, TxGalleriaThumbnailTemplate, TxGalleriaCaptionTemplate, TxGalleriaIndicatorTemplate],
  template: `
    <tx-galleria [value]="items" [(visible)]="visible" [(activeIndex)]="active" fullScreen showIndicators [showThumbnails]="false" unstyled>
      <ng-template txGalleriaItem let-item let-index="index"><span class="own-item">{{ index }}-{{ item.name }}</span></ng-template>
      <ng-template txGalleriaThumbnail let-item><span class="own-thumb">{{ item.name }}</span></ng-template>
      <ng-template txGalleriaCaption let-item><span class="own-caption">About {{ item.name }}</span></ng-template>
      <ng-template txGalleriaIndicator let-index let-active="active"><span class="own-dot">{{ index }}{{ active ? '*' : '' }}</span></ng-template>
    </tx-galleria>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FullScreenHost {
  readonly items = [{ name: 'North' }, { name: 'South' }, { name: 'East' }];
  readonly visible = signal(false);
  readonly active = signal(1);
}

function key(target: Element, value: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

describe('TxGalleria', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const settle = () => fixture.whenStable();

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await settle();
  });

  afterEach(() => vi.useRealTimers());

  it('renders the active image, its caption, thumbnails, header and footer', () => {
    const frame = el('.tx-galleria__frame');
    expect(frame.getAttribute('role')).toBe('region');
    expect(frame.getAttribute('aria-label')).toBe('Gallery');
    expect(frame.getAttribute('data-thumbnails')).toBe('bottom');
    expect(frame.hasAttribute('data-styled')).toBe(true);
    expect(frame.style.getPropertyValue('--tx-galleria-nav-button-size')).toBe('40px');
    expect(el('.tx-galleria__item--active .tx-galleria__image').getAttribute('src')).toBe('photo-0.jpg');
    expect(el('.tx-galleria__item--active .tx-galleria__image').getAttribute('alt')).toBe('Photo 0');
    expect(el('.tx-galleria__item--active').getAttribute('aria-label')).toBe('1 of 6');
    const items = all('.tx-galleria__item');
    expect(items).toHaveLength(6);
    expect(items[1].getAttribute('aria-hidden')).toBe('true');
    expect(items[1].hasAttribute('inert')).toBe(true);
    expect(el('.tx-galleria__caption-title').textContent).toBe('Title 0');
    expect(el('.tx-galleria__caption-text').textContent).toBe('First description');
    expect(el('.tx-galleria__header').textContent).toContain('Trip');
    expect(el('.tx-galleria__footer').textContent).toContain('6 photos');
    const thumbnails = all('.tx-galleria__thumbnail');
    expect(thumbnails).toHaveLength(6);
    expect(thumbnails[0].classList).toContain('own-thumbnail');
    expect(thumbnails[0].getAttribute('aria-current')).toBe('true');
    expect(thumbnails[0].getAttribute('aria-label')).toBe('Image 1');
    expect(thumbnails[1].tabIndex).toBe(-1);
    expect(thumbnails[2].querySelector('img')?.getAttribute('src')).toBe('thumb-2.jpg');
    expect(el('.tx-galleria__thumbnail-item').style.flexBasis).toBe('33.3333%');
  });

  it('moves with the item and thumbnail navigators', async () => {
    const prev = el('.tx-galleria__prev') as HTMLButtonElement;
    expect(prev.disabled).toBe(true);
    expect(prev.getAttribute('aria-label')).toBe('Previous image');
    (el('.tx-galleria__next') as HTMLButtonElement).click();
    await settle();
    expect(host.active()).toBe(1);
    expect(el('.tx-galleria__item--active .tx-galleria__image').getAttribute('src')).toBe('photo-1.jpg');
    const thumbNavs = all('.tx-galleria__thumbnail-navigator') as HTMLButtonElement[];
    expect(thumbNavs.map((button) => button.getAttribute('aria-label'))).toEqual(['Previous thumbnails', 'Next thumbnails']);
    thumbNavs[1].click();
    await settle();
    expect(host.active()).toBe(2);
  });

  it('keeps the active thumbnail in view', async () => {
    host.active.set(4);
    await settle();
    expect(host.galleria().thumbnailStart()).toBe(3);
    expect(el('.tx-galleria__thumbnail-items').style.transform).toBe('translate3d(-100%, 0, 0)');
    host.active.set(5);
    await settle();
    expect(host.galleria().thumbnailStart()).toBe(3);
  });

  it('selects with thumbnails and the keyboard', async () => {
    all('.tx-galleria__thumbnail')[3].click();
    await settle();
    expect(host.active()).toBe(3);
    const thumb = () => all('.tx-galleria__thumbnail')[host.active()];
    key(thumb(), 'ArrowRight');
    await settle();
    expect(host.active()).toBe(4);
    key(thumb(), 'End');
    await settle();
    expect(host.active()).toBe(5);
    key(thumb(), 'ArrowRight');
    await settle();
    expect(host.active()).toBe(5);
    key(el('.tx-galleria__items'), 'ArrowLeft');
    await settle();
    expect(host.active()).toBe(4);
  });

  it('wraps around when circular', async () => {
    host.circular.set(true);
    await settle();
    (el('.tx-galleria__prev') as HTMLButtonElement).click();
    await settle();
    expect(host.active()).toBe(5);
    (el('.tx-galleria__next') as HTMLButtonElement).click();
    await settle();
    expect(host.active()).toBe(0);
  });

  it('shows indicators that change the item on click and hover', async () => {
    host.indicators.set(true);
    await settle();
    const dots = all('.tx-galleria__indicator-button');
    expect(dots).toHaveLength(6);
    expect(dots[0].getAttribute('aria-current')).toBe('true');
    dots[2].click();
    await settle();
    expect(host.active()).toBe(2);
    dots[4].dispatchEvent(new MouseEvent('mouseenter'));
    await settle();
    expect(host.active()).toBe(4);
    key(all('.tx-galleria__indicator-button')[4], 'Home');
    await settle();
    expect(host.active()).toBe(0);
  });

  it('places indicators and thumbnails on any side and over the item', async () => {
    host.indicators.set(true);
    host.inset.set(true);
    host.indicatorsPosition.set('left');
    host.thumbnailsPosition.set('right');
    await settle();
    const frame = el('.tx-galleria__frame');
    expect(frame.classList).toContain('tx-galleria__frame--inset-indicators');
    expect(frame.getAttribute('data-indicators')).toBe('left');
    expect(frame.getAttribute('data-thumbnails')).toBe('right');
    expect(el('.tx-galleria__thumbnails-viewport').style.height).toBe('300px');
    host.active.set(4);
    await settle();
    expect(el('.tx-galleria__thumbnail-items').style.transform).toBe('translate3d(0, -100%, 0)');
  });

  it('swipes between items', async () => {
    const items = el('.tx-galleria__items');
    items.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 200, clientY: 40 }));
    document.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 120, clientY: 45 }));
    await settle();
    expect(host.active()).toBe(1);
    items.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 100, clientY: 40 }));
    document.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 180, clientY: 40 }));
    await settle();
    expect(host.active()).toBe(0);
  });

  it('plays automatically and stops after a click', async () => {
    vi.useFakeTimers();
    host.autoPlay.set(true);
    fixture.detectChanges();
    expect(host.galleria().isAutoPlayActive()).toBe(true);
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(host.active()).toBe(1);
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(host.active()).toBe(2);
    (el('.tx-galleria__next') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.galleria().isAutoPlayActive()).toBe(false);
    vi.advanceTimersByTime(3000);
    expect(host.active()).toBe(3);
  });
});

describe('TxGalleria full screen', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove()));

  it('opens in a modal layer with own templates and closes on Escape', async () => {
    const fixture = TestBed.createComponent(FullScreenHost);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.tx-galleria__frame')).toBeNull();
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();
    const mask = document.querySelector('.tx-galleria-mask') as HTMLElement;
    expect(mask.getAttribute('role')).toBe('dialog');
    expect(mask.getAttribute('aria-modal')).toBe('true');
    expect(mask.hasAttribute('data-styled')).toBe(false);
    expect(document.activeElement).toBe(document.querySelector('.tx-galleria__close'));
    expect(mask.querySelector('.tx-galleria__item--active .own-item')?.textContent).toBe('1-South');
    expect(mask.querySelector('.own-caption')?.textContent).toBe('About South');
    expect(Array.from(mask.querySelectorAll('.own-dot')).map((dot) => dot.textContent)).toEqual(['0', '1*', '2']);
    expect(mask.querySelector('.own-thumb')).toBeNull();
    key(mask, 'Escape');
    await vi.waitFor(() => expect(document.querySelector('.tx-galleria-mask')).toBeNull());
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('closes with the close button and a click on the mask', async () => {
    const fixture = TestBed.createComponent(FullScreenHost);
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();
    (document.querySelector('.tx-galleria__close') as HTMLElement).click();
    await fixture.whenStable();
    await vi.waitFor(() => expect(document.querySelector('.tx-galleria-mask')).toBeNull());
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();
    (document.querySelector('.tx-galleria__item--active .own-item') as HTMLElement).click();
    expect(fixture.componentInstance.visible()).toBe(true);
    (document.querySelector('.tx-galleria-mask__backdrop') as HTMLElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.visible()).toBe(false);
  });
});

@Component({
  imports: [TxGalleria],
  template: `
    <tx-galleria
      [value]="images()"
      [(activeIndex)]="active"
      [responsiveOptions]="responsive()"
      [effect]="effect()"
      [swipe]="swipe()"
      [circular]="circular()"
      [autoPlay]="autoPlay()"
      [shouldStopAutoplayByClick]="stopByClick()"
      [transitionInterval]="1000"
      showItemNavigators
      showIndicators
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class EdgeHost {
  readonly galleria = viewChild.required(TxGalleria);
  readonly images = signal<TxGalleriaImage[] | null>(IMAGES.slice(0, 4));
  readonly active = signal(0);
  readonly responsive = signal<TxGalleriaResponsiveOption[] | undefined>(undefined);
  readonly effect = signal<TxSwapEffect>('slide');
  readonly swipe = signal(true);
  readonly circular = signal(false);
  readonly autoPlay = signal(false);
  readonly stopByClick = signal(true);
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

function stubAnimations(): { calls: FakeAnimation[]; restore: () => void } {
  const calls: FakeAnimation[] = [];
  const running = { cancel: vi.fn(), finished: Promise.resolve() };
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
    restore: () => {
      delete (HTMLElement.prototype as Partial<Record<'animate' | 'getAnimations', unknown>>).animate;
      delete (HTMLElement.prototype as Partial<Record<'animate' | 'getAnimations', unknown>>).getAnimations;
    },
  };
}

function pointer(type: string, init: { x: number; y?: number; id?: number; pointerType?: string; button?: number }): MouseEvent {
  const event = new MouseEvent(type, { bubbles: true, button: init.button ?? 0, clientX: init.x, clientY: init.y ?? 40 });
  Object.defineProperty(event, 'pointerId', { value: init.id ?? 1 });
  Object.defineProperty(event, 'pointerType', { value: init.pointerType ?? 'touch' });
  return event;
}

describe('TxGalleria edges', () => {
  let fixture: ComponentFixture<EdgeHost>;
  let host: EdgeHost;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const settle = () => fixture.whenStable();

  beforeEach(async () => {
    fixture = TestBed.createComponent(EdgeHost);
    host = fixture.componentInstance;
    await settle();
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('guards the indicator context and renders nothing for a null value', async () => {
    const context: TxGalleriaIndicatorContext = { $implicit: 0, active: true };
    expect(TxGalleriaIndicatorTemplate.ngTemplateContextGuard({} as TxGalleriaIndicatorTemplate, context)).toBe(true);
    host.images.set(null);
    await settle();
    expect(host.galleria().count()).toBe(0);
    expect(all('.tx-galleria__item')).toHaveLength(0);
    host.galleria().next();
    expect(host.active()).toBe(0);
  });

  it('shows a description without a title in the caption', async () => {
    host.images.set([{ src: 'only.jpg', description: 'Just words' }]);
    await settle();
    expect(el('.tx-galleria__caption-text').textContent).toBe('Just words');
    expect(el('.tx-galleria__caption-title')).toBeNull();
  });

  it('follows the responsive breakpoints and stops listening when they go', async () => {
    const queries = new Map<string, { matches: boolean; listeners: Set<() => void>; removeEventListener: ReturnType<typeof vi.fn> }>();
    window.matchMedia = ((media: string) => {
      const query = queries.get(media) ?? { matches: media.includes('768px'), listeners: new Set<() => void>(), removeEventListener: vi.fn() };
      queries.set(media, query);
      return {
        get matches() {
          return query.matches;
        },
        addEventListener: (_type: string, listener: () => void) => query.listeners.add(listener),
        removeEventListener: query.removeEventListener,
      } as unknown as MediaQueryList;
    }) as typeof window.matchMedia;
    host.responsive.set([
      { breakpoint: '1024px', numVisible: 2 },
      { breakpoint: '768px', numVisible: 1 },
    ]);
    await settle();
    expect(host.galleria().visibleThumbnails()).toBe(1);
    expect(el('.tx-galleria__thumbnail-item').style.flexBasis).toBe('100%');
    const small = queries.get('(max-width: 768px)');
    const medium = queries.get('(max-width: 1024px)');
    if (!small || !medium) {
      throw new Error('missing queries');
    }
    small.matches = false;
    medium.matches = true;
    small.listeners.forEach((listener) => listener());
    await settle();
    expect(host.galleria().visibleThumbnails()).toBe(2);
    medium.matches = false;
    medium.listeners.forEach((listener) => listener());
    await settle();
    expect(host.galleria().visibleThumbnails()).toBe(3);
    host.responsive.set(undefined);
    await settle();
    expect(small.removeEventListener).toHaveBeenCalled();
    expect(medium.removeEventListener).toHaveBeenCalled();
  });

  it('ignores responsive options without media queries', async () => {
    host.responsive.set([{ breakpoint: '768px', numVisible: 1 }]);
    await settle();
    expect(host.galleria().visibleThumbnails()).toBe(3);
  });

  it('moves with the thumbnail keys, wraps when circular and focuses the new thumbnail', async () => {
    const thumb = () => all('.tx-galleria__thumbnail')[host.active()];
    const unhandled = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
    thumb().dispatchEvent(unhandled);
    expect(unhandled.defaultPrevented).toBe(false);
    key(thumb(), 'ArrowLeft');
    await settle();
    expect(host.active()).toBe(0);
    key(thumb(), 'ArrowDown');
    await settle();
    expect(host.active()).toBe(1);
    expect(document.activeElement).toBe(all('.tx-galleria__thumbnail')[1]);
    key(thumb(), 'ArrowUp');
    await settle();
    expect(host.active()).toBe(0);
    host.circular.set(true);
    await settle();
    key(thumb(), 'ArrowLeft');
    await settle();
    expect(host.active()).toBe(3);
    key(thumb(), 'ArrowRight');
    await settle();
    expect(host.active()).toBe(0);
  });

  it('moves the items with the arrow keys only on the items box itself', async () => {
    const items = el('.tx-galleria__items');
    key(items, 'ArrowRight');
    await settle();
    expect(host.active()).toBe(1);
    expect(key(items, 'Enter').defaultPrevented).toBe(false);
    key(el('.tx-galleria__item--active'), 'ArrowRight');
    await settle();
    expect(host.active()).toBe(1);
  });

  it('keeps the item on indicator hover unless asked to change it', async () => {
    all('.tx-galleria__indicator-button')[2].dispatchEvent(new MouseEvent('mouseenter'));
    await settle();
    expect(host.active()).toBe(0);
  });

  it('drives the public navigation and autoplay methods', async () => {
    const galleria = host.galleria();
    galleria.next();
    await settle();
    expect(host.active()).toBe(1);
    galleria.prev();
    await settle();
    expect(host.active()).toBe(0);
    galleria.startAutoplay();
    expect(galleria.isAutoPlayActive()).toBe(true);
    galleria.prev();
    expect(galleria.isAutoPlayActive()).toBe(false);
    galleria.prev();
    expect(host.active()).toBe(0);
  });

  it('keeps playing after a click when asked and pauses on hover and focus', async () => {
    vi.useFakeTimers();
    host.stopByClick.set(false);
    host.autoPlay.set(true);
    fixture.detectChanges();
    (el('.tx-galleria__next') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.active()).toBe(1);
    expect(host.galleria().isAutoPlayActive()).toBe(true);
    const frame = el('.tx-galleria__frame');
    frame.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    vi.advanceTimersByTime(2000);
    expect(host.active()).toBe(1);
    frame.dispatchEvent(new MouseEvent('mouseleave'));
    frame.dispatchEvent(new FocusEvent('focusin'));
    fixture.detectChanges();
    vi.advanceTimersByTime(2000);
    expect(host.active()).toBe(1);
    const inside = el('.tx-galleria__next');
    frame.dispatchEvent(new FocusEvent('focusout', { relatedTarget: inside }));
    fixture.detectChanges();
    expect(host.galleria().focused()).toBe(true);
    frame.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null }));
    fixture.detectChanges();
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(host.active()).toBe(2);
  });

  it('ignores swipes that are off, too short, vertical, from buttons, other pointers or cancelled', async () => {
    const items = el('.tx-galleria__items');
    items.dispatchEvent(pointer('pointerdown', { x: 200, pointerType: 'mouse', button: 2 }));
    document.dispatchEvent(pointer('pointerup', { x: 100 }));
    el('.tx-galleria__next').dispatchEvent(pointer('pointerdown', { x: 200 }));
    document.dispatchEvent(pointer('pointerup', { x: 100 }));
    items.dispatchEvent(pointer('pointerdown', { x: 200 }));
    document.dispatchEvent(pointer('pointerup', { x: 190 }));
    items.dispatchEvent(pointer('pointerdown', { x: 200, y: 0 }));
    document.dispatchEvent(pointer('pointerup', { x: 150, y: 200 }));
    items.dispatchEvent(pointer('pointerdown', { x: 200, id: 1 }));
    document.dispatchEvent(pointer('pointerup', { x: 100, id: 2 }));
    items.dispatchEvent(pointer('pointerdown', { x: 200 }));
    document.dispatchEvent(new Event('pointercancel'));
    document.dispatchEvent(pointer('pointerup', { x: 100 }));
    await settle();
    expect(host.active()).toBe(0);
    host.swipe.set(false);
    await settle();
    items.dispatchEvent(pointer('pointerdown', { x: 200 }));
    document.dispatchEvent(pointer('pointerup', { x: 100 }));
    await settle();
    expect(host.active()).toBe(0);
  });

  it('animates the swap with the stage easing and clears the leaving item when done', async () => {
    const animations = stubAnimations();
    try {
      el('.tx-galleria__stage').style.setProperty('--tx-galleria-slide-easing', 'linear');
      host.active.set(2);
      await settle();
      expect(host.galleria().leaving()).toBe(0);
      expect(el('.tx-galleria__item[data-index="0"]').classList).toContain('tx-galleria__item--leaving');
      const [leave, enter] = animations.calls;
      expect(leave.element.getAttribute('data-index')).toBe('0');
      expect(enter.element.getAttribute('data-index')).toBe('2');
      expect(leave.options.easing).toBe('linear');
      expect(enter.options.delay).toBe(0);
      expect(enter.keyframes[0]).toEqual({ transform: 'translate3d(100%, 0, 0)' });
      leave.resolve();
      await vi.waitFor(() => expect(host.galleria().leaving()).toBeNull());
      expect(leave.cancel).toHaveBeenCalled();
    } finally {
      animations.restore();
    }
  });

  it('runs a sequential effect backwards and keeps only the latest swap', async () => {
    const animations = stubAnimations();
    try {
      host.effect.set('flip');
      host.active.set(3);
      await settle();
      const first = animations.calls[0];
      expect(animations.calls[1].options.delay).toBe(first.options.duration);
      expect(first.options.easing).toBe('ease');
      host.active.set(1);
      await settle();
      const second = animations.calls[2];
      expect(second.element.getAttribute('data-index')).toBe('3');
      expect(host.galleria().leaving()).toBe(3);
      first.reject();
      await settle();
      expect(first.cancel).not.toHaveBeenCalled();
      expect(host.galleria().leaving()).toBe(3);
      second.reject();
      await vi.waitFor(() => expect(host.galleria().leaving()).toBeNull());
    } finally {
      animations.restore();
    }
  });

  it('swaps without motion for the none effect and without animation support', async () => {
    host.effect.set('none');
    host.active.set(1);
    await settle();
    expect(host.galleria().leaving()).toBeNull();
    host.effect.set('slide');
    host.active.set(2);
    await settle();
    expect(host.galleria().leaving()).toBeNull();
  });
});

describe('TxGalleria full screen motion', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove()));

  it('skips the swap animation while the layer is closed and animates inside the open layer', async () => {
    const animations = stubAnimations();
    try {
      const fixture = TestBed.createComponent(FullScreenHost);
      await fixture.whenStable();
      fixture.componentInstance.active.set(2);
      await fixture.whenStable();
      expect(animations.calls).toHaveLength(0);
      fixture.componentInstance.visible.set(true);
      await fixture.whenStable();
      fixture.componentInstance.active.set(0);
      await fixture.whenStable();
      expect(animations.calls[0].element.closest('.tx-galleria-mask')).not.toBeNull();
      expect(animations.calls[1].keyframes[0]).toEqual({ transform: 'translate3d(-100%, 0, 0)' });
      fixture.destroy();
      await vi.waitFor(() => expect(document.querySelector('.tx-galleria-mask')).toBeNull());
    } finally {
      animations.restore();
    }
  });

  it('closes when the layer is detached by a navigation', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: Location, useClass: SpyLocation }] });
    const fixture = TestBed.createComponent(FullScreenHost);
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();
    expect(document.querySelector('.tx-galleria-mask')).not.toBeNull();
    (TestBed.inject(Location) as SpyLocation).simulateUrlPop('/elsewhere');
    await fixture.whenStable();
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('still finds its templates when a test overrides the component', async () => {
    TestBed.overrideComponent(TxGalleria, { set: { styles: [] } });
    const fixture = TestBed.createComponent(FullScreenHost);
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();
    const mask = document.querySelector('.tx-galleria-mask') as HTMLElement;
    expect(mask.querySelector('.tx-galleria__item--active .own-item')?.textContent).toBe('1-South');
    expect(mask.querySelector('.own-caption')?.textContent).toBe('About South');
    expect(mask.querySelectorAll('.own-dot')).toHaveLength(3);
    fixture.componentInstance.visible.set(false);
    await fixture.whenStable();
  });
});

describe('galleria item template directives', () => {
  it('narrow their template contexts', () => {
    const context = { $implicit: 'a', index: 0, active: true };
    expect(TxGalleriaItemTemplate.ngTemplateContextGuard({} as TxGalleriaItemTemplate<string>, context)).toBe(true);
    expect(TxGalleriaThumbnailTemplate.ngTemplateContextGuard({} as TxGalleriaThumbnailTemplate<string>, context)).toBe(true);
    expect(TxGalleriaCaptionTemplate.ngTemplateContextGuard({} as TxGalleriaCaptionTemplate<string>, undefined)).toBe(false);
  });
});
