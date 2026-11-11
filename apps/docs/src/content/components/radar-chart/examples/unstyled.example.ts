import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxRadarChart } from '@tectra-ng/charts/radar';

@Component({
  selector: 'radar-chart-unstyled-example',
  imports: [TxRadarChart],
  template: `<tx-radar-chart
    [series]="series"
    [categories]="axes"
    unstyled
    [height]="260"
    ariaLabel="Unstyled chart"
  />`,
  styles: `
    tx-radar-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadarChartUnstyledExample {
  readonly axes = ['A', 'B', 'C', 'D', 'E'];
  readonly series: TxChartSeries[] = [{ name: 'Values', data: [5, 8, 3, 6, 7] }];
}
