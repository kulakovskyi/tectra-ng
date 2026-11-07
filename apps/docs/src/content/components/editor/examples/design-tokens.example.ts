import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxEditor } from '@tectra-ng/editor';

@Component({
  selector: 'editor-design-tokens-example',
  imports: [TxEditor],
  template: `
    <tx-editor
      toolbar="compact"
      html="<h3>Meeting notes</h3><p>Agenda, decisions and next steps.</p>"
      [dt]="{
        root: { borderRadius: '14px' },
        toolbar: { background: 'var(--tx-surface-ground)', borderColor: 'transparent' },
        tool: { borderRadius: '999px' },
        content: { padding: '18px 22px' },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorDesignTokensExample {}
