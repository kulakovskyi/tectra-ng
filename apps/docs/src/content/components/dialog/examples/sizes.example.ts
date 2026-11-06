import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import {
  TxDialogClose,
  TxDialogContent,
  TxDialogFooter,
  TxDialogHeader,
  TxDialogService,
  TxDialogSize,
  injectDialogData,
} from '@tectra-ng/ui/dialog';

@Component({
  selector: 'dialog-size-preview',
  imports: [TxDialogHeader, TxDialogContent, TxDialogFooter, TxDialogClose, TxButton],
  template: `
    <tx-dialog-header [title]="'Size: ' + size" />
    <tx-dialog-content>
      Sizes come from the dialog tokens; on narrow screens every dialog fits the viewport.
    </tx-dialog-content>
    <tx-dialog-footer>
      <button txButton txDialogClose>Close</button>
    </tx-dialog-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogSizePreview {
  readonly size = injectDialogData<TxDialogSize>();
}

@Component({
  selector: 'dialog-sizes-example',
  imports: [TxButton],
  template: `
    <div class="row">
      @for (size of sizes; track size) {
        <button txButton severity="secondary" [outlined]="true" (click)="open(size)">
          {{ size }}
        </button>
      }
      <button txButton severity="secondary" [outlined]="true" (click)="openResponsive()">
        responsive
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
export default class DialogSizesExample {
  private dialogs = inject(TxDialogService);
  readonly sizes: TxDialogSize[] = ['small', 'medium', 'large', 'xlarge', 'fullscreen'];

  open(size: TxDialogSize): void {
    this.dialogs.open(DialogSizePreview, { data: size, size });
  }

  openResponsive(): void {
    this.dialogs.open(DialogSizePreview, {
      data: 'medium',
      width: '700px',
      breakpoints: { '960px': '500px', '640px': '92vw' },
    });
  }
}
