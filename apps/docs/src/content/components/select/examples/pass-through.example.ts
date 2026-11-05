import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPassThroughContext } from '@tectra/core/config';
import { TxSelect } from '@tectra/ui/select';

@Component({
  selector: 'select-pass-through-example',
  imports: [TxSelect],
  template: `<tx-select
    [options]="sorts"
    [pt]="pt"
    [ariaLabel]="'Sort by'"
    [placeholder]="'Sort by'"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectPassThroughExample {
  readonly sorts = ['Newest', 'Oldest', 'Most viewed'];
  readonly pt = {
    value: { style: { fontWeight: '600' } },
    dropdown: ({ instance }: TxPassThroughContext<TxSelect>) => ({
      style: { color: instance.isOpen() ? 'var(--tx-primary-base)' : '' },
    }),
    option: { style: { letterSpacing: '0.02em' } },
  };
}
