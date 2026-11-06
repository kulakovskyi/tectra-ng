import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker, TxDatePickerInputIcon } from '@tectra-ng/ui/datepicker';
import { TxIcon } from '@tectra-ng/icons';

@Component({
  selector: 'datepicker-icon-example',
  imports: [FormsModule, TxDatePicker, TxDatePickerInputIcon, TxIcon],
  template: `
    <div class="grid">
      <tx-datepicker
        ariaLabel="With a button"
        placeholder="Button"
        [showIcon]="true"
        [(ngModel)]="date"
      />
      <tx-datepicker
        ariaLabel="With an icon"
        placeholder="Icon"
        [showIcon]="true"
        iconDisplay="input"
        [(ngModel)]="date"
      />
      <tx-datepicker
        ariaLabel="With a clear button"
        placeholder="Clearable"
        [showIcon]="true"
        [showClear]="true"
        [(ngModel)]="date"
      />
      <tx-datepicker
        ariaLabel="Own icon"
        placeholder="Own icon"
        [showIcon]="true"
        iconDisplay="input"
        [(ngModel)]="date"
      >
        <ng-template txDatePickerInputIcon><tx-icon name="clock" /></ng-template>
      </tx-datepicker>
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
export default class DatepickerIconExample {
  date: Date | null = new Date();
}
