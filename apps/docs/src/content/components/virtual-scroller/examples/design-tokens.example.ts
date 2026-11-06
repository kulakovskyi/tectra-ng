import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxVirtualScroller, TxVirtualScrollerItem } from '@tectra-ng/ui/virtual-scroller';

@Component({
  selector: 'virtual-scroller-design-tokens-example',
  imports: [TxVirtualScroller, TxVirtualScrollerItem],
  template: `
    <tx-virtual-scroller
      ariaLabel="Items"
      showLoader
      loading
      scrollHeight="200px"
      [items]="items"
      [itemSize]="40"
      [dt]="tokens"
    >
      <ng-template txVirtualScrollerItem let-item
        ><div class="item">{{ item }}</div></ng-template
      >
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VirtualScrollerDesignTokensExample {
  readonly items = Array.from({ length: 1000 }, (_, index) => `Item #${index + 1}`);
  readonly tokens = {
    loader: {
      background: 'var(--tx-highlight-background)',
      color: 'var(--tx-highlight-color)',
      iconSize: '36px',
    },
  };
}
