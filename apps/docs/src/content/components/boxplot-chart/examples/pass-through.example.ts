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
  selector: 'boxplot-chart-pass-through-example',
  imports: [TxBoxplotChart],
  template: `<tx-boxplot-chart
    [series]="series"
    [categories]="labels"
    [pt]="{
      whisker: { style: { 'stroke-dasharray': '3 3' } },
      median: { style: { stroke: 'var(--tx-text-primary)' } },
    }"
    ariaLabel="Dashed whiskers"
  />`,
  styles: `
    tx-boxplot-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BoxplotChartPassThroughExample {
  readonly labels = ['North', 'South'];
  readonly series: TxBoxplotSeries[] = [
    { name: 'Sales', data: [sample(40, 70, 18, 51), sample(40, 55, 14, 52)] },
  ];
}
