import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  output,
  signal,
} from '@angular/core';
import {
  TxKanban,
  TxKanbanCard,
  TxKanbanColumn,
  TxKanbanEmpty,
  TxKanbanItemDrop,
} from '@tectra-ng/blocks/kanban';
import { TxPill } from '@tectra-ng/ui/pill';

interface Ticket {
  id: string;
  title: string;
  points: number;
}

@Component({
  selector: 'ticket-board',
  imports: [TxKanban],
  template: `
    <tx-kanban
      itemsDraggable
      [label]="label()"
      [columns]="columns()"
      [itemId]="ticketId"
      [cardTemplate]="card()?.template"
      [emptyTemplate]="empty()?.template"
      (itemDropped)="moved.emit($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketBoard {
  readonly label = input('');
  readonly columns = input<TxKanbanColumn<Ticket>[]>([]);
  readonly moved = output<TxKanbanItemDrop>();
  readonly card = contentChild(TxKanbanCard<Ticket>);
  readonly empty = contentChild(TxKanbanEmpty<Ticket>);
  readonly ticketId = (ticket: Ticket) => ticket.id;
}

@Component({
  selector: 'kanban-template-inputs-example',
  imports: [TicketBoard, TxKanbanCard, TxKanbanEmpty, TxPill],
  template: `
    <ticket-board label="Sprint" [columns]="columns()" (moved)="move($event)">
      <ng-template txKanbanCard let-ticket>
        <div class="card">
          <span>{{ ticket.title }}</span>
          <tx-pill size="small" [value]="ticket.points" />
        </div>
      </ng-template>
      <ng-template txKanbanEmpty let-column>
        <div class="empty">Drop a ticket into {{ column.title }}</div>
      </ng-template>
    </ticket-board>
  `,
  styles: `
    .card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 10.5px;
      border-radius: var(--tx-radius-lg);
      background: var(--tx-surface-card);
      box-shadow: inset 0 0 0 1px var(--tx-surface-border);
      color: var(--tx-text-primary);
      font-size: 12.25px;
    }

    .empty {
      padding: 16px;
      color: var(--tx-text-muted);
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KanbanTemplateInputsExample {
  readonly columns = signal<TxKanbanColumn<Ticket>[]>([
    {
      id: 'todo',
      title: 'To do',
      items: [
        { id: 't1', title: 'Export as CSV', points: 3 },
        { id: 't2', title: 'Keyboard shortcuts', points: 5 },
      ],
    },
    { id: 'review', title: 'Review', items: [] },
  ]);

  move(drop: TxKanbanItemDrop): void {
    this.columns.update((columns) => {
      const ticket = columns
        .flatMap((column) => column.items)
        .find((item) => item.id === drop.itemId);
      if (!ticket) {
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
        items.splice(index, 0, ticket);
        return { ...column, items };
      });
    });
  }
}
