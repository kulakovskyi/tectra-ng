import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxWaterfallChart, TxWaterfallItem } from '@tectra-ng/charts/waterfall';

@Component({
  selector: 'waterfall-chart-subtotals-example',
  imports: [TxWaterfallChart],
  template: `<tx-waterfall-chart [items]="items" ariaLabel="Profit and loss" />`,
  styles: `
    tx-waterfall-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WaterfallChartSubtotalsExample {
  readonly items: TxWaterfallItem[] = [
    { label: 'Revenue', value: 820 },
    { label: 'Cost of sales', value: -310 },
    { label: 'Gross profit', total: true },
    { label: 'Marketing', value: -140 },
    { label: 'Research', value: -95 },
    { label: 'Admin', value: -70 },
    { label: 'Operating profit', total: true },
    { label: 'Interest', value: 12 },
    { label: 'Tax', value: -54 },
    { label: 'Net profit', total: true },
  ];
}
