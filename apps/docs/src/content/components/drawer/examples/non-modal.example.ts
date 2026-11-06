import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxDrawer } from '@tectra-ng/ui/drawer';

@Component({
  selector: 'drawer-non-modal-example',
  imports: [TxDrawer, TxButton],
  template: `
    <button
      txButton
      icon="question-circle"
      severity="secondary"
      [outlined]="true"
      (click)="visible.set(!visible())"
    >
      {{ visible() ? 'Hide help' : 'Show help' }}
    </button>
    <tx-drawer
      header="Help"
      size="small"
      [modal]="false"
      [autoFocus]="'none'"
      [restoreFocus]="false"
      [(visible)]="visible"
    >
      <p>
        The page stays usable while this panel is open — keep reading, scroll and click as usual.
      </p>
      <p>Close it with the button in its header or with Escape.</p>
    </tx-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DrawerNonModalExample {
  readonly visible = signal(false);
}
