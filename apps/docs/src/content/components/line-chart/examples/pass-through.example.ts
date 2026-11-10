import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';

@Component({
  selector: 'line-chart-pass-through-example',
  imports: [TxLineChart],
  template: `
    <tx-line-chart
      [series]="series"
      [categories]="months"
      [height]="280"
      [pt]="{
        line: { style: { 'stroke-dasharray': '6 4' } },
        legendItem: { style: { 'text-transform': 'uppercase', 'letter-spacing': '0.04em' } },
      }"
      ariaLabel="Forecast and actual"
    />
  `,
  styles: `
    tx-line-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartPassThroughExample {
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  readonly series: TxChartSeries[] = [
    { name: 'Forecast', data: [100, 110, 120, 130, 140, 150] },
    { name: 'Actual', data: [96, 114, 117, 136, 139, 158] },
  ];
}
