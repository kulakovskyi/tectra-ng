import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra/ui/button';

@Component({
  selector: 'button-sizes-example',
  imports: [TxButton],
  template: `
    <div class="flex">
      <button txButton [size]="'small'">Small</button>
      <button txButton>Medium</button>
      <button txButton [size]="'large'">Large</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonSizesExample {}
