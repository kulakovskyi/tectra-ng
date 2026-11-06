import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIconField, TxInputClear, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';

@Component({
  selector: 'icon-field-filled-example',
  imports: [TxIconField, TxInputIcon, TxInputClear, TxInput],
  template: `
    <tx-icon-field [fluid]="true">
      <tx-input-icon [icon]="'filter'" />
      <input txInput [variant]="'filled'" value="Filled and fluid" aria-label="Filled" />
      <tx-input-clear />
    </tx-icon-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IconFieldFilledExample {}
