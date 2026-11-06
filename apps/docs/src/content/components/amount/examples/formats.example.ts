import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAmount } from '@tectra-ng/ui/amount';

@Component({
  selector: 'amount-formats-example',
  imports: [TxAmount],
  template: `
    <dl class="grid">
      @for (item of formats; track item.format) {
        <dt>
          <code>{{ item.format }}</code>
        </dt>
        <dd><tx-amount [amount]="item.value" [format]="item.format" currency="USD" /></dd>
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
    dd {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AmountFormatsExample {
  readonly formats = [
    { format: '1.0-2', value: 1234.5 },
    { format: '1.2-2', value: 1234.5 },
    { format: '1.0-0', value: 1234.5 },
    { format: '1.2-4', value: 0.0025 },
  ];
}
