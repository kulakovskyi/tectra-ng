import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxHighlightText } from '@tectra/ui/highlight-text';

@Component({
  selector: 'highlight-text-case-sensitive-example',
  imports: [TxHighlightText],
  template: `
    <p class="text">
      <tx-highlight-text
        text="API keys, api docs and the Api status page"
        highlight="API"
        [caseSensitive]="true"
      />
    </p>
  `,
  styles: `
    .text {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HighlightTextCaseSensitiveExample {}
