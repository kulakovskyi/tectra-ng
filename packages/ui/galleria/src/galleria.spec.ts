import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxGalleria } from './galleria.component';
import { TxGalleriaCaptionTemplate, TxGalleriaFooter, TxGalleriaHeader, TxGalleriaIndicatorTemplate, TxGalleriaItemTemplate, TxGalleriaThumbnailTemplate } from './galleria.templates';
import { TxGalleriaImage, TxGalleriaPosition } from './galleria.types';

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
