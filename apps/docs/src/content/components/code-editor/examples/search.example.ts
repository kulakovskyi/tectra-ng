import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCodeEditor } from '@tectra-ng/code-editor';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'code-editor-search-example',
  imports: [TxCodeEditor, TxButton],
  template: `
    <div class="wrap">
      <div class="actions">
        <button
          txButton
          variant="outlined"
          icon="search"
          label="Find"
          (click)="editor.openSearch()"
        ></button>
        <button
          txButton
          variant="outlined"
          label="Replace"
          (click)="editor.openSearch(true)"
        ></button>
      </div>
      <tx-code-editor
        #editor
        language="css"
        [value]="css"
        height="300px"
        ariaLabel="Theme styles"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
      width: 100%;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CodeEditorSearchExample {
  readonly css = `.header {
  color: #1d4ed8;
  border-bottom: 1px solid #1d4ed8;
}

.header a {
  color: #1d4ed8;
}

.footer {
  color: #64748b;
  border-top: 1px solid #e2e8f0;
}

.button-primary {
  background: #1d4ed8;
  color: #ffffff;
}`;
}
