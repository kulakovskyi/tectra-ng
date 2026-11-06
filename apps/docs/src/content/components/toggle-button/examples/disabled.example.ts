import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxToggleButton } from '@tectra-ng/ui/toggle-button';

@Component({
  selector: 'toggle-button-disabled-example',
  imports: [TxToggleButton],
  template: `
    <div class="flex">
      <tx-toggle-button [disabled]="true" [onLabel]="'On'" [offLabel]="'Off'" />
      <tx-toggle-button [invalid]="true" [onLabel]="'Accept'" [offLabel]="'Accept terms'" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToggleButtonDisabledExample {}
