import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';
import { TxFloatLabel, TxIftaLabel } from '@tectra-ng/ui/label';

@Component({
  selector: 'datepicker-float-label-example',
  imports: [FormsModule, TxDatePicker, TxFloatLabel, TxIftaLabel],
  template: `
    <div class="grid">
      <tx-float-label variant="on">
        <tx-datepicker inputId="float-date" [showIcon]="true" [fluid]="true" [(ngModel)]="start" />
        <label for="float-date">Start date</label>
      </tx-float-label>
      <tx-ifta-label>
        <tx-datepicker inputId="ifta-date" [fluid]="true" [(ngModel)]="end" />
        <label for="ifta-date">End date</label>
      </tx-ifta-label>
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      width: 100%;
      padding-top: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DatepickerFloatLabelExample {
  start: Date | null = null;
  end: Date | null = null;
}
