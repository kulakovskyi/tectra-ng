import { CdkConnectedOverlay, ConnectedPosition } from '@angular/cdk/overlay';
import { Injector, afterNextRender, signal } from '@angular/core';
import { orderByRoom } from './placements';
import { txLayoutRect } from './overlay-viewport';
import { TxOverlayInsetValues } from './overlay.types';
import { txConnectedMargin, txOverlayBounds } from './overlay-insets.service';

/** Picks the position of a CDK connected overlay that has room, for components that use `cdkConnectedOverlay`. */
export class TxOverlayRoom {
  private insets: TxOverlayInsetValues = { top: 0, bottom: 0 };
  /** Signal with the positions to give the overlay, the one with room first. */
  readonly positions;
  /** Signal with the viewport margin to give the overlay. */
  readonly viewportMargin;

  constructor(
    private readonly preferred: ConnectedPosition[],
    private readonly margin = 8,
  ) {
    this.positions = signal(preferred);
    this.viewportMargin = signal(txConnectedMargin(this.insets, margin));
  }

  /** Resets the positions to the preferred order and sets the bar insets when the overlay opens. */
  open(insets: TxOverlayInsetValues): void {
    this.insets = insets;
    this.viewportMargin.set(txConnectedMargin(insets, this.margin));
    this.positions.set(this.preferred);
  }

  /** Updates the bar insets and the viewport margin. */
  move(insets: TxOverlayInsetValues): void {
    this.insets = insets;
    this.viewportMargin.set(txConnectedMargin(insets, this.margin));
  }

  /**
   * Reorders the positions so one with room comes first; returns `true` when the order changed and the
   * overlay is going to be repositioned.
   */
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

  /** Updates the insets, then reorders the positions or repositions the overlay. */
  follow(insets: TxOverlayInsetValues, origin: Element, panel: HTMLElement | null | undefined, overlay: CdkConnectedOverlay | undefined, injector: Injector): void {
    this.move(insets);
    if (!this.fit(origin, panel, overlay, injector)) {
      overlay?.overlayRef?.updatePosition();
    }
  }
}
