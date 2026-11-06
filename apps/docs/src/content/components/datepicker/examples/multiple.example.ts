import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';

@Component({
  selector: 'datepicker-multiple-example',
  imports: [FormsModule, TxDatePicker],
  template: `
    <div class="stack">
      <tx-datepicker
        ariaLabel="Shift days"
        placeholder="Up to 5 shift days"
        selectionMode="multiple"
        [maxDateCount]="5"
        [readonlyInput]="true"
        [(ngModel)]="days"
      />
      <span class="hint">{{ days()?.length ?? 0 }} of 5 picked</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DatepickerMultipleExample {
  readonly days = signal<Date[] | null>(null);
}
