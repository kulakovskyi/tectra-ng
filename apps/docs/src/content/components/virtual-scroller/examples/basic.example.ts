import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxVirtualScroller, TxVirtualScrollerItem } from '@tectra-ng/ui/virtual-scroller';

@Component({
  selector: 'virtual-scroller-basic-example',
  imports: [TxVirtualScroller, TxVirtualScrollerItem],
  template: `
    <tx-virtual-scroller ariaLabel="Items" scrollHeight="240px" [items]="items" [itemSize]="40">
      <ng-template txVirtualScrollerItem let-item let-odd="odd">
        <div class="item" [class.odd]="odd">{{ item }}</div>
      </ng-template>
    </tx-virtual-scroller>
  `,
  styles: `
    tx-virtual-scroller {
      max-width: 360px;
      border: 1px solid var(--tx-surface-border);
      border-radius: var(--tx-radius-md);
    }
    .item {
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 12px;
    }
    .odd {
      background: var(--tx-surface-hover);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VirtualScrollerBasicExample {
  readonly items = Array.from({ length: 10000 }, (_, index) => `Item #${index + 1}`);
}
