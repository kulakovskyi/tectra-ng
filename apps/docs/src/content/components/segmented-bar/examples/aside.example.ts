import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSegmentedBar, TxSegmentedBarItem } from '@tectra-ng/charts/segmented-bar';

@Component({
  selector: 'segmented-bar-aside-example',
  imports: [TxSegmentedBar],
  template: `
    <tx-segmented-bar [items]="tasks" ariaLabel="Tasks by state">
      <span>{{ total }} tasks</span>
    </tx-segmented-bar>
  `,
  styles: `
    :host {
      display: block;
      max-width: 520px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SegmentedBarAsideExample {
  readonly tasks: TxSegmentedBarItem[] = [
    { key: 'done', label: 'Done', value: 24, tone: 'primary' },
    { key: 'review', label: 'In review', value: 6, tone: 'secondary' },
    { key: 'todo', label: 'To do', value: 9, tone: 'neutral' },
  ];
  readonly total = this.tasks.reduce((sum, task) => sum + task.value, 0);
}
