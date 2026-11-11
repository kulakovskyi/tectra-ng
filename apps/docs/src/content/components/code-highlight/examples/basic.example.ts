import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCodeHighlight } from '@tectra-ng/code-editor/highlight';

@Component({
  selector: 'code-highlight-basic-example',
  imports: [TxCodeHighlight],
  template: ` <tx-code-highlight language="typescript" [code]="code" ariaLabel="Retry helper" /> `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CodeHighlightBasicExample {
  readonly code = `export async function retry<T>(task: () => Promise<T>, attempts = 3): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await task();
    } catch (error) {
      if (attempt >= attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 100));
    }
  }
}`;
}
