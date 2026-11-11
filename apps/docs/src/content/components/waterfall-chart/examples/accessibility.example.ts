import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxWaterfallChart, TxWaterfallItem } from '@tectra-ng/charts/waterfall';

@Component({
  selector: 'waterfall-chart-accessibility-example',
  imports: [TxWaterfallChart],
  template: `<tx-waterfall-chart [items]="items" ariaLabel="Weekly hours" />`,
  styles: `
    tx-waterfall-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WaterfallChartAccessibilityExample {
  readonly items: TxWaterfallItem[] = [
    { label: 'Planned', value: 40 },
    { label: 'Meetings', value: -6 },
    { label: 'Overtime', value: 4 },
    { label: 'Worked', total: true },
  ];
}
