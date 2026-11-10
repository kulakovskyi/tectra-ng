import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxColumnChart } from '@tectra-ng/charts/column';
import { TxChartSeries } from '@tectra-ng/charts/core';

@Component({
  selector: 'column-chart-horizontal-example',
  imports: [TxColumnChart],
  template: `<tx-column-chart
    [series]="series"
    [categories]="pages"
    horizontal
    [height]="320"
    ariaLabel="Views by page"
  />`,
  styles: `
    tx-column-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColumnChartHorizontalExample {
  readonly pages = [
    'Getting started',
    'Installation',
    'Theming and design tokens',
    'Forms',
    'Data table with filters and export',
    'Icons',
  ];
  readonly series: TxChartSeries[] = [
    { name: 'Views', data: [5400, 4100, 2900, 2600, 2200, 1500] },
  ];
}
