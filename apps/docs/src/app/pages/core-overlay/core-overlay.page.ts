import { ChangeDetectionStrategy, Component, DestroyRef, TemplateRef, ViewContainerRef, inject, signal, viewChild } from '@angular/core';
import { TxOverlay, TxOverlayRef, TxPlacement } from '@tectra/core/overlay';
import { TxButton } from '@tectra/ui/button';
import { CodeBlock } from '../../doc-ui/code-block/code-block';
import { OVERLAY_INSETS_EXAMPLE, OVERLAY_USAGE_EXAMPLE } from '../../data/code-examples.data';
import { OVERLAY_DEMO_ROWS } from '../../data/overlay-demo.data';

@Component({
  selector: 'docs-core-overlay-page',
  imports: [TxButton, CodeBlock],
  templateUrl: './core-overlay.page.html',
  styleUrls: ['../page.scss', './core-overlay.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CoreOverlayPage {
  private txOverlay = inject(TxOverlay);
  private viewContainerRef = inject(ViewContainerRef);

  readonly rows = OVERLAY_DEMO_ROWS;
  readonly usageExample = OVERLAY_USAGE_EXAMPLE;
  readonly insetsExample = OVERLAY_INSETS_EXAMPLE;
  panel = viewChild.required<TemplateRef<{ $implicit: TxPlacement }>>('panel');
  current = signal<TxOverlayRef | null>(null);
  lastClose = signal<string>('—');

  constructor() {
    inject(DestroyRef).onDestroy(() => this.current()?.close());
  }

  open(event: MouseEvent, placement: TxPlacement): void {
    const origin = event.currentTarget as HTMLElement;
    this.current()?.close();
    const ref = this.txOverlay.open(this.panel(), {
      origin,
      placement,
      offset: 8,
      layer: 'popover',
      viewContainerRef: this.viewContainerRef,
      context: { $implicit: placement },
    });
    ref.closed.subscribe((reason) => {
      this.lastClose.set(reason);
      if (this.current() === ref) {
        this.current.set(null);
      }
    });
    this.current.set(ref);
  }
}
