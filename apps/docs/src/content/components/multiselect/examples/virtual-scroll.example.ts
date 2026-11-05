import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMultiselect } from '@tectra/ui/multiselect';

@Component({
  selector: 'multiselect-virtual-scroll-example',
  imports: [TxMultiselect],
  template: `<tx-multiselect
    [options]="hosts"
    [virtualScroll]="true"
    [filter]="true"
    [placeholder]="'Hosts'"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MultiselectVirtualScrollExample {
  readonly hosts = Array.from(
    { length: 5000 },
    (_, index) => `host-${String(index + 1).padStart(4, '0')}.example.com`,
  );
}
