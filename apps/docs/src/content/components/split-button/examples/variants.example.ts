import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMenuItem } from '@tectra/ui/menu';
import { TxSplitButton } from '@tectra/ui/split-button';

@Component({
  selector: 'split-button-variants-example',
  imports: [TxSplitButton],
  template: `
    <div class="row">
      <tx-split-button label="Outlined" [outlined]="true" [model]="items" />
      <tx-split-button label="Text" [text]="true" [model]="items" />
      <tx-split-button label="Raised" [raised]="true" [model]="items" />
      <tx-split-button label="Rounded" [rounded]="true" [model]="items" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SplitButtonVariantsExample {
  readonly items: TxMenuItem[] = [{ label: 'Option one' }, { label: 'Option two' }];
}
