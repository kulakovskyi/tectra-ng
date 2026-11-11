import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxCodeEditor } from '@tectra-ng/code-editor';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'code-editor-options-example',
  imports: [TxCodeEditor, TxToggleSwitch, FormsModule],
  template: `
    <div class="wrap">
      <div class="controls">
        <tx-toggle-switch label="Line numbers" [(ngModel)]="numbers" />
        <tx-toggle-switch label="Word wrap" [(ngModel)]="wrap" />
        <tx-toggle-switch label="Indent guides" [(ngModel)]="guides" />
      </div>
      <tx-code-editor
        language="javascript"
        [(value)]="code"
        [lineNumbers]="numbers()"
        [wordWrap]="wrap()"
        [indentGuides]="guides()"
        [tabSize]="2"
        placeholder="// Write a worker script"
        height="220px"
        ariaLabel="Worker script"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
      width: 100%;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CodeEditorOptionsExample {
  readonly numbers = signal(true);
  readonly wrap = signal(true);
  readonly guides = signal(true);
  readonly code = signal(
    "export default {\n  async fetch(request) {\n    if (request.method !== 'GET') {\n      return new Response('Method not allowed', { status: 405 });\n    }\n\n    return new Response('Hello from the edge. This line is long on purpose so that you can see how word wrap moves the rest of it to the next visual line.');\n  },\n};",
  );
}
