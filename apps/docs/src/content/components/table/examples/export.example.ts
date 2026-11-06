import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxTable, TxTableColumn } from '@tectra-ng/ui/table';

interface Contact {
  id: number;
  name: string;
  email: string;
  note: string;
}

const CONTACTS: Contact[] = [
  {
    id: 1,
    name: 'Olena Kovalenko',
    email: 'olena@example.com',
    note: 'Prefers calls in the morning, before the weekly planning meeting',
  },
  {
    id: 2,
    name: 'Andrii Melnyk',
    email: 'andrii@example.com',
    note: 'Sends invoices at the end of the month',
  },
  { id: 3, name: 'Iryna Bondar', email: 'iryna@example.com', note: '=Ask about the new contract' },
];

@Component({
  selector: 'table-export-example',
  imports: [TxTable, TxButton],
  template: `
    <tx-table
      #table
      ariaLabel="Contacts"
      dataKey="id"
      selectionMode="checkbox"
      exportFilename="contacts"
      toolbar
      cellTooltip
      [value]="contacts"
      [columns]="columns"
      [(selection)]="selected"
    >
      <div txTableToolbar class="buttons">
        <button
          txButton
          size="small"
          icon="file-export"
          label="Export CSV"
          (click)="table.exportCSV()"
        ></button>
        <button
          txButton
          size="small"
          severity="secondary"
          label="Export selected"
          [disabled]="!count()"
          (click)="table.exportCSV({ selectionOnly: true })"
        ></button>
      </div>
    </tx-table>
  `,
  styles: `
    .buttons {
      display: flex;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TableExportExample {
  readonly contacts = CONTACTS;
  readonly selected = signal<Contact | Contact[] | null>([]);
  readonly columns: TxTableColumn[] = [
    { field: 'name', header: 'Name', initialWidth: '160px' },
    { field: 'email', header: 'Email', initialWidth: '180px' },
    { field: 'note', header: 'Note', initialWidth: '200px' },
  ];

  count(): number {
    const selected = this.selected();
    return Array.isArray(selected) ? selected.length : 0;
  }
}
