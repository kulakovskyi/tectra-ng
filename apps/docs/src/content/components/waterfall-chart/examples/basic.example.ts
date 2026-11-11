import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxWaterfallChart, TxWaterfallItem } from '@tectra-ng/charts/waterfall';

@Component({
  selector: 'waterfall-chart-basic-example',
  imports: [TxWaterfallChart],
  template: `<tx-waterfall-chart
    [items]="items"
    valueFormat="compact"
    ariaLabel="Cash flow for the quarter"
  />`,
  styles: `
    tx-waterfall-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WaterfallChartBasicExample {
  readonly items: TxWaterfallItem[] = [
    { label: 'Opening', value: 420000 },
    { label: 'Sales', value: 310000 },
    { label: 'Services', value: 95000 },
    { label: 'Salaries', value: -240000 },
    { label: 'Rent', value: -60000 },
    { label: 'Taxes', value: -85000 },
    { label: 'Closing', total: true },
  ];
}
