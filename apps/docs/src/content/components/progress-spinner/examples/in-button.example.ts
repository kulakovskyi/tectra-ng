import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxProgressSpinner } from '@tectra/ui/progress-spinner';

@Component({
  selector: 'progress-spinner-in-button-example',
  imports: [TxProgressSpinner],
  template: `
    <p class="status">
      <tx-progress-spinner [size]="16" [strokeWidth]="6" ariaLabel="Syncing" />
      Syncing 14 files…
    </p>
  `,
  styles: `
    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgressSpinnerInButtonExample {}
