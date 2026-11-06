import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';

@Component({
  selector: 'datepicker-button-bar-example',
  imports: [FormsModule, TxDatePicker],
  template: `<tx-datepicker
    ariaLabel="Due date"
    placeholder="Due date"
    [showButtonBar]="true"
    [showIcon]="true"
    [(ngModel)]="date"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DatepickerButtonBarExample {
  date: Date | null = null;
}
