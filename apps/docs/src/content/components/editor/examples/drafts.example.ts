import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { TxEditor } from '@tectra-ng/editor';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'editor-drafts-example',
  imports: [TxEditor, TxButton],
  template: `
    <tx-editor
      toolbar="minimal"
      draftKey="docs-editor-draft"
      placeholder="Start a reply, reload the page — it is still here"
      minHeight="120px"
      [(html)]="html"
      (draftRestored)="restored.set(true)"
    />
    <div class="actions">
      <button txButton size="small" icon="send" [disabled]="!html()" (click)="send()">Send</button>
      @if (restored()) {
        <span class="note">Draft restored</span>
      }
    </div>
  `,
  styles: `
    .actions {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorDraftsExample {
  private readonly editor = viewChild.required(TxEditor);
  readonly html = signal('');
  readonly restored = signal(false);

  send(): void {
    this.editor().clearDraft();
    this.html.set('');
    this.restored.set(false);
  }
}
