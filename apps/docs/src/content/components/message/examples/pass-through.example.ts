import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMessage } from '@tectra/ui/message';

@Component({
  selector: 'message-pass-through-example',
  imports: [TxMessage],
  template: `<tx-message
    severity="secondary"
    icon="history"
    text="Last edited 5 minutes ago"
    [closable]="true"
    [pt]="pt"
  />`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MessagePassThroughExample {
  readonly pt = {
    content: { style: { fontStyle: 'italic' } },
    closeButton: { style: { opacity: '0.6' } },
  };
}
