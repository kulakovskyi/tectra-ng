import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TxColorPicker, TxHsb, TxRgb } from '@tectra/ui/color-picker';

@Component({
  selector: 'color-picker-formats-example',
  imports: [TxColorPicker, FormsModule, JsonPipe],
  template: `
    <div class="stack">
      <tx-color-picker [(ngModel)]="rgb" [format]="'rgb'" [ariaLabel]="'RGB colour'" />
      <span class="hint">{{ rgb | json }}</span>
      <tx-color-picker [(ngModel)]="hsb" [format]="'hsb'" [ariaLabel]="'HSB colour'" />
      <span class="hint">{{ hsb | json }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColorPickerFormatsExample {
  rgb: TxRgb = { r: 236, g: 72, b: 153 };
  hsb: TxHsb = { h: 200, s: 80, b: 90 };
}
