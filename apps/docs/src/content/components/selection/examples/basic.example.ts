import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCheckbox } from '@tectra-ng/ui/checkbox';
import { TxTable, TxTableCell, TxTableColumn, TxTableHeaderCell } from '@tectra-ng/ui/table';
import { TxSelection } from '@tectra-ng/utils/selection';

interface Invoice {
  id: string;
  client: string;
  status: 'Paid' | 'Pending';
}

@Component({
  selector: 'selection-basic-example',
  imports: [FormsModule, TxButton, TxCheckbox, TxTable, TxTableCell, TxTableHeaderCell],
  template: `
    <div class="layout">
      <div class="flex">
        <button
          txButton
          label="Select paid"
          size="small"
          severity="secondary"
          (click)="selection.select(isPaid, invoices, true)"
        ></button>
        <button
          txButton
          label="Clear"
          size="small"
          severity="secondary"
          [disabled]="!selection.count()"
          (click)="selection.clear()"
        ></button>
        <span class="hint">{{ selection.count() }} of {{ invoices.length }} selected</span>
      </div>
      <tx-table ariaLabel="Invoices" dataKey="id" [value]="invoices" [columns]="columns">
        <ng-template txTableHeaderCell="pick">
          <tx-checkbox
            ariaLabel="Select all"
            [binary]="true"
            [ngModel]="selection.areAllSelected(invoices)"
            [indeterminate]="selection.isPartial(invoices)"
            (ngModelChange)="selection.toggleAll(invoices, $event)"
          />
        </ng-template>
        <ng-template txTableCell="pick" let-row>
          <tx-checkbox
            [ariaLabel]="'Select ' + row.id"
            [binary]="true"
            [ngModel]="selection.isSelected(row)"
            (ngModelChange)="selection.toggleOne(row, $event)"
          />
        </ng-template>
      </tx-table>
    </div>
  `,
  styles: `
    .layout {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectionBasicExample {
  readonly selection = new TxSelection<Invoice>((invoice) => invoice.id);
  readonly isPaid = (invoice: Invoice) => invoice.status === 'Paid';
  readonly invoices: Invoice[] = [
    { id: 'INV-1042', client: 'Northwind Studio', status: 'Paid' },
    { id: 'INV-1043', client: 'Blue Harbor', status: 'Pending' },
    { id: 'INV-1044', client: 'Oakline Partners', status: 'Paid' },
    { id: 'INV-1045', client: 'Silverleaf', status: 'Pending' },
  ];
  readonly columns: TxTableColumn[] = [
    { field: 'pick', header: 'Select', initialWidth: '48px', sortable: false },
    { field: 'id', header: 'Invoice' },
    { field: 'client', header: 'Client' },
    { field: 'status', header: 'Status' },
  ];
}
