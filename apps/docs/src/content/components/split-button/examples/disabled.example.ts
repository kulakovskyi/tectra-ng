import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxSplitButton } from '@tectra-ng/ui/split-button';

@Component({
  selector: 'split-button-disabled-example',
  imports: [TxSplitButton],
  template: `
    <div class="row">
      <tx-split-button label="Disabled" [disabled]="true" [model]="items" />
      <tx-split-button label="Menu disabled" [menuDisabled]="true" [model]="items" />
      <tx-split-button label="Publishing" [loading]="true" [model]="items" />
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
export default class SplitButtonDisabledExample {
  readonly items: TxMenuItem[] = [{ label: 'Option one' }, { label: 'Option two' }];
}
