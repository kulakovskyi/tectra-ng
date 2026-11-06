import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TxTable, TxTableCell, TxTableColumn, TxTableRowEditEvent } from '@tectra-ng/ui/table';

interface Invoice {
  id: number;
  number: string;
  client: string;
  city: string;
  amount: number;
  status: string;
  issued: Date;
  paid: boolean;
}

const INVOICES: Invoice[] = [
  {
    id: 1,
    number: 'INV-1042',
    client: 'Northwind Studio',
    city: 'Lviv',
    amount: 1280,
    status: 'Paid',
    issued: new Date(2026, 9, 2),
    paid: true,
  },
  {
    id: 2,
    number: 'INV-1043',
    client: 'Blue Harbor',
    city: 'Kyiv',
    amount: 640,
    status: 'Pending',
    issued: new Date(2026, 9, 4),
    paid: false,
  },
  {
    id: 3,
    number: 'INV-1044',
    client: 'Oakline Partners',
    city: 'Odesa',
    amount: 3920,
    status: 'Overdue',
    issued: new Date(2026, 9, 7),
    paid: false,
  },
  {
    id: 4,
    number: 'INV-1045',
    client: 'Silverleaf',
    city: 'Kharkiv',
    amount: 215,
    status: 'Paid',
    issued: new Date(2026, 9, 11),
    paid: true,
  },
  {
    id: 5,
    number: 'INV-1046',
    client: 'Maple & Co',
    city: 'Dnipro',
    amount: 1870,
    status: 'Pending',
    issued: new Date(2026, 9, 15),
    paid: false,
  },
  {
    id: 6,
    number: 'INV-1047',
    client: 'Granite Works',
    city: 'Kyiv',
    amount: 760,
    status: 'Paid',
    issued: new Date(2026, 9, 18),
    paid: true,
  },
];

@Component({
  selector: 'table-row-edit-example',
  imports: [TxTable, TxTableCell, DatePipe],
  template: `
    <tx-table
      ariaLabel="Invoices"
      dataKey="id"
      editMode="row"
      [value]="invoices"
      [columns]="columns"
      [(editingRowKeys)]="editing"
      (rowEditSave)="saved($event)"
    >
      <ng-template txTableCell="issued" let-value="value">{{
        value | date: 'mediumDate'
      }}</ng-template>
      <ng-template txTableCell="paid" let-value="value">{{ value ? 'Yes' : 'No' }}</ng-template>
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
export default class TableRowEditExample {
  readonly invoices = INVOICES.slice(0, 4).map((invoice) => ({ ...invoice }));
  readonly editing = signal<unknown[]>([]);
  readonly log = signal('Use the pencil to edit a row');
  readonly columns: TxTableColumn[] = [
    { field: 'number', header: 'Invoice' },
    { field: 'client', header: 'Client', initialWidth: '200px', editable: true },
    { field: 'issued', header: 'Issued', editable: true, editType: 'date', initialWidth: '150px' },
    { field: 'paid', header: 'Paid', editable: true, editType: 'boolean' },
  ];

  saved(event: TxTableRowEditEvent): void {
    this.log.set(`Saved: ${Object.keys(event.changes).join(', ') || 'no changes'}`);
  }
}
