import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxMenu, TxMenuItem, TxMenuItemEvent, TxMenuTrigger } from '@tectra-ng/ui/menu';

interface Task {
  title: string;
  done: boolean;
}

@Component({
  selector: 'menu-popup-example',
  imports: [TxMenu, TxMenuTrigger, TxButton],
  template: `
    <ul class="tasks">
      @for (task of tasks(); track task.title) {
        <li [class.done]="task.done">
          <span>{{ task.title }}</span>
          <button
            txButton
            icon="ellipsis-h"
            size="small"
            severity="secondary"
            [text]="true"
            [attr.aria-label]="'Actions for ' + task.title"
            (click)="current = task; actions.toggle($event)"
            (keydown.arrowdown)="
              current = task; actions.show($event, 'first'); $event.preventDefault()
            "
            aria-haspopup="menu"
          ></button>
        </li>
      }
    </ul>
    <tx-menu
      #actions
      popup
      placement="bottom-end"
      ariaLabel="Task actions"
      [model]="items"
      (itemSelected)="run($event)"
    />
    <p class="note">
      <button txButton size="small" severity="secondary" [outlined]="true" [txMenuTrigger]="sort">
        Sort by
      </button>
      <tx-menu #sort popup ariaLabel="Sort by" [model]="sorting" />
    </p>
  `,
  styles: `
    .tasks {
      display: grid;
      gap: 4px;
      max-width: 340px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .tasks li {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .done span {
      color: var(--tx-text-muted);
      text-decoration: line-through;
    }
    .note {
      margin: 16px 0 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenuPopupExample {
  readonly tasks = signal<Task[]>([
    { title: 'Write release notes', done: false },
    { title: 'Review the pricing page', done: false },
    { title: 'Book the venue', done: true },
  ]);
  current: Task | null = null;
  readonly items: TxMenuItem[] = [
    { id: 'toggle', label: 'Mark as done', icon: 'check' },
    { id: 'rename', label: 'Rename', icon: 'pencil' },
    { separator: true },
    { id: 'delete', label: 'Delete', icon: 'trash', severity: 'danger' },
  ];
  readonly sorting: TxMenuItem[] = [
    { label: 'Title' },
    { label: 'Due date' },
    { label: 'Priority' },
  ];

  run({ item }: TxMenuItemEvent): void {
    const task = this.current;
    if (!task) {
      return;
    }
    if (item.id === 'toggle') {
      this.tasks.update((tasks) =>
        tasks.map((other) => (other === task ? { ...other, done: !other.done } : other)),
      );
    } else if (item.id === 'delete') {
      this.tasks.update((tasks) => tasks.filter((other) => other !== task));
    }
  }
}
