import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxMessage, TxMessageActions } from '@tectra-ng/ui/message';

@Component({
  selector: 'message-actions-example',
  imports: [TxMessage, TxMessageActions, TxButton],
  template: `
    <div class="stack">
      <tx-message severity="warn" icon="envelope" text="Confirm your email to keep your account.">
        <button
          txButton
          txMessageActions
          size="small"
          severity="warn"
          [outlined]="true"
          (click)="sent.set(true)"
        >
          {{ sent() ? 'Sent again' : 'Resend link' }}
        </button>
      </tx-message>
      @if (failed()) {
        <tx-message
          severity="danger"
          icon="times-circle"
          text="The report could not be built."
          [closable]="true"
          (closed)="failed.set(false)"
        >
          <button
            txButton
            txMessageActions
            size="small"
            severity="danger"
            (click)="failed.set(false)"
          >
            Try again
          </button>
        </tx-message>
      } @else {
        <tx-message severity="success" icon="check-circle" text="The report is ready.">
          <button
            txButton
            txMessageActions
            size="small"
            severity="secondary"
            [text]="true"
            (click)="failed.set(true)"
          >
            Build again
          </button>
        </tx-message>
      }
    </div>
  `,
  styles: `
    .stack {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MessageActionsExample {
  readonly sent = signal(false);
  readonly failed = signal(true);
}
