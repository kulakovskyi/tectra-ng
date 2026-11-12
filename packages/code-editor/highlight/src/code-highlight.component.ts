import { ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input, numberAttribute } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { TxStyleLoader } from '@tectra-ng/core/styles';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraCodeHighlightTokens, TectraCodeSyntaxTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxCodeHighlightPart, TxCodeLanguage } from './code-highlight.types';
import { codeLines } from './code-lines';
import { TxCodeSyntaxStyles } from './code-syntax-styles.component';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { HIGHLIGHT_ICON_DEFAULTS } from './highlight.icons';
import { HIGHLIGHT_THEME } from './highlight.theme';

export type TxCodeHighlightTokens = TectraCodeHighlightTokens & { syntax: TectraCodeSyntaxTokens };

@Component({
  selector: 'tx-code-highlight',
  templateUrl: './code-highlight.component.html',
  styleUrl: './code-highlight.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-code-highlight',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-language]': 'language()',
    '[class.tx-code-highlight--wrap]': 'wordWrap()',
    '[class.tx-code-highlight--numbers]': 'lineNumbers()',
  },
  viewProviders: [provideTxIconDefaults(HIGHLIGHT_ICON_DEFAULTS)],
})
export class TxCodeHighlight {
  private readonly highlightTheme = injectTokens(HIGHLIGHT_THEME);

  readonly code = input<string | null | undefined>('');
  readonly language = input<TxCodeLanguage | string>('html');
  readonly lineNumbers = input(true, { transform: booleanAttribute });
  readonly wordWrap = input(false, { transform: booleanAttribute });
  readonly indentGuides = input(true, { transform: booleanAttribute });
  readonly tabSize = input(4, { transform: numberAttribute });
  readonly firstLine = input(1, { transform: numberAttribute });
  readonly height = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TxCodeHighlightTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxCodeHighlightPart, TxCodeHighlight> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('codeHighlight', this, this.pt, this.ptOptions);
  protected readonly t = injectTranslations();

  protected readonly lines = computed(() => codeLines(this.code() ?? '', this.language(), this.firstLine(), this.tabSize()));
  protected readonly label = computed(() => this.ariaLabel() ?? this.t().codeHighlightLabel);

  readonly hostStyle = computed(() => {
    const { syntax, ...own } = this.dt() ?? {};
    return {
      ...toStyleObject(own, '--tx-code-highlight'),
      ...toStyleObject(syntax, '--tx-code-syntax'),
      ...(this.height() ? { height: this.height() } : {}),
      ...this.passThrough().root?.style,
    };
  });

  constructor() {
    inject(TxStyleLoader).load(TxCodeSyntaxStyles);
  }
}
