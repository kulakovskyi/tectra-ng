import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';

@Component({
  selector: 'datepicker-format-example',
  imports: [FormsModule, TxDatePicker],
  template: `
    <div class="grid">
      <tx-datepicker
        ariaLabel="dd.mm.yy"
        dateFormat="dd.mm.yy"
        [firstDayOfWeek]="1"
        [(ngModel)]="date"
      />
      <tx-datepicker ariaLabel="yy-mm-dd" dateFormat="yy-mm-dd" [(ngModel)]="date" />
      <tx-datepicker ariaLabel="MM d, yy" dateFormat="MM d, yy" [(ngModel)]="date" />
      <tx-datepicker ariaLabel="DD, d M yy" dateFormat="DD, d M yy" [(ngModel)]="date" />
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
export default class DatepickerFormatExample {
  date = new Date(2026, 9, 31);
}
