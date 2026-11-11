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
  selector: 'boxplot-chart-design-tokens-example',
  imports: [TxBoxplotChart],
  template: `<tx-boxplot-chart
    [series]="series"
    [categories]="labels"
    [dt]="{
      boxplot: { boxWidth: '0.3', fillOpacity: '0.5', medianWidth: '3.5', whiskerWidth: '0' },
      series: { color1: 'var(--tx-purple-500)' },
    }"
    ariaLabel="Custom boxes"
  />`,
  styles: `
    tx-boxplot-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BoxplotChartDesignTokensExample {
  readonly labels = ['A', 'B', 'C'];
  readonly series: TxBoxplotSeries[] = [
    {
      name: 'Values',
      data: [sample(40, 50, 15, 41), sample(40, 60, 12, 42), sample(40, 45, 20, 43)],
    },
  ];
}
