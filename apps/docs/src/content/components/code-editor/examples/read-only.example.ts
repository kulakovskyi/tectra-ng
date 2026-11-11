import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCodeEditor } from '@tectra-ng/code-editor';

@Component({
  selector: 'code-editor-read-only-example',
  imports: [TxCodeEditor],
  template: `
    <tx-code-editor language="json" [value]="log" readOnly height="240px" ariaLabel="Request log" />
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CodeEditorReadOnlyExample {
  readonly log = JSON.stringify(
    {
      id: 'req_8f2a',
      method: 'POST',
      path: '/v1/orders',
      status: 201,
      durationMs: 184,
      headers: { 'content-type': 'application/json' },
      body: { items: 3, total: 129.5, coupon: null, gift: false },
    },
    null,
    2,
  );
}
