import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSankeyChart, TxSankeyLink } from '@tectra-ng/charts/sankey';

@Component({
  selector: 'sankey-chart-budget-example',
  imports: [TxSankeyChart],
  template: `<tx-sankey-chart
    [links]="links"
    [height]="320"
    valueFormat="compact"
    ariaLabel="Budget by department"
  />`,
  styles: `
    tx-sankey-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SankeyChartBudgetExample {
  readonly links: TxSankeyLink[] = [
    { source: 'Budget', target: 'Engineering', value: 4_200_000 },
    { source: 'Budget', target: 'Sales', value: 1_900_000 },
    { source: 'Budget', target: 'Operations', value: 1_100_000 },
    { source: 'Engineering', target: 'Salaries', value: 3_300_000 },
    { source: 'Engineering', target: 'Cloud', value: 900_000 },
    { source: 'Sales', target: 'Salaries', value: 1_200_000 },
    { source: 'Sales', target: 'Events', value: 700_000 },
    { source: 'Operations', target: 'Office', value: 650_000 },
    { source: 'Operations', target: 'Salaries', value: 450_000 },
  ];
}
