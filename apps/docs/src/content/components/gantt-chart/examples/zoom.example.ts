import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxGanttChart, TxGanttTask, TxGanttZoom } from '@tectra-ng/charts/gantt';

@Component({
  selector: 'gantt-chart-zoom-example',
  imports: [TxGanttChart],
  template: `<tx-gantt-chart
    [tasks]="roadmap"
    [(zoom)]="zoom"
    today="2026-11-12"
    [padding]="10"
    ariaLabel="Product roadmap"
  />`,
  styles: `
    tx-gantt-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GanttChartZoomExample {
  readonly zoom = signal<TxGanttZoom>('month');
  readonly roadmap: TxGanttTask[] = [
    {
      id: 'q1',
      label: 'Search revamp',
      group: 'Platform',
      start: '2026-07-06',
      end: '2026-09-25',
      progress: 100,
    },
    {
      id: 'q2',
      label: 'Billing v2',
      group: 'Platform',
      start: '2026-09-14',
      end: '2026-12-18',
      progress: 55,
    },
    {
      id: 'q3',
      label: 'Offline mode',
      group: 'Mobile',
      start: '2026-08-03',
      end: '2026-11-27',
      progress: 70,
    },
    { id: 'q4', label: 'Tablet layout', group: 'Mobile', start: '2026-12-01', end: '2027-02-26' },
    { id: 'q5', label: 'Public launch', group: 'Mobile', start: '2027-03-01', milestone: true },
    {
      id: 'q6',
      label: 'Reports',
      group: 'Analytics',
      start: '2026-10-05',
      end: '2027-01-29',
      progress: 20,
    },
  ];
}
