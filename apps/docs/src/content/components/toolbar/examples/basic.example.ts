import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxToolbar, TxToolbarEnd, TxToolbarStart } from '@tectra-ng/ui/toolbar';

@Component({
  selector: 'toolbar-basic-example',
  imports: [TxToolbar, TxToolbarStart, TxToolbarEnd, TxButton],
  template: `
    <tx-toolbar ariaLabel="Document">
      <button txButton txToolbarStart icon="plus" (click)="last.set('New')">New</button>
      <button
        txButton
        txToolbarStart
        severity="secondary"
        icon="upload"
        (click)="last.set('Upload')"
      >
        Upload
      </button>
      <button
        txButton
        txToolbarStart
        text
        icon="print"
        aria-label="Print"
        (click)="last.set('Print')"
      ></button>
      <button
        txButton
        txToolbarEnd
        severity="secondary"
        outlined
        icon="download"
        (click)="last.set('Export')"
      >
        Export
      </button>
    </tx-toolbar>
    <p class="note">Last action: {{ last() }}</p>
  `,
  styles: `
    .note {
      margin: 12px 0 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToolbarBasicExample {
  readonly last = signal('none');
}
