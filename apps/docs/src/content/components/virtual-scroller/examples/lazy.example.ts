import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSkeleton } from '@tectra-ng/ui/skeleton';
import {
  TxVirtualScroller,
  TxVirtualScrollerItem,
  TxVirtualScrollerLazyLoadEvent,
  TxVirtualScrollerLoader,
} from '@tectra-ng/ui/virtual-scroller';

@Component({
  selector: 'virtual-scroller-lazy-example',
  imports: [TxVirtualScroller, TxVirtualScrollerItem, TxVirtualScrollerLoader, TxSkeleton],
  template: `
    <tx-virtual-scroller
      ariaLabel="Orders from the server"
      lazy
      scrollHeight="240px"
      [step]="20"
      [items]="orders()"
      [itemSize]="40"
      (lazyLoad)="load($event)"
    >
      <ng-template txVirtualScrollerItem let-order>
        <div class="item">{{ order }}</div>
      </ng-template>
      <ng-template txVirtualScrollerLoader>
        <div class="item"><tx-skeleton width="60%" height="14px" /></div>
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
      border-bottom: 1px solid var(--tx-surface-border);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VirtualScrollerLazyExample {
  readonly orders = signal<(string | undefined)[]>(Array.from({ length: 5000 }));

  load({ first, last }: TxVirtualScrollerLazyLoadEvent): void {
    setTimeout(() => {
      this.orders.update((orders) => {
        const next = [...orders];
        for (let index = first; index < last; index += 1) next[index] ??= `Order #${10000 + index}`;
        return next;
      });
    }, 600);
  }
}
