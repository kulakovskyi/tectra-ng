import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxColorPicker } from '@tectra-ng/ui/color-picker';

@Component({
  selector: 'color-picker-labels-example',
  imports: [TxColorPicker, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-color-picker
        ariaLabel="Label colour"
        areaLabel="Label colour shade"
        hueLabel="Label colour hue"
        hexLabel="Label colour code"
        clearText="No colour"
        [inline]="true"
        [showClear]="true"
        [formControl]="color"
      />
      <span class="hint">Value: {{ color.value ?? 'none' }}</span>
    </div>
  `,
  styles: `
    .stack {
      display: grid;
      justify-items: start;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColorPickerLabelsExample {
  readonly color = new FormControl<string | null>('#7c3aed');
}
