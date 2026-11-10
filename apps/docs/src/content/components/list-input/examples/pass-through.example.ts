import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxListInput } from '@tectra-ng/ui/list-input';

@Component({
  selector: 'list-input-pass-through-example',
  imports: [TxListInput],
  template: `<tx-list-input
    type="domain"
    ariaLabel="Domains"
    text="example.com"
    [rows]="3"
    [pt]="pt"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListInputPassThroughExample {
  readonly pt = {
    field: { style: { letterSpacing: '0.02em' } },
    footer: { style: { justifyContent: 'flex-start' } },
  };
}
