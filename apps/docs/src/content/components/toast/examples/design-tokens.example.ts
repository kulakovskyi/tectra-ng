import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxToast, TxToastService } from '@tectra/ui/toast';

@Component({
  selector: 'toast-design-tokens-example',
  imports: [TxToast, TxButton],
  template: `
    <button txButton severity="secondary" [outlined]="true" (click)="show()">
      Show a compact toast
    </button>
    <tx-toast
      key="compact"
      position="top-center"
      [dt]="{
        root: { width: '320px' },
        item: { paddingY: '4px', paddingEnd: '12px', fontSize: '12.25px' },
        icon: { size: '24px', fontSize: '11px' },
        text: { paddingY: '2px', lineHeight: '18px' },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToastDesignTokensExample {
  private toast = inject(TxToastService);

  show(): void {
    this.toast.success('Link copied', { key: 'compact', life: 2500, closable: false });
  }
}
