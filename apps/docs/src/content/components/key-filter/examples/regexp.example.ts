import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra/ui/input';
import { TxKeyFilter } from '@tectra/ui/key-filter';

@Component({
  selector: 'key-filter-regexp-example',
  imports: [TxInput, TxKeyFilter],
  template: `<input
    txInput
    [txKeyFilter]="vowels"
    placeholder="Vowels only"
    aria-label="Vowels"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KeyFilterRegexpExample {
  readonly vowels = /[aeiou]/i;
}
