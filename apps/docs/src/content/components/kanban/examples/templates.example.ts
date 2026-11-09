import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TxKanban,
  TxKanbanCard,
  TxKanbanColumn,
  TxKanbanColumnHeader,
  TxKanbanColumnTop,
  TxKanbanEmpty,
} from '@tectra-ng/blocks/kanban';
import { TxIcon } from '@tectra-ng/icons';
import { TxInput } from '@tectra-ng/ui/input';

interface Note {
  id: string;
  text: string;
}

@Component({
  selector: 'kanban-templates-example',
  imports: [
    FormsModule,
    TxKanban,
    TxKanbanCard,
    TxKanbanColumnHeader,
    TxKanbanColumnTop,
    TxKanbanEmpty,
    TxIcon,
    TxInput,
  ],
  template: `
    <tx-kanban label="Ideas" [columns]="columns()" [itemId]="noteId">
      <ng-template txKanbanColumnHeader let-column>
        <tx-icon [name]="column.id === 'later' ? 'clock' : 'bolt'" />
        <strong>{{ column.title }}</strong>
      </ng-template>
      <ng-template txKanbanColumnTop let-column>
        <input
          txInput
          fluid
          placeholder="Add an idea and press Enter"
          [attr.aria-label]="'Add to ' + column.title"
          (keydown.enter)="add(column.id, $event)"
        />
      </ng-template>
      <ng-template txKanbanCard let-note>
        <div class="card">{{ note.text }}</div>
      </ng-template>
      <ng-template txKanbanEmpty let-column>
        <div class="empty">No ideas in {{ column.title }} yet</div>
      </ng-template>
    </tx-kanban>
  `,
  styles: `
    .card {
      padding: 10.5px;
      border-radius: var(--tx-radius-lg);
      background: var(--tx-surface-card);
      box-shadow:
        inset 0 0 0 1px var(--tx-surface-border),
        0 1px 2px color-mix(in srgb, var(--tx-text-primary) 8%, transparent);
      color: var(--tx-text-primary);
      font-size: 12.25px;
      font-weight: var(--tx-font-weight-medium);
    }

    .empty {
      padding: 16px;
      color: var(--tx-text-muted);
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KanbanTemplatesExample {
  readonly noteId = (note: Note) => note.id;
  readonly columns = signal<TxKanbanColumn<Note>[]>([
    { id: 'now', title: 'Now', items: [{ id: 'n1', text: 'Dark mode for invoices' }] },
    { id: 'later', title: 'Later', items: [] },
  ]);

  add(columnId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const text = input.value.trim();
    if (!text) {
      return;
    }
    this.columns.update((columns) =>
      columns.map((column) =>
        column.id === columnId
          ? { ...column, items: [...column.items, { id: `${Date.now()}`, text }] }
          : column,
      ),
    );
    input.value = '';
  }
}
