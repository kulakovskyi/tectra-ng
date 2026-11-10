import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTruncateText } from '@tectra-ng/ui/truncate-text';

@Component({
  selector: 'truncate-text-design-tokens-example',
  imports: [TxTruncateText],
  template: `
    <tx-truncate-text
      text="https://example.com/reports/2026/annual-summary"
      [limit]="28"
      openLink
      copyable
      [dt]="{
        root: {
          gap: '12px',
          linkColor: 'var(--tx-text-primary)',
          linkHoverColor: 'var(--tx-primary-soft-text)',
        },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TruncateTextDesignTokensExample {}
