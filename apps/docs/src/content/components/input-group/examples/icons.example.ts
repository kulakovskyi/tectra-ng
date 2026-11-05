import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra/icons';
import { TxInput } from '@tectra/ui/input';
import { TxInputGroup, TxInputGroupAddon } from '@tectra/ui/input-group';

@Component({
  selector: 'input-group-icons-example',
  imports: [TxInputGroup, TxInputGroupAddon, TxInput, TxIcon],
  template: `
    <tx-input-group>
      <tx-input-group-addon><tx-icon [name]="'user'" /></tx-input-group-addon>
      <input txInput placeholder="Username" aria-label="Username" />
      <tx-input-group-addon><tx-icon [name]="'at'" /></tx-input-group-addon>
    </tx-input-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputGroupIconsExample {}
