import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIconField, TxInputIcon } from '@tectra/ui/icon-field';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'icon-field-sizes-example',
  imports: [TxIconField, TxInputIcon, TxInput],
  template: `
    <div class="stack">
      @for (size of sizes; track size) {
        <tx-icon-field>
          <tx-input-icon [icon]="'search'" />
          <input txInput [size]="size" [placeholder]="size" [attr.aria-label]="size" />
        </tx-icon-field>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IconFieldSizesExample {
  readonly sizes = ['small', 'medium', 'large'] as const;
}
