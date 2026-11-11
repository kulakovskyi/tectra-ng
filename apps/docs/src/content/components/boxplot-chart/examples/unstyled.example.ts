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
  selector: 'boxplot-chart-unstyled-example',
  imports: [TxBoxplotChart],
  template: `<tx-boxplot-chart
    [series]="series"
    [categories]="labels"
    unstyled
    [height]="260"
    ariaLabel="Unstyled chart"
  />`,
  styles: `
    tx-boxplot-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BoxplotChartUnstyledExample {
  readonly labels = ['A', 'B'];
  readonly series: TxBoxplotSeries[] = [
    { name: 'Values', data: [sample(30, 20, 6, 61), sample(30, 26, 5, 62)] },
  ];
}
