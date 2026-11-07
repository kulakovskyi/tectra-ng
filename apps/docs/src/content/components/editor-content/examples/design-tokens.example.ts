import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxEditorContent } from '@tectra-ng/editor/content';

@Component({
  selector: 'editor-content-design-tokens-example',
  imports: [TxEditorContent],
  template: `
    <tx-editor-content
      html="<h3>Release 4.2</h3><p>Faster search and <code>exportAll()</code> in the API.</p>"
      [dt]="{
        root: { fontSize: '16px', lineHeight: '1.75' },
        code: { borderRadius: '999px', padding: '0.15em 0.6em' },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorContentDesignTokensExample {}
