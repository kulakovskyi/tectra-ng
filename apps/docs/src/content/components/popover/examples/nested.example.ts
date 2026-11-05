import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxPopover, TxPopoverTrigger } from '@tectra/ui/popover';

@Component({
  selector: 'popover-nested-example',
  imports: [TxPopover, TxPopoverTrigger, TxButton],
  template: `
    <button
      txButton
      icon="filter"
      severity="secondary"
      [outlined]="true"
      [txPopoverTrigger]="filters"
    >
      Filters
    </button>
    <tx-popover #filters header="Filters">
      <div class="line">
        <span>Period</span>
        <button
          txButton
          size="small"
          severity="secondary"
          [outlined]="true"
          [txPopoverTrigger]="period"
        >
          {{ chosen() }}
        </button>
      </div>
      <tx-popover #period placement="right-start" ariaLabel="Period">
        <div class="options">
          @for (option of periods; track option) {
            <button
              txButton
              size="small"
              [severity]="option === chosen() ? 'primary' : 'secondary'"
              [text]="option !== chosen()"
              (click)="chosen.set(option); period.hide()"
            >
              {{ option }}
            </button>
          }
        </div>
      </tx-popover>
    </tx-popover>
  `,
  styles: `
    .line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .options {
      display: grid;
      gap: 2px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PopoverNestedExample {
  readonly periods = ['Last 7 days', 'Last 30 days', 'This quarter', 'This year'];
  readonly chosen = signal(this.periods[1]);
}
