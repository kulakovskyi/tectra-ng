import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxEditor } from '@tectra-ng/editor';

@Component({
  selector: 'editor-readonly-example',
  imports: [TxEditor],
  template: `
    <div class="stack">
      <tx-editor
        toolbar="minimal"
        readonly
        html="<p>This note is <strong>read only</strong>.</p>"
      />
      <tx-editor toolbar="minimal" disabled html="<p>This editor is turned off.</p>" />
    </div>
  `,
  styles: `
    .stack {
      display: grid;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorReadonlyExample {}
