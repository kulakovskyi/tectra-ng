import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSankeyChart, TxSankeyLink } from '@tectra-ng/charts/sankey';

@Component({
  selector: 'sankey-chart-align-example',
  imports: [TxSankeyChart],
  template: `<tx-sankey-chart
    [links]="links"
    align="left"
    [showValues]="false"
    [height]="280"
    ariaLabel="Support tickets"
  />`,
  styles: `
    tx-sankey-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SankeyChartAlignExample {
  readonly links: TxSankeyLink[] = [
    { source: 'Email', target: 'Triage', value: 320 },
    { source: 'Chat', target: 'Triage', value: 540 },
    { source: 'Triage', target: 'Solved', value: 610 },
    { source: 'Triage', target: 'Engineering', value: 250 },
    { source: 'Engineering', target: 'Fixed', value: 190 },
    { source: 'Engineering', target: "Won't fix", value: 60 },
  ];
}
