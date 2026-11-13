import { DestroyRef, Directive, ElementRef, booleanAttribute, inject, input, output, signal } from '@angular/core';

/** How far the pointer moved during a pan, in px. */
export interface TxDragPanDelta {
  /** Horizontal move since the last event. */
  dx: number;
  /** Vertical move since the last event. */
  dy: number;
}

const DRAG_THRESHOLD = 4;
const IGNORED = 'button, a, input, textarea, select, label, [contenteditable="true"], [data-drag-ignore]';

@Directive({
  selector: '[txDragScroll]',
  exportAs: 'txDragScroll',
  host: {
    class: 'tx-drag-scroll',
    '[class.tx-drag-scroll--dragging]': 'isDragging()',
    '[style.cursor]': 'disabled() ? null : isDragging() ? "grabbing" : "grab"',
    '[style.user-select]': 'isDragging() ? "none" : null',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerUp($event)',
  },
})
export class TxDragScroll {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly panMode = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly panMove = output<TxDragPanDelta>();
  readonly dragStart = output<void>();
  readonly dragEnd = output<void>();

  readonly isDragging = signal(false);

  private pointerId: number | null = null;
  private start = { x: 0, y: 0, left: 0, top: 0 };
  private last = { x: 0, y: 0 };
  private moved = false;
  private readonly swallowClick = (event: MouseEvent): void => {
    if (this.moved) {
      event.stopPropagation();
      event.preventDefault();
      this.moved = false;
    }
  };

  constructor() {
    this.host.addEventListener?.('click', this.swallowClick, true);
    inject(DestroyRef).onDestroy(() => this.host.removeEventListener?.('click', this.swallowClick, true));
  }

  protected onPointerDown(event: PointerEvent): void {
    if (this.disabled() || event.button !== 0 || event.pointerType === 'touch' || (event.target instanceof Element && event.target.closest(IGNORED))) {
      return;
    }
    this.pointerId = event.pointerId;
    this.start = { x: event.clientX, y: event.clientY, left: this.host.scrollLeft, top: this.host.scrollTop };
    this.last = { x: event.clientX, y: event.clientY };
    this.moved = false;
  }

  protected onPointerMove(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - this.start.x;
    const dy = event.clientY - this.start.y;
    if (!this.moved && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) {
      return;
    }
    if (!this.moved) {
      this.moved = true;
      this.isDragging.set(true);
      this.host.setPointerCapture?.(event.pointerId);
      this.dragStart.emit();
    }
    if (this.panMode()) {
      this.panMove.emit({ dx: event.clientX - this.last.x, dy: event.clientY - this.last.y });
    } else {
      this.host.scrollLeft = this.start.left - dx;
      this.host.scrollTop = this.start.top - dy;
    }
    this.last = { x: event.clientX, y: event.clientY };
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) {
      return;
    }
    this.host.releasePointerCapture?.(event.pointerId);
    this.pointerId = null;
    if (this.isDragging()) {
      this.isDragging.set(false);
      this.dragEnd.emit();
    }
  }
}
