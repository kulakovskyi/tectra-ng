import { Location } from '@angular/common';
import { SpyLocation, provideLocationMocks } from '@angular/common/testing';
import { ChangeDetectionStrategy, Component, Injector, TemplateRef, ViewContainerRef, inject, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxImage } from './image.component';
import { TxImageIndicatorTemplate, TxImagePreviewTemplate } from './image.templates';
import { TxOverlayStack } from '@tectra-ng/core/overlay';
import { openImageLayer } from './image-layer';

@Component({
  imports: [TxImage],
  template: `
    <tx-image
      src="small.jpg"
      previewSrc="large.jpg"
      alt="Mountain lake"
      width="240"
      loading="lazy"
      [preview]="preview()"
      [dt]="{ toolbar: { gap: '9px' } }"
      [pt]="{ image: { class: 'own-image' }, toolbar: { class: 'own-toolbar' } }"
      (opened)="events.push('opened')"
      (closed)="events.push('closed')"
      (imageError)="events.push('error')"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly image = viewChild.required(TxImage);
  readonly preview = signal(true);
  readonly events: string[] = [];
}

@Component({
  imports: [TxImage, TxImageIndicatorTemplate, TxImagePreviewTemplate],
  template: `
    <tx-image src="photo.jpg" alt="Photo" preview unstyled>
      <ng-template txImageIndicator><span class="own-indicator">Open</span></ng-template>
      <ng-template txImagePreview let-src let-style="style" let-close="close">
        <figure class="own-preview" [style]="style">
          <img [src]="src" alt="" />
          <input class="own-input" aria-label="Caption" />
          <button type="button" class="own-close" (click)="close()">Done</button>
        </figure>
      </ng-template>
    </tx-image>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TemplateHost {
  readonly image = viewChild.required(TxImage);
}

function key(target: Element, value: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

describe('TxImage', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const layer = (selector: string) => document.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove()));

  it('renders the image with its attributes and parts', () => {
    const image = el('img') as HTMLImageElement;
    expect(image.getAttribute('src')).toBe('small.jpg');
    expect(image.alt).toBe('Mountain lake');
    expect(image.getAttribute('width')).toBe('240');
    expect(image.getAttribute('loading')).toBe('lazy');
    expect(image.classList).toContain('own-image');
    expect(el('tx-image').hasAttribute('data-styled')).toBe(true);
    expect(el('tx-image').style.getPropertyValue('--tx-image-toolbar-gap')).toBe('9px');
  });

  it('shows a preview button only with preview', async () => {
    const button = el('.tx-image__preview');
    expect(button.getAttribute('aria-label')).toBe('Zoom image');
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');
    fixture.componentInstance.preview.set(false);
    await fixture.whenStable();
    expect(el('.tx-image__preview')).toBeNull();
  });

  it('closes open transient overlays when the preview opens', async () => {
    const stack = TestBed.inject(TxOverlayStack);
    const raise = vi.spyOn(stack, 'raise');
    const closed: string[] = [];
    stack.addTransient(() => closed.push('menu'));
    el('.tx-image__preview').click();
    await fixture.whenStable();
    expect(closed).toEqual(['menu']);
    expect(raise).toHaveBeenCalled();
    raise.mockRestore();
  });

  it('opens the preview with the large source, toolbar and focus on close', async () => {
    el('.tx-image__preview').click();
    await fixture.whenStable();
    const dialog = layer('.tx-image-preview');
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Mountain lake');
    expect(dialog.style.getPropertyValue('--tx-image-toolbar-gap')).toBe('9px');
    expect(layer('.tx-image-preview__original').getAttribute('src')).toBe('large.jpg');
    expect(layer('.tx-image-preview__toolbar').classList).toContain('own-toolbar');
    const labels = Array.from(document.querySelectorAll('.tx-image-preview__action')).map((button) => button.getAttribute('aria-label'));
    expect(labels).toEqual(['Rotate right', 'Rotate left', 'Zoom out', 'Zoom in', 'Close']);
    expect(document.activeElement).toBe(layer('.tx-image-preview__close'));
    expect(fixture.componentInstance.events).toEqual(['opened']);
    expect(el('.tx-image__preview').getAttribute('aria-expanded')).toBe('true');
  });

  it('rotates and zooms within the limits', async () => {
    const image = fixture.componentInstance.image();
    image.open();
    await fixture.whenStable();
    const actions = () => Array.from(document.querySelectorAll<HTMLButtonElement>('.tx-image-preview__action'));
    actions()[0].click();
    actions()[0].click();
    actions()[1].click();
    actions()[3].click();
    await fixture.whenStable();
    expect(layer('.tx-image-preview__original').style.transform).toBe('translate(0px, 0px) rotate(90deg) scale(1.1)');
    for (let step = 0; step < 10; step++) {
      image.zoomIn();
    }
    await fixture.whenStable();
    expect(image.scale()).toBe(1.5);
    expect(actions()[3].disabled).toBe(true);
    for (let step = 0; step < 20; step++) {
      image.zoomOut();
    }
    await fixture.whenStable();
    expect(image.scale()).toBe(0.5);
    expect(actions()[2].disabled).toBe(true);
  });

  it('zooms with the keyboard and the wheel', async () => {
    const image = fixture.componentInstance.image();
    image.open();
    await fixture.whenStable();
    const dialog = layer('.tx-image-preview');
    key(dialog, '+');
    key(dialog, '+');
    expect(image.scale()).toBe(1.2);
    key(dialog, '-');
    expect(image.scale()).toBe(1.1);
    key(dialog, '0');
    expect(image.scale()).toBe(1);
    const wheel = new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true });
    layer('.tx-image-preview__original').dispatchEvent(wheel);
    expect(wheel.defaultPrevented).toBe(true);
    expect(image.scale()).toBe(1.1);
  });

  it('pans a zoomed image with the pointer', async () => {
    const image = fixture.componentInstance.image();
    image.open();
    image.zoomIn();
    await fixture.whenStable();
    const original = layer('.tx-image-preview__original');
    original.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 10, clientY: 10 }));
    document.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 40, clientY: 30 }));
    document.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
    expect(image.offset()).toEqual({ x: 30, y: 20 });
    image.resetZoom();
    expect(image.offset()).toEqual({ x: 0, y: 0 });
  });

  it('closes on Escape, on the mask and with the close button', async () => {
    const image = fixture.componentInstance.image();
    image.open();
    await fixture.whenStable();
    key(layer('.tx-image-preview'), 'Escape');
    await vi.waitFor(() => expect(layer('.tx-image-preview')).toBeNull());
    expect(fixture.componentInstance.events).toEqual(['opened', 'closed']);
    expect(document.activeElement).not.toBe(document.body.querySelector('.tx-image-preview__close'));

    image.open();
    await fixture.whenStable();
    layer('.tx-image-preview__original').click();
    expect(layer('.tx-image-preview')).not.toBeNull();
    layer('.tx-image-preview__stage').click();
    await vi.waitFor(() => expect(layer('.tx-image-preview')).toBeNull());

    image.open();
    await fixture.whenStable();
    layer('.tx-image-preview__close').click();
    await vi.waitFor(() => expect(layer('.tx-image-preview')).toBeNull());
    expect(fixture.componentInstance.events.filter((event) => event === 'closed')).toHaveLength(3);
  });

  it('reports a broken image', () => {
    el('img').dispatchEvent(new Event('error'));
    expect(fixture.componentInstance.events).toEqual(['error']);
  });
});

