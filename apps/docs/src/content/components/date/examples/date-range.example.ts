import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';
import { TxDateRangePipe } from '@tectra-ng/utils/date';

@Component({
  selector: 'date-date-range-example',
  imports: [FormsModule, JsonPipe, TxDatePicker, TxDateRangePipe],
  template: `
    <div class="stack">
      <tx-datepicker
        ariaLabel="Report period"
        placeholder="Report period"
        selectionMode="range"
        [showIcon]="true"
        [showClear]="true"
        [readonlyInput]="true"
        [(ngModel)]="period"
      />
      <code class="hint">{{ period() | txDateRange | json }}</code>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DateDateRangeExample {
  readonly period = signal<(Date | null)[] | null>(null);
}
