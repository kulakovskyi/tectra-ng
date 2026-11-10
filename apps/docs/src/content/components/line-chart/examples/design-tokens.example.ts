import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';

@Component({
  selector: 'line-chart-design-tokens-example',
  imports: [TxLineChart],
  template: `
    <tx-line-chart
      [series]="series"
      [categories]="months"
      [height]="300"
      [dt]="{
        series: { color1: 'var(--tx-purple-500)', color2: 'var(--tx-amber-500)' },
        line: { strokeWidth: '3.5', areaOpacityFrom: '0.45' },
        grid: { dash: '4 4' },
      }"
      ariaLabel="Energy use"
    />
  `,
  styles: `
    tx-line-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartDesignTokensExample {
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  readonly series: TxChartSeries[] = [
    { name: 'Solar', data: [120, 180, 260, 340, 410, 460] },
    { name: 'Grid', data: [420, 380, 330, 280, 230, 200] },
    { name: 'Battery', color: 'var(--tx-sky-500)', data: [40, 60, 90, 120, 150, 170] },
  ];
}
