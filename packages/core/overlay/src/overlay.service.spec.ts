import { ChangeDetectionStrategy, Component, TemplateRef, ViewContainerRef, inject, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Tectra } from '@tectra-ng/themes';
import { TECTRA_CONFIG } from '@tectra-ng/core/config';
import { TxOverlay } from './overlay.service';
import { TxOverlayCloseReason } from './overlay.types';

@Component({
  template: `
    <button #origin>Open</button>
    <span id="outside">Outside</span>
    <ng-template #panel let-name><div class="panel">Hello {{ name }}</div></ng-template>
    <ng-template #plain>Just text</ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  viewContainerRef = inject(ViewContainerRef);
  readonly panel = viewChild.required<TemplateRef<{ $implicit: string }>>('panel');
  readonly plain = viewChild.required<TemplateRef<unknown>>('plain');
}

@Component({ selector: 'test-panel', template: 'Component panel', changeDetection: ChangeDetectionStrategy.OnPush })
class Panel {}

describe('TxOverlay', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const origin = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    return { fixture, origin, overlay: TestBed.inject(TxOverlay) };
  }

  afterEach(() => document.querySelector('.cdk-overlay-container')?.remove());

  it('opens a template next to the origin on its layer', () => {
    const { fixture, origin, overlay } = setup();
    const ref = overlay.open(fixture.componentInstance.panel(), {
      origin,
      viewContainerRef: fixture.componentInstance.viewContainerRef,
      context: { $implicit: 'tectra' },
      layer: 'tooltip',
    });
    fixture.detectChanges();
    expect(ref.element.textContent).toContain('Hello tectra');
    expect(ref.element.classList).toContain('tx-overlay-pane');
    expect(ref.element.parentElement?.style.zIndex).toBe('var(--tx-layer-tooltip)');
    expect(ref.placement()).toBe('bottom-start');
    ref.close();
  });

  it('opens a component and closes on Escape, restoring focus', async () => {
    const { origin, overlay } = setup();
    origin.focus();
    const reasons: TxOverlayCloseReason[] = [];
    const ref = overlay.open(Panel, { origin });
    ref.closed.subscribe((reason) => reasons.push(reason));
    expect(ref.instance).toBeInstanceOf(Panel);
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(reasons).toEqual(['escape']);
    expect(document.activeElement).toBe(origin);
    await Promise.resolve();
    expect(document.querySelector('test-panel')).toBeNull();
  });

  it('keeps open on Escape when closeOnEscape is false', () => {
    const { origin, overlay } = setup();
    const ref = overlay.open(Panel, { origin, closeOnEscape: false });
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.querySelector('test-panel')).not.toBeNull();
    ref.close();
  });

  it('closes when a scrolling container of the origin scrolls, but not when the page does', () => {
    const { fixture, origin, overlay } = setup();
    const container = fixture.nativeElement as HTMLElement;
    container.style.overflowY = 'auto';
    const reasons: TxOverlayCloseReason[] = [];
    const ref = overlay.open(Panel, { origin });
    ref.closed.subscribe((reason) => reasons.push(reason));
    document.dispatchEvent(new Event('scroll'));
    expect(reasons).toEqual([]);
    container.dispatchEvent(new Event('scroll'));
    expect(reasons).toEqual(['scroll']);
  });

  it('closes once, on a click outside the origin, without taking focus back', async () => {
    const { fixture, origin, overlay } = setup();
    document.body.appendChild(fixture.nativeElement);
    origin.focus();
    const reasons: TxOverlayCloseReason[] = [];
    const ref = overlay.open(Panel, { origin, matchWidth: true });
    ref.closed.subscribe((reason) => reasons.push(reason));
    const outside = fixture.nativeElement.querySelector('#outside') as HTMLElement;
    for (const target of [origin, outside]) {
      target.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
      target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
    expect(reasons).toEqual(['outside']);
    ref.close();
    expect(reasons).toEqual(['outside']);
    await Promise.resolve();
    fixture.nativeElement.remove();
  });

  it('ignores outside clicks when closeOnOutsideClick is false and restoreFocus is off', () => {
    const { fixture, origin, overlay } = setup();
    document.body.appendChild(fixture.nativeElement);
    const reasons: TxOverlayCloseReason[] = [];
    const ref = overlay.open(Panel, { origin, closeOnOutsideClick: false, restoreFocus: false, animate: false });
    ref.closed.subscribe((reason) => reasons.push(reason));
    const outside = fixture.nativeElement.querySelector('#outside') as HTMLElement;
    outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(reasons).toEqual([]);
    ref.close();
    expect(reasons).toEqual(['api']);
    fixture.nativeElement.remove();
  });

  it('closes with the scroll reason when the close strategy detaches it', async () => {
    const { origin, overlay } = setup();
    const reasons: TxOverlayCloseReason[] = [];
    const ref = overlay.open(Panel, { origin, scroll: 'close', motion: 'pop' });
    ref.closed.subscribe((reason) => reasons.push(reason));
    document.dispatchEvent(new Event('scroll'));
    await vi.waitFor(() => expect(reasons).toEqual(['scroll']));
  });

  it('reports a detachment when the template view goes away and animates a text-only panel', async () => {
    const { fixture, origin, overlay } = setup();
    const reasons: TxOverlayCloseReason[] = [];
    const ref = overlay.open(fixture.componentInstance.plain(), { origin, viewContainerRef: fixture.componentInstance.viewContainerRef, scroll: 'block' });
    ref.closed.subscribe((reason) => reasons.push(reason));
    expect(ref.element.textContent).toContain('Just text');
    fixture.destroy();
    await vi.waitFor(() => expect(reasons).toEqual(['detached']));
  });

  it('needs a view container for templates', () => {
    const { fixture, origin, overlay } = setup();
    expect(() => overlay.open(fixture.componentInstance.panel(), { origin })).toThrow(/viewContainerRef/);
  });

  describe('with a sticky header inset', () => {
    function placeOrigin(origin: HTMLElement, top: number) {
      origin.getBoundingClientRect = () => ({ top, bottom: top + 32, left: 0, right: 100, width: 100, height: 32, x: 0, y: top, toJSON: () => ({}) });
    }

    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [{ provide: TECTRA_CONFIG, useValue: { preset: Tectra, overlay: { viewportInsets: { top: 56 } } } }] });
    });

    it('keeps the panel open while the origin scrolls under the header', () => {
      const { origin, overlay } = setup();
      const reasons: TxOverlayCloseReason[] = [];
      const ref = overlay.open(Panel, { origin });
      ref.closed.subscribe((reason) => reasons.push(reason));
      placeOrigin(origin, 10);
      document.dispatchEvent(new Event('scroll'));
      expect(reasons).toEqual([]);
      expect(document.querySelector('test-panel')).not.toBeNull();
      ref.close();
    });

    it('keeps the panel when scroll is not reposition', () => {
      const { origin, overlay } = setup();
      const reasons: TxOverlayCloseReason[] = [];
      const ref = overlay.open(Panel, { origin, scroll: 'none' });
      ref.closed.subscribe((reason) => reasons.push(reason));
      placeOrigin(origin, 0);
      document.dispatchEvent(new Event('scroll'));
      expect(reasons).toEqual([]);
      ref.close();
    });
  });
});
