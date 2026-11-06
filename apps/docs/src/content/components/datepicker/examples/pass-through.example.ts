import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';

@Component({
  selector: 'datepicker-pass-through-example',
  imports: [FormsModule, TxDatePicker],
  template: `<tx-datepicker
    ariaLabel="Styled parts"
    [inline]="true"
    [pt]="pt"
    [(ngModel)]="date"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DatepickerPassThroughExample {
  date: Date | null = null;
  readonly pt = {
    header: { style: { borderBottomStyle: 'dashed' } },
    weekday: {
      style: { color: 'var(--tx-text-muted)', fontSize: '12px', textTransform: 'uppercase' },
    },
  };
}
