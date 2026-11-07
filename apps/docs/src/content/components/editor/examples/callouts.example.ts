import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxEditor } from '@tectra-ng/editor';

@Component({
  selector: 'editor-callouts-example',
  imports: [TxEditor],
  template: `<tx-editor [toolbar]="[['bold', 'italic', 'link'], ['callout']]" [html]="html" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorCalloutsExample {
  readonly html =
    '<div data-type="callout" data-tone="info"><p>The release goes out on Thursday.</p></div>' +
    '<div data-type="callout" data-tone="success"><p>All checks passed.</p></div>' +
    '<div data-type="callout" data-tone="warn"><p>Two translations are still missing.</p></div>' +
    '<div data-type="callout" data-tone="danger"><p>The old API stops working next month.</p></div>';
}
