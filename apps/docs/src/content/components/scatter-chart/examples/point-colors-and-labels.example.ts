import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxScatterChart, TxScatterSeries } from '@tectra-ng/charts/scatter';

@Component({
  selector: 'scatter-chart-point-colors-and-labels-example',
  imports: [TxScatterChart],
  template: `<tx-scatter-chart
    [series]="series"
    xAxisTitle="Response time, ms"
    yAxisTitle="Error rate"
    valueFormat="percent"
    ariaLabel="Response time and error rate by service"
  />`,
  styles: `
    tx-scatter-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScatterChartPointColorsAndLabelsExample {
  readonly series: TxScatterSeries[] = [
    {
      name: 'Services',
      data: [
        { x: 120, y: 0.4, label: 'Auth' },
        { x: 210, y: 0.9, label: 'Search' },
        { x: 340, y: 1.6, label: 'Billing' },
        { x: 95, y: 0.2, label: 'Profile' },
        { x: 640, y: 4.8, label: 'Reports', color: 'var(--tx-red-500)' },
        { x: 480, y: 3.1, label: 'Export', color: 'var(--tx-orange-400)' },
      ],
    },
  ];
}
