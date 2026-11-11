import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxRadarChart } from '@tectra-ng/charts/radar';

@Component({
  selector: 'radar-chart-basic-example',
  imports: [TxRadarChart],
  template: `<tx-radar-chart
    [series]="series"
    [categories]="skills"
    ariaLabel="Skills of two candidates"
  />`,
  styles: `
    tx-radar-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadarChartBasicExample {
  readonly skills = ['Frontend', 'Backend', 'Testing', 'Design', 'Communication', 'Planning'];
  readonly series: TxChartSeries[] = [
    { name: 'Candidate A', data: [90, 55, 70, 80, 65, 50] },
    { name: 'Candidate B', data: [60, 85, 75, 40, 70, 80] },
  ];
}
