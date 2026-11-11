import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRangeAreaChart, TxRangeSeries } from '@tectra-ng/charts/range-area';

@Component({
  selector: 'range-area-chart-design-tokens-example',
  imports: [TxRangeAreaChart],
  template: `<tx-range-area-chart
    [series]="series"
    [categories]="days"
    [dt]="{
      rangeArea: { fillOpacity: '0.35', edgeWidth: '0', lineWidth: '3' },
      series: { color1: 'var(--tx-orange-400)' },
    }"
    ariaLabel="Custom band"
  />`,
  styles: `
    tx-range-area-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RangeAreaChartDesignTokensExample {
  readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  readonly series: TxRangeSeries[] = [
    {
      name: 'Price',
      low: [10, 12, 11, 13, 15],
      high: [14, 16, 15, 18, 19],
      line: [12, 14, 13, 15, 17],
    },
  ];
}
