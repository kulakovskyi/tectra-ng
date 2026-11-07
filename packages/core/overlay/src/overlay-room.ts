import { CdkConnectedOverlay, ConnectedPosition } from '@angular/cdk/overlay';
import { Injector, afterNextRender, signal } from '@angular/core';
import { orderByRoom } from './placements';
import { txLayoutRect } from './overlay-viewport';
import { TxOverlayInsetValues } from './overlay.types';
import { txConnectedMargin, txOverlayBounds } from './overlay-insets.service';

export class TxOverlayRoom {
  private insets: TxOverlayInsetValues = { top: 0, bottom: 0 };
  readonly positions;
  readonly viewportMargin;

  constructor(
    private readonly preferred: ConnectedPosition[],
    private readonly margin = 8,
  ) {
    this.positions = signal(preferred);
    this.viewportMargin = signal(txConnectedMargin(this.insets, margin));
  }

  open(insets: TxOverlayInsetValues): void {
    this.insets = insets;
    this.viewportMargin.set(txConnectedMargin(insets, this.margin));
    this.positions.set(this.preferred);
  }

  move(insets: TxOverlayInsetValues): void {
    this.insets = insets;
    this.viewportMargin.set(txConnectedMargin(insets, this.margin));
  }

  fit(origin: Element, panel: HTMLElement | null | undefined, overlay: CdkConnectedOverlay | undefined, injector: Injector): boolean {
    if (!panel) {
      return false;
    }
    const size = { width: panel.offsetWidth, height: panel.offsetHeight };
    const bounds = txOverlayBounds(this.insets, this.margin, origin.ownerDocument);
    const ordered = orderByRoom(this.preferred, txLayoutRect(origin), size, bounds);
    if (ordered[0] === this.positions()[0]) {
      return false;
    }
    this.positions.set(ordered);
    afterNextRender(() => overlay?.overlayRef?.updatePosition(), { injector });
    return true;
  }

  follow(insets: TxOverlayInsetValues, origin: Element, panel: HTMLElement | null | undefined, overlay: CdkConnectedOverlay | undefined, injector: Injector): void {
    this.move(insets);
    if (!this.fit(origin, panel, overlay, injector)) {
      overlay?.overlayRef?.updatePosition();
    }
  }
}
