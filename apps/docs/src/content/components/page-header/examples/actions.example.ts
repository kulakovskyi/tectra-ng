import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPageHeader } from '@tectra-ng/blocks/page-header';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'page-header-actions-example',
  imports: [TxPageHeader, TxButton],
  template: `
    <div class="ground">
      <tx-page-header title="Invoice INV-1042" subtitle="Issued 12 March · due in 14 days">
        <button txButton severity="secondary" icon="arrow-left" (click)="last.set('Back')">
          Back
        </button>
        <button
          txButton
          severity="secondary"
          outlined
          icon="download"
          (click)="last.set('Download')"
        >
          Download
        </button>
        <button txButton icon="send" (click)="last.set('Send')">Send</button>
      </tx-page-header>
    </div>
    <p class="note">Last action: {{ last() }}</p>
  `,
  styles: `
    .ground {
      padding: 20px;
      border-radius: 12px;
      background: var(--tx-surface-ground);
    }

    .note {
      margin: 12px 0 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PageHeaderActionsExample {
  readonly last = signal('none');
}
