import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSankeyChart, TxSankeyLink } from '@tectra-ng/charts/sankey';

@Component({
  selector: 'sankey-chart-unstyled-example',
  imports: [TxSankeyChart],
  template: `<tx-sankey-chart
    [links]="links"
    unstyled
    [height]="240"
    ariaLabel="Unstyled chart"
  />`,
  styles: `
    tx-sankey-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SankeyChartUnstyledExample {
  readonly links: TxSankeyLink[] = [
    { source: 'A', target: 'C', value: 5 },
    { source: 'B', target: 'C', value: 3 },
    { source: 'C', target: 'D', value: 8 },
  ];
}
