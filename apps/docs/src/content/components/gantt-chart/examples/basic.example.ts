import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxGanttChart, TxGanttTask } from '@tectra-ng/charts/gantt';

@Component({
  selector: 'gantt-chart-basic-example',
  imports: [TxGanttChart],
  template: `<tx-gantt-chart
    [tasks]="tasks"
    zoom="day"
    today="2026-11-12"
    ariaLabel="Website redesign"
  />`,
  styles: `
    tx-gantt-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GanttChartBasicExample {
  readonly tasks: TxGanttTask[] = [
    {
      id: 'brief',
      label: 'Brief and goals',
      group: 'Discovery',
      start: '2026-11-02',
      end: '2026-11-04',
      progress: 100,
    },
    {
      id: 'research',
      label: 'User research',
      group: 'Discovery',
      start: '2026-11-04',
      end: '2026-11-11',
      progress: 80,
    },
    {
      id: 'flows',
      label: 'Flows and wireframes',
      group: 'Design',
      start: '2026-11-09',
      end: '2026-11-17',
      progress: 45,
    },
    {
      id: 'ui',
      label: 'Visual design',
      group: 'Design',
      start: '2026-11-16',
      end: '2026-11-27',
      progress: 10,
    },
    { id: 'review', label: 'Design review', group: 'Design', start: '2026-11-27', milestone: true },
    {
      id: 'api',
      label: 'API',
      group: 'Build',
      start: '2026-11-18',
      end: '2026-12-04',
      progress: 0,
    },
    { id: 'app', label: 'Web app', group: 'Build', start: '2026-11-25', end: '2026-12-15' },
    { id: 'beta', label: 'Beta release', group: 'Build', start: '2026-12-16', milestone: true },
  ];
}
