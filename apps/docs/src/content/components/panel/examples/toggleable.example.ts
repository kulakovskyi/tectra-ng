import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPanel } from '@tectra-ng/ui/panel';

@Component({
  selector: 'panel-toggleable-example',
  imports: [TxPanel],
  template: `
    <tx-panel
      title="Advanced settings"
      subtitle="Change only if you know what they do"
      icon="cog"
      [toggleable]="true"
      [(collapsed)]="collapsed"
    >
      <p class="text">Cache lifetime, request limits and webhooks.</p>
    </tx-panel>
    <p class="status">{{ collapsed() ? 'Collapsed' : 'Expanded' }}</p>
  `,
  styles: `
    .text {
      margin: 0;
    }
    .status {
      margin: 12px 0 0;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PanelToggleableExample {
  readonly collapsed = signal(true);
}
