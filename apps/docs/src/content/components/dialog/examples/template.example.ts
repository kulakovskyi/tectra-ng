import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxDialog, TxDialogClose, TxDialogFooter } from '@tectra/ui/dialog';

@Component({
  selector: 'dialog-template-example',
  imports: [TxDialog, TxDialogFooter, TxDialogClose, TxButton],
  template: `
    <button txButton severity="secondary" [outlined]="true" (click)="visible.set(true)">
      Keyboard shortcuts
    </button>
    <tx-dialog header="Keyboard shortcuts" size="small" [(visible)]="visible">
      <dl class="keys">
        <dt><kbd>/</kbd></dt>
        <dd>Search</dd>
        <dt><kbd>N</kbd></dt>
        <dd>New task</dd>
        <dt><kbd>?</kbd></dt>
        <dd>Show this list</dd>
      </dl>
      <tx-dialog-footer>
        <button txButton txDialogClose>Got it</button>
      </tx-dialog-footer>
    </tx-dialog>
  `,
  styles: `
    .keys {
      display: grid;
      grid-template-columns: 48px 1fr;
      gap: 8px 12px;
      margin: 0;
    }
    .keys dd {
      margin: 0;
    }
    kbd {
      padding: 1px 6px;
      border: 1px solid var(--tx-surface-border);
      border-radius: var(--tx-radius-sm);
      font-family: var(--tx-font-mono);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DialogTemplateExample {
  readonly visible = signal(false);
}
