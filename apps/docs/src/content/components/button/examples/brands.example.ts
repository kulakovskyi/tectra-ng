import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'button-brands-example',
  imports: [TxButton],
  template: `
    <div class="flex">
      <button txButton [icon]="'google'" [severity]="'secondary'" [outlined]="true">
        Sign in with Google
      </button>
      <button txButton [icon]="'github'" [severity]="'contrast'">GitHub</button>
      <button txButton [icon]="'telegram'" [severity]="'info'" aria-label="Telegram"></button>
      <button
        txButton
        [icon]="'youtube'"
        [severity]="'danger'"
        [rounded]="true"
        aria-label="YouTube"
      ></button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonBrandsExample {}
