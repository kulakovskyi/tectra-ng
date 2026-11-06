import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { TxButton } from '@tectra-ng/ui/button';
import { TxDialogContent, TxDialogFooter, TxDialogHeader, injectDialogData, injectDialogRef } from '@tectra-ng/ui/dialog';
import { confirmView } from './confirm-content';
import { TxConfirmState } from './confirm.types';

@Component({
  selector: 'tx-confirm-dialog',
  imports: [TxDialogHeader, TxDialogContent, TxDialogFooter, TxButton, TxIcon],
  template: `
    <tx-dialog-header [title]="view.title()" />
    <tx-dialog-content>
      <div class="tx-confirm" [attr.data-severity]="view.severity" [style]="view.style">
        @if (view.icon) {
          <span class="tx-confirm__icon" aria-hidden="true"><tx-icon [name]="view.icon" /></span>
        }
        @if (view.message) {
          <p class="tx-confirm__message" [id]="state.messageId">{{ view.message }}</p>
        }
      </div>
    </tx-dialog-content>
    <tx-dialog-footer>
      <button txButton class="tx-confirm__reject" severity="secondary" [disabled]="view.busy()" (click)="finish(false)">
        {{ view.rejectLabel() }}
      </button>
      <button
        txButton
        class="tx-confirm__accept"
        [severity]="view.severity"
        [icon]="view.acceptIcon"
        [loading]="view.busy()"
        (click)="view.accept(finish)"
      >
        {{ view.acceptLabel() }}
      </button>
    </tx-dialog-footer>
  `,
  styleUrl: './confirm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TxConfirmDialog {
  private ref = injectDialogRef<boolean>();
  readonly state = injectDialogData<TxConfirmState>();
  readonly view = confirmView(this.state);
  readonly finish = (accepted: boolean) => void this.ref.close(accepted);
}
