import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxComboChart, TxComboChartSeries } from '@tectra-ng/charts/combo';
import { TxChartTooltipFormatter } from '@tectra-ng/charts/core';

@Component({
  selector: 'combo-chart-tooltip-example',
  imports: [TxComboChart],
  template: `<tx-combo-chart
    [series]="series"
    [categories]="weeks"
    tooltipMode="single"
    [tooltipFormatter]="format"
    y2ValueFormat="percent"
    ariaLabel="Trials and conversion by week"
  />`,
  styles: `
    tx-combo-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ComboChartTooltipExample {
  readonly weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
  readonly series: TxComboChartSeries[] = [
    { name: 'Trials', data: [180, 210, 195, 240, 260, 255] },
    {
      name: 'Conversion',
      data: [11.2, 12.8, 12.1, 14.5, 15.2, 16.0],
      type: 'line',
      axis: 'secondary',
    },
  ];

  readonly format: TxChartTooltipFormatter = (value, { seriesIndex }) =>
    seriesIndex === 0 ? `${value} trials` : `${value.toFixed(1)}% converted`;
}
