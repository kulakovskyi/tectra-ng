import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIconField, TxInputCopy, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';

@Component({
  selector: 'icon-field-copy-example',
  imports: [TxIconField, TxInputIcon, TxInputCopy, TxInput],
  template: `
    <tx-icon-field>
      <tx-input-icon [icon]="'key'" />
      <input txInput value="tx_live_9f3a1c7e" readonly aria-label="API key" />
      <tx-input-copy />
    </tx-icon-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IconFieldCopyExample {}
