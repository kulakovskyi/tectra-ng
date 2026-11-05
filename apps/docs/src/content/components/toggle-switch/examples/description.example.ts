import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxToggleSwitch } from '@tectra/ui/toggle-switch';

@Component({
  selector: 'toggle-switch-description-example',
  imports: [TxToggleSwitch],
  template: `<tx-toggle-switch
    label="Two-factor sign-in"
    description="Ask for a code from your phone on new devices."
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToggleSwitchDescriptionExample {}
