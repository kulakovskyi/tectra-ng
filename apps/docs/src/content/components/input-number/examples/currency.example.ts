import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxInputNumber } from '@tectra-ng/ui/input-number';

@Component({
  selector: 'input-number-currency-example',
  imports: [FormsModule, TxInputNumber],
  template: `
    <div class="row">
      <tx-input-number ariaLabel="US dollars" mode="currency" currency="USD" [(ngModel)]="usd" />
      <tx-input-number
        ariaLabel="Euros"
        mode="currency"
        currency="EUR"
        locale="de-DE"
        [(ngModel)]="eur"
      />
      <tx-input-number
        ariaLabel="Hryvnias"
        mode="currency"
        currency="UAH"
        locale="uk-UA"
        [(ngModel)]="uah"
      />
      <tx-input-number
        ariaLabel="Yen"
        mode="currency"
        currency="JPY"
        locale="ja-JP"
        currencyDisplay="code"
        [(ngModel)]="jpy"
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
export default class InputNumberCurrencyExample {
  usd = 1499.9;
  eur = 1499.9;
  uah = 61200;
  jpy = 98000;
}
