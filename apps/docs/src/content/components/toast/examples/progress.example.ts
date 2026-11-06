import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'toast-progress-example',
  imports: [TxButton],
  template: `
    <button txButton severity="secondary" [outlined]="true" (click)="show()">
      Show with progress
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToastProgressExample {
  private toast = inject(TxToastService);

  show(): void {
    this.toast.success('Payment received', { life: 6000, showProgress: true });
  }
}
