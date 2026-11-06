import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxSplitButton } from '@tectra-ng/ui/split-button';

@Component({
  selector: 'split-button-sizes-example',
  imports: [TxSplitButton],
  template: `
    <div class="row">
      <tx-split-button label="Small" size="small" [model]="items" />
      <tx-split-button label="Medium" [model]="items" />
      <tx-split-button label="Large" size="large" [model]="items" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SplitButtonSizesExample {
  readonly items: TxMenuItem[] = [{ label: 'Option one' }, { label: 'Option two' }];
}
