import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxGanttChart, TxGanttTask } from '@tectra-ng/charts/gantt';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'gantt-chart-loading-and-empty-example',
  imports: [TxGanttChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="tasks.set([])"></button>
      </div>
      <tx-gantt-chart
        [tasks]="tasks()"
        [loading]="loading()"
        zoom="day"
        today="2026-11-12"
        ariaLabel="Loaded plan"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
      width: 100%;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GanttChartLoadingAndEmptyExample {
  readonly tasks = signal<TxGanttTask[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.tasks.set([
        {
          id: 'a',
          label: 'Collect feedback',
          start: '2026-11-09',
          end: '2026-11-12',
          progress: 70,
        },
        { id: 'b', label: 'Plan the fixes', start: '2026-11-12', end: '2026-11-16' },
      ]);
      this.loading.set(false);
    }, 900);
  }
}
