import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxInputNumber } from '@tectra/ui/input-number';

@Component({
  selector: 'input-number-prefix-suffix-example',
  imports: [FormsModule, TxInputNumber],
  template: `
    <div class="row">
      <tx-input-number
        ariaLabel="Weight"
        suffix=" kg"
        [maxFractionDigits]="1"
        [(ngModel)]="weight"
      />
      <tx-input-number
        ariaLabel="Discount"
        suffix="%"
        [min]="0"
        [max]="100"
        [(ngModel)]="discount"
      />
      <tx-input-number ariaLabel="Around" prefix="≈ " [(ngModel)]="around" />
    </div>
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
export default class InputNumberPrefixSuffixExample {
  weight = 72.5;
  discount = 15;
  around = 3000;
}
