import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxEditor } from '@tectra-ng/editor';

@Component({
  selector: 'editor-slash-menu-example',
  imports: [TxEditor],
  template: `
    <tx-editor
      toolbar="minimal"
      minHeight="200px"
      html="<p>Type / on a new line, or :fire for an emoji.</p><p></p>"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorSlashMenuExample {}
