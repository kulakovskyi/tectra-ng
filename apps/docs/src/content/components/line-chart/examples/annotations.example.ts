import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartAnnotation, TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';

@Component({
  selector: 'line-chart-annotations-example',
  imports: [TxLineChart],
  template: `<tx-line-chart
    [series]="series"
    [categories]="weeks"
    [annotations]="annotations"
    [area]="false"
    markers
    ariaLabel="Weekly sign-ups with events"
  />`,
  styles: `
    tx-line-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartAnnotationsExample {
  readonly weeks = Array.from({ length: 12 }, (_, index) => `W${index + 1}`);
  readonly series: TxChartSeries[] = [
    { name: 'Sign-ups', data: [320, 340, 330, 410, 520, 480, 470, 460, 610, 640, 590, 700] },
  ];
  readonly annotations: TxChartAnnotation[] = [
    { type: 'x-band', from: 'W5', to: 'W6', label: 'Campaign', tone: 'primary' },
    { type: 'x-line', x: 'W9', label: 'New pricing', tone: 'warn' },
    { type: 'y-line', y: 500, label: 'Goal', tone: 'success' },
    { type: 'point', x: 'W12', y: 700, label: 'Record', tone: 'danger' },
  ];
}
