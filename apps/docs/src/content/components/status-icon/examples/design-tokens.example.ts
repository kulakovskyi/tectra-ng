import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxStatusIcon } from '@tectra/ui/status-icon';

@Component({
  selector: 'status-icon-design-tokens-example',
  imports: [TxStatusIcon],
  template: `
    <tx-status-icon
      [status]="true"
      [dt]="{ root: { size: '24px' }, success: { color: 'var(--tx-primary-base)' } }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StatusIconDesignTokensExample {}
