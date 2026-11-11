import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFunnelChart, TxFunnelItem } from '@tectra-ng/charts/funnel';

@Component({
  selector: 'funnel-chart-compact-example',
  imports: [TxFunnelChart],
  template: `<tx-funnel-chart
    [items]="items"
    [showLabels]="false"
    [showConversion]="false"
    [connectors]="false"
    valueFormat="compact"
    [height]="200"
    ariaLabel="Orders funnel"
  />`,
  styles: `
    tx-funnel-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FunnelChartCompactExample {
  readonly items: TxFunnelItem[] = [
    { label: 'Carts', value: 48000 },
    { label: 'Checkouts', value: 21000 },
    { label: 'Orders', value: 15500 },
  ];
}
