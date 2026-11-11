import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBoxplotSeries, TxBoxplotChart } from '@tectra-ng/charts/boxplot';

function sample(count: number, centre: number, spread: number, seed: number): number[] {
  return Array.from({ length: count }, (_, index) => {
    const wave = Math.sin((index + 1) * 12.9898 + seed * 78.233) * 43758.5453;
    const noise = wave - Math.floor(wave) - 0.5;
    return Math.round(centre + noise * spread * 2 + (index % 17 === 0 ? spread * 3 : 0));
  });
}

@Component({
  selector: 'boxplot-chart-basic-example',
  imports: [TxBoxplotChart],
  template: `<tx-boxplot-chart
    [series]="series"
    [categories]="services"
    yAxisTitle="Response time, ms"
    ariaLabel="Response time by service"
  />`,
  styles: `
    tx-boxplot-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BoxplotChartBasicExample {
  readonly services = ['Auth', 'Search', 'Checkout', 'Profile', 'Reports'];
  readonly series: TxBoxplotSeries[] = [
    {
      name: 'Response time',
      data: [
        sample(80, 120, 30, 1),
        sample(80, 210, 60, 2),
        sample(80, 340, 90, 3),
        sample(80, 95, 20, 4),
        sample(80, 520, 140, 5),
      ],
    },
  ];
}
