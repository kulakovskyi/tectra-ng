import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxButtonGroup } from '@tectra-ng/ui/button-group';

@Component({
  selector: 'button-group-outlined-example',
  imports: [TxButton, TxButtonGroup],
  template: `
    <tx-button-group>
      <button txButton [outlined]="true" [severity]="'secondary'">Day</button>
      <button txButton [outlined]="true" [severity]="'secondary'">Week</button>
      <button txButton [outlined]="true" [severity]="'secondary'">Month</button>
    </tx-button-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonGroupOutlinedExample {}
