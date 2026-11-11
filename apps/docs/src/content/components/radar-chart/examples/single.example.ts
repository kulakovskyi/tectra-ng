import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxRadarChart } from '@tectra-ng/charts/radar';

@Component({
  selector: 'radar-chart-single-example',
  imports: [TxRadarChart],
  template: `<tx-radar-chart
    [series]="series"
    [categories]="metrics"
    [height]="300"
    ariaLabel="Page quality scores"
  />`,
  styles: `
    tx-radar-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadarChartSingleExample {
  readonly metrics = ['Speed', 'Accessibility', 'Best practices', 'SEO', 'Stability'];
  readonly series: TxChartSeries[] = [{ name: 'Score', data: [72, 96, 88, 91, 64] }];
}
