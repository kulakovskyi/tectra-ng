import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxMessage } from '@tectra-ng/ui/message';

@Component({
  selector: 'message-closable-example',
  imports: [TxMessage, TxButton],
  template: `
    <div class="list">
      @if (isShown()) {
        <tx-message
          icon="info-circle"
          text="You can hide this tip."
          [closable]="true"
          (closed)="isShown.set(false)"
        />
      } @else {
        <button txButton size="small" severity="secondary" (click)="isShown.set(true)">
          Show again
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .list {
      display: grid;
      justify-items: start;
      min-height: 48px;
    }

    tx-message {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MessageClosableExample {
  readonly isShown = signal(true);
}
