import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxCodeDiffSummary, TxCodeEditor } from '@tectra-ng/code-editor';

@Component({
  selector: 'code-editor-diff-mode-example',
  imports: [TxCodeEditor],
  template: `
    <tx-code-editor
      diffMode
      [originalValue]="original"
      [(value)]="cleaned"
      height="260px"
      (diffChanged)="summary.set($event)"
    />
    <p class="meta">+{{ summary().added }} −{{ summary().removed }} lines</p>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .meta {
      margin: 8px 0 0;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CodeEditorDiffModeExample {
  readonly summary = signal<TxCodeDiffSummary>({ added: 0, removed: 0, changes: 0 });
  readonly original = `<article>
  <h2>Choosing a laptop</h2>
  <p>Battery life matters more than speed.</p>
  <p>Read our <a href="https://partner.example.com/review">partner review</a> first.</p>
  <p>Weight is the second thing to check.</p>
  <p>Sponsored: <a href="https://ads.example.com">best deals</a></p>
</article>`;
  readonly cleaned = signal(`<article>
  <h2>Choosing a laptop</h2>
  <p>Battery life matters more than raw speed.</p>
  <p>Weight is the second thing to check.</p>
</article>`);
}
