import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSankeyChart, TxSankeyLink, TxSankeyNode } from '@tectra-ng/charts/sankey';

@Component({
  selector: 'sankey-chart-accessibility-example',
  imports: [TxSankeyChart],
  template: `<tx-sankey-chart
    [nodes]="nodes"
    [links]="links"
    valueFormat="compact"
    ariaLabel="Website visitors"
  />`,
  styles: `
    tx-sankey-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SankeyChartAccessibilityExample {
  readonly links: TxSankeyLink[] = [
    { source: 'search', target: 'home', value: 4200 },
    { source: 'ads', target: 'home', value: 2600 },
    { source: 'ads', target: 'pricing', value: 1400 },
    { source: 'social', target: 'home', value: 1800 },
    { source: 'email', target: 'pricing', value: 900 },
    { source: 'home', target: 'pricing', value: 3100 },
    { source: 'home', target: 'docs', value: 2200 },
    { source: 'home', target: 'left', value: 3300 },
    { source: 'pricing', target: 'signup', value: 2300 },
    { source: 'pricing', target: 'left', value: 3100 },
    { source: 'docs', target: 'signup', value: 700 },
    { source: 'docs', target: 'left', value: 1500 },
  ];
  readonly nodes: TxSankeyNode[] = [
    { id: 'search', label: 'Search' },
    { id: 'ads', label: 'Ads' },
    { id: 'social', label: 'Social' },
    { id: 'email', label: 'Email' },
    { id: 'home', label: 'Home page' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'docs', label: 'Docs' },
    { id: 'signup', label: 'Signed up', color: 'var(--tx-green-500)' },
    { id: 'left', label: 'Left', color: 'var(--tx-surface-400)' },
  ];
}
