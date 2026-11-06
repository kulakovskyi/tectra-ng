import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';

@Component({
  selector: 'datepicker-week-example',
  imports: [FormsModule, TxDatePicker],
  template: `
    <div class="grid">
      <tx-datepicker
        ariaLabel="Sprint start"
        placeholder="Week numbers"
        [showWeek]="true"
        [firstDayOfWeek]="1"
        [(ngModel)]="date"
      />
      <tx-datepicker
        ariaLabel="Only this month"
        placeholder="Hide other months"
        [showOtherMonths]="false"
        [(ngModel)]="date"
      />
      <tx-datepicker
        ariaLabel="Other months pickable"
        placeholder="Pick other months"
        [selectOtherMonths]="true"
        [(ngModel)]="date"
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
export default class DatepickerWeekExample {
  date: Date | null = null;
}
