import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxColorPicker } from '@tectra-ng/ui/color-picker';

@Component({
  selector: 'color-picker-basic-example',
  imports: [TxColorPicker, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-color-picker [formControl]="color" [ariaLabel]="'Brand colour'" />
      <span class="hint">Value: {{ color.value ?? '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColorPickerBasicExample {
  readonly color = new FormControl<string | null>('#2563eb');
}
