import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxIconField, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxAutoFocus } from '@tectra-ng/utils/auto-focus';

@Component({
  selector: 'auto-focus-toggle-example',
  imports: [TxButton, TxIconField, TxInputIcon, TxInput, TxAutoFocus],
  template: `
    <div class="flex">
      <button
        txButton
        icon="search"
        severity="secondary"
        [attr.aria-expanded]="open()"
        aria-label="Search"
        (click)="open.set(!open())"
      ></button>
      @if (open()) {
        <tx-icon-field txAutoFocus>
          <tx-input-icon icon="search" />
          <input txInput placeholder="Search docs" aria-label="Search docs" />
        </tx-icon-field>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AutoFocusToggleExample {
  readonly open = signal(false);
}
