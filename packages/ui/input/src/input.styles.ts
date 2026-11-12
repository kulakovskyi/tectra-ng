import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { injectTokens } from '@tectra-ng/core/config';
import { INPUT_THEME } from './input.theme';

@Component({
  selector: 'tx-input-styles',
  template: '',
  styleUrl: './input.styles.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TxInputStyles {
  private readonly inputTheme = injectTokens(INPUT_THEME);
}
