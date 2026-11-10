import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxColorPicker, TxColorValue } from '@tectra-ng/ui/color-picker';
import { TxField } from '@tectra-ng/ui/field';

@Component({
  selector: 'color-picker-field-example',
  imports: [TxColorPicker, TxField, ReactiveFormsModule],
  template: `
    <div class="fields">
      <tx-field label="Accent colour" hint="Buttons and links use this colour">
        <tx-color-picker
          field
          placeholder="#rrggbb"
          showClear
          [formControl]="accent"
          [presets]="presets"
        />
      </tx-field>
      <tx-field label="Badge colour">
        <tx-color-picker field placeholder="#rrggbb" [formControl]="badge" />
      </tx-field>
    </div>
  `,
  styles: `
    .fields {
      display: grid;
      gap: 16px;
      max-width: 320px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColorPickerFieldExample {
  readonly accent = new FormControl<TxColorValue | null>('#3366cc');
  readonly badge = new FormControl<TxColorValue | null>(null);
  readonly presets = [
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
  ];
}
