import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';

@Component({
  selector: 'datepicker-inline-example',
  imports: [FormsModule, TxDatePicker],
  template: `
    <div class="stack">
      <tx-datepicker
        ariaLabel="Delivery day"
        [inline]="true"
        [showWeek]="true"
        [(ngModel)]="date"
      />
      <span class="hint">{{ date() ? date()!.toDateString() : 'Pick a day' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DatepickerInlineExample {
  readonly date = signal<Date | null>(null);
}
