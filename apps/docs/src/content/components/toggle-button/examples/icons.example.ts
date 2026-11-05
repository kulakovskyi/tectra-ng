import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxToggleButton } from '@tectra/ui/toggle-button';

@Component({
  selector: 'toggle-button-icons-example',
  imports: [TxToggleButton],
  template: `
    <div class="flex">
      <tx-toggle-button [onLabel]="'Locked'" [offLabel]="'Unlocked'" [onIcon]="'check'" [offIcon]="'times'" />
      <tx-toggle-button [onLabel]="'Subscribed'" [offLabel]="'Subscribe'" [onIcon]="'bell'" [offIcon]="'bell'" [iconPos]="'right'" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToggleButtonIconsExample {}
