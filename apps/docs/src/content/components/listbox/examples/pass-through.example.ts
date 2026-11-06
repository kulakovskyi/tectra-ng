import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxListbox } from '@tectra-ng/ui/listbox';

@Component({
  selector: 'listbox-pass-through-example',
  imports: [TxListbox],
  template: `<tx-listbox [options]="sizes" [pt]="pt" [ariaLabel]="'Size'" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListboxPassThroughExample {
  readonly sizes = ['Small', 'Medium', 'Large'];
  readonly pt = {
    option: { style: { justifyContent: 'center', letterSpacing: '0.04em' } },
    list: { style: { gap: '6px' } },
  };
}
