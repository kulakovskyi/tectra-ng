import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxColorSwatchOption, TxColorSwatches } from '@tectra-ng/ui/color-swatches';

@Component({
  selector: 'color-swatches-sizes-example',
  imports: [FormsModule, TxColorSwatches],
  template: `
    <div class="list">
      <tx-color-swatches size="small" ariaLabel="Small" [options]="colors" [(ngModel)]="small" />
      <tx-color-swatches ariaLabel="Medium" [options]="colors" [(ngModel)]="medium" />
      <tx-color-swatches size="large" ariaLabel="Large" [options]="colors" [(ngModel)]="large" />
    </div>
  `,
  styles: `
    .list {
      display: grid;
      justify-items: start;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColorSwatchesSizesExample {
  readonly colors: TxColorSwatchOption[] = [
    { value: 'slate', color: '#64748b', label: 'Slate' },
    { value: 'emerald', color: '#10b981', label: 'Emerald' },
    { value: 'indigo', color: '#6366f1', label: 'Indigo' },
    { value: 'rose', color: '#f43f5e', label: 'Rose' },
  ];
  small = 'emerald';
  medium = 'indigo';
  large = 'rose';
}
