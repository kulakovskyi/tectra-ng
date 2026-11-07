import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxEditorContent } from '@tectra-ng/editor/content';

@Component({
  selector: 'editor-content-basic-example',
  imports: [TxEditorContent],
  template: `<tx-editor-content [html]="html" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorContentBasicExample {
  readonly html = [
    '<h2>Onboarding</h2>',
    '<p>Welcome to the team! Read the <a href="https://example.com" target="_blank">handbook</a> and set up your tools.</p>',
    '<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><div><p>Get a laptop</p></div></li>',
    '<li data-type="taskItem" data-checked="false"><div><p>Meet your mentor</p></div></li></ul>',
    '<blockquote><p>Ask questions early — everyone was new once.</p></blockquote>',
    '<pre><code>npm install\nnpm start</code></pre>',
    '<p>Mark <span style="background-color: rgba(234, 179, 8, 0.28)">important</span> words and <code>inline code</code>.</p>',
  ].join('');
}
