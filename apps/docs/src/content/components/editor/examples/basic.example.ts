import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxEditor } from '@tectra-ng/editor';
import { TxEditorContent } from '@tectra-ng/editor/content';

@Component({
  selector: 'editor-basic-example',
  imports: [TxEditor, TxEditorContent],
  template: `
    <tx-editor [(html)]="html" placeholder="Write something…" minHeight="180px" />
    <p class="caption">Saved</p>
    <tx-editor-content class="saved" [html]="html()" />
  `,
  styles: `
    .caption {
      margin: 16px 0 8px;
      font-weight: 600;
    }

    .saved {
      padding: 12px 16px;
      border: 1px dashed currentColor;
      border-radius: 10px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorBasicExample {
  readonly html = signal(
    '<h2>Release checklist</h2><p>Ship the <strong>new onboarding</strong> by Friday. Select any text to see the formatting menu.</p><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><div><p>Write the release notes</p></div></li><li data-type="taskItem" data-checked="false"><div><p>Record the demo</p></div></li></ul>',
  );
}
