import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxGanttChart, TxGanttTask } from '@tectra-ng/charts/gantt';

@Component({
  selector: 'gantt-chart-unstyled-example',
  imports: [TxGanttChart],
  template: `<tx-gantt-chart
    [tasks]="tasks"
    zoom="day"
    today="2026-11-12"
    unstyled
    ariaLabel="Unstyled chart"
  />`,
  styles: `
    tx-gantt-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GanttChartUnstyledExample {
  readonly tasks: TxGanttTask[] = [
    { id: 'a', label: 'One', start: '2026-11-09', end: '2026-11-11' },
    { id: 'b', label: 'Two', start: '2026-11-12', end: '2026-11-14' },
  ];
}
