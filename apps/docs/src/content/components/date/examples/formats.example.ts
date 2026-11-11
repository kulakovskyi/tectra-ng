import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';
import { TxSelect } from '@tectra-ng/ui/select';
import { TX_DATE_FORMATS, TxDatePipe } from '@tectra-ng/utils/date';

@Component({
  selector: 'date-formats-example',
  imports: [FormsModule, TxDatePicker, TxSelect, TxDatePipe],
  template: `
    <div class="stack">
      <tx-datepicker
        ariaLabel="Date and time"
        [showTime]="true"
        [showIcon]="true"
        [(ngModel)]="date"
      />
      <tx-select ariaLabel="Pattern" [options]="patterns" [(ngModel)]="pattern" />
      <span class="hint"
        >{{ pattern() }} → <strong>{{ date() | txDate: pattern() }}</strong></span
      >
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DateFormatsExample {
  readonly date = signal<Date | null>(new Date(2026, 10, 11, 9, 5, 30));
  readonly pattern = signal<string>(TX_DATE_FORMATS.dateTime);
  readonly patterns = [
    ...Object.entries(TX_DATE_FORMATS).map(([name, value]) => ({
      label: `${name} — ${value}`,
      value,
    })),
    { label: 'mediumDate', value: 'mediumDate' },
    { label: 'longDate', value: 'longDate' },
    { label: 'short', value: 'short' },
    { label: 'EEEE, d MMMM', value: 'EEEE, d MMMM' },
  ];
}
