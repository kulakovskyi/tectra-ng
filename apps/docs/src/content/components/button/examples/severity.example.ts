import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra/ui/button';

@Component({
  selector: 'button-severity-example',
  imports: [TxButton],
  template: `
    <div class="flex">
      <button txButton>Primary</button>
      <button txButton [severity]="'secondary'">Secondary</button>
      <button txButton [severity]="'success'">Success</button>
      <button txButton [severity]="'info'">Info</button>
      <button txButton [severity]="'warn'">Warn</button>
      <button txButton [severity]="'danger'">Danger</button>
      <button txButton [severity]="'help'">Help</button>
      <button txButton [severity]="'contrast'">Contrast</button>
      <button txButton disabled>Disabled</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonSeverityExample {}
