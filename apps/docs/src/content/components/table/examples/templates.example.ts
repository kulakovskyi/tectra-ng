import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPill } from '@tectra-ng/ui/pill';
import { TxButton } from '@tectra-ng/ui/button';
import { TxPopover, TxPopoverTrigger } from '@tectra-ng/ui/popover';
import { TxTable, TxTableCell, TxTableColumn, TxTableHeaderCell } from '@tectra-ng/ui/table';
import { TxAmount } from '@tectra-ng/ui/amount';

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
  selector: 'table-templates-example',
  imports: [
    TxTable,
    TxTableCell,
    TxTableHeaderCell,
    TxPill,
    TxAmount,
    TxButton,
    TxPopover,
    TxPopoverTrigger,
  ],
  template: `
    <tx-table ariaLabel="Invoices" dataKey="id" [value]="invoices" [columns]="columns">
      <ng-template txTableCell="client" [txTableCellOf]="invoices" let-invoice>
        <span class="client">
          <strong>{{ invoice.client }}</strong>
          <button
            txButton
            text
            rounded
            size="small"
            severity="secondary"
            icon="info-circle"
            [attr.aria-label]="'About ' + invoice.client"
            [txPopoverTrigger]="about"
          ></button>
          <tx-popover #about [header]="invoice.client"
            >{{ invoice.city }} · invoice {{ invoice.number }}</tx-popover
          >
        </span>
      </ng-template>
      <ng-template txTableCell="amount" let-value="value">
        <tx-amount [amount]="value" currency="USD" />
      </ng-template>
      <ng-template txTableCell="status" let-value="value">
        <tx-pill [tone]="tones[value]" [value]="value" />
      </ng-template>
      <ng-template txTableHeaderCell="amount">Amount, USD</ng-template>
    </tx-table>
  `,
  styles: `
    .client {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TableTemplatesExample {
  readonly invoices = INVOICES;
  readonly tones: Record<string, 'success' | 'warn' | 'danger'> = {
    Paid: 'success',
    Pending: 'warn',
    Overdue: 'danger',
  };
  readonly columns: TxTableColumn[] = [
    { field: 'number', header: 'Invoice' },
    { field: 'client', header: 'Client', initialWidth: '180px' },
    { field: 'city', header: 'City' },
    { field: 'amount', header: 'Amount', align: 'end' },
    { field: 'status', header: 'Status' },
  ];
}
