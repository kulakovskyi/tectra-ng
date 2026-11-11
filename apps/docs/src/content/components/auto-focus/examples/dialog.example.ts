import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxDialog } from '@tectra-ng/ui/dialog';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxAutoFocus } from '@tectra-ng/utils/auto-focus';

@Component({
  selector: 'auto-focus-dialog-example',
  imports: [TxButton, TxDialog, TxField, TxInput, TxAutoFocus],
  template: `
    <button txButton label="Rename file" (click)="open.set(true)"></button>
    <tx-dialog header="Rename file" [(visible)]="open">
      <tx-field label="Name">
        <input txInput value="report-final-v2.pdf" txAutoFocus select [fluid]="true" />
      </tx-field>
    </tx-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AutoFocusDialogExample {
  readonly open = signal(false);
}
