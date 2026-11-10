import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxColumnChart } from '@tectra-ng/charts/column';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxChartTooltipFormatter } from '@tectra-ng/charts/core';

@Component({
  selector: 'column-chart-tooltip-formatter-example',
  imports: [TxColumnChart],
  template: `<tx-column-chart
    [series]="series"
    [categories]="months"
    [tooltipFormatter]="withOriginal"
    ariaLabel="Spending in euro"
  />`,
  styles: `
    tx-column-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColumnChartTooltipFormatterExample {
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr'];
  readonly series: TxChartSeries[] = [
    { name: 'Hosting', data: [270, 280, 310, 305] },
    { name: 'Tools', data: [120, 95, 140, 150] },
  ];
  private readonly rate = 1.16;
  readonly withOriginal: TxChartTooltipFormatter = (value) =>
    `€${value} ≈ $${Math.round(value * this.rate)}`;
}
