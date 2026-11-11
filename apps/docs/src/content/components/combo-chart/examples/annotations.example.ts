import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxComboChart, TxComboChartSeries } from '@tectra-ng/charts/combo';
import { TxChartAnnotation } from '@tectra-ng/charts/core';

@Component({
  selector: 'combo-chart-annotations-example',
  imports: [TxComboChart],
  template: `<tx-combo-chart
    [series]="series"
    [categories]="quarters"
    [annotations]="annotations"
    y2ValueFormat="percent"
    ariaLabel="Revenue and margin with targets"
  />`,
  styles: `
    tx-combo-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ComboChartAnnotationsExample {
  readonly quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  readonly series: TxComboChartSeries[] = [
    { name: 'Revenue', data: [120, 150, 140, 190] },
    { name: 'Margin', data: [18, 22, 19, 26], type: 'line', axis: 'secondary' },
  ];
  readonly annotations: TxChartAnnotation[] = [
    { type: 'y-line', y: 20, axis: 'secondary', label: 'Margin target', tone: 'warn' },
    { type: 'x-line', x: 'Q3', label: 'Reorg', tone: 'neutral' },
  ];
}
