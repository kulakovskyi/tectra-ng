import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxGanttChart, TxGanttTask } from '@tectra-ng/charts/gantt';

@Component({
  selector: 'gantt-chart-compact-example',
  imports: [TxGanttChart],
  template: `<tx-gantt-chart
    [tasks]="tasks"
    [toolbar]="false"
    barLabels="none"
    maxHeight="220px"
    [today]="null"
    ariaLabel="Sprint plan"
  />`,
  styles: `
    tx-gantt-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GanttChartCompactExample {
  readonly tasks: TxGanttTask[] = Array.from({ length: 12 }, (_, index) => ({
    id: `t${index}`,
    label: `Ticket ${101 + index}`,
    start: new Date(2026, 10, 2 + ((index * 3) % 14)),
    end: new Date(2026, 10, 4 + ((index * 3) % 14) + (index % 4)),
  }));
}
