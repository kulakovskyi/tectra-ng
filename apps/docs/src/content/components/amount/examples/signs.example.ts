import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAmount } from '@tectra-ng/ui/amount';

@Component({
  selector: 'amount-signs-example',
  imports: [TxAmount],
  template: `
    <div class="row">
      @for (delta of deltas; track $index) {
        <tx-amount [amount]="delta" [signColor]="true" [showSign]="true" format="1.1-1" />
      }
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
export default class AmountSignsExample {
  readonly deltas = [12.4, -3.1, 0];
}
