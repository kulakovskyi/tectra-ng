import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxActionsMenu, TxActionsMenuItem } from '@tectra-ng/blocks/actions-menu';

@Component({
  selector: 'actions-menu-sizes-example',
  imports: [TxActionsMenu],
  template: `
    <div class="row">
      <tx-actions-menu tooltip="Medium" [items]="actions" />
      <tx-actions-menu size="small" tooltip="Small" [items]="actions" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 14px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ActionsMenuSizesExample {
  readonly actions: TxActionsMenuItem[] = [
    { id: 'edit', label: 'Edit', icon: 'pencil' },
    { id: 'duplicate', label: 'Duplicate', icon: 'copy' },
    { id: 'delete', label: 'Delete', icon: 'trash', danger: true },
  ];
}
