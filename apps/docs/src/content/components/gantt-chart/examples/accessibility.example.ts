import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxGanttChart, TxGanttTask } from '@tectra-ng/charts/gantt';

@Component({
  selector: 'gantt-chart-accessibility-example',
  imports: [TxGanttChart],
  template: `<tx-gantt-chart
    [tasks]="tasks"
    zoom="day"
    today="2026-11-12"
    ariaLabel="Release checklist"
  />`,
  styles: `
    tx-gantt-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GanttChartAccessibilityExample {
  readonly tasks: TxGanttTask[] = [
    { id: 'freeze', label: 'Code freeze', start: '2026-11-10', milestone: true },
    { id: 'qa', label: 'Regression tests', start: '2026-11-10', end: '2026-11-13', progress: 60 },
    { id: 'notes', label: 'Release notes', start: '2026-11-12', end: '2026-11-13' },
    { id: 'ship', label: 'Release', start: '2026-11-16', milestone: true },
  ];
}
