import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxConfirmService } from '@tectra-ng/ui/confirm';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'confirm-custom-example',
  imports: [TxButton],
  template: ` <button txButton icon="send" (click)="send()">Send to 1 240 customers</button> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConfirmCustomExample {
  private confirm = inject(TxConfirmService);
  private readonly toast = inject(TxToastService);

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
    if (ok) this.toast.success('Newsletter sent to 1 240 customers');
    else this.toast.info('Kept as a draft');
  }
}
