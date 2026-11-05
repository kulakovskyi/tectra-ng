import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPanel } from '@tectra/ui/panel';
import { TxButton } from '@tectra/ui/button';

@Component({
  selector: 'panel-icon-and-actions-example',
  imports: [TxPanel, TxButton],
  template: `
    <tx-panel title="Members" subtitle="People who can open this project" icon="users">
      <button txPanelActions txButton size="small" icon="plus" (click)="count.set(count() + 1)">
        Invite
      </button>
      <p class="text">{{ count() }} members</p>
    </tx-panel>
  `,
  styles: `
    .text {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PanelIconAndActionsExample {
  readonly count = signal(4);
}
