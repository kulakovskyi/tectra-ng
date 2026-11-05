import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxHighlightText } from '@tectra/ui/highlight-text';

@Component({
  selector: 'highlight-text-design-tokens-example',
  imports: [TxHighlightText],
  template: `
    <p class="text">
      <tx-highlight-text
        text="Deploys run every night at two."
        highlight="night"
        [dt]="{
          mark: {
            background: 'var(--tx-highlight-background)',
            color: 'var(--tx-highlight-color)',
            fontWeight: '600',
            paddingX: '3px',
          },
        }"
      />
    </p>
  `,
  styles: `
    .text {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HighlightTextDesignTokensExample {}
