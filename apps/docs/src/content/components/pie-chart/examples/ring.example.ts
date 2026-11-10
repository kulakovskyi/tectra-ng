import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPieChart, TxPieData } from '@tectra-ng/charts/pie';

@Component({
  selector: 'pie-chart-ring-example',
  imports: [TxPieChart],
  template: `
    <div class="row">
      <tx-pie-chart
        [pieData]="status"
        [chartWidth]="200"
        [chartHeight]="200"
        [showLegend]="false"
        [showDataLabels]="false"
        donutSize="82%"
        [segmentGap]="4"
        [segmentRadius]="12"
        totalLabel="Hosts"
        ariaLabel="Hosts by status, thin ring"
      />
      <tx-pie-chart
        [pieData]="status"
        [chartWidth]="200"
        [chartHeight]="200"
        [showLegend]="false"
        [showDataLabels]="false"
        donutSize="45%"
        [segmentGap]="0"
        [segmentRadius]="0"
        totalLabel="Hosts"
        ariaLabel="Hosts by status, thick ring"
      />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 32px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PieChartRingExample {
  readonly status: TxPieData = {
    series: [62, 9, 4],
    labels: ['Healthy', 'Degraded', 'Down'],
    colors: ['var(--tx-green-500)', 'var(--tx-amber-400)', 'var(--tx-red-500)'],
  };
}
