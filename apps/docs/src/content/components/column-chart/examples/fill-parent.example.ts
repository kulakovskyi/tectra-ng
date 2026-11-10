import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxColumnChart } from '@tectra-ng/charts/column';
import { TxChartSeries } from '@tectra-ng/charts/core';

@Component({
  selector: 'column-chart-fill-parent-example',
  imports: [TxColumnChart],
  template: `<div class="box">
    <tx-column-chart
      [series]="series"
      [categories]="days"
      height="100%"
      ariaLabel="Deploys per day"
    />
  </div>`,
  styles: `
    .box {
      width: 100%;
      height: 260px;
      min-width: 240px;
      resize: horizontal;
      overflow: hidden;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColumnChartFillParentExample {
  readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  readonly series: TxChartSeries[] = [
    { name: 'Production', data: [4, 6, 3, 7, 2] },
    { name: 'Staging', data: [9, 12, 8, 11, 6] },
  ];
}
