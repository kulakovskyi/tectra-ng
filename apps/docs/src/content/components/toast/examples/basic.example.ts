import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxToastService } from '@tectra/ui/toast';

@Component({
  selector: 'toast-basic-example',
  imports: [TxButton],
  template: `
    <div class="row">
      <button
        txButton
        severity="success"
        [outlined]="true"
        (click)="toast.success('Changes saved')"
      >
        Success
      </button>
      <button
        txButton
        severity="info"
        [outlined]="true"
        (click)="toast.info('A new version is available')"
      >
        Info
      </button>
      <button
        txButton
        severity="warn"
        [outlined]="true"
        (click)="toast.warn('Your trial ends in 3 days')"
      >
        Warn
      </button>
      <button
        txButton
        severity="danger"
        [outlined]="true"
        (click)="toast.error('The file is too large')"
      >
        Error
      </button>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToastBasicExample {
  readonly toast = inject(TxToastService);
}
