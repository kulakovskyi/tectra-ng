import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TxGanttChart,
  TxGanttGroupToggle,
  TxGanttTask,
  TxGanttTaskEvent,
} from '@tectra-ng/charts/gantt';

@Component({
  selector: 'gantt-chart-events-example',
  imports: [TxGanttChart],
  template: `
    <div class="wrap">
      <tx-gantt-chart
        [tasks]="tasks"
        zoom="day"
        today="2026-11-12"
        ariaLabel="Onboarding plan"
        (taskClick)="onTask($event)"
        (groupToggle)="onGroup($event)"
      />
      <p class="log" aria-live="polite">{{ message() }}</p>
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 8px;
      width: 100%;
    }
    .log {
      margin: 0;
      color: var(--tx-text-muted);
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GanttChartEventsExample {
  readonly tasks: TxGanttTask[] = [
    {
      id: 'laptop',
      label: 'Laptop and access',
      group: 'Week 1',
      start: '2026-11-09',
      end: '2026-11-10',
    },
    { id: 'tour', label: 'Codebase tour', group: 'Week 1', start: '2026-11-10', end: '2026-11-13' },
    {
      id: 'first',
      label: 'First pull request',
      group: 'Week 2',
      start: '2026-11-16',
      end: '2026-11-18',
    },
    { id: 'demo', label: 'Demo day', group: 'Week 2', start: '2026-11-20', milestone: true },
  ];
  readonly message = signal('Click a bar or fold a group.');

  onTask(event: TxGanttTaskEvent): void {
    this.message.set(
      `${event.task.label}: ${event.start.toDateString()} – ${event.end.toDateString()}`,
    );
  }

  onGroup(event: TxGanttGroupToggle): void {
    this.message.set(`${event.group} is ${event.collapsed ? 'folded' : 'open'}`);
  }
}
