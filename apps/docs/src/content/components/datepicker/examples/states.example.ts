import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';

@Component({
  selector: 'datepicker-states-example',
  imports: [FormsModule, TxDatePicker],
  template: `
    <div class="grid">
      <tx-datepicker
        ariaLabel="Filled"
        placeholder="Filled"
        variant="filled"
        [showIcon]="true"
        [(ngModel)]="date"
      />
      <tx-datepicker
        ariaLabel="Invalid"
        placeholder="Invalid"
        [invalid]="true"
        [showIcon]="true"
        [(ngModel)]="date"
      />
      <tx-datepicker
        ariaLabel="Read only"
        [readonly]="true"
        [showIcon]="true"
        [(ngModel)]="filled"
      />
      <tx-datepicker
        ariaLabel="Disabled"
        [disabled]="true"
        [showIcon]="true"
        [(ngModel)]="filled"
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
export default class DatepickerStatesExample {
  date: Date | null = null;
  filled = new Date(2026, 0, 15);
}
