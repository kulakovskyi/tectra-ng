import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartAnnotation } from '@tectra-ng/charts/core';
import { TxScatterChart, TxScatterSeries } from '@tectra-ng/charts/scatter';

@Component({
  selector: 'scatter-chart-annotations-example',
  imports: [TxScatterChart],
  template: `<tx-scatter-chart
    [series]="series"
    [annotations]="annotations"
    xAxisTitle="Response time, ms"
    yAxisTitle="Error rate, %"
    ariaLabel="Services against their limits"
  />`,
  styles: `
    tx-scatter-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScatterChartAnnotationsExample {
  readonly series: TxScatterSeries[] = [
    {
      name: 'Services',
      data: [
        { x: 120, y: 0.4, label: 'Auth' },
        { x: 210, y: 0.9, label: 'Search' },
        { x: 340, y: 1.6, label: 'Billing' },
        { x: 95, y: 0.2, label: 'Profile' },
        { x: 640, y: 4.8, label: 'Reports' },
        { x: 480, y: 3.1, label: 'Export' },
      ],
    },
  ];
  readonly annotations: TxChartAnnotation[] = [
    { type: 'x-band', from: 400, to: 700, label: 'Too slow', tone: 'danger' },
    { type: 'y-line', y: 2, label: 'Error budget', tone: 'warn' },
  ];
}
