import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxActionsMenu, TxActionsMenuItem } from '@tectra-ng/blocks/actions-menu';
import { TxButton } from '@tectra-ng/ui/button';
import { TxPill } from '@tectra-ng/ui/pill';

@Component({
  selector: 'actions-menu-basic-example',
  imports: [TxActionsMenu, TxButton, TxPill],
  template: `
    <div class="header">
      <div class="title">
        <h3>Platform team</h3>
        <tx-pill size="small" value="8 members" />
      </div>
      <div class="actions">
        <button txButton icon="user-plus">Add member</button>
        <tx-actions-menu tooltip="Team actions" [items]="actions" (itemSelect)="last.set($event)" />
      </div>
    </div>
    <p class="result">Last action: {{ label(last()) }}</p>
  `,
  styles: `
    .header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10.5px;
    }

    .title,
    .actions {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    h3 {
      margin: 0;
      font-size: 15.75px;
    }

    .result {
      margin: 14px 0 0;
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ActionsMenuBasicExample {
  readonly last = signal<string | null>(null);
  readonly actions: TxActionsMenuItem[] = [
    { id: 'rename', label: 'Rename team', icon: 'pencil' },
    { id: 'move', label: 'Move to another unit', icon: 'arrow-right' },
    { id: 'export', label: 'Export members', icon: 'download' },
    { id: 'delete', label: 'Delete team', icon: 'trash', danger: true },
  ];

  label(id: string | null): string {
    return this.actions.find((action) => action.id === id)?.label ?? 'none';
  }
}
