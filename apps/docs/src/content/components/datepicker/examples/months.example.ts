import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';

@Component({
  selector: 'datepicker-months-example',
  imports: [FormsModule, TxDatePicker],
  template: `
    <tx-datepicker
      ariaLabel="Trip"
      placeholder="Trip dates"
      selectionMode="range"
      [numberOfMonths]="2"
      [responsiveOptions]="[{ breakpoint: '640px', numberOfMonths: 1 }]"
      [showIcon]="true"
      [(ngModel)]="trip"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DatepickerMonthsExample {
  trip: (Date | null)[] | null = null;
}
