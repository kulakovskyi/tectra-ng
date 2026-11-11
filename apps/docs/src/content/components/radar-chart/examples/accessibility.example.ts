import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxRadarChart } from '@tectra-ng/charts/radar';

@Component({
  selector: 'radar-chart-accessibility-example',
  imports: [TxRadarChart],
  template: `<tx-radar-chart [series]="series" [categories]="areas" ariaLabel="Course feedback" />`,
  styles: `
    tx-radar-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadarChartAccessibilityExample {
  readonly areas = ['Content', 'Pace', 'Exercises', 'Support', 'Tools'];
  readonly series: TxChartSeries[] = [
    { name: 'Spring', data: [4.2, 3.6, 4.5, 3.9, 4.1] },
    { name: 'Autumn', data: [4.4, 4.1, 4.3, 4.6, 3.8] },
  ];
}
