import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRankChart, TxRankSeries } from '@tectra-ng/charts/rank-line';

const DAY = 86_400_000;
const START = Date.UTC(2026, 4, 4, 9);
const KEYWORDS = ['angular charts', 'svg charts', 'dashboard kit', 'design tokens', 'ui kit'];

@Component({
  selector: 'rank-chart-legend-example',
  imports: [TxRankChart],
  template: `
    <tx-rank-chart
      [series]="series"
      showLegend
      legendPosition="bottom"
      legendVariant="pill"
      [height]="340"
      ariaLabel="Positions by keyword"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RankChartLegendExample {
  readonly series: TxRankSeries[] = KEYWORDS.map((name, index) => ({
    name,
    points: Array.from({ length: 10 }, (_, day) => ({
      time: START + day * DAY,
      rank: Math.max(1, Math.round(3 + index * 3 + 3 * Math.sin((day + index * 2) / 2))),
    })),
  }));
}
