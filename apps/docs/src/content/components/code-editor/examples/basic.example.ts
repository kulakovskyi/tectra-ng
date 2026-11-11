import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxCodeEditor } from '@tectra-ng/code-editor';

@Component({
  selector: 'code-editor-basic-example',
  imports: [TxCodeEditor],
  template: `
    <tx-code-editor [(value)]="html" height="320px" ariaLabel="Page markup" />
    <p class="meta">{{ html().length }} characters</p>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .meta {
      margin: 8px 0 0;
      color: var(--tx-text-muted);
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CodeEditorBasicExample {
  readonly html = signal(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Spring sale</title>
    <style>
      .banner { padding: 24px; color: #1d4ed8; }
    </style>
  </head>
  <body>
    <!-- Main banner -->
    <section class="banner" data-id="42">
      <h1>Spring sale</h1>
      <p>Up to <strong>30%</strong> off until Sunday.</p>
      <a href="/catalog">Open the catalog</a>
    </section>
    <script>
      document.querySelector('.banner').addEventListener('click', () => console.log('open'));
    </script>
  </body>
</html>`);
}
