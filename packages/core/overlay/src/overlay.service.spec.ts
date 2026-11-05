import { ChangeDetectionStrategy, Component, TemplateRef, ViewContainerRef, inject, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxOverlay } from './overlay.service';
import { TxOverlayCloseReason } from './overlay.types';

@Component({
  template: `<button #origin>Open</button><ng-template #panel let-name><div class="panel">Hello {{ name }}</div></ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  viewContainerRef = inject(ViewContainerRef);
  panel = viewChild.required<TemplateRef<{ $implicit: string }>>('panel');
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

  it('opens a component and closes on Escape, restoring focus', () => {
    const { origin, overlay } = setup();
    origin.focus();
    const reasons: TxOverlayCloseReason[] = [];
    const ref = overlay.open(Panel, { origin });
    ref.closed.subscribe((reason) => reasons.push(reason));
    expect(ref.instance).toBeInstanceOf(Panel);
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(reasons).toEqual(['escape']);
    expect(document.activeElement).toBe(origin);
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
});
