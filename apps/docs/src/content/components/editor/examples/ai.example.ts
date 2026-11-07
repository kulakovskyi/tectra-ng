import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxEditor } from '@tectra-ng/editor';

@Component({
  selector: 'editor-ai-example',
  imports: [TxEditor],
  template: `<tx-editor ai [(html)]="html" (aiRequested)="improve($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorAiExample {
  readonly html = signal('<p>we fixed login bug and also the export was slow, now its faster</p>');

  improve(html: string): void {
    const text = html.replace(/<[^>]+>/g, '');
    this.html.set(
      `<p>${text.charAt(0).toUpperCase()}${text.slice(1)}.</p><p><em>Polished by the assistant.</em></p>`,
    );
  }
}
