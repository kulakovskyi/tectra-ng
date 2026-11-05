import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxConfirmService } from '@tectra/ui/confirm';

@Component({
  selector: 'confirm-custom-example',
  imports: [TxButton],
  template: `
    <div class="row">
      <button txButton icon="send" (click)="send()">Send to 1 240 customers</button>
      <span class="status">{{ status() }}</span>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .status {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConfirmCustomExample {
  private confirm = inject(TxConfirmService);
  readonly status = signal('Draft');

  async send(): Promise<void> {
    const ok = await this.confirm.dialog({
      title: 'Send the newsletter now?',
      message: 'It goes out to 1 240 customers and cannot be recalled.',
      icon: 'send',
      acceptLabel: 'Send now',
      acceptIcon: 'send',
      rejectLabel: 'Not yet',
      defaultFocus: 'accept',
    });
    this.status.set(ok ? 'Sent' : 'Draft');
  }
}
