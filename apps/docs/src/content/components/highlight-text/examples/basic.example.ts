import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxHighlightText } from '@tectra/ui/highlight-text';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'highlight-text-basic-example',
  imports: [TxHighlightText, TxInput],
  template: `
    <input
      txInput
      aria-label="Search"
      placeholder="Search"
      [value]="search()"
      (input)="search.set($any($event.target).value)"
    />
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
