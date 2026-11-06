import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableColumn } from '@tectra-ng/ui/table';

interface Account {
  id: number;
  name: string;
  balance: number;
}

const ACCOUNTS: Account[] = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  name: `Account ${index + 1}`,
  balance: ((index * 137) % 5000) + 100,
}));

@Component({
  selector: 'table-frozen-rows-example',
  imports: [TxTable],
  template: `<tx-table
    ariaLabel="Accounts"
    dataKey="id"
    scrollHeight="300px"
    [value]="accounts"
    [frozenValue]="pinned"
    [columns]="columns"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TableFrozenRowsExample {
  readonly accounts = ACCOUNTS;
  readonly pinned: Account[] = [{ id: 0, name: 'Main account', balance: 48210 }];
  readonly columns: TxTableColumn[] = [
    { field: 'name', header: 'Account', initialWidth: '240px' },
    { field: 'balance', header: 'Balance', align: 'end' },
  ];
}
