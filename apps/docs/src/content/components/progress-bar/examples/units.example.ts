import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxProgressBar } from '@tectra/ui/progress-bar';

@Component({
  selector: 'progress-bar-units-example',
  imports: [TxProgressBar],
  template: `
    <div class="list">
      <tx-progress-bar
        [value]="320"
        [max]="500"
        unit=" GB"
        [showValue]="true"
        ariaLabel="Disk used"
      />
      <tx-progress-bar
        [value]="7"
        [max]="12"
        unit=" seats"
        [showValue]="true"
        ariaLabel="Seats taken"
      />
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
export default class ProgressBarUnitsExample {}
