import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries, TxChartTooltipFormatter } from '@tectra-ng/charts/core';
import { TxRadarChart } from '@tectra-ng/charts/radar';

@Component({
  selector: 'radar-chart-scale-example',
  imports: [TxRadarChart],
  template: `<tx-radar-chart
    [series]="series"
    [categories]="criteria"
    [min]="0"
    [max]="5"
    [rings]="5"
    [tooltipFormatter]="format"
    ariaLabel="Ratings of three laptops"
  />`,
  styles: `
    tx-radar-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadarChartScaleExample {
  readonly criteria = ['Battery', 'Screen', 'Keyboard', 'Weight', 'Price'];
  readonly series: TxChartSeries[] = [
    { name: 'Laptop 13"', data: [4.5, 4, 3.5, 5, 3] },
    { name: 'Laptop 14"', data: [4, 4.5, 4.5, 4, 3.5] },
    { name: 'Laptop 16"', data: [3, 5, 4, 2.5, 2.5] },
  ];

  readonly format: TxChartTooltipFormatter = (value) => `${value} / 5`;
}
