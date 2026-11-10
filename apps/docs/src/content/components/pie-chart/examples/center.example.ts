import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPieCenter, TxPieChart, TxPieData } from '@tectra-ng/charts/pie';

@Component({
  selector: 'pie-chart-center-example',
  imports: [TxPieChart, TxPieCenter],
  template: `
    <tx-pie-chart
      [pieData]="storage"
      [chartWidth]="260"
      [chartHeight]="320"
      [showDataLabels]="false"
      donutSize="70%"
      ariaLabel="Storage used"
    >
      <ng-template txPieCenter let-center>
        <div class="center">
          <strong>{{ center.hovered ? center.value + ' GB' : center.total + ' GB' }}</strong>
          <span>{{ center.hovered ? center.label : 'of 512 GB used' }}</span>
        </div>
      </ng-template>
    </tx-pie-chart>
  `,
  styles: `
    .center {
      display: grid;
      justify-items: center;
      gap: 2px;
    }
    .center strong {
      font-size: 22px;
    }
    .center span {
      color: var(--tx-text-muted);
      font-size: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PieChartCenterExample {
  readonly storage: TxPieData = {
    series: [184, 96, 61, 23],
    labels: ['Video', 'Photos', 'Documents', 'Apps'],
  };
}
