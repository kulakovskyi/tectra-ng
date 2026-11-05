import { ChangeDetectionStrategy, Component, TemplateRef, ViewContainerRef, inject, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { InkPreset } from '@tectra/themes';
import { TECTRA_CONFIG } from '@tectra/core/config';
import { TxOverlay } from './overlay.service';
import { TxOverlayCloseReason } from './overlay.types';

@Component({
  template: `<button #origin>Open</button><ng-template #panel let-name><div class="panel">Hello {{ name }}</div></ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  viewContainerRef = inject(ViewContainerRef);
  readonly panel = viewChild.required<TemplateRef<{ $implicit: string }>>('panel');
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

  it('needs a view container for templates', () => {
    const { fixture, origin, overlay } = setup();
    expect(() => overlay.open(fixture.componentInstance.panel(), { origin })).toThrow(/viewContainerRef/);
  });

  describe('with a sticky header inset', () => {
    function placeOrigin(origin: HTMLElement, top: number) {
      origin.getBoundingClientRect = () => ({ top, bottom: top + 32, left: 0, right: 100, width: 100, height: 32, x: 0, y: top, toJSON: () => ({}) });
    }

    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [{ provide: TECTRA_CONFIG, useValue: { preset: InkPreset, overlay: { viewportInsets: { top: 56 } } } }] });
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
