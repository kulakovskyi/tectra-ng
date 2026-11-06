import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxProgressSpinner } from '@tectra-ng/ui/progress-spinner';

@Component({
  selector: 'progress-spinner-stroke-example',
  imports: [TxProgressSpinner],
  template: `
    <div class="row">
      <tx-progress-spinner size="large" [strokeWidth]="2" ariaLabel="Thin" />
      <tx-progress-spinner size="large" [strokeWidth]="7" ariaLabel="Thick" />
      <tx-progress-spinner
        size="large"
        fill="var(--tx-highlight-background)"
        animationDuration="2s"
        ariaLabel="Slow, filled"
      />
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
export default class ProgressSpinnerStrokeExample {}
