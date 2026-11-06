import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxExport, TxExportField } from '@tectra-ng/ui/export';

interface Ticket {
  subject: string;
  author: { name: string };
  createdAt: string;
  hours: number;
  urgent: boolean;
  note: string;
}

@Component({
  selector: 'export-columns-example',
  imports: [TxExport],
  template: `<tx-export filename="tickets" title="Tickets" [data]="tickets" [fields]="fields" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExportColumnsExample {
  readonly fields: TxExportField<Ticket>[] = [
    { field: 'place', title: 'No.', width: 5, align: 'center' },
    { field: 'subject', title: 'Subject', width: 34 },
    { field: 'author.name', title: 'Author', width: 16 },
    {
      field: 'createdAt',
      title: 'Created',
      type: 'date',
      aggregator: (value) => new Date(String(value)),
      format: 'dd.mm.yyyy',
    },
    { field: 'hours', title: 'Hours', format: '0.0' },
    { field: 'urgent', title: 'Urgent' },
    { field: 'note', title: 'Internal note', formats: ['excel', 'csv', 'json'] },
  ];
  readonly tickets: Ticket[] = [
    {
      subject: 'Login fails, then works',
      author: { name: 'Ada' },
      createdAt: '2026-10-02T09:14:00Z',
      hours: 1.5,
      urgent: true,
      note: '=1+1 stays text',
    },
    {
      subject: 'Invoice, "draft" status',
      author: { name: 'Оксана' },
      createdAt: '2026-10-05T16:40:00Z',
      hours: 0.25,
      urgent: false,
      note: 'Two\nlines',
    },
    {
      subject: 'Export to PDF cuts long names',
      author: { name: 'Alan' },
      createdAt: '2026-10-07T11:05:00Z',
      hours: 3,
      urgent: false,
      note: '',
    },
  ];
}
