import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxRadarChart } from '@tectra-ng/charts/radar';

@Component({
  selector: 'radar-chart-pass-through-example',
  imports: [TxRadarChart],
  template: `<tx-radar-chart
    [series]="series"
    [categories]="axes"
    [pt]="{
      line: { style: { 'stroke-dasharray': '5 4' } },
      axisLabel: { style: { 'text-transform': 'uppercase', 'letter-spacing': '0.06em' } },
    }"
    ariaLabel="Plan and fact"
  />`,
  styles: `
    tx-radar-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadarChartPassThroughExample {
  readonly axes = ['North', 'East', 'South', 'West', 'Online'];
  readonly series: TxChartSeries[] = [
    { name: 'Plan', data: [50, 40, 45, 35, 60] },
    { name: 'Fact', data: [55, 32, 47, 41, 72] },
  ];
}
