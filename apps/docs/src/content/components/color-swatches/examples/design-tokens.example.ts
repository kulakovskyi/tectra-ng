import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxColorSwatchOption, TxColorSwatches } from '@tectra-ng/ui/color-swatches';

@Component({
  selector: 'color-swatches-design-tokens-example',
  imports: [FormsModule, TxColorSwatches],
  template: `<tx-color-swatches
    ariaLabel="Note color"
    [dt]="tokens"
    [options]="colors"
    [(ngModel)]="note"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColorSwatchesDesignTokensExample {
  readonly tokens = {
    root: { borderRadius: '6px', size: '26px', gap: '10px', selectedRingColor: '#0f766e' },
  };
  readonly colors: TxColorSwatchOption[] = [
    { value: 'sand', color: '#fde68a', label: 'Sand' },
    { value: 'mint', color: '#a7f3d0', label: 'Mint' },
    { value: 'sky', color: '#bae6fd', label: 'Sky' },
    { value: 'lilac', color: '#ddd6fe', label: 'Lilac' },
    { value: 'blush', color: '#fecdd3', label: 'Blush' },
  ];
  note = 'mint';
}
