import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxWaterfallChart, TxWaterfallItem } from '@tectra-ng/charts/waterfall';

@Component({
  selector: 'waterfall-chart-design-tokens-example',
  imports: [TxWaterfallChart],
  template: `<tx-waterfall-chart
    [items]="items"
    [dt]="{
      waterfall: {
        upColor: 'var(--tx-sky-500)',
        downColor: 'var(--tx-orange-400)',
        totalColor: 'var(--tx-surface-600)',
        connectorDash: 'none',
      },
      bar: { radius: '2px', width: '70%' },
    }"
    ariaLabel="Stock movements"
  />`,
  styles: `
    tx-waterfall-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WaterfallChartDesignTokensExample {
  readonly items: TxWaterfallItem[] = [
    { label: 'On hand', value: 300 },
    { label: 'Received', value: 140 },
    { label: 'Shipped', value: -210 },
    { label: 'Returned', value: 25 },
    { label: 'Now', total: true },
  ];
}
