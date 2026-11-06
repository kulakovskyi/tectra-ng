import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';

@Component({
  selector: 'datepicker-limits-example',
  imports: [FormsModule, TxDatePicker],
  template: `
    <tx-datepicker
      ariaLabel="Appointment"
      placeholder="Next 30 working days"
      [showIcon]="true"
      [minDate]="today"
      [maxDate]="limit"
      [disabledDays]="[0, 6]"
      [disabledDates]="holidays"
      [(ngModel)]="date"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DatepickerLimitsExample {
  readonly today = new Date();
  readonly limit = new Date(
    this.today.getFullYear(),
    this.today.getMonth(),
    this.today.getDate() + 30,
  );
  readonly holidays = [
    new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() + 3),
  ];
  date: Date | null = null;
}
