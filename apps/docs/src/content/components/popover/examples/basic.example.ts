import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInput } from '@tectra-ng/ui/input';
import { TxPopover, TxPopoverTrigger } from '@tectra-ng/ui/popover';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'popover-basic-example',
  imports: [TxPopover, TxPopoverTrigger, TxButton, TxInput],
  template: `
    <button txButton icon="share-alt" [txPopoverTrigger]="share">Share</button>
    <tx-popover #share header="Share this report" closeButton>
      <div class="share">
        <input txInput aria-label="Report link" readonly [value]="link" />
        <button txButton severity="secondary" [outlined]="true" (click)="copy()">
          {{ copied() ? 'Copied' : 'Copy' }}
        </button>
      </div>
      <p class="note">Anyone with the link can view the report.</p>
    </tx-popover>
  `,
  styles: `
    .share {
      display: flex;
      gap: 8px;
    }
    .note {
      margin: 10px 0 0;
      color: var(--tx-text-muted);
      font-size: var(--tx-font-size-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PopoverBasicExample {
  readonly link = 'https://example.com/r/7Q2M';
  readonly copied = signal(false);
  private readonly toast = inject(TxToastService);

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.link);
      this.copied.set(true);
      this.toast.success('Link copied');
    } catch {
      this.toast.error('Could not copy the link');
    }
  }
}
