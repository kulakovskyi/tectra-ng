import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxRadarChart } from '@tectra-ng/charts/radar';

@Component({
  selector: 'radar-chart-legend-example',
  imports: [TxRadarChart],
  template: `<tx-radar-chart
    [series]="series"
    [categories]="stats"
    legendPosition="right"
    legendVariant="stat"
    ariaLabel="Team results by area"
  />`,
  styles: `
    tx-radar-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadarChartLegendExample {
  readonly stats = ['Delivery', 'Quality', 'Support', 'Docs', 'Uptime'];
  readonly series: TxChartSeries[] = [
    { name: 'Team North', data: [82, 74, 90, 61, 97] },
    { name: 'Team South', data: [70, 88, 76, 84, 92] },
  ];
}
