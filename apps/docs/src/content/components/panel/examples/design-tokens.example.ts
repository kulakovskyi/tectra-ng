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
          iconColor: 'var(--tx-success-base)',
          iconBackground: 'var(--tx-success-soft)',
          iconScale: '0.55',
          leadGap: '16px',
        },
      }"
    >
      Visa ending in 4242.
    </tx-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PanelDesignTokensExample {}
