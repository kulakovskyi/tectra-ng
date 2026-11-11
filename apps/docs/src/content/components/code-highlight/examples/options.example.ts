import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxCodeHighlight } from '@tectra-ng/code-editor/highlight';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'code-highlight-options-example',
  imports: [TxCodeHighlight, TxToggleSwitch, FormsModule],
  template: `
    <div class="wrap">
      <div class="controls">
        <tx-toggle-switch label="Line numbers" [(ngModel)]="numbers" />
        <tx-toggle-switch label="Word wrap" [(ngModel)]="wrap" />
      </div>
      <tx-code-highlight
        language="html"
        [code]="code"
        [lineNumbers]="numbers()"
        [wordWrap]="wrap()"
        [firstLine]="41"
        ariaLabel="Template excerpt"
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
export default class CodeHighlightOptionsExample {
  readonly numbers = signal(true);
  readonly wrap = signal(false);
  readonly code = `<footer class="site-footer">
  <p>Questions about your order? Write to us any day of the week and we answer within one working day, usually faster.</p>
  <a href="/contacts" class="link">Contacts</a>
</footer>`;
}
