import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxColumnChart } from '@tectra-ng/charts/column';
import { TxChartSeries } from '@tectra-ng/charts/core';

@Component({
  selector: 'column-chart-unstyled-example',
  imports: [TxColumnChart],
  template: `<tx-column-chart
    [series]="series"
    [categories]="days"
    unstyled
    [height]="260"
    ariaLabel="Unstyled chart"
  />`,
  styles: `
    tx-column-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColumnChartUnstyledExample {
  readonly days = ['Mon', 'Tue', 'Wed'];
  readonly series: TxChartSeries[] = [{ name: 'Tasks', data: [5, 8, 3] }];
}
