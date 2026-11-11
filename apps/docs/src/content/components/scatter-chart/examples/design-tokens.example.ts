import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxScatterChart, TxScatterSeries } from '@tectra-ng/charts/scatter';

@Component({
  selector: 'scatter-chart-design-tokens-example',
  imports: [TxScatterChart],
  template: `<tx-scatter-chart
    [series]="series"
    trendLine
    [dt]="{
      scatter: { pointRadius: '7', fillOpacity: '0.5', trendWidth: '2.5', trendDash: 'none' },
      series: { color1: 'var(--tx-green-500)' },
    }"
    ariaLabel="Temperature and sales"
  />`,
  styles: `
    tx-scatter-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScatterChartDesignTokensExample {
  readonly series: TxScatterSeries[] = [
    {
      name: 'Sales',
      data: [
        [14, 215],
        [16, 325],
        [12, 185],
        [19, 412],
        [22, 522],
        [18, 406],
        [25, 614],
        [23, 544],
      ],
    },
  ];
}
