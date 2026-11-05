import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxColorPicker } from '@tectra/ui/color-picker';

@Component({
  selector: 'color-picker-states-example',
  imports: [TxColorPicker, ReactiveFormsModule],
  template: `
    <div class="flex">
      <tx-color-picker [size]="'small'" [ariaLabel]="'Small'" />
      <tx-color-picker [size]="'large'" [ariaLabel]="'Large'" />
      <tx-color-picker [invalid]="true" [ariaLabel]="'Invalid'" />
      <tx-color-picker [formControl]="locked" [ariaLabel]="'Disabled'" />
      <tx-color-picker [formControl]="shown" [readonly]="true" [ariaLabel]="'Read only'" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColorPickerStatesExample {
  readonly locked = new FormControl({ value: '#a855f7', disabled: true });
  readonly shown = new FormControl('#0ea5e9');
}
