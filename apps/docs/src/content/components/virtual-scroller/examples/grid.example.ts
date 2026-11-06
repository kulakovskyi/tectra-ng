import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxVirtualScroller, TxVirtualScrollerItem } from '@tectra-ng/ui/virtual-scroller';

@Component({
  selector: 'virtual-scroller-grid-example',
  imports: [TxVirtualScroller, TxVirtualScrollerItem],
  template: `
    <tx-virtual-scroller
      ariaLabel="Cells"
      orientation="both"
      scrollHeight="240px"
      [items]="cells"
      [itemSize]="[40, 110]"
    >
      <ng-template txVirtualScrollerItem let-cell>
        <div class="cell">{{ cell }}</div>
      </ng-template>
    </tx-virtual-scroller>
  `,
  styles: `
    tx-virtual-scroller {
      border: 1px solid var(--tx-surface-border);
      border-radius: var(--tx-radius-md);
    }
    .cell {
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 12px;
      border-inline-end: 1px solid var(--tx-surface-border);
      border-bottom: 1px solid var(--tx-surface-border);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VirtualScrollerGridExample {
  readonly cells = Array.from({ length: 1000 }, (_, row) =>
    Array.from({ length: 1000 }, (_, column) => `R${row + 1} · C${column + 1}`),
  );
}
