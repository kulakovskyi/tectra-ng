import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxDialog, TxDialogClose, TxDialogFooter } from '@tectra-ng/ui/dialog';

@Component({
  selector: 'dialog-design-tokens-example',
  imports: [TxDialog, TxDialogFooter, TxDialogClose, TxButton],
  template: `
    <button txButton severity="secondary" [outlined]="true" (click)="visible.set(true)">
      What is new
    </button>
    <tx-dialog
      header="Version 2.4"
      size="small"
      [(visible)]="visible"
      [dt]="{
        root: { borderRadius: '20px', background: 'var(--tx-primary-soft)' },
        mask: { background: 'color-mix(in srgb, var(--tx-primary-base) 30%, transparent)' },
        header: { padding: '24px 28px 4px' },
        content: { padding: '12px 28px' },
        footer: { padding: '12px 28px 24px' },
      }"
    >
      Reports can be shared with a link, and tables export to CSV.
      <tx-dialog-footer>
        <button txButton txDialogClose>Nice</button>
      </tx-dialog-footer>
    </tx-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DialogDesignTokensExample {
  readonly visible = signal(false);
}
