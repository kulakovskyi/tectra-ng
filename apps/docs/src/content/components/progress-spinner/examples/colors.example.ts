import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxProgressSpinner } from '@tectra/ui/progress-spinner';

@Component({
  selector: 'progress-spinner-colors-example',
  imports: [TxProgressSpinner],
  template: `
    <div class="row">
      <tx-progress-spinner color="var(--tx-success-base)" ariaLabel="Saving" />
      <tx-progress-spinner color="var(--tx-warn-base)" ariaLabel="Retrying" />
      <tx-progress-spinner color="var(--tx-danger-base)" ariaLabel="Rolling back" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      gap: 28px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgressSpinnerColorsExample {}
