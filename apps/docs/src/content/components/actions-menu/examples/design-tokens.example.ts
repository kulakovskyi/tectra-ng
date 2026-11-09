import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxActionsMenu, TxActionsMenuItem } from '@tectra-ng/blocks/actions-menu';

@Component({
  selector: 'actions-menu-design-tokens-example',
  imports: [TxActionsMenu],
  template: `
    <tx-actions-menu
      tooltip="File actions"
      [items]="actions"
      [dt]="{
        list: { minWidth: '220px', gap: '3.5px' },
        item: { fontSize: '14px', paddingY: '9px', borderRadius: '999px' },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ActionsMenuDesignTokensExample {
  readonly actions: TxActionsMenuItem[] = [
    { id: 'open', label: 'Open', icon: 'external-link' },
    { id: 'share', label: 'Share', icon: 'share-alt' },
    { id: 'delete', label: 'Delete', icon: 'trash', danger: true },
  ];
}
