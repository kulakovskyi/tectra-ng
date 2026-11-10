import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxColumnChart } from '@tectra-ng/charts/column';
import { TxChartSeries } from '@tectra-ng/charts/core';

@Component({
  selector: 'column-chart-design-tokens-example',
  imports: [TxColumnChart],
  template: `<tx-column-chart
    [series]="series"
    [categories]="months"
    [stacked]="false"
    [dt]="{
      bar: { radius: '2px', width: '72%', groupGap: '6px' },
      series: { color1: 'var(--tx-green-500)', color2: 'var(--tx-amber-400)' },
    }"
    ariaLabel="Plan and fact"
  />`,
  styles: `
    tx-column-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColumnChartDesignTokensExample {
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  readonly series: TxChartSeries[] = [
    { name: 'Plan', data: [30, 32, 34, 36, 38] },
    { name: 'Fact', data: [28, 35, 31, 39, 41] },
  ];
}
