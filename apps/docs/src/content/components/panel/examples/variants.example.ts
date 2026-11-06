import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPanel } from '@tectra-ng/ui/panel';

@Component({
  selector: 'panel-variants-example',
  imports: [TxPanel],
  template: `
    <tx-panel title="Notifications" subtitle="variant card" icon="bell">
      <div class="panels">
        <tx-panel variant="inset" title="Email" subtitle="variant inset" icon="envelope">
          Daily summary at 9:00.
        </tx-panel>
        <tx-panel variant="plain" title="Push" subtitle="variant plain" icon="mobile">
          Mentions and replies only.
        </tx-panel>
      </div>
    </tx-panel>
  `,
  styles: `
    .panels {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PanelVariantsExample {}
