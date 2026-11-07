import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxScrollPanel } from '@tectra-ng/ui/scroll-panel';

@Component({
  selector: 'scroll-panel-max-height-example',
  imports: [TxScrollPanel, TxButton],
  template: `
    <button txButton size="small" icon="plus" (click)="add()">Add task</button>
    <tx-scroll-panel class="panel" ariaLabel="Tasks">
      <ol class="list">
        @for (task of tasks(); track task) {
          <li>{{ task }}</li>
        }
      </ol>
    </tx-scroll-panel>
  `,
  styles: `
    .panel {
      max-height: 160px;
      margin-top: 12px;
    }

    .list {
      margin: 0;
      padding: 0 16px 0 24px;
      line-height: 1.8;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScrollPanelMaxHeightExample {
  readonly tasks = signal(['Review the draft', 'Book the meeting room']);

  add(): void {
    this.tasks.update((tasks) => [...tasks, `Task ${tasks.length + 1}`]);
  }
}
