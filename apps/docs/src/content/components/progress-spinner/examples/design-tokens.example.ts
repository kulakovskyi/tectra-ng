import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxProgressSpinner } from '@tectra/ui/progress-spinner';

@Component({
  selector: 'progress-spinner-design-tokens-example',
  imports: [TxProgressSpinner],
  template: `<tx-progress-spinner
    size="large"
    [dt]="{ root: { color: '#0f766e', trackColor: '#ccfbf1', duration: '1.2s' } }"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgressSpinnerDesignTokensExample {}
