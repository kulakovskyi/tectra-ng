import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra/ui/button';

@Component({
  selector: 'button-ripple-example',
  imports: [TxButton],
  template: `
    <div class="flex">
      <button txButton [size]="'large'">Press and hold</button>
      <button txButton [outlined]="true" [size]="'large'">Outlined</button>
      <button txButton [text]="true" [severity]="'secondary'" [size]="'large'">Text</button>
      <button
        txButton
        [icon]="'heart'"
        [rounded]="true"
        [rippleCentered]="true"
        [severity]="'danger'"
        [size]="'large'"
        aria-label="Like"
      ></button>
      <button txButton [severity]="'contrast'" [rippleColor]="'#a78bfa'" [size]="'large'">
        Custom colour
      </button>
      <button txButton [ripple]="false" [severity]="'secondary'" [size]="'large'">No ripple</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonRippleExample {}
