import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxVirtualScroller, TxVirtualScrollerItem } from '@tectra-ng/ui/virtual-scroller';

@Component({
  selector: 'virtual-scroller-horizontal-example',
  imports: [TxVirtualScroller, TxVirtualScrollerItem],
  template: `
    <tx-virtual-scroller
      ariaLabel="Days"
      orientation="horizontal"
      scrollHeight="96px"
      [items]="days"
      [itemSize]="96"
    >
      <ng-template txVirtualScrollerItem let-day>
        <div class="day">
          <strong>{{ day.number }}</strong>
          <span>{{ day.name }}</span>
        </div>
      </ng-template>
    </tx-virtual-scroller>
  `,
  styles: `
    tx-virtual-scroller {
      border: 1px solid var(--tx-surface-border);
      border-radius: var(--tx-radius-md);
    }
    .day {
      display: grid;
      place-content: center;
      gap: 4px;
      height: 100%;
      border-inline-end: 1px solid var(--tx-surface-border);
      text-align: center;
    }
    .day span {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VirtualScrollerHorizontalExample {
  readonly days = Array.from({ length: 3650 }, (_, index) => ({
    number: `Day ${index + 1}`,
    name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index % 7],
  }));
}
