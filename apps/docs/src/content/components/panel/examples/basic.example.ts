import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPanel } from '@tectra-ng/ui/panel';

@Component({
  selector: 'panel-basic-example',
  imports: [TxPanel],
  template: `
    <tx-panel title="Profile" subtitle="How other members see you">
      <p class="text">Your name and photo are shown on comments and in the member list.</p>
    </tx-panel>
  `,
  styles: `
    .text {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PanelBasicExample {}
