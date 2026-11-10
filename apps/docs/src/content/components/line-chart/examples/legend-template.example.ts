import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartLegendTemplate, TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';
import { TxIcon } from '@tectra-ng/icons';

@Component({
  selector: 'line-chart-legend-template-example',
  imports: [TxLineChart, TxChartLegendTemplate, TxIcon],
  template: `
    <tx-line-chart
      [series]="series"
      [categories]="months"
      [height]="320"
      ariaLabel="Income and spending"
    >
      <ng-template txChartLegend let-item>
        <tx-icon [name]="item.hidden ? 'eye-slash' : 'eye'" [style.color]="item.color" />
        <span>{{ item.label }}</span>
      </ng-template>
    </tx-line-chart>
  `,
  styles: `
    tx-line-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartLegendTemplateExample {
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  readonly series: TxChartSeries[] = [
    { name: 'Income', data: [5200, 5400, 5100, 6100, 6400, 6900] },
    { name: 'Spending', data: [4100, 4600, 4300, 4800, 5200, 5000] },
  ];
}
