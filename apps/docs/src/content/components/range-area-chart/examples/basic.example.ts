import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRangeAreaChart, TxRangeSeries } from '@tectra-ng/charts/range-area';

@Component({
  selector: 'range-area-chart-basic-example',
  imports: [TxRangeAreaChart],
  template: `<tx-range-area-chart
    [series]="series"
    [categories]="months"
    yAxisTitle="°C"
    ariaLabel="Temperature by month"
  />`,
  styles: `
    tx-range-area-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RangeAreaChartBasicExample {
  readonly months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  readonly series: TxRangeSeries[] = [
    {
      name: 'Temperature',
      low: [-6, -5, -1, 5, 11, 15, 17, 16, 11, 6, 1, -3],
      high: [0, 1, 7, 15, 22, 25, 27, 26, 20, 13, 5, 1],
      line: [-3, -2, 3, 10, 16, 20, 22, 21, 15, 9, 3, -1],
    },
  ];
}
