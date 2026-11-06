import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxProgressBar } from '@tectra-ng/ui/progress-bar';

@Component({
  selector: 'progress-bar-design-tokens-example',
  imports: [TxProgressBar],
  template: `<tx-progress-bar
    [value]="58"
    [showValue]="true"
    ariaLabel="Custom tokens"
    [dt]="{ root: { height: '14px', borderRadius: '3px' } }"
  />`,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgressBarDesignTokensExample {}
