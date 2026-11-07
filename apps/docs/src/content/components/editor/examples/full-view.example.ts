import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxEditor } from '@tectra-ng/editor';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'editor-full-view-example',
  imports: [TxEditor, TxButton],
  template: `
    <button txButton severity="secondary" icon="window-maximize" (click)="full.set(true)">
      Open in full view
    </button>
    <tx-editor
      class="editor"
      height="140px"
      [(fullView)]="full"
      html="<p>Long reports are easier to write in the full view.</p>"
    />
  `,
  styles: `
    .editor {
      margin-top: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorFullViewExample {
  readonly full = signal(false);
}
