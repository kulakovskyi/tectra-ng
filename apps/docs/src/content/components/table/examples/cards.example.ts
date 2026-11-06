import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import {
  TxTable,
  TxTableAction,
  TxTableActions,
  TxTableActionsTemplate,
  TxTableColumn,
} from '@tectra/ui/table';

interface Invoice {
  id: number;
  number: string;
  client: string;
  city: string;
  amount: number;
  status: string;
}

const INVOICES: Invoice[] = [
  {
    id: 1,
    number: 'INV-1042',
    client: 'Northwind Studio',
    city: 'Lviv',
    amount: 1280,
    status: 'Paid',
  },
  {
    id: 2,
    number: 'INV-1043',
    client: 'Blue Harbor',
    city: 'Kyiv',
    amount: 640,
    status: 'Pending',
  },
  {
    id: 3,
    number: 'INV-1044',
    client: 'Oakline Partners',
    city: 'Odesa',
    amount: 3920,
    status: 'Overdue',
  },
  { id: 4, number: 'INV-1045', client: 'Silverleaf', city: 'Kharkiv', amount: 215, status: 'Paid' },
  {
    id: 5,
    number: 'INV-1046',
    client: 'Maple & Co',
    city: 'Dnipro',
    amount: 1870,
    status: 'Pending',
  },
  { id: 6, number: 'INV-1047', client: 'Granite Works', city: 'Kyiv', amount: 760, status: 'Paid' },
];

@Component({
  selector: 'table-cards-example',
  imports: [TxTable, TxTableActionsTemplate, TxTableActions, TxTableAction, TxButton],
  template: `
    <tx-table
      ariaLabel="Invoices"
      dataKey="id"
      breakpoint="200rem"
      selectionMode="checkbox"
      [value]="invoices"
      [columns]="columns"
      [(selection)]="selected"
    >
      <ng-template txTableActions let-invoice>
        <tx-table-actions>
          <button
            *txTableAction="{ label: 'Open' }"
            txButton
            size="small"
            icon="eye"
            label="Open"
          ></button>
          <button
            *txTableAction="{ label: 'Download' }"
            txButton
            size="small"
            severity="secondary"
            icon="download"
            label="Download"
          ></button>
        </tx-table-actions>
      </ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TableCardsExample {
  readonly invoices = INVOICES.slice(0, 4);
  readonly selected = signal<Invoice | Invoice[] | null>([]);
  readonly columns: TxTableColumn[] = [
    { field: 'number', header: 'Invoice', hideInCard: true },
    { field: 'client', header: 'Client', cardTitle: true },
    { field: 'city', header: 'City' },
    { field: 'amount', header: 'Amount', align: 'end' },
    { field: 'status', header: 'Status' },
  ];
}
