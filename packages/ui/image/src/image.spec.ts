import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxImage } from './image.component';
import { TxImageIndicatorTemplate, TxImagePreviewTemplate } from './image.templates';

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
