import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxDivider } from '@tectra-ng/ui/divider';

@Component({
  selector: 'divider-design-tokens-example',
  imports: [TxDivider],
  template: `
    <tx-divider
      [dt]="{
        root: {
          color: 'var(--tx-primary-base)',
          width: '2px',
          margin: '24px',
          contentColor: 'var(--tx-primary-base)',
        },
      }"
    >
      Section 2
    </tx-divider>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DividerDesignTokensExample {}
