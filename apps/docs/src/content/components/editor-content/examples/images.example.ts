import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxEditorContent } from '@tectra-ng/editor/content';

const IMAGE =
  'data:image/svg+xml;base64,' +
  btoa(
    '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="220"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="#f97316"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect width="480" height="220" fill="url(#g)"/></svg>',
  );

@Component({
  selector: 'editor-content-images-example',
  imports: [TxEditorContent],
  template: `<tx-editor-content [html]="html" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorContentImagesExample {
  readonly html = `<p>Click the picture to open it.</p><img src="${IMAGE}" alt="Sunset gradient">`;
}
