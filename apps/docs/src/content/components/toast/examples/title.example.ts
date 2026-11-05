import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxToastService } from '@tectra/ui/toast';

@Component({
  selector: 'toast-title-example',
  imports: [TxButton],
  template: `
    <button txButton severity="secondary" [outlined]="true" (click)="invite()">
      Invite a teammate
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToastTitleExample {
  private toast = inject(TxToastService);

  invite(): void {
    this.toast.success('We sent an invitation to marek@example.com. It is valid for 7 days.', {
      title: 'Invitation sent',
    });
  }
}
