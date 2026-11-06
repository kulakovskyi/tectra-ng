import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';

@Component({
  selector: 'datepicker-time-example',
  imports: [FormsModule, TxDatePicker],
  template: `
    <div class="grid">
      <tx-datepicker
        ariaLabel="Meeting"
        placeholder="Date and time"
        [showTime]="true"
        [showIcon]="true"
        [(ngModel)]="meeting"
      />
      <tx-datepicker
        ariaLabel="Meeting, 12 hours"
        placeholder="12-hour clock"
        [showTime]="true"
        hourFormat="12"
        [stepMinute]="15"
        [(ngModel)]="meeting"
      />
      <tx-datepicker
        ariaLabel="Alarm"
        placeholder="Time only"
        [timeOnly]="true"
        [showSeconds]="true"
        [showIcon]="true"
        icon="clock"
        [(ngModel)]="alarm"
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
export default class DatepickerTimeExample {
  meeting: Date | null = new Date(2026, 10, 12, 14, 30);
  alarm: Date | null = null;
}
