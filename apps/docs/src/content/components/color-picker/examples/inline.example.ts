import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxColorPicker } from '@tectra/ui/color-picker';

@Component({
  selector: 'color-picker-inline-example',
  imports: [TxColorPicker, ReactiveFormsModule],
  template: `<tx-color-picker
    [formControl]="color"
    [inline]="true"
    [ariaLabel]="'Highlight colour'"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColorPickerInlineExample {
  readonly color = new FormControl<string | null>('#16a34a');
}
