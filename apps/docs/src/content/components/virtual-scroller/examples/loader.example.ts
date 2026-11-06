import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSkeleton } from '@tectra-ng/ui/skeleton';
import {
  TxVirtualScroller,
  TxVirtualScrollerItem,
  TxVirtualScrollerLoader,
} from '@tectra-ng/ui/virtual-scroller';

@Component({
  selector: 'virtual-scroller-loader-example',
  imports: [TxVirtualScroller, TxVirtualScrollerItem, TxVirtualScrollerLoader, TxSkeleton],
  template: `
    <div class="grid">
      <tx-virtual-scroller
        ariaLabel="Items with loaders"
        showLoader
        scrollHeight="200px"
        [delay]="250"
        [items]="items"
        [itemSize]="40"
      >
        <ng-template txVirtualScrollerItem let-item
          ><div class="item">{{ item }}</div></ng-template
        >
        <ng-template txVirtualScrollerLoader
          ><div class="item"><tx-skeleton width="50%" height="14px" /></div
        ></ng-template>
      </tx-virtual-scroller>
      <tx-virtual-scroller
        ariaLabel="Items with a mask"
        showLoader
        scrollHeight="200px"
        [delay]="250"
        [items]="items"
        [itemSize]="40"
      >
        <ng-template txVirtualScrollerItem let-item
          ><div class="item">{{ item }}</div></ng-template
        >
      </tx-virtual-scroller>
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 24px;
    }
    tx-virtual-scroller {
      border: 1px solid var(--tx-surface-border);
      border-radius: var(--tx-radius-md);
    }
    .item {
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VirtualScrollerLoaderExample {
  readonly items = Array.from({ length: 10000 }, (_, index) => `Item #${index + 1}`);
}
