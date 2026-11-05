import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAmount } from '@tectra/ui/amount';

@Component({
  selector: 'amount-basic-example',
  imports: [TxAmount],
  template: `
    <div class="row">
      <tx-amount [amount]="1234.5" />
      <tx-amount [amount]="1234.5" currency="USD" />
      <tx-amount [amount]="1234.5" currency="EUR" />
      <tx-amount [amount]="1234.5" currency="UAH" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AmountBasicExample {}
