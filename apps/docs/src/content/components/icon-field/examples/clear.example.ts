import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxIconField, TxInputClear, TxInputIcon } from '@tectra/ui/icon-field';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'icon-field-clear-example',
  imports: [TxIconField, TxInputIcon, TxInputClear, TxInput, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-icon-field>
        <tx-input-icon [icon]="'search'" />
        <input txInput placeholder="Type to see the clear button" aria-label="Search" [formControl]="query" />
        <tx-input-clear />
      </tx-icon-field>
      <span class="hint">Value: {{ query.value || '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IconFieldClearExample {
  readonly query = new FormControl('tectra');
}
