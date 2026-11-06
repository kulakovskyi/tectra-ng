import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxFluid } from '@tectra-ng/core/fluid';
import { TxInput } from '@tectra-ng/ui/input';
import { TxKeyFilter } from '@tectra-ng/ui/key-filter';

@Component({
  selector: 'key-filter-validate-only-example',
  imports: [TxFluid, TxInput, TxKeyFilter, ReactiveFormsModule],
  template: `
    <tx-fluid class="stack">
      <input
        txInput
        [txKeyFilter]="'alphanum'"
        [validateOnly]="true"
        [formControl]="code"
        placeholder="Type a space or a dash"
        aria-label="Code"
      />
      <span class="hint">Errors: {{ code.errors ? 'keyFilter' : 'none' }}</span>
    </tx-fluid>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KeyFilterValidateOnlyExample {
  readonly code = new FormControl('abc');
}
