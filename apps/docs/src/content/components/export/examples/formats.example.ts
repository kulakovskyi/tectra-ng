import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  TxExportButton,
  TxExportCsv,
  TxExportExcel,
  TxExportField,
  TxExportPdf,
  TxExportWord,
} from '@tectra-ng/ui/export';

interface Invoice {
  id: string;
  customer: string;
  total: number;
  issued: Date;
  paid: boolean;
}

@Component({
  selector: 'export-formats-example',
  imports: [TxExportExcel, TxExportCsv, TxExportWord, TxExportPdf, TxExportButton],
  template: `
    <div class="row" role="toolbar" aria-label="Export invoices">
      <tx-export-excel filename="invoices" title="Invoices" [data]="invoices" [fields]="fields" />
      <tx-export-csv filename="invoices" [data]="invoices" [fields]="fields" />
      <tx-export-word filename="invoices" title="Invoices" [data]="invoices" [fields]="fields" />
      <tx-export-pdf filename="invoices" title="Invoices" [data]="invoices" [fields]="fields" />
      <tx-export-button
        format="json"
        variant="outlined"
        filename="invoices"
        [data]="invoices"
        [fields]="fields"
      />
      <tx-export-button
        format="html"
        variant="outlined"
        filename="invoices"
        title="Invoices"
        [data]="invoices"
        [fields]="fields"
      />
      <tx-export-button
        format="markdown"
        variant="outlined"
        filename="invoices"
        title="Invoices"
        [data]="invoices"
        [fields]="fields"
      />
      <tx-export-button format="copy" variant="outlined" [data]="invoices" [fields]="fields" />
      <tx-export-button
        format="print"
        variant="outlined"
        title="Invoices"
        [data]="invoices"
        [fields]="fields"
      />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExportFormatsExample {
  readonly fields: TxExportField<Invoice>[] = [
    { field: 'id', title: 'Invoice' },
    { field: 'customer', title: 'Customer' },
    { field: 'total', title: 'Total, EUR', format: '#,##0.00' },
    { field: 'issued', title: 'Issued', type: 'date' },
    { field: 'paid', title: 'Paid' },
  ];
  readonly invoices: Invoice[] = [
    {
      id: 'INV-1001',
      customer: 'Northwind',
      total: 1240.5,
      issued: new Date(2026, 9, 2),
      paid: true,
    },
    {
      id: 'INV-1002',
      customer: 'Сонячна пекарня',
      total: 860,
      issued: new Date(2026, 9, 9),
      paid: false,
    },
    {
      id: 'INV-1003',
      customer: 'Fabrikam',
      total: 2310.75,
      issued: new Date(2026, 9, 16),
      paid: true,
    },
    {
      id: 'INV-1004',
      customer: 'Contoso',
      total: 99.9,
      issued: new Date(2026, 9, 23),
      paid: false,
    },
  ];
}
