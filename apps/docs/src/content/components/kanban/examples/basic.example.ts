import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  Injector,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  TxKanban,
  TxKanbanCard,
  TxKanbanColumn,
  TxKanbanColumnDrop,
  TxKanbanColumnFooter,
  TxKanbanColumnHeader,
  TxKanbanColumnTop,
  TxKanbanItemDrop,
} from '@tectra-ng/blocks/kanban';
import { TxIcon } from '@tectra-ng/icons';
import { TxAvatar } from '@tectra-ng/ui/avatar';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInput } from '@tectra-ng/ui/input';
import { TxMenu, TxMenuItem, TxMenuTrigger } from '@tectra-ng/ui/menu';
import { TxFieldHint } from '@tectra-ng/ui/message';
import { TxPill, TxPillTone } from '@tectra-ng/ui/pill';
import { TxTooltip } from '@tectra-ng/ui/tooltip';

interface Tag {
  label: string;
  tone: TxPillTone;
}

interface Task {
  id: string;
  name: string;
  done: boolean;
  project?: string;
  tags?: Tag[];
  assignee?: string;
  due?: string;
  late?: boolean;
  subtasks?: number;
  likes?: number;
}

interface Adding {
  columnId: string;
  place: 'top' | 'bottom';
}

@Component({
  selector: 'kanban-basic-example',
  imports: [
    NgTemplateOutlet,
    TxKanban,
    TxKanbanCard,
    TxKanbanColumnHeader,
    TxKanbanColumnTop,
    TxKanbanColumnFooter,
    TxIcon,
    TxAvatar,
    TxButton,
    TxInput,
    TxMenu,
    TxMenuTrigger,
    TxFieldHint,
    TxPill,
    TxTooltip,
  ],
  template: `
    <tx-kanban
      label="Launch plan"
      itemsDraggable
      columnsDraggable
      [focusableCards]="false"
      [columns]="columns()"
      [itemId]="taskId"
      (itemDropped)="moveItem($event)"
      (columnDropped)="moveColumn($event)"
    >
      <ng-template txKanbanColumnHeader let-column>
        <div class="section">
          <h3 class="section-name" [title]="column.title">{{ column.title }}</h3>
          <tx-pill size="small" [value]="column.items.length" />
          <span class="section-actions">
            <button
              txButton
              size="small"
              text
              severity="secondary"
              icon="plus"
              txTooltip="Add task"
              [attr.aria-label]="'Add task to ' + column.title"
              (click)="startAdding(column.id, 'top')"
            ></button>
            <button
              txButton
              size="small"
              text
              severity="secondary"
              icon="ellipsis-h"
              txTooltip="Section actions"
              [attr.aria-label]="column.title + ' actions'"
              [txMenuTrigger]="sectionMenu"
              (click)="menuColumn.set(column.id)"
            ></button>
          </span>
        </div>
      </ng-template>

      <ng-template txKanbanColumnTop let-column>
        @if (isAdding(column.id, 'top')) {
          <ng-container
            *ngTemplateOutlet="quickAdd; context: { $implicit: column.id, label: 'Task name' }"
          />
        }
      </ng-template>

      <ng-template txKanbanCard let-task>
        <article
          class="task"
          tabindex="0"
          aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight"
          [attr.aria-label]="task.name"
          [class.task--done]="task.done"
          [class.task--selected]="selected() === task.id"
          (click)="select(task.id)"
          (keydown.enter)="select(task.id)"
        >
          @if (task.project) {
            <div class="task-pills">
              <tx-pill size="small" tone="primary" icon="folder" [value]="task.project" />
            </div>
          }
          <div class="task-head">
            <button
              txButton
              class="task-check"
              size="small"
              text
              rounded
              [severity]="task.done ? 'success' : 'secondary'"
              [icon]="task.done ? 'check-circle' : 'circle'"
              [attr.aria-label]="task.done ? 'Mark incomplete' : 'Mark complete'"
              [attr.aria-pressed]="task.done"
              (click)="toggleDone(task.id); $event.stopPropagation()"
            ></button>
            <span class="task-name">{{ task.name }}</span>
            <button
              txButton
              class="task-menu"
              size="small"
              text
              rounded
              severity="secondary"
              icon="ellipsis-h"
              [attr.aria-label]="task.name + ' actions'"
              [txMenuTrigger]="taskMenu"
              (click)="menuTask.set(task.id); $event.stopPropagation()"
            ></button>
          </div>
          @if (task.tags?.length) {
            <div class="task-pills">
              @for (tag of task.tags; track tag.label) {
                <tx-pill size="small" [tone]="tag.tone" [value]="tag.label" />
              }
            </div>
          }
          <div class="task-foot">
            @if (task.assignee) {
              <tx-avatar [size]="21" [name]="task.assignee" />
            } @else {
              <span class="task-nobody" role="img" aria-label="Unassigned">
                <tx-icon name="user" />
              </span>
            }
            @if (task.due) {
              <span class="task-due" [class.task-due--late]="task.late && !task.done">
                {{ task.due }}
              </span>
            }
            <span class="task-counters">
              @if (task.subtasks) {
                <span class="task-counter" [attr.aria-label]="task.subtasks + ' subtasks'">
                  <tx-icon name="sitemap" />{{ task.subtasks }}
                </span>
              }
              @if (task.likes) {
                <span
                  class="task-counter task-counter--active"
                  [attr.aria-label]="task.likes + ' likes'"
                >
                  <tx-icon name="thumbs-up" />{{ task.likes }}
                </span>
              }
            </span>
          </div>
        </article>
      </ng-template>

      <ng-template txKanbanColumnFooter let-column>
        @if (isAdding(column.id, 'bottom')) {
          <ng-container
            *ngTemplateOutlet="quickAdd; context: { $implicit: column.id, label: 'Task name' }"
          />
        } @else if (!isAdding(column.id, 'top')) {
          <button
            txButton
            class="add-task"
            text
            fluid
            severity="secondary"
            icon="plus"
            (click)="startAdding(column.id, 'bottom')"
          >
            Add task
          </button>
        }
      </ng-template>

      <div class="add-section">
        @if (addingSection()) {
          <ng-container
            *ngTemplateOutlet="quickAdd; context: { $implicit: '', label: 'Section name' }"
          />
        } @else {
          <button txButton outlined severity="secondary" icon="plus" (click)="startAddingSection()">
            Add section
          </button>
        }
      </div>
    </tx-kanban>

    <ng-template #quickAdd let-columnId let-label="label">
      <div class="quick-add">
        <input
          txInput
          fluid
          [id]="'kanban-quick-add-' + (columnId || 'section')"
          [placeholder]="label"
          [attr.aria-label]="label"
          (keydown.enter)="submit(columnId, $event)"
          (keydown.escape)="cancel()"
        />
        <tx-field-hint [for]="'kanban-quick-add-' + (columnId || 'section')">
          Enter to add, Esc to cancel
        </tx-field-hint>
      </div>
    </ng-template>

    <tx-menu #sectionMenu popup ariaLabel="Section actions" [model]="sectionItems" />
    <tx-menu #taskMenu popup ariaLabel="Task actions" [model]="taskItems" />
  `,
  styles: `
    .section {
      display: flex;
      flex: 1;
      align-items: center;
      gap: 7px;
      min-width: 0;
    }

    .section-name {
      min-width: 0;
      margin: 0;
      overflow: hidden;
      color: var(--tx-text-primary);
      font-size: 12.25px;
      font-weight: var(--tx-font-weight-semibold);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .section-actions {
      display: flex;
      align-items: center;
      gap: 1.75px;
      margin-left: auto;
    }

    .task {
      display: flex;
      flex-direction: column;
      gap: 8.75px;
      padding: 10.5px;
      border-radius: var(--tx-radius-lg);
      background: var(--tx-surface-card);
      box-shadow:
        inset 0 0 0 1px var(--tx-surface-border),
        0 1px 2px color-mix(in srgb, var(--tx-text-primary) 8%, transparent);
      cursor: pointer;
      outline: none;
      transition:
        box-shadow 150ms,
        background-color 150ms;
    }

    .task:hover {
      box-shadow:
        inset 0 0 0 1px color-mix(in srgb, var(--tx-primary-base) 35%, var(--tx-surface-border)),
        0 4px 12px color-mix(in srgb, var(--tx-text-primary) 10%, transparent);
    }

    .task:focus-visible {
      box-shadow: inset 0 0 0 2px var(--tx-focus-ring-color);
    }

    .task--selected,
    .task--selected:hover {
      background: color-mix(in srgb, var(--tx-primary-base) 6%, var(--tx-surface-card));
      box-shadow: inset 0 0 0 2px var(--tx-primary-base);
    }

    .task-head {
      display: flex;
      align-items: flex-start;
      gap: 5.25px;
    }

    .task-check {
      flex-shrink: 0;
      margin-left: -3.5px;
    }

    .task-name {
      display: -webkit-box;
      flex: 1;
      min-width: 0;
      padding-top: 6px;
      overflow: hidden;
      color: var(--tx-text-primary);
      font-size: 12.25px;
      font-weight: var(--tx-font-weight-medium);
      line-height: 1.375;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      transition: color 150ms;
    }

    .task--done .task-name {
      color: var(--tx-text-muted);
      text-decoration: line-through;
    }

    .task-menu {
      flex-shrink: 0;
      opacity: 0;
      transition: opacity 150ms;
    }

    .task:hover .task-menu,
    .task:focus-within .task-menu {
      opacity: 1;
    }

    .task-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 3.5px;
    }

    .task-foot {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 7px;
      min-height: 24.5px;
      color: var(--tx-text-muted);
      font-size: 10.5px;
    }

    .task-nobody {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: 21px;
      height: 21px;
      border: 1px dashed var(--tx-surface-border);
      border-radius: var(--tx-radius-full);
      font-size: 10.5px;
    }

    .task-due--late {
      color: var(--tx-danger-base);
    }

    .task-counters {
      display: flex;
      align-items: center;
      gap: 7px;
      margin-left: auto;
      font-variant-numeric: tabular-nums;
    }

    .task-counter {
      display: inline-flex;
      align-items: center;
      gap: 3.5px;
    }

    .task-counter--active {
      color: var(--tx-primary-base);
    }

    .quick-add {
      display: flex;
      flex-direction: column;
      gap: 3.5px;
    }

    .add-task {
      justify-content: flex-start;
    }

    .add-section {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      width: 252px;
      padding: 10.5px;
      border: 1px dashed var(--tx-surface-border);
      border-radius: var(--tx-radius-lg);
    }

    @media (prefers-reduced-motion: reduce) {
      .task,
      .task-name,
      .task-menu {
        transition: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KanbanBasicExample {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  readonly taskId = (task: Task) => task.id;
  readonly selected = signal<string | null>(null);
  readonly adding = signal<Adding | null>(null);
  readonly addingSection = signal(false);
  readonly menuColumn = signal<string | null>(null);
  readonly menuTask = signal<string | null>(null);

  readonly columns = signal<TxKanbanColumn<Task>[]>([
    {
      id: 'todo',
      title: 'To do',
      items: [
        {
          id: 't1',
          name: 'Write the release notes',
          done: false,
          project: 'Website',
          tags: [{ label: 'Docs', tone: 'info' }],
          assignee: 'Olena Koval',
          due: 'Nov 14',
          subtasks: 3,
        },
        {
          id: 't2',
          name: 'Fix the login redirect after a password reset',
          done: false,
          tags: [{ label: 'High', tone: 'danger' }],
          assignee: 'Mark Ellis',
          due: 'Nov 5',
          late: true,
          likes: 2,
        },
        { id: 't3', name: 'Clean old feature flags', done: false, due: 'Nov 20' },
      ],
    },
    {
      id: 'doing',
      title: 'In progress',
      items: [
        {
          id: 't4',
          name: 'New pricing page',
          done: false,
          project: 'Website',
          tags: [
            { label: 'Design', tone: 'help' },
            { label: 'High', tone: 'danger' },
          ],
          assignee: 'Ivan Petrenko',
          due: 'Nov 12',
          subtasks: 5,
          likes: 4,
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      items: [
        {
          id: 't5',
          name: 'Invoice export',
          done: true,
          assignee: 'Sara Lind',
          due: 'Nov 1',
          subtasks: 2,
        },
      ],
    },
  ]);

  readonly sectionItems: TxMenuItem[] = [
    {
      label: 'Add task to top',
      icon: 'plus',
      command: () => this.startAdding(this.menuColumn() ?? '', 'top'),
    },
    { separator: true },
    {
      label: 'Delete section',
      icon: 'trash',
      severity: 'danger',
      command: () => this.removeColumn(this.menuColumn()),
    },
  ];

  readonly taskItems: TxMenuItem[] = [
    {
      label: 'Toggle complete',
      icon: 'check-circle',
      command: () => this.toggleDone(this.menuTask() ?? ''),
    },
    { separator: true },
    {
      label: 'Delete task',
      icon: 'trash',
      severity: 'danger',
      command: () => this.removeTask(this.menuTask()),
    },
  ];

  isAdding(columnId: string, place: Adding['place']): boolean {
    const adding = this.adding();
    return adding?.columnId === columnId && adding.place === place;
  }

  startAdding(columnId: string, place: Adding['place']): void {
    this.addingSection.set(false);
    this.adding.set({ columnId, place });
    this.focus(`kanban-quick-add-${columnId}`);
  }

  startAddingSection(): void {
    this.adding.set(null);
    this.addingSection.set(true);
    this.focus('kanban-quick-add-section');
  }

  cancel(): void {
    this.adding.set(null);
    this.addingSection.set(false);
  }

  submit(columnId: string, event: Event): void {
    const name = (event.target as HTMLInputElement).value.trim();
    if (!name) {
      this.cancel();
      return;
    }
    if (!columnId) {
      this.columns.update((columns) => [
        ...columns,
        { id: `s${Date.now()}`, title: name, items: [] },
      ]);
      this.cancel();
      return;
    }
    const task: Task = { id: `t${Date.now()}`, name, done: false };
    const top = this.adding()?.place === 'top';
    this.columns.update((columns) =>
      columns.map((column) =>
        column.id === columnId
          ? { ...column, items: top ? [task, ...column.items] : [...column.items, task] }
          : column,
      ),
    );
    (event.target as HTMLInputElement).value = '';
  }

  select(id: string): void {
    this.selected.update((current) => (current === id ? null : id));
  }

  toggleDone(id: string): void {
    this.columns.update((columns) =>
      columns.map((column) => ({
        ...column,
        items: column.items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
      })),
    );
  }

  removeTask(id: string | null): void {
    this.columns.update((columns) =>
      columns.map((column) => ({
        ...column,
        items: column.items.filter((item) => item.id !== id),
      })),
    );
  }

  removeColumn(id: string | null): void {
    this.columns.update((columns) => columns.filter((column) => column.id !== id));
  }

  moveItem(drop: TxKanbanItemDrop): void {
    this.columns.update((columns) => {
      const task = columns
        .flatMap((column) => column.items)
        .find((item) => item.id === drop.itemId);
      if (!task) {
        return columns;
      }
      return columns.map((column) => {
        const items = column.items.filter((item) => item.id !== drop.itemId);
        if (column.id !== drop.toColumnId) {
          return { ...column, items };
        }
        const index = drop.beforeId
          ? items.findIndex((item) => item.id === drop.beforeId)
          : items.length;
        items.splice(index, 0, task);
        return { ...column, items };
      });
    });
  }

  moveColumn(drop: TxKanbanColumnDrop): void {
    this.columns.update((columns) => {
      const moved = columns.find((column) => column.id === drop.columnId);
      if (!moved) {
        return columns;
      }
      const rest = columns.filter((column) => column.id !== drop.columnId);
      const index = drop.beforeId
        ? rest.findIndex((column) => column.id === drop.beforeId)
        : rest.length;
      rest.splice(index, 0, moved);
      return rest;
    });
  }

  private focus(id: string): void {
    afterNextRender(() => this.document.getElementById(id)?.focus(), { injector: this.injector });
  }
}
