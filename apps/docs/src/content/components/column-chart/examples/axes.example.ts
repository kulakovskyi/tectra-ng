import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxColumnChart } from '@tectra-ng/charts/column';
import { TxChartSeries } from '@tectra-ng/charts/core';

@Component({
  selector: 'column-chart-axes-example',
  imports: [TxColumnChart],
  template: `<tx-column-chart
    [series]="series"
    [categories]="products"
    xAxisTitle="Product"
    yAxisTitle="Revenue"
    [yMax]="400000"
    valueFormat="compact"
    grid="both"
    xAxisPosition="top"
    labelMode="rotate"
    [height]="380"
    ariaLabel="Revenue by product"
  />`,
  styles: `
    tx-column-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColumnChartAxesExample {
  readonly products = [
    'Analytics suite',
    'Billing module',
    'Customer portal',
    'Data warehouse',
    'Email service',
    'File storage',
  ];
  readonly series: TxChartSeries[] = [
    { name: 'Revenue', data: [312000, 184000, 251000, 296000, 98000, 143000] },
  ];
}
