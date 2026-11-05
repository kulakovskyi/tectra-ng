import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxDrawer } from '@tectra/ui/drawer';

@Component({
  selector: 'drawer-design-tokens-example',
  imports: [TxDrawer, TxButton],
  template: `
    <button txButton severity="secondary" [outlined]="true" (click)="visible.set(true)">
      Open a floating drawer
    </button>
    <tx-drawer
      header="Floating"
      size="small"
      [(visible)]="visible"
      [dt]="{
        root: { background: 'var(--tx-surface-card)' },
        mask: { background: 'transparent' },
        header: { padding: '24px 24px 8px' },
      }"
    >
      A drawer without a dimmed page.
    </tx-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DrawerDesignTokensExample {
  readonly visible = signal(false);
}
