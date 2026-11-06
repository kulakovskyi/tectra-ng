import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxExport, TxExportField, provideTxExport } from '@tectra-ng/ui/export';

interface Payment {
  date: Date;
  payer: string;
  amount: number;
}

@Component({
  selector: 'export-defaults-example',
  imports: [TxExport],
  providers: [
    provideTxExport({
      showDate: true,
      csv: { separator: ';' },
      excel: { headerBackground: '#e0e7ff', numberFormat: '#,##0.00', dateFormat: 'dd.mm.yyyy' },
      pdf: { pageSize: 'letter', striped: true },
      word: { pageSize: 'letter', striped: true },
    }),
  ],
  template: `<tx-export
    filename="payments"
    title="Payments"
    [data]="payments"
    [fields]="fields"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExportDefaultsExample {
  readonly fields: TxExportField<Payment>[] = [
    { field: 'date', title: 'Date', type: 'date' },
    { field: 'payer', title: 'Payer' },
    { field: 'amount', title: 'Amount, EUR' },
  ];
  readonly payments: Payment[] = [
    { date: new Date(2026, 9, 1), payer: 'Northwind', amount: 1500 },
    { date: new Date(2026, 9, 8), payer: 'Сонячна пекарня', amount: 320.4 },
    { date: new Date(2026, 9, 15), payer: 'Contoso', amount: 87 },
  ];
}
