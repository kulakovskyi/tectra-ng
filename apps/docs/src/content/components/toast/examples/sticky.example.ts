import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxToastService } from '@tectra/ui/toast';

@Component({
  selector: 'toast-sticky-example',
  imports: [TxButton],
  template: `
    <div class="row">
      <button txButton severity="secondary" [outlined]="true" (click)="sticky()">Sticky</button>
      <button txButton severity="secondary" [outlined]="true" (click)="notClosable()">
        Without a close button
      </button>
      <button txButton severity="secondary" [text]="true" (click)="toast.clear()">Clear all</button>
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
export default class ToastStickyExample {
  readonly toast = inject(TxToastService);

  sticky(): void {
    this.toast.warn('You are offline. Changes will sync when you reconnect.', { sticky: true });
  }

  notClosable(): void {
    this.toast.info('Saving draft…', { closable: false, life: 3000 });
  }
}
