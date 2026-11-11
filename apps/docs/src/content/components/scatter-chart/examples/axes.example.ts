import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxScatterChart, TxScatterSeries } from '@tectra-ng/charts/scatter';

@Component({
  selector: 'scatter-chart-axes-example',
  imports: [TxScatterChart],
  template: `<tx-scatter-chart
    [series]="series"
    xAxisTitle="Population"
    yAxisTitle="Area, km²"
    xValueFormat="compact"
    valueFormat="compact"
    yScale="log"
    grid="value"
    yAxisPosition="right"
    [height]="380"
    ariaLabel="Population and area by city"
  />`,
  styles: `
    tx-scatter-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScatterChartAxesExample {
  readonly series: TxScatterSeries[] = [
    {
      name: 'Cities',
      data: [
        { x: 2100000, y: 105, label: 'City A' },
        { x: 3600000, y: 890, label: 'City B' },
        { x: 870000, y: 41, label: 'City C' },
        { x: 1800000, y: 755, label: 'City D' },
        { x: 540000, y: 220, label: 'City E' },
        { x: 4200000, y: 1500, label: 'City F' },
        { x: 320000, y: 12, label: 'City G' },
      ],
    },
  ];
}
