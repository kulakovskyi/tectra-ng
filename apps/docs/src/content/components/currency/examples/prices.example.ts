import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TxCurrencySymbolPipe } from '@tectra-ng/utils/currency';

@Component({
  selector: 'currency-prices-example',
  imports: [DecimalPipe, TxTable, TxTableCell, TxCurrencySymbolPipe],
  template: `
    <tx-table ariaLabel="Plans" dataKey="plan" [value]="plans" [columns]="columns">
      <ng-template txTableCell="price" let-row
        >{{ row.currency | txCurrencySymbol }}{{ row.price | number: '1.2-2' }}</ng-template
      >
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CurrencyPricesExample {
  readonly plans = [
    { plan: 'Starter', price: 9, currency: 'USD' },
    { plan: 'Team', price: 39.5, currency: 'EUR' },
    { plan: 'Business', price: 3990, currency: 'UAH' },
  ];
  readonly columns: TxTableColumn[] = [
    { field: 'plan', header: 'Plan' },
    { field: 'price', header: 'Per month', align: 'end' },
  ];
}
