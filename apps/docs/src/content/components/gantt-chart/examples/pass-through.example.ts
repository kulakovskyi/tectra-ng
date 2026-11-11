import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxGanttChart, TxGanttTask } from '@tectra-ng/charts/gantt';

@Component({
  selector: 'gantt-chart-pass-through-example',
  imports: [TxGanttChart],
  template: `<tx-gantt-chart
    [tasks]="tasks"
    zoom="day"
    today="2026-11-12"
    [pt]="{
      bar: { style: { 'box-shadow': 'none' } },
      today: { style: { width: '1px', background: 'var(--tx-text-primary)' } },
    }"
    ariaLabel="Styled parts"
  />`,
  styles: `
    tx-gantt-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GanttChartPassThroughExample {
  readonly tasks: TxGanttTask[] = [
    { id: 'a', label: 'Collect', start: '2026-11-09', end: '2026-11-12' },
    { id: 'b', label: 'Process', start: '2026-11-12', end: '2026-11-17' },
  ];
}
