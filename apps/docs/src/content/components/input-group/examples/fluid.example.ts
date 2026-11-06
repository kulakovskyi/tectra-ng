import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInput } from '@tectra-ng/ui/input';
import { TxInputGroup, TxInputGroupAddon } from '@tectra-ng/ui/input-group';

@Component({
  selector: 'input-group-fluid-example',
  imports: [TxInputGroup, TxInputGroupAddon, TxInput, TxButton],
  template: `
    <tx-input-group [fluid]="true">
      <tx-input-group-addon>@</tx-input-group-addon>
      <input txInput placeholder="Invite by email" aria-label="Invite by email" />
      <button txButton [icon]="'send'">Invite</button>
    </tx-input-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputGroupFluidExample {}
