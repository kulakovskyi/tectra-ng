import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxGanttChart, TxGanttTask } from '@tectra-ng/charts/gantt';

@Component({
  selector: 'gantt-chart-timeline-example',
  imports: [TxGanttChart],
  template: `<tx-gantt-chart
    [tasks]="bookings"
    layout="timeline"
    zoom="day"
    today="2026-11-12"
    ariaLabel="Meeting rooms"
  />`,
  styles: `
    tx-gantt-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GanttChartTimelineExample {
  readonly bookings: TxGanttTask[] = [
    { id: 'r1', label: 'Workshop', group: 'Room A', start: '2026-11-09', end: '2026-11-10' },
    { id: 'r2', label: 'Training', group: 'Room A', start: '2026-11-12', end: '2026-11-14' },
    { id: 'r3', label: 'Board', group: 'Room A', start: '2026-11-18' },
    {
      id: 'r4',
      label: 'Hackathon',
      group: 'Room B',
      start: '2026-11-10',
      end: '2026-11-13',
      color: 'var(--tx-orange-400)',
    },
    { id: 'r5', label: 'Interviews', group: 'Room B', start: '2026-11-16', end: '2026-11-17' },
    {
      id: 'r6',
      label: 'Offsite',
      group: 'Room C',
      start: '2026-11-11',
      end: '2026-11-20',
      color: 'var(--tx-purple-500)',
    },
  ];
}
