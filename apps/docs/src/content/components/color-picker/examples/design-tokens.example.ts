import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxColorPicker } from '@tectra-ng/ui/color-picker';

@Component({
  selector: 'color-picker-design-tokens-example',
  imports: [TxColorPicker],
  template: `<tx-color-picker
    [inline]="true"
    [ariaLabel]="'Colour'"
    [dt]="{
      panel: { width: '200px' },
      area: { height: '120px', borderRadius: '50%' },
      handle: { size: '20px' },
    }"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColorPickerDesignTokensExample {}
