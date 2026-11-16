import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxGanttChart, TxGanttTask } from '@tectra-ng/charts/gantt';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'gantt-chart-dependencies-example',
  imports: [TxGanttChart, TxToggleSwitch, FormsModule],
  template: `
    <div class="wrap">
      <div class="options">
        <tx-toggle-switch label="Dependencies" [(ngModel)]="show" />
        <tx-toggle-switch label="Highlight chain" [(ngModel)]="highlight" />
      </div>
      <tx-gantt-chart
        [tasks]="tasks"
        zoom="day"
        today="2026-11-05"
        ariaLabel="Mobile app release"
        [showDependencies]="show()"
        [dependencyHighlight]="highlight()"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
      width: 100%;
    }
    .options {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GanttChartDependenciesExample {
  readonly show = signal(true);
  readonly highlight = signal(true);
  readonly tasks: TxGanttTask[] = [
    {
      id: 'scope',
      label: 'Scope',
      group: 'Plan',
      start: '2026-11-02',
      end: '2026-11-04',
      progress: 100,
    },
    {
      id: 'specs',
      label: 'Specs',
      group: 'Plan',
      start: '2026-11-05',
      end: '2026-11-09',
      progress: 100,
      dependsOn: ['scope'],
    },
    {
      id: 'design',
      label: 'Screens',
      group: 'Plan',
      start: '2026-11-06',
      end: '2026-11-13',
      progress: 70,
      dependsOn: [{ id: 'specs', type: 'start-to-start' }],
    },
    {
      id: 'api',
      label: 'API',
      group: 'Build',
      start: '2026-11-10',
      end: '2026-11-19',
      progress: 40,
      dependsOn: ['specs'],
    },
    {
      id: 'app',
      label: 'App',
      group: 'Build',
      start: '2026-11-13',
      end: '2026-11-24',
      progress: 20,
      dependsOn: ['design', { id: 'api', type: 'start-to-start' }],
    },
    {
      id: 'docs',
      label: 'Help pages',
      group: 'Build',
      start: '2026-11-18',
      end: '2026-11-24',
      dependsOn: [{ id: 'app', type: 'finish-to-finish' }],
    },
    {
      id: 'qa',
      label: 'Testing',
      group: 'Release',
      start: '2026-11-20',
      end: '2026-11-27',
      dependsOn: ['api', 'app'],
    },
    {
      id: 'launch',
      label: 'Store release',
      group: 'Release',
      start: '2026-11-30',
      milestone: true,
      dependsOn: ['qa', 'docs'],
    },
  ];
}
