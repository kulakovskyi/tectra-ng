import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAmount } from '@tectra-ng/ui/amount';

@Component({
  selector: 'amount-locales-example',
  imports: [TxAmount],
  template: `
    <dl class="grid">
      @for (locale of locales; track locale) {
        <dt>
          <code>{{ locale }}</code>
        </dt>
        <dd><tx-amount [amount]="1234567.89" currency="EUR" [locale]="locale" /></dd>
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
export default class AmountLocalesExample {
  readonly locales = ['en-US', 'de-DE', 'uk-UA', 'fr-FR', 'ja-JP'];
}
