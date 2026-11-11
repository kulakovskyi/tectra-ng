import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFunnelChart, TxFunnelItem } from '@tectra-ng/charts/funnel';

@Component({
  selector: 'funnel-chart-pass-through-example',
  imports: [TxFunnelChart],
  template: `<tx-funnel-chart
    [items]="items"
    [pt]="{
      conversion: { style: { 'font-weight': '600' } },
      label: { style: { 'text-transform': 'uppercase', 'font-size': '11px' } },
    }"
    ariaLabel="App installs"
  />`,
  styles: `
    tx-funnel-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FunnelChartPassThroughExample {
  readonly items: TxFunnelItem[] = [
    { label: 'Store views', value: 30000 },
    { label: 'Installs', value: 9000 },
    { label: 'Accounts', value: 4200 },
  ];
}
