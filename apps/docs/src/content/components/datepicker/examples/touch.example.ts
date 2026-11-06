import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';

@Component({
  selector: 'datepicker-touch-example',
  imports: [FormsModule, TxDatePicker],
  template: `<tx-datepicker
    ariaLabel="Birthday"
    placeholder="Birthday"
    [touchUI]="true"
    [readonlyInput]="true"
    [showIcon]="true"
    [(ngModel)]="date"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DatepickerTouchExample {
  date: Date | null = null;
}
