import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'toast-loading-example',
  imports: [TxButton],
  template: `
    <div class="row">
      <button txButton icon="file-export" (click)="exportRows(true)">Export rows</button>
      <button txButton severity="secondary" [outlined]="true" (click)="exportRows(false)">
        Export that fails
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
export default class ToastLoadingExample {
  private toast = inject(TxToastService);

  exportRows(succeeds: boolean): void {
    const progress = this.toast.loading('Exporting 1 240 rows…', {
      actions: [{ label: 'Cancel', run: () => clearTimeout(timer) }],
    });
    const timer = setTimeout(() => {
      if (succeeds) {
        progress.update({
          severity: 'success',
          text: 'Export is ready',
          actions: [{ label: 'Download' }],
        });
      } else {
        progress.update({
          severity: 'danger',
          text: 'Export failed: the server timed out',
          actions: [],
        });
      }
    }, 2000);
  }
}
