import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBoxplotSeries, TxBoxplotChart } from '@tectra-ng/charts/boxplot';

function noise(index: number, seed: number): number {
  const wave = Math.sin((index + 1) * 12.9898 + seed * 78.233) * 43758.5453;
  return wave - Math.floor(wave) - 0.5;
}

function sample(count: number, centre: number, spread: number, seed: number): number[] {
  return Array.from({ length: count }, (_, index) => {
    const bell = (noise(index, seed) + noise(index, seed + 0.31) + noise(index, seed + 0.67)) / 1.5;
    if (seed % 3 && index === count - 1)
      return Math.round(centre + spread * (2.4 + (seed % 4) * 0.5));
    if (seed % 2 && index === count - 2) return Math.round(centre - spread * 2.2);
    return Math.round(centre + bell * spread);
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
