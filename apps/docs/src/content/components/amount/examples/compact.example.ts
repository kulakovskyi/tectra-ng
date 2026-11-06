import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAmount } from '@tectra-ng/ui/amount';

@Component({
  selector: 'amount-compact-example',
  imports: [TxAmount],
  template: `
    <div class="row">
      <tx-amount [amount]="1250" notation="compact" />
      <tx-amount [amount]="48200" notation="compact" />
      <tx-amount [amount]="3400000" notation="compact" currency="USD" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      gap: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AmountCompactExample {}
