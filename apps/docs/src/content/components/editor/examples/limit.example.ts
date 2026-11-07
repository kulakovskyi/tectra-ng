import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxEditor } from '@tectra-ng/editor';

@Component({
  selector: 'editor-limit-example',
  imports: [TxEditor],
  template: `
    <tx-editor
      toolbar="minimal"
      [maxLength]="140"
      placeholder="A short status update"
      html="<p>Deploy finished.</p>"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorLimitExample {}
