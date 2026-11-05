import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInputNumber } from '@tectra/ui/input-number';

@Component({
  selector: 'input-number-decimals-example',
  imports: [TxInputNumber],
  template: `
    <div class="row">
      <tx-input-number ariaLabel="Integer" placeholder="Integer" [maxFractionDigits]="0" />
      <tx-input-number
        ariaLabel="Two decimals"
        placeholder="Exactly 2 decimals"
        [minFractionDigits]="2"
        [maxFractionDigits]="2"
      />
      <tx-input-number
        ariaLabel="Up to five"
        placeholder="Up to 5 decimals"
        [maxFractionDigits]="5"
      />
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
export default class InputNumberDecimalsExample {}
