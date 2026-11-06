import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'button-variants-example',
  imports: [TxButton],
  template: `
    <div class="stack">
      <div class="flex">
        <button txButton [outlined]="true">Primary</button>
        <button txButton [outlined]="true" [severity]="'secondary'">Secondary</button>
        <button txButton [outlined]="true" [severity]="'success'">Success</button>
        <button txButton [outlined]="true" [severity]="'danger'">Danger</button>
      </div>
      <div class="flex">
        <button txButton [text]="true">Primary</button>
        <button txButton [text]="true" [severity]="'secondary'">Secondary</button>
        <button txButton [text]="true" [severity]="'success'">Success</button>
        <button txButton [text]="true" [severity]="'danger'">Danger</button>
      </div>
      <div class="flex">
        <button txButton [link]="true">Link button</button>
        <a txButton [variant]="'link'" href="https://angular.dev" target="_blank">Real link</a>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonVariantsExample {}
