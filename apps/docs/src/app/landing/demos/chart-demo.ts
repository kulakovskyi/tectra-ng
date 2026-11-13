import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';

@Component({
  selector: 'docs-landing-chart-demo',
  imports: [TxLineChart],
  template: `<tx-line-chart ariaLabel="Visits and sign-ups by month" curve="smooth" [series]="series" [categories]="categories" [height]="300" />`,
  styles: `
    :host,
    tx-line-chart {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingChartDemo {
  readonly categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  readonly series: TxChartSeries[] = [
    {
      name: 'Visits',
      data: [4200, 4800, 5100, 4700, 5900, 6400, 7100, 6800, 7600, 8200, 7900, 8800],
    },
    {
      name: 'Sign-ups',
      data: [820, 900, 1150, 980, 1320, 1480, 1610, 1540, 1720, 1900, 1810, 2050],
    },
  ];
}
