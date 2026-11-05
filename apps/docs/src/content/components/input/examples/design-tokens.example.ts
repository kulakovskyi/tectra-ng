import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'input-design-tokens-example',
  imports: [TxInput],
  template: `<input txInput [dt]="tokens" placeholder="Rounded, teal focus" aria-label="Custom tokens" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputDesignTokensExample {
  readonly tokens = { root: { borderRadius: '999px', focusBorderColor: '#0f766e', paddingX: '16px' } };
}
