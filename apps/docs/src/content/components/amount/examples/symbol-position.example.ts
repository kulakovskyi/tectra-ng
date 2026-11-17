import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAmount, TxAmountSymbolPosition } from '@tectra-ng/ui/amount';

@Component({
  selector: 'amount-symbol-position-example',
  imports: [TxAmount],
  template: `
    <dl class="grid">
      @for (position of positions; track position) {
        <dt>
          <code>{{ position }}</code>
        </dt>
        <dd class="row">
          <tx-amount [amount]="1234.5" currency="USD" format="1.0-2" [symbolPosition]="position" />
          <tx-amount [amount]="1234.5" currency="UAH" locale="uk-UA" [symbolPosition]="position" />
          <tx-amount
            [amount]="25"
            currency="USDT"
            [symbols]="symbols"
            [symbolPosition]="position"
          />
        </dd>
      }
    </dl>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 8px 24px;
      margin: 0;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AmountSymbolPositionExample {
  readonly positions: TxAmountSymbolPosition[] = ['auto', 'before', 'after'];
  readonly symbols = { USDT: '₮' };
}
