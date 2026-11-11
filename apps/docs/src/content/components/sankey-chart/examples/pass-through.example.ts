import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSankeyChart, TxSankeyLink } from '@tectra-ng/charts/sankey';

@Component({
  selector: 'sankey-chart-pass-through-example',
  imports: [TxSankeyChart],
  template: `<tx-sankey-chart
    [links]="links"
    [height]="260"
    [pt]="{
      link: { style: { 'stroke-linecap': 'round' } },
      label: { style: { 'text-transform': 'uppercase', 'font-size': '11px' } },
    }"
    ariaLabel="Order fulfilment"
  />`,
  styles: `
    tx-sankey-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SankeyChartPassThroughExample {
  readonly links: TxSankeyLink[] = [
    { source: 'Orders', target: 'Shipped', value: 820 },
    { source: 'Orders', target: 'Cancelled', value: 90 },
    { source: 'Shipped', target: 'Delivered', value: 790 },
    { source: 'Shipped', target: 'Returned', value: 30 },
  ];
}
