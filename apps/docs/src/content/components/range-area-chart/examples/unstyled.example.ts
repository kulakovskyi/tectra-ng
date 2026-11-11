import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRangeAreaChart, TxRangeSeries } from '@tectra-ng/charts/range-area';

@Component({
  selector: 'range-area-chart-unstyled-example',
  imports: [TxRangeAreaChart],
  template: `<tx-range-area-chart
    [series]="series"
    [categories]="days"
    unstyled
    [height]="260"
    ariaLabel="Unstyled chart"
  />`,
  styles: `
    tx-range-area-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RangeAreaChartUnstyledExample {
  readonly days = ['A', 'B', 'C', 'D'];
  readonly series: TxRangeSeries[] = [
    { name: 'Range', low: [1, 2, 1, 3], high: [4, 6, 5, 7], line: [2, 4, 3, 5] },
  ];
}
