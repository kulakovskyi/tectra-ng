import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';

@Component({
  selector: 'datepicker-basic-example',
  imports: [FormsModule, TxDatePicker],
  template: `
    <div class="stack">
      <tx-datepicker ariaLabel="Delivery date" placeholder="Delivery date" [(ngModel)]="date" />
      <span class="hint">Value: {{ date() ? date()!.toDateString() : '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DatepickerBasicExample {
  readonly date = signal<Date | null>(null);
}
