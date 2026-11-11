import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxWaterfallChart, TxWaterfallItem } from '@tectra-ng/charts/waterfall';

@Component({
  selector: 'waterfall-chart-negative-example',
  imports: [TxWaterfallChart],
  template: `<tx-waterfall-chart [items]="items" ariaLabel="Account balance" />`,
  styles: `
    tx-waterfall-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WaterfallChartNegativeExample {
  readonly items: TxWaterfallItem[] = [
    { label: 'Start', value: 40 },
    { label: 'Payroll', value: -95 },
    { label: 'Invoices', value: 30 },
    { label: 'Supplier', value: -25 },
    { label: 'Loan', value: 120 },
    { label: 'End', total: true },
  ];
}
