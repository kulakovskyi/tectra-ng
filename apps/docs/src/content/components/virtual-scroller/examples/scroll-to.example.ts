import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInputNumber } from '@tectra-ng/ui/input-number';
import {
  TxVirtualScroller,
  TxVirtualScrollerItem,
  TxVirtualScrollerRange,
} from '@tectra-ng/ui/virtual-scroller';

@Component({
  selector: 'virtual-scroller-scroll-to-example',
  imports: [TxVirtualScroller, TxVirtualScrollerItem, TxButton, TxInputNumber, FormsModule],
  template: `
    <div class="row">
      <tx-input-number ariaLabel="Item number" [min]="1" [max]="10000" [(ngModel)]="target" />
      <button
        txButton
        type="button"
        label="Scroll to"
        severity="secondary"
        outlined
        (click)="list.scrollToIndex(target - 1)"
      ></button>
      <button
        txButton
        type="button"
        label="Show at the end"
        severity="secondary"
        outlined
        (click)="list.scrollInView(target - 1, 'to-end')"
      ></button>
    </div>
    <tx-virtual-scroller
      #list
      ariaLabel="Items"
      scrollHeight="200px"
      [items]="items"
      [itemSize]="40"
      (scrollIndexChange)="visible.set($event)"
    >
      <ng-template txVirtualScrollerItem let-item
        ><div class="item">{{ item }}</div></ng-template
      >
    </tx-virtual-scroller>
    <p class="hint">Visible: {{ visible().first }} – {{ visible().last }}</p>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }
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
    .hint {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VirtualScrollerScrollToExample {
  readonly items = Array.from({ length: 10000 }, (_, index) => `Item #${index + 1}`);
  readonly visible = signal<TxVirtualScrollerRange>({ first: 0, last: 0 });
  target = 5000;
}
