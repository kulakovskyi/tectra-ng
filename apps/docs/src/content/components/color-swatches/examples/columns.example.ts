import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { tectraPrimaryChoices } from '@tectra-ng/themes';
import { TxColorSwatches } from '@tectra-ng/ui/color-swatches';

@Component({
  selector: 'color-swatches-columns-example',
  imports: [FormsModule, TxColorSwatches],
  template: `<tx-color-swatches
    ariaLabel="Accent"
    [options]="colors"
    [columns]="9"
    [(ngModel)]="accent"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColorSwatchesColumnsExample {
  readonly colors = tectraPrimaryChoices();
  accent = 'teal';
}
