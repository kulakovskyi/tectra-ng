import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFunnelChart, TxFunnelItem } from '@tectra-ng/charts/funnel';

@Component({
  selector: 'funnel-chart-accessibility-example',
  imports: [TxFunnelChart],
  template: `<tx-funnel-chart [items]="items" ariaLabel="Support tickets" />`,
  styles: `
    tx-funnel-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FunnelChartAccessibilityExample {
  readonly items: TxFunnelItem[] = [
    { label: 'Opened', value: 860 },
    { label: 'Answered', value: 790 },
    { label: 'Solved', value: 610 },
  ];
}
