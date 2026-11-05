import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCard } from '@tectra/ui/card';

@Component({
  selector: 'card-design-tokens-example',
  imports: [TxCard],
  template: `
    <tx-card
      title="Tip"
      class="card"
      [dt]="{
        root: {
          background: 'var(--tx-highlight-background)',
          borderColor: 'transparent',
          shadow: 'none',
          titleFontSize: '15px',
        },
      }"
    >
      Press / anywhere to search.
    </tx-card>
  `,
  styles: `
    .card {
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CardDesignTokensExample {}
