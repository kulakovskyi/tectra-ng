import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra/ui/button';

@Component({
  selector: 'button-disabled-example',
  imports: [TxButton],
  template: `
    <div class="flex">
      <button txButton disabled>Button</button>
      <button txButton [outlined]="true" [disabled]="true">Outlined</button>
      <a txButton [link]="true" href="https://angular.dev" [disabled]="true">Disabled link</a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonDisabledExample {}
