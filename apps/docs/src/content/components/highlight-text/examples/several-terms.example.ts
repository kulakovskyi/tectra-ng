import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxHighlightText } from '@tectra-ng/ui/highlight-text';

@Component({
  selector: 'highlight-text-several-terms-example',
  imports: [TxHighlightText],
  template: `
    <p class="text">
      <tx-highlight-text [text]="text" [highlight]="['invoice', 'paid', 'due']" />
    </p>
  `,
  styles: `
    .text {
      margin: 0;
      line-height: 1.6;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HighlightTextSeveralTermsExample {
  readonly text = 'Invoice 1042 was paid on Monday; invoice 1043 is due on Friday.';
}
