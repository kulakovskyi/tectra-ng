import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPieChart, TxPieData, TxPieLegendPipe } from '@tectra-ng/charts/pie';
import { TxTag } from '@tectra-ng/ui/tag';

@Component({
  selector: 'pie-chart-own-legend-example',
  imports: [TxPieChart, TxPieLegendPipe, TxTag, DecimalPipe],
  template: `
    <div class="card">
      <tx-pie-chart
        [pieData]="tags"
        [chartWidth]="180"
        [chartHeight]="180"
        [showLegend]="false"
        [showDataLabels]="false"
        totalLabel="Tags"
        donutSize="72%"
        [segmentGap]="1"
        ariaLabel="Articles by tag"
      />
      <div class="rows" role="list" aria-label="Articles by tag">
        @for (item of tags | txPieLegend; track item.label) {
          <div class="row" role="listitem">
            <span class="swatch" [style.background]="item.color"></span>
            <span class="name">{{ item.label }}</span>
            <span class="count">{{ item.value }}</span>
            <tx-tag severity="secondary" [value]="(item.percent | number: '1.0-0') + '%'" />
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .card {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 24px;
    }
    .rows {
      display: grid;
      gap: 8px;
      min-width: 220px;
    }
    .row {
      display: grid;
      grid-template-columns: 10px 1fr auto auto;
      align-items: center;
      gap: 10px;
      font-size: 13px;
    }
    .swatch {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .count {
      font-variant-numeric: tabular-nums;
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PieChartOwnLegendExample {
  readonly tags: TxPieData = {
    series: [48, 31, 22, 14, 9],
    labels: ['Angular', 'Design', 'Accessibility', 'Performance', 'Testing'],
  };
}
