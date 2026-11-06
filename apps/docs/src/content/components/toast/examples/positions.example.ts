import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxToast, TxToastPosition, TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'toast-positions-example',
  imports: [TxToast, TxButton],
  template: `
    <div class="grid">
      @for (position of positions; track position) {
        <button
          txButton
          size="small"
          severity="secondary"
          [outlined]="true"
          (click)="show(position)"
        >
          {{ position }}
        </button>
        <tx-toast [position]="position" [key]="position" />
      }
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(3, max-content);
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToastPositionsExample {
  private toast = inject(TxToastService);
  readonly positions: TxToastPosition[] = [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ];

  show(position: TxToastPosition): void {
    this.toast.info(`Shown at ${position}`, { key: position });
  }
}
