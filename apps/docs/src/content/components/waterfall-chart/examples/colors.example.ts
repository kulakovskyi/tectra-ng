import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxWaterfallChart, TxWaterfallItem } from '@tectra-ng/charts/waterfall';

@Component({
  selector: 'waterfall-chart-colors-example',
  imports: [TxWaterfallChart],
  template: `<tx-waterfall-chart [items]="items" ariaLabel="Budget by team" />`,
  styles: `
    tx-waterfall-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WaterfallChartColorsExample {
  readonly items: TxWaterfallItem[] = [
    { label: 'Budget', value: 500, color: 'var(--tx-surface-400)' },
    { label: 'Design', value: -80 },
    { label: 'Engineering', value: -210 },
    { label: 'Grant', value: 60, color: 'var(--tx-purple-500)' },
    { label: 'Left', total: true },
  ];
}
