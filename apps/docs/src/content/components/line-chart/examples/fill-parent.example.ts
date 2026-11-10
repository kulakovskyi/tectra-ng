import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';

@Component({
  selector: 'line-chart-fill-parent-example',
  imports: [TxLineChart],
  template: `
    <div class="box">
      <tx-line-chart [series]="series" [categories]="days" height="100%" ariaLabel="Disk usage" />
    </div>
  `,
  styles: `
    .box {
      width: 100%;
      height: 240px;
      min-width: 240px;
      resize: horizontal;
      overflow: hidden;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartFillParentExample {
  readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  readonly series: TxChartSeries[] = [
    { name: 'Disk, GB', data: [212, 218, 221, 230, 236, 239, 247] },
  ];
}
