import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxHighlightText } from '@tectra-ng/ui/highlight-text';
import { TxIconField, TxInputClear, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';

@Component({
  selector: 'highlight-text-basic-example',
  imports: [TxHighlightText, TxInput, TxIconField, TxInputIcon, TxInputClear],
  template: `
    <tx-icon-field>
      <tx-input-icon icon="search" />
      <input
        txInput
        aria-label="Search"
        placeholder="Search"
        [value]="search()"
        (input)="search.set($any($event.target).value)"
      />
      <tx-input-clear />
    </tx-icon-field>
    <p class="text">
      <tx-highlight-text [text]="text" [highlight]="search()" />
    </p>
  `,
  styles: `
    .text {
      margin: 12px 0 0;
      line-height: 1.6;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HighlightTextBasicExample {
  readonly search = signal('cafe');
  readonly text =
    'Café Lviv opens at eight. Our second cafe is next to the river, and the third café opens in spring.';
}
