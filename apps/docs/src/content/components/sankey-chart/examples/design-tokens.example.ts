import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSankeyChart, TxSankeyLink } from '@tectra-ng/charts/sankey';

@Component({
  selector: 'sankey-chart-design-tokens-example',
  imports: [TxSankeyChart],
  template: `<tx-sankey-chart
    [links]="links"
    [height]="280"
    [dt]="{
      sankey: {
        nodeWidth: '22',
        nodePadding: '24',
        nodeRadius: '6px',
        linkStrength: '45%',
        linkEdgeWidth: '2',
      },
    }"
    ariaLabel="Energy use"
  />`,
  styles: `
    tx-sankey-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SankeyChartDesignTokensExample {
  readonly links: TxSankeyLink[] = [
    { source: 'Solar', target: 'Grid', value: 30 },
    { source: 'Wind', target: 'Grid', value: 45 },
    { source: 'Gas', target: 'Grid', value: 25 },
    { source: 'Grid', target: 'Homes', value: 40 },
    { source: 'Grid', target: 'Industry', value: 60 },
  ];
}
