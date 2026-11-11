import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxColumnChart } from '@tectra-ng/charts/column';
import { TxChartAnnotation, TxChartSeries } from '@tectra-ng/charts/core';

@Component({
  selector: 'column-chart-annotations-example',
  imports: [TxColumnChart],
  template: `<tx-column-chart
    [series]="series"
    [categories]="months"
    [annotations]="annotations"
    ariaLabel="Sales against the plan"
  />`,
  styles: `
    tx-column-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColumnChartAnnotationsExample {
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  readonly series: TxChartSeries[] = [{ name: 'Sales', data: [42, 51, 38, 64, 70, 58] }];
  readonly annotations: TxChartAnnotation[] = [
    { type: 'y-line', y: 55, label: 'Plan', tone: 'success' },
    { type: 'x-band', from: 'Apr', to: 'May', label: 'Promo', tone: 'primary' },
  ];
}
