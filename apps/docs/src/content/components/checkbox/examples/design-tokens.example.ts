import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCheckbox } from '@tectra/ui/checkbox';

@Component({
  selector: 'checkbox-design-tokens-example',
  imports: [TxCheckbox],
  template: `<tx-checkbox label="Round and teal" [binary]="true" [dt]="tokens" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CheckboxDesignTokensExample {
  readonly tokens = {
    root: {
      borderRadius: '999px',
      checkedBackground: '#0f766e',
      checkedBorderColor: '#0f766e',
      checkedHoverBackground: '#115e59',
    },
  };
}
