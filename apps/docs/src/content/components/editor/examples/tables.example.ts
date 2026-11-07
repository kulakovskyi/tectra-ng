import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxEditor } from '@tectra-ng/editor';

@Component({
  selector: 'editor-tables-example',
  imports: [TxEditor],
  template: `<tx-editor
    [toolbar]="[
      ['bold', 'italic'],
      ['table', 'callout'],
    ]"
    [html]="html"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorTablesExample {
  readonly html =
    '<table><tbody><tr><th><p>Channel</p></th><th><p>Visits</p></th><th><p>Change</p></th></tr>' +
    '<tr><td><p>Search</p></td><td><p>12 400</p></td><td><p>+8%</p></td></tr>' +
    '<tr><td><p>Social</p></td><td><p>3 150</p></td><td><p>−2%</p></td></tr></tbody></table>';
}
