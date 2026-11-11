import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxClipboard } from '@tectra-ng/utils/clipboard';

@Component({
  selector: 'clipboard-service-example',
  imports: [TxButton],
  template: `<button txButton icon="code" label="Copy filters as JSON" (click)="copy()"></button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ClipboardServiceExample {
  private readonly clipboard = inject(TxClipboard);
  private readonly filters = { status: ['paid', 'shipped'], from: '2026-11-01', page: 1 };

  copy(): void {
    void this.clipboard.copy(JSON.stringify(this.filters, null, 2), {
      message: 'Filters copied as JSON',
    });
  }
}
