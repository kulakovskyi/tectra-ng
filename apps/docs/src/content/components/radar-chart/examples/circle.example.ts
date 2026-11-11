import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxRadarChart } from '@tectra-ng/charts/radar';

@Component({
  selector: 'radar-chart-circle-example',
  imports: [TxRadarChart],
  template: `<tx-radar-chart
    [series]="series"
    [categories]="months"
    shape="circle"
    [markers]="false"
    ariaLabel="Rainy days by month"
  />`,
  styles: `
    tx-radar-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadarChartCircleExample {
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
  readonly series: TxChartSeries[] = [
    { name: 'North', data: [18, 15, 14, 12, 11, 10, 9, 11, 13, 16, 18, 19] },
    { name: 'South', data: [9, 8, 7, 6, 4, 2, 1, 1, 3, 6, 8, 10] },
  ];
}
