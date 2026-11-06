import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxButtonGroup } from '@tectra-ng/ui/button-group';

@Component({
  selector: 'button-group-basic-example',
  imports: [TxButton, TxButtonGroup],
  template: `
    <tx-button-group>
      <button txButton [icon]="'check'">Save</button>
      <button txButton [icon]="'trash'">Delete</button>
      <button txButton [icon]="'times'">Cancel</button>
    </tx-button-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonGroupBasicExample {}
