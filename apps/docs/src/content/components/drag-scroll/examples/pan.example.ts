import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxDragPanDelta, TxDragScroll } from '@tectra-ng/utils/drag-scroll';

@Component({
  selector: 'drag-scroll-pan-example',
  imports: [TxDragScroll],
  template: `
    <div class="canvas" txDragScroll panMode (panMove)="move($event)">
      <span class="dot" [style.transform]="'translate(' + x() + 'px, ' + y() + 'px)'"></span>
    </div>
  `,
  styles: `
    .canvas {
      position: relative;
      height: 180px;
      overflow: hidden;
      border: 1px solid var(--tx-surface-border);
      border-radius: var(--tx-radius-md);
      touch-action: none;
    }
    .dot {
      position: absolute;
      top: 80px;
      left: 50%;
      width: 20px;
      height: 20px;
      margin-left: -10px;
      border-radius: 50%;
      background: var(--tx-primary-500);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DragScrollPanExample {
  readonly x = signal(0);
  readonly y = signal(0);

  move(delta: TxDragPanDelta): void {
    this.x.update((x) => x + delta.dx);
    this.y.update((y) => y + delta.dy);
  }
}
