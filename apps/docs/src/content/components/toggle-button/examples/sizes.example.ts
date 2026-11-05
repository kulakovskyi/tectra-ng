import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxToggleButton } from '@tectra/ui/toggle-button';

@Component({
  selector: 'toggle-button-sizes-example',
  imports: [TxToggleButton],
  template: `
    <div class="flex">
      <tx-toggle-button [size]="'small'" [onLabel]="'Small'" [offLabel]="'Small'" />
      <tx-toggle-button [onLabel]="'Medium'" [offLabel]="'Medium'" />
      <tx-toggle-button [size]="'large'" [onLabel]="'Large'" [offLabel]="'Large'" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToggleButtonSizesExample {}
