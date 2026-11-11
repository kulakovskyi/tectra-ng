import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRangeAreaChart, TxRangeSeries } from '@tectra-ng/charts/range-area';

@Component({
  selector: 'range-area-chart-several-example',
  imports: [TxRangeAreaChart],
  template: `<tx-range-area-chart
    [series]="series"
    [categories]="hours"
    curve="straight"
    [edges]="false"
    ariaLabel="Latency range by region"
  />`,
  styles: `
    tx-range-area-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RangeAreaChartSeveralExample {
  readonly hours = ['00', '03', '06', '09', '12', '15', '18', '21'];
  readonly series: TxRangeSeries[] = [
    {
      name: 'Europe',
      low: [40, 38, 42, 60, 72, 70, 64, 50],
      high: [80, 76, 85, 130, 160, 150, 140, 100],
      line: [55, 52, 58, 85, 101, 98, 90, 70],
    },
    {
      name: 'Asia',
      low: [70, 74, 66, 52, 48, 50, 58, 64],
      high: [150, 160, 130, 95, 90, 92, 110, 135],
      line: [100, 108, 92, 70, 66, 68, 80, 92],
    },
  ];
}
