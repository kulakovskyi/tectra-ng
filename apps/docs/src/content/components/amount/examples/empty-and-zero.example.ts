import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAmount } from '@tectra/ui/amount';

@Component({
  selector: 'amount-empty-and-zero-example',
  imports: [TxAmount],
  template: `
    <div class="row">
      <tx-amount [amount]="null" />
      <tx-amount [amount]="null" emptyText="n/a" />
      <tx-amount [amount]="0" currency="USD" />
      <tx-amount [amount]="980" currency="USD" [strong]="true" />
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
export default class AmountEmptyAndZeroExample {}
