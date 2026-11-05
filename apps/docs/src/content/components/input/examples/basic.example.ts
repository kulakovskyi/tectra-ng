import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxFluid } from '@tectra/core/fluid';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'input-basic-example',
  imports: [TxFluid, TxInput, ReactiveFormsModule],
  template: `
    <tx-fluid class="stack">
      <input txInput placeholder="Your name" [formControl]="name" />
      <textarea txInput placeholder="About you"></textarea>
      <span class="hint">Value: {{ name.value || '—' }}</span>
    </tx-fluid>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputBasicExample {
  name = new FormControl('');
}
