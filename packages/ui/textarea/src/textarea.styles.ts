import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { injectTokens } from '@tectra-ng/core/config';
import { TEXTAREA_THEME } from './textarea.theme';

@Component({
  selector: 'tx-textarea-styles',
  template: '',
  styleUrl: './textarea.styles.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TxTextareaStyles {
  private readonly textareaTheme = injectTokens(TEXTAREA_THEME);
}
