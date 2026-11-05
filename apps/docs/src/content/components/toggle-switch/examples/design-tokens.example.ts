import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxToggleSwitch } from '@tectra/ui/toggle-switch';

@Component({
  selector: 'toggle-switch-design-tokens-example',
  imports: [TxToggleSwitch],
  template: `<tx-toggle-switch label="Square and teal" [dt]="tokens" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToggleSwitchDesignTokensExample {
  readonly tokens = {
    root: { borderRadius: '6px', checkedBackground: '#0f766e', checkedHoverBackground: '#115e59' },
  };
}
