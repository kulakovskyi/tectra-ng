import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'button-rounded-raised-example',
  imports: [TxButton],
  template: `
    <div class="flex">
      <button txButton [rounded]="true">Rounded</button>
      <button txButton [rounded]="true" [outlined]="true">Rounded outlined</button>
      <button txButton [raised]="true">Raised</button>
      <button txButton [raised]="true" [rounded]="true" [severity]="'help'">Both</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonRoundedRaisedExample {}
