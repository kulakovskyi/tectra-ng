import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInputNumber } from '@tectra-ng/ui/input-number';

@Component({
  selector: 'input-number-design-tokens-example',
  imports: [TxInputNumber],
  template: `<tx-input-number
    ariaLabel="Quantity"
    [showButtons]="true"
    buttonLayout="horizontal"
    [min]="0"
    [dt]="tokens"
    class="qty"
  />`,
  styles: `
    .qty {
      width: 180px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputNumberDesignTokensExample {
  readonly tokens = {
    button: { width: '44px', background: '#ccfbf1', hoverBackground: '#99f6e4', color: '#115e59' },
  };
}
