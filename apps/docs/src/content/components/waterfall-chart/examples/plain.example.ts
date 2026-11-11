import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxWaterfallChart, TxWaterfallItem } from '@tectra-ng/charts/waterfall';

@Component({
  selector: 'waterfall-chart-plain-example',
  imports: [TxWaterfallChart],
  template: `<tx-waterfall-chart
    [items]="items"
    [dataLabels]="false"
    [connectors]="false"
    [showLegend]="false"
    yAxisTitle="Visitors"
    [height]="280"
    ariaLabel="Visitors gained and lost by source"
  />`,
  styles: `
    tx-waterfall-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WaterfallChartPlainExample {
  readonly items: TxWaterfallItem[] = [
    { label: 'Last week', value: 5200 },
    { label: 'Search', value: 640 },
    { label: 'Social', value: -310 },
    { label: 'Email', value: 220 },
    { label: 'Ads', value: -480 },
    { label: 'This week', total: true },
  ];
}
