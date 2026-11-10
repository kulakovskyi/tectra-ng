import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';

@Component({
  selector: 'line-chart-axes-example',
  imports: [TxLineChart],
  template: `
    <tx-line-chart
      [series]="series"
      [categories]="cities"
      xAxisTitle="City"
      yAxisTitle="Delivery time, h"
      grid="both"
      yAxisPosition="right"
      [yMin]="0"
      [yMax]="60"
      labelMode="rotate"
      markers
      [area]="false"
      [height]="340"
      ariaLabel="Delivery time by city"
    />
  `,
  styles: `
    tx-line-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartAxesExample {
  readonly cities = [
    'Amsterdam',
    'Barcelona',
    'Copenhagen',
    'Dublin',
    'Edinburgh',
    'Florence',
    'Geneva',
    'Helsinki',
  ];
  readonly series: TxChartSeries[] = [
    { name: 'Delivery time', data: [26, 38, 31, 44, 40, 35, 29, 48] },
  ];
}
