import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxButtonGroup } from '@tectra/ui/button-group';

@Component({
  selector: 'button-group-basic-example',
  imports: [TxButton, TxButtonGroup],
  template: `
    <tx-button-group>
      <button txButton [icon]="'check'">Save</button>
      <button txButton [icon]="'trash'">Delete</button>
      <button txButton [icon]="'close'">Cancel</button>
    </tx-button-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonGroupBasicExample {}
