import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';

@Component({
  selector: 'datepicker-design-tokens-example',
  imports: [FormsModule, TxDatePicker],
  template: `
    <tx-datepicker
      ariaLabel="Rounded days"
      [inline]="true"
      [(ngModel)]="date"
      [dt]="{
        panel: { padding: '16px', borderRadius: '20px' },
        date: {
          width: '32px',
          height: '32px',
          borderRadius: '10px',
          selectedBackground: 'var(--tx-success-base)',
        },
        today: { background: 'transparent', color: 'var(--tx-success-base)' },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DatepickerDesignTokensExample {
  date = new Date();
}
