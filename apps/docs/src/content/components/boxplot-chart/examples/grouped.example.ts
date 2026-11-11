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
  selector: 'boxplot-chart-grouped-example',
  imports: [TxBoxplotChart],
  template: `<tx-boxplot-chart
    [series]="series"
    [categories]="quarters"
    ariaLabel="Deal size by region"
    valueFormat="compact"
  />`,
  styles: `
    tx-boxplot-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BoxplotChartGroupedExample {
  readonly quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  readonly series: TxBoxplotSeries[] = [
    {
      name: 'Europe',
      data: [
        sample(60, 42000, 9000, 11),
        sample(60, 46000, 9000, 12),
        sample(60, 51000, 11000, 13),
        sample(60, 49000, 10000, 14),
      ],
    },
    {
      name: 'Americas',
      data: [
        sample(60, 38000, 12000, 21),
        sample(60, 41000, 12000, 22),
        sample(60, 44000, 13000, 23),
        sample(60, 53000, 15000, 24),
      ],
    },
  ];
}
