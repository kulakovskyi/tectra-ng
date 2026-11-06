import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { TxToggleSwitch, TxToggleSwitchHandleTemplate } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'toggle-switch-handle-template-example',
  imports: [TxToggleSwitch, TxToggleSwitchHandleTemplate, TxIcon],
  template: `
    <tx-toggle-switch label="Dark theme" size="large">
      <ng-template txToggleSwitchHandle let-checked>
        <tx-icon [name]="checked ? 'moon' : 'sun'" />
      </ng-template>
    </tx-toggle-switch>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToggleSwitchHandleTemplateExample {}
