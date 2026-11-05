import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxColorPicker } from '@tectra/ui/color-picker';

@Component({
  selector: 'color-picker-presets-example',
  imports: [TxColorPicker, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-color-picker
        [formControl]="color"
        [presets]="presets"
        [showClear]="true"
        [placeholder]="'No label colour'"
        [ariaLabel]="'Label colour'"
      />
      <span class="hint">Value: {{ color.value ?? 'none' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColorPickerPresetsExample {
  readonly presets = [
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#64748b',
  ];
  readonly color = new FormControl<string | null>(null);
}
