import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxVirtualScroller, TxVirtualScrollerItem } from '@tectra-ng/ui/virtual-scroller';

@Component({
  selector: 'virtual-scroller-pass-through-example',
  imports: [TxVirtualScroller, TxVirtualScrollerItem],
  template: `
    <tx-virtual-scroller
      ariaLabel="Items"
      scrollHeight="200px"
      [items]="items"
      [itemSize]="40"
      [pt]="pt"
    >
      <ng-template txVirtualScrollerItem let-item>{{ item }}</ng-template>
    </tx-virtual-scroller>
  `,
  styles: `
    tx-virtual-scroller {
      max-width: 360px;
      border: 1px solid var(--tx-surface-border);
      border-radius: var(--tx-radius-md);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VirtualScrollerPassThroughExample {
  readonly items = Array.from({ length: 1000 }, (_, index) => `Item #${index + 1}`);
  readonly pt = {
    item: {
      style: {
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        borderBottom: '1px dashed var(--tx-surface-border)',
      },
    },
  };
}
