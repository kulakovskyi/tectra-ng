import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMessage } from '@tectra/ui/message';

@Component({
  selector: 'message-design-tokens-example',
  imports: [TxMessage],
  template: `<tx-message
    severity="info"
    icon="sparkles"
    text="Rounder, with a wider accent and a stronger tint."
    [dt]="tokens"
  />`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MessageDesignTokensExample {
  readonly tokens = {
    root: { borderRadius: '16px', accentWidth: '6px', backgroundTint: '12%' },
  };
}
