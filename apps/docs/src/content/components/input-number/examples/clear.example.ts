import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxInputNumber } from '@tectra/ui/input-number';

@Component({
  selector: 'input-number-clear-example',
  imports: [FormsModule, TxInputNumber],
  template: `
    <div class="row">
      <tx-input-number ariaLabel="Can be empty" [showClear]="true" [(ngModel)]="optional" />
      <tx-input-number
        ariaLabel="Never empty"
        [showClear]="true"
        [allowEmpty]="false"
        [min]="1"
        [(ngModel)]="required"
      />
    </div>
    <p class="hint">{{ optional ?? 'null' }} · {{ required }}</p>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputNumberClearExample {
  optional: number | null = 42;
  required = 5;
}
