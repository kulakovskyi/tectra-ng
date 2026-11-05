import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxListbox } from '@tectra/ui/listbox';

@Component({
  selector: 'listbox-virtual-scroll-example',
  imports: [TxListbox],
  template: `<tx-listbox
    [options]="ports"
    [virtualScroll]="true"
    [filter]="true"
    [multiple]="true"
    [ariaLabel]="'Ports'"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListboxVirtualScrollExample {
  readonly ports = Array.from({ length: 3000 }, (_, index) => ({
    label: `Port ${8000 + index}`,
    value: 8000 + index,
  }));
}
