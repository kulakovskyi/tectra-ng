import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'input-basic-example',
  imports: [TxInput, ReactiveFormsModule],
  template: `
    <div class="stack">
      <input txInput placeholder="Your name" [formControl]="name" />
      <textarea txInput placeholder="About you"></textarea>
      <span class="hint">Value: {{ name.value || '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputBasicExample {
  name = new FormControl('');
}
