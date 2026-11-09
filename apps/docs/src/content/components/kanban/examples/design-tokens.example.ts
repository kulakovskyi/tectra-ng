import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxKanban, TxKanbanCard, TxKanbanColumn } from '@tectra-ng/blocks/kanban';

@Component({
  selector: 'kanban-design-tokens-example',
  imports: [TxKanban, TxKanbanCard],
  template: `
    <tx-kanban
      label="Steps"
      [columns]="columns"
      [itemId]="stepId"
      [dt]="{
        root: { gap: '20px', columnWidth: '200px', minHeight: '0' },
        column: { background: 'var(--tx-surface-ground)', shadow: 'none' },
      }"
    >
      <ng-template txKanbanCard let-step>
        <div class="card">{{ step }}</div>
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
export default class KanbanDesignTokensExample {
  readonly stepId = (step: string) => step;
  readonly columns: TxKanbanColumn<string>[] = [
    { id: 'plan', title: 'Plan', items: ['Scope', 'Estimate'] },
    { id: 'build', title: 'Build', items: ['Prototype'] },
    { id: 'ship', title: 'Ship', items: ['Release'] },
  ];
}
