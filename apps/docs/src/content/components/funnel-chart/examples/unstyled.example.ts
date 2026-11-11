import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFunnelChart, TxFunnelItem } from '@tectra-ng/charts/funnel';

@Component({
  selector: 'funnel-chart-unstyled-example',
  imports: [TxFunnelChart],
  template: `<tx-funnel-chart
    [items]="items"
    unstyled
    [height]="220"
    ariaLabel="Unstyled chart"
  />`,
  styles: `
    tx-funnel-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FunnelChartUnstyledExample {
  readonly items: TxFunnelItem[] = [
    { label: 'Step 1', value: 100 },
    { label: 'Step 2', value: 60 },
    { label: 'Step 3', value: 25 },
  ];
}
