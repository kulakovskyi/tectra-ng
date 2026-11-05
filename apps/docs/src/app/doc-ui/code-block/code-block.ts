import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CodeLanguage } from './code-block.types';
import { CodeHighlighter, escapeCode } from './code-highlighter.service';

@Component({
  selector: 'docs-code-block',
  template: `<pre class="code-block" tabindex="0" [attr.aria-label]="label()"><code class="hljs" [innerHTML]="html()"></code></pre>`,
  styleUrl: './code-block.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeBlock {
  private highlighter = inject(CodeHighlighter);

  readonly code = input.required<string>();
  readonly language = input<CodeLanguage>('typescript');
  readonly label = input<string>('Code');

  readonly html = signal('');

  constructor() {
    effect(() => {
      const code = this.code();
      const language = this.language();
      this.html.set(escapeCode(code));
      this.highlighter.highlight(code, language).then((html) => {
        if (this.code() === code && this.language() === language) {
          this.html.set(html);
        }
      });
    });
  }
}
