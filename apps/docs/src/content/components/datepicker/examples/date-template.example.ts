import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxCalendarDay, TxDatePicker, TxDatePickerDate } from '@tectra-ng/ui/datepicker';

@Component({
  selector: 'datepicker-date-template-example',
  imports: [FormsModule, TxDatePicker, TxDatePickerDate],
  template: `
    <tx-datepicker
      ariaLabel="Event day"
      placeholder="Days with events have a dot"
      [showIcon]="true"
      [(ngModel)]="date"
    >
      <ng-template txDatePickerDate let-day>
        <span class="day">
          {{ day.day }}
          @if (hasEvent(day)) {
            <span class="dot" aria-hidden="true"></span>
          }
        </span>
      </ng-template>
    </tx-datepicker>
  `,
  styles: `
    .day {
      position: relative;
      display: inline-grid;
      place-items: center;
    }
    .dot {
      position: absolute;
      bottom: -5px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--tx-primary-base);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DatepickerDateTemplateExample {
  date: Date | null = null;

  hasEvent(day: TxCalendarDay): boolean {
    return !day.otherMonth && [3, 8, 14, 21, 27].includes(day.day);
  }
}
