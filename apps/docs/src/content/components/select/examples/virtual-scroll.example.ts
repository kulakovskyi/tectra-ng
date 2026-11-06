import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'select-virtual-scroll-example',
  imports: [TxSelect],
  template: `<tx-select
    [options]="invoices"
    [virtualScroll]="true"
    [virtualScrollItemSize]="36"
    [filter]="true"
    [placeholder]="'Invoice'"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectVirtualScrollExample {
  readonly invoices = Array.from({ length: 10000 }, (_, index) => ({
    label: `Invoice #${String(index + 1).padStart(5, '0')}`,
    value: index + 1,
  }));
}
