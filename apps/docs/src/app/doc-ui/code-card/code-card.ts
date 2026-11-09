import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { CodeBlock } from '../code-block/code-block';
import { CodeLanguage } from '../code-block/code-block.types';
import { DocsCopyButton } from '../copy/copy-button';

@Component({
  selector: 'docs-code-card',
  imports: [TxIcon, CodeBlock, DocsCopyButton],
  template: `
    <div class="code-card__head">
      <span class="code-card__file"><tx-icon name="file" />{{ file() }}</span>
      <docs-copy-button [label]="'Copy ' + file()" [text]="code()" />
    </div>
    <docs-code-block [code]="code()" [language]="language()" [label]="file()" />
  `,
  styleUrl: './code-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsCodeCard {
  readonly code = input.required<string>();
  readonly file = input.required<string>();
  readonly language = input<CodeLanguage>('typescript');
}
