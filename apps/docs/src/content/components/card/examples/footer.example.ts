import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxCard } from '@tectra-ng/ui/card';
import { TxButton } from '@tectra-ng/ui/button';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'card-footer-example',
  imports: [TxCard, TxButton],
  template: `
    <tx-card title="Upgrade to Team" subtitle="$12 per member a month" class="card">
      Shared projects, roles and an audit log for everyone in your workspace.
      <div txCardFooter class="actions">
        <button
          txButton
          severity="secondary"
          variant="text"
          (click)="toast.info('We will remind you next month')"
        >
          Not now
        </button>
        <button txButton (click)="toast.success('Upgraded to Team')">Upgrade</button>
      </div>
    </tx-card>
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CardFooterExample {
  readonly toast = inject(TxToastService);
}