describe('TxImage templates', () => {
  it('renders own indicator and preview content without styles', async () => {
    const fixture = TestBed.createComponent(TemplateHost);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('tx-image')?.hasAttribute('data-styled')).toBe(false);
    expect(root.querySelector('.own-indicator')?.textContent).toBe('Open');
    fixture.componentInstance.image().open();
    fixture.componentInstance.image().rotateRight();
    await fixture.whenStable();
    const figure = document.querySelector('.own-preview') as HTMLElement;
    expect(figure.style.transform).toBe('translate(0px, 0px) rotate(90deg) scale(1)');
    expect(figure.querySelector('img')?.getAttribute('src')).toBe('photo.jpg');
    (document.querySelector('.own-close') as HTMLElement).click();
    await vi.waitFor(() => expect(document.querySelector('.own-preview')).toBeNull());
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });
});

@Component({
  imports: [TxImage],
  template: `
    <tx-image
      [src]="src()"
      [srcSet]="srcSet()"
      [sizes]="sizes()"
      [previewSrc]="previewSrc()"
      [previewSrcSet]="previewSrcSet()"
      [previewSizes]="previewSizes()"
      [alt]="alt()"
      [ariaLabel]="ariaLabel()"
      preview
      (closed)="events.push('closed')"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SourcesHost {
  readonly image = viewChild.required(TxImage);
  readonly src = signal<string | undefined>('small.jpg');
  readonly srcSet = signal<string | undefined>('small.jpg 1x, small@2x.jpg 2x');
  readonly sizes = signal<string | undefined>('100vw');
  readonly previewSrc = signal<string | undefined>(undefined);
  readonly previewSrcSet = signal<string | undefined>(undefined);
  readonly previewSizes = signal<string | undefined>(undefined);
  readonly alt = signal<string | undefined>(undefined);
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly events: string[] = [];
}

describe('TxImage sources and gestures', () => {
  let fixture: ComponentFixture<SourcesHost>;
  let image: TxImage;
  const layer = (selector: string) => document.querySelector(selector) as HTMLElement;
  const pointer = (type: string, init: MouseEventInit, pointerId = 1) => {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, ...init });
    Object.defineProperty(event, 'pointerId', { value: pointerId });
    return event;
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideLocationMocks()] });
    fixture = TestBed.createComponent(SourcesHost);
    await fixture.whenStable();
    image = fixture.componentInstance.image();
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  it('falls back to the small sources and the default label', async () => {
    expect(image.fullSrc()).toBe('small.jpg');
    expect(image.fullSrcSet()).toBe('small.jpg 1x, small@2x.jpg 2x');
    expect(image.fullSizes()).toBe('100vw');
    expect(image.previewLabel()).toBe('Image preview');
    expect(image.previewContext().alt).toBe('');
    fixture.componentInstance.previewSrcSet.set('large.jpg 1x');
    fixture.componentInstance.previewSizes.set('50vw');
    fixture.componentInstance.ariaLabel.set('Lake');
    await fixture.whenStable();
    expect(image.fullSrcSet()).toBe('large.jpg 1x');
    expect(image.fullSizes()).toBe('50vw');
    expect(image.previewLabel()).toBe('Lake');
    fixture.componentInstance.previewSrc.set('large.jpg');
    fixture.componentInstance.previewSrcSet.set(undefined);
    fixture.componentInstance.previewSizes.set(undefined);
    await fixture.whenStable();
    expect(image.fullSrcSet()).toBeUndefined();
    expect(image.fullSizes()).toBeUndefined();
    fixture.componentInstance.previewSrc.set(undefined);
    fixture.componentInstance.src.set(undefined);
    await fixture.whenStable();
    expect(image.fullSrc()).toBe('');
  });

  it('opens once, ignores close while closed and closes when the browser navigates', async () => {
    image.close();
    expect(fixture.componentInstance.events).toEqual([]);
    image.open();
    image.open();
    await fixture.whenStable();
    expect(document.querySelectorAll('.tx-image-preview')).toHaveLength(1);
    (TestBed.inject(Location) as SpyLocation).simulateUrlPop('/elsewhere');
    await vi.waitFor(() => expect(fixture.componentInstance.events).toEqual(['closed']));
    expect(image.visible()).toBe(false);
  });

  it('zooms with the equals key and the wheel, and leaves modified and other keys alone', async () => {
    image.open();
    await fixture.whenStable();
    const dialog = layer('.tx-image-preview');
    key(dialog, '=');
    expect(image.scale()).toBe(1.1);
    const ctrl = new KeyboardEvent('keydown', { key: '+', ctrlKey: true, bubbles: true, cancelable: true });
    dialog.dispatchEvent(ctrl);
    expect(ctrl.defaultPrevented).toBe(false);
    expect(key(dialog, 'x').defaultPrevented).toBe(false);
    expect(image.scale()).toBe(1.1);
    const original = layer('.tx-image-preview__original');
    const flat = new WheelEvent('wheel', { deltaY: 0, bubbles: true, cancelable: true });
    original.dispatchEvent(flat);
    expect(flat.defaultPrevented).toBe(false);
    original.dispatchEvent(new WheelEvent('wheel', { deltaY: 50, bubbles: true, cancelable: true }));
    expect(image.scale()).toBe(1);
  });

  it('toggles the zoom with a double click', async () => {
    image.open();
    await fixture.whenStable();
    const original = layer('.tx-image-preview__original');
    original.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(image.scale()).toBe(1.5);
    await fixture.whenStable();
    expect(original.classList).toContain('tx-image-preview__original--zoomed');
    original.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(image.scale()).toBe(1);
  });

  it('pans only a zoomed image with the main button, past a small threshold and for the same pointer', async () => {
    image.open();
    await fixture.whenStable();
    const original = layer('.tx-image-preview__original');
    const flat = pointer('pointerdown', { button: 0, clientX: 0, clientY: 0 });
    original.dispatchEvent(flat);
    expect(flat.defaultPrevented).toBe(false);
    image.zoomIn();
    const secondary = pointer('pointerdown', { button: 2, clientX: 0, clientY: 0 });
    original.dispatchEvent(secondary);
    expect(secondary.defaultPrevented).toBe(false);
    original.dispatchEvent(pointer('pointerdown', { button: 0, clientX: 0, clientY: 0 }));
    document.dispatchEvent(pointer('pointermove', { clientX: 2, clientY: 1 }));
    expect(image.panning()).toBe(false);
    document.dispatchEvent(pointer('pointermove', { clientX: 50, clientY: 50 }, 7));
    expect(image.offset()).toEqual({ x: 0, y: 0 });
    document.dispatchEvent(pointer('pointermove', { clientX: 20, clientY: 10 }));
    expect(image.panning()).toBe(true);
    expect(image.offset()).toEqual({ x: 20, y: 10 });
    document.dispatchEvent(pointer('pointercancel', {}));
    expect(image.panning()).toBe(false);
  });
});

describe('TxImage custom preview keys', () => {
  it('leaves keys typed into a field of the preview alone', async () => {
    const fixture = TestBed.createComponent(TemplateHost);
    await fixture.whenStable();
    const image = fixture.componentInstance.image();
    image.open();
    await fixture.whenStable();
    const input = document.querySelector('.own-input') as HTMLInputElement;
    expect(key(input, '+').defaultPrevented).toBe(false);
    expect(image.scale()).toBe(1);
    fixture.destroy();
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  it('narrows the template contexts', () => {
    expect(TxImageIndicatorTemplate.ngTemplateContextGuard({} as TxImageIndicatorTemplate, { $implicit: 'a.jpg' })).toBe(true);
    expect(TxImagePreviewTemplate.ngTemplateContextGuard({} as TxImagePreviewTemplate, null)).toBe(false);
  });
});

@Component({
  template: `<button id="opener">Open</button><ng-template #tpl><div class="body"><button class="first">First</button></div></ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LayerHost {
  readonly tpl = viewChild.required<TemplateRef<unknown>>('tpl');
  readonly injector = inject(Injector);
  readonly viewContainerRef = inject(ViewContainerRef);
}

describe('openImageLayer', () => {
  let fixture: ComponentFixture<LayerHost>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(LayerHost);
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  it('focuses the first control when the asked one is missing, waits for leave animations and closes once', async () => {
    const opener = fixture.nativeElement.querySelector('#opener') as HTMLButtonElement;
    opener.focus();
    const onEscape = vi.fn();
    const host = fixture.componentInstance;
    const layer = openImageLayer(host.tpl(), { injector: host.injector, viewContainerRef: host.viewContainerRef, focus: '.missing', onEscape });
    expect(document.activeElement).toBe(layer.element.querySelector('.first'));
    const leaving = { finished: Promise.reject(new Error('cancelled')) } as unknown as Animation;
    layer.element.getAnimations = vi.fn(() => [leaving]);
    const closing = layer.close();
    expect(layer.close()).toBe(closing);
    layer.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(layer.element.querySelector('.body')?.classList).toContain('tx-image-layer--leaving');
    await closing;
    expect(onEscape).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(opener);
  });

  it('skips focus restore when the opener is gone and works without callbacks', async () => {
    const opener = fixture.nativeElement.querySelector('#opener') as HTMLButtonElement;
    opener.focus();
    const host = fixture.componentInstance;
    const layer = openImageLayer(host.tpl(), { injector: host.injector, viewContainerRef: host.viewContainerRef });
    expect(document.activeElement).toBe(layer.element.querySelector('.first'));
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    opener.remove();
    await layer.close();
    expect(document.contains(layer.element)).toBe(false);
  });
});
