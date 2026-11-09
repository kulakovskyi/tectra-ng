import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxKanban, TxKanbanCard, TxKanbanColumn } from '@tectra-ng/blocks/kanban';

interface Lead {
  id: string;
  company: string;
}

const lead = (index: number): Lead => ({ id: `l${index}`, company: `Company ${index}` });

@Component({
  selector: 'kanban-fixed-height-example',
  imports: [TxKanban, TxKanbanCard],
  template: `
    <tx-kanban label="Leads" height="360px" [pageSize]="6" [columns]="columns" [itemId]="leadId">
      <ng-template txKanbanCard let-lead>
        <div class="card">{{ lead.company }}</div>
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KanbanFixedHeightExample {
  readonly leadId = (item: Lead) => item.id;
  readonly columns: TxKanbanColumn<Lead>[] = [
    { id: 'new', title: 'New', items: Array.from({ length: 14 }, (_, index) => lead(index + 1)) },
    {
      id: 'contacted',
      title: 'Contacted',
      items: Array.from({ length: 4 }, (_, index) => lead(index + 20)),
    },
    { id: 'won', title: 'Won', items: [lead(30)] },
  ];
}
