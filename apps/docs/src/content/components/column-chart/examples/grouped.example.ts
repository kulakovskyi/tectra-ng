import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxColumnChart } from '@tectra-ng/charts/column';
import { TxChartSeries } from '@tectra-ng/charts/core';

@Component({
  selector: 'column-chart-grouped-example',
  imports: [TxColumnChart],
  template: `<tx-column-chart
    [series]="series"
    [categories]="regions"
    [stacked]="false"
    ariaLabel="Sales by region, this year and last year"
  />`,
  styles: `
    tx-column-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColumnChartGroupedExample {
  readonly regions = ['North', 'South', 'East', 'West', 'Central'];
  readonly series: TxChartSeries[] = [
    { name: '2025', data: [48, 36, 52, 41, 30] },
    { name: '2026', data: [55, 39, 61, 38, 42] },
  ];
}
