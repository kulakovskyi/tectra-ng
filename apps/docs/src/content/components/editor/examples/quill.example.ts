import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxEditor } from '@tectra-ng/editor';

@Component({
  selector: 'editor-quill-example',
  imports: [TxEditor],
  template: `
    <tx-editor format="quill" toolbar="compact" [(html)]="html" />
    <pre class="output">{{ html() }}</pre>
  `,
  styles: `
    .output {
      margin: 12px 0 0;
      padding: 12px;
      border-radius: 10px;
      overflow-x: auto;
      font-size: 12px;
      white-space: pre-wrap;
      word-break: break-all;
      background: var(--tx-surface-ground);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorQuillExample {
  readonly html = signal(
    '<h2 class="ql-align-center">Weekly report</h2><ol><li data-list="bullet">Traffic grew</li><li data-list="bullet" class="ql-indent-1">mostly from search</li><li data-list="ordered">Next: new landing page</li></ol>',
  );
}
