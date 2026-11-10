import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSegmentedBar, TxSegmentedBarItem } from '@tectra-ng/charts/segmented-bar';

@Component({
  selector: 'segmented-bar-basic-example',
  imports: [TxSegmentedBar],
  template: `<tx-segmented-bar [items]="invoices" ariaLabel="Invoices by status" />`,
  styles: `
    :host {
      display: block;
      max-width: 520px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SegmentedBarBasicExample {
  readonly invoices: TxSegmentedBarItem[] = [
    { key: 'paid', label: 'Paid', value: 42, tone: 'success' },
    { key: 'pending', label: 'Pending', value: 13, tone: 'warn' },
    { key: 'overdue', label: 'Overdue', value: 5, tone: 'danger' },
  ];
}
