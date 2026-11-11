import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFunnelChart, TxFunnelItem } from '@tectra-ng/charts/funnel';

@Component({
  selector: 'funnel-chart-colorful-example',
  imports: [TxFunnelChart],
  template: `<tx-funnel-chart [items]="items" colorful ariaLabel="Hiring pipeline" />`,
  styles: `
    tx-funnel-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FunnelChartColorfulExample {
  readonly items: TxFunnelItem[] = [
    { label: 'Applied', value: 640 },
    { label: 'Screened', value: 210 },
    { label: 'Interviewed', value: 64 },
    { label: 'Offered', value: 12 },
    { label: 'Hired', value: 9 },
  ];
}
