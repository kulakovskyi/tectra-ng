import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxMessage } from '@tectra-ng/ui/message';

@Component({
  selector: 'message-content-example',
  imports: [TxMessage, TxButton],
  template: `
    <tx-message severity="warn" icon="envelope">
      <div class="body">
        <span
          ><strong>Confirm your email.</strong> We sent a link to the address you signed up
          with.</span
        >
        <button txButton size="small" severity="warn" [outlined]="true" (click)="sent.set(true)">
          {{ sent() ? 'Sent again' : 'Resend link' }}
        </button>
      </div>
    </tx-message>
  `,
  styles: `
    :host {
      display: block;
    }

    .body {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MessageContentExample {
  readonly sent = signal(false);
}
