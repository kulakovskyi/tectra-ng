import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxGanttChart, TxGanttTask } from '@tectra-ng/charts/gantt';

@Component({
  selector: 'gantt-chart-design-tokens-example',
  imports: [TxGanttChart],
  template: `<tx-gantt-chart
    [tasks]="tasks"
    zoom="day"
    today="2026-11-12"
    [dt]="{
      gantt: {
        rowHeight: '44',
        barHeight: '0.42',
        barRadius: '999px',
        todayColor: 'var(--tx-primary-500)',
        labelWidth: '160px',
      },
    }"
    ariaLabel="Custom look"
  />`,
  styles: `
    tx-gantt-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GanttChartDesignTokensExample {
  readonly tasks: TxGanttTask[] = [
    { id: 'a', label: 'Plan', start: '2026-11-09', end: '2026-11-11', progress: 100 },
    { id: 'b', label: 'Build', start: '2026-11-11', end: '2026-11-18', progress: 35 },
    { id: 'c', label: 'Ship', start: '2026-11-19', milestone: true },
  ];
}
