import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAmount } from '@tectra/ui/amount';

@Component({
  selector: 'amount-design-tokens-example',
  imports: [TxAmount],
  template: `
    <tx-amount
      [amount]="2400"
      currency="USD"
      [dt]="{
        root: { fontWeight: '700' },
        currency: { color: 'var(--tx-primary-soft-text)', fontSize: '1em' },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AmountDesignTokensExample {}
