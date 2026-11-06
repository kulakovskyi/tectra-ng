import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import {
  TxTable,
  TxTableAction,
  TxTableActions,
  TxTableActionsTemplate,
  TxTableColumn,
} from '@tectra-ng/ui/table';

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
  selector: 'table-row-actions-example',
  imports: [TxTable, TxTableActionsTemplate, TxTableActions, TxTableAction, TxButton, TxTooltip],
  template: `
    <tx-table
      ariaLabel="Invoices"
      dataKey="id"
      actionsSettings
      [value]="invoices"
      [columns]="columns"
      [actionsInlineCount]="2"
    >
      <ng-template txTableActions let-invoice>
        <tx-table-actions>
          <button
            *txTableAction="{ label: 'Open' }"
            txButton
            size="small"
            icon="eye"
            txTooltip="Open"
            aria-label="Open"
            (click)="log.set('Opened ' + invoice.number)"
          ></button>
          <button
            *txTableAction="{ label: 'Download' }"
            txButton
            size="small"
            severity="secondary"
            icon="download"
            txTooltip="Download"
            aria-label="Download"
            (click)="log.set('Downloaded ' + invoice.number)"
          ></button>
          <button
            *txTableAction="{ label: 'Send reminder' }"
            txButton
            size="small"
            severity="info"
            icon="send"
            txTooltip="Send reminder"
            aria-label="Send reminder"
            (click)="log.set('Reminder for ' + invoice.number)"
          ></button>
          <button
            *txTableAction="{ label: 'Delete' }"
            txButton
            size="small"
            severity="danger"
            icon="trash"
            txTooltip="Delete"
            aria-label="Delete"
            (click)="log.set('Deleted ' + invoice.number)"
          ></button>
        </tx-table-actions>
      </ng-template>
    </tx-table>
    <p class="status">{{ log() }}</p>
  `,
  styles: `
    .status {
      margin: 12px 0 0;
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TableRowActionsExample {
  readonly invoices = INVOICES;
  readonly log = signal('Right-click a row to see every action');
  readonly columns: TxTableColumn[] = [
    { field: 'number', header: 'Invoice' },
    { field: 'client', header: 'Client', initialWidth: '180px' },
    { field: 'city', header: 'City' },
    { field: 'amount', header: 'Amount', align: 'end' },
    { field: 'status', header: 'Status' },
  ];
}
