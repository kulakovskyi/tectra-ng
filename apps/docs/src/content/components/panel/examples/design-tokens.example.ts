import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPanel } from '@tectra-ng/ui/panel';

@Component({
  selector: 'panel-design-tokens-example',
  imports: [TxPanel],
  template: `
    <tx-panel
      title="Billing"
      subtitle="Next invoice on Dec 1"
      icon="credit-card"
      [dt]="{
        root: {
          borderRadius: '8px',
          iconColor: 'var(--tx-green-700)',
          iconBackground: 'var(--tx-green-100)',
        },
      }"
    >
      Visa ending in 4242.
    </tx-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PanelDesignTokensExample {}
