import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxRadarChart } from '@tectra-ng/charts/radar';

@Component({
  selector: 'radar-chart-design-tokens-example',
  imports: [TxRadarChart],
  template: `<tx-radar-chart
    [series]="series"
    [categories]="axes"
    [dt]="{
      radar: {
        strokeWidth: '3',
        fillOpacity: '0.32',
        pointRadius: '0',
        labelColor: 'var(--tx-text-primary)',
      },
      series: { color1: 'var(--tx-purple-500)' },
    }"
    ariaLabel="Flavour profile"
  />`,
  styles: `
    tx-radar-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadarChartDesignTokensExample {
  readonly axes = ['Sweet', 'Sour', 'Bitter', 'Salty', 'Umami'];
  readonly series: TxChartSeries[] = [{ name: 'Flavour', data: [6, 3, 7, 2, 5] }];
}
