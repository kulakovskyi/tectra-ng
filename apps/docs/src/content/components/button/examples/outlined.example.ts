import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra/ui/button';

@Component({
  selector: 'button-outlined-example',
  imports: [TxButton],
  template: `
    <div class="flex">
      <button txButton [outlined]="true">Primary</button>
      <button txButton [outlined]="true" [severity]="'secondary'">Secondary</button>
      <button txButton [outlined]="true" [severity]="'success'">Success</button>
      <button txButton [outlined]="true" [severity]="'warn'">Warn</button>
      <button txButton [outlined]="true" [severity]="'danger'">Danger</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonOutlinedExample {}
