import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxEditor, TxEditorAiAction, TxEditorAiRequest } from '@tectra-ng/editor';

@Component({
  selector: 'editor-ai-actions-example',
  imports: [TxEditor],
  template: `
    <tx-editor
      toolbar="minimal"
      [aiActions]="actions"
      (aiAction)="run($event)"
      html="<p>Select this sentence about the new dashboard and pick an AI action from the menu above it.</p>"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorAiActionsExample {
  readonly actions: TxEditorAiAction[] = [
    { id: 'improve', label: 'Improve writing' },
    { id: 'shorter', label: 'Make shorter', icon: 'minus' },
    { id: 'upper', label: 'Shout it', icon: 'megaphone' },
  ];

  run(request: TxEditorAiRequest): void {
    const answer =
      request.action.id === 'shorter'
        ? request.text.split(' ').slice(0, 6).join(' ') + '…'
        : request.action.id === 'upper'
          ? request.text.toUpperCase()
          : `The new dashboard puts every key number on one screen — ${request.text.toLowerCase()}`;
    void request.replace(this.stream(answer));
  }

  private async *stream(text: string): AsyncIterable<string> {
    for (const word of text.split(/(?<= )/)) {
      await new Promise((resolve) => setTimeout(resolve, 60));
      yield word;
    }
  }
}
