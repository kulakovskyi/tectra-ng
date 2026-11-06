import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';

@Component({
  selector: 'datepicker-sizes-example',
  imports: [FormsModule, TxDatePicker],
  template: `
    <div class="stack">
      <tx-datepicker
        ariaLabel="Small"
        placeholder="Small"
        size="small"
        [showIcon]="true"
        [(ngModel)]="date"
      />
      <tx-datepicker ariaLabel="Medium" placeholder="Medium" [showIcon]="true" [(ngModel)]="date" />
      <tx-datepicker
        ariaLabel="Large"
        placeholder="Large"
        size="large"
        [showIcon]="true"
        [(ngModel)]="date"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DatepickerSizesExample {
  date: Date | null = null;
}
