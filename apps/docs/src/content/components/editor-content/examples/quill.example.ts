import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxEditorContent } from '@tectra-ng/editor/content';

@Component({
  selector: 'editor-content-quill-example',
  imports: [TxEditorContent],
  template: `<tx-editor-content [html]="html" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorContentQuillExample {
  readonly html =
    '<h3 class="ql-align-center">Summary</h3><ol><li data-list="ordered">Collect feedback</li><li data-list="bullet" class="ql-indent-1">from support</li><li data-list="ordered">Plan the fixes</li></ol><p class="ql-indent-1"><span style="color: rgb(220, 38, 38);">Due on Monday</span></p>';
}
