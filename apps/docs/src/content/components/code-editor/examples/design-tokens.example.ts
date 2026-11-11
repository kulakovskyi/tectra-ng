import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCodeEditor, TxCodeEditorTokens } from '@tectra-ng/code-editor';
import { TectraDeepPartial } from '@tectra-ng/themes';

@Component({
  selector: 'code-editor-design-tokens-example',
  imports: [TxCodeEditor],
  template: `
    <tx-code-editor
      language="typescript"
      [value]="code"
      [dt]="tokens"
      height="180px"
      ariaLabel="Helper"
    />
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CodeEditorDesignTokensExample {
  readonly tokens: TectraDeepPartial<TxCodeEditorTokens> = {
    root: {
      borderRadius: '14px',
      fontSize: '13px',
      lineHeight: '20px',
      background: 'var(--tx-surface-ground)',
    },
    gutter: {
      background: 'var(--tx-surface-ground)',
      minDigits: '3ch',
      paddingStart: '12px',
      gap: '16px',
    },
    syntax: {
      keyword: 'light-dark(var(--tx-purple-700), var(--tx-purple-300))',
      string: 'light-dark(var(--tx-green-700), var(--tx-green-300))',
      type: 'light-dark(var(--tx-orange-700), var(--tx-orange-300))',
    },
  };
  readonly code = `export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}`;
}
