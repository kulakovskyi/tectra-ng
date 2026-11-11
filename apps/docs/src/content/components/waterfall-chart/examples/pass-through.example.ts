import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxWaterfallChart, TxWaterfallItem } from '@tectra-ng/charts/waterfall';

@Component({
  selector: 'waterfall-chart-pass-through-example',
  imports: [TxWaterfallChart],
  template: `<tx-waterfall-chart
    [items]="items"
    [pt]="{
      connector: { style: { 'stroke-dasharray': '1 3' } },
      dataLabel: { style: { 'font-weight': '400' } },
    }"
    ariaLabel="Points by round"
  />`,
  styles: `
    tx-waterfall-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WaterfallChartPassThroughExample {
  readonly items: TxWaterfallItem[] = [
    { label: 'Round 1', value: 12 },
    { label: 'Round 2', value: -4 },
    { label: 'Round 3', value: 9 },
    { label: 'Score', total: true },
  ];
}
