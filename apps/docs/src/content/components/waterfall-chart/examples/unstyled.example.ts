import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxWaterfallChart, TxWaterfallItem } from '@tectra-ng/charts/waterfall';

@Component({
  selector: 'waterfall-chart-unstyled-example',
  imports: [TxWaterfallChart],
  template: `<tx-waterfall-chart
    [items]="items"
    unstyled
    [height]="260"
    ariaLabel="Unstyled chart"
  />`,
  styles: `
    tx-waterfall-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WaterfallChartUnstyledExample {
  readonly items: TxWaterfallItem[] = [
    { label: 'A', value: 10 },
    { label: 'B', value: -3 },
    { label: 'Total', total: true },
  ];
}
