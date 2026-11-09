import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxEmptyState } from '@tectra-ng/blocks/empty-state';

@Component({
  selector: 'empty-state-design-tokens-example',
  imports: [TxEmptyState],
  template: `
    <tx-empty-state
      variant="framed"
      icon="calendar"
      title="No meetings today"
      text="Enjoy the quiet."
      [dt]="{
        framed: { minHeight: '0', padding: '28px' },
        icon: { borderRadius: '12px', tint: '18%' },
        title: { fontSize: '16px' },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EmptyStateDesignTokensExample {}
