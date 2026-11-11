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
  selector: 'boxplot-chart-accessibility-example',
  imports: [TxBoxplotChart],
  template: `<tx-boxplot-chart
    [series]="series"
    [categories]="teams"
    ariaLabel="Lead time by team, days"
  />`,
  styles: `
    tx-boxplot-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BoxplotChartAccessibilityExample {
  readonly teams = ['Core', 'Web', 'Mobile'];
  readonly series: TxBoxplotSeries[] = [
    { name: 'Lead time', data: [sample(40, 6, 3, 31), sample(40, 4, 2, 32), sample(40, 9, 4, 33)] },
  ];
}
