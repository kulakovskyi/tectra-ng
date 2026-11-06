import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxProgressBar } from '@tectra-ng/ui/progress-bar';

@Component({
  selector: 'progress-bar-sizes-example',
  imports: [TxProgressBar],
  template: `
    <div class="list">
      <tx-progress-bar size="small" [value]="30" ariaLabel="Small" />
      <tx-progress-bar [value]="50" ariaLabel="Medium" />
      <tx-progress-bar size="large" [value]="70" ariaLabel="Large" />
    </div>
  `,
  styles: `
    .list {
      display: grid;
      gap: 14px;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgressBarSizesExample {}
