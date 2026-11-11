import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRangeAreaChart, TxRangeSeries } from '@tectra-ng/charts/range-area';

@Component({
  selector: 'range-area-chart-accessibility-example',
  imports: [TxRangeAreaChart],
  template: `<tx-range-area-chart
    [series]="series"
    [categories]="days"
    ariaLabel="Heart rate during the week"
  />`,
  styles: `
    tx-range-area-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RangeAreaChartAccessibilityExample {
  readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  readonly series: TxRangeSeries[] = [
    {
      name: 'Heart rate',
      low: [52, 55, 50, 54, 53, 58, 56],
      high: [142, 128, 151, 133, 120, 165, 110],
      line: [68, 70, 66, 69, 71, 75, 64],
    },
  ];
}
