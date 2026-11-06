import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'select-sizes-example',
  imports: [TxSelect],
  template: `
    <div class="stack">
      <tx-select [options]="sizes" [size]="'small'" [placeholder]="'Small'" />
      <tx-select [options]="sizes" [placeholder]="'Medium'" />
      <tx-select [options]="sizes" [size]="'large'" [placeholder]="'Large'" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectSizesExample {
  readonly sizes = ['XS', 'S', 'M', 'L', 'XL'];
}
