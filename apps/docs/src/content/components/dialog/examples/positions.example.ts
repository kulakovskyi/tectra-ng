import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxDialog, TxDialogPosition } from '@tectra/ui/dialog';

@Component({
  selector: 'dialog-positions-example',
  imports: [TxDialog, TxButton],
  template: `
    <div class="grid">
      @for (place of positions; track place) {
        <button
          txButton
          size="small"
          severity="secondary"
          [outlined]="true"
          (click)="position.set(place); visible.set(true)"
        >
          {{ place }}
        </button>
      }
    </div>
    <tx-dialog
      [header]="'Position: ' + position()"
      size="small"
      [position]="position()"
      [(visible)]="visible"
    >
      Press Escape or click outside to close.
    </tx-dialog>
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
export default class DialogPositionsExample {
  readonly positions: TxDialogPosition[] = [
    'top-left',
    'top',
    'top-right',
    'left',
    'center',
    'right',
    'bottom-left',
    'bottom',
    'bottom-right',
  ];
  readonly position = signal<TxDialogPosition>('center');
  readonly visible = signal(false);
}
