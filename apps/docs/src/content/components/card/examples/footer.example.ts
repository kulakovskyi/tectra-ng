import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxCard } from '@tectra/ui/card';
import { TxButton } from '@tectra/ui/button';

@Component({
  selector: 'card-footer-example',
  imports: [TxCard, TxButton],
  template: `
    <tx-card title="Upgrade to Team" subtitle="$12 per member a month" class="card">
      Shared projects, roles and an audit log for everyone in your workspace.
      <div txCardFooter class="actions">
        <button txButton severity="secondary" variant="text" (click)="status.set('Maybe later')">
          Not now
        </button>
        <button txButton (click)="status.set('Upgrade started')">Upgrade</button>
      </div>
    </tx-card>
    <p class="status" aria-live="polite">{{ status() }}</p>
  `,
  styles: `
    .card {
      max-width: 360px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .status {
      min-height: 20px;
      margin: 12px 0 0;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CardFooterExample {
  readonly status = signal('');
}
