import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxListbox } from '@tectra/ui/listbox';

@Component({
  selector: 'listbox-design-tokens-example',
  imports: [TxListbox],
  template: `<tx-listbox
    [options]="sizes"
    [ariaLabel]="'Size'"
    [dt]="{ root: { borderRadius: '16px', borderColor: 'var(--tx-primary-base)' } }"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListboxDesignTokensExample {
  readonly sizes = ['Small', 'Medium', 'Large'];
}
