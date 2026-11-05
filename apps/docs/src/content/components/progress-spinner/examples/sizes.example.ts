import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxProgressSpinner } from '@tectra/ui/progress-spinner';

@Component({
  selector: 'progress-spinner-sizes-example',
  imports: [TxProgressSpinner],
  template: `
    <div class="row">
      <tx-progress-spinner size="small" />
      <tx-progress-spinner />
      <tx-progress-spinner size="large" />
      <tx-progress-spinner [size]="72" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 28px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgressSpinnerSizesExample {}
