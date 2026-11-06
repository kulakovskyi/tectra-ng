import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';

@Component({
  selector: 'datepicker-month-year-example',
  imports: [FormsModule, TxDatePicker],
  template: `
    <div class="grid">
      <tx-datepicker
        ariaLabel="Billing month"
        placeholder="Billing month"
        view="month"
        dateFormat="MM yy"
        [showIcon]="true"
        [(ngModel)]="month"
      />
      <tx-datepicker
        ariaLabel="Fiscal year"
        placeholder="Fiscal year"
        view="year"
        dateFormat="yy"
        [showIcon]="true"
        [(ngModel)]="year"
      />
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DatepickerMonthYearExample {
  month: Date | null = null;
  year: Date | null = null;
}
