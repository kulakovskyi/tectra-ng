import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TxCurrencySymbolPipe } from '@tectra-ng/utils/currency';

@Component({
  selector: 'currency-basic-example',
  imports: [TxTable, TxTableCell, TxCurrencySymbolPipe],
  template: `
    <tx-table ariaLabel="Currencies" dataKey="code" [value]="rows" [columns]="columns">
      <ng-template txTableCell="narrow" let-row>{{ row.code | txCurrencySymbol }}</ng-template>
      <ng-template txTableCell="symbol" let-row>{{
        row.code | txCurrencySymbol: 'symbol'
      }}</ng-template>
      <ng-template txTableCell="name" let-row>{{
        row.code | txCurrencySymbol: 'name'
      }}</ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CurrencyBasicExample {
  readonly rows = ['USD', 'EUR', 'UAH', 'PLN', 'GBP', 'JPY', 'CAD', 'XYZ'].map((code) => ({
    code,
  }));
  readonly columns: TxTableColumn[] = [
    { field: 'code', header: 'Code' },
    { field: 'narrow', header: 'Narrow symbol' },
    { field: 'symbol', header: 'Symbol' },
    { field: 'name', header: 'Name' },
  ];
}
