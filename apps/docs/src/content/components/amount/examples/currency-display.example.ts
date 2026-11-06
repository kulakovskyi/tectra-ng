import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAmount } from '@tectra-ng/ui/amount';

@Component({
  selector: 'amount-currency-display-example',
  imports: [TxAmount],
  template: `
    <div class="column">
      <tx-amount [amount]="42" currency="USD" />
      <tx-amount [amount]="42" currency="USD" currencyDisplay="symbol" />
      <tx-amount [amount]="42" currency="USD" currencyDisplay="code" />
      <tx-amount [amount]="42" currency="USD" currencyDisplay="name" />
    </div>
  `,
  styles: `
    .column {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AmountCurrencyDisplayExample {}
