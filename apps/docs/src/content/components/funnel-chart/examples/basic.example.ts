import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFunnelChart, TxFunnelItem } from '@tectra-ng/charts/funnel';

@Component({
  selector: 'funnel-chart-basic-example',
  imports: [TxFunnelChart],
  template: `<tx-funnel-chart [items]="items" ariaLabel="Sign-up funnel" />`,
  styles: `
    tx-funnel-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FunnelChartBasicExample {
  readonly items: TxFunnelItem[] = [
    { label: 'Visited the site', value: 12400 },
    { label: 'Opened pricing', value: 5300 },
    { label: 'Started sign-up', value: 2100 },
    { label: 'Confirmed email', value: 1450 },
    { label: 'Paid', value: 380 },
  ];
}
