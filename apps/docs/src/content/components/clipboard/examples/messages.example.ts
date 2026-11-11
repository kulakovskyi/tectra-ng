import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCopy } from '@tectra-ng/utils/clipboard';

@Component({
  selector: 'clipboard-messages-example',
  imports: [TxButton, TxCopy],
  template: `
    <div class="flex">
      <button
        txButton
        label="Copy API key"
        severity="secondary"
        txCopy="tx_live_51Hq2…"
        copyMessage="API key copied — keep it secret"
      ></button>
      <button
        txButton
        severity="secondary"
        [icon]="done() ? 'check' : 'copy'"
        [label]="done() ? 'Copied' : 'Copy without a toast'"
        txCopy="SUMMER-26"
        [copyMessage]="false"
        (copied)="flash()"
      ></button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ClipboardMessagesExample {
  readonly done = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;

  flash(): void {
    this.done.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.done.set(false), 1500);
  }
}
